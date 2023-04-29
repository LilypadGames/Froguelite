// internal
import { CoreOverlay } from "../internal/CoreOverlay";

export class Inventory extends CoreOverlay {
	worldView!: Phaser.Geom.Rectangle;
	background!: Phaser.GameObjects.Rectangle;
	keyTAB!: Phaser.Input.Keyboard.Key;

	constructor() {
		super({ key: "Inventory" });
	}

	init(pausedScene: Phaser.Scene) {
		// save paused scene
		super.init(pausedScene);
	}

	preload() {
		// set up ESC key
		super.preload();

		// make TAB key close inventory (like ESC key)
		this.keyTAB = (
			this.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin
		).addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
		this.keyTAB.once("down", super.resumePreviousScene, this);
	}

	create() {
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

	shutdown() {
		// remove listeners
		this.events.removeListener("resume", this.show, this);
		this.keyTAB.removeListener("down", super.resumePreviousScene, this);

		// base class shutdown
		super.shutdown();
	}

	hide() {
		this.background.setVisible(false);
	}

	show() {
		this.background.setVisible(true);
	}
}
