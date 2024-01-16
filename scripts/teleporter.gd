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

# hints
func start_interact_hint() -> void:
	hud.update_interact_hint(id, Cache.lang["en_us"]["hud"]["hint"]["teleporter"] + " " + Cache.lang["en_us"]["interactables"]["teleporters"][id])
