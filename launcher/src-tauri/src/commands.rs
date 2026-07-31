use tauri::AppHandle;

use crate::engine;
use crate::paths;
use crate::state::{ActivityEntry, AppState, EngineStatus, HubCommand};

/// One button to rule them all: launches Blender + Godot, then the Hub
/// flips status indicators as each engine connects.
#[tauri::command]
pub fn start_learning(state: tauri::State<'_, AppState>, app: AppHandle) -> Result<String, String> {
    engine::launch_blender(&state, &app)?;
    engine::launch_game(&state, &app)?;
    Ok("Session started".to_string())
}

/// Legacy single-launch command, kept for compatibility.
#[tauri::command]
pub fn launch_blender(state: tauri::State<'_, AppState>, app: AppHandle) -> Result<String, String> {
    engine::launch_blender(&state, &app)
}

/// Legacy single-launch command, kept for compatibility.
#[tauri::command]
pub fn launch_game(state: tauri::State<'_, AppState>, app: AppHandle) -> Result<String, String> {
    engine::launch_game(&state, &app)
}

/// Starts the export -> sync pipeline. The Hub owns the rest of the flow
/// and reports progress back through the `sync` and `activity` events.
#[tauri::command]
pub fn sync_model(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let tx = state
        .hub_tx
        .lock()
        .map_err(|e| e.to_string())?
        .clone()
        .ok_or_else(|| "Launcher hub not ready".to_string())?;
    let _ = tx.send(HubCommand::SyncModel);
    Ok("Sync started".to_string())
}

/// Lets the frontend pick up the current status if it missed the live events.
#[tauri::command]
pub fn get_status(state: tauri::State<'_, AppState>) -> Result<EngineStatus, String> {
    state
        .status
        .lock()
        .map(|s| *s)
        .map_err(|e| e.to_string())
}

/// Seeded history for the Activity panel after a frontend reload.
#[tauri::command]
pub fn get_activity(state: tauri::State<'_, AppState>) -> Result<Vec<ActivityEntry>, String> {
    state
        .activity
        .lock()
        .map(|log| log.iter().cloned().collect())
        .map_err(|e| e.to_string())
}

/// Data-driven session config (level name, ports, paths) from shared/config.
#[tauri::command]
pub fn get_config() -> Result<serde_json::Value, String> {
    let path = paths::launcher_config();
    let text = std::fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read launcher config: {}", e))?;
    serde_json::from_str(&text).map_err(|e| format!("Invalid launcher config JSON: {}", e))
}
