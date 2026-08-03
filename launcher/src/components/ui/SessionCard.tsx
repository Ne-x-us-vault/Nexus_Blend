import { AnimatePresence, motion } from "framer-motion";
import type { ActivityEntry, EngineStatus, LauncherConfig, SyncEvent } from "../../types";
import { formatTime } from "../../lib/format";
import { EASE } from "../../lib/motion";
import { BoxIcon, CheckCircleIcon, CheckIcon, GamepadIcon, RefreshIcon, WifiIcon } from "../icons";

interface SessionCardProps {
  status: EngineStatus;
  sync: SyncEvent;
  config: LauncherConfig | null;
  activities: ActivityEntry[];
  onSync: () => void;
}

function syncProgress(sync: SyncEvent): number {
  if (sync.state === "synced") return 100;
  if (sync.state === "syncing") return sync.phase === "exporting" ? 42 : 78;
  return 0;
}

function syncStatusLabel(sync: SyncEvent): string {
  switch (sync.state) {
    case "syncing":
      return sync.phase === "exporting" ? "Exporting from Blender…" : "Syncing to Game…";
    case "synced":
      return "Synced Successfully";
    case "error":
      return "Sync Failed";
    default:
      return "Ready";
  }
}

function syncButtonLabel(sync: SyncEvent): string {
  switch (sync.state) {
    case "syncing":
      return sync.phase === "exporting" ? "Exporting from Blender…" : "Syncing to Game…";
    case "synced":
      return "Synced — Ready";
    case "error":
      return "Try Again";
    default:
      return "Sync To Game";
  }
}

export default function SessionCard({ status, sync, config, activities, onSync }: SessionCardProps) {
  const busy = sync.state === "syncing";
  const progress = syncProgress(sync);
  const statusClass = busy ? "busy" : sync.state === "synced" ? "ok" : sync.state === "error" ? "error" : "";
  const statusIcon =
    sync.state === "syncing" ? (
      <span className="spinner spinner-tint" />
    ) : sync.state === "synced" ? (
      <CheckCircleIcon width={15} height={15} />
    ) : (
      <RefreshIcon width={15} height={15} />
    );

  const lastSyncEntry = activities
    .filter((entry) => entry.kind === "success" && /model synced/i.test(entry.message))
    .slice(-1)[0];
  const lastSync = lastSyncEntry ? formatTime(lastSyncEntry.ts) : "Never";

  return (
    <div className="session-panel">
      <div className="session-row">
        <span className="session-label">
          <BoxIcon /> Blender
        </span>
        <span className={`session-value ${status.blender ? "ok" : "off"}`}>
          <span className={`dot ${status.blender ? "dot-ok" : "dot-off"}`} />
          {status.blender ? "Running" : "Offline"}
        </span>
      </div>

      <div className="session-row">
        <span className="session-label">
          <GamepadIcon /> Game
        </span>
        <span className={`session-value ${status.game ? "ok" : "off"}`}>
          <span className={`dot ${status.game ? "dot-ok" : "dot-off"}`} />
          {status.game ? "Running" : "Offline"}
        </span>
      </div>

      <div className="session-row">
        <span className="session-label">
          <WifiIcon /> Connection
        </span>
        <span className={`session-value ${status.connected ? "ok" : "off"}`}>
          <span className={`dot ${status.connected ? "dot-ok" : "dot-off"}`} />
          {status.connected ? "Connected" : "Disconnected"}
        </span>
      </div>

      <div className="session-row">
        <span className="session-label">
          <BoxIcon /> Current Model
        </span>
        <span className="session-value mono">{config?.model.name ?? "submission.glb"}</span>
      </div>

      <div className="session-row">
        <span className="session-label">
          <RefreshIcon /> Last Sync
        </span>
        <span className="session-value">{lastSync}</span>
      </div>

      <div className="sync-area">
        <div className="sync-status-line">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={`${sync.state}-${sync.phase ?? ""}`}
              className={`sync-status-label ${statusClass}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: EASE }}
            >
              {statusIcon}
              {syncStatusLabel(sync)}
            </motion.span>
          </AnimatePresence>
          <motion.span
            className="sync-status-pct"
            animate={{ opacity: busy || sync.state === "synced" ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {Math.round(progress)}%
          </motion.span>
        </div>

        <div className="sync-track">
          <motion.div
            className="sync-track-fill"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.7, ease: EASE }}
          />
        </div>

        {sync.state === "error" && sync.message && (
          <p className="sync-error-msg">{sync.message}</p>
        )}

        <button className="btn btn-success btn-lg" onClick={onSync} disabled={busy}>
          {busy ? (
            <span className="spinner" />
          ) : sync.state === "synced" ? (
            <CheckIcon width={18} height={18} />
          ) : (
            <RefreshIcon width={18} height={18} />
          )}
          {sync.state === "synced" ? "Synced — Ready" : syncButtonLabel(sync)}
        </button>
      </div>
    </div>
  );
}
