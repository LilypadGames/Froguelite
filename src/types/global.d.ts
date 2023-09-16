import { Head } from "../scenes/internal/Head";
import { FinalColor } from "extract-colors/lib/types/Color";

declare global {
	/** Data passed between Scenes */
	interface ISceneData {
		sceneHead: Head;
	}

	/** Data passed to Overlay Scenes */
	interface ISceneDataOverlay extends ISceneData {
		scenePaused: Phaser.Scene;
	}

	/** Data passed to the Inventory Scene */
	interface ISceneDataInventory extends ISceneDataOverlay {
		inventory?: string;
	}

	/** Data passed to the Game Scene */
	interface ISceneDataGame extends ISceneData {
		level: string;
	}

	/** Player Stats */
	interface IPlayerStats {
		health: number;
		healthMax: number;
		speed: number;
		fireRate: number;
	}

	/** Enemy Stats */
	interface IEnemyStats {
		health: number;
		healthMax: number;
		speed: number;
		strength: number;
	}

	/** Player Details */
	interface IPlayerDetails {
		healthbar?: {
			scale: number;
			width: number;
		};
		boss?: boolean;
	}

	/** Player's Equipped Items  */
	interface IPlayerEquippedItems {
		spell: string;
		armor?: string;
	}

	/** Player's Inventory */
	interface IPlayerInventory {
		spells: string[];
		armors: string[];
	}

	/** Tileset's Tile Data */
	interface ITilesetTiledata {
		[key: number]: ITiledata;
	}

	/** Tile Data */
	interface ITiledata {
		animation?: ITiledAnimationFrameData[];
	}

	/** Animation Frame Data from Tiled Tileset */
	interface ITiledAnimationFrameData {
		duration: number;
		tileid: number;
	}

	/** Properties of Tiles within a Tileset */
	interface ITilesetTileProperties {
		/** Whether or not the initial animation frame of this tile should be randomized */
		animationRandom?: boolean;
	}

	/** Texture Cache Sprite Data */
	interface ITextureCacheData {
		/** Spritesheet source of this sprite */
		spritesheet: string;
		/** Width in pixels of each sprite in provided spritesheet */
		frameWidth: number;
		/** Height in pixels of each sprite in provided spritesheet */
		frameHeight: number;
		/** Spacing in pixels between individual sprites in provided spritesheet */
		spacing?: number;
		/** Animation data of sprite */
		anims: { [key: string]: ITextureCacheDataAnim };
		/** Scale of sprite in game */
		scale?: number;
	}

	/** Texture Cache Sprite Animation Data */
	interface ITextureCacheDataAnim {
		/** Animation repeats forever */
		auto?: boolean;
		/** Framerate of Animation */
		frameRate?: number;
		/** Frames within this Animation */
		frames: {
			/** Beginning frame of this animation. If only start frame is provided, this is the only frame in this animation. */
			start: number;
			/** Ending frame of this animation. */
			end?: number;
		};
	}

	/** Game Cache Data */
	interface IGameCacheData {
		/** Starting level of the game */
		start: string;
		/** Music data for scenes/levels */
		music:
			| {
					[key: string]: string;
			  }
			| { level: { [key: string]: string } };
		/** Initial Player Data */
		player: {
			/** Texture Key */
			texture: string;
			type: "player";
			/** Scale of sprite in game */
			scale: number;
			/** Initial stats */
			stats: {
				/** Health */
				health: number;
				/** Speed */
				speed: number;
			};
			/** Module data */
			details: {
				/** Healthbar data */
				healthbar: {
					/** Healthbar scale */
					scale: number;
					/** Healthbar width */
					width: number;
				};
			};
			/** Initially Equipped items */
			equipped: {
				/** Initially Equipped Spell */
				spell: string;
			};
			/** Items initially owned */
			inventory: {
				/** Owned Spells */
				spells: string[];
				/** Owned Armor */
				armors: string[];
			};
			/** Sound keys for different events */
			sounds: {
				/** Sound played on damage taken */
				hit: string;
			};
		};
		/** Enemy Data */
		enemies: {
			/** Key of Enemy */
			[key: string]: {
				/** Texture Key */
				texture: string;
				/** Enemy Type */
				type?: "boss" | "splitter" | "spitter";
				/** Scale of sprite in game */
				scale?: number;
				/** Enemy Stats */
				stats: {
					/** Health */
					health: number;
					/** Speed */
					speed: number;
					/** Base Damage dealt */
					strength: number;
				};
				/** Module data */
				details: {
					/** Healthbar data */
					healthbar: {
						/** Healthbar scale */
						scale: number;
						/** Healthbar width */
						width: number;
					};
					/** A property specific to "splitter" type enemies, specifying the key of the enemy it splits to. */
					splitTo?: string;
					/** A property specific to "splitter" type enemies, specifying the amount of enemies it splits to. */
					splitAmount?: number;
					/** A property specific to "spitter" type enemies, specifying the spell/projectile it will attack with. */
					spit?: string;
				};
				/** Sound keys for different events */
				sounds?: {
					/** Sound played on damage taken */
					hit?: string;
				};
			};
		};
		/** Spell Data */
		spells: {
			/** Key of Spell */
			[key: string]: {
				/** Texture Key */
				texture: string;
				/** Sound keys for different events */
				sounds: {
					/** Sound played on spawn */
					start: string;
					/** Sound played on failing to hit*/
					fail: string;
					/** Sound played on successful hit */
					success: string;
				};
				/** Scale of sprite in game */
				scale: number;
				/** Damage dealt on hit */
				damage: number;
				/** Amount of time in milliseconds the projectile will fly until dying */
				lifespan: number;
				/** Amount of time in milliseconds between each fire */
				firerate: number;
				/** Speed */
				speed: number;
				/** Inventory display data */
				inventory: {
					/** Texture key */
					texture: string;
					/** Scale */
					scale: number;
				};
			};
		};
		/** Armor Data */
		armors: {
			/** Key of Armor */
			[key: string]: {
				/** Type of Armor, specifically which part of the body it covers */
				type: "torso";
				/** Texture key */
				texture: string;
				/** Scale */
				scale: number;
				/** Damage protection */
				defense: number;
				/** Inventory display data */
				inventory: {
					/** Texture key */
					texture: string;
					/** Scale */
					scale: number;
				};
			};
		};
		/** Interactables Data */
		interactables: {
			/** Key of Interactable */
			[key: string]: {
				/** Texture key */
				texture: string;
				/** Sound keys for different events */
				sounds?: {
					/** Sound played on damage taken */
					hit?: string;
				};
			};
		};
		/** Teleporter Data */
		teleporters: {
			/** Key of Teleporter */
			[key: string]: {
				/** Texture key */
				type: string;
				/** Destination level when teleporter taken */
				destination: string;
				/** Text displayed when interacting */
				tip: string;
			};
		};
		/** Lootable Data */
		lootable: {
			/** Key of Lootable */
			[key: string]: {
				/** Texture key */
				type: string;
				/** Key of item given when looted */
				loot: string;
			};
		};
	}

	/** Color information extracted from a texture */
	interface IExtractedColors {
		/** Texture key */
		[key: string]: FinalColor[];
	}
}
