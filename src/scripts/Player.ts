// imports
import store from "storejs";

// scenes
import { Game } from "../scenes/Game";

// components
import { Interactable } from "./Interactable";
import { LivingEntity } from "./LivingEntity";
import { Spells } from "./Spell";
import { Teleporter } from "./interactable/Teleporter";

// config
import config from "../config";
import { Enemy } from "./Enemy";
import Utility from "./utility/Utility";

export class Player extends LivingEntity {
	// interaction
	lastContact!: undefined | Interactable | Teleporter;

	// visuals
	animKey!: string;

	// movement
	turnThreshold: number = 20;
	speedDampening: number = 2;

	// attacking
	fireCooldown: number = 0;
	spells!: Spells;

	// inventory
	equipped!: playerEquipped;
	inventory!: playerInventory;

	// armor
	armor: {
		torso?: Phaser.GameObjects.Sprite;
	} = {};
	forces: MatterJS.Vector | undefined;

	constructor(scene: Game, x: number, y: number) {
		// get player data
		let playerData = scene.cache.json.get("game").player;

		// get player data
		let saveData: {
			stats: playerStats;
			equipped: playerEquipped;
			inventory: playerInventory;
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

		// set friction
		// this.setFriction(0.1,0.5);

		// set depth
		this.setDepth(config.depth.player.base);

		// initialize spells
		if (this.equipped.spell) this.equip("spell", this.equipped.spell);

		// initialize armor
		if (this.equipped.armor) this.equip("armor", this.equipped.armor);

		// detect specific collisions
		this.setOnCollide(
			(entities: Phaser.Types.Physics.Matter.MatterCollisionData) => {
				// collided with enemy
				if (entities.bodyA.gameObject instanceof Enemy) {
					this.collideEnemy(entities.bodyA);
				}
			}
		);

		// events
		scene.matter.world.on("beforeupdate", this.beforeupdate, this);
		scene.events.on("postupdate", this.postupdate, this);
	}

	onDestroy() {
		super.onDestroy();

		// remove listeners
		this.scene.matter.world.removeListener(
			"beforeupdate",
			this.beforeupdate,
			this
		);
		this.scene.events.removeListener("postupdate", this.postupdate, this);

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

	beforeupdate() {
		// apply cached forces
		if (this.forces) {
			this.scene.matter.body.applyForce(
				this.body as MatterJS.BodyType,
				(this.body as MatterJS.BodyType).position,
				this.forces
			);

			// clear forces
			delete this.forces;
		}
	}

	update() {
		super.update();

		// still alive
		if (!this.isDead) {
			// open inventory
			if (
				this.scene.sceneHead.playerInput.interaction_mapped.pressed.includes(
					"START"
				)
			)
				this.toggleInventory();

			// interact
			if (
				this.scene.sceneHead.playerInput.interaction_mapped.pressed.includes(
					"RC_W"
				)
			)
				this.checkInteract();

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
		// remove entity if not already dead
		if (!this.isDead) {
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
		}
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
		if (this.lastContact !== undefined) {
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
		if (this.scene.sceneHead.playerInput.direction.UP) {
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
		else if (this.scene.sceneHead.playerInput.direction.DOWN) {
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
		if (this.scene.sceneHead.playerInput.direction.LEFT) {
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
		else if (this.scene.sceneHead.playerInput.direction.RIGHT) {
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
		if (
			!this.scene.sceneHead.playerInput.direction.UP &&
			!this.scene.sceneHead.playerInput.direction.DOWN &&
			!this.scene.sceneHead.playerInput.direction.LEFT &&
			!this.scene.sceneHead.playerInput.direction.RIGHT
		) {
			this.setVelocity(0, 0);
		}
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

	toggleInventory() {
		// pause current scene
		this.scene.scene.pause();

		// sfx
		this.scene.sound.play("ui_open", {
			volume: this.scene.sceneHead.audio.sfx.volume.value,
		});

		// launch inventory menu
		this.scene.scene.launch("Inventory", {
			sceneHead: this.scene.sceneHead,
			scenePaused: this.scene,
		});
	}

	collideEnemy(enemy: MatterJS.BodyType) {
		// cache force
		this.forces = this.scene.matter.vector.mult(enemy.velocity, 5);

		// apply damage
		this.changeHealth(
			-((enemy.gameObject as Enemy).stats as enemyStats).strength
		);

		// sfx
		this.scene.sound.play("sfx_hit_" + Utility.random.int(1, 6));
	}
}
