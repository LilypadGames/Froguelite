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

		// update event
		this.events.on("update", this.detectMenu, this);

		// shutdown event
		this.events.once("shutdown", this.shutdown, this);
	}

	detectMenu() {
		// resume previous scene
		if (
			this.sceneHead.playerInput.interaction_mapped.pressed.includes(
				"SELECT"
			)
		)
			this.resumePreviousScene();
	}

	shutdown() {
		// remove listeners
		this.events.removeListener("update", this.detectMenu, this);
	}

	resumePreviousScene() {
		// sfx
		this.sound.play("ui_back", {
			volume: this.sceneHead.audio.sfx.volume.value,
		});

		// stop pause menu
		this.scene.stop();

		// resume previous scene
		this.scene.resume(this.scenePaused);
	}
}
