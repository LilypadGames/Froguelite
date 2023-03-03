import Phaser from "phaser";
import config from "./config";
import { Game } from "./scenes/Game";
import { Boot } from "./scenes/internal/Boot";
import { Load } from "./scenes/internal/Load";
import { Menu } from "./scenes/Menu";
import { Debug } from "./scenes/overlay/Debug";
import { HUD } from "./scenes/overlay/HUD";
import { Inventory } from "./scenes/overlay/Inventory";
import { Options } from "./scenes/overlay/Options";
import { Pause } from "./scenes/overlay/Pause";

//
// These are the scenes that are included in the game itself. The game is initialized here, and the config info is brought in from a separate file: config.ts
//

new Phaser.Game(
	Object.assign(config, {
		scene: [Boot, Load, Menu, Game, HUD, Pause, Options, Debug, Inventory],
	})
);
