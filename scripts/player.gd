class_name Player
extends CharacterBody2D

# properties
@export_category("Properties")
@export var movement_speed: float = 5000

# references
@export_category("References")
@onready var sprite_group: CanvasGroup = %Sprites
@onready var anim_player: AnimationPlayer = %AnimationPlayer
@onready var character_texture: String = Cache.data["game"]["player"]["texture"]

# internal
var sprites: Array[AnimatedSprite2D]

# internal
var input_vector: Vector2 = Vector2.ZERO
var direction: String = "right"

func _ready() -> void:
	# create sprites
	sprites.push_back(Utility.create_sprite(character_texture, "Character", sprite_group))

func _physics_process(delta: float) -> void:
	# input
	input_vector = Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")
	velocity = input_vector * movement_speed * delta

	# detect direction
	if velocity.x > 0:
		direction = "right"
	elif velocity.x < 0:
		direction = "left"
	elif velocity.y > 0:
		direction = "down"
	elif velocity.y < 0:
		direction = "up"

	# movement
	move_and_slide()

	# animation
	for sprite: AnimatedSprite2D in sprites:
		# direction
		sprite.play(direction)

	# hop (when moving)
	if (velocity != Vector2.ZERO):
		anim_player.play("hop")
