class_name Level
extends Node2D

# references
@export_category("References")
@export var tilemap: PackedScene
@onready var player: Node2D = %Player
@onready var camera: Camera2D = %Camera
@onready var enemies: Node = %Enemies
@onready var objects: Node = %Objects

# internal
var level: Node2D
var layers: Array[TileMap]
var level_object_data: Node2D

# constants
const teleporter_path := "res://objects/Teleporter.tscn"
const lootable_path := "res://objects/Lootable.tscn"

func _ready() -> void:
	# set up level
	level = tilemap.instantiate()
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
				var teleporter: Interactable = preload(teleporter_path).instantiate() as Interactable
				teleporter.texture = Cache.data["interactables"][Cache.data["teleporters"][object_data.get_meta("id")]["type"]]["texture"]
				objects.add_child(teleporter)
				teleporter.position = object_data.position

			# lootable
			elif type == "lootable":
				var lootable: Interactable = preload(lootable_path).instantiate() as Interactable
				lootable.texture = Cache.data["interactables"][Cache.data["lootables"][object_data.get_meta("id")]["type"]]["texture"]
				objects.add_child(lootable)
				lootable.position = object_data.position

func _process(_delta: float) -> void:
	# handle camera
	camera.position = player.position
