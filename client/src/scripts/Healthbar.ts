import { Game } from "../scenes/Game";

type Bar = {
	left: Phaser.GameObjects.Image;
	middle: Phaser.GameObjects.Image;
	right: Phaser.GameObjects.Image;
};

export class Healthbar {
	scene: Game;
	id: string;
	width: number;
	x: number;
	y: number;
	bar: Bar;
	shadowBar: Bar;

	constructor(scene: Game, x: number, y: number, id: string, width: number) {
		// save values
		this.scene = scene;
		this.id = id;
		this.width = width;
		this.x = x;
		this.y = y;

		// create bar shadow
		this.shadowBar = this.createBar(x, y, {
			left: id + "_shadow_left",
			middle: id + "_shadow_middle",
			right: id + "_shadow_right",
		});

		// create bar
		this.bar = this.createBar(x, y, {
			left: id + "_health_left",
			middle: id + "_health_middle",
			right: id + "_health_right",
		});

		// initialize bar to full
		this.setPercent();
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
		bar.left = this.scene.add.image(x, y, texture.left).setOrigin(0, 0.5);

		// middle slice
		bar.middle = this.scene.add
			.image(bar.left.x + bar.left.width, y, texture.middle)
			.setOrigin(0, 0.5);
		bar.middle.displayWidth = this.width;

		// right slice
		bar.right = this.scene.add
			.image(bar.middle.x + bar.middle.displayWidth, y, texture.right)
			.setOrigin(0, 0.5);

		return bar as Bar;
	}

	// instantly changes the bars percent
	setPercent(percent = 1) {
		// get new width
		const width = this.width * percent;

		// set to new width
		this.bar.middle.displayWidth = width;

		// move right slice along with the new middle width
		this.bar.right.x = this.bar.middle.x + this.bar.middle.displayWidth;
	}

	// sets the bars percent while animating the change
	setPercentAnimated(percent = 1, duration = 1000) {
		// get new width
		const width = this.width * percent;

		// animate bar change
		this.scene.tweens.add({
			targets: this.bar.middle,
			displayWidth: width,
			duration,
			ease: Phaser.Math.Easing.Sine.Out,
			onUpdate: () => {
				// update right slice
				this.bar.right.x =
					this.bar.middle.x + this.bar.middle.displayWidth;

				// change left slice
				this.bar.left.visible = this.bar.middle.displayWidth > 0;

				// change middle slice
				this.bar.middle.visible = this.bar.middle.displayWidth > 0;

				// change right slice
				this.bar.right.visible = this.bar.middle.displayWidth > 0;
			},
		});
	}
}
