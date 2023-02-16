import { HUD } from "../scenes/overlay/HUD";
import { LivingEntity } from "./LivingEntity";

type Bar = {
	left: Phaser.GameObjects.Image;
	middle: Phaser.GameObjects.Image;
	right: Phaser.GameObjects.Image;
};

export class Healthbar {
	scene: HUD;
	id: string;

	// owner reference
	owner: LivingEntity;

	// bar references
	fullBar: Bar;
	emptyBar: Bar;
	bar: Phaser.GameObjects.Container;

	// information
	width: number;
	x: number;
	y: number;
	scale: number;
	protected percent: number;

	constructor(
		scene: HUD,
		owner: LivingEntity,
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
		this.owner = owner;
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

		// hide
		this.hide();

		// update bar
		scene.events.on("update", this.update, this);
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
			.setOrigin(0, 0.5);

		// middle slice
		bar.middle = this.scene.add
			.image(bar.left.x + bar.left.width * this.scale, y, texture.middle)
			.setScale(this.scale, this.scale)
			.setOrigin(0, 0.5);
		bar.middle.displayWidth = this.width;

		// right slice
		bar.right = this.scene.add
			.image(bar.middle.x + bar.middle.displayWidth, y, texture.right)
			.setScale(this.scale, this.scale)
			.setOrigin(0, 0.5);

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

	// show
	show() {
		this.bar.setVisible(true);
	}

	// hide
	hide() {
		this.bar.setVisible(false);
	}

	// update healthbar position and scale when in use
	update() {
		// get owner health percent from health
		let percent = this.owner.getHealthPercent();

		// get owner position
		let relativePos = this.owner.getRelativePosition(
			this.scene.sceneGame.camera
		);

		//show and update healthbar (less than max but not at 0)
		if (percent < 1 && percent > 0) {
			// set position
			this.bar.setPosition(
				relativePos.x,
				relativePos.y +
					(this.owner.height *
						this.owner.scale *
						this.scene.camera.zoom) /
						1.4
			);

			// set scale
			this.bar.setScale(this.scene.camera.zoom / 20);

			// show
			if (this.bar.visible === false) this.show();
		}
		// hide healthbar
		else {
			// hide
			if (this.bar.visible === true) this.hide();
		}
	}
}
