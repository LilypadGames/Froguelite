// imports
import Phaser from "phaser";

// internal
import { Head } from "./Head";

/**
 * General mechanics that are common to overlay scenes.
 */
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

		// events
		this.events.on("resume", this.resume, this);
		this.events.on("pause", this.pause, this);
		this.events.once("shutdown", this.shutdown, this);

		// register inputs
		this.registerInputs();
	}

	registerInputs() {
		// detect pause menu input
		this.sceneHead.events.once(
			"input_back",
			this.resumePreviousScene,
			this
		);
	}

	pause() {
		// remove listeners
		this.sceneHead.events.off("input_back", this.resumePreviousScene, this);
	}

	resume() {
		// re-register inputs
		this.registerInputs();
	}

	shutdown() {
		// remove listeners
		this.events.off("pause", this.pause, this);
		this.events.off("resume", this.resume, this);
		this.sceneHead.events.off("input_back", this.resumePreviousScene, this);
		this.events.off("shutdown", this.shutdown, this);
	}

	resumePreviousScene() {
		// sfx
		this.sceneHead.play.sound("ui_back");

		// stop pause menu
		this.scene.stop();

		// resume previous scene
		this.scene.resume(this.scenePaused);
	}
}
