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
						key: "playerData",
						url: "assets/data/player.json",
					},
					{
						type: "json",
						key: "healthbarData",
						url: "assets/data/healthbar.json",
					},
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
					{
						type: "json",
						key: "audioData",
						url: "assets/data/audio.json",
					},
					{
						type: "json",
						key: "musicData",
						url: "assets/data/music.json",
					},
				],
			},
		});
	}

	preload() {
		// load world texture
		this.load.image("world_tiles", "assets/world/tiles.png");

		// load tilemap json
		this.load.tilemapTiledJSON("riverside", "assets/world/riverside.json");
		this.load.tilemapTiledJSON("dungeon", "assets/world/dungeon.json");

		// load player texture
		this.load.spritesheet("pp", "assets/character/pp.png", {
			frameWidth: 9,
			frameHeight: 7,
			spacing: 1,
		});

		// load healthbar data
		let healthbarData = this.cache.json.get("healthbarData");
		Object.keys(healthbarData).forEach((key) => {
			Object.keys(healthbarData[key]["texture"]).forEach(
				(textureType) => {
					Object.keys(
						healthbarData[key]["texture"][textureType]
					).forEach((texture) => {
						// load health bar texture
						this.load.image(
							"healthbar_" +
								key +
								"_" +
								textureType +
								"_" +
								texture,
							"assets/gui/healthbar/" +
								healthbarData[key]["texture"][textureType][
									texture
								] +
								".png"
						);
					});
				}
			);
		});

		// load teleport data
		let teleportData = this.cache.json.get("teleportData");
		Object.keys(teleportData).forEach((key) => {
			// load teleport texture
			this.load.image(
				teleportData[key]["texture"],
				"assets/teleport/" + teleportData[key]["texture"] + ".png"
			);
		});

		// load enemy data
		let enemyData = this.cache.json.get("enemyData");
		Object.keys(enemyData).forEach((key) => {
			// load enemy texture
			this.load.image(
				enemyData[key]["texture"],
				"assets/enemy/" + enemyData[key]["texture"] + ".png"
			);
		});

		// load projectile data
		let projectileData = this.cache.json.get("projectileData");
		Object.keys(projectileData).forEach((key) => {
			// load projectile texture
			this.load.spritesheet(
				projectileData[key]["texture"],
				"assets/projectile/" + projectileData[key]["texture"] + ".png",
				{
					frameWidth: 13,
					frameHeight: 13,
				}
			);
		});

		// load audio data
		let audioData = this.cache.json.get("audioData");
		Object.keys(audioData).forEach((key) => {
			this.load.audio(key, "assets/audio/" + audioData[key]);
		});

		// load font
		WebFont.load({
			custom: {
				families: ["Pix"],
				urls: ["./assets/site/style/main.css"],
			},
		});
	}

	create() {
		// start game
		this.scene.start("Head");
	}
}
