use std::collections::VecDeque;
use std::sync::Arc;
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};

use serde::Serialize;
use tauri::AppHandle;
use tauri::Emitter;
use tauri::Manager;
use tokio::sync::mpsc;

/// Snapshot of engine connection status, pushed to the frontend.
#[derive(Clone, Copy, Debug, Default, Serialize)]
pub struct EngineStatus {
    pub blender: bool,
    pub game: bool,
    pub connected: bool,
}

/// One row in the launcher's Activity panel.
#[derive(Clone, Debug, Serialize)]
pub struct ActivityEntry {
    pub ts: u64,
    pub message: String,
    pub kind: String,
}

/// Which engine a client connection belongs to.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum ClientKind {
    Godot,
    Blender,
}

/// Current phase of the model-sync workflow.
#[derive(Clone, Debug)]
pub enum SyncState {
    Idle,
    Exporting,
    Syncing,
    Synced,
    Error(String),
}

impl SyncState {
    pub fn is_active(&self) -> bool {
        matches!(self, SyncState::Exporting | SyncState::Syncing)
    }
}

/// Messages the Hub actor consumes.
pub enum HubCommand {
    ClientConnected {
        id: u64,
        kind: ClientKind,
        out_tx: mpsc::UnboundedSender<String>,
    },
    Incoming {
        kind: ClientKind,
        text: String,
    },
    ClientDisconnected {
        id: u64,
        kind: ClientKind,
    },
    EngineLaunched {
        kind: ClientKind,
    },
    SyncModel,
}

/// Global launcher state shared between commands and the Hub actor.
pub struct AppState {
    pub hub_tx: Arc<Mutex<Option<mpsc::UnboundedSender<HubCommand>>>>,
    pub status: Arc<Mutex<EngineStatus>>,
    /// Ring buffer of Activity entries so the panel survives frontend reloads.
    pub activity: Arc<Mutex<VecDeque<ActivityEntry>>>,
}

pub fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0)
}

/// Push an entry into the frontend Activity panel and keep it in the
/// in-memory log so the panel can be re-seeded after a reload.
pub fn emit_activity(app: &AppHandle, message: impl Into<String>, kind: &str) {
    let entry = ActivityEntry {
        ts: now_ms(),
        message: message.into(),
        kind: kind.to_string(),
    };
    if let Some(state) = app.try_state::<AppState>() {
        if let Ok(mut log) = state.activity.lock() {
            log.push_back(entry.clone());
            while log.len() > 200 {
                log.pop_front();
            }
        }
    }    let _ = app.emit(
        "activity",
        serde_json::json!({
            "ts": entry.ts,
            "message": entry.message,
            "kind": entry.kind,
        }),
    );
}
