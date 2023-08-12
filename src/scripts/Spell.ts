// scenes
import { Game } from "../scenes/Game";

// components
import { Enemy } from "./Enemy";

// config
import config from "../config";

// utility
import Utility from "./utility/Utility";

export class Spell extends Phaser.Physics.Matter.Sprite {
	// info
	scene: Game;
	id: string;

	// stats
	speed!: number;
	lifespan!: number;
	state: number = 0;
	damage: number;

	constructor(scene: Game, x: number, y: number, id: string) {
		// get spell data
		let spellData = scene.cache.json.get("game").spells;

		// pass values
		super(scene.matter.world, x, y, spellData[id].texture);

		// save values
		this.scene = scene;
		this.x = x;
		this.y = y;
		this.id = id;
		this.lifespan = spellData[id].lifespan;
		this.speed = spellData[id].speed;
		this.damage = spellData[id].damage;

		// set depth (renders under/over other sprites)
		this.setDepth(config.depth.projectiles);

		// hide
		this.hide();

		// trigger collisions without physically colliding
		this.setBody(
			{ type: "rectangle", width: this.width, height: this.height },
			{
				isSensor: true,
				label: "Spell",
				mass: 100,
				friction: 0.1,
				frictionAir: 0.01,
				frictionStatic: 0.5,
			}
		);

		// set collision filters
		this.setCollisionCategory(config.collisionGroup.spell);
		this.setCollidesWith([
			config.collisionGroup.world,
			config.collisionGroup.enemy,
			config.collisionGroup.traversable,
		]);

		// detect specific collisions
		this.setOnCollide(
			(entities: Phaser.Types.Physics.Matter.MatterCollisionData) => {
				// if not active, ignore
				if (!this.active || !this.visible) return;

				// collided with enemy
				if (entities.bodyA.gameObject instanceof Enemy)
					this.collideEnemy(entities.bodyA);
				// collided with wall
				else if (
					entities.bodyA.gameObject instanceof
					Phaser.Physics.Matter.TileBody
				)
					this.collideWall();
				// collided with traversable
				else if (
					entities.bodyA.collisionFilter.category ===
					config.collisionGroup.traversable
				)
					this.collideTraversable();
			}
		);

		// events
		scene.matter.world.on("afterupdate", this.afterupdate, this);
		this.once("destroy", this.onDestroy, this);
	}

	// runs on spells after physics have been applied
	afterupdate() {
		// only run on active spells
		if (!this.active) return;

		// get time alive
		let delta = this.scene.matter.world.getDelta();

		// kill if at end of lifespan
		if (this.state > 0) {
			// lower lifespan
			this.state -= delta;

			// hide spell when its reached the end of its lifespan
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

	// fire spell towards given coords
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

		// show spell
		this.show();
	}

	// collided with enemy
	collideEnemy(enemyBody: MatterJS.BodyType) {
		// sfx
		this.scene.sound.play(
			this.scene.cache.json.get("game").spells[this.id].sounds.success,
			{
				volume: this.scene.sceneHead.audio.sfx.volume.value,
				detune: Utility.random.int(-300, 300),
			}
		);

		// get enemy
		let enemy: Enemy = enemyBody.gameObject;

		// damage enemy
		enemy.changeHealth(-this.damage);

		// hide spell
		this.pop();
	}

	// collided with wall
	collideWall() {
		// sfx
		this.scene.sound.play(
			this.scene.cache.json.get("game").spells[this.id].sounds.fail,
			{
				volume: this.scene.sceneHead.audio.sfx.volume.value,
				detune: Utility.random.int(-300, 300),
			}
		);

		// hide spell
		this.pop();
	}

	// collided with traversable
	collideTraversable() {
		// sfx
		this.scene.sound.play(
			this.scene.cache.json.get("game").spells[this.id].sounds.fail,
			{
				volume: this.scene.sceneHead.audio.sfx.volume.value,
				detune: Utility.random.int(-300, 300),
			}
		);

		// hide spell
		this.pop();
	}

	// spell has collided/ended
	pop() {
		// change to popped look
		this.setFrame(1);

		// stop movement
		this.setVelocity(0, 0);

		setTimeout(() => {
			this.hide();
		}, 80);
	}

	// show and activate spell
	show() {
		this.setActive(true);
		this.setVisible(true);
	}

	// hide and de-activate spell
	hide() {
		this.setActive(false);
		this.setVisible(false);
	}
}

// group of spells. its better to spawn a ton of spells, hide them all, then show them one at a time as needed and hide them again when done.
export class Spells extends Phaser.GameObjects.Group {
	// info
	scene: Game;
	id: string;
	config: Phaser.Types.GameObjects.Group.GroupCreateConfig;

	constructor(scene: Game, id: string) {
		// get spell data
		let spellData = scene.cache.json.get("game").spells;

		// pass values
		super(scene);

		// save values
		this.scene = scene;
		this.id = id;

		// create spell configuration
		this.config = {
			quantity: 10,
			key: spellData[id].texture,
			setOrigin: { x: 0.5, y: 0.5 },
			setDepth: { value: config.depth.projectiles },
			setScale: {
				x: spellData[id].scale,
				y: spellData[id].scale,
			},
			active: false,
			visible: false,
			classType: Spell,
		};

		// create spells and hide them
		this.createMultiple(this.config);
	}

	// fire spell. this finds a hidden spell and fires it.
	fire(
		originX: number,
		originY: number,
		destinationX: number,
		destinationY: number
	) {
		// find hidden spell
		let spell: Spell = this.getFirstDead();

		// no spell found: create one
		if (!spell)
			spell = this.createFromConfig(this.config) as unknown as Spell;

		// sfx
		this.scene.sound.play(
			this.scene.cache.json.get("game").spells[this.id].sounds.start,
			{
				volume: this.scene.sceneHead.audio.sfx.volume.value,
				detune: Utility.random.int(-300, 300),
			}
		);

		// fire
		if (spell.fire)
			spell.fire(originX, originY, destinationX, destinationY);
		else if (Array.isArray(spell) && spell.length > 0) {
			spell[0].fire(originX, originY, destinationX, destinationY);
		}
	}
}
