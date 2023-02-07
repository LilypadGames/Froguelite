import { Circle } from "phaser3-rex-plugins/plugins/gameobjects/shape/shapes/geoms";

export class Projectile extends Phaser.Physics.Arcade.Sprite {
	dir!: string;

	// visual
	depth: number = 11;

	// stats
	speed: number = 120;
	lifespan: number = 1;
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

		// create anims
		scene.anims.create({
			key: "bubble",
			frames: this.anims.generateFrameNumbers(
				projectileData[id]["texture"],
				{
					start: 2,
					end: 2,
				}
			),
			frameRate: 1,
			repeat: -1,
		});
		scene.anims.create({
			key: "pop",
			frames: this.anims.generateFrameNumbers(
				projectileData[id]["texture"],
				{
					start: 3,
					end: 3,
				}
			),
			frameRate: 1,
			repeat: -1,
		});

		// update projectile
		scene.physics.world.on("worldstep", this.update, this);

		// set depth (renders under/over other sprites)
		this.setDepth(this.depth);

		// hide
		this.hide();
	}

	update(delta: number) {
		if (this.state > 0) {
			// lower lifespan
			this.state -= delta;

			// hide projectile when its reached the end of its lifespan
			if (this.state <= 0) {
				// reset velocity
				this.body.reset(this.x, this.y);

				// hide
				this.hide();
			}
		}
	}

	// fire projectile towards coords
	fire(
		originX: number,
		originY: number,
		destinationX: number,
		destinationY: number
	) {
		// reset velocity
		this.body.reset(originX, originY);

		// move projectile in direction of destination
		this.scene.physics.moveTo(this, destinationX, destinationY);

		// reset lifespan
		this.setState(this.lifespan);

		// show projectile
		this.show();
	}

	show() {
		// reset to default frame
		this.anims.play("bubble", true);

		this.setActive(true);
		this.setVisible(true);
	}

	hide() {
		// pop effect
		this.anims.play("pop", true);

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
			quantity: 10,
			key: projectileData[id]["texture"],
			frame: 2,
			setScale: projectileData[id]["scale"],
			setOrigin: { x: 0.5, y: 0.5 },
			// hitArea: scene.add.circle(300, 250, 128, 0xff00ff),
			// hitAreaCallback: () => {},
			active: false,
			visible: false,
			classType: Projectile,
		});
	}

	fire(
		originX: number,
		originY: number,
		destinationX: number,
		destinationY: number
	) {
		// find a projectile that is hidden
		let projectile: Projectile = this.getFirstDead(false);

		// if a projectile was found, then fire it
		if (projectile) {
			projectile.fire(originX, originY, destinationX, destinationY);
		}
	}
}
