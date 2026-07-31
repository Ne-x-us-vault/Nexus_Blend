import { useCallback, useEffect, useState } from "react";
import ActivityPanel from "./components/ActivityPanel";
import StartButton from "./components/StartButton";
import StatusCard from "./components/StatusCard";
import SyncButton from "./components/SyncButton";
import { useLauncherEvents } from "./hooks/useLauncherEvents";
import "./App.css";

function App() {
  const { status, sync, activities, config, startLearning, syncToGame } = useLauncherEvents();
  const [starting, setStarting] = useState(false);
  const [showSynced, setShowSynced] = useState(false);

  const bothRunning = status.blender && status.game;

  useEffect(() => {
    if (bothRunning) {
      setStarting(false);
    }
  }, [bothRunning]);

  useEffect(() => {
    if (sync.state === "synced") {
      setShowSynced(true);
      const timer = setTimeout(() => setShowSynced(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [sync.state]);

  const handleStart = useCallback(async () => {
    if (starting || bothRunning) return;
    setStarting(true);
    try {
      await startLearning();
    } catch (e) {
      console.error("Failed to start learning session:", e);
      setStarting(false);
    }
  }, [starting, bothRunning, startLearning]);

  const handleSync = useCallback(async () => {
    if (sync.state === "syncing") return;
    try {
      await syncToGame();
    } catch (e) {
      console.error("Sync failed:", e);
    }
  }, [sync.state, syncToGame]);

  const levelName = config?.level.name ?? "Office";
  const syncBusy = sync.state === "syncing";
  const syncError = sync.state === "error" ? sync.message : null;

  return (
    <div className="app">
      <header className="header">
        <div className="logo-mark">
          <div className="logo-cube" />
          <span>NexusBlend</span>
        </div>
        <p className="level-badge">
          Current Level · <span>{levelName}</span>
        </p>
      </header>

      <StatusCard status={status} sync={sync} />

      <div className="actions">
        <StartButton starting={starting} sessionActive={bothRunning} onStart={handleStart} />
        {bothRunning && <SyncButton busy={syncBusy} exporting={sync.phase === "exporting"} onSync={handleSync} />}
        {showSynced && (
          <div className="synced-banner" role="status">
            ✓ Synced Successfully
          </div>
        )}
        {syncError && (
          <div className="error-banner" role="alert">
            {syncError}
          </div>
        )}
      </div>

      <ActivityPanel activities={activities} />

      <footer className="footer">
        <span className="footer-hint">Blender creates models · Godot plays them · NexusBlend connects</span>
      </footer>
    </div>
  );
}

export default App;
