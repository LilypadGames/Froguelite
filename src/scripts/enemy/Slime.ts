// scenes
import { Game } from "../../scenes/Game";

// components
import { Enemy } from "../Enemy";

export class Slime extends Enemy {
	pounceTime = {
		min: 2000,
		max: 5000,
	};

	constructor(scene: Game, x: number, y: number, id: string) {
		// pass values
		super(scene, x, y, id);
	}
}
