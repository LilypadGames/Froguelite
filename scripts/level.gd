extends Node2D

# References
@export var level: Node2D
@onready var objects: Node2D = level.get_node("Objects")
@export var player: Node2D
@export var camera: Camera2D

func _ready() -> void:
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
