import { Camera } from "../../scripts/Camera";
import { Healthbar } from "../../scripts/Healthbar";
import { Player } from "../../scripts/Player";
import { Game } from "../Game";
import { Core } from "../internal/Core";

export class HUD extends Core {
	sceneGame!: Game;
	player!: Player;
	tip!: Phaser.GameObjects.Text;
	playerHealthbar!: Healthbar;
	camera!: Camera;

	constructor() {
		super({ key: "HUD" });
	}

	init(sceneGame: Game) {
		// save values
		this.sceneGame = sceneGame;
		this.player = sceneGame.player;
		this.camera = sceneGame.camera;

		// save HUD scene to Game scene
		this.sceneGame.HUD = this;
	}

	preload() {}

	create() {
		// init tip text
		this.tip = this.add
			.text(window.innerWidth / 2, (window.innerHeight / 5) * 2.2, "", {
				fontSize: "28px",
				fontFamily: "Pix",
				color: "#ffffff",
				strokeThickness: 10,
				stroke: "#000000",
				align: "center",
			})
			.setOrigin(0.5, 0.5)
			.setScrollFactor(0);

		// create player healthbar
		this.playerHealthbar = new Healthbar(
			this,
			window.innerWidth / 2,
			window.innerHeight / 2,
			"player",
			180,
			this.player.getHealthPercent()
		);
	}

	update() {
		// get player health percent from health
		let playerHealth = this.playerHealthbar.getPercent();

		//show and update healthbar (less than max but not at 0)
		if (playerHealth < 1 && playerHealth > 0) {
			// set position
			this.playerHealthbar.bar.setPosition(
				window.innerWidth / 2,
				window.innerHeight / 2 +
					(this.player.height * this.camera.zoom) / 1.4
			);

			// set scale
			this.playerHealthbar.bar.setScale(this.camera.zoom / 20);

			// show
			if (this.playerHealthbar.bar.visible === false)
				this.playerHealthbar.bar.setVisible(true);
		}
		// hide healthbar
		else {
			// hide
			if (this.playerHealthbar.bar.visible === true)
				this.playerHealthbar.bar.setVisible(false);
		}
	}

	setTip(text: string, time?: number) {
		this.tip.setText(text);
	}
}
