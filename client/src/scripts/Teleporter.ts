// scenes
import { Game } from "../scenes/Game";

// components
import { Interactable } from "./Interactable";

export class Teleporter extends Interactable {
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
		let teleporterData = scene.cache.json.get("game").teleporters;

		// pass values
		super(scene, x, y, teleporterData[id].texture, "teleporter", tip);

		// save values
		this.scene = scene;
		this.id = id;
		this.teleportTo = teleportTo;
	}

	interact() {
		this.scene.changeScene("Game", {
			sceneHead: this.scene.sceneHead,
			level: this.teleportTo,
		});
	}
}
