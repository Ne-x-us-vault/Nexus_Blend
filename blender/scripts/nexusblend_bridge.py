"""NexusBlend Blender Bridge.

Runs inside Blender (launched by the launcher via `--python`). It connects
to the launcher's bridge server over TCP and listens for line-delimited JSON
commands. Supported commands:

    {"type": "EXPORT_SCENE", "file": "submission.glb"}

Which exports the current Blender scene straight to
`<shared>/exports/<file>` with no dialogs, no manual naming, no manual
folder selection. Every message flows through the launcher.

The launcher injects the export directory through the environment variable
NEXUSBLEND_EXPORTS_DIR so the bridge never guesses paths.
"""

import json
import os
import socket

import bpy

# ---------------------------------------------------------------------------
# Configuration (injected by the launcher)
# ---------------------------------------------------------------------------
BRIDGE_HOST = os.environ.get("NEXUSBLEND_BRIDGE_HOST", "127.0.0.1")
BRIDGE_PORT = int(os.environ.get("NEXUSBLEND_BRIDGE_PORT", "9877"))
EXPORTS_DIR = os.environ.get("NEXUSBLEND_EXPORTS_DIR", "")

_RECONNECT_DELAY = 1.0
_POLL_INTERVAL = 0.05

_socket = None
_buffer = b""


# ---------------------------------------------------------------------------
# Networking
# ---------------------------------------------------------------------------
def try_connect():
    """Try to open the TCP connection to the launcher. Never blocks the UI."""
    global _socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(0.5)
    try:
        sock.connect((BRIDGE_HOST, BRIDGE_PORT))
    except OSError:
        try:
            sock.close()
        except OSError:
            pass
        _socket = None
        return
    sock.setblocking(False)
    _socket = sock
    print("[NexusBlend] Bridge connected to launcher")
    send_message({"type": "BRIDGE_READY"})


def reconnect():
    global _socket
    if _socket is not None:
        try:
            _socket.close()
        except OSError:
            pass
    _socket = None
    try_connect()
    return _RECONNECT_DELAY


def send_message(payload):
    if _socket is None:
        return
    try:
        _socket.sendall((json.dumps(payload) + "\n").encode("utf-8"))
    except (OSError, BlockingIOError):
        pass


def send_export_done(ok, message):
    send_message({"type": "EXPORT_DONE", "ok": ok, "message": message})


# ---------------------------------------------------------------------------
# Command handling
# ---------------------------------------------------------------------------
def handle_message(msg):
    if not isinstance(msg, dict):
        return
    msg_type = msg.get("type")
    if msg_type == "EXPORT_SCENE":
        file_name = msg.get("file", "submission.glb")
        export_scene(file_name)
    elif msg_type == "PING":
        send_message({"type": "PONG"})


def export_scene(file_name):
    if not EXPORTS_DIR:
        send_export_done(False, "NEXUSBLEND_EXPORTS_DIR is not set")
        return
    target = os.path.join(EXPORTS_DIR, file_name)
    try:
        _ensure_gltf_addon()
        operator = _gltf_exporter()
        operator(filepath=target, check_existing=False, use_selection=False, export_format="GLB")
        send_export_done(True, "Exported " + target)
    except Exception as error:
        send_export_done(False, str(error))


def _ensure_gltf_addon():
    """Enable the bundled glTF 2.0 exporter addon if it is not active."""
    if not _gltf_exporter():
        bpy.ops.preferences.addon_enable(module="io_scene_gltf2")


def _gltf_exporter():
    if hasattr(bpy.ops.export_scene, "gltf"):
        return bpy.ops.export_scene.gltf
    if hasattr(bpy.ops.wm, "gltf_export"):
        return bpy.ops.wm.gltf_export
    return None


# ---------------------------------------------------------------------------
# Blender timer loop (runs on the main thread, never blocks the UI)
# ---------------------------------------------------------------------------
def poll_bridge():
    global _buffer
    if _socket is None:
        try_connect()
        return _POLL_INTERVAL

    try:
        data = _socket.recv(65536)
    except BlockingIOError:
        return _POLL_INTERVAL
    except OSError:
        return reconnect()

    if data:
        _buffer += data
        while b"\n" in _buffer:
            raw, _buffer = _buffer.split(b"\n", 1)
            raw = raw.strip()
            if not raw:
                continue
            try:
                handle_message(json.loads(raw.decode("utf-8")))
            except (ValueError, UnicodeDecodeError):
                continue
        return _POLL_INTERVAL

    return reconnect()


def register_bridge():
    _ensure_gltf_addon()
    try_connect()
    bpy.app.timers.register(poll_bridge)


register_bridge()
