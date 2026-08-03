import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "../../lib/motion";

export type StatusState = "ok" | "off" | "busy" | "error" | "accent";

interface StatusCardProps {
  icon: ReactNode;
  name: string;
  state: StatusState;
  value: string;
}

function dotFor(state: StatusState): string {
  switch (state) {
    case "ok":
      return "dot-ok";
    case "busy":
      return "dot-busy";
    case "error":
      return "dot-error";
    case "accent":
      return "dot-accent";
    default:
      return "dot-off";
  }
}

export default function StatusCard({ icon, name, state, value }: StatusCardProps) {
  return (
    <motion.div variants={fadeUp} className="status-card">
      <span className={`status-icon ${state}`}>{icon}</span>
      <div className="status-body">
        <span className="status-name">
          <span className={`dot ${dotFor(state)}`} />
          {name}
        </span>
        <span className={`status-value ${state === "ok" || state === "accent" ? "" : state}`}>
          {value}
        </span>
      </div>
    </motion.div>
  );
}
