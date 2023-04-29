// imports
import Phaser from "phaser";
import store from "storejs";

// plugins
import SoundFade from "phaser3-rex-plugins/plugins/soundfade";

// internal
import { Head } from "./Head";

//
// These are overall mechanics that are common to several different scenes, such as a custom cursor or other UI.
//

export class Core extends Phaser.Scene {
	keyESC!: Phaser.Input.Keyboard.Key;
	// music
	music = {
		audio: undefined as Phaser.Sound.WebAudioSound | undefined,

		setVolume: (value: number) => {
			// save option
			store.set("settings.options.musicVolume", value);

			// apply option
			if (this.music.audio) this.music.audio.volume = value;
		},
		getVolume: () => {
			// get option
			return store.get("settings.options.musicVolume");
		},
		setState: (value: boolean) => {
			// save option
			store.set("settings.options.musicEnabled", value);

			// apply option
			if (this.music.audio) this.music.audio.mute = !value;
		},
		getState: () => {
			// get option
			return store.get("settings.options.musicEnabled");
		},
	};

	constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
		super(config);
	}

	preload() {
		// save as current main scene
		(this.game.scene.getScene("Head") as Head).sceneMain = this;

		// turn off default debug lines when game first launches
		this.matter.world.drawDebug = false;

		// reset average fps
		this.game.loop.resetDelta();

		// menu overlay toggle hotkey
		this.keyESC = (
			this.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin
		).addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

		// toggle menu overlay
		this.keyESC.on("down", this.launchMenuOverlay, this);

		// shutdown event
		this.events.once("shutdown", this.shutdown, this);
	}

	shutdown() {
		// remove listeners
		this.keyESC.removeListener("down", this.launchMenuOverlay, this);

		// fade out music
		if (this.music.audio) SoundFade.fadeOut(this.music.audio, 500);
	}

	playMusic(title: string) {
		// set up audio
		this.sound.pauseOnBlur = false;
		this.music.audio = this.sound.add(title, {
			loop: true,
			volume: this.music.getVolume(),
			mute: !this.music.getState(),
		}) as Phaser.Sound.WebAudioSound;

		// fade music in
		SoundFade.fadeIn(this.music.audio, 500, this.music.getVolume());
	}

	launchMenuOverlay() {
		// pause current scene
		this.scene.pause();

		// launch pause menu
		this.scene.launch("Pause", this);
	}

	changeScene(scene: string, data?: object) {
		// stop scene
		this.scene.stop();

		// start next scene
		this.scene.start(scene, data);
	}
}
