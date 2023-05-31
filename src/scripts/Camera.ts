// imports
import { GameObjects } from "phaser";
import store from "storejs";

// scenes
import { Game } from "../scenes/Game";

export class Camera extends Phaser.Cameras.Scene2D.Camera {
	scene: Game;

	// config
	rotationSpeed: number = 0.03;
	rotationDefault: number = 0;
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
			store.get("settings.options.camera.zoom")
				? store.get("settings.options.camera.zoom")
				: this.zoomDefault
		);

		// set camera rotation
		this.updateRotation(
			store.get("settings.options.camera.rotation")
				? store.get("settings.options.camera.rotation")
				: this.rotationDefault
		);

		// populate key inputs
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
		// if (this.keyQE.Q.isDown || this.keyQE.E.isDown) this.handleRotation();
		if (
			this.scene.sceneHead.playerInput.interaction_mapped.pressed.includes(
				"LB"
			) ||
			this.scene.sceneHead.playerInput.interaction_mapped.pressed.includes(
				"RB"
			)
		)
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

		// store zoom
		store.set("settings.options.camera.zoom", this.zoom);
	}

	// handle rotation of objects that are to be fixed to camera rotation
	handleRotation() {
		// get new rotation
		let newRotation =
			this.scene.sceneHead.playerInput.interaction_mapped.pressed.includes(
				"LB"
			)
				? (this as any).rotation + this.rotationSpeed
				: (this as any).rotation - this.rotationSpeed;

		// store rotation
		store.set("settings.options.camera.rotation", newRotation);

		// update rotation
		this.updateRotation(newRotation);
	}

	// updates current camera rotation as well as objects in scene
	updateRotation(rotation: number) {
		// set rotation
		(this as any).rotation = rotation;

		// rotate objects counter to cameras rotation
		this.scene.fixedObjectsGroup
			.getChildren()
			.forEach((object: GameObjects.GameObject) => {
				(object as any).rotation = -(this as any).rotation;
			}, this);
	}
}
