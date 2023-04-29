// imports
import Phaser from "phaser";

// config
import config from "./config";

// scenes
import { Game } from "./scenes/Game";
import { Boot } from "./scenes/internal/Boot";
import { Load } from "./scenes/internal/Load";
import { MainMenu } from "./scenes/MainMenu";
import { Debug } from "./scenes/overlay/Debug";
import { HUD } from "./scenes/overlay/HUD";
import { Inventory } from "./scenes/overlay/Inventory";
import { Options } from "./scenes/overlay/Options";
import { Pause } from "./scenes/overlay/Pause";
import { Head } from "./scenes/internal/Head";

//
// These are the scenes that are included in the game itself. The game is initialized here, and the config info is brought in from a separate file: config.ts
//

new Phaser.Game(
	Object.assign(config, {
		scene: [
			Boot,
			Load,
			Head,
			MainMenu,
			Game,
			HUD,
			Pause,
			Options,
			Debug,
			Inventory,
		],
	})
);

// console banner
console.log("%c 🐸🪄 " + config.title + " [" + config.version + "] ", 'background-color:white; color:green; font-size:16px; font-weight: bold;')