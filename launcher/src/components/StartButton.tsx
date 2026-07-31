import "./buttons.css";

interface StartButtonProps {
  starting: boolean;
  sessionActive: boolean;
  onStart: () => void;
}

export default function StartButton({ starting, sessionActive, onStart }: StartButtonProps) {
  const label = starting ? "Starting Engines…" : sessionActive ? "✔ Session Running" : "▶ Start Learning";
  const disabled = starting || sessionActive;

  return (
    <button
      className={`btn btn-primary ${sessionActive ? "btn-success" : ""}`}
      onClick={onStart}
      disabled={disabled}
    >
      {starting && <span className="btn-spinner" />}
      {label}
    </button>
  );
}
