class_name Teleporter
extends Interactable

# hints
func start_interact_hint() -> void:
	hud.update_interact_hint(id, Cache.lang["en_us"]["hud"]["hint"]["teleporter"] + " " + Cache.lang["en_us"]["interactables"]["teleporters"][id])
