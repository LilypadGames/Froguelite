// scenes
import { Game } from "../../scenes/Game";

// components
import { Interactable } from "../Interactable";

export class Teleporter extends Interactable {
	// info
	destination: string;

	constructor(scene: Game, x: number, y: number, id: string) {
		// get teleport data
		let teleporterData = scene.cache.json.get("game").teleporters[id];

		// pass values
		super(
			scene,
			x,
			y,
			id,
			teleporterData.type,
			"teleporter",
			teleporterData.tip
		);

		// save values
		this.destination = teleporterData.destination;
	}

	interact() {
		this.scene.changeScene("Game", {
			sceneHead: this.scene.sceneHead,
			level: this.destination,
		});
	}
}
