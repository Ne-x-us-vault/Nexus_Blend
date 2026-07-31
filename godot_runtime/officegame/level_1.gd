extends Node3D

const WS_URL = "ws://127.0.0.1:9876"
const DEFAULT_MODEL = "submission.glb"

var model_path = "res://exports/" + DEFAULT_MODEL
var current_model = null
var ws = WebSocketPeer.new()
var ws_connected = false


func _ready():
	print("========== NexusBlend Runtime ==========")
	print("Runtime Started")
	DisplayServer.window_set_flag(DisplayServer.WINDOW_FLAG_ALWAYS_ON_TOP, true)
	load_submission()
	connect_to_launcher()


func _process(delta):
	poll_websocket()


# ---------------------------------------------------
# WebSocket connection to NexusBlend Launcher
# ---------------------------------------------------
func connect_to_launcher():
	var err = ws.connect_to_url(WS_URL)
	if err != OK:
		print("WebSocket: failed to connect to launcher")
	else:
		print("WebSocket: connecting to launcher...")

func poll_websocket():
	ws.poll()
	var state = ws.get_ready_state()

	if state == WebSocketPeer.STATE_OPEN:
		if not ws_connected:
			ws_connected = true
			print("WebSocket: connected to launcher")

		while ws.get_available_packet_count() > 0:
			var packet = ws.get_packet()
			var msg = packet.get_string_from_utf8()
			handle_message(msg)

	elif state == WebSocketPeer.STATE_CLOSED:
		if ws_connected:
			ws_connected = false
			print("WebSocket: disconnected from launcher")

func send_to_launcher(payload: Dictionary):
	if ws.get_ready_state() == WebSocketPeer.STATE_OPEN:
		ws.put_packet(JSON.stringify(payload).to_utf8_buffer())

func handle_message(msg: String):
	var json = JSON.parse_string(msg)
	if json is Dictionary and json.has("type"):
		match json["type"]:
			"SYNC_MODEL":
				print("WebSocket: received SYNC_MODEL")
				var file = json.get("file", DEFAULT_MODEL)
				model_path = "res://exports/" + file
				reload_submission()


# ---------------------------------------------------
# Loads the user's current Blender submission
# ---------------------------------------------------
func load_submission() -> bool:

	if !FileAccess.file_exists(model_path):
		print("No " + model_path + " found.")
		return false

	var gltf_doc = GLTFDocument.new()
	var gltf_state = GLTFState.new()

	var error = gltf_doc.append_from_file(model_path, gltf_state)

	if error != OK:
		print("Failed to load submission.")
		return false

	current_model = gltf_doc.generate_scene(gltf_state)

	$ImportedModel.add_child(current_model)

	current_model.global_transform = $ModelSpawn.global_transform

	_create_collision(current_model)

	print("--------------------------------")
	print("Submission Loaded Successfully")
	print("--------------------------------")
	return true


# ---------------------------------------------------
# Removes the current imported model
# ---------------------------------------------------
func clear_submission():

	for child in $ImportedModel.get_children():
		child.queue_free()

	current_model = null

	print("Submission Cleared")


# ---------------------------------------------------
# Reloads the latest exported model and reports back
# to the launcher so the UI can show "Synced".
# ---------------------------------------------------
func reload_submission():

	print("Reloading Submission...")

	clear_submission()

	var ok = load_submission()

	send_to_launcher({
		"type": "MODEL_LOADED",
		"ok": ok,
		"message": "" if ok else "Failed to load model: " + model_path,
	})


# ---------------------------------------------------
# Automatically creates collisions
# ---------------------------------------------------
func _create_collision(node):

	for child in node.get_children():
		_create_collision(child)

	if node is MeshInstance3D and node.mesh:
		node.create_trimesh_collision()
