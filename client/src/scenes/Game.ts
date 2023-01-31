import { Core } from "./internal/Core";

//
// This is the actual game. Every level of actual gameplay is handled by this scene. The level and its information is passed to this scene and is then populated.
//

export class Game extends Core {
	constructor() {
		super({ key: "Game" });
	}

	preload() {
		// preload core mechanics
		this.core.preload();
	}

	create() {
		// create core mechanics
		this.core.create();
	}
}
