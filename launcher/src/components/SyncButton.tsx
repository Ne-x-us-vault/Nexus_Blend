import "./buttons.css";

interface SyncButtonProps {
  busy: boolean;
  exporting: boolean;
  onSync: () => void;
}

export default function SyncButton({ busy, exporting, onSync }: SyncButtonProps) {
  const label = busy ? (exporting ? "Exporting from Blender…" : "Syncing to Game…") : "🔄 Sync To Game";

  return (
    <button className="btn btn-sync" onClick={onSync} disabled={busy}>
      {busy && <span className="btn-spinner" />}
      {label}
    </button>
  );
}
