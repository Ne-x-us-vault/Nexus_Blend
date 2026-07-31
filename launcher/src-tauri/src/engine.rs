use std::process::{Child, Command};
use std::sync::{Arc, Mutex};
use std::time::Duration;

use tauri::AppHandle;
use tokio::sync::mpsc;

use crate::paths;
use crate::state::{emit_activity, AppState, ClientKind, HubCommand};

/// Launch Blender with the NexusBlend bridge script so the launcher can
/// drive automatic exports. No-op if the bridge is already connected.
pub fn launch_blender(state: &AppState, app: &AppHandle) -> Result<String, String> {
    if state.status.lock().map(|s| s.blender).unwrap_or(false) {
        return Ok("Blender is already running".to_string());
    }

    let exe = paths::blender_exe().ok_or_else(|| "Blender executable not found".to_string())?;
    let bridge = paths::blender_bridge_script();
    if !bridge.exists() {
        return Err(format!(
            "Blender bridge script missing: {}",
            bridge.display()
        ));
    }

    emit_activity(app, "Launching Blender...", "info");
    let mut command = Command::new(&exe);
    command
        .arg("--python")
        .arg(&bridge)
        .env("NEXUSBLEND_EXPORTS_DIR", paths::shared_exports_dir());
    let child = command
        .spawn()
        .map_err(|e| format!("Failed to launch Blender: {}", e))?;

    watch_process(
        app.clone(),
        state.hub_tx.clone(),
        child,
        "Blender",
        ClientKind::Blender,
    );
    Ok("Blender launched".to_string())
}

/// Launch the Godot runtime pointing at the officegame project.
/// No-op if the runtime is already connected.
pub fn launch_game(state: &AppState, app: &AppHandle) -> Result<String, String> {
    if state.status.lock().map(|s| s.game).unwrap_or(false) {
        return Ok("Game is already running".to_string());
    }

    let exe = paths::godot_exe().ok_or_else(|| "Godot executable not found".to_string())?;
    let project = paths::godot_project_dir();
    let canonical = project.canonicalize().unwrap_or(project);
    if !canonical.join("project.godot").exists() {
        return Err(format!(
            "Godot project not found at {}",
            canonical.display()
        ));
    }

    emit_activity(app, "Launching Game...", "info");
    let mut command = Command::new(&exe);
    command.arg("--path").arg(&canonical);
    let child = command
        .spawn()
        .map_err(|e| format!("Failed to launch Game: {}", e))?;

    watch_process(
        app.clone(),
        state.hub_tx.clone(),
        child,
        "Game",
        ClientKind::Godot,
    );
    Ok("Game launched".to_string())
}

/// Notify the Hub that an engine was launched (for connect timeouts) and
/// watch the child process so closures appear in the Activity panel.
fn watch_process(
    app: AppHandle,
    hub_tx: Arc<Mutex<Option<mpsc::UnboundedSender<HubCommand>>>>,
    child: Child,
    label: &'static str,
    kind: ClientKind,
) {
    if let Some(tx) = hub_tx.lock().ok().and_then(|guard| guard.clone()) {
        let _ = tx.send(HubCommand::EngineLaunched { kind });
    }

    tauri::async_runtime::spawn(async move {
        let mut child = child;
        loop {
            tokio::time::sleep(Duration::from_millis(750)).await;
            match child.try_wait() {
                Ok(Some(_)) => {
                    emit_activity(&app, format!("{} closed", label), "info");
                    return;
                }
                Ok(None) => {}
                Err(_) => return,
            }
        }
    });
}
