extends Node

# internal
var data := {}
var path := "res://data"
var registries := ["audio", "textures", "world", "game"]

# cache data in registries
func _ready():
	for registry in registries:
		data[registry] = parse_json(path + "/registry/" + registry + ".json")

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
