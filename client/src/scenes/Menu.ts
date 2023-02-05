import { Core } from "./internal/Core";

//
// This is the Main Menu, what you first see when you open the game.
//

export class Menu extends Core {
	logo!: Phaser.GameObjects.Text;
	begin!: Phaser.GameObjects.Text;

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

		// populate key input
		this.keyESC = this.input.keyboard.addKey(
			Phaser.Input.Keyboard.KeyCodes.ESC
		);

		// options menu
		this.keyESC.on("down", () => {
			// hide current scene
			this.hide();

			// pause current scene
			this.scene.pause();

			// launch pause menu
			this.scene.launch("Options", this);
		});

		// logo text
		this.logo = this.make.text({
			x: window.innerWidth / 2,
			y: window.innerHeight / 3,
			text: "Froguelike",
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
		this.begin = this.make.text({
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
			targets: this.begin,
			scaleX: 1.15,
			scaleY: 1.15,
			duration: 800,
			ease: "Sine.easeIn",
			yoyo: true,
			repeat: -1,
		});

		// on click, go to game
		this.input.on("pointerdown", () => {
			this.changeScene("Game");
		});

		// show menu when resumed
		this.events.on("resume", this.show, this);
	}

	show() {
		this.logo.setVisible(true);
		this.begin.setVisible(true);
	}

	hide() {
		this.logo.setVisible(false);
		this.begin.setVisible(false);
	}
}
