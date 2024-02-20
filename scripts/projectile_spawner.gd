class_name ProjectileSpawner extends Spawner

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
