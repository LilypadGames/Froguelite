class_name Enemy
extends CharacterBody2D

# properties
@export_category("Properties")
@export var movement_scale: float = 1.0
@export var hearts: int = 1:
	set (value):
		# clamp value
		hearts = clamp(value, 1, INF)
@export var health: int = hearts * 2:
	set (value):
		# clamp value
		health = clamp(value, 0, hearts * 2)

# references
@export_category("References")
var character_texture: String
@onready var collider: CollisionShape2D = %Collider
@onready var sprite_group: CanvasGroup = %Sprites
@onready var projectiles_group: Node2D = %Projectiles
@onready var occluders_group: Node2D = %Occluders
@onready var action_timer: Timer = %ActionTimer
@export var projectile_spawner_scene: PackedScene
var sprites: Array = []
var projectiles: Dictionary = {}

# internal
var id: String
var type: String
#var input_vector: Vector2 = Vector2.ZERO
var movement_speed: float = 5000
var direction: String = "right"
var phase_index: int = 0:
	set(index):
		# set phase
		phase_index = wrap(index, 0, phase_actions.size())
var phase_actions: Array[Array] = [[{}]]
var phase_action_index: int = 0:
	set(index):
		# set phase
		phase_action_index = wrap(index, 0, phase_actions[phase_index].size())

		# set timer
		action_timer.start(phase_actions[phase_index][phase_action_index]["time"])

# init properties
func setup(new_id: String) -> Enemy:
	# save ID
	id = new_id

	# get data
	var enemy_data = Cache.data["enemy"][id]

	# set properties
	type = Cache.data["enemy"][id]["type"]
	movement_scale = float(enemy_data["stats"]["speed_scale"])
	hearts = ceil(int(enemy_data["stats"]["health"]) / 2.0)
	health = int(enemy_data["stats"]["health"])

	# set texture
	character_texture = enemy_data["texture"]

	return self

func _ready() -> void:
	# get data
	var enemy_data = Cache.data["enemy"][id]

	# create sprites
	sprites.push_back(Utility.create_sprite(character_texture, "Character", sprite_group))

	# create occluders
	#for sprite in sprites:
		#Utility.create_occluder_from_sprite(sprite, occluders_group)

	# set collider size, depending on sprite type
	if sprites[0].get_class() == "Sprite2D":
		collider.shape.extents = sprites[0].texture.get_size() / 2

	# FIXME: PerfBullets addon only works on Windows platform, for now.
	if OS.get_name() == "Windows":
		# set projectile spawner object
		projectile_spawner_scene = load("res://objects/ProjectileSpawner.tscn")

		# loop through phases
		for phase in enemy_data["phases"]:
			# loop through phase actions
			for action in phase["actions"]:
				# spell action
				if action["type"] == "spells":
					# loop through spells
					for spell in action["spells"]:
						# spell not already added
						if not projectiles.has(spell):
							_create_projectile(spell)

	# set up phases
	if type == "boss":
		for phase in enemy_data["phases"]:
			# initial phase
			if typeof(phase["trigger"]) == TYPE_STRING and phase["trigger"] == "default":
				phase_actions[0] = phase["actions"]
			else:
				phase_actions.push_back(phase["actions"])

	# start first phase
	action_timer.start(phase_actions[phase_index][phase_action_index]["time"])

func _physics_process(_delta: float) -> void:
	# get input direction vector
	#input_vector = Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")

	# reset movement scale
	#var movement_scale_temp = movement_scale

	# detect input based direction
	if velocity.x > 0:
		direction = "right"
	elif velocity.x < 0:
		direction = "left"
	elif velocity.y > 0:
		direction = "down"
	elif velocity.y < 0:
		direction = "up"

	# calculate velocity
	#velocity = (input_vector * (movement_speed * movement_scale_temp) * delta)

	# apply movement
	move_and_slide()

	## animation
	#for sprite: AnimatedSprite2D in sprites:
		## direction
		#sprite.play(direction)
#
		## activate correct occluder
		#for occluder: LightOccluder2D in occluders_group.get_children():
			#if occluder.name == direction:
				#occluder.visible = true
			#else:
				#occluder.visible = false

	## FIXME: PerfBullets addon only works on Windows platform, for now.
	if OS.get_name() == "Windows":
		# boss phases
		if type == "boss":
			# get current phase action
			var action = phase_actions[phase_index][phase_action_index]

			# spell action
			if action["type"] == "spells":
				# play each spell
				for spell in action["spells"]:
					(projectiles[spell] as ProjectileSpawner).fire()

func _create_projectile(spell_name: String) -> void:
	# create new projectile spawner
	var projectile_spawner = (projectile_spawner_scene.instantiate()).setup(spell_name)

	# set to collide with players and not with other enemies
	(projectile_spawner as ProjectileSpawner).bulletType.mask = 7

	# add projectile spawner to player's projectile group
	projectiles_group.add_child(projectile_spawner)

	# index projectile
	projectiles[spell_name] = projectile_spawner

func _advance_phase_action() -> void:
	# next action
	phase_action_index += 1
