// scenes
import { Game } from "../../scenes/Game";

// components
import { Interactable } from "../Interactable";
import { Spell } from "../Spell";
import { Traversable } from "./Traversable";

export class Lootable extends Interactable {
	// info
	loot: string;

	// collider
	collider: Phaser.Physics.Matter.Sprite;

	constructor(scene: Game, x: number, y: number, id: string) {
		// get lootable data
		const lootableData = scene.cache.json.get("game").lootable[id];

		// pass values
		super(scene, x, y, id, lootableData.type, "lootable", "Open");

		// save values
		this.loot = lootableData.loot;

		// create traversable collider (can be walked through by player but collides with everything else)
		this.collider = new Traversable(this);
	}

	preupdate() {
		super.preupdate();

		// sync position and rotation between collider and sensor
		this.setPosition(this.collider.x, this.collider.y);
		this.collider.setRotation(this.rotation);
	}

	onDestroy() {
		// destroy traversable
		this.collider.destroy();

		super.onDestroy();
	}

	// give loot
	interact() {
		try {
			// give armor
			if (this.scene.cache.json.get("game").armors[this.loot])
				this.scene.player.inventory.armors.push(this.loot);
			// give spell
			else if (this.scene.cache.json.get("game").spells[this.loot])
				this.scene.player.inventory.spells.push(this.loot);
		} catch {
			return;
		}

		// lootable open sound
		this.scene.sound.play("sfx_chest_open", {
			volume: this.scene.sceneHead.audio.sfx.volume.value,
		});

		// display item
		this.scene.HUD.displayItem(
			this.scene.cache.json.get("game").armors[this.loot].inventory
				.texture,
			this.scene.cache.json.get("lang.en_us").armor[this.loot].name,
			this.scene.cache.json.get("lang.en_us").armor[this.loot]
				.description,
			() => {
				// acquired sound
				this.scene.sound.play("sfx_acquired", {
					volume: this.scene.sceneHead.audio.sfx.volume.value,
				});
			}
		);

		// change to opened sprite
		this.setFrame(1);

		// disable
		this.enabled = false;

		// end collision
		super.interact();
	}

	// handle spell collision
	onCollideSpell(spell: Spell) {
		// cache force
		this.forces = this.scene.matter.vector.mult(
			(spell.body as MatterJS.BodyType).velocity,
			0.5
		);

		// sfx
		this.scene.sceneHead.play.sound(
			this.scene.cache.json.get("game").interactables[
				this.interactableType
			].sounds.hit
		);
	}
}
