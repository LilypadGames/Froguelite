class_name Level
extends Node2D

# references
@export_category("References")
@export var tilemap: PackedScene
@onready var player: Node2D = %Player
@onready var camera: Camera2D = %Camera

# internal
var level: Node2D
var objects: Node2D

func _ready() -> void:
	# set up level
	level = tilemap.instantiate()
	add_child(level)
	objects = level.get_node("Objects")

	# set up objects
	for object in objects.get_children():
		if object is Marker2D and object.get_meta("type"):
			# get type
			var type: String = object.get_meta("type")

			# spawnpoint
			if type == "spawn":
				player.position = object.position

func _process(_delta: float) -> void:
	# handle camera
	camera.position = player.position
