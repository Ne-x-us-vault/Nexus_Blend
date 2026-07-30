use std::path::PathBuf;
use std::sync::Mutex;
use tokio::sync::mpsc;

struct AppState {
    command_tx: Mutex<Option<mpsc::UnboundedSender<String>>>,
}

#[tauri::command]
fn launch_blender() -> Result<String, String> {
    let blender = find_executable("blender");
    match blender {
        Some(path) => {
            std::process::Command::new(path)
                .spawn()
                .map(|_| "Blender launched".to_string())
                .map_err(|e| format!("Failed to launch Blender: {}", e))
        }
        None => Err("Blender executable not found".to_string()),
    }
}

#[tauri::command]
fn launch_game() -> Result<String, String> {
    let godot = find_executable("godot");
    let project_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .and_then(|p| p.parent())
        .map(|p| p.join("godot_runtime").join("officegame"));

    match (godot, project_path) {
        (Some(exe), Some(path)) => {
            let canonical = path.canonicalize().unwrap_or(path);
            std::process::Command::new(exe)
                .arg("--path")
                .arg(canonical)
                .spawn()
                .map(|_| "Game launched".to_string())
                .map_err(|e| format!("Failed to launch Game: {}", e))
        }
        _ => Err("Godot executable not found or project path missing".to_string()),
    }
}

#[tauri::command]
fn sync_model(state: tauri::State<AppState>) -> Result<String, String> {
    let tx_lock = state.command_tx.lock().map_err(|e| e.to_string())?;
    match tx_lock.as_ref() {
        Some(tx) => {
            let model_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
                .parent()
                .and_then(|p| p.parent())
                .map(|p| p.join("shared").join("exports").join("submission.glb"));

            match model_path {
                Some(path) if path.exists() => {
                    let msg = serde_json::json!({
                        "type": "SYNC_MODEL",
                        "file": "submission.glb"
                    })
                    .to_string();
                    tx.send(msg).map_err(|e| e.to_string())?;
                    Ok("Model synced successfully".to_string())
                }
                _ => Err("No submission.glb found in shared/exports".to_string()),
            }
        }
        None => Err("Godot is not connected".to_string()),
    }
}

fn find_executable(name: &str) -> Option<String> {
    // Check PATH
    if let Ok(paths) = std::env::var("PATH") {
        for dir in paths.split(':') {
            let candidate = format!("{}/{}", dir, name);
            if std::path::Path::new(&candidate).exists() {
                return Some(candidate);
            }
        }
    }
    None
}

async fn ws_server(mut rx: mpsc::UnboundedReceiver<String>) {
    use futures_util::{SinkExt, StreamExt};
    use tokio::net::TcpListener;
    use tokio_tungstenite::accept_async;

    let addr = "127.0.0.1:9876";

    let listener = match TcpListener::bind(addr).await {
        Ok(l) => l,
        Err(e) => {
            eprintln!("WebSocket server failed to bind: {}", e);
            return;
        }
    };

    println!("WebSocket server listening on {}", addr);

    loop {
        let (stream, peer) = match listener.accept().await {
            Ok(s) => s,
            Err(e) => {
                eprintln!("Accept failed: {}", e);
                continue;
            }
        };

        println!("Godot connected from {}", peer);

        let ws_stream = match accept_async(stream).await {
            Ok(ws) => ws,
            Err(e) => {
                eprintln!("WebSocket handshake failed: {}", e);
                continue;
            }
        };

        let (mut write, mut read) = ws_stream.split();

        loop {
            tokio::select! {
                msg = rx.recv() => {
                    match msg {
                        Some(text) => {
                            if write.send(tokio_tungstenite::tungstenite::Message::Text(text.into())).await.is_err() {
                                eprintln!("Godot disconnected");
                                break;
                            }
                        }
                        None => break,
                    }
                }
                msg = read.next() => {
                    match msg {
                        Some(Ok(_)) => {}
                        _ => {
                            println!("Godot disconnected");
                            break;
                        }
                    }
                }
            }
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let (tx, rx) = mpsc::unbounded_channel::<String>();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState {
            command_tx: Mutex::new(Some(tx)),
        })
        .setup(|_app| {
            tauri::async_runtime::spawn(ws_server(rx));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![launch_blender, launch_game, sync_model])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
