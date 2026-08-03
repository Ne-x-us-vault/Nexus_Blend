export interface EngineStatus {
  blender: boolean;
  game: boolean;
  connected: boolean;
}

export type ActivityKind = "info" | "success" | "error" | "sync";

export interface ActivityEntry {
  ts: number;
  message: string;
  kind: ActivityKind;
}

export interface SyncEvent {
  state: "idle" | "syncing" | "synced" | "error";
  phase?: "exporting" | "syncing";
  message?: string;
}

export interface LauncherConfig {
  level: {
    id: string;
    name: string;
  };
  servers: {
    godot_ws: string;
    blender_bridge: string;
  };
  model: {
    name: string;
    sharedDir: string;
    godotDir: string;
  };
}

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export interface Level {
  id: string;
  number: number;
  location: string;
  title: string;
  difficulty: Difficulty;
  story: string;
  requirements: string[];
  objectives: string[];
  constraints: string[];
  estimatedMinutes: number;
  unlocked: boolean;
  completion: number;
}

export type RouteName = "home" | "levels" | "level" | "workspace" | "progress" | "settings";

export interface Route {
  name: RouteName;
  levelId?: string;
}
