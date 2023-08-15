// imports
import Phaser from "phaser";

/**
 * First scene that runs when the game begins, and runs anything that needs to be done before data and assets are loaded.
 */
export class Boot extends Phaser.Scene {
	constructor() {
		super({ key: "Boot" });
	}

	preload() {
		// file loading error
		this.load.on(
			"loaderror",
			() => {
				alert(
					`Sorry, the game failed to load a file... please try refreshing. 💀`
				);
				this.game.destroy(true);
			},
			this
		);
	}

	create() {
		this.scene.start("Load");
	}
}
