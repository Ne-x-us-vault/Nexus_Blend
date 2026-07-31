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
