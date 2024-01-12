class_name Teleporter
extends Area2D

# references
@export_category("References")
@export var texture: String
@onready var sprite: Sprite2D = %Sprite
@onready var collider: CollisionShape2D = %Collider

# set up teleporter
func _ready():
	# set sprite texture
	sprite.texture = load(Cache.data["textures"][texture])

	# set collider size
	collider.shape.extents = sprite.texture.get_size() / 2

# collisions
func _on_body_entered(body):
	if body is CharacterBody2D and body.is_in_group("Player"):
		pass

func _on_body_exited(body):
	if body is CharacterBody2D and body.is_in_group("Player"):
		pass
