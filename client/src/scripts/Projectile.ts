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

		// update projectile
		scene.physics.world.on("worldstep", this.update, this);

		// set depth (renders under/over other sprites)
		this.setDepth(this.depth);

		// hide
		this.hide();
	}

	// runs constantly on active projectiles
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

	// fire projectile towards given coords
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

	// show and activate projectile
	show() {
		this.setActive(true);
		this.setVisible(true);
	}

	// hide and de-activate projectile
	hide() {
		this.setActive(false);
		this.setVisible(false);
	}
}

// group of projectiles. its better to spawn a ton of projectiles, hide them all, then show them one at a time as needed and hide them again when done.
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
			setOrigin: { x: 0.5, y: 0.5 },
			setScale: { x: 0.75, y: 0.75 },
			// hitArea: scene.add.circle(300, 250, 128, 0xff00ff),
			// hitAreaCallback: () => {},
			active: false,
			visible: false,
			classType: Projectile,
		});
	}

	// fire projectile. this finds a hidden projectile and fires it.
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
