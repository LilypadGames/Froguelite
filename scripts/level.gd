class_name Level
extends Node2D

# references
@export_category("References")
@export var tilemap: PackedScene
@onready var player: Node2D = %Player
@onready var camera: Camera2D = %Camera

# internal
var level: Node2D
var layers: Array[TileMap]
var objects: Node2D

# constants
const teleporter_path := "res://objects/Teleporter.tscn"

func _ready() -> void:
	# set up level
	level = tilemap.instantiate()
	add_child(level)
	objects = level.get_node("Objects")

	# set up collisions
	for child in level.get_children():
		if child is TileMap:
			# add layer
			layers.push_back(child)

			# add collider
			if child.has_meta("wall") and child.get_meta("wall"):
				child.tile_set.add_physics_layer()

	# set up objects
	for object in objects.get_children():
		if object is Marker2D and object.get_meta("type"):
			# get type
			var type: String = object.get_meta("type")

			# spawnpoint
			if type == "spawn":
				player.position = object.position

			# teleporter
			elif type == "teleporter":
				var teleporter: Teleporter = preload(teleporter_path).instantiate() as Teleporter
				teleporter.texture = Cache.data["game"]["interactables"][Cache.data["game"]["teleporters"][object.get_meta("id")]["type"]]["texture"]
				add_child(teleporter)
				teleporter.position = object.position

func _process(_delta: float) -> void:
	# handle camera
	camera.position = player.position
