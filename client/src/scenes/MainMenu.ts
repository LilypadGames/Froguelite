// internal
import { Core } from "./internal/Core";

// utility
import ColorScheme from "../scripts/ColorScheme";
import Utility from "../scripts/Utility";
import { sceneData } from "../types/global";

//
// This is the Main Menu, what you first see when you open the game.
//

export class MainMenu extends Core {
	logo!: Phaser.GameObjects.Text;
	begin!: Phaser.GameObjects.Text;

	constructor() {
		super({ key: "MainMenu" });
	}

	init(data: sceneData) {
		super.init(data);
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
			text: this.cache.json.get("lang.en_us").game_title,
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
			text: this.cache.json.get("lang.en_us").opening_hint,
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
		this.input.on(
			"pointerdown",
			() => {
				this.changeScene("Game", {
					sceneHead: this.sceneHead,
					level: this.cache.json.get("game").start,
				});
			},
			this
		);

		// execute when game is paused/resumed
		this.events.on("pause", this.onPause, this);
		this.events.on("resume", this.onResume, this);

		// set camera size and position
		this.cameras.main.setPosition(0, 0);
		this.resizeCamera(this.scale.gameSize);
		this.scale.on("resize", this.resizeCamera, this);

		// play music
		super.playMusic(this.cache.json.get("game").music.mainmenu);
	}

	onPause() {
		// hide
		this.hide();
	}

	onResume() {
		// show
		this.show();
	}

	shutdown() {
		// remove listeners
		this.events.removeListener("pause", this.onPause, this);
		this.events.removeListener("resume", this.onResume, this);
		this.scale.removeListener("resize", this.resizeCamera, this);
		this.input.removeListener("pointerdown");

		// base class shutdown
		super.shutdown();
	}

	launchMenuOverlay() {
		// pause main menu
		this.scene.pause();

		// sfx
		this.sound.play("ui_open", { volume: this.sceneHead.audio.sfx.volume.value });

		// launch options menu
		this.scene.launch("Options", {
			sceneHead: this.sceneHead,
			scenePaused: this,
		});
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
