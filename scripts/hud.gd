class_name HUD
extends Control

# references
@export_group("References")
@onready var player: Player = %Player
@onready var interact_hint: Label = $InteractHint

# internal
var current_interactable: String

# update interact hint
func update_interact_hint(id: String, text: String) -> void:
	# update current interactable
	current_interactable = id

	# update hint
	interact_hint.text = text

	# show hint
	interact_hint.visible = true

# end interact hint
func end_interact_hint() -> void:
	# remove current interactable
	current_interactable = ""

	# hide hint
	interact_hint.visible = false
