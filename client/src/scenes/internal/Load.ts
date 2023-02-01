import Phaser from "phaser";
import WebFont from "webfontloader";

//
// This is meant for loading in any data, such as a save game state, prior to entering the main menu.
//

export class Load extends Phaser.Scene {
	constructor() {
		super({ key: "Load" });
	}

	preload() {
		WebFont.load({
			active: () => {
				// fonts are loaded, continue to next scene
				this.scene.start("Menu");
			},
			// custom fonts
			custom: {
				families: ["Pix"]
			},
		});
	}
}
