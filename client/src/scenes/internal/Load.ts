// imports
import Phaser from "phaser";
import WebFont from "webfontloader";
import store from "storejs";

//
// This is meant for loading in any data, such as a save game state, prior to entering the main menu.
//

export class Load extends Phaser.Scene {
	animQueue: {
		texture: string;
		anim: {
			[key: string]: number;
		};
	}[] = [];

	constructor() {
		super({
			key: "Load",
			pack: {
				files: [
					{
						type: "json",
						key: "textures",
						url: "assets/data/textures.json",
					},
					{
						type: "json",
						key: "audio",
						url: "assets/data/audio.json",
					},
					{
						type: "json",
						key: "tilemaps",
						url: "assets/data/tilemaps.json",
					},
					{
						type: "json",
						key: "fonts",
						url: "assets/data/fonts.json",
					},
					{
						type: "json",
						key: "game",
						url: "assets/data/game.json",
					},
					{
						type: "json",
						key: "lang.en_us",
						url: "assets/lang/en_us.json",
					},
				],
			},
		});
	}

	preload() {
		// default options
		if (store.get("settings.options.audio.master.volume") == null)
			store.set("settings.options.audio.master.volume", 1);
		if (store.get("settings.options.audio.music.volume") == null)
			store.set("settings.options.audio.music.volume", 0.5);
		if (store.get("settings.options.audio.sfx.volume") == null)
			store.set("settings.options.audio.sfx.volume", 1);

		// load textures/spritesheets
		let textures = this.cache.json.get("textures");
		for (const key in textures) {
			// image
			if (typeof textures[key] === "string")
				this.load.image(key, textures[key]);
			// spritesheet
			else {
				this.load.spritesheet(key, textures[key].spritesheet, {
					frameWidth: textures[key].frameWidth
						? textures[key].frameWidth
						: undefined,
					frameHeight: textures[key].frameHeight
						? textures[key].frameHeight
						: undefined,
					spacing: textures[key].spacing
						? textures[key].spacing
						: undefined,
				});

				// queue anims for loading
				if (textures[key])
					this.animQueue.push({
						texture: key,
						anim: textures[key].anim,
					});
			}
		}

		// load audio
		let audio = this.cache.json.get("audio");
		for (const key in audio) {
			this.load.audio(key, audio[key]);
		}

		// load tilemaps
		let tilemaps = this.cache.json.get("tilemaps");
		for (const key in tilemaps) {
			this.load.tilemapTiledJSON(key, tilemaps[key]);
		}

		// load fonts
		WebFont.load(this.cache.json.get("fonts"));
	}

	create() {
		// create anims
		this.animQueue.forEach((element) => {
			for (const key in element.anim) {
				this.anims.create({
					key: element.texture + "_" + key,
					frames: this.anims.generateFrameNumbers(element.texture, {
						start: element.anim[key],
						end: element.anim[key],
					}),
					frameRate: 1,
					repeat: -1,
				});
			}
		});

		// start game
		this.scene.start("Head");
	}
}
