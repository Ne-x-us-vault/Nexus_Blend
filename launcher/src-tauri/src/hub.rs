use std::collections::HashMap;
use std::sync::Arc;
use std::sync::Mutex;
use std::time::{Duration, Instant};

use serde_json::json;
use tauri::AppHandle;
use tauri::Emitter;
use tokio::sync::mpsc;

use crate::paths;
use crate::state::{ClientKind, EngineStatus, HubCommand, SyncState};

/// How long to wait for an engine to connect after launch before warning.
const PENDING_TIMEOUT: Duration = Duration::from_secs(25);

/// Decides the next step of a sync request. Pure function, unit-tested.
pub enum SyncStep {
    /// Blender bridge is connected: ask Blender to export first.
    Export,
    /// No Blender bridge but a model exists: send it straight to Godot.
    DirectSync,
    /// Godot connected but no model and no Blender to make one.
    NoBlenderNoFile,
    /// Neither engine is available.
    NothingRunning,
}

pub fn plan_sync(blender: bool, godot: bool, file_exists: bool) -> SyncStep {
    if blender {
        SyncStep::Export
    } else if godot && file_exists {
        SyncStep::DirectSync
    } else if godot {
        SyncStep::NoBlenderNoFile
    } else {
        SyncStep::NothingRunning
    }
}

/// Central actor. Owns every engine connection and the sync state machine.
/// The launcher is the brain: Blender and Godot only ever talk to this hub.
pub struct Hub {
    app: AppHandle,
    status: Arc<Mutex<EngineStatus>>,
    godot: Option<u64>,
    blender: Option<u64>,
    outbound: HashMap<u64, mpsc::UnboundedSender<String>>,
    sync_state: SyncState,
    pending: HashMap<ClientKind, Instant>,
}

impl Hub {
    pub fn spawn(
        app: AppHandle,
        status: Arc<Mutex<EngineStatus>>,
        mut rx: mpsc::UnboundedReceiver<HubCommand>,
    ) {
        tauri::async_runtime::spawn(async move {
            let mut hub = Hub {
                app,
                status,
                godot: None,
                blender: None,
                outbound: HashMap::new(),
                sync_state: SyncState::Idle,
                pending: HashMap::new(),
            };
            let mut tick = tokio::time::interval(Duration::from_secs(1));
            loop {
                tokio::select! {
                    cmd = rx.recv() => match cmd {
                        Some(cmd) => hub.handle(cmd),
                        None => break,
                    },
                    _ = tick.tick() => hub.on_tick(),
                }
            }
        });
    }

    fn handle(&mut self, cmd: HubCommand) {
        match cmd {
            HubCommand::ClientConnected { id, kind, out_tx } => {
                self.on_client_connected(id, kind, out_tx);
            }
            HubCommand::Incoming { kind, text } => self.on_incoming(kind, text),
            HubCommand::ClientDisconnected { id, kind } => self.on_client_disconnected(id, kind),
            HubCommand::EngineLaunched { kind } => {
                self.pending.insert(kind, Instant::now());
            }
            HubCommand::SyncModel => self.start_sync(),
        }
    }

    fn on_client_connected(
        &mut self,
        id: u64,
        kind: ClientKind,
        out_tx: mpsc::UnboundedSender<String>,
    ) {
        self.outbound.insert(id, out_tx);
        self.pending.remove(&kind);
        match kind {
            ClientKind::Godot => {
                self.godot = Some(id);
                self.activity("Game Started", "success");
            }
            ClientKind::Blender => {
                self.blender = Some(id);
                self.activity("Blender Started", "success");
            }
        }
        self.emit_status();
        if self.blender.is_some() && self.godot.is_some() {
            self.activity("Connected — Blender and Game ready", "success");
        }
    }

    fn on_incoming(&mut self, kind: ClientKind, text: String) {
        let Ok(value) = serde_json::from_str::<serde_json::Value>(&text) else {
            return;
        };
        if !value.is_object() {
            return;
        }
        let Some(msg_type) = value.get("type").and_then(|v| v.as_str()) else {
            return;
        };
        match (kind, msg_type) {
            (ClientKind::Godot, "MODEL_LOADED") => self.on_model_loaded(&value),
            (ClientKind::Blender, "EXPORT_DONE") => self.on_export_done(&value),
            _ => {}
        }
    }

    fn on_client_disconnected(&mut self, id: u64, kind: ClientKind) {
        if self.outbound.remove(&id).is_none() {
            return;
        }
        match kind {
            ClientKind::Godot => {
                if self.godot == Some(id) {
                    self.godot = None;
                    self.activity("Game Closed", "info");
                    if self.sync_state.is_active() {
                        self.fail_sync("Game disconnected during sync");
                    }
                }
            }
            ClientKind::Blender => {
                if self.blender == Some(id) {
                    self.blender = None;
                    self.activity("Blender Closed", "info");
                    if matches!(self.sync_state, SyncState::Exporting) {
                        self.fail_sync("Blender disconnected during export");
                    }
                }
            }
        }
        self.emit_status();
    }

    fn on_tick(&mut self) {
        let now = Instant::now();
        let timed_out: Vec<ClientKind> = self
            .pending
            .iter()
            .filter(|(_, launched_at)| now.duration_since(**launched_at) > PENDING_TIMEOUT)
            .map(|(kind, _)| *kind)
            .collect();
        for kind in timed_out {
            self.pending.remove(&kind);
            match kind {
                ClientKind::Blender => {
                    self.activity("Blender did not connect — check the bridge script", "error");
                }
                ClientKind::Godot => {
                    self.activity("Game did not connect", "error");
                }
            }
        }
    }

    fn start_sync(&mut self) {
        match plan_sync(
            self.blender.is_some(),
            self.godot.is_some(),
            paths::submission_glb().exists(),
        ) {
            SyncStep::Export => {
                self.sync_state = SyncState::Exporting;
                self.emit_sync();
                self.activity("Exporting Blender scene...", "sync");
                self.send_to(
                    ClientKind::Blender,
                    json!({"type": "EXPORT_SCENE", "file": "submission.glb"}),
                );
            }
            SyncStep::DirectSync => {
                if let Err(message) = stage_model() {
                    self.fail_sync(&message);
                    return;
                }
                self.sync_state = SyncState::Syncing;
                self.emit_sync();
                self.activity("Sending model to game...", "sync");
                self.send_to(
                    ClientKind::Godot,
                    json!({"type": "SYNC_MODEL", "file": "submission.glb"}),
                );
            }
            SyncStep::NoBlenderNoFile => {
                self.fail_sync("No submission.glb found and Blender is not connected.");
            }
            SyncStep::NothingRunning => {
                self.fail_sync("Blender and Game are not running.");
            }
        }
    }

    fn on_export_done(&mut self, value: &serde_json::Value) {
        let ok = value.get("ok").and_then(|v| v.as_bool()).unwrap_or(false);
        if !ok {
            let message = value
                .get("message")
                .and_then(|v| v.as_str())
                .unwrap_or("Unknown export error");
            self.fail_sync(&format!("Blender export failed: {}", message));
            return;
        }
        if self.godot.is_none() {
            self.fail_sync("Scene exported but the Game is not connected.");
            return;
        }
        if let Err(message) = stage_model() {
            self.fail_sync(&message);
            return;
        }
        self.sync_state = SyncState::Syncing;
        self.emit_sync();
        self.activity("Scene exported — syncing to game...", "sync");
        self.send_to(
            ClientKind::Godot,
            json!({"type": "SYNC_MODEL", "file": "submission.glb"}),
        );
    }

    fn on_model_loaded(&mut self, value: &serde_json::Value) {
        let ok = value.get("ok").and_then(|v| v.as_bool()).unwrap_or(true);
        if ok {
            self.sync_state = SyncState::Synced;
            self.activity("Model Synced", "success");
        } else {
            let message = value
                .get("message")
                .and_then(|v| v.as_str())
                .unwrap_or("Unknown load error");
            self.fail_sync(&format!("Game failed to load model: {}", message));
        }
        self.emit_sync();
    }

    fn fail_sync(&mut self, message: &str) {
        self.sync_state = SyncState::Error(message.to_string());
        self.activity(message, "error");
        self.emit_sync();
        self.emit_status();
    }

    fn send_to(&self, kind: ClientKind, payload: serde_json::Value) {
        let id = match kind {
            ClientKind::Godot => self.godot,
            ClientKind::Blender => self.blender,
        };
        if let Some(id) = id {
            if let Some(tx) = self.outbound.get(&id) {
                let _ = tx.send(payload.to_string());
            }
        }
    }

    fn emit_status(&self) {
        let snapshot = EngineStatus {
            blender: self.blender.is_some(),
            game: self.godot.is_some(),
            connected: self.godot.is_some(),
        };
        if let Ok(mut guard) = self.status.lock() {
            *guard = snapshot;
        }
        let _ = self.app.emit("status", snapshot);
    }

    fn emit_sync(&self) {
        let payload = match &self.sync_state {
            SyncState::Idle => json!({"state": "idle"}),
            SyncState::Exporting => json!({"state": "syncing", "phase": "exporting"}),
            SyncState::Syncing => json!({"state": "syncing", "phase": "syncing"}),
            SyncState::Synced => json!({"state": "synced", "message": "Synced Successfully"}),
            SyncState::Error(message) => json!({"state": "error", "message": message}),
        };
        let _ = self.app.emit("sync", payload);
    }

    fn activity(&self, message: &str, kind: &str) {
        crate::state::emit_activity(&self.app, message, kind);
    }
}

/// Copy the freshly exported model from `shared/exports` into the Godot
/// runtime's `exports` folder so `res://exports/submission.glb` is fresh
/// before SYNC_MODEL is sent. Everything flows through the launcher.
fn stage_model() -> Result<(), String> {
    let source = paths::submission_glb();
    if !source.exists() {
        return Err("No submission.glb found in shared/exports".to_string());
    }
    let destination = paths::godot_glb();
    if let Some(parent) = destination.parent() {
        std::fs::create_dir_all(parent).map_err(|e| format!("Failed to prepare game exports: {}", e))?;
    }
    std::fs::copy(&source, &destination)
        .map(|_| ())
        .map_err(|e| format!("Failed to stage model for the game: {}", e))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn plan_sync_prefers_export_when_blender_connected() {
        assert!(matches!(plan_sync(true, false, false), SyncStep::Export));
        assert!(matches!(plan_sync(true, true, true), SyncStep::Export));
    }

    #[test]
    fn plan_sync_falls_back_to_direct_sync() {
        assert!(matches!(
            plan_sync(false, true, true),
            SyncStep::DirectSync
        ));
    }

    #[test]
    fn plan_sync_reports_missing_model() {
        assert!(matches!(
            plan_sync(false, true, false),
            SyncStep::NoBlenderNoFile
        ));
    }

    #[test]
    fn plan_sync_reports_nothing_running() {
        assert!(matches!(
            plan_sync(false, false, true),
            SyncStep::NothingRunning
        ));
    }
}
