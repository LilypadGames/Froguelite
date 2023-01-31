import Phaser from "phaser";
import config from "./config";
import { Boot } from "./scenes/internal/Boot";
import { Load } from "./scenes/internal/Load";
import { Menu } from "./scenes/Menu";

//
// These are the scenes that are included in the game itself. The game is initialized here, and the config info is brought in from a separate file: config.ts
//

new Phaser.Game(
	Object.assign(config, {
		scene: [Boot, Load, Menu],
	})
);
