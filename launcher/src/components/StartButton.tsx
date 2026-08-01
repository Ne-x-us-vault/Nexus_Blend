import "./buttons.css";

interface StartButtonProps {
  starting: boolean;
  sessionActive: boolean;
  onStart: () => void;
}

export default function StartButton({ starting, sessionActive, onStart }: StartButtonProps) {
  const label = starting ? "Starting Engines…" : sessionActive ? "Session Running" : "Start Learning";
  const disabled = starting || sessionActive;

  return (
    <button
      className={`btn btn-primary ${sessionActive ? "btn-success" : ""}`}
      onClick={onStart}
      disabled={disabled}
    >
      {starting && <span className="btn-spinner" />}
      {!starting && (
        <svg
          className="btn-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {sessionActive ? (
            <path d="M20 6 9 17l-5-5" />
          ) : (
            <path d="M7 4.5v15l12-7.5-12-7.5Z" />
          )}
        </svg>
      )}
      {label}
    </button>
  );
}
