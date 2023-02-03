import { Core } from "../internal/Core";

export class Pause extends Core {
	pausedScene!: Phaser.Scene;
	worldView!: Phaser.Geom.Rectangle;

	constructor() {
		super({ key: "Pause" });
	}

	init(pausedScene: Phaser.Scene) {
		// save values
		this.pausedScene = pausedScene;
	}

	preload() {
		// populate key input
		this.keyESC = this.input.keyboard.addKey(
			Phaser.Input.Keyboard.KeyCodes.ESC
		);

		// pause or resume
		this.keyESC.on("down", () => {
			// resume previous scene
			this.scene.resume(this.pausedScene);

			// stop pause menu
			this.scene.stop();
		});
	}

	create() {
		// create core mechanics
		this.core.create();

		// create pause menu
		var background = this.add.rectangle(
			window.innerWidth / 2,
			window.innerHeight / 2,
			window.innerWidth,
			window.innerHeight,
			0x000000,
			0.5
		);
	}
}
