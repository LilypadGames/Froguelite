import { Core } from "./internal/Core";

//
// This is the actual game. Every level of actual gameplay is handled by this scene. The level and its information is passed to this scene and is then populated.
//

export class Game extends Core {
	// typings
	keyArrows!: Phaser.Types.Input.Keyboard.CursorKeys;
	player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
	keyWASD!: {
		W: Phaser.Input.Keyboard.Key;
		A: Phaser.Input.Keyboard.Key;
		S: Phaser.Input.Keyboard.Key;
		D: Phaser.Input.Keyboard.Key;
	};
	keyQE!: {
		Q: Phaser.Input.Keyboard.Key;
		E: Phaser.Input.Keyboard.Key;
	};

	// config
	speed: number = 50;
	speedDampening: number = 1.8;
	turnThreshold: number = 20;
	rotationSpeed: number = 0.03;

	// world
	collisionLayers: Array<Phaser.Tilemaps.TilemapLayer> = [];
	spawnpoint: any;

	constructor() {
		super({ key: "Game" });
	}

	preload() {
		// preload core mechanics
		this.core.preload();

		// load world
		this.load.image("world_tiles", "assets/world/tiles.png");
		this.load.tilemapTiledJSON("riverside", "assets/world/riverside.json");

		// load player character sprite sheet
		this.load.spritesheet("pp", "assets/character/pp.png", {
			frameWidth: 9,
			frameHeight: 7,
			spacing: 1,
		});
	}

	create() {
		// create core mechanics
		this.core.create();

		// populate key inputs
		this.keyArrows = this.input.keyboard.createCursorKeys();
		this.keyWASD = {
			W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
			A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
			S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
			D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
		};
		this.keyQE = {
			Q: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
			E: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
		};

		// create world
		this.createWorld();

		// add player to world
		this.player = this.addPlayer(this.spawnpoint.x, this.spawnpoint.y);

		// set up camera to follow player and resize view
		this.cameras.main.startFollow(this.player, false, 1, 1, 0, 0);
		this.cameras.main.setZoom(8);

		// fade in to begin
		// this.cameras.main.fadeIn();
	}

	update() {
		// handle camera
		this.handleCameraControls();

		// handle player movement
		this.handlePlayerMovement();
	}

	// handle camera controls
	handleCameraControls() {
		// rotate left
		if (this.keyQE.Q.isDown) {
			this.rotateView("left");
		}
		// rotate right
		else if (this.keyQE.E.isDown) {
			this.rotateView("right");
		}
	}

	// rotate entire view with objects remaining straight
	rotateView(direction: string) {
		// get cam
		const cam = this.cameras.main;

		// rotate view to the left
		if (direction === "left") {
			// rotate cam
			cam.rotation += this.rotationSpeed;

			// rotate player
			this.player.rotation -= this.rotationSpeed;
		}
		// rotate view to the right
		else if (direction === "right") {
			// rotate cam
			cam.rotation -= this.rotationSpeed;

			// rotate player
			this.player.rotation += this.rotationSpeed;
		}
	}

	// handle player movement and direction
	handlePlayerMovement() {
		// init direction
		let directionX: string = "";
		let directionY: string = "";

		// init velocity
		let velocity: number = this.speed;

		// init vector
		let vector: Phaser.Math.Vector2 = new Phaser.Math.Vector2();

		// if pointer down, make player face the pointer
		if (this.input.activePointer.isDown) {
			// get mouse position relative to the camera view
			let mouse = {
				x: this.input.activePointer.x / this.cameras.main.zoomX,
				y: this.input.activePointer.y / this.cameras.main.zoomY,
			};

			// get player position relative to the camera view
			let player = {
				x: this.cameras.main.worldView.width / 2,
				y: this.cameras.main.worldView.height / 2,
			};

			// get difference between player position and mouse position to determine where the pointer is relative to the player
			let difference = {
				x: player.x - mouse.x,
				y: player.y - mouse.y,
			};

			// player looking left
			if (difference.x > this.turnThreshold) {
				this.player.anims.play("left", true);
				directionX = "left";
			}
			// player looking right
			else if (difference.x < -this.turnThreshold) {
				this.player.anims.play("right", true);
				directionX = "right";
			}
			// player looking away from the player
			else if (difference.y > 0) {
				this.player.anims.play("back", true);
				directionY = "up";
			}
			// player looking towards the player
			else if (difference.y <= 0) {
				this.player.anims.play("front", true);
				directionY = "down";
			}
		}

		// get keyboard presses
		let key = {
			left: {
				isDown: this.keyArrows.left.isDown
					? this.keyArrows.left.isDown
					: this.keyWASD.A.isDown,
			},
			right: {
				isDown: this.keyArrows.right.isDown
					? this.keyArrows.right.isDown
					: this.keyWASD.D.isDown,
			},
			up: {
				isDown: this.keyArrows.up.isDown
					? this.keyArrows.up.isDown
					: this.keyWASD.W.isDown,
			},
			down: {
				isDown: this.keyArrows.down.isDown
					? this.keyArrows.down.isDown
					: this.keyWASD.S.isDown,
			},
		};

		// moving up
		if (key.up.isDown) {
			// determine direction
			if (directionY === "") directionY = "up";

			// determine velocity
			if (directionY !== "up")
				velocity = this.speed / this.speedDampening;

			// move up
			vector = this.physics.velocityFromRotation(
				this.player.rotation,
				-velocity
			);
			[vector.x, vector.y] = [vector.y * -1, vector.x];

			// play moving up animation
			if (!this.input.activePointer.isDown)
				this.player.anims.play("back", true);
		}

		// moving down
		if (key.down.isDown) {
			// determine direction
			if (directionY === "") directionY = "down";

			// determine velocity
			if (directionY !== "down")
				velocity = this.speed / this.speedDampening;

			// move down
			vector = this.physics.velocityFromRotation(
				this.player.rotation,
				velocity
			);
			[vector.x, vector.y] = [vector.y * -1, vector.x];

			// play moving down animation
			if (!this.input.activePointer.isDown)
				this.player.anims.play("front", true);
		}

		// moving left
		if (key.left.isDown) {
			// determine direction
			if (directionX == "") directionX = "left";

			// determine velocity
			if (directionX !== "left")
				velocity = this.speed / this.speedDampening;

			// move left
			let newVector = this.physics.velocityFromRotation(
				this.player.rotation,
				-velocity
			);

			// merge with up/down vector to move diagonally
			vector.x = vector.x + newVector.x;
			vector.y = vector.y + newVector.y;

			// play moving left animation
			if (!this.input.activePointer.isDown)
				this.player.anims.play("left", true);
		}

		// moving right
		if (key.right.isDown) {
			// determine direction
			if (directionX === "") directionX = "right";

			// determine velocity
			if (directionX !== "right")
				velocity = this.speed / this.speedDampening;

			// move right
			let newVector = this.physics.velocityFromRotation(
				this.player.rotation,
				velocity
			);

			// merge with up/down vector to move diagonally
			vector.x = vector.x + newVector.x;
			vector.y = vector.y + newVector.y;

			// play moving right animation
			if (!this.input.activePointer.isDown)
				this.player.anims.play("right", true);
		}

		// move
		this.player.setVelocity(vector.x, vector.y);

		// not moving
		if (
			!key.left.isDown &&
			!key.right.isDown &&
			!key.up.isDown &&
			!key.down.isDown
		) {
			this.player.setVelocity(0);
		}
	}

	// create tilemap world
	createWorld() {
		// make map
		const map = this.make.tilemap({ key: "riverside" });
		const tileset = map.addTilesetImage("tiles", "world_tiles");

		// add layers
		map.createLayer("Grass", tileset, 0, 0);
		map.createLayer("Sand", tileset, 0, 0);
		this.collisionLayers.push(map.createLayer("Water", tileset, 0, 0));
		this.collisionLayers.push(map.createLayer("Bounds", tileset, 0, 0));

		// get spawnpoint
		this.spawnpoint = map.findObject(
			"Objects",
			(obj) => obj.name === "Spawn"
		);

		// get enemies
		map.filterObjects("Objects", (obj) =>
			obj.name.includes("Enemy")
		).forEach((obj) => {
			this.spawnEnemy(
				obj.name.split(",")[1].replace(" ", ""),
				typeof obj.x === "number" ? obj.x : 0,
				typeof obj.y === "number" ? obj.y : 0
			);
		});
	}

	// add player to world
	addPlayer(x: number, y: number) {
		// create player
		let player = this.physics.add
			.sprite(x, y, "pp", "2")
			.setOrigin(0.5, 0.5);

		// make player collide with world bounds
		player.setCollideWorldBounds(true);

		// create anims
		this.anims.create({
			key: "left",
			frames: this.anims.generateFrameNumbers("pp", { start: 0, end: 0 }),
			frameRate: 1,
			repeat: -1,
		});
		this.anims.create({
			key: "right",
			frames: this.anims.generateFrameNumbers("pp", { start: 1, end: 1 }),
			frameRate: 1,
			repeat: -1,
		});
		this.anims.create({
			key: "front",
			frames: this.anims.generateFrameNumbers("pp", { start: 2, end: 2 }),
			frameRate: 1,
			repeat: -1,
		});
		this.anims.create({
			key: "back",
			frames: this.anims.generateFrameNumbers("pp", { start: 3, end: 3 }),
			frameRate: 1,
			repeat: -1,
		});

		// add collisions
		this.collisionLayers.forEach((layer) => {
			layer.setCollisionByExclusion([-1]);
			this.physics.add.collider(player, layer);
		});

		return player;
	}

	// spawn enemy
	spawnEnemy(id: string, x: number, y: number) {
		// get enemy data
		let enemyData = this.cache.json.get("enemyData");

		// add enemy
		this.physics.add.sprite(x, y, id).setScale(enemyData[id]["scale"]);
	}
}
