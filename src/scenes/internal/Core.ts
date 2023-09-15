// imports
import Phaser from "phaser";

// plugins
import SoundFade from "phaser3-rex-plugins/plugins/soundfade";

// internal
import { Head } from "./Head";

/**
 * General mechanics that are common to main scenes.
 */
export class Core extends Phaser.Scene {
	sceneHead!: Head;
	music: Phaser.Sound.WebAudioSound | undefined = undefined;

	constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
		super(config);
	}

	init(data: ISceneData | ISceneDataGame) {
		// save head scene
		this.sceneHead = data.sceneHead;

		// save as current main scene
		data.sceneHead.sceneMain = this;
	}

	preload() {
		// turn off default debug lines when game first launches
		this.matter.world.drawDebug = false;

		// reset average fps
		this.game.loop.resetDelta();

		// events
		this.events.on("pause", this.pause, this);
		this.events.on("resume", this.resume, this);
		this.events.once("shutdown", this.shutdown, this);

		// register inputs
		this.registerInputs();
	}

	registerInputs() {
		// detect pause menu input
		this.sceneHead.events.once("input_back", this.launchMenuOverlay, this);
	}

	pause() {
		// remove listeners
		this.sceneHead.events.off("input_back", this.launchMenuOverlay, this);
	}

	resume() {
		// re-register inputs on scene resume
		this.registerInputs();
	}

	shutdown() {
		// remove listeners
		this.events.off("pause", this.pause, this);
		this.events.off("resume", this.resume, this);
		this.sceneHead.events.off("input_back", this.launchMenuOverlay, this);
		this.events.off("shutdown", this.shutdown, this);

		// fade out music
		if (this.music) SoundFade.fadeOut(this.music, 500);
	}

	playMusic(title: string) {
		// set up audio
		this.sound.pauseOnBlur = false;
		this.music = this.sound.add(title, {
			loop: true,
			volume: this.sceneHead.audio.music.volume.value,
			mute: !this.sceneHead.audio.music.volume.value,
		}) as Phaser.Sound.WebAudioSound;

		// fade music in
		SoundFade.fadeIn(
			this.music,
			500,
			this.sceneHead.audio.music.volume.value
		);
	}

	launchMenuOverlay() {
		// pause current scene
		this.scene.pause();

		// sfx
		this.sceneHead.play.sound("ui_open");

		// launch pause menu
		this.scene.launch("Pause", {
			sceneHead: this.sceneHead,
			scenePaused: this,
		});
	}

	changeScene(
		scene: string,
		data?: ISceneData | ISceneDataGame | ISceneDataOverlay
	) {
		// stop scene
		this.scene.stop();

		// start next scene
		this.scene.start(scene, data);
	}
}
