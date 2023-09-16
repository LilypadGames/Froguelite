// imports
import Phaser from "phaser";
import WebFont from "webfontloader";
import store from "storejs";
import { extractColors } from "extract-colors";

// config
import config from "../../config";

/**
 * Loads textures, sounds, and other data that will be used by the game.
 */
export class Load extends Phaser.Scene {
	// animations extracted from texture data, queued to be added to the game
	animQueue: {
		texture: string;
		anims: {
			[key: string]: ITextureCacheDataAnim;
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
						url: "data/textures.json",
					},
					{
						type: "json",
						key: "audio",
						url: "data/audio.json",
					},
					{
						type: "json",
						key: "world",
						url: "data/world.json",
					},
					{
						type: "json",
						key: "fonts",
						url: "data/fonts.json",
					},
					{
						type: "json",
						key: "game",
						url: "data/game.json",
					},
					{
						type: "json",
						key: "lang.en_us",
						url: "lang/en_us.json",
					},
				],
			},
		});
	}

	preload() {
		// default options
		if (store.get("settings.options.highPerformanceMode") == null)
			store.set("settings.options.highPerformanceMode", false);
		if (store.get("settings.options.audio.master.enabled") == null)
			store.set("settings.options.audio.master.enabled", true);
		if (store.get("settings.options.audio.music.enabled") == null)
			store.set("settings.options.audio.music.enabled", true);
		if (store.get("settings.options.audio.sfx.enabled") == null)
			store.set("settings.options.audio.sfx.enabled", true);
		if (store.get("settings.options.audio.master.volume") == null)
			store.set("settings.options.audio.master.volume", 1);
		if (store.get("settings.options.audio.music.volume") == null)
			store.set("settings.options.audio.music.volume", 0.5);
		if (store.get("settings.options.audio.sfx.volume") == null)
			store.set("settings.options.audio.sfx.volume", 1);

		// load textures/spritesheets
		const textures = this.cache.json.get("textures");
		for (const key in textures) {
			// image
			if (typeof textures[key] === "string")
				this.load.image(key, textures[key]);
			// spritesheet
			else {
				// get texture data of sprite
				const textureData = textures[key] as ITextureCacheData;

				// load spritesheet
				this.load.spritesheet(key, textureData.spritesheet, {
					frameWidth: textureData.frameWidth,
					frameHeight: textureData.frameHeight,
					spacing: textureData.spacing
						? textureData.spacing
						: undefined,
				});

				// queue anims for loading
				if (textureData)
					this.animQueue.push({
						texture: key,
						anims: textureData.anims,
					});
			}
		}

		// load audio
		const audio = this.cache.json.get("audio");
		for (const key in audio) {
			// single audio files
			if (typeof audio[key] === "string")
				this.load.audio(key, audio[key]);
			// multiple audio file
			else if (
				Array.isArray(audio[key]) &&
				audio[key].length > 0 &&
				audio[key].every((value: any) => {
					return typeof value === "string";
				})
			) {
				// load all audio files
				for (const [i, file] of audio[key].entries()) {
					this.load.audio(key + "_" + (i + 1), file);
				}
			}
		}

		// load world levels and structures
		const world = this.cache.json.get("world");
		for (const level in world.level) {
			// tilemap
			if (world.level[level].type === "tilemap")
				this.load.tilemapTiledJSON(level, world.level[level].file);
			// infinite
		}
		for (const structure in world.structure) {
			this.load.tilemapTiledJSON(structure, world.structure[structure]);
		}

		// set up collision groups
		for (const [group, _value] of Object.entries(config.collisionGroup)) {
			config.collisionGroup[group as keyof typeof config.collisionGroup] =
				this.matter.world.nextCategory();
		}

		// setup death animations
		for (const enemy in (this.cache.json.get("game") as IGameCacheData)
			.enemies) {
			// get texture key
			const textureKey = (this.cache.json.get("game") as IGameCacheData)
				.enemies[enemy].texture;

			// get texture source
			const textureSource =
				typeof this.cache.json.get("textures")[textureKey] === "string"
					? (this.cache.json.get("textures")[textureKey] as string)
					: (
							this.cache.json.get("textures")[
								textureKey
							] as ITextureCacheData
					  ).spritesheet;

			// extract colors from texture
			this.cache.addCustom("colorData");
			extractColors(textureSource, {
				// accept everything except transparent pixels
				colorValidator: (_red, _green, _blue, alpha = 255) => alpha > 0,
			})
				.then((value) => {
					// add texture's color data to list of color data
					this.cache.custom.colorData.add(textureKey, value);
				})
				.catch(console.error);
		}

		// load fonts
		WebFont.load(this.cache.json.get("fonts"));
	}

	create() {
		// create anims
		this.animQueue.forEach((element) => {
			for (const key in element.anims) {
				// create anim
				this.anims.create({
					key: element.texture + "_" + key,
					frames: this.anims.generateFrameNumbers(element.texture, {
						start: element.anims[key].frames.start,
						end: element.anims[key].frames.end
							? element.anims[key].frames.end
							: element.anims[key].frames.start,
					}),
					frameRate: element.anims[key].frameRate
						? element.anims[key].frameRate
						: 0,
					repeat: element.anims[key].auto ? -1 : 0,
				});
			}
		});

		// start game
		this.scene.start("Head");
	}
}
