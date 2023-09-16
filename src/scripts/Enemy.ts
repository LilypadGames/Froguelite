// scenes
import { Game } from "../scenes/Game";

// components
import { LivingEntity } from "./LivingEntity";
import { Spell } from "./Spell";

// config
import config from "../config";

// utility
import Utility from "./utility/Utility";

export class Enemy extends LivingEntity {
	// id
	id: string;

	// visuals
	animKey!: string;

	constructor(scene: Game, x: number, y: number, id: string) {
		// get enemy data
		let enemyData = scene.cache.json.get("game").enemies;

		// pass values
		super(
			scene,
			x,
			y,
			enemyData[id].texture,
			"Enemy",
			enemyData[id].type,
			enemyData[id].stats,
			enemyData[id].details
		);

		// save values
		this.id = id;

		// set name
		this.setName(this.scene.cache.json.get("lang.en_us").enemy[id]);

		// set scale
		this.setScale(enemyData[id].scale);

		// set depth
		this.setDepth(config.depth.enemy);

		// play idle anim
		this.playAnim("idle");

		// set collision filter
		this.setCollisionCategory(config.collisionGroup.enemy);
		this.setCollidesWith([
			config.collisionGroup.world,
			config.collisionGroup.player,
			config.collisionGroup.spell,
			config.collisionGroup.traversable,
		]);

		// detect specific collisions
		this.setOnCollide(
			(entities: Phaser.Types.Physics.Matter.MatterCollisionData) => {
				// collided with spell
				if (
					entities.bodyB.gameObject instanceof Spell &&
					entities.bodyB.gameObject.active
				) {
					this.collideSpell(entities.bodyB);
				}
			}
		);
	}

	preupdate() {
		super.preupdate();

		// run movement
		if (!this.scene.player.isDead) {
			this.updateDirection();
			this.updateMovement();
		}
	}

	kill() {
		// get extracted colors
		const colors = (
			this.scene.cache.custom.colorData.entries
				.entries as IExtractedColors
		)[this.textureKey];

		// colors detected
		if (colors.length > 0) {
			// detect quantity depending on colors
			const particleQuantity = 50 / colors.length;

			// play particles for each color
			for (const color in colors) {
				this.scene.add
					.particles(this.x, this.y, "death_particle", {
						quantity: particleQuantity,
						tint: Utility.hex.toDecimal(
							colors[color].hex.replace("#", "")
						),
						tintFill: true,
						lifespan: 1000,
						speed: { min: 2, max: 15 },
						alpha: { start: 1, end: 0 },
						scale: 1.5,
						emitting: false,
					})
					.setDepth(this.depth)
					.explode();
			}
		}

		// run super class's kill method
		super.kill();
	}

	updateDirection() {
		// compare position of enemy to player to get direction this enemy should face (use cos to get left/right instead of up/down)
		let direction = Math.cos(
			Phaser.Math.Angle.BetweenPoints(
				this.scene.player.getRelativePosition(this.scene.cameras.main),
				this.getRelativePosition(this.scene.cameras.main)
			)
		);

		// set direction
		this.flipX = direction > 0 ? false : true;
	}

	updateMovement() {
		// get movement vector
		const deltaVector = this.scene.matter.vector.sub(
			(this.scene.player.body as MatterJS.BodyType).position,
			(this.body as MatterJS.BodyType).position
		);
		const normalizedDelta = this.scene.matter.vector.normalise(deltaVector);
		const forceVector = this.scene.matter.vector.mult(
			normalizedDelta,
			this.stats.speed / 10
		);

		// apply force
		this.scene.matter.body.applyForce(
			this.body as MatterJS.BodyType,
			(this.body as MatterJS.BodyType).position,
			forceVector
		);
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

	collideSpell(spell: MatterJS.BodyType) {
		// cache force
		this.forces = this.scene.matter.vector.mult(spell.velocity, 1);

		// sfx
		this.scene.sceneHead.play.sound(
			this.scene.cache.json.get("game").enemies[this.id].sounds.hit
		);
	}
}
