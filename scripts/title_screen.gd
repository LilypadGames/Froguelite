extends CanvasLayer

# references
@export var level: PackedScene

# detect any input
func _input(event):
	if event.is_pressed():
		# start game
		get_tree().change_scene_to_packed(level)
