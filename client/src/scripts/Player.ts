import { Game } from "../scenes/Game";
import { Interactable } from "./Interactable";
import { LivingEntity } from "./LivingEntity";
import { Projectiles } from "./Projectile";
import { Teleport } from "./Teleport";

export class Player extends LivingEntity {
	// typings
	keyArrows: Phaser.Types.Input.Keyboard.CursorKeys;
	keyWASD: {
		W: Phaser.Input.Keyboard.Key;
		A: Phaser.Input.Keyboard.Key;
		S: Phaser.Input.Keyboard.Key;
		D: Phaser.Input.Keyboard.Key;
	};
	keyF: Phaser.Input.Keyboard.Key;

	// interaction
	lastContact!: undefined | Interactable | Teleport;

	// visuals
	depth: number = 10;

	// movement
	turnThreshold: number = 20;
	speedDampening: number = 1.8;

	// attacking
	fireCooldown: number = 0;
	projectiles: Projectiles;

	// stats
	speed: number;
	fireRate: number;

	constructor(scene: Game, x: number, y: number, textureKey: string) {
		// get player data
		let playerData = scene.cache.json.get("playerData");

		// pass values
		super(scene, x, y, textureKey, "Player", {
			health: playerData["health"],
			healthMax: playerData["health"],
		});

		// save values
		this.scene = scene;
		this.speed = playerData["speed"];
		this.fireRate = playerData["fireRate"];

		// populate key inputs
		this.keyArrows = scene.input.keyboard.createCursorKeys();
		this.keyWASD = {
			W: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
			A: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
			S: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
			D: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
		};
		this.keyF = scene.input.keyboard.addKey(
			Phaser.Input.Keyboard.KeyCodes.F
		);
		this.keyF.on(
			"down",
			() => {
				this.handleInteract();
			},
			this
		);

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

		// set depth (renders under/over other sprites)
		this.setDepth(this.depth);

		// initialize projectiles
		this.projectiles = new Projectiles(scene, "snot_bubble");
	}

	update() {
		// handle attacking
		if (this.scene.time.now > 2000) this.handleAttack();

		// handle movement
		this.handleMovement();
	}

	// check if player is interacting
	handleInteract() {
		if (this.keyF.isDown && this.lastContact !== undefined) {
			this.lastContact.interact();
		}
	}

	// check if player is attacking
	handleAttack() {
		// shoot projectiles
		if (
			this.scene.input.activePointer.isDown &&
			this.scene.time.now > this.fireCooldown
		) {
			// reset cooldown
			this.fireCooldown = this.scene.time.now + this.fireRate;

			// update mouse world position
			this.scene.input.activePointer.updateWorldPoint(this.scene.camera);

			// fire projectile from the current actual world player position to the current actual world mouse position
			this.projectiles.fire(
				this.x,
				this.y,
				this.scene.input.activePointer.worldX,
				this.scene.input.activePointer.worldY
			);
		}
	}

	// check if player is moving
	handleMovement() {
		// init direction
		let directionX: string = "";
		let directionY: string = "";

		// init velocity
		let velocity: number = this.speed;

		// init vector
		let vector: Phaser.Math.Vector2 = new Phaser.Math.Vector2();
		let rotatedVector: Phaser.Math.Vector2 = new Phaser.Math.Vector2();

		// get camera
		let camera = this.scene.cameras.main;

		// if pointer down, make player face the pointer
		if (this.scene.input.activePointer.isDown) {
			// get mouse position relative to the camera view
			let mouse = {
				x: this.scene.input.activePointer.x / camera.zoomX,
				y: this.scene.input.activePointer.y / camera.zoomY,
			};

			// get relative position of player to camera
			let relativePos = this.getRelativePosition(camera);

			// get difference between player position and mouse position to determine where the pointer is relative to the player
			let difference = {
				x: relativePos.x - mouse.x,
				y: relativePos.y - mouse.y,
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
			vector.y = -velocity;

			// play moving up animation
			if (!this.scene.input.activePointer.isDown)
				this.anims.play("back", true);
		}

		// moving down
		else if (key.down.isDown) {
			// determine direction
			if (directionY === "") directionY = "down";

			// determine velocity
			if (directionY !== "down")
				velocity = this.speed / this.speedDampening;

			// move down
			vector.y = velocity;

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
			vector.x = -velocity;

			// play moving left animation
			if (!this.scene.input.activePointer.isDown)
				this.anims.play("left", true);
		}

		// moving right
		else if (key.right.isDown) {
			// determine direction
			if (directionX === "") directionX = "right";

			// determine velocity
			if (directionX !== "right")
				velocity = this.speed / this.speedDampening;

			// move right
			vector.x = velocity;

			// play moving right animation
			if (!this.scene.input.activePointer.isDown)
				this.anims.play("right", true);
		}

		// rotate vector dependant on current camera rotation
		rotatedVector = this.scene.matter.vector.rotate(
			vector,
			-camera.rotation
		) as Phaser.Math.Vector2;

		// move
		this.applyForce(rotatedVector);

		// not moving
		if (
			!key.left.isDown &&
			!key.right.isDown &&
			!key.up.isDown &&
			!key.down.isDown
		) {
			this.setVelocity(0, 0);
		}
	}
}
