// imports
import { Game } from "../scenes/Game";

// config
import config from "../config";
import ColorScheme from "./utility/ColorScheme";
import Utility from "./utility/Utility";

// handles each level
export class Level {
	scene: Game;
	level: string;
	chunks: {
		all: {
			top_left: Chunk[][];
			top_right: Chunk[][];
			bottom_left: Chunk[][];
			bottom_right: Chunk[][];
		};
		active: { x: number; y: number }[];
	};

	constructor(scene: Game, level: string) {
		// save values
		this.scene = scene;
		this.level = level;

		// init chunk map
		this.chunks = {
			all: {
				top_right: [[]],
				top_left: [[]],
				bottom_right: [[]],
				bottom_left: [[]],
			},
			active: [],
		};

		// update event
		this.scene.events.on("update", this.update, this);

		// shutdown event
		this.scene.events.once("shutdown", this.shutdown, this);
	}

	// get the chunk at a given chunk position (ranging from negative to positive values)
	getChunk(x: number, y: number): Chunk | null {
		// right side
		if (x >= 0) {
			// bottom right (in phaser, y is positive the more you go down, and x is positive the more you go right)
			if (y >= 0) {
				if (
					this.chunks.all.bottom_right &&
					this.chunks.all.bottom_right[x] &&
					this.chunks.all.bottom_right[x][y]
				)
					return this.chunks.all.bottom_right[x][y];
				else return null;
			}
			// top right
			else if (
				this.chunks.all.top_right &&
				this.chunks.all.top_right[x] &&
				this.chunks.all.top_right[x][-y]
			)
				return this.chunks.all.top_right[x][-y];
			else return null;
		}
		// left side
		else {
			// bottom left
			if (y >= 0) {
				if (
					this.chunks.all.bottom_left &&
					this.chunks.all.bottom_left[-x] &&
					this.chunks.all.bottom_left[-x][y]
				)
					return this.chunks.all.bottom_left[-x][y];
				else return null;
			}
			// top left
			else if (
				this.chunks.all.top_left &&
				this.chunks.all.top_left[-x] &&
				this.chunks.all.top_left[-x][-y]
			)
				return this.chunks.all.top_left[-x][-y];
			else return null;
		}
	}

	// set chunk at given world position
	generateChunk(x: number, y: number): void {
		// generate chunk
		const chunk = new Chunk(this.scene, this, x, y);

		// right side
		if (x >= 0) {
			// bottom right (in phaser, y is positive the more you go down, and x is positive the more you go right)
			if (y >= 0) {
				// init row
				if (!this.chunks.all.bottom_right[x])
					this.chunks.all.bottom_right[x] = [];

				// save chunk
				this.chunks.all.bottom_right[x][y] = chunk;
			}
			// top right
			else {
				// init row
				if (!this.chunks.all.top_right[x])
					this.chunks.all.top_right[x] = [];

				// save chunk
				this.chunks.all.top_right[x][-y] = chunk;
			}
		}
		// left side
		else {
			// bottom left
			if (y >= 0) {
				// init row
				if (!this.chunks.all.bottom_left[-x])
					this.chunks.all.bottom_left[-x] = [];

				// save chunk
				this.chunks.all.bottom_left[-x][y] = chunk;
			}
			// top left
			else {
				// init row
				if (!this.chunks.all.top_left[-x])
					this.chunks.all.top_left[-x] = [];

				// save chunk
				this.chunks.all.top_left[-x][-y] = chunk;
			}
		}
	}

	update() {
		// get world chunk position using player position
		let currentChunk = {
			x:
				(config.world.chunkSize *
					config.world.tileSize *
					Math.round(
						this.scene.player.x /
							(config.world.chunkSize * config.world.tileSize)
					)) /
				config.world.chunkSize /
				config.world.tileSize,
			y:
				(config.world.chunkSize *
					config.world.tileSize *
					Math.round(
						this.scene.player.y /
							(config.world.chunkSize * config.world.tileSize)
					)) /
				config.world.chunkSize /
				config.world.tileSize,
		};

		// load or generate new chunks within one space of current chunk
		let currentChunks: { x: number; y: number }[] = [];
		for (let x = currentChunk.x - 1; x < currentChunk.x + 1; x++) {
			for (let y = currentChunk.y - 1; y < currentChunk.y + 1; y++) {
				// save as a current chunk that should be loaded
				currentChunks.push({ x, y });

				// chunk not found at position
				if (this.getChunk(x, y) == null) {
					this.generateChunk(x, y);
				}

				// load unloaded chunks at position
				else if (!(this.getChunk(x, y) as Chunk).isLoaded) {
					(this.getChunk(x, y) as Chunk).load();
				}
			}
		}

		// unload chunks
		for (const activeChunk of this.chunks.active) {
			// chunk should remain loaded
			if (
				currentChunks.some(
					(chunk) =>
						chunk.x == activeChunk.x && chunk.y == activeChunk.y
				)
			)
				continue;

			// chunk should not be loaded
			(this.getChunk(activeChunk.x, activeChunk.y) as Chunk).unload();
		}
	}

	shutdown() {
		// remove listeners
		this.scene.events.removeListener("update", this.update, this);
	}
}

// generates and handles individual chunks within a level
class Chunk {
	scene: Game;
	level: Level;
	x: number;
	y: number;
	worldX: number;
	worldY: number;
	tiles: Phaser.GameObjects.Group;
	isLoaded: boolean = false;

	constructor(scene: Game, level: Level, x: number, y: number) {
		// save values
		this.scene = scene;
		this.level = level;
		this.x = x;
		this.y = y;
		this.worldX = x * config.world.chunkSize * config.world.tileSize;
		this.worldY = y * config.world.chunkSize * config.world.tileSize;

		// create tile group
		this.tiles = this.scene.add.group();

		// load newly generated chunks
		this.load();
	}

	// load chunk
	load() {
		// attempted to load an already loaded chunk
		if (this.isLoaded) return;

		// iterate through tile positions of chunk
		for (let x = 0; x < config.world.chunkSize; x++) {
			for (let y = 0; y < config.world.chunkSize; y++) {
				// get tile position
				let tilePos = {
					x:
						this.x *
							(config.world.chunkSize * config.world.tileSize) +
						x * config.world.tileSize,
					y:
						this.y *
							(config.world.chunkSize * config.world.tileSize) +
						y * config.world.tileSize,
				};

				// get tile texture key at position
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
		this.level.chunks.active.push({ x: this.x, y: this.y });
	}

	// unload chunk
	unload() {
		// attempted to unload an already unloaded chunk
		if (!this.isLoaded) return;

		// remove tiles
		this.tiles.clear(true, true);

		// set as unloaded
		this.isLoaded = false;
		const thisChunk = { x: this.x, y: this.y };
		this.level.chunks.active.splice(
			this.level.chunks.active.findIndex(
				(chunk) => chunk.x === thisChunk.x && chunk.y === thisChunk.y
			),
			1
		);
	}

	// get tile texture based on position
	getTileTexture(_tilePos: { x: number; y: number }): string {
		// // get perlin noise map value at position
		// let perlinValue = noise.perlin2(tilePos.x / 100, tilePos.y / 100);

		// // determine tile texture using perlin noise map
		// if (perlinValue < 0.2) return "sprWater";
		// else if (perlinValue >= 0.2 && perlinValue < 0.3) return "sprSand";
		// else return "sprGrass";
		const random = Math.random();
		if (random <= 0.2) return "dirt_noisy";
		else return "dirt";
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
