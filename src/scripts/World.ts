// imports
import { Game } from "../scenes/Game";

// config
import config from "../config";

// generates and handles individual chunks
class Chunk {
	scene: Game;
	x: number;
	y: number;
	tiles: Phaser.GameObjects.Group;
	isLoaded: boolean;

	constructor(scene: Game, x: number, y: number) {
		// save values
		this.scene = scene;
		this.x = x;
		this.y = y;

		// create tile group
		this.tiles = this.scene.add.group();

		// loaded state
		this.isLoaded = false;
	}

	// unload chunk
	unload() {
		if (this.isLoaded) {
			// remove tiles
			this.tiles.clear(true, true);

			// set as unloaded
			this.isLoaded = false;
		}
	}

	// load chunk
	load() {
		if (!this.isLoaded) {
			// iterate through cells of chunk
			for (var x = 0; x < config.world.chunkSize; x++) {
				for (var y = 0; y < config.world.chunkSize; y++) {
					// get tile position
					let tilePos = {
						x:
							this.x *
								(config.world.chunkSize *
									config.world.tileSize) +
							x * config.world.tileSize,
						y:
							this.y *
								(config.world.chunkSize *
									config.world.tileSize) +
							y * config.world.tileSize,
					};

					// get tiles texture key
					let tileTextureKey: string = this.getTileTexture(tilePos);

					// create tile
					let tile = new Tile(
						this.scene,
						tilePos.x,
						tilePos.y,
						tileTextureKey
					);

					this.tiles.add(tile);
				}
			}

			// set as loaded
			this.isLoaded = true;
		}
	}

	// get tile texture based on position
	getTileTexture(_tilePos: { x: number; y: number }): string {
		// // get perlin noise map value at position
		// let perlinValue = noise.perlin2(tilePos.x / 100, tilePos.y / 100);

		// // determine tile texture using perlin noise map
		// if (perlinValue < 0.2) return "sprWater";
		// else if (perlinValue >= 0.2 && perlinValue < 0.3) return "sprSand";
		// else return "sprGrass";
		return "sprGrass";
	}
}

// tiles
class Tile extends Phaser.GameObjects.Sprite {
	constructor(scene: Game, x: number, y: number, key: string) {
		// pass values
		super(scene, x, y, key);

		// save values
		this.scene = scene;

		// add to scene
		this.scene.add.existing(this);

		// set origin of sprite to 0
		this.setOrigin(0);
	}
}
