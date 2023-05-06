// scenes
import { Game } from "../Game";

// plugins
import {
	RoundRectangle,
	Sizer,
} from "phaser3-rex-plugins/templates/ui/ui-components";

// components
import { Camera } from "../../scripts/Camera";
import { Enemy } from "../../scripts/Enemy";
import { Healthbar } from "../../scripts/Healthbar";
import { Player } from "../../scripts/Player";

// utility
import ColorScheme from "../../scripts/ColorScheme";
import Utility from "../../scripts/Utility";

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

	displayItem(
		texture: string,
		name: string,
		description: string,
		displayedCallback: () => void
	) {
		// pause game
		this.scene.pause("Game", { pauseHUD: false });

		// create transparent background overlay
		let background = this.add
			.rectangle(
				this.scale.gameSize.width / 2,
				this.scale.gameSize.height / 2,
				this.scale.gameSize.width,
				this.scale.gameSize.height,
				ColorScheme.Black,
				1
			)
			.setAlpha(0);

		// fade in background
		this.tweens.add({
			targets: background,
			ease: "Sine.easeIn",
			duration: 300,
			alpha: 0.5,
		});

		// create display
		let display = new Sizer(this, {
			x: this.sys.game.canvas.width / 2,
			y: this.sys.game.canvas.height / 2,
			orientation: "x",
			space: {
				top: 20,
				bottom: 20,
				left: 20,
				right: 20,
				item: 20,
			},
		})
			.addBackground(
				new RoundRectangle(
					this,
					0,
					0,
					0,
					0,
					10,
					ColorScheme.Black,
					0.5
				).addToDisplayList()
			)
			.add(
				new Phaser.GameObjects.Image(this, 0, 0, texture)
					.setScale(10)
					.addToDisplayList()
			)
			.add(
				new Sizer(this, {
					width: this.sys.game.canvas.width / 20,
					orientation: "y",
					space: {
						item: 10,
					},
				})
					.add(
						new Phaser.GameObjects.Text(this, 0, 0, name, {
							fontSize: "36px",
							fontFamily: "Pix",
							color: Utility.hex.toString(ColorScheme.White),
							align: "center",
						}).addToDisplayList()
					)
					.add(
						new Phaser.GameObjects.Line(
							this,
							this.sys.game.canvas.width / 6,
							0,
							0,
							0,
							this.sys.game.canvas.width / 6,
							0,
							ColorScheme.Gray
						).addToDisplayList()
					)
					.add(
						new Phaser.GameObjects.Text(this, 0, 0, description, {
							fontSize: "28px",
							fontFamily: "Pix",
							color: Utility.hex.toString(
								ColorScheme.LighterGray
							),
							align: "center",
							wordWrap: {
								width: this.sys.game.canvas.width / 6,
							},
						}).addToDisplayList()
					)
					.layout()
			)
			.setVisible(false)
			.setOrigin(0.5, 0.5)
			.setScale(0.5)
			.layout();

		// delay show
		setTimeout(() => {
			// show
			display.setVisible(true);

			// tween in
			this.tweens.add({
				targets: display,
				scale: 1,
				ease: "Bounce.easeOut",
				duration: 500,
				onStart: () => {
					// displayed item callback
					displayedCallback();
				},
				onComplete: () => {
					// allow closing
					this.input.on("pointerdown", () => {
						// remove input listener
						this.input.removeListener("pointerdown");

						// sfx
						this.sound.play("ui_select", { volume: 0.75 });

						// fade out background
						this.tweens.add({
							targets: background,
							ease: "Sine.easeOut",
							duration: 300,
							alpha: 0,
							onComplete: () => {
								// delete background
								background.destroy();
							},
						});

						// tween out display
						this.tweens.add({
							targets: display,
							scale: 0,
							ease: "Sine.easeOut",
							duration: 300,
							onComplete: () => {
								// delete item display
								display.destroy();

								// resume game
								this.scene.resume("Game");
							},
						});
					});
				},
			});
		}, 1300);
	}
}
