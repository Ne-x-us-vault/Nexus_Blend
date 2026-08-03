# Nexus Axis 🎮🧊
### Learn 3D Modeling the Gamified Way

> Model it in Blender. Watch it appear live in the game. Complete the task. Level up.

---

## 📌 Problem Statement

Learning 3D modeling today is largely passive — tutorials and static exercises fail to sustain engagement or connect skills to tangible outcomes, leading to high dropout among beginners. There is no platform that ties hands-on 3D modeling practice directly to real-time, rewarding feedback.

## 💡 Solution

This project closes that gap with a gamified (game-based + AI-assisted) learning experience, where users create 3D models and see them appear instantly inside a live game, completing tasks that reinforce their learning.

The implementation connects Blender to a live, playable game built on Godot. Users model an object per the level's requirement (e.g., a desk for an office). The game runs as a floating window, staying playable throughout, with an empty slot where the object belongs. A **launcher** (Tauri + React) orchestrates the whole flow: it launches both engines, drives Blender's export via a bridge script, stages the `.glb`, and tells Godot to hot-swap the mesh into the scene at runtime — no manual export step, no restart. Godot confirms when the model loads, and the launcher reports progress live in the UI.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| 3D Modeling | **Blender** | Where the user creates the object for each level |
| Game Engine | **Godot 4.4** | Runs the floating, playable FPP game environment |
| Game Scripting | **GDScript** | Handles model hot-swap logic and WebSocket sync to the launcher |
| Blender Bridge | **Python (bpy)** | Runs inside Blender via `--python`; exports the scene to GLB on command |
| Orchestration | **Rust (Tauri v2)** | Launcher backend: engine launch, WebSocket/TCP servers, sync state machine (Hub) |
| Companion UI | **React + TypeScript + Vite** | Dashboard: status, activity feed, level detail, live sync progress |
| Communication | **WebSocket (`:9876`) / TCP (`:9877`)** | Godot ↔ launcher ↔ Blender exchange structured JSON events |
| Level Data | **TypeScript + JSON config** | Data-driven levels (objectives, constraints) and launcher config |
| Chatbot Intelligence | **LLM-based chatbot (planned)** | Natural-language guidance, hints, and real-time review |

---

## 🏗️ Project Layout

```
NexusBlend/
├── blender/
│   └── scripts/nexusblend_bridge.py   # Blender bridge (TCP :9877, GLB export)
├── godot_runtime/
│   └── officegame/                    # Godot project (FPP game, Level 1 scene)
│       ├── project.godot
│       ├── level_1.tscn               # Office room + empty model slot
│       ├── level_1.gd                 # WebSocket sync + GLB hot-swap
│       └── body.gd                    # First-person controller
├── launcher/                          # Tauri v2 + React companion app
│   ├── src/                           # React frontend (pages, components, hooks)
│   └── src-tauri/src/                 # Rust backend (hub, servers, engine, commands)
└── shared/
    ├── config/launcher.json           # Session config (level, ports, paths)
    └── exports/submission.glb         # Staged Blender export
```

---

## 🔄 How It Works

1. **Start a level** — the launcher launches Blender (with the bridge script) and the Godot game with one click.
2. **Game loads** — an FPP office scene is already playable, with an empty slot marking the missing object.
3. **User models in Blender** — e.g., a desk from primitives, per the level's objectives.
4. **Sync to game** — the launcher asks Blender's bridge to export the scene to GLB (`EXPORT_SCENE`), stages it, then sends `SYNC_MODEL` to Godot over WebSocket.
5. **Live swap** — Godot loads the new GLB, auto-generates collisions, and drops the mesh into the empty slot — no restart, no manual import. It replies `MODEL_LOADED` and the UI shows **Synced** + a success overlay.
6. **Repeat / level up** — the loop repeats for the next object; each level is meant to advance the learner through gamified progression.

```
Blender (bridge :9877) ──export──▶ shared/exports/submission.glb
        ▲                                   │ staged
        │  EXPORT_SCENE                     ▼
   Launcher (Hub) ◀─────────────────▶ godot_runtime/exports/submission.glb
        │                                   │ SYNC_MODEL (:9876)
        └──── status / activity events ────▶ Godot runtime ── MODEL_LOADED ──▶
```

---

## ✨ Key Features

- 🎯 **One-click workspace** — start Blender + Godot together from the launcher
- 🔄 **Live sync** — no export/import friction; Blender exports to GLB and the game hot-swaps it in
- 🕹️ **Always playable** — the FPP game stays interactive even while an object is missing
- 📊 **Live status & activity feed** — engine connections, sync phases, and errors stream into the UI
- 🧠 **Hub-based orchestration** — a single Rust actor owns every engine connection and the sync state machine (with fallback/error handling and connect timeouts)
- 📈 **Data-driven levels** — objectives, requirements, and constraints defined per level; 3 level workspaces (Office desk, Kitchen chair, Workshop toolbox)
- 🤖 **AI-assisted guidance (planned)** — chatbot hints, suggestions, and real-time review
- 💻 **Local-first** — no cloud dependency; everything runs on the user's machine

---

## ✅ What Is Completed

- **Godot FPP game runtime** — office room scene with floor/walls/ceiling/lighting, WASD + mouse-look controller (`body.gd`), always-on-top window.
- **GLB hot-swap** — `level_1.gd` loads `submission.glb` via `GLTFDocument`, spawns it at the model marker, and auto-creates trimesh collisions; clears and reloads on each sync.
- **WebSocket sync to the launcher** — Godot connects to `127.0.0.1:9876`, handles `SYNC_MODEL`, replies `MODEL_LOADED`.
- **Blender bridge** — `nexusblend_bridge.py` runs inside Blender, auto-enables the glTF addon, connects to the launcher's TCP bridge (`:9877`), and exports the scene to `shared/exports` on `EXPORT_SCENE`.
- **Tauri launcher backend (Rust)** — WebSocket + TCP servers, the Hub actor (sync state machine with `Export → Sync → Synced`, error/fallback paths, engine connect timeouts), engine launchers with process watching, and config/paths resolution.
- **React launcher frontend** — Home (status cards, course progress), Levels, Level Detail (objectives/requirements/constraints), Workspace (live session, sync progress, activity feed), Progress, Settings; success overlay on sync; live status/sync/activity events via Tauri.
- **End-to-end sync pipeline** — Blender export → staging → Godot hot-swap → "Model Synced" confirmation, all wired through the launcher.

## 🔜 Not Yet Implemented

- **AI chatbot & live review** — UI placeholders exist (`AI evaluation coming soon`); no LLM integration yet.
- **In-game task validation** — `Area3D` zones / signal-based pick-up-and-place validation are not in the scene yet.
- **Progress persistence** — status and activity are in-memory only; no SQLite/JSON storage yet.
- **Multi-level progression** — level 2/3 are defined but locked statically; completion isn't tracked or used to unlock levels.
- **Reference images & detailed analytics** — placeholders only.

---

## 🚀 Getting Started

### Prerequisites

- **Blender 3.6+** (with the bundled glTF 2.0 addon)
- **Godot Engine 4.4+** (Compatibility / GL renderer)
- **Rust** toolchain, **Node.js** + npm (for the launcher)

### Run the launcher

```bash
# 1. Rust backend
cd launcher/src-tauri
cargo build

# 2. Frontend dev server (from launcher/)
cd ..
npm install
npm run tauri dev
```

### Run engines standalone (optional)

```bash
# Godot game
godot --path godot_runtime/officegame --rendering-method gl_compatibility

# Blender with the bridge (launcher injects the exports dir automatically)
blender --python blender/scripts/nexusblend_bridge.py
```

Once running, open a level in the launcher, model the object in Blender, and hit **Sync To Game** — the mesh appears in the running game.

---

## 🧩 Roadmap

- [x] Godot FPP game runtime (office scene + player controller)
- [x] Placeholder-to-mesh hot-swap (GLTF load + auto collisions)
- [x] Blender bridge script for one-click GLB export
- [x] Tauri + React launcher shell (dashboard, status, activity feed)
- [x] WebSocket/TCP bridge between Godot, Blender, and the launcher
- [x] Hub sync state machine + end-to-end sync pipeline
- [ ] In-game task validation via `Area3D` zones and signals
- [ ] AI chatbot integration for guidance and review
- [ ] Local progress persistence (SQLite/JSON)
- [ ] Multi-level progression system with unlocked level tracking

---

## 👥 Team

**Team Name:** Nexus Axis

---

## 📄 License

*(Add your chosen license here, e.g. MIT)*
