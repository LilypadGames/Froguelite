import Phaser from "phaser";

//
// This is meant for loading in any data, such as a save game state, prior to entering the main menu.
//

export class Load extends Phaser.Scene {
	constructor() {
		super({ key: "Load" });
	}

	preload() {}

	create() {
		this.scene.start("Menu");
	}
}
