import Phaser from "phaser";

//
// This is the first scene that runs when the game opens, and runs anything that needs to be done before data and assets are loaded. Most likely, you will stick to the Load scene for everything.
//

export class Boot extends Phaser.Scene {
	constructor() {
		super({ key: "Boot" });
	}

	preload() {
		// file loading error
		this.load.on("loaderror", () => {
			alert(
				`Sorry, the game failed to load a file... please try refreshing. 💀`
			);
			this.game.destroy(true);
		});
	}

	create() {
		this.scene.start("Load");
	}
}
