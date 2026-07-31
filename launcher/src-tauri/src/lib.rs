mod commands;
mod engine;
mod hub;
mod paths;
mod servers;
mod state;

use std::sync::{Arc, Mutex};
use std::collections::VecDeque;

use tokio::sync::mpsc;

use crate::state::{AppState, EngineStatus, HubCommand};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let (hub_tx, hub_rx) = mpsc::unbounded_channel::<HubCommand>();
    let status = Arc::new(Mutex::new(EngineStatus::default()));
    let activity = Arc::new(Mutex::new(VecDeque::new()));

    let app_state = AppState {
        hub_tx: Arc::new(Mutex::new(Some(hub_tx.clone()))),
        status: status.clone(),
        activity: activity.clone(),
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(app_state)
        .setup(move |app| {
            crate::state::emit_activity(app.handle(), "NexusBlend Launcher Ready", "info");

            let handle = app.handle().clone();
            tauri::async_runtime::spawn(servers::run_godot_server(hub_tx.clone()));
            tauri::async_runtime::spawn(servers::run_blender_server(hub_tx.clone()));
            hub::Hub::spawn(handle, status, hub_rx);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::start_learning,
            commands::launch_blender,
            commands::launch_game,
            commands::sync_model,
            commands::get_status,
            commands::get_activity,
            commands::get_config
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
