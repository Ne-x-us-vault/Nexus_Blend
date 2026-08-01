import type { ReactNode } from "react";
import type { ActivityEntry, ActivityKind } from "../types";
import "./ActivityPanel.css";

interface ActivityPanelProps {
  activities: ActivityEntry[];
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

const KIND_ICON: Record<ActivityKind, ReactNode> = {
  info: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  ),
  success: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  error: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  ),
  sync: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
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

export default function ActivityPanel({ activities }: ActivityPanelProps) {
  const entries = [...activities].reverse();

  return (
    <section className="card activity-card" aria-label="Activity">
      <header className="activity-header">
        <h2 className="activity-title">Activity</h2>
        <div className="activity-meta">
          {entries.length > 0 && <span className="live-dot" aria-hidden="true" />}
          {entries.length > 0 && <span className="activity-count">{entries.length}</span>}
        </div>
      </header>
      {entries.length === 0 ? (
        <p className="activity-empty">No activity yet.</p>
      ) : (
        <ul className="activity-list">
          {entries.map((entry, index) => (
            <li className={`activity-item kind-${entry.kind}`} key={`${entry.ts}-${index}`}>
              <span className="activity-time">{formatTime(entry.ts)}</span>
              <span className="activity-icon">{KIND_ICON[entry.kind]}</span>
              <span className="activity-message">{entry.message}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
