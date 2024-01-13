class_name Interactable
extends Area2D

# references
@export_category("References")
@export var texture: String
@onready var sprite_group: CanvasGroup = %CanvasGroup
@onready var collider: CollisionShape2D = %Collider

# set up interactable
func _ready():
	# get sprite data
	var sprite_data = Cache.data["textures"][texture]

	# singular sprite
	if typeof(sprite_data) == 4: # 4 means that the type is a String
		# create sprite
		var sprite: Sprite2D = Sprite2D.new()
		sprite_group.add_child(sprite)

		# set texture
		sprite.texture = load(sprite_data)

		# set collider size
		collider.shape.extents = sprite.texture.get_size() / 2

	# spritesheet
	else:
		# create animated sprite
		var animated_sprite = AnimatedSprite2D.new()
		var sprite_frames = SpriteFrames.new()
		animated_sprite.frames = sprite_frames
		sprite_group.add_child(animated_sprite)
		sprite_frames.remove_animation("default")

		# get scale
		var sprite_scale: float = 1
		if sprite_data.has("scale"):
			sprite_scale = sprite_data["scale"]
			animated_sprite.scale = Vector2(sprite_scale, sprite_scale)

		# get spritesheet
		var sprite_sheet: Texture2D = load(sprite_data["spritesheet"])

		# get frame data
		var frameSize: Dictionary = {
			"width": sprite_data["frameWidth"],
			"height": sprite_data["frameHeight"]
		}

		# get animations
		var animations: Dictionary = sprite_data["anims"]

		# create animations with frames
		var default_anim_set := false
		for anim in animations:
			# not animated
			if not animations[anim]["frames"].has("end"):
				# create animation
				sprite_frames.add_animation(anim)

				# create frames
				var atlas_texture = AtlasTexture.new()
				atlas_texture.atlas = sprite_sheet
				atlas_texture.region = Rect2(animations[anim]["frames"]["start"] * frameSize["width"], 0, frameSize["width"], frameSize["height"])
				sprite_frames.add_frame(anim, atlas_texture)

			# get default anim
			if not default_anim_set:
				# set default anim
				animated_sprite.animation = anim

				# set collider size
				collider.shape.extents = (sprite_frames.get_frame_texture(anim, 0).get_size() / 2) * sprite_scale

				# mark default anim found
				default_anim_set = true

# collisions
func _on_body_entered(body):
	if body is CharacterBody2D and body.is_in_group("Player"):
		pass

func _on_body_exited(body):
	if body is CharacterBody2D and body.is_in_group("Player"):
		pass
