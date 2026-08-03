import { motion } from "framer-motion";

interface SyncBadgeProps {
  connected: boolean;
  label?: string;
}

export default function SyncBadge({ connected, label }: SyncBadgeProps) {
  const text = label ?? (connected ? "Connected" : "Disconnected");
  return (
    <span className={`chip ${connected ? "on" : "off"}`}>
      <motion.span
        className={`dot ${connected ? "dot-ok" : "dot-off"}`}
        animate={{ opacity: 1 }}
        layout
      />
      {text}
    </span>
  );
}
