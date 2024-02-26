class_name ProjectileSpawner
extends Spawner

# signals
signal player_hit

# references
var timer: Timer
var spell_id: String

func setup(_spell_id: String) -> ProjectileSpawner:
	# store spell name
	spell_id = _spell_id

	# get spell data
	var spell_data: Dictionary = Cache.data["spells"][spell_id]

	# set up projectile behavior
	name = spell_id
	if spell_data.has("speed"):
		bulletType.initialSpeed = spell_data["speed"]
	if spell_data.has("collision_radius"):
		(bulletType._shape as CircleShape2D).radius = spell_data["collision_radius"]
	if spell_data.has("scale"):
		bulletType.scale = spell_data["scale"]
	if spell_data.has("lifespan"):
		bulletType.maxLifetime = spell_data["lifespan"]
	if spell_data.has("fire_buffer"):
		fireRate = spell_data["fire_buffer"]
	if spell_data.has("fire_radius"):
		(bulletType._shape as CircleShape2D).radius = spell_data["fire_radius"]
	if spell_data.has("quantity"):
		bulletsPerRadius = spell_data["quantity"]
	if spell_data.has("radii"):
		numberOfRadii = spell_data["radii"]
	if spell_data.has("spin"):
		if spell_data["spin"].has("rate"):
			spinRate = spell_data["spin"]["rate"]
		if spell_data["spin"].has("min"):
			minSpin = spell_data["spin"]["min"]
		if spell_data["spin"].has("max"):
			maxSpin = spell_data["spin"]["max"]
		if spell_data["spin"].has("acceleration"):
			spinAcceleration = spell_data["spin"]["acceleration"]
		if spell_data["spin"].has("restart_on_cycle"):
			restartAtSpin = spell_data["spin"]["restart_on_cycle"]
	if spell_data.has("random_radius"):
		randomStart = true
		randomRadius = spell_data["random_radius"]

	# set up projectile texture
	var texture_data = Cache.registry["textures"][spell_data["texture"]]
	if typeof(texture_data) == TYPE_STRING:
		texture = load(texture_data)
	else:
		texture = load(texture_data["spritesheet"])
		var texture_size = (texture as Texture2D).get_size()
		rowsInAtlas = texture_size.x / texture_data["frame_width"]
		columnsInAtlas = texture_size.y / texture_data["frame_height"]
		bulletType.animationSpeed = texture_data["animations"]["active"]["frame_rate"]

	return self

func fire(direction: Vector2 = Vector2.ZERO) -> void:
	# init timer
	if not timer:
		timer = get_child(0)

	# check fire rate
	if timer.is_stopped():
		# fire projectile
		if direction == Vector2.ZERO:
			set_manual_start(true)
		else:
			spawn_bullet_self(direction)

		# start fire rate timer
		timer.start()

		# play sound
		if Cache.data["spells"][spell_id].has("sounds") and Cache.data["spells"][spell_id]["sounds"].has("start"):
			SoundManager.play_sound(Cache.get_stream(Cache.data["spells"][spell_id]["sounds"]["start"]))

func _on_bullet_hit(result: Array, bulletIndex: int, _spawner: Object) -> void:
	# get collider
	var collider: Node2D = result[0]["collider"]

	# collided with lootable
	if collider is Player:
		# delete all projectiles
		player_hit.emit()

	elif collider is Lootable:
		# get projectile
		var projectile: BulProps = get_bullet_from_index(bulletIndex)

		# apply force
		collider.apply_central_impulse(projectile.direction)

		# play sound
		if collider.sounds.has("hit"):
			SoundManager.play_sound(Cache.get_stream(collider.sounds["hit"]))

	# failed to hit a hit-able object
	else:
		if Cache.data["spells"][spell_id].has("sounds") and Cache.data["spells"][spell_id]["sounds"].has("fail"):
			# play sound
			SoundManager.play_sound(Cache.get_stream(Cache.data["spells"][spell_id]["sounds"]["fail"]))
