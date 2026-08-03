import { motion } from "framer-motion";
import type { Level } from "../../types";
import { fadeUp } from "../../lib/motion";
import { ChevronRightIcon, ClockIcon, LockIcon } from "../icons";

interface LevelCardProps {
  level: Level;
  onOpen: (id: string) => void;
}

export default function LevelCard({ level, onOpen }: LevelCardProps) {
  const locked = !level.unlocked;
  const difficultyClass = level.difficulty.toLowerCase();

  return (
    <motion.div variants={fadeUp} className={`level-card ${locked ? "locked" : "unlocked"}`}>
      <span className={`level-num ${locked ? "" : "done"}`}>
        {locked ? <LockIcon width={18} height={18} /> : level.number}
      </span>

      <div className="level-body">
        <div className="level-title-row">
          <span className="level-title">{level.title}</span>
          <span className="level-location">· {level.location}</span>
        </div>
        <div className="level-meta">
          <span className={`difficulty-chip ${difficultyClass}`}>{level.difficulty}</span>
          {!locked ? (
            <span className="chip">
              <ClockIcon /> {level.estimatedMinutes} min
            </span>
          ) : (
            <span className="chip">
              <LockIcon /> Coming soon
            </span>
          )}
        </div>
        <p className="level-story">{level.story}</p>
        {!locked && (
          <div className="level-progress-block">
            <div className="progress-track" style={{ flex: 1 }}>
              <div className="progress-fill" style={{ width: `${level.completion}%` }} />
            </div>
            <span className="level-progress-pct">{level.completion}%</span>
          </div>
        )}
      </div>

      <div className="level-actions">
        {locked ? (
          <span className="btn btn-secondary" aria-disabled="true">
            <LockIcon width={14} height={14} /> Locked
          </span>
        ) : (
          <button className="btn btn-primary" onClick={() => onOpen(level.id)}>
            View Level <ChevronRightIcon width={15} height={15} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
