import { Game } from "../scenes/Game";
import { Entity } from "./Entity";

export class Interactable extends Entity {
	tip: string;

	constructor(
		scene: Game,
		x: number,
		y: number,
		textureKey: string,
		tip: string
	) {
		// pass values
		super(scene, x, y, textureKey, "Interactable");

		// save values
		this.scene = scene;
		this.tip = tip;

		// set as sensor
		this.setSensor(true);
	}
}
