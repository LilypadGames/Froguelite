// imports
import store from "storejs";

// scenes
import { Game } from "../scenes/Game";

// components
import { Interactable } from "./Interactable";
import { LivingEntity } from "./LivingEntity";
import { Spells } from "./Spell";
import { Teleporter } from "./interactable/Teleporter";
import { Enemy } from "./Enemy";

// config
import config from "../config";

export class Player extends LivingEntity {
	// interaction
	lastContact!: undefined | null | Interactable | Teleporter;

	// visuals
	animKey!: string;

	// movement
	currentMoveInputs: Array<string> = [];
	turnThreshold: number = 20;
	speedDampening: number = 2;

	// attacking
	fireCooldown: number = 0;
	spells!: Spells;

	// inventory
	equipped!: IPlayerEquippedItems;
	inventory!: IPlayerInventory;

	// armor
	armor: {
		torso?: Phaser.GameObjects.Sprite;
	} = {};

	// animation
	moveAnimation!: Phaser.Tweens.Tween;

	constructor(scene: Game, x: number, y: number) {
		// get player data
		let playerData = scene.cache.json.get("game").player;

		// get player save data
		let saveData: {
			stats: IPlayerStats;
			equipped: IPlayerEquippedItems;
			inventory: IPlayerInventory;
		} =
			store.get("saveData") && store.get("saveData").player
				? JSON.parse(store.get("saveData").player)
				: undefined;

		// pass values
		super(
			scene,
			x,
			y,
			playerData.texture,
			"Player",
			playerData.type,
			saveData ? saveData.stats : playerData.stats,
			playerData.details
		);

		// save values
		this.equipped = saveData ? saveData.equipped : playerData.equipped;
		this.inventory = saveData ? saveData.inventory : playerData.inventory;

		// scale
		this.setScale(playerData.scale);

		// default anim
		this.playAnim("front");

		// set depth
		this.setDepth(config.depth.player.base);

		// set collision filter
		this.setCollisionCategory(config.collisionGroup.player);
		this.setCollidesWith([
			config.collisionGroup.world,
			config.collisionGroup.enemy,
			config.collisionGroup.interactables,
		]);

		// initialize spells
		if (this.equipped.spell) this.equip("spell", this.equipped.spell);

		// initialize armor
		if (this.equipped.armor) this.equip("armor", this.equipped.armor);

		// detect specific collisions
		this.setOnCollide(
			(entities: Phaser.Types.Physics.Matter.MatterCollisionData) => {
				// collided with enemy
				if (
					entities.bodyA.gameObject instanceof Enemy &&
					entities.bodyA.gameObject.active
				) {
					this.collideEnemy(entities.bodyA);
				}
			}
		);

		// events
		scene.events.on("postupdate", this.postupdate, this);

		// input events
		scene.sceneHead.events.on("input_up", () => {
			this.currentMoveInputs.push("UP");
		});
		scene.sceneHead.events.on("input_down", () => {
			this.currentMoveInputs.push("DOWN");
		});
		scene.sceneHead.events.on("input_left", () => {
			this.currentMoveInputs.push("LEFT");
		});
		scene.sceneHead.events.on("input_right", () => {
			this.currentMoveInputs.push("RIGHT");
		});
	}

	onDestroy() {
		super.onDestroy();

		// remove listeners
		this.scene.events.off("postupdate", this.postupdate, this);

		// save player data
		store.set(
			"saveData",
			JSON.stringify({
				player: {
					stats: this.stats,
					equipped: this.equipped,
					inventory: this.inventory,
				},
			})
		);
	}

	update() {
		super.update();

		// still alive
		if (!this.isDead) {
			// handle attacking
			if (this.scene.time.now > 2000) this.handleAttack();

			// handle movement
			this.handleMovement();
		}
	}

	// update visuals
	postupdate() {
		this.updateArmor();
	}

	// kill player
	kill() {
		// not alive
		if (this.isDead) return Error("Player is not alive.");

		// hide health bar
		if (this.healthbar !== undefined) this.healthbar.hide();

		// hide entity
		this.isDead = true;

		// death animation
		this.scene.tweens.add({
			targets: this,
			scale: 0.01,
			duration: 800,
			ease: "Sine.easeOut",
			onComplete: () => {
				// ppPoof animation
				const poof = this.scene.add
					.sprite(this.x, this.y, "poof")
					.setOrigin(0.5)
					.setScale(0.2)
					.setDepth(config.depth.particle)
					.on("animationcomplete", () => poof.destroy())
					.play("poof_run");

				// hide player sprite
				this.hide();
			},
		});

		return;
	}

	// revive player
	revive() {
		// not dead
		if (!this.isDead) return Error("Player is not dead.");

		// un-deadify
		this.isDead = false;

		// reset health
		this.setHealth(this.stats.healthMax);

		// show
		this.show();

		// ppPoof animation
		const poof = this.scene.add
			.sprite(this.x, this.y, "poof")
			.setOrigin(0.5)
			.setScale(0.2)
			.setDepth(config.depth.particle)
			.on("animationcomplete", () => poof.destroy())
			.play("poof_run");

		// success
		return;
	}

	playAnim(key: string) {
		// check if exists
		if (!this.anims.animationManager.exists(this.texture.key + "_" + key))
			return;

		// save anim key
		this.animKey = key;

		// set anim
		this.anims.play(this.texture.key + "_" + key, true);
	}

	// update armor layers to match position and anim of player
	updateArmor() {
		// no armor
		if (!this.armor) return;

		// loop through layers
		for (const armorLayer in this.armor) {
			// get layer
			let layer = this.armor[armorLayer as "torso"];

			// check if set
			if (!layer) return;

			// update position
			layer.setPosition(this.x, this.y);

			// update scale
			layer.setScale(this.scale);

			// update anim
			if (
				this.animKey &&
				this.animKey !==
					layer.anims.currentAnim?.key.replace(
						layer?.texture.key + "_",
						""
					)
			)
				layer.play(layer?.texture.key + "_" + this.animKey, true);

			// update rotation
			layer.rotation = this.rotation;
		}
	}

	// check if player is interacting
	checkInteract() {
		if (this.lastContact != null) {
			this.lastContact.interact();
		}
	}

	// check if player is attacking
	handleAttack() {
		// shoot spells
		if (
			this.scene.input.activePointer.isDown &&
			this.scene.time.now > this.fireCooldown
		) {
			// reset cooldown
			this.fireCooldown =
				this.scene.time.now +
				Number(
					this.scene.cache.json.get("game").spells[
						this.equipped.spell
					].firerate
				);

			// update mouse world position
			this.scene.input.activePointer.updateWorldPoint(this.scene.camera);

			// fire spell from the current actual world player position to the current actual world mouse position
			this.spells.fire(
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
		let velocity: number = this.stats.speed;

		// init vector
		let vector: Phaser.Math.Vector2 = new Phaser.Math.Vector2();
		let rotatedVector: Phaser.Math.Vector2 = new Phaser.Math.Vector2();

		// get camera
		let camera = this.scene.cameras.main;

		// if pointer down, make player face the pointer
		if (this.scene.input.activePointer.isDown) {
			// get pointer position relative to the camera view
			let pointer = this.scene.input.activePointer;

			// get relative position of player to camera
			let relativePos = this.getRelativePosition(camera);

			// get difference between player position and pointer position to determine where the pointer is relative to the player
			let difference = {
				x: relativePos.x - pointer.x,
				y: relativePos.y - pointer.y,
			};

			// player looking left
			if (difference.x > this.turnThreshold) {
				// play anim
				this.playAnim("left");

				// set direction
				directionX = "left";
			}
			// player looking right
			else if (difference.x < -this.turnThreshold) {
				// play anim
				this.playAnim("right");

				// set direction
				directionX = "right";
			}
			// player looking away from the player
			else if (difference.y > 0) {
				// play anim
				this.playAnim("back");

				// set direction
				directionY = "up";
			}
			// player looking towards the player
			else if (difference.y <= 0) {
				// play anim
				this.playAnim("front");

				// set direction
				directionY = "down";
			}
		}

		// moving up
		if (this.currentMoveInputs.includes("UP")) {
			// determine direction
			if (directionY === "") directionY = "up";

			// determine velocity
			if (directionY !== "up")
				velocity = this.stats.speed / this.speedDampening;

			// move up
			vector.y = -velocity;

			// play moving up animation
			if (!this.scene.input.activePointer.isDown)
				// play anim
				this.playAnim("back");
		}

		// moving down
		else if (this.currentMoveInputs.includes("DOWN")) {
			// determine direction
			if (directionY === "") directionY = "down";

			// determine velocity
			if (directionY !== "down")
				velocity = this.stats.speed / this.speedDampening;

			// move down
			vector.y = velocity;

			// play moving down animation
			if (!this.scene.input.activePointer.isDown)
				// play anim
				this.playAnim("front");
		}

		// moving left
		if (this.currentMoveInputs.includes("LEFT")) {
			// determine direction
			if (directionX === "") directionX = "left";

			// determine velocity
			if (directionX !== "left")
				velocity = this.stats.speed / this.speedDampening;

			// move left
			vector.x = -velocity;

			// play moving left animation
			if (!this.scene.input.activePointer.isDown)
				// play anim
				this.playAnim("left");
		}

		// moving right
		else if (this.currentMoveInputs.includes("RIGHT")) {
			// determine direction
			if (directionX === "") directionX = "right";

			// determine velocity
			if (directionX !== "right")
				velocity = this.stats.speed / this.speedDampening;

			// move right
			vector.x = velocity;

			// play moving right animation
			if (!this.scene.input.activePointer.isDown)
				// play anim
				this.playAnim("right");
		}

		// half speed if traveling diagonally
		if (vector.x && vector.y)
			[vector.x, vector.y] = [vector.x / 1.5, vector.y / 1.5];

		// rotate vector dependant on current camera rotation
		rotatedVector = this.scene.matter.vector.rotate(
			vector,
			-(camera as any).rotation
		) as Phaser.Math.Vector2;

		// move
		this.applyForce(rotatedVector);

		// not moving
		if (this.currentMoveInputs.length == 0) {
			this.setVelocity(0, 0);
		}
		// moving
		else {
			// ppHop animation
			if (!this.moveAnimation || !this.moveAnimation.isActive())
				this.moveAnimation = this.scene.tweens.add({
					targets: [this, this.armor.torso],
					displayOriginY: 5,
					duration: 150,
					yoyo: true,
					ease: "Sine.easeOut",
				});
		}

		// reset movement inputs
		this.currentMoveInputs = [];
	}

	equip(inventoryType: "armor" | "spell", item: string) {
		// set equipped item
		this.equipped[inventoryType] = item;

		// update spell
		if (inventoryType === "spell") {
			// destroy current spells
			if (this.spells) this.spells.destroy();

			// new spell
			this.spells = new Spells(this.scene, this.equipped.spell);
		}

		// update armor
		else if (inventoryType === "armor") {
			// set armor layer
			this.armor.torso = new Phaser.GameObjects.Sprite(
				this.scene,
				0,
				0,
				item
			)
				.setDepth(config.depth.player.armor)
				.setOrigin(0.5, 0.5)
				.addToDisplayList();

			// update visuals
			this.updateArmor();
		}
	}

	unequip(inventoryType: "armor") {
		// remove equipped item
		this.equipped[inventoryType] = undefined;

		// update armor
		if (inventoryType === "armor") {
			// set armor layer
			this.armor.torso?.destroy();
		}
	}

	collideEnemy(enemy: MatterJS.BodyType) {
		// cache force
		this.forces = this.scene.matter.vector.mult(enemy.velocity, 5);

		// apply damage
		this.changeHealth(
			-((enemy.gameObject as Enemy).stats as IEnemyStats).strength
		);

		// sfx
		this.scene.sceneHead.play.sound(
			this.scene.cache.json.get("game").player.sounds.hit
		);
	}
}
