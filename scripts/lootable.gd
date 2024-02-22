class_name Lootable
extends Interactable

# properties
var sounds: Dictionary
var loot: String

# init properties
func setup(new_id: String, hud_reference: HUD) -> Lootable:
	# save ID
	id = new_id

	# save hud reference
	hud = hud_reference

	# get type
	type = Cache.data["lootables"][id]["type"]

	# get texture
	texture = Cache.data["interactables"][type]["texture"]

	# get sounds
	sounds = Cache.data["interactables"][type]["sounds"]

	# get properties
	loot = Cache.data["lootables"][id]["loot"]

	return self

# hints
func start_interact_hint() -> void:
	hud.update_interact_hint(self, Cache.lang["en_us"]["hud"]["hint"]["lootable"] + " " + Cache.lang["en_us"]["interactables"]["lootables"][id])
