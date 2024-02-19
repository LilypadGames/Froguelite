class_name HUD
extends CanvasLayer

# references
@export_group("References")
@onready var player: Player = $"../Player"
@onready var interact_hint: Label = %InteractHint
@onready var heart_display: HBoxContainer = %HeartDisplay
@export var heart_icon: PackedScene

# internal
var current_interactable: Interactable

func _ready() -> void:
	# init heart display
	update_hearts()

func update_hearts() -> void:
	# reset hearts
	for heart in heart_display.get_children():
		heart_display.remove_child(heart)
		heart.queue_free()

	# create hearts
	for heart_index in range(player.hearts):
		var heart = heart_icon.instantiate()
		heart.name = "Heart_" + str(heart_index)
		heart_display.add_child(heart)

	# update current health
	update_current_health()

func update_current_health() -> void:
	for heart in heart_display.get_children():
		# get heart index
		var index = heart.get_index()

		# set heart fill value
		if player.health > index * 2 + 1:
			(heart as TextureProgressBar).value = 2
		elif player.health > index * 2:
			(heart as TextureProgressBar).value = 1
		else:
			(heart as TextureProgressBar).value = 0

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
