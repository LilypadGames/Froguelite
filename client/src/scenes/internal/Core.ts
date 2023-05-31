// imports
import Phaser from "phaser";

// types
import { gameSceneData, overlaySceneData, sceneData } from "../../types/global";

// plugins
import SoundFade from "phaser3-rex-plugins/plugins/soundfade";

// internal
import { Head } from "./Head";

//
// These are overall mechanics that are common to several different scenes, such as a custom cursor or other UI.
//

export class Core extends Phaser.Scene {
	sceneHead!: Head;
	// keyESC!: Phaser.Input.Keyboard.Key;
	music: Phaser.Sound.WebAudioSound | undefined = undefined;

	constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
		super(config);
	}

	init(data: sceneData | gameSceneData) {
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

		// // menu overlay toggle hotkey
		// this.keyESC = (
		// 	this.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin
		// ).addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

		// // toggle menu overlay
		// this.keyESC.on("down", this.launchMenuOverlay, this);

		// shutdown event
		this.events.once("shutdown", this.shutdown, this);
	}

	update() {
		// open pause menu
		if (this.sceneHead.playerInput.interaction_mapped.pressed.includes("SELECT"))
			this.launchMenuOverlay();
	}

	shutdown() {
		// // remove listeners
		// this.keyESC.removeListener("down", this.launchMenuOverlay, this);

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
		this.sound.play("ui_open", {
			volume: this.sceneHead.audio.sfx.volume.value,
		});

		// launch pause menu
		this.scene.launch("Pause", {
			sceneHead: this.sceneHead,
			scenePaused: this,
		});
	}

	changeScene(
		scene: string,
		data?: sceneData | gameSceneData | overlaySceneData
	) {
		// stop scene
		this.scene.stop();

		// start next scene
		this.scene.start(scene, data);
	}
}
