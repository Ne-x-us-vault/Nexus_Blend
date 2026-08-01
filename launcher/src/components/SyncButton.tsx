import "./buttons.css";

interface SyncButtonProps {
  busy: boolean;
  exporting: boolean;
  onSync: () => void;
}

export default function SyncButton({ busy, exporting, onSync }: SyncButtonProps) {
  const label = busy ? (exporting ? "Exporting from Blender…" : "Syncing to Game…") : "Sync To Game";

  return (
    <button className="btn btn-sync" onClick={onSync} disabled={busy}>
      {busy ? (
        <span className="btn-spinner" />
      ) : (
        <svg
          className="btn-icon"
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
      )}
      {label}
    </button>
  );
}
