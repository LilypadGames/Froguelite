extends Node

# cursor texture
@onready var custom_cursor: Dictionary = { 
	"default": { 
		"texture": load(Cache.registry["meta"]["mouse_cursor"]["default"]),
		},
	"click": {
		"texture": load(Cache.registry["meta"]["mouse_cursor"]["click"]),
	}
}

func _ready():
	# set up cursor hotspots
	for cursor_type in custom_cursor.keys():
		custom_cursor[cursor_type]["hotspot"] = Vector2(custom_cursor[cursor_type]["texture"].get_width() / 2.0, custom_cursor[cursor_type]["texture"].get_height() / 2.0)

	# set cursor to default
	Input.set_custom_mouse_cursor(custom_cursor["default"]["texture"], Input.CURSOR_ARROW, custom_cursor["default"]["hotspot"])

func _input(_event: InputEvent):
	# set to clicked
	if Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT) or Input.is_mouse_button_pressed(MOUSE_BUTTON_RIGHT):
		Input.set_custom_mouse_cursor(custom_cursor["click"]["texture"], Input.CURSOR_ARROW, custom_cursor["click"]["hotspot"])

	# set to default
	else:
		Input.set_custom_mouse_cursor(custom_cursor["default"]["texture"], Input.CURSOR_ARROW, custom_cursor["default"]["hotspot"])
