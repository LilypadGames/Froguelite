import { Core } from "../internal/Core";

export class Inventory extends Core {
	pausedScene!: Phaser.Scene;
	worldView!: Phaser.Geom.Rectangle;
	background!: Phaser.GameObjects.Rectangle;
	keyTAB!: Phaser.Input.Keyboard.Key;

	constructor() {
		super({ key: "Inventory" });
	}

	init(pausedScene: Phaser.Scene) {
		// save values
		this.pausedScene = pausedScene;
	}

	preload() {
		// populate key input
		this.keyTAB = this.input.keyboard.addKey(
			Phaser.Input.Keyboard.KeyCodes.TAB
		);
		this.keyTAB.on("down", () => {
			this.resume();
		});
		this.keyESC = this.input.keyboard.addKey(
			Phaser.Input.Keyboard.KeyCodes.ESC
		);
		this.keyESC.on("down", () => {
			this.resume();
		});
	}

	create() {
		// create core mechanics
		this.core.create();

		// create transparent background overlay
		this.background = this.add.rectangle(
			window.innerWidth / 2,
			window.innerHeight / 2,
			window.innerWidth,
			window.innerHeight,
			0x000000,
			0.5
		);

		// show menu when resumed
		this.events.on("resume", this.show, this);
	}

	resume() {
		// resume previous scene
		this.scene.resume(this.pausedScene);

		// stop pause menu
		this.scene.stop();
	}

	hide() {
		this.background.setVisible(false);
	}

	show() {
		this.background.setVisible(true);
	}
}
