import type { ReactNode } from "react";
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

const ICONS: Record<string, ReactNode> = {
  blender: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  ),
  game: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 11h4" />
      <path d="M8 9v4" />
      <path d="M15 12h.01" />
      <path d="M18 10h.01" />
      <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5Z" />
    </svg>
  ),
  connection: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20h.01" />
      <path d="M2 8.82a15 15 0 0 1 20 0" />
      <path d="M5 12.859a10 10 0 0 1 14 0" />
      <path d="M8.5 16.429a5 5 0 0 1 7 0" />
    </svg>
  ),
  sync: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  ),
};

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
        <div className="status-tile" key={row.key}>
          <span className={`status-chip ${row.state}`}>{ICONS[row.key]}</span>
          <span className="status-text">
            <span className="status-label">{row.label}</span>
            <span className="status-detail">{row.detail}</span>
          </span>
        </div>
      ))}
    </section>
  );
}
