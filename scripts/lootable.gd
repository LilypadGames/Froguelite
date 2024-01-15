class_name Lootable
extends Interactable

# hints
func start_interact_hint() -> void:
	hud.update_interact_hint(id, Cache.lang["en_us"]["hud"]["hint"]["lootable"] + " " + Cache.lang["en_us"]["interactables"]["lootables"][id])
