class_name ProjectileSpawner
extends Spawner

# references
var timer: Timer
var spell_id: String

func setup(spell_name: String) -> ProjectileSpawner:
	# store spell name
	spell_id = spell_name

	# get spell data
	var spell_data = Cache.data["spells"][spell_id]

	# set up spawner
	name = spell_id
	fireRate = spell_data["firerate"]
	texture = load(Cache.registry["textures"][spell_data["texture"]["active"]])
	bulletType.initialSpeed = spell_data["speed"]
	(bulletType._shape as CircleShape2D).radius = spell_data["radius"]
	bulletType.scale = spell_data["scale"]
	bulletType.maxLifetime = spell_data["lifespan"]

	return self

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

		# play sound
		SoundManager.play_sound(Cache.get_stream(Cache.data["spells"][spell_id]["sounds"]["start"]))

func _on_bullet_hit(result: Array, bulletIndex: int, _spawner: Object) -> void:
	# get collider
	var collider: Node2D = result[0]["collider"]

	# collided with lootable
	if collider is Lootable:
		# get projectile
		var projectile: BulProps = get_bullet_from_index(bulletIndex)

		# apply force
		collider.apply_central_impulse(projectile.direction)

		# play sound
		#SoundManager.play_sound(Cache.get_stream(Cache.data["spells"][spell_id]["sounds"]["success"]))
		SoundManager.play_sound(Cache.get_stream(collider.sounds["hit"]))

	# failed to hit a hit-able object
	else:
		# play sound
		SoundManager.play_sound(Cache.get_stream(Cache.data["spells"][spell_id]["sounds"]["fail"]))
