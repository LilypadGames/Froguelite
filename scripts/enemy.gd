class_name Enemy
extends CharacterBody2D

# properties
@export_category("Properties")
@export var movement_scale: float = 1.0
@export var max_health: int = 1:
	set (value):
		# clamp value
		max_health = clamp(value, 1, INF)
@export var health: int = max_health:
	set (value):
		# clamp value
		health = clamp(value, 0, max_health)
@export var phase_index: int = 0:
	set(index):
		# set phase
		phase_index = wrap(index, 0, phase_actions.size())

		# update phase action index
		phase_action_index = 0
@export var phase_action_index: int = 0:
	set(index):
		# set phase
		phase_action_index = wrap(index, 0, phase_actions[phase_index].size())

		# set timer
		action_timer.start(phase_actions[phase_index][phase_action_index]["time"])

# references
@export_category("References")
var character_texture: String
var sprites: Array = []
var projectiles: Dictionary = {}
var phase_actions: Array[Array] = [[{}]]
#@onready var physics_collider: CollisionPolygon2D = %Collider
@onready var sprite_group: CanvasGroup = %Sprites
@onready var projectiles_group: Node2D = %Projectiles
@onready var occluders_group: Node2D = %Occluders
@onready var action_timer: Timer = %ActionTimer
@onready var cooldown_timer: Timer = %CooldownTimer

# internal
var id: String
var type: String
var projectile_spawner_scene: PackedScene
var polygons: Dictionary = {}
var physics_collider: CollisionPolygon2D

# init properties
func setup(new_id: String) -> Enemy:
	# save ID
	id = new_id

	# get data
	var enemy_data = Cache.data["enemy"][id]

	# set properties
	type = Cache.data["enemy"][id]["type"]
	movement_scale = float(enemy_data["stats"]["speed_scale"])
	max_health = int(enemy_data["stats"]["health"])
	health = int(enemy_data["stats"]["health"])

	# set texture
	character_texture = enemy_data["texture"]

	return self

func _ready() -> void:
	# create sprites
	sprites.push_back(Utility.create_sprite(character_texture, "Character", sprite_group))

	# set up sprite
	if sprites[0] is Sprite2D:
		# create polygon
		var _polygons = Utility.get_polygons_from_image(sprites[0].texture.get_image())

		# create colliders and occluders
		for polygon in _polygons:
			var _physics_collider = CollisionPolygon2D.new()
			_physics_collider.polygon = polygon
			add_child(_physics_collider)

			# create occluder
			Utility.create_occluder(polygon, self, sprites[0].scale)

	# set up animated sprite
	elif sprites[0] is AnimatedSprite2D:
		# init collider
		physics_collider = CollisionPolygon2D.new()
		add_child(physics_collider)

		# create polygon and occluder
		for animation_name in sprites[0].sprite_frames.get_animation_names():
			# create polygon
			polygons[animation_name] = Utility.get_polygons_from_image(sprites[0].sprite_frames.get_frame_texture(animation_name, 0).get_image())[0]

			# create occluder
			Utility.create_occluder(polygons[animation_name], occluders_group, sprites[0].scale, animation_name)

	# init boss phases
	if type == "boss":
		_init_phases()

func _physics_process(_delta: float) -> void:
	# set polygon based on animation
	if not polygons.is_empty():
		# get current animation
		var animation: StringName = (sprites[0] as AnimatedSprite2D).animation

		# get current polygon
		var polygon = polygons[animation]

		# set colliders
		physics_collider.polygon = polygon

		# set occluder
		for occluder: LightOccluder2D in occluders_group.get_children():
			if occluder.name == animation:
				occluder.visible = true
			else:
				occluder.visible = false

	# run boss phases
	if type == "boss":
		_run_phase()

	# process physics
	move_and_slide()

func _init_phases() -> void:
	# get data
	var enemy_data = Cache.data["enemy"][id]

	# FIXME: PerfBullets addon only works on Windows platform, for now.
	if OS.get_name() == "Windows":
		# set projectile spawner object
		projectile_spawner_scene = load("res://objects/ProjectileSpawner.tscn")

		# loop through phases
		for phase: Dictionary in enemy_data["phases"]:
			# get phase data
			if typeof(phase["trigger"]) == TYPE_STRING and phase["trigger"] == "default":
				phase_actions[0] = phase["actions"]
			else:
				phase_actions.push_back(phase["actions"])

			# loop through phase actions
			for action: Dictionary in phase["actions"]:
				# spell action
				if action["type"] == "spells":
					# loop through spells
					for spell: String in action["spells"]:
						# spell not already added
						if not projectiles.has(spell):
							# create projectile spawner
							_create_projectile(spell)

							# connect player hit event
							(projectiles[spell] as ProjectileSpawner).connect("player_hit", _projectile_hit_player)

	# start first phase
	action_timer.start(phase_actions[phase_index][phase_action_index]["time"])

func _run_phase() -> void:
	# FIXME: PerfBullets addon only works on Windows platform, for now.
	if OS.get_name() == "Windows":
		# currently in cooldown
		if cooldown_timer.time_left > 0:
			return

		# get current phase action
		var action = phase_actions[phase_index][phase_action_index]

		# spell action
		if action["type"] == "spells":
			# play each spell
			for spell: String in action["spells"]:
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

func _projectile_hit_player() -> void:
	# clear all projectiles
	for projectile_name: String in projectiles.keys():
		projectiles[projectile_name].clear_all()

	# cooldown
	cooldown_timer.start(1)
