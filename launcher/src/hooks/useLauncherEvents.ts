import { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { ActivityEntry, EngineStatus, LauncherConfig, SyncEvent } from "../types";

const DEFAULT_STATUS: EngineStatus = {
  blender: false,
  game: false,
  connected: false,
};

const DEFAULT_SYNC: SyncEvent = { state: "idle" };

/**
 * Subscribes to the launcher's live events and seeds initial state from the
 * Rust backend. This is the single source of truth for the entire UI.
 */
export function useLauncherEvents() {
  const [status, setStatus] = useState<EngineStatus>(DEFAULT_STATUS);
  const [sync, setSync] = useState<SyncEvent>(DEFAULT_SYNC);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [config, setConfig] = useState<LauncherConfig | null>(null);

  useEffect(() => {
    let disposed = false;
    let unlisten: Array<() => void> = [];
    let resetTimer: ReturnType<typeof setTimeout> | null = null;

    const clearResetTimer = () => {
      if (resetTimer) {
        clearTimeout(resetTimer);
        resetTimer = null;
      }
    };

    (async () => {
      try {
        const [initialStatus, initialActivity, initialConfig] = await Promise.all([
          invoke<EngineStatus>("get_status"),
          invoke<ActivityEntry[]>("get_activity"),
          invoke<LauncherConfig>("get_config"),
        ]);
        if (disposed) return;
        setStatus(initialStatus);
        setActivities(initialActivity);
        setConfig(initialConfig);
      } catch (e) {
        console.error("Failed to seed launcher state:", e);
      }

      unlisten = [
        await listen<EngineStatus>("status", (event) => setStatus(event.payload)),
        await listen<SyncEvent>("sync", (event) => {
          clearResetTimer();
          setSync(event.payload);
          if (event.payload.state === "synced") {
            resetTimer = setTimeout(() => setSync({ state: "idle" }), 1000);
          }
        }),
        await listen<ActivityEntry>("activity", (event) =>
          setActivities((prev) => [...prev, event.payload].slice(-200)),
        ),
      ];
    })();

    return () => {
      disposed = true;
      clearResetTimer();
      unlisten.forEach((dispose) => dispose());
    };
  }, []);

  const startLearning = useCallback(async () => {
    await invoke("start_learning");
  }, []);

  const syncToGame = useCallback(async () => {
    await invoke("sync_model");
  }, []);

  return { status, sync, activities, config, startLearning, syncToGame };
}
