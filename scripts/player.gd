class_name Player
extends CharacterBody2D

# constants
const MOUSE_DOWN_TURN_THRESHOLD := 0.5

# properties
@export_category("Properties")
@export var movement_scale: float = Cache.data["player"]["stats"]["speed_scale"]
@export var hearts: int = ceil(Cache.data["player"]["stats"]["health"] / 2):
	set (value):
		# clamp value
		hearts = clamp(value, 1, INF)

		# update hud
		hud.update_hearts()
@export var health: int = Cache.data["player"]["stats"]["health"]:
	set (value):
		# clamp value
		health = clamp(value, 0, hearts * 2)

		# update hud
		hud.update_current_health()

# references
@export_category("References")
@onready var sprite_group: CanvasGroup = %Sprites
@onready var anim_player: AnimationPlayer = %AnimationPlayer
@onready var character_texture: String = Cache.data["player"]["texture"]
@onready var projectiles_group: Node2D = %Projectiles
@onready var occluders_group: Node2D = %Occluders
@export var projectile_spawner_scene: PackedScene
var projectiles: Dictionary = {}
var hud: HUD

# internal
var sprites: Array[AnimatedSprite2D]

# internal
var input_vector: Vector2 = Vector2.ZERO
var movement_speed: float = 5000
var direction: String = "right"
var input_direction: String
var mouse_down_direction: String

func _ready() -> void:
	# create sprites
	sprites.push_back(Utility.create_sprite(character_texture, "Character", sprite_group))

	# create occluders
	for sprite in sprites:
		Utility.create_occluder_from_sprite(sprite, occluders_group)

	# FIXME: PerfBullets addon only works on Windows platform, for now.
	if OS.get_name() == "Windows":
		# set projectile spawner object
		projectile_spawner_scene = load("res://objects/ProjectileSpawner.tscn")

		# create projectiles
		for spell in Cache.data["player"]["inventory"]["spells"]:
			# create new projectile spawner
			var projectile_spawner = (projectile_spawner_scene.instantiate()).setup(spell)

			# add projectile spawner to player's projectile group
			projectiles_group.add_child(projectile_spawner)

			# index projectile
			projectiles[spell] = projectile_spawner

func _physics_process(delta: float) -> void:
	# get input direction vector
	input_vector = Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")

	# reset movement scale
	var movement_scale_temp = movement_scale

	# detect input based direction
	if velocity.x > 0:
		input_direction = "right"
	elif velocity.x < 0:
		input_direction = "left"
	elif velocity.y > 0:
		input_direction = "down"
	elif velocity.y < 0:
		input_direction = "up"

	# reduce movement scale if input and mouse down direction are not the same
	if not mouse_down_direction.is_empty() and input_direction != mouse_down_direction:
		movement_scale_temp *= 0.6

	# calculate velocity
	velocity = (input_vector * (movement_speed * movement_scale_temp) * delta)

	# apply movement
	move_and_slide()

	# determine actual direction
	if not mouse_down_direction.is_empty():
		direction = mouse_down_direction
	elif not input_direction.is_empty():
		direction = input_direction

	# animation
	for sprite: AnimatedSprite2D in sprites:
		# direction
		sprite.play(direction)

		# activate correct occluder
		for occluder: LightOccluder2D in occluders_group.get_children():
			if occluder.name == direction:
				occluder.visible = true
			else:
				occluder.visible = false

	# hop (when moving)
	if (velocity != Vector2.ZERO):
		anim_player.play("hop")

	# FIXME: PerfBullets addon only works on Windows platform, for now.
	if OS.get_name() == "Windows":
		# fire
		if Input.is_action_pressed("attack_primary"):
			(projectiles[Cache.data["player"]["equipped"]["spell"]]).fire(get_local_mouse_position().normalized())

# handle inputs
func _input(_event: InputEvent) -> void:
	# interact
	if Input.is_action_just_pressed("interact") and hud.current_interactable:
		hud.current_interactable.interact()

	# click
	if Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT):
		# get direction to mouse click location
		var mouse_click_direction: Vector2 = get_local_mouse_position().normalized()

		# detect mouse down based direction
		if mouse_click_direction.x > MOUSE_DOWN_TURN_THRESHOLD:
			mouse_down_direction = "right"
		elif mouse_click_direction.x < -MOUSE_DOWN_TURN_THRESHOLD:
			mouse_down_direction = "left"
		elif mouse_click_direction.y > 0:
			mouse_down_direction = "down"
		elif mouse_click_direction.y < 0:
			mouse_down_direction = "up"

	# not clicking
	else:
		if mouse_down_direction:
			# keep same direction when letting go of mouse button down
			input_direction = mouse_down_direction

			# reset click direction
			mouse_down_direction = ""
