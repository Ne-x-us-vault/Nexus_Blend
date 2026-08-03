import type { ReactNode } from "react";
import SyncBadge from "../ui/SyncBadge";

interface TopBarProps {
  title: string;
  subtitle?: string;
  connected: boolean;
  right?: ReactNode;
}

export default function TopBar({ title, subtitle, connected, right }: TopBarProps) {
  return (
    <header className="topbar">
      <div>
        <h1 className="topbar-title">{title}</h1>
        {subtitle && <p className="topbar-sub">{subtitle}</p>}
      </div>
      <div className="topbar-spacer" />
      <div className="topbar-right">{right ?? <SyncBadge connected={connected} />}</div>
    </header>
  );
}
