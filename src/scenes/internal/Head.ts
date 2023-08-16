// imports
import Phaser from "phaser";
import store from "storejs";

// plugins
import MergedInput, { PlayerTyped } from "phaser3-merged-input";

// internal
import { Core } from "./Core";
import { CoreOverlay } from "./CoreOverlay";

// scenes
import { HUD } from "../overlay/HUD";
import { Game } from "../Game";

// utility
import Utility from "../../scripts/utility/Utility";

/**
 * Main game manager. Runs in the background, has general utility, and stores references that persists between scenes.
 */
export class Head extends Phaser.Scene {
	// scenes
	sceneMain!: Core;
	sceneOverlayMenu!: CoreOverlay;
	sceneHUD!: HUD;

	// inputs
	private mergedInput!: MergedInput;
	playerInput!: PlayerTyped;

	constructor() {
		super({ key: "Head" });
	}

	create() {
		// disable right-click context menu when game first launches
		(
			this.input.mouse as Phaser.Input.Mouse.MouseManager
		).disableContextMenu();

		// set up input
		this.playerInput = this.mergedInput.addPlayer(0) as PlayerTyped;
		this.mergedInput
			.defineKey(0, "UP", "W") // move up
			.defineKey(0, "DOWN", "S") // move down
			.defineKey(0, "LEFT", "A") // move left
			.defineKey(0, "RIGHT", "D") // move right
			.defineKey(0, "START", "TAB") // inventory
			.defineKey(0, "SELECT", "ESC") // back/pause
			.defineKey(0, "RC_W", "F") // interact
			.defineKey(0, "LB", "Q") // rotate left/pagination left
			.defineKey(0, "RB", "E") // rotate right/pagination right
			.defineKey(0, "LC_N", "PAGE_UP") // zoom in
			.defineKey(0, "LC_S", "PAGE_DOWN"); // zoom out
		// .defineKey(0, "RT", "M1") // attack

		// init cursor
		this.cursor.init();

		// init volume
		this.audio.update();

		// create console commands
		this.createCommands();

		// start menu scene
		this.scene.launch("MainMenu", { sceneHead: this });
	}

	update() {
		// handle cursor
		if (this.input.activePointer.isDown)
			this.input.setDefaultCursor(
				"url(/texture/input/cursors/cursor_small.cur) 16 16, pointer"
			);
		else
			this.input.setDefaultCursor(
				"url(/texture/input/cursors/cursor_large.cur) 16 16, pointer"
			);
	}

	// cursor
	cursor = {
		init: () => {
			// default cursor
			this.input.setDefaultCursor(
				"url(/texture/input/cursors/cursor_large.cur) 16 16, pointer"
			);
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

	play = {
		sound: (key: string): void => {
			// provided sound key has multiple sources: choose random one
			if (
				Array.isArray(this.cache.json.get("audio")[key]) &&
				this.cache.json.get("audio")[key].length > 0 &&
				this.cache.json.get("audio")[key].every((value: any) => {
					return typeof value === "string";
				})
			)
				key =
					key +
					"_" +
					Utility.random.int(
						1,
						this.cache.json.get("audio")[key].length
					);

			// play sound at current volume
			this.sceneMain.sound.play(key, {
				volume: this.audio.sfx.volume.value,
			});
		},
	};

	// create custom console commands for debugging
	createCommands() {
		// spawn enemy command
		const spawnEnemyAtCursor = (enemyType: string) => {
			try {
				// not game scene
				if (!(this.sceneMain instanceof Game)) {
					console.log(
						"%cThis command must only be ran during the Game scene.",
						"background-color:red; font-size:14px; color:white; font-weight:bold;"
					);
					return "";
				}

				// get world point of cursor
				this.input.activePointer.updateWorldPoint(
					this.sceneMain.camera
				);

				// spawn enemy
				this.sceneMain.level.spawnEnemy(
					enemyType,
					this.input.activePointer.worldX,
					this.input.activePointer.worldY
				);

				// success
				console.log(
					"%cSuccessfully Spawned Enemy at " +
						this.input.activePointer.x +
						" " +
						this.input.activePointer.y,
					"font-size:14px; background-color:green; color:white; font-weight:bold;"
				);
				return "";
			} catch (error: any) {
				// fail
				return error;
			}
		};

		// kill player command
		const kill = () => {
			try {
				// not game scene
				if (!(this.sceneMain instanceof Game)) {
					console.log(
						"%cThis command must only be ran during the Game scene.",
						"background-color:red; font-size:14px; color:white; font-weight:bold;"
					);
					return "";
				}

				// kill
				const output = this.sceneMain.player.kill();
				if (output instanceof Error) {
					console.log(
						"%c" + output.message,
						"background-color:red; font-size:14px; color:white; font-weight:bold;"
					);
					return "";
				}

				// success
				console.log(
					"%cSuccessfully Killed Player",
					"font-size:14px; background-color:green; color:white; font-weight:bold;"
				);
				return "";
			} catch (error: any) {
				// fail
				return error;
			}
		};

		// revive player command
		const revive = () => {
			try {
				// not game scene
				if (!(this.sceneMain instanceof Game)) {
					console.log(
						"%cThis command must only be ran during the Game scene.",
						"background-color:red; font-size:14px; color:white; font-weight:bold;"
					);
					return "";
				}

				// revive
				const output = this.sceneMain.player.revive();
				if (output instanceof Error) {
					console.log(
						"%c" + output.message,
						"background-color:red; font-size:14px; color:white; font-weight:bold;"
					);
					return "";
				}

				// success
				console.log(
					"%cSuccessfully Revived Player",
					"font-size:14px; background-color:green; color:white; font-weight:bold;"
				);
				return "";
			} catch (error: any) {
				// fail
				return error;
			}
		};

		// apply commands to window (browser) and global (node or other server) console
		[
			(window as any).spawnEnemyAtCursor,
			(globalThis as any).spawnEnemyAtCursor,
		] = [spawnEnemyAtCursor, spawnEnemyAtCursor];
		[(window as any).kill, (globalThis as any).kill] = [kill, kill];
		[(window as any).revive, (globalThis as any).revive] = [revive, revive];
	}

	// restart game
	restart() {
		location.reload();
	}
}
