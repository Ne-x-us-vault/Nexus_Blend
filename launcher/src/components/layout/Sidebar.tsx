import type { Route } from "../../types";
import { BoxIcon, ChartIcon, HomeIcon, LayersIcon, SettingsIcon } from "../icons";

const VERSION = "v0.1.0";

const NAV = [
  { key: "home", label: "Home", icon: HomeIcon },
  { key: "levels", label: "Levels", icon: LayersIcon },
  { key: "progress", label: "Progress", icon: ChartIcon },
  { key: "settings", label: "Settings", icon: SettingsIcon },
] as const;

function activeGroup(route: Route): string {
  if (route.name === "level" || route.name === "workspace") return "levels";
  return route.name;
}

interface SidebarProps {
  route: Route;
  onNavigate: (route: Route) => void;
}

export default function Sidebar({ route, onNavigate }: SidebarProps) {
  const active = activeGroup(route);

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark">
          <BoxIcon width={16} height={16} />
        </span>
        <span className="brand-text">
          <span className="brand-name">NexusBlend</span>
          <span className="brand-sub">Desktop Studio</span>
        </span>
      </div>

      <span className="nav-label">Workspace</span>
      <nav className="sidebar-nav">
        {NAV.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`nav-item ${active === key ? "active" : ""}`}
            onClick={() => onNavigate({ name: key })}
          >
            <Icon />
            {label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="version-label">Version {VERSION}</span>
      </div>
    </aside>
  );
}
