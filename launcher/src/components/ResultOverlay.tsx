import Overlay from "./ui/Overlay";
import { CheckCircleIcon, LockIcon, SparklesIcon, StarIcon } from "./icons";

interface ResultOverlayProps {
  open: boolean;
  onContinue: () => void;
  onBackToLevels: () => void;
}

export default function ResultOverlay({ open, onContinue, onBackToLevels }: ResultOverlayProps) {
  return (
    <Overlay open={open}>
      <span className="overlay-badge">
        <CheckCircleIcon width={34} height={34} />
      </span>
      <h2 className="overlay-title">Congratulations</h2>
      <p className="overlay-sub">
        Model Submitted — your build has been handed off to the evaluation pipeline.
      </p>

      <div className="stars">
        <StarIcon />
        <StarIcon />
        <StarIcon />
      </div>
      <span className="stars-note">
        <LockIcon width={13} height={13} /> Performance rating locked
      </span>

      <div className="eval-card">
        <span className="eval-card-title">
          <SparklesIcon width={15} height={15} /> AI Evaluation
        </span>
        <p className="eval-card-desc">
          Coming soon — an automated review of your model will appear here.
        </p>
      </div>

      <div className="overlay-actions">
        <button className="btn btn-secondary" onClick={onBackToLevels}>
          Back to Levels
        </button>
        <button className="btn btn-primary" onClick={onContinue}>
          Continue
        </button>
      </div>
    </Overlay>
  );
}
