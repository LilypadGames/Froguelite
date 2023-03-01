import { Game } from "../scenes/Game";
import { Entity } from "./Entity";
import { Healthbar } from "./Healthbar";

interface stats {
	health: number;
	healthMax: number;
	speed: number;
	fireRate?: number;
}

interface details {
	healthbarID?: string;
	boss?: boolean;
}

export class LivingEntity extends Entity {
	scene: Game;
	label: string;
	textureKey: string;

	// state
	isDead: boolean;

	// HUD
	healthbar!: Healthbar;

	// stats
	stats: stats;

	// details
	details: details | undefined;

	constructor(
		scene: Game,
		x: number,
		y: number,
		textureKey: string,
		label: string,
		stats: stats,
		details?: details
	) {
		// pass values
		super(scene, x, y, textureKey, label);

		// save values
		this.scene = scene;
		this.label = label;
		this.textureKey = textureKey;

		// init stats
		this.isDead = false;
		this.stats = stats;
		if (this.stats.healthMax === undefined)
			this.stats.healthMax = this.stats.health;

		// init details
		this.details = details;
	}

	// kill entity
	kill() {
		// remove entity if not already dead
		if (!this.isDead) {
			// hide health bar
			if (this.healthbar !== undefined) this.healthbar.hide();

			// hide entity
			this.isDead = true;
			this.hide();
			// this.destroy();
		}
	}

	// get this entity's health percent
	getHealthPercent() {
		return this.stats.health / this.stats.healthMax;
	}

	// set this entity's health
	setHealth(health: number) {
		// over max
		if (health > this.stats.healthMax) {
			this.stats.health = this.stats.healthMax;
		}
		// under min
		else if (health < 0) {
			this.stats.health = 0;
		}
		// set health
		else {
			this.stats.health = health;
		}

		// update healthbar
		this.updateHealthbar();
	}

	// change this entity's health. returns false if nothing changed, or will return a number representing how much the health changed.
	changeHealth(change: number) {
		// change is 0, healing when health is already maxed, or damaging when health is already 0
		if (
			(change > 0 && this.stats.health === this.stats.healthMax) ||
			(change < 0 && this.stats.health === 0) ||
			change === 0
		)
			return false;

		// init difference to provided change
		let difference = change;

		// max out health
		if (this.stats.health + change > this.stats.healthMax) {
			// get difference between max and current health
			difference = this.stats.healthMax - this.stats.health;

			// set health to max
			this.stats.health = this.stats.healthMax;
		}
		// death
		else if (this.stats.health + change < 0) {
			// get health left as the difference
			difference = this.stats.health;

			// set health to 0
			this.stats.health = 0;
		}
		// normal health change
		else {
			// change health
			this.stats.health += change;
		}

		// update healthbar
		this.updateHealthbar();

		// dead
		if (this.stats.health <= 0) {
			// kill
			this.kill();
		}

		// return how much health was changed
		return difference;
	}

	// update the state of the healthbar
	updateHealthbar() {
		// no healthbar
		if (
			this.details === undefined ||
			this.details.healthbarID === undefined
		)
			return;

		// init health bar if not already initialized
		if (this.healthbar === undefined) {
			// create healthbar
			this.healthbar = new Healthbar(
				this.scene.HUD,
				this,
				0,
				0,
				this.details.healthbarID,
				this.getHealthPercent()
			);
		}

		// animate health bar
		this.healthbar.setPercentAnimated(this.getHealthPercent());
	}
}
