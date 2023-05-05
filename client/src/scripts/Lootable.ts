// scenes
import { Game } from "../scenes/Game";

// components
import { Interactable } from "./Interactable";

export class Lootable extends Interactable {
	sceneGame: Game;
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
		this.sceneGame = scene;
		this.id = id;
		this.loot = scene.cache.json.get("game").loot.lootable[id];

		// set scale
		if (scene.cache.json.get("textures")[lootableType].scale)
			this.setScale(scene.cache.json.get("textures")[lootableType].scale);
	}

	// give loot
	interact() {
		try {
			// give armor
			if (this.sceneGame.cache.json.get("game").armors[this.loot])
				this.sceneGame.player.inventory.armors.push(this.loot);
			// give spell
			else if (this.sceneGame.cache.json.get("game").spells[this.loot])
				this.sceneGame.player.inventory.spells.push(this.loot);
		} catch {
			return;
		}

		// lootable open sound
		this.sceneGame.sound.play("sfx_chest_open", { volume: 0.75 });

		// display item
		this.sceneGame.HUD.displayItem(
			this.sceneGame.cache.json.get("game").armors[this.loot].inventory
				.texture,
			this.sceneGame.cache.json.get("lang.en_us").armor[this.loot].name,
			this.sceneGame.cache.json.get("lang.en_us").armor[this.loot]
				.description,
			() => {
				// acquired sound
				this.sceneGame.sound.play("sfx_acquired", { volume: 0.75 });
			}
		);

		// change to opened sprite
		this.setFrame(1);

		// disable
		this.enabled = false;

		// end collision
		super.interact();
	}
}
