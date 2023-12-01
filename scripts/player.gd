extends CharacterBody2D

class_name Player

# settings
@export_category("Settings")
@export var movement_speed: float = 5000

# references
@export_category("References")
@export var sprite_group: Node2D
@export var directional_sprites: Array[AnimatedSprite2D]
@export var animation: AnimationPlayer

# internal
var input_vector: Vector2 = Vector2.ZERO
var direction: String = "right"

func _ready() -> void:
	pass

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
	for sprite: AnimatedSprite2D in directional_sprites:
		# direction
		sprite.play(direction)

	# hop (when moving)
	if (velocity != Vector2.ZERO):
		animation.play("hop")
