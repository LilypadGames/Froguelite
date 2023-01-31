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
	velocity: number = 300;
	turnThreshold: number = 150;

	constructor() {
		super({ key: "Game" });
	}

	preload() {
		// preload core mechanics
		this.core.preload();

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

		// add player to scene
		this.player = this.addPlayer(
			window.innerWidth / 2,
			window.innerHeight / 2
		);
	}

	update() {
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
			}
			// player looking right
			else if (difference.x < -this.turnThreshold) {
				this.player.anims.play("right", true);
			}
			// player looking away from the player
			else if (difference.y > 0) {
				this.player.anims.play("back", true);
			}
			// player looking towards the player
			else if (difference.y <= 0) {
				this.player.anims.play("front", true);
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
			// move left
			this.player.setVelocityX(-this.velocity);

			// play moving left animation
			if (!this.input.activePointer.isDown)
				this.player.anims.play("left", true);
		}

		// moving right
		if (key.right.isDown) {
			// move right
			this.player.setVelocityX(this.velocity);

			// play moving right animation
			if (!this.input.activePointer.isDown)
				this.player.anims.play("right", true);
		}

		// moving up
		if (key.up.isDown) {
			// move up
			this.player.setVelocityY(-this.velocity);

			// play moving up animation
			if (!this.input.activePointer.isDown)
				this.player.anims.play("back", true);
		}

		// moving down
		if (key.down.isDown) {
			// move down
			this.player.setVelocityY(this.velocity);

			// play moving down animation
			if (!this.input.activePointer.isDown)
				this.player.anims.play("front", true);
		}

		// not moving
		if (
			!key.left.isDown &&
			!key.right.isDown &&
			!key.up.isDown &&
			!key.down.isDown
		) {
			this.player.setVelocityX(0);
			this.player.setVelocityY(0);
		}
	}

	addPlayer(x: number, y: number) {
		// create player
		let player = this.physics.add
			.sprite(x, y, "pp", 2)
			.setScale(10)
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

		return player;
	}
}
