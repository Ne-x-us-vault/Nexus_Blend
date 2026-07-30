# Nexus Axis 🎮🧊
### Learn 3D Modeling the Gamified Way

> Model it in Blender. Watch it appear live in the game. Complete the task. Level up.

---

## 📌 Problem Statement

Learning 3D modeling today is largely passive — tutorials and static exercises fail to sustain engagement or connect skills to tangible outcomes, leading to high dropout among beginners. There is no platform that ties hands-on 3D modeling practice directly to real-time, rewarding feedback.

## 💡 Solution

This project closes that gap with a gamified (game-based + AI-assisted) learning experience, where users create 3D models and see them appear instantly inside a live game, completing tasks that reinforce their learning.

The implementation connects 3D modeling software to a live, playable game built on Godot. Users model an object per the level's requirement (e.g., a table for a meeting room). The game runs as a floating window, staying playable throughout, with an empty `Node3D` placeholder marking where the object belongs. Once saved and verified, Godot's asset-watcher re-imports and hot-swaps the mesh into the scene — fulfilling *"I made something"* and *"I can see it working."*

The user then completes a short in-game task using their model, via `Area3D` zones and Godot's signal system. A companion window, built with React and Tauri, hosts a chatbot for guidance, suggestions, and real-time review (using logs, API, and computer vision), connected via a local WebSocket channel and backed by SQLite/JSON. Each task advances the learner to the next object/level, building skills through gamified progression, not static tutorials.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| 3D Modeling | **Blender** | Where the user creates the object for each level |
| Game Engine | **Godot** | Runs the floating, playable FPP game environment |
| Game Scripting | **GDScript** | Handles placeholder swap logic, interaction, and level events |
| Sync Mechanism | **Godot's native `.blend` asset-watcher** | Live hot-reload of the model into the running game — no manual export step |
| Companion App Shell | **Tauri** | Lightweight native window for the dashboard/chatbot (smaller & faster than Electron) |
| Companion UI | **React** | Chatbot interface, guidance, hints, progress tracking |
| Communication | **WebSocket** | Local channel exchanging structured JSON events between Godot and the Tauri/React app |
| Data Storage | **SQLite / JSON** | Local-first storage for progress, settings, and chat history |
| Chatbot Intelligence | **LLM-based chatbot (e.g. Claude API)** | Natural-language guidance, hints, and real-time review |

---

## 🔄 How It Works

1. **Game loads** — an FPP scene is already playable, with an empty slot (`Node3D`) marking a missing object.
2. **User opens Blender** and models the required object for the level (e.g., a table).
3. **Save & verify** — once the model is saved/exported and verified, Godot's asset-watcher detects the change.
4. **Live swap** — the mesh is hot-swapped into the scene at runtime, filling the empty slot — no restart, no manual import.
5. **In-game task** — the user completes a short task using the object they built (e.g., placing a vase on the table), validated via `Area3D` zones and signals.
6. **Level complete** — the system advances to the next object/level, and the loop repeats.
7. **Companion window** — throughout, a separate React + Tauri window with a chatbot offers guidance, hints, and tracks progress, communicating with the game over a local WebSocket.

```
Blender (model) → Godot asset-watcher (live re-import) → Game scene (hot-swap)
        ↕                                                        ↕
   Companion App (React + Tauri) ←──── WebSocket (JSON) ────→ Godot Runtime
        ↕
   Chatbot (guidance, hints, review) + SQLite/JSON (progress storage)
```

---

## ✨ Key Features

- 🎯 **Live sync** — no export/import friction between modeling and gameplay
- 🕹️ **Always playable** — the game stays interactive even while an object is missing
- 🤖 **AI-assisted guidance** — chatbot offers hints, suggestions, and real-time review
- 📈 **Progressive levels** — each completed task unlocks the next modeling challenge
- 💻 **Local-first** — no cloud dependency; everything runs on the user's machine

---

## 🚀 Getting Started

> *(Fill in once implementation begins)*

```bash
# Clone the repository
git clone <repo-url>

# Godot game
cd game/
# Open project.godot in Godot Engine

# Companion app
cd companion-app/
npm install
npm run tauri dev
```

---

## 🧩 Roadmap

- [x] Basic FPP player controller in Godot
- [x] Placeholder-to-mesh hot-swap logic
- [.] Area3D task validation (pick up / place object)
- [x] React + Tauri companion window shell
- [x] WebSocket bridge between Godot and companion app
- [ ] Chatbot integration for guidance and review
- [ ] Local progress persistence (SQLite/JSON)
- [ ] Multi-level progression system

---

## 👥 Team

**Team Name:** Nexus Axis

---

## 📄 License

*(Add your chosen license here, e.g. MIT)*
