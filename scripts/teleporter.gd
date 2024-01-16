class_name Teleporter
extends Interactable

# properties
var destination: String

# init properties
func setup(new_id: String, hud_reference: HUD) -> Teleporter:
	# save ID
	id = new_id

	# save hud reference
	hud = hud_reference

	# get type
	type = Cache.data["teleporters"][id]["type"]

	# get texture
	texture = Cache.data["interactables"][type]["texture"]

	# get properties
	destination = Cache.data["teleporters"][id]["destination"]

	return self

# methods
func interact() -> void:
	# save next level to temp cache
	Cache.temp["next_level_path"] = Cache.registry["world"]["level"][destination]["file"]

	# change scene to destination level
	get_tree().change_scene_to_packed(load("res://scenes/level.tscn"))

# hints
func start_interact_hint() -> void:
	hud.update_interact_hint(self, Cache.lang["en_us"]["hud"]["hint"]["teleporter"] + " " + Cache.lang["en_us"]["interactables"]["teleporters"][id])
