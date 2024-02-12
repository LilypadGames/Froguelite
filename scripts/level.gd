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
@export var chunk_size: int = 16
@export var chunk_distance: int = 2
var level_seed: int
var infinite_tilemap: TileMap
var tileset_tiles: Dictionary = {"texture": {}, "weight": {}, "weight_padding": {}, "weight_total": {}, "source_id": {}}
var tile_size: int
var loaded_chunks: Array[Vector2i] = []

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

	# procedural
	if level_type == "procedural":
		_handle_procedural_level()

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
				for tile in (child as TileMap).get_used_cells(0):
					var collider = StaticBody2D.new()
					collider.position = child.map_to_local(tile)
					level.add_child(collider)

					var collider_body: CollisionShape2D = CollisionShape2D.new()

					var collider_shape: RectangleShape2D = RectangleShape2D.new()
					collider_shape.size = Vector2i(22, 22)

					collider_body.shape = collider_shape

					collider.add_child(collider_body)

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
	# generate level seed
	var rng = RandomNumberGenerator.new()
	rng.randomize()
	level_seed = rng.randi_range(-2147483647, 2147483647)
	
	# get tile size
	tile_size = Cache.registry["world"]["level"][level_name]["tile_size"]

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
	noise.seed = level_seed

	# create level parent node
	level = Node2D.new()
	level.name = "level_data"
	add_child(level)

	# create tilemap
	infinite_tilemap = TileMap.new()
	infinite_tilemap.rendering_quadrant_size = tile_size
	infinite_tilemap.add_layer(-1)
	level.add_child(infinite_tilemap)

	# create tileset
	var tile_set = TileSet.new()
	tile_set.tile_size = Vector2i(tile_size, tile_size)
	infinite_tilemap.tile_set = tile_set

	# get tiles
	var tile_data: Dictionary = Cache.registry["world"]["level"][level_name]["tiles"]
	var source_count: int = 0
	for tile in tile_data:
		# init tile type properties
		tileset_tiles["texture"][tile] = [] as Array[Texture2D]
		tileset_tiles["weight"][tile] = [] as Array[int]
		tileset_tiles["weight_padding"][tile] = 0 as int
		tileset_tiles["weight_total"][tile] = [] as Array[int]
		tileset_tiles["source_id"][tile] = [] as Array[int]

		# get textures
		var textures = tile_data[tile]

		# add texture data to tileset_tiles dict
		var weight_total: int = 0
		for texture_path in textures.keys():
			# weight padding
			if texture_path == "*":
				tileset_tiles["weight_padding"][tile] = textures[texture_path] as int

			# add tile texture and weight
			else:
				tileset_tiles["texture"][tile].push_back(load(texture_path))
				tileset_tiles["weight"][tile].push_back(textures[texture_path] as int)

			# keep track of total weight
			weight_total += textures[texture_path] as int

		# save total weight
		tileset_tiles["weight_total"][tile] = weight_total

		# create tiles and add to tile set
		for texture_index in tileset_tiles["texture"][tile].size():
			var atlas_source = TileSetAtlasSource.new()
			atlas_source.texture = tileset_tiles["texture"][tile][texture_index]
			atlas_source.texture_region_size = Vector2i(tile_size, tile_size)
			atlas_source.create_tile(Vector2i(0, 0))
			tile_set.add_source(atlas_source, source_count)

			# save source ID
			tileset_tiles["source_id"][tile].push_back(source_count)

			# next source ID
			source_count += 1

func _handle_procedural_level() -> void:
	# get player's current chunk
	var current_chunk: Vector2i = _get_player_chunk_position()

	# unload chunks
	for chunk_index in range(loaded_chunks.size() - 1, -1, -1):
		if floor((loaded_chunks[chunk_index] - current_chunk).length()) > chunk_distance:
			_unload_chunk(loaded_chunks[chunk_index])
			loaded_chunks.remove_at(chunk_index)

	# load chunks
	for x in range(current_chunk.x - chunk_distance, current_chunk.x + chunk_distance):
		for y in range(current_chunk.y - chunk_distance, current_chunk.y + chunk_distance):
			if not loaded_chunks.has(Vector2i(x, y)):
				_load_chunk(Vector2i(x, y))
				loaded_chunks.push_back(Vector2i(x, y))

func _load_chunk(chunk_position: Vector2i) -> void:
	# set tile RNG to chunk's seed
	var tile_rng = RandomNumberGenerator.new()
	tile_rng.seed = _get_chunk_seed(chunk_position)

	# ground tiles
	_generate_tiles(chunk_position, "ground", 0, tile_rng)

	# decoration tiles
	_generate_tiles(chunk_position, "decoration", 1, tile_rng)

func _unload_chunk(chunk_position: Vector2i) -> void:
	# remove tiles
	for x in range(chunk_size):
		for y in range(chunk_size):
			# tile's world position
			var tile_position = _get_tile_tilemap_position(chunk_position, Vector2i(x, y))

			# remove tile
			infinite_tilemap.erase_cell(0, Vector2i(tile_position.x, tile_position.y))

func _generate_tiles(chunk_position: Vector2i, tile_type: String, layer: int, tile_rng: RandomNumberGenerator) -> void:
	# add tiles
	for x in range(chunk_size):
		for y in range(chunk_size):
			# tile's world position
			var tile_position = _get_tile_tilemap_position(chunk_position, Vector2i(x, y))

			# is there a tile at this noise position?
			if _is_filled_at_noise_position(tile_position):
				# init tile id to use
				var tile_id: int

				# get random number based on weight total
				var rand: int = tile_rng.randi_range(1, tileset_tiles["weight_total"][tile_type])

				# keep track of accumulating weight
				var weight_sum: int = tileset_tiles["weight_padding"][tile_type]

				# random number is not in padding
				if not rand <= weight_sum:
					# get weight list
					var weights: Array[int] = tileset_tiles["weight"][tile_type]

					# compare weight to random value
					for weight_index in weights.size():
						# add weight
						weight_sum += weights[weight_index]

						# passed the correct tile
						if rand <= weight_sum:
							tile_id = tileset_tiles["source_id"][tile_type][weight_index]
							break

						# end of iteration
						tile_id = tileset_tiles["source_id"][tile_type][weight_index]

					# add tile
					infinite_tilemap.set_cell(layer, Vector2i(tile_position.x, tile_position.y), tile_id, Vector2i(0, 0))

func _get_chunk_seed(chunk_position: Vector2i) -> int:
	return (chunk_position.x * 73856093) ^ (chunk_position.y * 19349663) ^ level_seed

func _get_player_chunk_position() -> Vector2i:
	return Vector2i(floor((player.global_position.x / tile_size) / chunk_size), floor((player.global_position.y / tile_size) / chunk_size))

func _get_tile_tilemap_position(chunk_position: Vector2i, tile_index: Vector2i) -> Vector2i:
	return chunk_position * chunk_size + tile_index

func _is_filled_at_noise_position(tile_position: Vector2i) -> bool:
	return floor(abs(noise.get_noise_2d(tile_position.x, tile_position.y) * 2)) == 0
