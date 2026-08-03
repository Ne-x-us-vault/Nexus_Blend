import { useCallback, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { ActivityEntry, EngineStatus, LauncherConfig, SyncEvent } from "../types";

const DEFAULT_STATUS: EngineStatus = {
  blender: false,
  game: false,
  connected: false,
};

const DEFAULT_SYNC: SyncEvent = { state: "idle" };

const SYNC_SETTLED_DELAY = 1600;
const SYNC_WATCHDOG_MS = 90_000;

/**
 * Subscribes to the launcher's live events and seeds initial state from the
 * Rust backend. This is the single source of truth for the entire UI.
 */
export function useLauncherEvents() {
  const [status, setStatus] = useState<EngineStatus>(DEFAULT_STATUS);
  const [sync, setSync] = useState<SyncEvent>(DEFAULT_SYNC);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [config, setConfig] = useState<LauncherConfig | null>(null);

  const syncRef = useRef<SyncEvent>(DEFAULT_SYNC);
  const settledTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const watchdogTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  syncRef.current = sync;

  const clearTimers = useCallback(() => {
    if (settledTimer.current) {
      clearTimeout(settledTimer.current);
      settledTimer.current = null;
    }
    if (watchdogTimer.current) {
      clearTimeout(watchdogTimer.current);
      watchdogTimer.current = null;
    }
  }, []);

  const returnToIdle = useCallback(() => {
    settledTimer.current = setTimeout(() => {
      setSync({ state: "idle" });
      settledTimer.current = null;
    }, SYNC_SETTLED_DELAY);
  }, []);

  const applySyncEvent = useCallback(
    (payload: SyncEvent) => {
      clearTimers();
      setSync(payload);
      if (payload.state === "syncing") {
        watchdogTimer.current = setTimeout(() => {
          setSync({ state: "idle" });
          watchdogTimer.current = null;
        }, SYNC_WATCHDOG_MS);
      } else if (payload.state === "synced" || payload.state === "error") {
        returnToIdle();
      }
    },
    [clearTimers, returnToIdle],
  );

  useEffect(() => {
    let disposed = false;
    let unlisten: Array<() => void> = [];

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
        await listen<SyncEvent>("sync", (event) => applySyncEvent(event.payload)),
        await listen<ActivityEntry>("activity", (event) => {
          setActivities((prev) => [...prev, event.payload].slice(-200));
          const current = syncRef.current;
          if (current.state === "syncing" && event.payload.kind === "success") {
            if (/model synced/i.test(event.payload.message)) {
              applySyncEvent({ state: "synced", message: "Synced Successfully" });
            }
          }
        }),
      ];
    })();

    return () => {
      disposed = true;
      clearTimers();
      unlisten.forEach((dispose) => dispose());
    };
  }, [applySyncEvent, clearTimers]);

  const startLearning = useCallback(async () => {
    await invoke("start_learning");
  }, []);

  const launchBlender = useCallback(async () => {
    await invoke("launch_blender");
  }, []);

  const launchGame = useCallback(async () => {
    await invoke("launch_game");
  }, []);

  const syncToGame = useCallback(async () => {
    await invoke("sync_model");
  }, []);

  return {
    status,
    sync,
    activities,
    config,
    startLearning,
    launchBlender,
    launchGame,
    syncToGame,
  };
}
