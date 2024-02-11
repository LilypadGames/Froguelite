class_name Level
extends Node2D

# references
@export_category("References")
@onready var player: Node2D = %Player
@onready var camera: Camera2D = %Camera
@onready var hud: HUD = %HUD
@onready var enemies: Node = %Enemies
@onready var objects: Node = %Objects

# procedural level properties
@export_category("Procedural Level Properties")
@export var noise: FastNoiseLite

# internal
var level_name: String
var level_type: String
var level: Node2D
var layers: Array[TileMap]
var level_object_data: Node2D

# constants
const teleporter_path := "res://objects/Teleporter.tscn"
const lootable_path := "res://objects/Lootable.tscn"

func _ready() -> void:
	# give player HUD reference
	player.hud = hud

	# get level name
	if Cache.temp.has("next_level"):
		level_name = Cache.temp["next_level"]
	else:
		level_name = Cache.data["level"]["starting_level"]

	# get level type
	level_type = Cache.registry["world"]["level"][level_name]["type"]

	# instantiate timemap level
	if level_type == "tilemap":
		level = load(Cache.registry["world"]["level"][level_name]["file"]).instantiate()
		_init_static_level()

	# instantiate procedural level
	elif level_type == "procedural":
		_init_procedural_level()

func _process(_delta: float) -> void:
	# handle camera
	camera.position = player.position

func _init_static_level() -> void:
	# set up level
	level.name = "level_data"
	add_child(level)
	level_object_data = level.get_node("Objects")

	# set up collisions
	for child in level.get_children():
		if child is TileMap:
			# add layer
			layers.push_back(child)

			# add collider
			if child.has_meta("wall") and child.get_meta("wall"):
				child.tile_set.add_physics_layer()

	# set up objects
	for object_data in level_object_data.get_children():
		if object_data is Marker2D and object_data.get_meta("type"):
			# get type
			var type: String = object_data.get_meta("type")

			# spawnpoint
			if type == "spawn":
				player.position = object_data.position

			# teleporter
			elif type == "teleporter":
				# create teleporter
				var teleporter: Interactable = preload(teleporter_path).instantiate().setup(object_data.get_meta("id"), hud) as Teleporter

				# add to objects group
				objects.add_child(teleporter)

				# set position
				teleporter.position = object_data.position

			# lootable
			elif type == "lootable":
				var lootable: Interactable = preload(lootable_path).instantiate().setup(object_data.get_meta("id"), hud) as Lootable

				# give HUD reference
				lootable.hud = hud

				# add to objects group
				objects.add_child(lootable)

				# set position
				lootable.position = object_data.position

func _init_procedural_level() -> void:
	# generate seed

	# set noise properties
	var noise_type_config = Cache.registry["world"]["level"][level_name]["noise"]["type"]
	if typeof(noise_type_config) == TYPE_INT and noise_type_config >= 0 and noise_type_config <= 5:
		noise.noise_type = noise_type_config
	elif typeof(noise_type_config) == TYPE_STRING:
		if noise_type_config == "simplex":
			noise.noise_type = FastNoiseLite.TYPE_SIMPLEX
		elif noise_type_config == "simplex_smooth":
			noise.noise_type = FastNoiseLite.TYPE_SIMPLEX_SMOOTH
		elif noise_type_config == "cellular":
			noise.noise_type = FastNoiseLite.TYPE_CELLULAR
		elif noise_type_config == "perlin":
			noise.noise_type = FastNoiseLite.TYPE_PERLIN
		elif noise_type_config == "value_cubic":
			noise.noise_type = FastNoiseLite.TYPE_VALUE_CUBIC
		elif noise_type_config == "value":
			noise.noise_type = FastNoiseLite.TYPE_VALUE
	noise.frequency = Cache.registry["world"]["level"][level_name]["noise"]["frequency"]
	noise.fractal_octaves = Cache.registry["world"]["level"][level_name]["noise"]["octaves"]
	noise.fractal_gain = Cache.registry["world"]["level"][level_name]["noise"]["gain"]

	# create level parent node
	level = Node2D.new()
	level.name = "level_data"
	add_child(level)

	# get ground sprite
	var ground_texture: Texture2D = load(Cache.registry["world"]["level"][level_name]["tiles"]["ground"]) as Texture2D

	# create tilemap
	var tilemap = TileMap.new()
	tilemap.rendering_quadrant_size = 24
	level.add_child(tilemap)

	# create tileset
	var tile_set = TileSet.new()
	tile_set.tile_size = Vector2(24, 24)
	tilemap.tile_set = tile_set

	# add texture to tileset
	var atlas_source = TileSetAtlasSource.new()
	atlas_source.texture = ground_texture
	atlas_source.texture_region_size = Vector2i(24, 24)
	atlas_source.create_tile(Vector2i(0, 0))
	tile_set.add_source(atlas_source, 0)

	# generate level
	for x in range(-100, 100):
		for y in range(-100, 100):
			# ground tile
			if floor(abs(noise.get_noise_2d(x,y) * 2)) == 0:
				tilemap.set_cell(0, Vector2i(x, y), 0, Vector2i(0, 0))
