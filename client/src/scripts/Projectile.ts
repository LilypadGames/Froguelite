import { Game } from "../scenes/Game";
import { Enemy } from "./Enemy";

export class Projectile extends Phaser.Physics.Matter.Sprite {
	// visual
	depth: number = 11;

	// stats
	speed!: number;
	lifespan!: number;
	state: number = 0;
	damage: number;

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
		this.damage = projectileData[id]["damage"];

		// trigger collisions, but don't actually collide
		this.setSensor(true);

		// detect specific collisions
		this.setOnCollide(
			(entities: Phaser.Types.Physics.Matter.MatterCollisionData) => {
				// collided with enemy
				if (entities.bodyA.gameObject instanceof Enemy) {
					this.collideEnemy(entities.bodyA);
				}
				// collided with wall
				else if (
					entities.bodyA.gameObject instanceof
					Phaser.Physics.Matter.TileBody
				) {
					this.collideWall();
				}
			}
		);

		// set depth (renders under/over other sprites)
		this.setDepth(this.depth);

		// rotate with camera rotation
		scene.fixedObjectsGroup.add(this);

		// hide
		this.hide();

		// events
		scene.matter.world.on("afterupdate", this.afterupdate, this);
		this.once("destroy", this.onDestroy, this);
	}

	// runs on projectiles after physics have been applied
	afterupdate() {
		let delta = this.scene.matter.world.getDelta();
		if (this.state > 0) {
			// lower lifespan
			this.state -= delta;

			// hide projectile when its reached the end of its lifespan
			if (this.state <= 0) {
				// reset velocity
				this.setPosition(this.x, this.y);
				this.setVelocity(0, 0);

				// pop
				this.pop();
			}
		}
	}

	onDestroy() {
		// remove listeners
		this.scene.matter.world.removeListener(
			"afterupdate",
			this.afterupdate,
			this
		);
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

		// reset to normal look
		this.setFrame(0);

		// show projectile
		this.show();
	}

	// collided with enemy
	collideEnemy(enemyBody: MatterJS.BodyType) {
		// get enemy
		let enemy: Enemy = enemyBody.gameObject;

		enemy.changeHealth(-this.damage);

		console.log("Collided with Enemy: " + enemy.name);

		// hide projectile
		this.pop();
	}

	// collided with wall
	collideWall() {
		console.log("Collided with Wall");
		this.pop();
	}

	// projectile has collided/ended
	pop() {
		// change to popped look
		this.setFrame(1);

		// stop movement
		this.setVelocity(0, 0);

		setTimeout(() => {
			this.hide();
		}, 80);
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
}
