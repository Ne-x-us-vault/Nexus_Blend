extends Node3D

var desk_loaded = false
const DESK_PATH = "res://exports/desk.glb"

func _ready():
	$Timer.timeout.connect(_check_for_desk)

func _check_for_desk():
	if desk_loaded:
		return
	if not FileAccess.file_exists(DESK_PATH):
		return

	var gltf_doc = GLTFDocument.new()
	var gltf_state = GLTFState.new()
	var error = gltf_doc.append_from_file(DESK_PATH, gltf_state)

	if error == OK:
		var desk_scene = gltf_doc.generate_scene(gltf_state)
		add_child(desk_scene)
		desk_scene.global_transform = $DeskSpot.global_transform
		desk_loaded = true
		print("Desk loaded successfully!")
		print("Desk position: ", desk_scene.global_transform.origin)
		print("Desk scale: ", desk_scene.scale)
		print("Desk child count: ", desk_scene.get_child_count())
		print("DeskSpot position: ", $DeskSpot.global_transform.origin)
	else:
		print("Failed to load desk, will retry: ", error)
