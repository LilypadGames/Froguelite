import { Core } from "./internal/Core";

export class Menu extends Core {
	constructor() {
		super({ key: "Menu" });
	}

	preload() {
		this.load.image("logo", "assets/phaser3-logo.png");
	}

	create() {
		this.core.cursor.init();

		const logo = this.add.image(400, 70, "logo");
		this.tweens.add({
			targets: logo,
			y: 350,
			duration: 1500,
			ease: "Sine.inOut",
			yoyo: true,
			repeat: -1,
		});
	}
}
