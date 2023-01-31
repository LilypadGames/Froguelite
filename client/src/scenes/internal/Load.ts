import Phaser from "phaser";

export class Load extends Phaser.Scene {
	constructor() {
		super({ key: "Load" });
	}

	preload() {}

	create() {
		this.scene.start("Menu");
	}
}
