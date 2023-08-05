// scenes
import { Game } from "../scenes/Game";

// components
import { Entity } from "./Entity";
import { Player } from "./Player";

// config
import config from "../config";

export class Interactable extends Entity {
	// info
	id: string;
	interactableType: string;
	tip: string;
	enabled: boolean = false;

	constructor(
		scene: Game,
		x: number,
		y: number,
		id: string,
		interactableType: string,
		entityType: string,
		tip: string
	) {
		// get interactable data
		let interactableData =
			scene.cache.json.get("game").interactables[interactableType];

		// pass values
		super(
			scene,
			x,
			y,
			interactableData.texture,
			"Interactable",
			entityType
		);

		// save values
		this.id = id;
		this.interactableType = interactableType;
		this.tip = tip;

		// set scale
		if (scene.cache.json.get("textures")[interactableData.texture].scale)
			this.setScale(
				scene.cache.json.get("textures")[interactableData.texture].scale
			);

		// set origin
		this.setOrigin(0.5, 0.5);

		// set depth
		this.setDepth(config.depth.interactable);

		// trigger collisions without physically colliding
		this.setSensor(true);

		// set collision filter
		this.setCollisionCategory(config.collisionGroup.interactables);
		this.setCollidesWith(config.collisionGroup.player);

		// detect collision
		this.setOnCollide(
			(entities: Phaser.Types.Physics.Matter.MatterCollisionData) =>
				this.onCollide(entities)
		);

		// detect collision end
		this.setOnCollideEnd(
			(entities: Phaser.Types.Physics.Matter.MatterCollisionData) =>
				this.onCollideEnd(entities)
		);

		// enable on spawn
		this.enabled = true;
	}

	// handle collision
	onCollide(entities: Phaser.Types.Physics.Matter.MatterCollisionData) {
		// player colliding
		if (
			this.enabled &&
			entities.bodyB.gameObject instanceof Player &&
			entities.bodyB.gameObject.active
		) {
			this.onCollidePlayer(entities.bodyB.gameObject);
		}
	}

	// handle collision end
	onCollideEnd(entities: Phaser.Types.Physics.Matter.MatterCollisionData) {
		// player no longer colliding
		if (
			this.enabled &&
			entities.bodyB.gameObject instanceof Player &&
			entities.bodyB.gameObject.active
		) {
			this.onCollidePlayerEnd(entities.bodyB.gameObject);
		}
	}

	// handle player collision
	onCollidePlayer(player: Player) {
		// show tip
		this.scene.HUD.setTip("[F] " + this.tip);

		// set last contact
		player.lastContact = this;
	}

	// handle player collision end
	onCollidePlayerEnd(player: Player) {
		// hide tip
		this.scene.HUD.setTip("");

		// remove last contact
		if (player.lastContact == this) player.lastContact = undefined;
	}

	// player interacted
	interact() {
		// end player collision
		this.onCollidePlayerEnd(this.scene.player);
	}
}
