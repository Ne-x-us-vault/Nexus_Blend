import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [lastSync, setLastSync] = useState<string>("Never");
  const [syncing, setSyncing] = useState(false);

  const launchGame = useCallback(async () => {
    try {
      await invoke("launch_game");
    } catch (e) {
      console.error("Failed to launch game:", e);
    }
  }, []);

  const launchBlender = useCallback(async () => {
    try {
      await invoke("launch_blender");
    } catch (e) {
      console.error("Failed to launch Blender:", e);
    }
  }, []);

  const syncToGame = useCallback(async () => {
    setSyncing(true);
    try {
      const result = await invoke<string>("sync_model");
      setLastSync(new Date().toLocaleTimeString());
      console.log(result);
    } catch (e) {
      console.error("Sync failed:", e);
    } finally {
      setSyncing(false);
    }
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">NexusBlend</h1>
        <p className="subtitle">Current Level: Office</p>
      </header>

      <section className="status-section">
        <div className="status-row">
          <span className="status-dot red" />
          <span className="status-label">Game Closed</span>
        </div>
        <div className="status-row">
          <span className="status-dot red" />
          <span className="status-label">Blender Closed</span>
        </div>
      </section>

      <section className="actions">
        <button className="btn" onClick={launchBlender}>
          Launch Blender
        </button>
        <button className="btn" onClick={launchGame}>
          Launch Game
        </button>
        <button className="btn btn-sync" onClick={syncToGame} disabled={syncing}>
          {syncing ? "Syncing..." : "Sync To Game"}
        </button>
      </section>

      <footer className="footer">
        <span className="sync-label">Last Sync: {lastSync}</span>
      </footer>
    </div>
  );
}

export default App;
