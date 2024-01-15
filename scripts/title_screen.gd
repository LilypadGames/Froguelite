extends CanvasLayer

# references
@export_category("References")
@onready var title: Label = %Title
@onready var hint: Label = %Hint
@export var level: PackedScene

# set up labels
func _ready() -> void:
	# title
	title.text = Cache.lang["en_us"]["game_title"]

	# hint
	hint.text = Cache.lang["en_us"]["opening_hint"]

# detect any input
func _input(event) -> void:
	if event.is_pressed():
		# start game
		get_tree().change_scene_to_packed(level)
