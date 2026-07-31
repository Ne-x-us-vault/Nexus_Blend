import type { EngineStatus, SyncEvent } from "../types";
import "./StatusCard.css";

interface StatusCardProps {
  status: EngineStatus;
  sync: SyncEvent;
}

interface Row {
  key: string;
  label: string;
  state: "ok" | "off" | "busy" | "error";
  detail?: string;
}

function syncRow(sync: SyncEvent): Row {
  switch (sync.state) {
    case "syncing":
      return {
        key: "sync",
        label: "Syncing",
        state: "busy",
        detail: sync.phase === "exporting" ? "Exporting from Blender…" : "Loading into game…",
      };
    case "synced":
      return { key: "sync", label: "Ready", state: "ok", detail: "Model in game" };
    case "error":
      return { key: "sync", label: "Sync Failed", state: "error", detail: sync.message };
    default:
      return { key: "sync", label: "Ready", state: "off", detail: "Awaiting sync" };
  }
}

export default function StatusCard({ status, sync }: StatusCardProps) {
  const rows: Row[] = [
    {
      key: "blender",
      label: "Blender",
      state: status.blender ? "ok" : "off",
      detail: status.blender ? "Running" : "Offline",
    },
    {
      key: "game",
      label: "Game",
      state: status.game ? "ok" : "off",
      detail: status.game ? "Running" : "Offline",
    },
    {
      key: "connection",
      label: "Connection",
      state: status.connected ? "ok" : "off",
      detail: status.connected ? "Connected" : "Disconnected",
    },
    syncRow(sync),
  ];

  return (
    <section className="card status-card" aria-label="Status">
      {rows.map((row) => (
        <div className="status-row" key={row.key}>
          <span className={`status-dot ${row.state}`} />
          <span className="status-label">{row.label}</span>
          <span className="status-detail">{row.detail}</span>
        </div>
      ))}
    </section>
  );
}
