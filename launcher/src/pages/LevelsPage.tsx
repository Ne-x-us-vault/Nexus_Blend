import { motion } from "framer-motion";
import { LEVELS } from "../data/levels";
import { fadeUp, staggerContainer } from "../lib/motion";
import LevelCard from "../components/ui/LevelCard";
import SyncBadge from "../components/ui/SyncBadge";
import { ChevronLeftIcon } from "../components/icons";

interface LevelsPageProps {
  connected: boolean;
  onBack: () => void;
  onOpenLevel: (id: string) => void;
}

export default function LevelsPage({ connected, onBack, onOpenLevel }: LevelsPageProps) {
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
            <h1 className="h1">Level Selection</h1>
            <p className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
              Pick a workspace and start building.
            </p>
          </div>
        </div>
        <SyncBadge connected={connected} />
      </motion.div>

      <div className="level-list">
        {LEVELS.map((level) => (
          <LevelCard key={level.id} level={level} onOpen={onOpenLevel} />
        ))}
      </div>
    </motion.div>
  );
}
