class_name Player
extends CharacterBody2D

# constants
const MOUSE_DOWN_TURN_THRESHOLD := 10

# properties
@export_category("Properties")
@export var movement_speed: float = 5000

# references
@export_category("References")
@onready var sprite_group: CanvasGroup = %Sprites
@onready var anim_player: AnimationPlayer = %AnimationPlayer
@onready var character_texture: String = Cache.data["player"]["texture"]
var hud: HUD

# internal
var sprites: Array[AnimatedSprite2D]

# internal
var input_vector: Vector2 = Vector2.ZERO
var movement_scale: float = 1.0
var direction: String = "right"
var input_direction: String
var mouse_down_direction: String

func _ready() -> void:
	# create sprites
	sprites.push_back(Utility.create_sprite(character_texture, "Character", sprite_group))

func _physics_process(delta: float) -> void:
	# get input direction vector
	input_vector = Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")

	# reset movement scale
	movement_scale = 1.0

	# detect input based direction
	if velocity.x > 0:
		input_direction = "right"
	elif velocity.x < 0:
		input_direction = "left"
	elif velocity.y > 0:
		input_direction = "down"
	elif velocity.y < 0:
		input_direction = "up"

	# reduce movement scale if input and mouse down direction are not the same
	if not mouse_down_direction.is_empty() and input_direction != mouse_down_direction:
		movement_scale *= 0.6

	# calculate velocity
	velocity = (input_vector * (movement_speed * movement_scale) * delta)

	# apply movement
	move_and_slide()

	# determine actual direction
	if not mouse_down_direction.is_empty():
		direction = mouse_down_direction
	else:
		direction = input_direction

	# animation
	for sprite: AnimatedSprite2D in sprites:
		# direction
		sprite.play(direction)

	# hop (when moving)
	if (velocity != Vector2.ZERO):
		anim_player.play("hop")

# handle inputs
func _input(_event: InputEvent) -> void:
	# interact
	if Input.is_action_just_pressed("interact") and hud.current_interactable:
		hud.current_interactable.interact()

	# click
	if Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT):
		# get direction to mouse click location
		var mouse_click_direction: Vector2 = get_global_mouse_position() - position

		# detect mouse down based direction
		if mouse_click_direction.x > MOUSE_DOWN_TURN_THRESHOLD:
			mouse_down_direction = "right"
		elif mouse_click_direction.x < -MOUSE_DOWN_TURN_THRESHOLD:
			mouse_down_direction = "left"
		elif mouse_click_direction.y > 0:
			mouse_down_direction = "down"
		elif mouse_click_direction.y < 0:
			mouse_down_direction = "up"

	# reset
	else:
		mouse_down_direction = ""
