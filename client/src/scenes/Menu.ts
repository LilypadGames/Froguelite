import { Core } from "./internal/Core";

//
// This is the Main Menu, what you first see when you open the game.
//

export class Menu extends Core {
	constructor() {
		super({ key: "Menu" });
	}

	preload() {
		//preload core mechanics
		this.core.preload();
	}

	create() {
		//create core mechanics
		this.core.create();
	}
}
