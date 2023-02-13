import { Game } from "../scenes/Game";
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
		let teleportData = scene.cache.json.get("teleportData");

		// pass values
		super(scene, x, y, teleportData[id]["texture"], tip);

		// save values
		this.scene = scene;
		this.id = id;
		this.teleportTo = teleportTo;
	}

	interact() {
		this.scene.changeScene("Game", this.teleportTo);
	}
}
