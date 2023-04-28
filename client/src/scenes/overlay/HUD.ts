import { Camera } from "../../scripts/Camera";
import ColorScheme from "../../scripts/ColorScheme";
import { Healthbar } from "../../scripts/Healthbar";
import { Player } from "../../scripts/Player";
import Utility from "../../scripts/Utility";
import { Game } from "../Game";
import { Core } from "../internal/Core";

export class HUD extends Phaser.Scene {
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
			.text(
				this.scale.gameSize.width / 2,
				(this.scale.gameSize.height / 5) * 2.2,
				"",
				{
					fontSize: "28px",
					fontFamily: "Pix",
					color: Utility.hex.toString(ColorScheme.White),
					strokeThickness: 10,
					stroke: Utility.hex.toString(ColorScheme.Black),
					align: "center",
				}
			)
			.setOrigin(0.5, 0.5)
			.setScrollFactor(0);
	}

	setTip(text: string, time?: number) {
		this.tip.setText(text);
	}
}
