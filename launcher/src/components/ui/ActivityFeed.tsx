import { motion } from "framer-motion";
import type { ReactNode } from "react";
import type { ActivityEntry, ActivityKind } from "../../types";
import { formatTime } from "../../lib/format";
import { CheckIcon, ErrorIcon, InfoIcon, RefreshIcon } from "../icons";

const KIND_ICON: Record<ActivityKind, ReactNode> = {
  info: <InfoIcon />,
  success: <CheckIcon />,
  error: <ErrorIcon />,
  sync: <RefreshIcon />,
};

interface ActivityFeedProps {
  activities: ActivityEntry[];
  limit?: number;
  maxHeight?: string;
}

export default function ActivityFeed({ activities, limit = 20, maxHeight }: ActivityFeedProps) {
  const entries = [...activities].reverse().slice(0, limit);

  if (entries.length === 0) {
    return <p className="activity-empty">No activity yet — events will appear here.</p>;
  }

  return (
    <ul className="activity-list" style={maxHeight ? { maxHeight } : undefined}>
      {entries.map((entry, index) => (
        <motion.li
          className={`activity-item kind-${entry.kind}`}
          key={`${entry.ts}-${index}`}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <span className="activity-time">{formatTime(entry.ts)}</span>
          <span className="activity-icon">{KIND_ICON[entry.kind]}</span>
          <span className="activity-message">{entry.message}</span>
        </motion.li>
      ))}
    </ul>
  );
}
