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

	// config
	velocity: number = 50;
	velocityDampening: number = 1.8;
	turnThreshold: number = 20;

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
		// handle player movement
		this.handlePlayerMovement();
	}

	// handle player movement and direction
	handlePlayerMovement() {
		// init direction
		let directionX: string = "";
		let directionY: string = "";

		// init velocity
		let velocity: number = this.velocity;

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
				velocity = this.velocity / this.velocityDampening;

			// move up
			this.player.setVelocityY(-velocity);

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
				velocity = this.velocity / this.velocityDampening;

			// move down
			this.player.setVelocityY(velocity);

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
				velocity = this.velocity / this.velocityDampening;

			// move left
			this.player.setVelocityX(-velocity);

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
				velocity = this.velocity / this.velocityDampening;

			// move right
			this.player.setVelocityX(velocity);

			// play moving right animation
			if (!this.input.activePointer.isDown)
				this.player.anims.play("right", true);
		}

		// not moving left or right
		if (!key.left.isDown && !key.right.isDown) {
			this.player.setVelocityX(0);
		}

		// not moving up or down
		if (!key.up.isDown && !key.down.isDown) {
			this.player.setVelocityY(0);
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
			"Spawn",
			(obj) => obj.name === "Spawn Point"
		);
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
}
