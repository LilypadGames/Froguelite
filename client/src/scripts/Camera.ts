// imports
import { GameObjects } from "phaser";
import store from "storejs";

// scenes
import { Game } from "../scenes/Game";

export class Camera extends Phaser.Cameras.Scene2D.Camera {
	keyQE: { Q: Phaser.Input.Keyboard.Key; E: Phaser.Input.Keyboard.Key };
	scene: Game;

	// config
	rotationSpeed: number = 0.03;
	zoomInterval: number = 1;
	zoomMax: number = 18;
	zoomMin: number = 5;
	zoomDefault: number = 8;

	constructor(scene: Game, x: number, y: number) {
		// pass values
		super(x, y, scene.scale.gameSize.width, scene.scale.gameSize.height);

		// save values
		this.scene = scene;

		// make main camera
		scene.cameras.remove(scene.cameras.main);
		scene.cameras.addExisting(this, true);

		// set camera zoom
		this.setZoom(
			store.get("settings.options.zoom")
				? store.get("settings.options.zoom")
				: this.zoomDefault
		);

		// populate key inputs
		this.keyQE = {
			Q: (
				scene.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin
			).addKey(Phaser.Input.Keyboard.KeyCodes.Q),
			E: (
				scene.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin
			).addKey(Phaser.Input.Keyboard.KeyCodes.E),
		};
		scene.input.on(
			"wheel",
			(pointer: Phaser.Input.Pointer) => {
				this.handleZoom(pointer.deltaY);
			},
			this
		);

		// resize
		this.scene.scale.on("resize", this.resize, this);
	}

	update() {
		// rotate camera
		this.handleRotation();
	}

	resize(gameSize: Phaser.Structs.Size) {
		// resize
		this.setSize(gameSize.width, gameSize.height);
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
		store.set("settings.options.zoom", this.zoom);
	}

	// handle rotation of objects that are to be fixed to camera rotation
	handleRotation() {
		// rotate left
		if (this.keyQE.Q.isDown) {
			// rotate cam
			(this as any).rotation += this.rotationSpeed;

			// rotate objects counter to cameras rotation
			this.scene.fixedObjectsGroup
				.getChildren()
				.forEach((object: GameObjects.GameObject) => {
					(object as any).rotation = -(this as any).rotation;
				}, this);
		}
		// rotate right
		else if (this.keyQE.E.isDown) {
			// rotate cam
			(this as any).rotation -= this.rotationSpeed;

			// rotate objects counter to cameras rotation
			this.scene.fixedObjectsGroup
				.getChildren()
				.forEach((object: GameObjects.GameObject) => {
					(object as any).rotation = -(this as any).rotation;
				}, this);
		}
	}
}
