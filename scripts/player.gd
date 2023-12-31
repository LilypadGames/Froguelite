class_name Player
extends CharacterBody2D

# properties
@export_category("Properties")
@export var movement_speed: float = 5000

# references
@export_category("References")
@onready var sprite_group: Node2D = %SpriteGroup
@onready var anim_player: AnimationPlayer = %AnimationPlayer

# internal
var sprites: Array[AnimatedSprite2D]

# internal
var input_vector: Vector2 = Vector2.ZERO
var direction: String = "right"

func _ready() -> void:
	# get sprites
	for index in sprite_group.get_child_count():
		sprites.push_back(sprite_group.get_child(index))

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
