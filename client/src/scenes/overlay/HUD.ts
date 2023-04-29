import { Camera } from "../../scripts/Camera";
import ColorScheme from "../../scripts/ColorScheme";
import { Enemy } from "../../scripts/Enemy";
import { Healthbar } from "../../scripts/Healthbar";
import { Player } from "../../scripts/Player";
import Utility from "../../scripts/Utility";
import { Game } from "../Game";

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

	update() {
		// if there are bosses, detect if any nearby the player
		if (this.sceneGame.bossGroup.getLength() > 0) this.detectBosses();
	}

	// set tip above player
	setTip(text: string, time?: number) {
		this.tip.setText(text);
	}

	// check for bosses nearby player and display HUD
	detectBosses() {
		// init distance object
		var distance: {
			[key: number]: number;
		} = {};

		// get distance between boss and player
		(this.sceneGame.bossGroup.getChildren() as Array<Enemy>).forEach(
			(boss: Enemy, index: number) => {
				// is ded
				if (boss.isDead) return;

				// doesn't have health bar
				if (
					boss.details === undefined ||
					boss.details.healthbar == undefined
				)
					return;

				// get distance
				distance[index] = Phaser.Math.Distance.Between(
					boss.x,
					boss.y,
					this.sceneGame.player.x,
					this.sceneGame.player.y
				);
			}
		);

		// boss distances found
		if (Object.keys(distance).length > 0) {
			// find shortest distance
			var min: number = Number(
				Object.keys(distance).reduce((key, v) =>
					distance[v as any] < distance[key as any] ? v : key
				)
			);

			// get closest boss
			let closestBoss = (
				this.sceneGame.bossGroup.getChildren() as Array<Enemy>
			)[min];

			// distance is within threshold
			if (distance[min] <= 300) {
				// init health bar if not already initialized
				if (closestBoss.healthbar === undefined) {
					// create healthbar
					closestBoss.createHealthbar();
				}

				// show boss bar
				if (closestBoss.healthbar.bar.visible === false)
					closestBoss.healthbar.show();
			}
			// hide boss bars of bosses that are farther away
			else {
				if (closestBoss.healthbar.bar.visible === true)
					closestBoss.healthbar.hide();
			}

			// // hide boss bar of others
			// (this.sceneGame.bossGroup.getChildren() as Array<Enemy>).forEach(
			// 	(boss: Enemy, index: number) => {
			// 		// skip closest
			// 		if (index === min) return;

			// 		// is ded
			// 		if (boss.isDead) return;

			// 		// doesn't have health bar
			// 		if (boss.healthbar === undefined) return;

			// 		// hide boss bar
			// 		if (boss.healthbar.bar.visible === true)
			// 			boss.healthbar.hide();
			// 	}
			// );
		}
	}
}
