import Phaser from "phaser";

//
// These are overall mechanics that are common to several different scenes, such as a custom cursor or other UI.
//

export class Core extends Phaser.Scene {
	keyESC!: Phaser.Input.Keyboard.Key;

	constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
		super(config);
	}

	core: any = {
		init: () => {},
		preload: () => {},
		create: () => {
			// disable right-click context menu
			this.input.mouse.disableContextMenu();

			// set up pause menu key (if not already he pause menu)
			if (this.scene.key != "Pause") {
				// populate key input
				this.keyESC = this.input.keyboard.addKey(
					Phaser.Input.Keyboard.KeyCodes.ESC
				);

				// pause or resume
				this.keyESC.on("down", () => {
					// pause current scene
					this.scene.pause();

					// launch pause menu
					this.scene.launch("Pause", this);
				});
			}

			// init cursor
			this.core.cursor.init();
		},
		// cursor
		cursor: {
			init: () => {
				// default cursor
				this.input.setDefaultCursor(
					"url(assets/input/cursors/cursor_large.cur), pointer"
				);

				// change cursor on click
				this.input.on("pointerdown", () => {
					this.input.setDefaultCursor(
						"url(assets/input/cursors/cursor_small.cur), pointer"
					);
				});

				// change cursor back when click released
				this.input.on("pointerup", () => {
					this.input.setDefaultCursor(
						"url(assets/input/cursors/cursor_large.cur), pointer"
					);
				});
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
