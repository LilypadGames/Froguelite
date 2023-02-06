import { Vector } from "matter";

export class Projectile extends Phaser.Physics.Arcade.Sprite {
	dir!: string;

	speed: number = 100;
	lifespan: number = 1000;
	state: number = 0;

	constructor(scene: Phaser.Scene, x: number, y: number, id: string) {
		// get projectile data
		let projectileData = scene.cache.json.get("projectileData");

		// pass values
		super(scene, x, y, projectileData[id]["texture"]);

		// save values
		this.scene = scene;
		this.x = x;
		this.y = y;

		// update projectile
		this.scene.physics.world.on("worldstep", this.update);

		// hide
		this.hide();
	}

	update(delta: number) {
		console.log("yo");
		if (this.state > 0) {
			// lower lifespan
			this.state -= delta;

			// if at 0, hide
			if (this.state === 0) this.hide();
		}
	}

	// fire projectile towards coords
	fire(
		actualOriginX: number,
		actualOriginY: number,
		originX: number,
		originY: number,
		destinationX: number,
		destinationY: number
	) {
		// get angle from origin to destination
		let angle = Phaser.Math.Angle.Between(
			originX,
			originY,
			destinationX,
			destinationY
		);

		// reset velocity
		this.body.reset(actualOriginX, actualOriginY);

		// set angle of projectile
		this.rotation = angle;

		// set velocity
		let vector = this.scene.physics.velocityFromAngle(angle, this.speed);
		this.setVelocity(vector.x, vector.y);

		console.log(
			[
				"Angle: " + angle,
				"Vector: " + JSON.stringify(vector),
				"Origin X: " + originX + " Origin Y: " + originY,
				"Destination X: " +
					destinationX +
					" Destination Y: " +
					destinationY,
			].join("\n")
		);

		// reset lifespan
		this.setState(this.lifespan);

		// show projectile
		this.show();
	}

	show() {
		this.setActive(true);
		this.setVisible(true);
	}

	hide() {
		this.setActive(false);
		this.setVisible(false);
	}
}

export class Projectiles extends Phaser.Physics.Arcade.Group {
	constructor(scene: Phaser.Scene, id: string) {
		// get projectile data
		let projectileData = scene.cache.json.get("projectileData");

		// pass values
		super(scene.physics.world, scene);

		// create projectiles and hide them
		this.createMultiple({
			frameQuantity: 10,
			key: projectileData[id]["texture"],
			active: false,
			visible: false,
			classType: Projectile,
		});
	}

	fire(
		actualOriginX: number,
		actualOriginY: number,
		originX: number,
		originY: number,
		destinationX: number,
		destinationY: number
	) {
		// find a projectile that is hidden
		let projectile: Projectile = this.getFirstDead(false);

		// if a projectile was found, then fire it
		if (projectile) {
			projectile.fire(
				actualOriginX,
				actualOriginY,
				originX,
				originY,
				destinationX,
				destinationY
			);
		}
	}

	update(time) {
		this.children.iterate((projectile) => {
			projectile.update(time);
		});
	}
}
