import { Game } from "../scenes/Game";
import { Enemy } from "./Enemy";
import { Entity } from "./Entity";
import { LivingEntity } from "./LivingEntity";
import { Player } from "./Player";
import store from "storejs";

export class Camera extends Phaser.Cameras.Scene2D.Camera {
	keyQE: { Q: Phaser.Input.Keyboard.Key; E: Phaser.Input.Keyboard.Key };
	scene: Game;

	// config
	rotationSpeed: number = 0.03;
	zoomInterval: number = 1;
	zoomMax: number = 18;
	zoomMin: number = 5;
	zoomDefault: number = 8;

	constructor(
		scene: Game,
		x: number,
		y: number,
		width: number,
		height: number
	) {
		// pass values
		super(x, y, width, height);

		// save values
		this.scene = scene;

		// make main camera
		scene.cameras.remove(scene.cameras.main);
		scene.cameras.addExisting(this, true);

		// set camera zoom
		this.setZoom(store.get("settings.options.zoom") ? store.get("settings.options.zoom") : this.zoomDefault);

		// populate key inputs
		this.keyQE = {
			Q: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
			E: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
		};
		scene.input.on(
			"wheel",
			(pointer: Phaser.Input.Pointer) => {
				this.handleZoom(pointer.deltaY);
			},
			this
		);
	}

	update() {
		// rotate camera
		this.handleRotation();
	}

	// handle zoom of camera
	handleZoom(scroll: number) {
		// zoom out
		if (scroll > 0) this.zoom -= this.zoomInterval;
		// zoom in
		else if (scroll < 0) this.zoom += this.zoomInterval;

		// max
		if (this.zoom > this.zoomMax) this.zoom = this.zoomMax;
		// min
		else if (this.zoom < this.zoomMin) this.zoom = this.zoomMin;

		// store
		store.set("settings.options.zoom", this.zoom)
	}

	// handle rotation of objects that are to be fixed to camera rotation
	handleRotation() {
		// rotate left
		if (this.keyQE.Q.isDown) {
			// rotate cam
			this.rotation += this.rotationSpeed;

			// rotate objects counter to cameras rotation
			this.scene.fixedObjectsGroup
				.getChildren()
				.forEach((object: Entity | LivingEntity | Player | Enemy) => {
					object.rotation -= this.rotationSpeed;
				});
		}
		// rotate right
		else if (this.keyQE.E.isDown) {
			// rotate cam
			this.rotation -= this.rotationSpeed;

			// rotate objects counter to cameras rotation
			this.scene.fixedObjectsGroup
				.getChildren()
				.forEach((object: Entity | LivingEntity | Player | Enemy) => {
					object.rotation += this.rotationSpeed;
				});
		}
	}
}
