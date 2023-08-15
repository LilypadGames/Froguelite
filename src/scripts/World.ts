// imports
import { Game } from "../scenes/Game";

// components
import { Enemy } from "../scripts/Enemy";
import { Teleporter } from "../scripts/interactable/Teleporter";
import { Lootable } from "../scripts/interactable/Lootable";

// config
import config from "../config";

// general level setup
class Level {
	// info
	scene: Game;
	levelID: string;

	// spawn point of level
	spawnpoint!: {
		x: number;
		y: number;
	};

	constructor(scene: Game, levelID: string) {
		// save values
		this.scene = scene;
		this.levelID = levelID;

		// TODO: move console commands to head scene so they only get created once, with reference to currently active level
		// // create console commands
		// this.createCommands();
	}

	// spawn enemy
	spawnEnemy(id: string, x: number, y: number) {
		// create enemy
		new Enemy(this.scene, x, y, id);

		// TODO: add new way to distinguish normal enemies from boss enemies
	}

	// spawn teleport
	spawnTeleporter(id: string, x: number, y: number) {
		// create teleport
		new Teleporter(this.scene, x, y, id);
	}

	// spawn lootable
	spawnLootable(id: string, x: number, y: number) {
		// create lootable
		new Lootable(this.scene, x, y, id);
	}

	// // create custom console commands for debugging
	// createCommands() {
	// 	// spawn enemy command
	// 	const spawnEnemyAtCursor = (enemyType: string) => {
	// 		try {
	// 			// get world point of cursor
	// 			this.input.activePointer.updateWorldPoint(this.camera);

	// 			// spawn enemy
	// 			new Enemy(
	// 				this,
	// 				this.input.activePointer.worldX,
	// 				this.input.activePointer.worldY,
	// 				enemyType
	// 			);

	// 			// success
	// 			return (
	// 				"Successfully Spawned Enemy at " +
	// 				this.input.activePointer.x +
	// 				" " +
	// 				this.input.activePointer.y
	// 			);
	// 		} catch (error: any) {
	// 			// fail
	// 			return error;
	// 		}
	// 	};

	// 	// apply command to window (browser) and global (node or other server) console
	// 	[
	// 		(window as any).spawnEnemyAtCursor,
	// 		(globalThis as any).spawnEnemyAtCursor,
	// 	] = [spawnEnemyAtCursor, spawnEnemyAtCursor];
	// }
}

// handles each tiled level
export class TilemapLevel extends Level {
	// tilemap
	tilemap: Phaser.Tilemaps.Tilemap;

	// collision layers
	collisionLayers: Array<Phaser.Tilemaps.TilemapLayer> = [];

	constructor(scene: Game, levelID: string) {
		// pass values
		super(scene, levelID);

		// create tile map
		this.tilemap = this.scene.make.tilemap({ key: levelID });

		// add tileset to map
		const tileset = this.tilemap.addTilesetImage("tiles", "world_tiles");

		// init layers
		this.tilemap.layers.forEach(
			(layer: Phaser.Tilemaps.LayerData): void => {
				// add layer
				this.tilemap.createLayer(
					layer.name,
					tileset as Phaser.Tilemaps.Tileset,
					0,
					0
				);

				// set depth
				layer.tilemapLayer.setDepth(config.depth.world);

				// fix culling (fixes pop-in when player rotates camera)
				layer.tilemapLayer.setCullPadding(4, 4);

				// add collisions (if layer has them)
				layer.properties.forEach((property: any) => {
					// this layer is a wall
					if (property.name === "wall" && property.value) {
						// add layer to list of collide=able layers
						this.collisionLayers.push(layer.tilemapLayer);

						// add collision
						layer.tilemapLayer.setCollisionByExclusion([-1, 0]);
						this.scene.matter.world.convertTilemapLayer(
							layer.tilemapLayer
						);
						layer.tilemapLayer.forEachTile(
							(tile: Phaser.Tilemaps.Tile) => {
								if (
									tile.physics &&
									(tile.physics as any).matterBody &&
									(tile.physics as any).matterBody.body
								) {
									// get tile body
									const tileBody = (tile.physics as any)
										.matterBody.body;

									// set collision filter
									tileBody.collisionFilter.category =
										config.collisionGroup.world;
									tileBody.collisionFilter.mask =
										config.collisionGroup.player |
										config.collisionGroup.enemy |
										config.collisionGroup.spell |
										config.collisionGroup.traversable;
								}
							}
						);
					}
				});
			}
		);

		// animate tiles
		this.scene.animatedTiles.init(this.tilemap);

		// populate objects in object layer
		this.tilemap.objects.forEach((objectLayer) => {
			// each object
			objectLayer.objects.forEach((object) => {
				// cancel if no position provided
				if (object.x === undefined || object.y === undefined) return;

				// general properties
				type properties = {
					type: string;
				};

				// object properties
				interface gameObjectProperties extends properties {
					id: string;
				}

				// init properties
				let properties: properties = {
					type: "",
				};

				// format properties
				object.properties.forEach(
					(property: {
						name: string;
						type: string;
						value: string;
					}) => {
						(properties as any)[property.name] = property.value;
					},
					this
				);

				// spawn
				if (properties.type === "spawn") {
					this.spawnpoint = {
						x: object.x,
						y: object.y,
					};
				}

				// enemy
				if (properties.type === "enemy") {
					this.spawnEnemy(
						(properties as gameObjectProperties).id,
						object.x,
						object.y
					);
				}

				// teleporter
				if (properties.type === "teleporter") {
					this.spawnTeleporter(
						(properties as gameObjectProperties).id,
						(object as any).x,
						(object as any).y
					);
				}

				// lootable
				if (properties.type === "lootable") {
					this.spawnLootable(
						(properties as gameObjectProperties).id,
						(object as any).x,
						(object as any).y
					);
				}
			}, this);
		}, this);
	}
}

// handles each infinite level
export class InfiniteLevel extends Level {
	// chunk map
	chunks: {
		all: {
			top_left: Chunk[][];
			top_right: Chunk[][];
			bottom_left: Chunk[][];
			bottom_right: Chunk[][];
		};
		active: { x: number; y: number }[];
	};

	constructor(scene: Game, levelID: string) {
		// pass values
		super(scene, levelID);

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

		// generate chunk at 0, 0
		this.generateChunk(0, 0);

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
	level: InfiniteLevel;
	x: number;
	y: number;
	worldX: number;
	worldY: number;
	tiles: Phaser.GameObjects.Group;
	isLoaded: boolean = false;

	constructor(scene: Game, level: InfiniteLevel, x: number, y: number) {
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

		// place structures
		if (this.x == 0 && this.y == 0) {
			// create spawnpoint tilemap (grass patch)
			let map = this.scene.make.tilemap({ key: "grass_patch" });

			// add tileset to tilemap
			let tileset = map.addTilesetImage("tiles", "world_tiles");

			// init layers
			map.layers.forEach((layer: Phaser.Tilemaps.LayerData): void => {
				// add layer
				map.createLayer(
					layer.name,
					tileset as Phaser.Tilemaps.Tileset,
					0,
					0
				);

				// set depth
				layer.tilemapLayer.setDepth(config.depth.world);

				// fix culling (fixes pop-in when player rotates camera)
				layer.tilemapLayer.setCullPadding(4, 4);
			});

			// populate objects in object layer
			map.objects.forEach((objectLayer) => {
				// each object
				objectLayer.objects.forEach((object) => {
					// cancel if no position provided
					if (object.x === undefined || object.y === undefined)
						return;

					// general properties
					type properties = {
						type: string;
					};

					// object properties
					interface gameObjectProperties extends properties {
						id: string;
					}

					// init properties
					let properties: properties = {
						type: "",
					};

					// format properties
					object.properties.forEach(
						(property: {
							name: string;
							type: string;
							value: string;
						}) => {
							(properties as any)[property.name] = property.value;
						},
						this
					);

					// spawn
					if (properties.type === "spawn") {
						this.level.spawnpoint = {
							x: object.x,
							y: object.y,
						};
					}

					// enemy
					if (properties.type === "enemy") {
						this.level.spawnEnemy(
							(properties as gameObjectProperties).id,
							object.x,
							object.y
						);
					}

					// teleporter
					if (properties.type === "teleporter") {
						this.level.spawnTeleporter(
							(properties as gameObjectProperties).id,
							(object as any).x,
							(object as any).y
						);
					}

					// lootable
					if (properties.type === "lootable") {
						this.level.spawnLootable(
							(properties as gameObjectProperties).id,
							(object as any).x,
							(object as any).y
						);
					}
				}, this);
			}, this);
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
