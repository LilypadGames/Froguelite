import Phaser from "phaser";
import config from "./config";
import { Boot } from "./scenes/internal/Boot";
import { Load } from "./scenes/internal/Load";
import { Menu } from "./scenes/Menu";

new Phaser.Game(
	Object.assign(config, {
		scene: [Boot, Load, Menu],
	})
);
