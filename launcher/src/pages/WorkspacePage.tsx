import { motion } from "framer-motion";
import type { ActivityEntry, EngineStatus, LauncherConfig, Level, SyncEvent } from "../types";
import { fadeUp, staggerContainer } from "../lib/motion";
import WorkspaceCard from "../components/ui/WorkspaceCard";
import SessionCard from "../components/ui/SessionCard";
import ActivityFeed from "../components/ui/ActivityFeed";
import EmptyAIState from "../components/ui/EmptyAIState";
import SyncBadge from "../components/ui/SyncBadge";
import {
  ActivityIcon,
  BoxIcon,
  BuildingIcon,
  ChevronLeftIcon,
  GamepadIcon,
  SparklesIcon,
} from "../components/icons";

interface WorkspacePageProps {
  level: Level;
  status: EngineStatus;
  sync: SyncEvent;
  config: LauncherConfig | null;
  activities: ActivityEntry[];
  connected: boolean;
  onSync: () => void;
  onBack: () => void;
}

export default function WorkspacePage({
  level,
  status,
  sync,
  config,
  activities,
  connected,
  onSync,
  onBack,
}: WorkspacePageProps) {
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
            <h1 className="h1">Active Workspace</h1>
            <p className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
              Level {level.number} · {level.location}
            </p>
          </div>
        </div>
        <div className="workspace-head">
          <span className="chip">
            <BuildingIcon width={13} height={13} /> {level.location}
          </span>
          {status.blender && (
            <span className="chip">
              <BoxIcon width={13} height={13} /> Blender
            </span>
          )}
          {status.game && (
            <span className="chip">
              <GamepadIcon width={13} height={13} /> Game
            </span>
          )}
          <SyncBadge connected={connected} />
        </div>
      </motion.div>

      <div className="workspace-grid">
        <motion.div variants={fadeUp}>
          <WorkspaceCard
            icon={<SparklesIcon />}
            title="AI Live Review"
            subtitle="Automated evaluation"
            iconClass="ai"
          >
            <EmptyAIState />
          </WorkspaceCard>
        </motion.div>

        <motion.div variants={fadeUp}>
          <WorkspaceCard
            icon={<ActivityIcon />}
            title="Live Session"
            subtitle="Running applications"
            iconClass="live"
          >
            <SessionCard
              status={status}
              sync={sync}
              config={config}
              activities={activities}
              onSync={onSync}
            />
          </WorkspaceCard>
        </motion.div>
      </div>

      <motion.section variants={fadeUp} className="glass panel-card">
        <div className="panel-head">
          <span className="panel-title-rule">
            <ActivityIcon /> <span className="panel-kicker">Activity Feed</span>
          </span>
          {activities.length > 0 && (
            <span className="activity-live">
              <span className="dot dot-ok" /> Live
            </span>
          )}
        </div>
        <ActivityFeed activities={activities} limit={10} maxHeight="240px" />
      </motion.section>
    </motion.div>
  );
}
