// scenes
import { Game } from "../scenes/Game";

// components
import { Interactable } from "./Interactable";

export class Lootable extends Interactable {
	id: string;
	loot: string;

	constructor(
		scene: Game,
		x: number,
		y: number,
		id: string,
		lootableType: string
	) {
		// pass values
		super(scene, x, y, lootableType, "lootable", "Open");

		// save values
		this.scene = scene;
		this.id = id;
		this.loot = scene.cache.json.get("game").loot.lootable[id];

		// set scale
		if (scene.cache.json.get("textures")[lootableType].scale)
			this.setScale(
				this.scene.cache.json.get("textures")[lootableType].scale
			);
	}

	// give loot
	interact() {
		// give armor
		if (this.scene.cache.json.get("game").armors[this.loot])
			this.scene.player.inventory.armors.push(this.loot);
		// give spell
		else if (this.scene.cache.json.get("game").spells[this.loot])
			this.scene.player.inventory.spells.push(this.loot);

		// change to opened sprite
		this.setFrame(1);

		// disable
		this.enabled = false;

		// end collision
		super.interact();
	}
}
