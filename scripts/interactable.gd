class_name Interactable
extends PhysicsBody2D

# references
@export_category("References")
@onready var sprite_group: CanvasGroup = %Sprites
@onready var collider: CollisionShape2D = %Collider
@onready var interact_sensor: Area2D = %InteractSensor
var hud: HUD

# properties
var id: String
var type: String
var texture: String

# set up interactable
func _ready() -> void:
	# rename node to this object's ID for better debugging
	name = id

	# create sprite
	var sprite = Utility.create_sprite(texture, "Sprite", sprite_group)

	# set collider size, depending on sprite type
	if sprite.get_class() == "Sprite2D":
		collider.shape.extents = sprite.texture.get_size() / 2
	elif sprite.get_class() == "AnimatedSprite2D":
		collider.shape.extents = (sprite.sprite_frames.get_frame_texture(sprite.animation, 0).get_size() / 2) * sprite.scale.x

# methods
func interact() -> void:
	pass

# collisions
func _on_body_entered(body) -> void:
	if body is CharacterBody2D and body.is_in_group("Player"):
		start_interact_hint()

func _on_body_exited(body) -> void:
	if body is CharacterBody2D and body.is_in_group("Player"):
		end_interact_hint()

# hints
func start_interact_hint() -> void:
	pass
func end_interact_hint() -> void:
	if hud.current_interactable == self:
		hud.end_interact_hint()
