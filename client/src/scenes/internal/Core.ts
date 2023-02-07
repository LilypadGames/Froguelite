import Phaser from "phaser";
import store from "storejs";

//
// These are overall mechanics that are common to several different scenes, such as a custom cursor or other UI.
//

export class Core extends Phaser.Scene {
	keyESC!: Phaser.Input.Keyboard.Key;
	keySHIFT!: Phaser.Input.Keyboard.Key;

	constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
		super(config);
	}

	core: any = {
		init: () => {},
		preload: () => {},
		create: () => {
			// disable right-click context menu
			this.input.mouse.disableContextMenu();

			// pause menu
			if (
				this.scene.key != "Pause" &&
				this.scene.key != "Menu" &&
				this.scene.key != "Options"
			) {
				// populate key input
				this.keyESC = this.input.keyboard.addKey(
					Phaser.Input.Keyboard.KeyCodes.ESC
				);

				// toggle pause menu
				this.keyESC.on("down", () => {
					// pause current scene
					this.scene.pause();

					// launch pause menu
					this.scene.launch("Pause", this);
				});
			}

			// debug info
			if (this.scene.key === "Game") {
				// populate key input
				this.keySHIFT = this.input.keyboard.addKey(
					Phaser.Input.Keyboard.KeyCodes.SHIFT
				);

				// toggle debug info
				this.keySHIFT.on("down", () => {
					// if debug scene is already open, close it
					if (
						this.game.scene
							.getScenes(true)
							.some((scene) => scene.scene.key === "Debug")
					) {
						this.scene.stop("Debug");
					}
					// open debug scene
					else {
						// launch debug info overlay
						this.scene.launch("Debug", this);
					}
				});
			}

			// init cursor
			this.core.cursor.init();
		},
		// restart game
		restart: () => {
			// // stop all scenes
			// this.game.scene.scenes.forEach((scene) => {
			// 	scene.registry.destroy();
			// 	scene.events.removeAllListeners();
			// 	scene.scene.stop();
			// });

			// // start first scene over
			// this.scene.start("Boot");
			location.reload();
		},
		// cursor
		cursor: {
			init: () => {
				// default cursor
				this.input.setDefaultCursor(
					"url(assets/input/cursors/cursor_large.cur) 16 16, pointer"
				);

				// change cursor on click
				this.input.on("pointerdown", () => {
					this.input.setDefaultCursor(
						"url(assets/input/cursors/cursor_small.cur) 16 16, pointer"
					);
				});

				// change cursor back when click released
				this.input.on("pointerup", () => {
					this.input.setDefaultCursor(
						"url(assets/input/cursors/cursor_large.cur) 16 16, pointer"
					);
				});
			},
		},
		highPerformanceMode: {
			set: (mode: boolean) => {
				// save option
				store.set("settings.options.highPerformanceMode", mode);
			},
		},
	};

	changeScene(scene: string) {
		// remove listeners
		// this.input.removeAllListeners();

		// stop current scene
		this.scene.stop();

		// start next scene
		this.scene.start(scene);
	}
}
