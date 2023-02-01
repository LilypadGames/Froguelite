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
	velocity: number = 30;
	velocityDampening: number = 1.8;
	turnThreshold: number = 150;

	constructor() {
		super({ key: "Game" });
	}

	preload() {
		// preload core mechanics
		this.core.preload();

		// load world
		this.load.image("world_tiles", "assets/world/tiles.png");
		this.load.tilemapTiledJSON("riverside", "assets/world/riverside.json");

		// player character sprite sheet
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
		const map = this.make.tilemap({ key: "riverside" });
		const tileset = map.addTilesetImage("tiles", "world_tiles");
		map.createLayer(
			"Grass",
			tileset,
			window.innerWidth / 2,
			window.innerHeight / 2
		);
		map.createLayer(
			"Water",
			tileset,
			window.innerWidth / 2,
			window.innerHeight / 2
		);

		// add player to scene
		this.player = this.addPlayer(
			window.innerWidth / 2,
			window.innerHeight / 2
		);

		// set up camera
		this.cameras.main.startFollow(this.player, false, 1, 1, 0, 0);
		this.cameras.main.setZoom(8);

		// fade in to begin
		// this.cameras.main.fadeIn();
	}

	update() {
		// init direction
		let direction: string = "";

		// init velocity
		let velocity: number = this.velocity;

		// if pointer down, make player face the pointer
		if (this.input.activePointer.isDown) {
			let mouse = {
				x: this.input.activePointer.x,
				y: this.input.activePointer.y,
			};
			let player = { x: this.player.x, y: this.player.y };
			let difference = {
				x: player.x - mouse.x,
				y: player.y - mouse.y,
			};

			// player looking left
			if (difference.x > this.turnThreshold) {
				this.player.anims.play("left", true);
				direction = "left";
			}
			// player looking right
			else if (difference.x < -this.turnThreshold) {
				this.player.anims.play("right", true);
				direction = "right";
			}
			// player looking away from the player
			else if (difference.y > 0) {
				this.player.anims.play("back", true);
				direction = "up";
			}
			// player looking towards the player
			else if (difference.y <= 0) {
				this.player.anims.play("front", true);
				direction = "down";
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

		// moving left
		if (key.left.isDown) {
			// determine direction
			if (direction == "") direction = "left";

			// determine velocity
			if (direction !== "left")
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
			if (direction === "") direction = "right";

			// determine velocity
			if (direction !== "right")
				velocity = this.velocity / this.velocityDampening;

			// move right
			this.player.setVelocityX(velocity);

			// play moving right animation
			if (!this.input.activePointer.isDown)
				this.player.anims.play("right", true);
		}

		// moving up
		if (key.up.isDown) {
			// determine direction
			if (direction === "") direction = "up";

			// determine velocity
			if (direction !== "up")
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
			if (direction === "") direction = "down";

			// determine velocity
			if (direction !== "down")
				velocity = this.velocity / this.velocityDampening;

			// move down
			this.player.setVelocityY(velocity);

			// play moving down animation
			if (!this.input.activePointer.isDown)
				this.player.anims.play("front", true);
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

	addPlayer(x: number, y: number) {
		// create player
		let player = this.physics.add.sprite(x, y, "pp").setOrigin(0.5, 0.5);

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

		return player;
	}
}
