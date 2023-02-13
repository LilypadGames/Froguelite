import { Game } from "../scenes/Game";
import { Entity } from "./Entity";
import { Player } from "./Player";

export class Interactable extends Entity {
	scene: Game;
	tip: string;

	constructor(
		scene: Game,
		x: number,
		y: number,
		textureKey: string,
		tip: string
	) {
		// pass values
		super(scene, x, y, textureKey, "Interactable");

		// save values
		this.scene = scene;
		this.tip = tip;

		// set as sensor
		this.setSensor(true);

		// detect player collisions
		this.setOnCollide(
			(entities: Phaser.Types.Physics.Matter.MatterCollisionData) => {
				// player colliding
				if (entities.bodyB.gameObject instanceof Player) {
					this.collidePlayer(entities.bodyB.gameObject);
				}
			}
		);

		// detect end of player collision
		this.setOnCollideEnd(
			(entities: Phaser.Types.Physics.Matter.MatterCollisionData) => {
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
	interact() {}
}
