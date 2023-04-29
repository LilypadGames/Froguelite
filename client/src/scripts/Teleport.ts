// scenes
import { Game } from "../scenes/Game";

// components
import { Interactable } from "./Interactable";

export class Teleport extends Interactable {
	id: string;
	teleportTo: string;

	constructor(
		scene: Game,
		x: number,
		y: number,
		id: string,
		tip: string,
		teleportTo: string
	) {
		// get teleport data
		let teleportData = scene.cache.json.get("game").teleporters;

		// pass values
		super(scene, x, y, teleportData[id].texture, "teleporter", tip);

		// save values
		this.scene = scene;
		this.id = id;
		this.teleportTo = teleportTo;
	}

	interact() {
		this.scene.changeScene("Game", { level: this.teleportTo });
	}
}
