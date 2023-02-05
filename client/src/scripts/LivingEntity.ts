import { Entity } from "./Entity";

export class LivingEntity extends Entity {
	isDead: boolean;
	textureKey: string;

	constructor(scene: Phaser.Scene, x: number, y: number, textureKey: string) {
		// pass values
		super(scene, x, y, textureKey);

		// save values
		this.scene = scene;
		this.textureKey = textureKey;
		this.isDead = false;
	}

	// kill entity
	kill() {
		// remove entity if not already dead
		if (!this.isDead) {
			this.isDead = true;
			this.destroy();
		}
	}
}
