use std::path::{Path, PathBuf};

/// Repository root: <repo>/launcher/src-tauri -> <repo>
pub fn repo_root() -> PathBuf {
    let root = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("..").join("..");
    root.canonicalize().unwrap_or(root)
}

pub fn godot_project_dir() -> PathBuf {
    repo_root().join("godot_runtime").join("officegame")
}

pub fn blender_bridge_script() -> PathBuf {
    repo_root()
        .join("blender")
        .join("scripts")
        .join("nexusblend_bridge.py")
}

pub fn submission_glb() -> PathBuf {
    repo_root()
        .join("shared")
        .join("exports")
        .join("submission.glb")
}

/// Where Blender writes exported models (injected into the bridge script).
pub fn shared_exports_dir() -> PathBuf {
    repo_root().join("shared").join("exports")
}

/// The copy Godot's runtime reads from (`res://exports/submission.glb`).
/// The launcher stages the shared export here before telling Godot to reload.
pub fn godot_glb() -> PathBuf {
    godot_project_dir().join("exports").join("submission.glb")
}

pub fn launcher_config() -> PathBuf {
    repo_root().join("shared").join("config").join("launcher.json")
}

pub fn find_executable(name: &str) -> Option<PathBuf> {
    if let Ok(paths) = std::env::var("PATH") {
        for dir in paths.split(':') {
            let candidate = Path::new(dir).join(name);
            if candidate.exists() {
                return Some(candidate);
            }
        }
    }
    None
}

pub fn blender_exe() -> Option<PathBuf> {
    find_executable("blender").or_else(|| {
        ["/usr/bin/blender", "/usr/local/bin/blender", "/opt/blender/blender"]
            .iter()
            .map(PathBuf::from)
            .find(|path| path.exists())
    })
}

pub fn godot_exe() -> Option<PathBuf> {
    find_executable("godot").or_else(|| {
        ["/usr/bin/godot", "/usr/local/bin/godot"]
            .iter()
            .map(PathBuf::from)
            .find(|path| path.exists())
    })
}
