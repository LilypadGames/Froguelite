// components
import { Interactable } from "../Interactable";
import { Spell } from "../Spell";

// config
import config from "../../config";

export class Traversable extends Phaser.Physics.Matter.Sprite {
	// info
	parent: Interactable;

	// movement
	forces: MatterJS.Vector | undefined;

	constructor(parent: Interactable) {
		// pass values
		super(parent.scene.matter.world, parent.x, parent.y, "");

		// save values
		this.parent = parent;

		// set matter body
		this.setBody(
			{
				type: "rectangle",
				width: this.parent.displayWidth,
				height: this.parent.displayHeight,
			},
			{
				isSensor: false,
				mass: 100,
				friction: 0.5,
				frictionAir: 0.5,
			}
		);

		// set collision filter
		this.setCollisionCategory(config.collisionGroup.traversable);
		this.setCollidesWith([
			config.collisionGroup.world,
			config.collisionGroup.spell,
			config.collisionGroup.enemy,
			config.collisionGroup.traversable,
		]);

		// detect collision
		this.setOnCollide(
			(entities: Phaser.Types.Physics.Matter.MatterCollisionData) =>
				this.onCollide(entities)
		);

		// listen to events
		this.parent.scene.matter.world.on(
			"beforeupdate",
			this.beforeupdate,
			this
		);
		this.parent.scene.events.on("preupdate", this.preupdate, this);
		this.once("destroy", this.onDestroy, this);
	}

	beforeupdate() {
		this.applyCachedForces();
	}

	preupdate() {
		// sync position and rotation between traversable collider and parent sensor
		this.parent.setPosition(this.x, this.y);
		this.setRotation(this.parent.rotation);
	}

	onDestroy() {
		// end event listeners
		this.scene.matter.world.off(
			"beforeupdate",
			this.beforeupdate,
			this
		);
		this.scene.events.off("preupdate", this.preupdate, this);
	}

	// handle collision
	onCollide(entities: Phaser.Types.Physics.Matter.MatterCollisionData) {
		// spell colliding
		if (
			entities.bodyB.gameObject instanceof Spell &&
			entities.bodyB.gameObject.active
		) {
			this.onCollideSpell(entities.bodyB.gameObject);
		}
	}

	// handle spell collision
	onCollideSpell(spell: Spell) {
		// cache force
		this.forces = this.scene.matter.vector.mult(
			(spell.body as MatterJS.BodyType).velocity,
			0.5
		);

		// sfx
		this.parent.scene.sceneHead.play.sound(
			this.scene.cache.json.get("game").interactables[
				this.parent.interactableType
			].sounds.hit
		);
	}

	applyCachedForces() {
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
}
