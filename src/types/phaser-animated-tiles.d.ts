declare module "phaser-animated-tiles/dist/AnimatedTiles.js" {
	import * as Phaser from "phaser";

	interface AnimatedTileFrame {
		// duration of frame
		duration: number;
		// id of the tile in tileset
		tileid: number;
	}

	interface AnimatedTile {
		// id of tile
		index: number;
		// frames of tile animation
		frames: AnimatedTileFrame[];
		// current frame of animation
		currentFrame: number;
		// list of tiles that are animated
		tiles: Phaser.Tilemaps.Tile[][];
		// duration of current frame
		next: number;
		// rate of tile animation
		rate: number;
	}

	export default class AnimatedTiles extends Phaser.Plugins.ScenePlugin {
		map: Phaser.Tilemaps.Tilemap | null;
		animatedTiles: [];
		rate: number;
		active: boolean;
		activeLayer: [];
		followTimeScale: boolean;

		constructor(
			scene: Phaser.Scene,
			pluginManager: Phaser.Plugins.PluginManager
		);

		/**
		 * Initialize support for animated tiles on given map
		 */
		init(map: Phaser.Tilemaps.Tilemap): void;

		/**
		 * Sets playback multiplier to 'rate'.
		 *
		 * A rate of 2 will play the animation twice as fast as configured in Tiled, and 0.5 half as fast.
		 *
		 * If a gid is specified the rate is exclusively set for that tile. If the global rate is set to 0.5 and the rate of a tile is set to 2 it will play as configured in Tiled (0.5*2 = 1).
		 *
		 * Pass tilemap to limit the method to that map.
		 */
		setRate(
			rate: number,
			gid?: number,
			map?: Phaser.Tilemaps.Tilemap | null
		): void;

		/**
		 * Sets playback rate to 1 globally and for each individual tile, pass mapIndex to limit the method to that map
		 */
		resetRates(mapIndex?: number): void;

		/**
		 * Resume tile animations globally if no layerIndex is set (may be overridden by layers), otherwise for that layer only.
		 *
		 * Pass mapIndex to limit the method to that map.
		 */
		resume(layerIndex?: number, mapIndex?: number): void;

		/**
		 * Pause tile animations globally if no layerIndex is set and overrides layer settings, otherwise for that layer only.
		 *
		 * Pass mapIndex to limit the method to that map.
		 */
		pause(layerIndex?: number, mapIndex?: number): void;

		/**
		 * Returns list of animated tiles in the provided Tilemap.
		 */
		getAnimatedTiles(map: Phaser.Tilemaps.Tilemap): AnimatedTile[];

		/**
		 * Tell the plugin when you have added new animated tiles to layers after initialization.
		 *
		 * Needed to detect new animations.
		 */
		updateAnimatedTiles(): void;
	}
}
