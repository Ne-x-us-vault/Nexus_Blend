import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "../lib/motion";
import EmptyState from "../components/ui/EmptyState";
import { SettingsIcon } from "../components/icons";

export default function SettingsPage() {
  return (
    <motion.div
      className="page-enter"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={fadeUp} className="section-title">
        <div>
          <h1>Settings</h1>
          <p>Manage your NexusBlend preferences.</p>
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <EmptyState
          icon={<SettingsIcon />}
          title="Preferences coming soon"
          description="Engine paths, connection ports, and display options will live here."
        />
      </motion.div>
    </motion.div>
  );
}
