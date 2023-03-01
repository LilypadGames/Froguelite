import { Game } from "../scenes/Game";
import { Entity } from "./Entity";
import { Healthbar } from "./Healthbar";

export class LivingEntity extends Entity {
	scene: Game;
	label: string;
	textureKey: string;

	// stats
	health: number;
	healthMax: number;

	// state
	isDead: boolean;

	// HUD
	showHealthbar: boolean | undefined;
	healthbar!: Healthbar;

	// stats
	speed: number;
	fireRate: number | undefined;

	constructor(
		scene: Game,
		x: number,
		y: number,
		textureKey: string,
		label: string,
		stats: { health: number; healthMax?: number, speed: number, fireRate?: number }
	) {
		// pass values
		super(scene, x, y, textureKey, label);

		// save values
		this.scene = scene;
		this.label = label;
		this.textureKey = textureKey;

		// init stats
		this.isDead = false;
		this.health = stats.health;
		this.healthMax = stats.healthMax ? stats.healthMax : stats.health;
		this.speed = stats.speed;
		this.fireRate = stats.fireRate ? stats.fireRate : undefined;
	}

	// kill entity
	kill() {
		// remove entity if not already dead
		if (!this.isDead) {
			this.isDead = true;
			this.destroy();
		}
	}

	// get this entity's health percent
	getHealthPercent() {
		return this.health / this.healthMax;
	}

	// set this entity's health
	setHealth(health: number) {
		// over max
		if (health > this.healthMax) {
			this.health = this.healthMax;
		}
		// under min
		else if (health < 0) {
			this.health = 0;
		}
		// set health
		else {
			this.health = health;
		}

		// update healthbar
		this.updateHealthbar();
	}

	// change this entity's health. returns false if nothing changed, or will return a number representing how much the health changed.
	changeHealth(change: number) {
		// change is 0, healing when health is already maxed, or damaging when health is already 0
		if (
			(change > 0 && this.health === this.healthMax) ||
			(change < 0 && this.health === 0) ||
			change === 0
		)
			return false;

		// init difference to provided change
		let difference = change;

		// max out health
		if (this.health + change > this.healthMax) {
			// get difference between max and current health
			difference = this.healthMax - this.health;

			// set health to max
			this.health = this.healthMax;
		}
		// death
		else if (this.health + change < 0) {
			// get health left as the difference
			difference = this.health;

			// set health to 0
			this.health = 0;

			// kill
			this.kill();
		}
		// normal health change
		else {
			// change health
			this.health += change;
		}

		// update healthbar
		this.updateHealthbar();

		// return how much health was changed
		return difference;
	}

	// update the state of the healthbar
	updateHealthbar() {
		// init health bar if not already initialized
		if (this.healthbar === undefined) {
			// create healthbar
			this.healthbar = new Healthbar(
				this.scene.HUD,
				this,
				0,
				0,
				this.label,
				160,
				this.getHealthPercent()
			);
		}

		// animate health bar
		this.healthbar.setPercentAnimated(this.getHealthPercent());
	}
}
