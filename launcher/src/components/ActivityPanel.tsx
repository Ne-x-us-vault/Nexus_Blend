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

const KIND_ICON: Record<ActivityKind, string> = {
  info: "•",
  success: "✓",
  error: "✕",
  sync: "↻",
};

export default function ActivityPanel({ activities }: ActivityPanelProps) {
  const entries = [...activities].reverse();

  return (
    <section className="card activity-card" aria-label="Activity">
      <header className="activity-header">
        <h2 className="activity-title">Activity</h2>
        {entries.length > 0 && <span className="activity-count">{entries.length}</span>}
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
