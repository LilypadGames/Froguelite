import { Enemy } from "./Enemy";
import { Player } from "./Player";
import { Projectile } from "./Projectile";

export class Camera extends Phaser.Cameras.Scene2D.Camera {
	keyQE: { Q: Phaser.Input.Keyboard.Key; E: Phaser.Input.Keyboard.Key };

	// config
	rotationSpeed: number = 0.03;

	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		width: number,
		height: number,
		zoom: number
	) {
		// pass values
		super(x, y, width, height);

		// save values
		this.scene = scene;

		// make main camera
		scene.cameras.remove(scene.cameras.main);
		scene.cameras.addExisting(this, true);

		// set camera zoom
		this.setZoom(zoom);

		// populate key inputs
		this.keyQE = {
			Q: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
			E: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
		};
	}

	handleRotation(
		objectList: Array<
			Player | Enemy | Projectile | Phaser.GameObjects.GameObject
		>
	) {
		// rotate left
		if (this.keyQE.Q.isDown) {
			// rotate cam
			this.rotation += this.rotationSpeed;

			// rotate objects counter to cameras rotation
			objectList.forEach((object) => {
				object.rotation -= this.rotationSpeed;
			});
		}
		// rotate right
		else if (this.keyQE.E.isDown) {
			// rotate cam
			this.rotation -= this.rotationSpeed;

			// rotate objects counter to cameras rotation
			objectList.forEach((object) => {
				object.rotation += this.rotationSpeed;
			});
		}
	}
}
