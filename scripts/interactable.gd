class_name Interactable
extends Area2D

# references
@export_category("References")
@export var texture: String
@onready var sprite_group: CanvasGroup = %Sprites
@onready var collider: CollisionShape2D = %Collider

# set up interactable
func _ready() -> void:
	# create sprite
	var sprite = Utility.create_sprite(texture, "Sprite", sprite_group)

	# set collider size, depending on sprite type
	if sprite.get_class() == "Sprite2D":
		collider.shape.extents = sprite.texture.get_size() / 2
	elif sprite.get_class() == "AnimatedSprite2D":
		collider.shape.extents = (sprite.sprite_frames.get_frame_texture(sprite.animation, 0).get_size() / 2) * sprite.scale.x

# collisions
func _on_body_entered(body) -> void:
	if body is CharacterBody2D and body.is_in_group("Player"):
		pass

func _on_body_exited(body) -> void:
	if body is CharacterBody2D and body.is_in_group("Player"):
		pass
