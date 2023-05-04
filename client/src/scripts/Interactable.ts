// scenes
import { Game } from "../scenes/Game";

// components
import { Entity } from "./Entity";
import { Player } from "./Player";

export class Interactable extends Entity {
	scene: Game;
	tip: string;
	enabled: boolean = true;

	constructor(
		scene: Game,
		x: number,
		y: number,
		textureKey: string,
		entityType: string,
		tip: string
	) {
		// pass values
		super(scene, x, y, textureKey, "Interactable", entityType);

		// save values
		this.scene = scene;
		this.tip = tip;

		// set as sensor (not physically collidable, but still triggers collision event)
		this.setSensor(true);

		// detect player collisions
		this.setOnCollide(
			(entities: Phaser.Types.Physics.Matter.MatterCollisionData) => {
				// not enabled
				if (!this.enabled) return;

				// player colliding
				if (entities.bodyB.gameObject instanceof Player) {
					this.collidePlayer(entities.bodyB.gameObject);
				}
			}
		);

		// detect end of player collision
		this.setOnCollideEnd(
			(entities: Phaser.Types.Physics.Matter.MatterCollisionData) => {
				// not enabled
				if (!this.enabled) return;

				// player no longer colliding
				if (entities.bodyB.gameObject instanceof Player) {
					this.collideEndPlayer(entities.bodyB.gameObject);
				}
			}
		);
	}

	// player colliding with this interactable object
	collidePlayer(player: Player) {
		// show tip
		this.scene.HUD.setTip("[F] " + this.tip);

		// set last contact
		player.lastContact = this;
	}

	// player no longer colliding with this interactable object
	collideEndPlayer(player: Player) {
		// hide tip
		this.scene.HUD.setTip("");

		// remove last contact
		if (player.lastContact == this) player.lastContact = undefined;
	}

	// player interacted
	interact() {
		// end collision
		this.collideEndPlayer(this.scene.player);
	}
}
