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
						key: "teleportData",
						url: "assets/data/teleport.json",
					},
					{
						type: "json",
						key: "enemyData",
						url: "assets/data/enemy.json",
					},
					{
						type: "json",
						key: "projectileData",
						url: "assets/data/projectile.json",
					},
					{
						type: "json",
						key: "worldData",
						url: "assets/data/world.json",
					},
				],
			},
		});
	}

	preload() {
		// load world
		this.load.image("world_tiles", "assets/world/tiles.png");
		this.load.tilemapTiledJSON("riverside", "assets/world/riverside.json");
		this.load.tilemapTiledJSON("dungeon", "assets/world/dungeon.json");

		// load player character sprite sheet
		this.load.spritesheet("pp", "assets/character/pp.png", {
			frameWidth: 9,
			frameHeight: 7,
			spacing: 1,
		});

		// load healthbar data
		let healthbarData = this.cache.json.get("healthbarData");
		Object.keys(healthbarData).forEach((key) => {
			healthbarData[key]["texture"].array.forEach(
				(textureType: {
					left: string;
					middle: string;
					right: string;
				}) => {
					textureType.array.forEach((texture: string) => {
						// load health bar
						this.load.image(
							key + "_" + textureType + "_" + texture,
							"assets/gui/healthbar/" +
								key +
								"_" +
								textureType +
								"_" +
								texture +
								".png"
						);
					});
				}
			);
		});

		// load teleport data
		let teleportData = this.cache.json.get("teleportData");
		Object.keys(teleportData).forEach((key) => {
			// load teleport sprite
			this.load.image(
				teleportData[key]["texture"],
				"assets/teleport/" + teleportData[key]["texture"] + ".png"
			);
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

		// load projectile data
		let projectileData = this.cache.json.get("projectileData");
		Object.keys(projectileData).forEach((key) => {
			this.load.spritesheet(
				projectileData[key]["texture"],
				"assets/projectile/" + projectileData[key]["texture"] + ".png",
				{
					frameWidth: 13,
					frameHeight: 13,
				}
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
