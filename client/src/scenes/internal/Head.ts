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

		// start menu scene
		this.scene.launch("MainMenu");
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

	// restart game
	restart() {
		location.reload();
	}
}
