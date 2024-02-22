extends Node

# internal
var path: String = "res://data"
var registry: Dictionary = {}
var data: Dictionary = {}
var lang: Dictionary = {}
var registry_files: Array[String] = ["meta", "audio", "textures", "world"]
var data_files: Array[String] = ["level", "player", "enemy", "spells", "armors", "interactables", "lootables", "teleporters"]
var lang_files: Array[String] = ["en_us"]
var sounds: Dictionary = {}
var temp: Dictionary = {}

# cache registry and data
func _ready():
	# registry
	for file in registry_files:
		registry[file] = parse_json(path + "/registry/" + file + ".json")

	# game data
	for file in data_files:
		data[file] = parse_json(path + "/game/" + file + ".json")

	# language
	for file in lang_files:
		lang[file] = parse_json(path + "/lang/" + file + ".json")

	# set up sound AudioStreams
	for key in registry["audio"].keys():
		# array
		if typeof(registry["audio"][key]) == TYPE_ARRAY:
			# create array
			sounds[key]= []

			# add each sound to array
			for array_sound in registry["audio"][key]:
				(sounds[key] as Array).push_back(load(array_sound))

		# single
		else:
			sounds[key] = load(registry["audio"][key])

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

# return audio stream from registered sounds
func get_stream(key: String) -> AudioStream:
	# array
	if typeof(sounds[key]) == TYPE_ARRAY:
		# get random from array
		return (sounds[key] as Array).pick_random()

	# single
	else:
		return sounds[key]
