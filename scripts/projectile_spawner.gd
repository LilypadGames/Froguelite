class_name ProjectileSpawner extends Spawner

# references
var timer: Timer

func fire(direction: Vector2) -> void:
	# init timer
	if not timer:
		timer = get_child(0)

	# check fire rate
	if timer.is_stopped():
		# fire projectile
		spawn_bullet_self(direction)

		# start fire rate timer
		timer.start()
