// imports
import Phaser from "phaser";
import store from "storejs";

// plugins
import MergedInput, { Player } from "phaser3-merged-input";

// internal
import { Core } from "./Core";
import { CoreOverlay } from "./CoreOverlay";

// scenes
import { HUD } from "../overlay/HUD";
import { Game } from "../Game";

//
// This scene runs in the background and acts as a manager for all the current scenes and stores useful information that persists between scenes
//

export class Head extends Phaser.Scene {
	// scenes
	sceneMain!: Core;
	sceneOverlayMenu!: CoreOverlay;
	sceneHUD!: HUD;

	// inputs
	private mergedInput!: MergedInput;
	playerInput!: Player;

	constructor() {
		super({ key: "Head" });
	}

	create() {
		// disable right-click context menu when game first launches
		(
			this.input.mouse as Phaser.Input.Mouse.MouseManager
		).disableContextMenu();

		// set up input
		this.playerInput = this.mergedInput.addPlayer(0);
		this.mergedInput
			.defineKey(0, "UP", "W") // move up
			.defineKey(0, "DOWN", "S") // move down
			.defineKey(0, "LEFT", "A") // move left
			.defineKey(0, "RIGHT", "D") // move right
			.defineKey(0, "START", "TAB") // inventory
			.defineKey(0, "SELECT", "ESC") // back/pause
			.defineKey(0, "RC_E", "F") // interact
			.defineKey(0, "LB", "Q") // rotate left/pagination left
			.defineKey(0, "RB", "E") // rotate right/pagination right
			.defineKey(0, "LC_N", "PAGE_UP") // zoom in
			.defineKey(0, "LC_S", "PAGE_DOWN"); // zoom out
		// .defineKey(0, "RT", "M1") // attack

		// init cursor
		this.cursor.init();

		// init volume
		this.audio.update();

		// start menu scene
		this.scene.launch("MainMenu", { sceneHead: this });
	}

	update() {
		// handle cursor
		if (this.input.activePointer.isDown)
			this.input.setDefaultCursor(
				"url(/input/cursors/cursor_small.cur) 16 16, pointer"
			);
		else
			this.input.setDefaultCursor(
				"url(/input/cursors/cursor_large.cur) 16 16, pointer"
			);
	}

	// cursor
	cursor = {
		init: () => {
			// default cursor
			this.input.setDefaultCursor(
				"url(/input/cursors/cursor_large.cur) 16 16, pointer"
			);

			// // change cursor on click
			// this.input.on(
			// 	"pointerdown",
			// 	() => {
			// 		this.input.setDefaultCursor(
			// 			"url(/input/cursors/cursor_small.cur) 16 16, pointer"
			// 		);
			// 	},
			// 	this
			// );

			// // change cursor back when click released
			// this.input.on(
			// 	"pointerup",
			// 	() => {
			// 		this.input.setDefaultCursor(
			// 			"url(/input/cursors/cursor_large.cur) 16 16, pointer"
			// 		);
			// 	},
			// 	this
			// );
		},
	};

	// performance mode
	highPerformanceMode = {
		set: (mode: boolean) => {
			// save
			store.set("settings.options.highPerformanceMode", mode);

			// reload graphics
			if (this.sceneMain.scene.key === "Game")
				(this.sceneMain as Game).reloadGraphics();
		},
		get: () => {
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
				if (
					this.audio.music.state.get() &&
					this.audio.master.state.get()
				) {
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
				if (
					this.audio.sfx.state.get() &&
					this.audio.master.state.get()
				) {
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
					this.audio.update();
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
