// internal
import { Core } from "./internal/Core";

// utility
import ColorScheme from "../scripts/utility/ColorScheme";
import Utility from "../scripts/utility/Utility";

/**
 * Main Menu of the game, where the player starts the game.
 */
export class MainMenu extends Core {
	logo!: Phaser.GameObjects.Text;
	begin!: Phaser.GameObjects.Text;

	constructor() {
		super({ key: "MainMenu" });
	}

	create() {
		// logo text
		this.logo = this.make
			.text({
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
				add: true,
			})
			.setOrigin(0.5, 0.5);

		// begin text
		this.begin = this.make
			.text({
				x: this.scale.gameSize.width / 2,
				y: (this.scale.gameSize.height / 5) * 4,
				text: this.cache.json.get("lang.en_us").opening_hint,
				style: {
					fontSize: "32px",
					fontFamily: "Pix",
					color: Utility.hex.toString(ColorScheme.White),
					align: "center",
				},
				add: true,
			})
			.setOrigin(0.5, 0.5);

		// begin text animation
		this.tweens.add({
			targets: this.begin,
			scale: 1.15,
			duration: 800,
			ease: "Sine.easeIn",
			yoyo: true,
			repeat: -1,
		});

		// set camera size and position
		this.cameras.main.setPosition(0, 0);

		// play music
		if (this.cache.json.get("game").music.mainmenu)
			super.playMusic(this.cache.json.get("game").music.mainmenu);

		// detect any input to start game
		// TODO: check if input is NOT the back input (pause menu button)
		this.input.keyboard?.once("keydown", this.enterGame, this);
		this.input.once("pointerdown", this.enterGame, this);
	}

	pause() {
		// hide
		this.hide();

		// core pause
		super.pause();
	}

	resume() {
		// show
		this.show();

		// core resume
		super.resume();
	}

	enterGame() {
		// sfx
		this.sceneHead.play.sound("ui_select");

		// tween logo out
		this.tweens.add({
			targets: this.logo,
			scale: 0,
			duration: 300,
			ease: "Sine.easeOut",
			onComplete: () => {
				// change to game scene
				this.changeScene("Game", {
					sceneHead: this.sceneHead,
					level: this.cache.json.get("game").start,
				});
			},
		});

		// tween text out
		this.tweens.add({
			targets: this.begin,
			scaleX: 0,
			scaleY: 0,
			duration: 300,
			ease: "Sine.easeOut",
		});
	}

	launchMenuOverlay() {
		// pause main menu
		this.scene.pause();

		// sfx
		this.sceneHead.play.sound("ui_open");

		// launch options menu
		this.scene.launch("Options", {
			sceneHead: this.sceneHead,
			scenePaused: this,
		});
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
