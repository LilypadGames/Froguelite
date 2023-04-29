import { Head } from "./internal/Head";
import { Core } from "./internal/Core";
import Utility from "../scripts/Utility";
import ColorScheme from "../scripts/ColorScheme";

//
// This is the Main Menu, what you first see when you open the game.
//

export class MainMenu extends Core {
	logo!: Phaser.GameObjects.Text;
	begin!: Phaser.GameObjects.Text;

	constructor() {
		super({ key: "MainMenu" });
	}

	init() {
		// save as current main scene
		(this.game.scene.getScene("Head") as Head).sceneMain = this;
	}

	preload() {
		// preload core mechanics
		super.preload();
	}

	create() {
		// logo text
		this.logo = this.make.text({
			x: this.scale.gameSize.width / 2,
			y: this.scale.gameSize.height / 3,
			text: "Froguelike",
			style: {
				fontSize: "128px",
				fontFamily: "Pix",
				color: Utility.hex.toString(ColorScheme.Green),
				align: "center",
				stroke: Utility.hex.toString(ColorScheme.White),
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
				color: Utility.hex.toString(ColorScheme.White),
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
				level: this.cache.json.get("game").start,
			});
		}, this);

		// show menu when resumed
		this.events.on("resume", this.show, this);

		// set camera size and position
		this.cameras.main.setPosition(0, 0);
		this.resizeCamera(this.scale.gameSize);
		this.scale.on("resize", this.resizeCamera, this);

		// play music
		super.playMusic(this.cache.json.get("game").music.mainmenu);
	}

	shutdown() {
		// remove listeners
		this.events.removeListener("resume", this.show, this);
		this.scale.removeListener("resize", this.resizeCamera, this);

		// base class shutdown
		super.shutdown();
	}

	launchMenuOverlay() {
		// hide current scene
		this.hide();

		// launch options menu
		this.scene.launch("Options", this);
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
