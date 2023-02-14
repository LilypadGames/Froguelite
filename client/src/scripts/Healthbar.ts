import { Container } from "phaser3-rex-plugins/templates/ui/ui-components";
import { Game } from "../scenes/Game";

type Bar = {
	left: Phaser.GameObjects.Image;
	middle: Phaser.GameObjects.Image;
	right: Phaser.GameObjects.Image;
};

export class Healthbar {
	scene: Phaser.Scene;
	id: string;
	width: number;
	x: number;
	y: number;
	fullBar: Bar;
	emptyBar: Bar;
	bar: Phaser.GameObjects.Container;
	scale: number;
	protected percent: number;

	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		id: string,
		width: number,
		percent: number
	) {
		// get healthbar data
		let healthbarData = scene.cache.json.get("healthbarData");

		// save values
		this.scene = scene;
		this.id = id;
		this.width = width;
		this.x = x;
		this.y = y;
		this.scale = healthbarData[id].scale;
		this.percent = percent;

		// create bar empty
		this.emptyBar = this.createBar(0, 0, {
			left: "healthbar_" + id + "_empty_left",
			middle: "healthbar_" + id + "_empty_middle",
			right: "healthbar_" + id + "_empty_right",
		});

		// create bar
		this.fullBar = this.createBar(0, 0, {
			left: "healthbar_" + id + "_full_left",
			middle: "healthbar_" + id + "_full_middle",
			right: "healthbar_" + id + "_full_right",
		});

		// create healthbar container
		this.bar = scene.add.container(x, y, [
			this.emptyBar.left,
			this.emptyBar.middle,
			this.emptyBar.right,
			this.fullBar.left,
			this.fullBar.middle,
			this.fullBar.right,
		]);

		// initialize bar to full
		this.setPercent(percent);
	}

	// creates a bar
	createBar(
		x: number,
		y: number,
		texture: { left: string; middle: string; right: string }
	) {
		// init bar object
		let bar: any = {};

		// left slice
		bar.left = this.scene.add
			.image(x - (this.width / 2) * 1.05, y, texture.left)
			.setScale(this.scale, this.scale)
			.setOrigin(0, 0.5)
			.setScrollFactor(0);

		// middle slice
		bar.middle = this.scene.add
			.image(bar.left.x + bar.left.width * this.scale, y, texture.middle)
			.setScale(this.scale, this.scale)
			.setOrigin(0, 0.5)
			.setScrollFactor(0);
		bar.middle.displayWidth = this.width;

		// right slice
		bar.right = this.scene.add
			.image(bar.middle.x + bar.middle.displayWidth, y, texture.right)
			.setScale(this.scale, this.scale)
			.setOrigin(0, 0.5)
			.setScrollFactor(0);

		return bar as Bar;
	}

	// returns the current percent of the bar
	getPercent() {
		return this.percent;
	}

	// instantly changes the bars percent
	setPercent(percent = 1) {
		// get new width
		const width = this.width * percent;

		// set to new width
		this.fullBar.middle.displayWidth = width;

		// move right slice along with the new middle width
		this.fullBar.right.x =
			this.fullBar.middle.x + this.fullBar.middle.displayWidth;

		// set percent
		this.percent = percent;
	}

	// sets the bars percent while animating the change
	setPercentAnimated(percent = 1, duration = 1000) {
		// get new width
		const width = this.width * percent;

		// animate bar change
		this.scene.tweens.add({
			targets: this.fullBar.middle,
			displayWidth: width,
			duration,
			ease: Phaser.Math.Easing.Sine.Out,
			onUpdate: () => {
				// update right slice
				this.fullBar.right.x =
					this.fullBar.middle.x + this.fullBar.middle.displayWidth;

				// change left slice
				this.fullBar.left.visible =
					this.fullBar.middle.displayWidth > 0;

				// change middle slice
				this.fullBar.middle.visible =
					this.fullBar.middle.displayWidth > 0;

				// change right slice
				this.fullBar.right.visible =
					this.fullBar.middle.displayWidth > 0;

				// update percent as the bar is animated
				this.percent = this.fullBar.middle.displayWidth / this.width;
			},
		});
	}
}
