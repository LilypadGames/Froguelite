// imports
import Phaser from "phaser";

// internal
import { Head } from "./Head";

//
// These are overall mechanics that are common to several different scenes, such as a custom cursor or other UI.
//

export class CoreOverlay extends Phaser.Scene {
	scenePaused!: Phaser.Scene;
	keyESC!: Phaser.Input.Keyboard.Key;

	constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
		super(config);
	}

	init(scenePaused: Phaser.Scene) {
		// save previous scene
		this.scenePaused = scenePaused;
	}

	preload() {
		// save as current main scene
		(this.game.scene.getScene("Head") as Head).sceneOverlayMenu = this;

		// turn off default debug lines when game first launches
		this.matter.world.drawDebug = false;

		// menu overlay toggle hotkey
		this.keyESC = (
			this.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin
		).addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

		// toggle menu overlay
		this.keyESC.on("down", this.resumePreviousScene, this);

		// shutdown event
		this.events.once("shutdown", this.shutdown, this);
	}

	shutdown() {
		// remove listeners
		this.keyESC.removeListener("down", this.resumePreviousScene, this);
	}

	resumePreviousScene() {
		// sfx
		this.sound.play("ui_back", { volume: 0.75 });

		// stop pause menu
		this.scene.stop();

		// resume previous scene
		this.scene.resume(this.scenePaused);
	}

	// 	create: () => {
	// 		// disable right-click context menu
	// 		(
	// 			this.input.mouse as Phaser.Input.Mouse.MouseManager
	// 		).disableContextMenu();

	// 		// pause menu
	// 		if (
	// 			this.scene.key != "Pause" &&
	// 			this.scene.key != "Menu" &&
	// 			this.scene.key != "Options" &&
	// 			this.scene.key != "Inventory"
	// 		) {
	// 			// populate key input
	// 			this.keyESC = (
	// 				this.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin
	// 			).addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

	// 			// toggle pause menu
	// 			this.keyESC.on("down", () => {
	// 				// pause current scene
	// 				this.scene.pause();

	// 				// launch pause menu
	// 				this.scene.launch("Pause", this);
	// 			});
	// 		}
}
