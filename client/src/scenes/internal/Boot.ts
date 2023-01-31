import Phaser from "phaser";

export class Boot extends Phaser.Scene {
	constructor() {
		super({ key: "Boot" });
	}

	preload() {}

	create() {
		this.scene.start("Load");
	}
}
