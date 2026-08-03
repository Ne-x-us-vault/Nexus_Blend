import { motion } from "framer-motion";
import type { ActivityEntry, EngineStatus, LauncherConfig, SyncEvent } from "../types";
import { COURSE_PROGRESS, LEVELS } from "../data/levels";
import { fadeUp, staggerContainer } from "../lib/motion";
import StatusCard, { type StatusState } from "../components/ui/StatusCard";
import ProgressRing from "../components/ui/ProgressRing";
import ActivityFeed from "../components/ui/ActivityFeed";
import {
  ActivityIcon,
  ArrowRightIcon,
  BoxIcon,
  BuildingIcon,
  ChevronRightIcon,
  GamepadIcon,
  LayersIcon,
  LockIcon,
  RefreshIcon,
  WifiIcon,
} from "../components/icons";

interface HomePageProps {
  status: EngineStatus;
  sync: SyncEvent;
  config: LauncherConfig | null;
  activities: ActivityEntry[];
  onStartLearning: () => void;
  onOpenLevel: (id: string) => void;
}

function syncStatusCard(sync: SyncEvent): { state: StatusState; value: string } {
  switch (sync.state) {
    case "syncing":
      return { state: "busy", value: sync.phase === "exporting" ? "Exporting…" : "Syncing…" };
    case "synced":
      return { state: "ok", value: "Ready" };
    case "error":
      return { state: "error", value: "Sync Failed" };
    default:
      return { state: "off", value: "Ready" };
  }
}

export default function HomePage({
  status,
  sync,
  config,
  activities,
  onStartLearning,
  onOpenLevel,
}: HomePageProps) {
  const levelName = config?.level.name ?? "Office";
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
          <h1>Workspace Overview</h1>
          <p>Everything you need to model, sync, and play — in one place.</p>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="status-grid">
        <StatusCard
          icon={<BoxIcon />}
          name="Blender"
          state={status.blender ? "ok" : "off"}
          value={status.blender ? "Running" : "Offline"}
        />
        <StatusCard
          icon={<GamepadIcon />}
          name="Game"
          state={status.game ? "ok" : "off"}
          value={status.game ? "Running" : "Offline"}
        />
        <StatusCard
          icon={<WifiIcon />}
          name="Connection"
          state={status.connected ? "ok" : "off"}
          value={status.connected ? "Connected" : "Disconnected"}
        />
        <StatusCard icon={<BuildingIcon />} name="Current Level" state="accent" value={levelName} />
        <StatusCard icon={<RefreshIcon />} name="Sync Status" {...syncStatusCard(sync)} />
      </motion.div>

      <div className="home-grid">
        <div className="home-stack">
          <motion.section variants={fadeUp} className="glass hero-card">
            <span className="hero-glow" />
            <div className="hero-top">
              <div>
                <h2 className="hero-title">Start Learning</h2>
                <p className="hero-desc">
                  Jump into your first level and build real models that drop straight into the
                  game world.
                </p>
              </div>
              <button className="btn btn-primary btn-lg hero-cta" onClick={onStartLearning}>
                Start Learning <ArrowRightIcon width={18} height={18} />
              </button>
            </div>
            <div className="hero-meta">
              <span className="hero-meta-item">
                <LayersIcon /> {LEVELS.length} Levels
              </span>
              <span className="hero-meta-item">
                <BoxIcon /> Model in Blender
              </span>
              <span className="hero-meta-item">
                <GamepadIcon /> Play in Godot
              </span>
            </div>
          </motion.section>

          <motion.section variants={fadeUp} className="glass panel-card">
            <div className="panel-head">
              <span className="panel-title-rule">
                <LayersIcon /> <span className="panel-kicker">Recent Levels</span>
              </span>
              <button className="btn btn-ghost" onClick={onStartLearning}>
                View all
              </button>
            </div>
            <div>
              {LEVELS.map((level) => (
                <button
                  key={level.id}
                  className="recent-level-row"
                  onClick={() => (level.unlocked ? onOpenLevel(level.id) : undefined)}
                >
                  <span className={`recent-level-num ${level.unlocked ? "" : "locked"}`}>
                    {level.unlocked ? (
                      level.number
                    ) : (
                      <LockIcon width={14} height={14} />
                    )}
                  </span>
                  <span className="recent-level-body">
                    <span className="recent-level-name">{level.title}</span>
                    <span className="recent-level-meta">
                      <span>{level.location}</span>
                      <span>·</span>
                      <span>{level.unlocked ? `${level.completion}% complete` : "Locked"}</span>
                    </span>
                  </span>
                  {level.unlocked && (
                    <ChevronRightIcon width={15} height={15} className="muted" />
                  )}
                </button>
              ))}
            </div>
          </motion.section>
        </div>

        <div className="home-stack">
          <motion.section variants={fadeUp} className="glass panel-card">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
              <ProgressRing value={progress} label="Course Progress" />
              <div className="progress-track" style={{ width: "100%" }}>
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </motion.section>

          <motion.section variants={fadeUp} className="glass panel-card">
            <div className="panel-head">
              <span className="panel-title-rule">
                <ActivityIcon /> <span className="panel-kicker">Recent Activity</span>
              </span>
              {activities.length > 0 && (
                <span className="activity-live">
                  <span className="dot dot-ok" /> Live
                </span>
              )}
            </div>
            <ActivityFeed activities={activities} limit={8} maxHeight="220px" />
          </motion.section>
        </div>
      </div>
    </motion.div>
  );
}
