// imports
import store from "storejs";

// internal
import { Head } from "./internal/Head";
import { Core } from "./internal/Core";

// scenes
import { HUD } from "./overlay/HUD";

// components
import { Enemy } from "../scripts/Enemy";
import { Player } from "../scripts/Player";
import { Camera } from "../scripts/Camera";
import { Teleporter } from "../scripts/Teleporter";
import { Entity } from "../scripts/Entity";
import { Lootable } from "../scripts/Lootable";

//
// This is the actual game. Every level of actual gameplay is handled by this scene. The level and its information is passed to this scene and is then populated.
//

export class Game extends Core {
	// HUD
	HUD!: HUD;

	// world
	collisionLayers: Array<Phaser.Tilemaps.TilemapLayer> = [];
	spawnpoint!: {
		x: number;
		y: number;
	};
	level!: string;

	// player
	player!: Player;

	// enemy
	enemyGroup!: Phaser.GameObjects.Group;
	bossGroup!: Phaser.GameObjects.Group;

	// camera
	camera!: Camera;
	fixedObjectsGroup!: Phaser.GameObjects.Group;

	// keys
	keySHIFT!: Phaser.Input.Keyboard.Key;

	constructor() {
		super({ key: "Game" });
	}

	init(data: { level: string }) {
		// store current level
		this.level = data.level;
	}

	preload() {
		// preload core mechanics
		super.preload();

		// debug overlay toggle hotkey
		this.keySHIFT = (
			this.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin
		).addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

		// toggle debug overlay
		this.keySHIFT.on(
			"down",
			() => {
				// close debug overlay
				if (
					this.game.scene
						.getScenes(true)
						.some((scene) => scene.scene.key === "Debug")
				) {
					// disable debug value
					store.set("debug.enabled", false);

					// stop debug scene
					this.scene.stop("Debug");

					// turn off and remove debug lines
					this.matter.world.drawDebug = false;
					this.matter.world.debugGraphic.clear();
				}

				// open debug overlay
				else {
					// enable debug value
					store.set("debug.enabled", true);

					// launch debug info overlay
					this.scene.launch("Debug", this);
				}
			},
			this
		);

		// show debug
		if (store.get("debug.enabled")) this.scene.launch("Debug", this);
	}

	create() {
		// disable gravity
		this.matter.world.disableGravity();

		// set hz
		this.matter.set60Hz();

		// set world bounds
		this.matter.world.setBounds(
			0,
			0,
			this.game.canvas.width,
			this.game.canvas.height
		);

		// init fixed objects group (objects that rotate with the camera)
		this.fixedObjectsGroup = this.add.group();

		// init enemy group
		this.enemyGroup = this.add.group({
			classType: Enemy,
		});
		this.bossGroup = this.add.group();

		// create world and add objects/enemies within it
		this.createWorld();

		// add player to world
		this.player = this.addPlayer(this.spawnpoint.x, this.spawnpoint.y);

		// set up camera to follow player
		this.camera = new Camera(this, 0, 0);
		this.camera.startFollow(this.player, false, 1, 1, 0, 0);

		// start HUD
		this.scene.launch("HUD", this);

		// fade in to begin
		// this.camera.fadeIn();

		// execute when game is paused/resumed
		this.events.on("pause", this.onPause, this);
		this.events.on("resume", this.onResume, this);

		// play music
		super.playMusic(this.cache.json.get("game").music.room[this.level]);
	}

	update() {
		// detect low performance
		if (this.game.loop.actualFps < 10) {
			// high performance mode is off
			if (
				(
					this.game.scene.getScene("Head") as Head
				).highPerformanceMode.get() === false
			) {
				// turn on high performance mode
				(
					this.game.scene.getScene("Head") as Head
				).highPerformanceMode.set(true);

				// reload graphics
				this.reloadGraphics();
			}
		}
	}

	shutdown() {
		// remove listeners
		this.events.removeListener("pause", this.onPause, this);
		this.events.removeListener("resume", this.onResume, this);

		// destroy player
		this.player.destroy();

		// stop HUD
		this.HUD.scene.stop();

		// stop Debug info
		this.scene.stop("Debug");

		// base class shutdown
		super.shutdown();
	}

	onPause() {
		// pause HUD
		this.HUD.scene.pause();
	}

	onResume() {
		// resume HUD
		this.HUD.scene.resume();

		// reload graphics
		this.reloadGraphics();
	}

	reloadGraphics() {
		[
			this.player as Entity,
			...(this.enemyGroup.getChildren() as Array<Entity>),
		].forEach((object: Entity) => {
			object.applyShaders(
				store.get("settings.options.highPerformanceMode")
			);
		});
	}

	// create tilemap world
	createWorld() {
		// make map
		let map = this.make.tilemap({ key: this.level });

		// add tileset to map
		let tileset = map.addTilesetImage("tiles", "world_tiles");

		// init layers
		map.layers.forEach((layer) => {
			// add layer
			map.createLayer(
				layer.name,
				tileset as Phaser.Tilemaps.Tileset,
				0,
				0
			);

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
					this.matter.world.convertTilemapLayer(layer.tilemapLayer);
				}
			});
		});

		// populate objects in object layer
		map.objects.forEach((objectLayer) => {
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
				// teleporter properties
				interface teleporterProperties extends gameObjectProperties {
					tip: string;
					teleportTo: string;
				}
				// lootable properties
				interface lootableProperties extends gameObjectProperties {
					lootableType: string;
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
						(properties as teleporterProperties).id,
						(object as any).x,
						(object as any).y,
						(properties as teleporterProperties).tip,
						(properties as teleporterProperties).teleportTo
					);
				}

				// lootable
				if (properties.type === "lootable") {
					this.spawnLootable(
						(properties as lootableProperties).id,
						(object as any).x,
						(object as any).y,
						(properties as lootableProperties).lootableType
					);
				}
			}, this);
		}, this);
	}

	// add player to world
	addPlayer(x: number, y: number) {
		// create player
		let player = new Player(this, x, y).setOrigin(0.5, 0.5);

		// rotate with camera rotation
		this.fixedObjectsGroup.add(player);

		return player;
	}

	// spawn enemy
	spawnEnemy(id: string, x: number, y: number) {
		// create enemy
		let enemy = new Enemy(this, x, y, id);

		// rotate with camera rotation
		this.fixedObjectsGroup.add(enemy);

		// add enemy to enemy group
		this.enemyGroup.add(enemy);

		// add enemy to boss group
		if (enemy.entityType === "boss") this.bossGroup.add(enemy);
	}

	// spawn teleport
	spawnTeleporter(
		id: string,
		x: number,
		y: number,
		tip: string,
		teleportTo: string
	) {
		// create teleport
		let teleporter = new Teleporter(this, x, y, id, tip, teleportTo);

		// rotate with camera rotation
		this.fixedObjectsGroup.add(teleporter);
	}

	// spawn lootable
	spawnLootable(id: string, x: number, y: number, type: string) {
		// create lootable
		let lootable = new Lootable(this, x, y, id, type);

		// rotate with camera rotation
		this.fixedObjectsGroup.add(lootable);
	}
}
