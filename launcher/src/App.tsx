import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Route } from "./types";
import { LEVELS } from "./data/levels";
import { useLauncherEvents } from "./hooks/useLauncherEvents";
import { pageVariants } from "./lib/motion";
import Sidebar from "./components/layout/Sidebar";
import TopBar from "./components/layout/TopBar";
import HomePage from "./pages/HomePage";
import LevelsPage from "./pages/LevelsPage";
import LevelDetailPage from "./pages/LevelDetailPage";
import WorkspacePage from "./pages/WorkspacePage";
import ProgressPage from "./pages/ProgressPage";
import SettingsPage from "./pages/SettingsPage";
import ResultOverlay from "./components/ResultOverlay";

const ROUTE_META: Record<Route["name"], { title: string; subtitle: string }> = {
  home: { title: "NexusBlend", subtitle: "Workspace Overview" },
  levels: { title: "Level Selection", subtitle: "Choose your workspace" },
  level: { title: "Level Detail", subtitle: "Plan before you model" },
  workspace: { title: "Active Workspace", subtitle: "Model · Sync · Play" },
  progress: { title: "Progress", subtitle: "Your journey" },
  settings: { title: "Settings", subtitle: "Preferences" },
};

function App() {
  const model = useLauncherEvents();
  const [route, setRoute] = useState<Route>({ name: "home" });
  const [resultOpen, setResultOpen] = useState(false);
  const resultShownRef = useRef(false);
  const pageRef = useRef<HTMLElement | null>(null);

  const currentLevel =
    LEVELS.find((level) => level.id === (route.levelId ?? "office")) ?? LEVELS[0];

  const navigate = useCallback((next: Route) => {
    setRoute(next);
    pageRef.current?.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    if (model.sync.state === "synced" && route.name === "workspace" && !resultShownRef.current) {
      const timer = setTimeout(() => {
        setResultOpen(true);
        resultShownRef.current = true;
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [model.sync.state, route.name]);

  const handleStartLearning = useCallback(() => navigate({ name: "levels" }), [navigate]);
  const handleOpenLevel = useCallback(
    (id: string) => navigate({ name: "level", levelId: id }),
    [navigate],
  );
  const handleStartModeling = useCallback(
    () => navigate({ name: "workspace", levelId: route.levelId }),
    [navigate, route.levelId],
  );

  const renderPage = () => {
    switch (route.name) {
      case "home":
        return (
          <HomePage
            status={model.status}
            sync={model.sync}
            config={model.config}
            activities={model.activities}
            onStartLearning={handleStartLearning}
            onOpenLevel={handleOpenLevel}
          />
        );
      case "levels":
        return (
          <LevelsPage
            connected={model.status.connected}
            onBack={() => navigate({ name: "home" })}
            onOpenLevel={handleOpenLevel}
          />
        );
      case "level":
        return (
          <LevelDetailPage
            level={currentLevel}
            connected={model.status.connected}
            launchBlender={model.launchBlender}
            launchGame={model.launchGame}
            onBack={() => navigate({ name: "levels" })}
            onStartModeling={handleStartModeling}
          />
        );
      case "workspace":
        return (
          <WorkspacePage
            level={currentLevel}
            status={model.status}
            sync={model.sync}
            config={model.config}
            activities={model.activities}
            connected={model.status.connected}
            onSync={model.syncToGame}
            onBack={() => navigate({ name: "levels" })}
          />
        );
      case "progress":
        return <ProgressPage />;
      case "settings":
        return <SettingsPage />;
    }
  };

  const pageKey =
    route.name === "level" || route.name === "workspace"
      ? `${route.name}-${route.levelId ?? "office"}`
      : route.name;

  return (
    <div className="app-shell">
      <Sidebar route={route} onNavigate={navigate} />

      <div className="main">
        <TopBar
          title={ROUTE_META[route.name].title}
          subtitle={ROUTE_META[route.name].subtitle}
          connected={model.status.connected}
        />
        <main className="page" ref={pageRef}>
          <div className="page-inner">
            <AnimatePresence mode="wait">
              <motion.div
                key={pageKey}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <ResultOverlay
        open={resultOpen}
        onContinue={() => setResultOpen(false)}
        onBackToLevels={() => {
          setResultOpen(false);
          navigate({ name: "levels" });
        }}
      />
    </div>
  );
}

export default App;
