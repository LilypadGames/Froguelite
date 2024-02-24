class_name DiurnalCycle
extends CanvasModulate

# constants
const MINUTES_PER_DAY = 1440
const MINUTES_PER_HOUR = 60
const INGAME_TO_REAL_MINUTE_DURATION = (2 * PI) / MINUTES_PER_DAY

# properties
@export_category("Properties")
@export var advance_time: bool = true
@export var time_speed: float = 1.0
@export var initial_hour: int = 12:
	set(hour):
		# set initial hour
		initial_hour = wrap(hour, 0, 13)

		# set initial time
		_init_time_of_day()

		# update hue
		_apply_time_of_day_hue()
@export var daytime: float = (sin(time_curve - PI / 2) + 1.0) / 2.0:
	set(time):
		# set time curve
		time_curve = clamp(time, 0.0, 1.0) * PI

		# set daytime
		daytime = (sin(time_curve - PI / 2) + 1.0) / 2.0

		# update hue
		_apply_time_of_day_hue()
	get:
		return (sin(time_curve - PI / 2) + 1.0) / 2.0

# internal
var time_curve: float = 0.0

# references
@export_category("References")
@export var gradient: GradientTexture1D

func _ready() -> void:
	# set initial time
	_init_time_of_day()

func _process(delta: float) -> void:
	if advance_time:
		# advance time
		time_curve += delta * INGAME_TO_REAL_MINUTE_DURATION * time_speed

		# set color
		_apply_time_of_day_hue()

# applies hue to the canvas depending of time of day
func _apply_time_of_day_hue() -> void:
	color = gradient.gradient.sample(daytime)

# sets up initial daytime value
func _init_time_of_day() -> void:
	time_curve = INGAME_TO_REAL_MINUTE_DURATION * initial_hour * MINUTES_PER_HOUR

# get current daytime as an int value between 0 and 100
func get_current_daytimei() -> int:
	return roundi(daytime * 100)
