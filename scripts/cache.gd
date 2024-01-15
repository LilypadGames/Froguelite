extends Node

# internal
var path: String = "res://data"
var registry: Dictionary = {}
var data: Dictionary = {}
var registry_files: Array[String] = ["audio", "textures", "world"]
var data_files: Array[String] = ["player", "enemy", "spells", "armors", "interactables", "lootables", "teleporters"]

# cache registry and data
func _ready():
	# registry
	for file in registry_files:
		registry[file] = parse_json(path + "/registry/" + file + ".json")

	# data
	for file in data_files:
		data[file] = parse_json(path + "/game/" + file + ".json")

# parse data from specified json file
func parse_json(file_path: String):
	# file doesn't exist
	if not FileAccess.file_exists(file_path):
		prints("ERROR: Attempting to access", file_path)
		return

	# open file and parse data
	var data_file = FileAccess.open(file_path, FileAccess.READ)
	var parsed_data = JSON.parse_string(data_file.get_as_text())

	# parsed data isnt formatted correctly
	if not parsed_data is Dictionary:
		prints("ERROR: Attempting to parse", file_path)
		return

	# successfuly parsed
	return parsed_data
