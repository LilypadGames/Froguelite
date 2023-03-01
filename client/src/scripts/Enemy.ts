import { Game } from "../scenes/Game";
import { LivingEntity } from "./LivingEntity";

export class Enemy extends LivingEntity {
	id: string;

	constructor(scene: Game, x: number, y: number, id: string) {
		// get enemy data
		let enemyData = scene.cache.json.get("enemyData");

		// pass values
		super(scene, x, y, enemyData[id]["texture"], "Enemy", enemyData[id]["stats"]);

		// save values
		this.textureKey = enemyData[id]["texture"];
		this.id = id;

		// set name
		this.setName(enemyData[id]["name"]);

		// set scale
		this.setScale(enemyData[id]["scale"]);
	}

	update() {}
}
