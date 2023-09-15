import { Head } from "../scenes/internal/Head";

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
}
