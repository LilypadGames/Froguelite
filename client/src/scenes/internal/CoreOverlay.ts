// imports
import Phaser from "phaser";

// internal
import { Head } from "./Head";
import { overlaySceneData } from "../../types/global";

//
// These are overall mechanics that are common to several different scenes, such as a custom cursor or other UI.
//

export class CoreOverlay extends Phaser.Scene {
	sceneHead!: Head;
	scenePaused!: Phaser.Scene;
	keyESC!: Phaser.Input.Keyboard.Key;

	constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
		super(config);
	}

	init(data: overlaySceneData) {
		// save head scene
		this.sceneHead = data.sceneHead;

		// save as current overlay scene
		data.sceneHead.sceneOverlayMenu = this;

		// save previous, paused scene
		this.scenePaused = data.scenePaused;
	}

	preload() {
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
		this.sound.play("ui_back", { volume: this.sceneHead.audio.sfx.volume.value });

		// stop pause menu
		this.scene.stop();

		// resume previous scene
		this.scene.resume(this.scenePaused);
	}
}
