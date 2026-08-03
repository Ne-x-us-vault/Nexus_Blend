import { useState } from "react";
import { motion } from "framer-motion";
import type { Level } from "../types";
import { fadeUp, staggerContainer } from "../lib/motion";
import RequirementCard from "../components/ui/RequirementCard";
import ObjectiveList from "../components/ui/ObjectiveList";
import SyncBadge from "../components/ui/SyncBadge";
import {
  ChevronLeftIcon,
  ClockIcon,
  ImageIcon,
  InfoIcon,
  LockIcon,
  PlayIcon,
  TargetIcon,
  WrenchIcon,
} from "../components/icons";

interface LevelDetailPageProps {
  level: Level;
  connected: boolean;
  launchBlender: () => Promise<void>;
  launchGame: () => Promise<void>;
  onBack: () => void;
  onStartModeling: () => void;
}

export default function LevelDetailPage({
  level,
  connected,
  launchBlender,
  launchGame,
  onBack,
  onStartModeling,
}: LevelDetailPageProps) {
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    if (launching) return;
    setLaunching(true);
    setError(null);
    try {
      await launchBlender();
      await launchGame();
      onStartModeling();
    } catch (e) {
      setError(typeof e === "string" ? e : "Failed to launch the workspace.");
      setLaunching(false);
    }
  };

  const difficultyClass = level.difficulty.toLowerCase();

  return (
    <motion.div
      className="page-enter"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={fadeUp} className="back-row">
        <div className="back-row-left">
          <button className="btn btn-secondary" onClick={onBack}>
            <ChevronLeftIcon width={15} height={15} /> Back
          </button>
          <div>
            <h1 className="h1">Level {level.number}</h1>
            <p className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
              {level.location} · {level.title}
            </p>
          </div>
        </div>
        <SyncBadge connected={connected} />
      </motion.div>

      <motion.section variants={fadeUp} className="glass detail-hero">
        <span className="hero-glow" />

        <div className="detail-head">
          <div>
            <div className="detail-subtitle">
              <span className="chip">Level {level.number}</span>
              <span className={`difficulty-chip ${difficultyClass}`}>{level.difficulty}</span>
              <span className="chip">
                <ClockIcon width={13} height={13} /> {level.estimatedMinutes} min
              </span>
            </div>
            <h2 className="detail-title">{level.title}</h2>
            <p className="detail-story">{level.story}</p>
          </div>
        </div>

        <div className="detail-grid">
          <div className="glass detail-card">
            <div className="detail-card-head">
              <TargetIcon /> <h3>Objectives</h3>
            </div>
            <ObjectiveList objectives={level.objectives} />
          </div>

          <div className="glass detail-card">
            <div className="detail-card-head">
              <WrenchIcon /> <h3>Requirements</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {level.requirements.map((requirement) => (
                <RequirementCard key={requirement} requirement={requirement} />
              ))}
            </div>
          </div>

          <div className="glass detail-card">
            <div className="detail-card-head">
              <LockIcon /> <h3>Constraints</h3>
            </div>
            <ul className="check-list">
              {level.constraints.map((constraint) => (
                <li className="constraint-item" key={constraint}>
                  <InfoIcon width={15} height={15} />
                  {constraint}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass detail-card">
            <div className="detail-card-head">
              <ImageIcon /> <h3>Reference</h3>
            </div>
            <div className="reference-placeholder">
              <ImageIcon />
              <span>Reference image coming soon</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="form-error">
            <InfoIcon width={15} height={15} />
            {error}
          </div>
        )}

        <div className="detail-footer">
          <span className="detail-time">
            <ClockIcon width={15} height={15} /> Estimated time: {level.estimatedMinutes} minutes
          </span>
          <div className="detail-actions">
            <button className="btn btn-secondary" onClick={onBack} disabled={launching}>
              Back
            </button>
            <button className="btn btn-primary btn-lg" onClick={handleStart} disabled={launching}>
              {launching ? <span className="spinner" /> : <PlayIcon width={18} height={18} />}
              {launching ? "Launching Workspace…" : "Start Modeling"}
            </button>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
