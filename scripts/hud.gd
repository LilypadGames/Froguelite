class_name HUD
extends CanvasLayer

# references
@export_group("References")
@onready var interact_hint: Label = $InteractHint

# internal
var current_interactable: Interactable

# update interact hint
func update_interact_hint(interactable_reference: Interactable, text: String) -> void:
	# update current interactable
	current_interactable = interactable_reference

	# update hint
	interact_hint.text = text

	# show hint
	interact_hint.visible = true

# end interact hint
func end_interact_hint() -> void:
	# remove current interactable
	current_interactable = null

	# hide hint
	interact_hint.visible = false
