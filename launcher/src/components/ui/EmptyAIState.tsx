import { motion } from "framer-motion";
import { EASE } from "../../lib/motion";
import { SparklesIcon } from "../icons";

export default function EmptyAIState() {
  return (
    <div className="ai-empty">
      <motion.span
        className="ai-orb"
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: EASE }}
      >
        <SparklesIcon width={34} height={34} />
      </motion.span>
      <h3 className="ai-empty-title">AI evaluation coming soon</h3>
      <p className="ai-empty-desc">
        Your models will be reviewed automatically right here once live evaluation ships.
      </p>
      <div className="ai-skeleton" aria-hidden="true">
        <span className="ai-skeleton-line w-80" />
        <span className="ai-skeleton-line w-60" />
        <span className="ai-skeleton-line w-40" />
      </div>
    </div>
  );
}
