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
		this.keyESC = (
			this.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin
		).addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

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
			x: this.scale.gameSize.width / 2,
			y: this.scale.gameSize.height / 3,
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
			x: this.scale.gameSize.width / 2,
			y: (this.scale.gameSize.height / 5) * 4,
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
			this.changeScene("Game", {
				level: this.cache.json.get("worldData").start,
			});
		});

		// show menu when resumed
		this.events.on("resume", this.show, this);

		// set camera size and position
		this.cameras.main.setPosition(0, 0);
		this.resizeCamera(this.scale.gameSize);
		this.scale.on("resize", this.resizeCamera, this);
	}

	resizeCamera(gameSize: Phaser.Structs.Size) {
		// resize
		this.cameras.main.setSize(gameSize.width, gameSize.height);
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
