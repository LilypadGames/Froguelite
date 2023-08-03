// scenes
import { Game } from "../scenes/Game";

// components
import { LivingEntity } from "./LivingEntity";

// config
import config from "../config";
import { Spell } from "./Spell";
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
		if (!this.scene.player.isDead) this.updateMovement();
	}

	updateMovement() {
		// get movement vector
		const deltaVector = this.scene.matter.vector.sub(
			(this.scene.player.body as MatterJS.BodyType).position,
			(this.body as MatterJS.BodyType).position
		);
		const normalizedDelta = this.scene.matter.vector.normalise(deltaVector);
		const forceVector = this.scene.matter.vector.mult(normalizedDelta, 0.1);

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
		this.scene.sound.play("sfx_hit_" + Utility.random.int(1, 6));
	}
}
