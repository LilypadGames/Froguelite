// imports
import Phaser from "phaser";
import store from "storejs";

// internal
import { Core } from "./Core";
import { CoreOverlay } from "./CoreOverlay";

// scenes
import { HUD } from "../overlay/HUD";

//
// This scene runs in the background and acts as a manager for all the current scenes and stores useful information that persists between scenes
//

export class Head extends Phaser.Scene {
	sceneMain!: Core;
	sceneOverlayMenu!: CoreOverlay;
	sceneHUD!: HUD;

	constructor() {
		super({ key: "Head" });
	}

	create() {
		// disable right-click context menu when game first launches
		(
			this.input.mouse as Phaser.Input.Mouse.MouseManager
		).disableContextMenu();

		// init cursor
		this.cursor.init();

		// init volume
		this.audio.update();

		// start menu scene
		this.scene.launch("MainMenu", { sceneHead: this });
	}

	// cursor
	cursor = {
		init: () => {
			// default cursor
			this.input.setDefaultCursor(
				"url(assets/input/cursors/cursor_large.cur) 16 16, pointer"
			);

			// change cursor on click
			this.input.on(
				"pointerdown",
				() => {
					this.input.setDefaultCursor(
						"url(assets/input/cursors/cursor_small.cur) 16 16, pointer"
					);
				},
				this
			);

			// change cursor back when click released
			this.input.on(
				"pointerup",
				() => {
					this.input.setDefaultCursor(
						"url(assets/input/cursors/cursor_large.cur) 16 16, pointer"
					);
				},
				this
			);
		},
	};

	// performance mode
	highPerformanceMode = {
		set: (mode: boolean) => {
			// save option
			store.set("settings.options.highPerformanceMode", mode);
		},
		get: () => {
			// get option
			return store.get("settings.options.highPerformanceMode");
		},
	};

	// updates current volume controls
	audio = {
		update: (changed?: string) => {
			// music audio changed
			if (
				changed === "music" ||
				changed === "master" ||
				changed == null
			) {
				// music enabled
				if (this.audio.music.state.get()) {
					// update music value
					this.audio.music.volume.value =
						this.audio.music.volume.get() *
						this.audio.master.volume.get();
				}

				// music disabled
				else {
					// set volume to 0
					this.audio.music.volume.value = 0;
				}

				// update current music
				if (this.sceneMain && this.sceneMain.music) {
					// mute
					this.sceneMain.music.mute = !this.audio.music.state.get();

					// volume
					this.sceneMain.music.volume = this.audio.music.volume.value;
				}
			}

			// sfx audio changed
			if (changed === "sfx" || changed === "master" || changed == null) {
				// sfx enabled
				if (this.audio.sfx.state.get()) {
					// update sfx value
					this.audio.sfx.volume.value =
						this.audio.sfx.volume.get() *
						this.audio.master.volume.get();
				}

				// sfx disabled
				else {
					// set volume to 0
					this.audio.sfx.volume.value = 0;
				}
			}
		},
		master: {
			// master audio volume
			volume: {
				get: (): number => {
					return store.get("settings.options.audio.master.volume");
				},
				set: (value: number) => {
					// save
					store.set("settings.options.audio.master.volume", value);

					// update
					this.audio.update();
				},
			},

			// master audio state
			state: {
				get: (): boolean => {
					return store.get("settings.options.audio.master.enabled");
				},
				set: (value: boolean) => {
					// save
					store.set("settings.options.audio.master.enabled", value);

					// update
					this.audio.update("master");
				},
			},
		},
		music: {
			// music audio volume
			volume: {
				value: undefined as undefined | number,
				get: () => {
					return store.get("settings.options.audio.music.volume");
				},
				set: (value: number) => {
					// save
					store.set("settings.options.audio.music.volume", value);

					// update
					this.audio.update("music");
				},
			},

			// music audio state
			state: {
				get: (): boolean => {
					return store.get("settings.options.audio.music.enabled");
				},
				set: (value: boolean) => {
					// save
					store.set("settings.options.audio.music.enabled", value);

					// update
					this.audio.update("music");
				},
			},
		},
		sfx: {
			// sfx audio volume
			volume: {
				value: undefined as undefined | number,
				get: () => {
					return store.get("settings.options.audio.sfx.volume");
				},
				set: (value: number) => {
					// save
					store.set("settings.options.audio.sfx.volume", value);

					// update
					this.audio.update("sfx");
				},
			},

			// sfx audio state
			state: {
				get: (): boolean => {
					return store.get("settings.options.audio.sfx.enabled");
				},
				set: (value: boolean) => {
					// save
					store.set("settings.options.audio.sfx.enabled", value);

					// update
					this.audio.update("sfx");
				},
			},
		},
	};

	// restart game
	restart() {
		location.reload();
	}
}
