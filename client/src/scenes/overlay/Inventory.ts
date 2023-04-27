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
		this.keyTAB = (
			this.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin
		).addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
		this.keyTAB.on("down", () => {
			this.resume();
		});
		this.keyESC = (
			this.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin
		).addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
		this.keyESC.on("down", () => {
			this.resume();
		});
	}

	create() {
		// create core mechanics
		this.core.create();

		// create transparent background overlay
		this.background = this.add.rectangle(
			this.scale.gameSize.width / 2,
			this.scale.gameSize.height / 2,
			this.scale.gameSize.width,
			this.scale.gameSize.height,
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
