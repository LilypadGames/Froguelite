import { Game } from "../scenes/Game";
import { LivingEntity } from "./LivingEntity";
import { Projectiles } from "./Projectile";

export class Player extends LivingEntity {
	// typings
	keyArrows!: Phaser.Types.Input.Keyboard.CursorKeys;
	keyWASD!: {
		W: Phaser.Input.Keyboard.Key;
		A: Phaser.Input.Keyboard.Key;
		S: Phaser.Input.Keyboard.Key;
		D: Phaser.Input.Keyboard.Key;
	};

	// visuals
	depth: number = 10;

	// stats
	speed: number = 50;
	speedDampening: number = 1.8;
	turnThreshold: number = 20;
	fireRate: number = 300;

	// attack
	fireCooldown: number = 0;
	projectiles: Projectiles;

	constructor(scene: Game, x: number, y: number, textureKey: string) {
		// pass values
		super(scene, x, y, textureKey);

		// save values
		this.scene = scene;

		// populate key inputs
		this.keyArrows = scene.input.keyboard.createCursorKeys();
		this.keyWASD = {
			W: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
			A: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
			S: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
			D: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
		};

		// create anims
		scene.anims.create({
			key: "left",
			frames: this.anims.generateFrameNumbers(textureKey, {
				start: 0,
				end: 0,
			}),
			frameRate: 1,
			repeat: -1,
		});
		scene.anims.create({
			key: "right",
			frames: this.anims.generateFrameNumbers(textureKey, {
				start: 1,
				end: 1,
			}),
			frameRate: 1,
			repeat: -1,
		});
		scene.anims.create({
			key: "front",
			frames: this.anims.generateFrameNumbers(textureKey, {
				start: 2,
				end: 2,
			}),
			frameRate: 1,
			repeat: -1,
		});
		scene.anims.create({
			key: "back",
			frames: this.anims.generateFrameNumbers(textureKey, {
				start: 3,
				end: 3,
			}),
			frameRate: 1,
			repeat: -1,
		});

		// default frame
		this.setFrame(2);

		// make player collide with world bounds
		// this.setCollideWorldBounds(true);

		// set depth (renders under/over other sprites)
		this.setDepth(this.depth);

		// initialize projectiles
		this.projectiles = new Projectiles(scene, "snot_bubble");
	}

	update() {
		// handle attacking
		this.handleAttack();

		// handle movement
		this.handleMovement();
	}

	handleAttack() {
		// shoot projectiles
		if (
			this.scene.input.activePointer.isDown &&
			this.scene.time.now > this.fireCooldown
		) {
			// reset cooldown
			this.fireCooldown = this.scene.time.now + this.fireRate;

			// fire projectile from the current actual world player position to the current actual world mouse position
			this.projectiles.fire(
				this.x,
				this.y,
				this.scene.input.activePointer.worldX,
				this.scene.input.activePointer.worldY
			);
		}
	}

	handleMovement() {
		// init direction
		let directionX: string = "";
		let directionY: string = "";

		// init velocity
		let velocity: number = this.speed;

		// init vector
		let vector: Phaser.Math.Vector2 = new Phaser.Math.Vector2();

		// if pointer down, make player face the pointer
		if (this.scene.input.activePointer.isDown) {
			// get mouse position relative to the camera view
			let mouse = {
				x:
					this.scene.input.activePointer.x /
					this.scene.cameras.main.zoomX,
				y:
					this.scene.input.activePointer.y /
					this.scene.cameras.main.zoomY,
			};

			// get player position relative to the camera view
			let player = {
				x: this.scene.cameras.main.worldView.width / 2,
				y: this.scene.cameras.main.worldView.height / 2,
			};

			// get difference between player position and mouse position to determine where the pointer is relative to the player
			let difference = {
				x: player.x - mouse.x,
				y: player.y - mouse.y,
			};

			// player looking left
			if (difference.x > this.turnThreshold) {
				this.anims.play("left", true);
				directionX = "left";
			}
			// player looking right
			else if (difference.x < -this.turnThreshold) {
				this.anims.play("right", true);
				directionX = "right";
			}
			// player looking away from the player
			else if (difference.y > 0) {
				this.anims.play("back", true);
				directionY = "up";
			}
			// player looking towards the player
			else if (difference.y <= 0) {
				this.anims.play("front", true);
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
			vector = this.scene.physics.velocityFromRotation(
				this.rotation,
				-velocity
			);
			[vector.x, vector.y] = [vector.y * -1, vector.x];

			// play moving up animation
			if (!this.scene.input.activePointer.isDown)
				this.anims.play("back", true);
		}

		// moving down
		if (key.down.isDown) {
			// determine direction
			if (directionY === "") directionY = "down";

			// determine velocity
			if (directionY !== "down")
				velocity = this.speed / this.speedDampening;

			// move down
			vector = this.scene.physics.velocityFromRotation(
				this.rotation,
				velocity
			);
			[vector.x, vector.y] = [vector.y * -1, vector.x];

			// play moving down animation
			if (!this.scene.input.activePointer.isDown)
				this.anims.play("front", true);
		}

		// moving left
		if (key.left.isDown) {
			// determine direction
			if (directionX == "") directionX = "left";

			// determine velocity
			if (directionX !== "left")
				velocity = this.speed / this.speedDampening;

			// move left
			let newVector = this.scene.physics.velocityFromRotation(
				this.rotation,
				-velocity
			);

			// merge with up/down vector to move diagonally
			vector.x = vector.x + newVector.x;
			vector.y = vector.y + newVector.y;

			// play moving left animation
			if (!this.scene.input.activePointer.isDown)
				this.anims.play("left", true);
		}

		// moving right
		if (key.right.isDown) {
			// determine direction
			if (directionX === "") directionX = "right";

			// determine velocity
			if (directionX !== "right")
				velocity = this.speed / this.speedDampening;

			// move right
			let newVector = this.scene.physics.velocityFromRotation(
				this.rotation,
				velocity
			);

			// merge with up/down vector to move diagonally
			vector.x = vector.x + newVector.x;
			vector.y = vector.y + newVector.y;

			// play moving right animation
			if (!this.scene.input.activePointer.isDown)
				this.anims.play("right", true);
		}

		// move
		this.setVelocity(vector.x, vector.y);

		// not moving
		if (
			!key.left.isDown &&
			!key.right.isDown &&
			!key.up.isDown &&
			!key.down.isDown
		) {
			this.setVelocity(0);
		}
	}
}
