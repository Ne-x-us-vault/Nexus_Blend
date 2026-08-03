import type { ReactNode } from "react";

interface WorkspaceCardProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  iconClass?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function WorkspaceCard({
  icon,
  title,
  subtitle,
  iconClass,
  actions,
  children,
  className,
}: WorkspaceCardProps) {
  return (
    <section className={`panel ${className ?? ""}`}>
      <header className="panel-head">
        <div className="panel-head-left">
          <span className={`panel-head-icon ${iconClass ?? ""}`}>{icon}</span>
          <div>
            <h3 className="panel-title">{title}</h3>
            {subtitle && <p className="panel-sub">{subtitle}</p>}
          </div>
        </div>
        {actions}
      </header>
      <div className="panel-body">{children}</div>
    </section>
  );
}
