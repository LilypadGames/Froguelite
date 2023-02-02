import Phaser from "phaser";
import WebFont from "webfontloader";

//
// This is meant for loading in any data, such as a save game state, prior to entering the main menu.
//

export class Load extends Phaser.Scene {
	constructor() {
		super({
			key: "Load",
			pack: {
				files: [
					{
						type: "json",
						key: "enemyData",
						url: "assets/data/enemy.json",
					},
				],
			},
		});
	}

	preload() {
		// load world
		this.load.image("world_tiles", "assets/world/tiles.png");
		this.load.tilemapTiledJSON("riverside", "assets/world/riverside.json");

		// load player character sprite sheet
		this.load.spritesheet("pp", "assets/character/pp.png", {
			frameWidth: 9,
			frameHeight: 7,
			spacing: 1,
		});

		// load enemy data
		let enemyData = this.cache.json.get("enemyData");
		Object.keys(enemyData).forEach((key) => {
			// load enemy sprite
			this.load.image(
				enemyData[key]["texture"],
				"assets/enemy/" + enemyData[key]["texture"] + ".png"
			);
		});

		// load fonts
		WebFont.load({
			active: () => {
				// fonts are loaded, continue to next scene
				this.scene.start("Menu");
			},
			// custom fonts
			custom: {
				families: ["Pix"],
			},
		});
	}

	create() {}
}
