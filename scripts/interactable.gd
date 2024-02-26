class_name Interactable
extends PhysicsBody2D

# references
@export_category("References")
@onready var sprite_group: CanvasGroup = %Sprites
@onready var occluders_group: Node2D = %Occluders
@onready var physics_collider: CollisionPolygon2D = %PhysicsCollider
@onready var sensor_collider: CollisionPolygon2D = %SensorCollider
var hud: HUD

# internal
var id: String
var type: String
var texture_key: String
var polygons: Dictionary = {}
var sprite

# set up interactable
func _ready() -> void:
	# rename node to this object's ID for better debugging
	name = id

	# create sprite
	sprite = Utility.create_sprite(texture_key, "Sprite", sprite_group)

	# set collider sizes
	physics_collider.scale = sprite.scale
	sensor_collider.scale = sprite.scale

	# set up sprite
	if sprite is Sprite2D:
		# create polygon
		var polygon = Utility.get_polygons_from_image(sprite.texture.get_image())[0]

		# create collider
		physics_collider.polygon = polygon
		sensor_collider.polygon = polygon

		# create occluder
		Utility.create_occluder(polygon, self, sprite.scale)

	# set up animated sprite
	elif sprite is AnimatedSprite2D:
		for animation_name in sprite.sprite_frames.get_animation_names():
			# create polygon
			polygons[animation_name] = Utility.get_polygons_from_image(sprite.sprite_frames.get_frame_texture(animation_name, 0).get_image())[0]

			# create occluder
			Utility.create_occluder(polygons[animation_name], occluders_group, sprite.scale, animation_name)

# manage interactable
func _physics_process(_delta: float) -> void:
	# set polygon based on animation
	if not polygons.is_empty():
		# get current animation
		var animation: StringName = (sprite as AnimatedSprite2D).animation

		# get current polygon
		var polygon = polygons[animation]

		# set colliders
		physics_collider.polygon = polygon
		sensor_collider.polygon = polygon

		# set occluder
		for occluder: LightOccluder2D in occluders_group.get_children():
			if occluder.name == animation:
				occluder.visible = true
			else:
				occluder.visible = false

# inherited methods
func interact() -> void:
	pass

# collisions
func _on_body_entered(body: Node2D) -> void:
	if body is Player:
		start_interact_hint()
func _on_body_exited(body: Node2D) -> void:
	if body is Player:
		end_interact_hint()

# hints
func start_interact_hint() -> void:
	pass
func end_interact_hint() -> void:
	if hud.current_interactable == self:
		hud.end_interact_hint()
