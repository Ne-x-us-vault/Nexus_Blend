import { motion } from "framer-motion";
import { COURSE_PROGRESS } from "../data/levels";
import { fadeUp, staggerContainer } from "../lib/motion";
import ProgressRing from "../components/ui/ProgressRing";
import EmptyState from "../components/ui/EmptyState";
import { ChartIcon } from "../components/icons";

export default function ProgressPage() {
  const progress = Math.round(COURSE_PROGRESS);

  return (
    <motion.div
      className="page-enter"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={fadeUp} className="section-title">
        <div>
          <h1>Progress</h1>
          <p>Track your journey across levels.</p>
        </div>
      </motion.div>

      <div className="home-grid">
        <div className="home-stack">
          <motion.section variants={fadeUp} className="glass panel-card">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
              <ProgressRing value={progress} label="Course Progress" />
              <div className="progress-track" style={{ width: "100%" }}>
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </motion.section>
        </div>
        <div className="home-stack">
          <motion.div variants={fadeUp} style={{ flex: 1, display: "flex" }}>
            <EmptyState
              icon={<ChartIcon />}
              title="Detailed analytics coming soon"
              description="Per-objective scoring, time tracking, and performance history will appear here once evaluation ships."
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
