import { Core } from "./internal/Core";

//
// This is the Main Menu, what you first see when you open the game.
//

export class Menu extends Core {
	constructor() {
		super({ key: "Menu" });
	}

	preload() {
		// preload core mechanics
		this.core.preload();
	}

	create() {
		// create core mechanics
		this.core.create();

		// logo text
		const logo = this.make.text({
			x: window.innerWidth / 2,
			y: window.innerHeight / 3,
			text: "Frougelike",
			style: {
				fontSize: "128px",
				fontFamily: "Pix",
				color: "#05ad32",
				align: "center",
				stroke: "#ffffff",
				strokeThickness: 20,
			},
			origin: { x: 0.5, y: 0.5 },
			add: true,
		});

		// begin text
		const begin = this.make.text({
			x: window.innerWidth / 2,
			y: (window.innerHeight / 5) * 4,
			text: "Click Anywhere To Begin",
			style: {
				fontSize: "32px",
				fontFamily: "Pix",
				color: "#ffffff",
				align: "center",
			},
			origin: { x: 0.5, y: 0.5 },
			add: true,
		});

		// begin text animation
		this.tweens.add({
			targets: begin,
			scaleX: 1.15,
			scaleY: 1.15,
			duration: 800,
			ease: "Sine.easeIn",
			yoyo: true,
			repeat: -1,
		});

		// on click, go to game
		this.input.on("pointerdown", () => {
			this.scene.start("Game");
		});
	}
}
