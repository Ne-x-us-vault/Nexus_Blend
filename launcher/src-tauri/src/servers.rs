use std::sync::atomic::{AtomicU64, Ordering};

use futures_util::stream::{SplitSink, SplitStream};
use futures_util::{SinkExt, StreamExt};
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::mpsc;
use tokio_tungstenite::accept_async;
use tokio_tungstenite::tungstenite::Message;
use tokio_tungstenite::WebSocketStream;

use crate::state::{ClientKind, HubCommand};

static NEXT_ID: AtomicU64 = AtomicU64::new(1);

fn next_id() -> u64 {
    NEXT_ID.fetch_add(1, Ordering::Relaxed)
}

type WsStream = WebSocketStream<TcpStream>;

/// WebSocket server for the Godot runtime (existing protocol: SYNC_MODEL).
/// Each connection is reported to the Hub, which owns the real logic.
pub async fn run_godot_server(hub: mpsc::UnboundedSender<HubCommand>) {
    const ADDR: &str = "127.0.0.1:9876";
    let listener = match TcpListener::bind(ADDR).await {
        Ok(listener) => listener,
        Err(e) => {
            eprintln!("NexusBlend WebSocket server failed to bind {}: {}", ADDR, e);
            return;
        }
    };
    println!("NexusBlend WebSocket server listening on {}", ADDR);

    loop {
        let (stream, peer) = match listener.accept().await {
            Ok(accepted) => accepted,
            Err(e) => {
                eprintln!("NexusBlend accept failed: {}", e);
                continue;
            }
        };
        println!("Godot connected from {}", peer);

        let ws = match accept_async(stream).await {
            Ok(ws) => ws,
            Err(e) => {
                eprintln!("NexusBlend WebSocket handshake failed: {}", e);
                continue;
            }
        };

        let (write, read) = ws.split();
        let (out_tx, out_rx) = mpsc::unbounded_channel::<String>();
        let id = next_id();
        let _ = hub.send(HubCommand::ClientConnected {
            id,
            kind: ClientKind::Godot,
            out_tx,
        });

        let hub = hub.clone();
        tauri::async_runtime::spawn(async move {
            run_ws_connection(id, hub, write, read, out_rx).await;
        });
    }
}

async fn run_ws_connection(
    id: u64,
    hub: mpsc::UnboundedSender<HubCommand>,
    mut write: SplitSink<WsStream, Message>,
    mut read: SplitStream<WsStream>,
    mut out_rx: mpsc::UnboundedReceiver<String>,
) {
    loop {
        tokio::select! {
            msg = out_rx.recv() => {
                match msg {
                    Some(text) => {
                        if write.send(Message::Text(text.into())).await.is_err() {
                            break;
                        }
                    }
                    None => break,
                }
            }
            msg = read.next() => {
                match msg {
                    Some(Ok(Message::Text(text))) => {
                        let _ = hub.send(HubCommand::Incoming {
                            kind: ClientKind::Godot,
                            text: text.to_string(),
                        });
                    }
                    Some(Ok(Message::Ping(ping))) => {
                        let _ = write.send(Message::Pong(ping)).await;
                    }
                    Some(Ok(Message::Close(_))) | None => break,
                    _ => {}
                }
            }
        }
    }
    let _ = hub.send(HubCommand::ClientDisconnected {
        id,
        kind: ClientKind::Godot,
    });
}

/// TCP server for the Blender bridge script (line-delimited JSON on :9877).
pub async fn run_blender_server(hub: mpsc::UnboundedSender<HubCommand>) {
    const ADDR: &str = "127.0.0.1:9877";
    let listener = match TcpListener::bind(ADDR).await {
        Ok(listener) => listener,
        Err(e) => {
            eprintln!("NexusBlend bridge server failed to bind {}: {}", ADDR, e);
            return;
        }
    };
    println!("NexusBlend bridge server listening on {}", ADDR);

    loop {
        let (stream, peer) = match listener.accept().await {
            Ok(accepted) => accepted,
            Err(e) => {
                eprintln!("NexusBlend bridge accept failed: {}", e);
                continue;
            }
        };
        println!("Blender connected from {}", peer);

        let (out_tx, out_rx) = mpsc::unbounded_channel::<String>();
        let id = next_id();
        let _ = hub.send(HubCommand::ClientConnected {
            id,
            kind: ClientKind::Blender,
            out_tx,
        });

        let hub = hub.clone();
        tauri::async_runtime::spawn(async move {
            run_tcp_connection(id, hub, stream, out_rx).await;
        });
    }
}

async fn run_tcp_connection(
    id: u64,
    hub: mpsc::UnboundedSender<HubCommand>,
    stream: TcpStream,
    mut out_rx: mpsc::UnboundedReceiver<String>,
) {
    let (read, mut write) = stream.into_split();
    let mut reader = BufReader::new(read);
    let mut line = String::new();

    loop {
        tokio::select! {
            msg = out_rx.recv() => {
                match msg {
                    Some(text) => {
                        let framed = format!("{}\n", text);
                        if write.write_all(framed.as_bytes()).await.is_err() {
                            break;
                        }
                        if write.flush().await.is_err() {
                            break;
                        }
                    }
                    None => break,
                }
            }
            result = reader.read_line(&mut line) => {
                match result {
                    Ok(0) => break,
                    Ok(_) => {
                        let raw = std::mem::take(&mut line);
                        let trimmed = raw.trim().to_string();
                        if !trimmed.is_empty() {
                            let _ = hub.send(HubCommand::Incoming {
                                kind: ClientKind::Blender,
                                text: trimmed,
                            });
                        }
                    }
                    Err(_) => break,
                }
            }
        }
    }

    let _ = hub.send(HubCommand::ClientDisconnected {
        id,
        kind: ClientKind::Blender,
    });
}
