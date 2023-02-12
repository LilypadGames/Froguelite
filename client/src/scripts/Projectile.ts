import { Game } from "../scenes/Game";
import { Enemy } from "./Enemy";

export class Projectile extends Phaser.Physics.Matter.Sprite {
	// visual
	depth: number = 11;

	// stats
	speed!: number;
	lifespan!: number;
	state: number = 0;

	constructor(scene: Game, x: number, y: number, id: string) {
		// get projectile data
		let projectileData = scene.cache.json.get("projectileData");

		// pass values
		super(scene.matter.world, x, y, projectileData[id]["texture"]);

		// save values
		this.scene = scene;
		this.x = x;
		this.y = y;
		this.lifespan = projectileData[id]["lifespan"];
		this.speed = projectileData[id]["speed"];

		// update projectile
		scene.matter.world.on("afterupdate", this.update, this);

		// trigger collisions, but don't actually collide
		this.setSensor(true);

		// set depth (renders under/over other sprites)
		this.setDepth(this.depth);

		// rotate with camera rotation
		scene.fixedObjectsGroup.add(this);

		// hide
		this.hide();
	}

	// runs on projectiles after physics have been applied
	update() {
		let delta = this.scene.matter.world.getDelta();
		if (this.state > 0) {
			// lower lifespan
			this.state -= delta;

			// hide projectile when its reached the end of its lifespan
			if (this.state <= 0) {
				// reset velocity
				this.setPosition(this.x, this.y);
				this.setVelocity(0, 0);

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
		this.setPosition(originX, originY);
		this.setVelocity(0, 0);

		// get angle
		let angle = Phaser.Math.Angle.Between(
			originX,
			originY,
			destinationX,
			destinationY
		);

		// get vector
		let vector = this.scene.matter.vector.rotate(
			new Phaser.Math.Vector2(this.speed, 0),
			angle
		);

		// apply force
		this.applyForce(vector as Phaser.Math.Vector2);

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
export class Projectiles extends Phaser.GameObjects.Group {
	constructor(scene: Game, id: string) {
		// get projectile data
		let projectileData = scene.cache.json.get("projectileData");

		// pass values
		super(scene);

		// create projectiles and hide them
		this.createMultiple({
			quantity: 10,
			key: projectileData[id]["texture"],
			setOrigin: { x: 0.5, y: 0.5 },
			setScale: { x: 0.75, y: 0.75 },
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

	collideWall(projectile: Projectile) {
		console.log("Collided with Wall");
		projectile.hide();
	}

	collideEnemy(enemy: Enemy, projectile: Projectile) {
		console.log("Collided with " + enemy.name);
		projectile.hide();
	}
}
