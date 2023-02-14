import { Healthbar } from "../../scripts/Healthbar";
import { Player } from "../../scripts/Player";
import { Game } from "../Game";
import { Core } from "../internal/Core";

export class HUD extends Core {
	sceneGame!: Game;
	player!: Player;
	tip!: Phaser.GameObjects.Text;
	playerHealthbar!: Healthbar;

	constructor() {
		super({ key: "HUD" });
	}

	init(sceneGame: Game) {
		// save values
		this.sceneGame = sceneGame;

		// get player
		this.player = sceneGame.player;

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
			window.innerWidth / 150,
			window.innerWidth / 80,
			"player",
			150,
			this.player.getHealthPercent()
		);
	}

	update() {}

	setTip(text: string, time?: number) {
		this.tip.setText(text);
	}
}
