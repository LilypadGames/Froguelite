class_name Player
extends CharacterBody2D

# properties
@export_category("Properties")
@export var movement_speed: float = 5000

# references
@export_category("References")
@onready var sprite_group: Node2D = %SpriteGroup
@onready var anim_player: AnimationPlayer = %AnimationPlayer
@onready var character_texture: String = Cache.data["game"]["player"]["texture"]

# internal
var sprites: Array[AnimatedSprite2D]

# internal
var input_vector: Vector2 = Vector2.ZERO
var direction: String = "right"

func _ready() -> void:
	# create sprites
	create_sprite(character_texture, "Character")

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

# create sprite
func create_sprite(texture: String, sprite_name: String) -> void:
	# get sprite data
	var sprite_data = Cache.data["textures"][texture]

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

	# add sprite to reference group
	sprites.push_back(animated_sprite)
