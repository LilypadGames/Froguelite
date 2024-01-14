extends Node

# create sprite
func create_sprite(texture: String, sprite_name: String, sprite_group: CanvasGroup):
	# get sprite data
	var sprite_data = Cache.data["textures"][texture]

	# singular sprite
	if typeof(sprite_data) == 4: # 4 means that the type is a String
		# create sprite
		var sprite: Sprite2D = Sprite2D.new()
		sprite_group.add_child(sprite)

		# set texture
		sprite.texture = load(sprite_data)

		return sprite

	# spritesheet
	else:
		# create animated sprite
		var animated_sprite = AnimatedSprite2D.new()
		animated_sprite.name = sprite_name
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

		# get spacing
		var spacing: int = 0
		if sprite_data.has("spacing"):
			spacing = sprite_data["spacing"]

		# get animations
		var animations: Dictionary = sprite_data["anims"]

		# create animations with frames
		var default_anim_set := false
		for anim in animations:
			# not animated
			if not animations[anim]["frames"].has("end"):
				# create animation
				sprite_frames.add_animation(anim)

				# get start frame for this anim
				var start_frame = animations[anim]["frames"]["start"]

				# create frames
				var atlas_texture = AtlasTexture.new()
				atlas_texture.atlas = sprite_sheet
				atlas_texture.region = Rect2((start_frame * sprite_data["frameWidth"]) + (start_frame * spacing), 0, sprite_data["frameWidth"], sprite_data["frameHeight"])
				sprite_frames.add_frame(anim, atlas_texture)

			# get default anim
			if not default_anim_set:
				# set default anim
				animated_sprite.animation = anim

				# mark default anim found
				default_anim_set = true

		return animated_sprite
