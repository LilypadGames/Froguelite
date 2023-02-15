import { Core } from "./internal/Core";
import store from "storejs";
import { Enemy } from "../scripts/Enemy";
import { Player } from "../scripts/Player";
import { Camera } from "../scripts/Camera";
import { Teleport } from "../scripts/Teleport";
import { HUD } from "./overlay/HUD";

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

	// camera
	camera!: Camera;
	fixedObjectsGroup!: Phaser.GameObjects.Group;

	constructor() {
		super({ key: "Game" });
	}

	init(level: string) {
		this.level = level;
	}

	preload() {
		// preload core mechanics
		this.core.preload();
	}

	create() {
		// create core mechanics
		this.core.create();

		// disable gravity
		this.matter.world.disableGravity();

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

		// create world and add objects/enemies within it
		this.createWorld();

		// add player to world
		this.player = this.addPlayer(this.spawnpoint.x, this.spawnpoint.y);

		// set up camera to follow player
		this.camera = new Camera(
			this,
			0,
			0,
			window.innerWidth,
			window.innerHeight
		);
		this.camera.startFollow(this.player, false, 1, 1, 0, 0);

		// start HUD
		this.scene.launch("HUD", this);

		// fade in to begin
		// this.camera.fadeIn();

		// execute when game is paused/resumed
		this.events.on("pause", this.onPause, this);
		this.events.on("resume", this.onResume, this);
		this.events.on("shutdown", this.onStop, this);
	}

	update() {
		this.player.setHealth(10);

		// handle player
		this.player.update();
	}

	// create tilemap world
	createWorld() {
		// make map
		const map = this.make.tilemap({ key: this.level });
		const tileset = map.addTilesetImage("tiles", "world_tiles");

		// init layers
		map.layers.forEach((layer) => {
			// add layer
			map.createLayer(layer.name, tileset, 0, 0);

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

		// populate objects
		map.objects.forEach((objects) => {
			objects.objects.forEach((object) => {
				// get properties
				let properties = {};
				object.properties.forEach(
					(property: {
						name: string;
						type: string;
						value: string;
					}) => {
						properties[property.name] = property.value;
					},
					this
				);

				// spawn
				if (properties["type"] === "spawn") {
					this.spawnpoint = {
						x: object.x as number,
						y: object.y as number,
					};
				}

				// teleport
				if (properties["type"] === "teleport") {
					this.spawnTeleport(
						properties["id"],
						object.x,
						object.y,
						properties["tip"],
						properties["teleportTo"]
					);
				}

				// enemy
				if (properties["type"] === "enemy") {
					this.spawnEnemy(properties["id"], object.x, object.y);
				}
			}, this);
		}, this);
	}

	// add player to world
	addPlayer(x: number, y: number) {
		// create player
		let player = new Player(this, x, y, "pp").setOrigin(0.5, 0.5);

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
	}

	// spawn teleport
	spawnTeleport(
		id: string,
		x: number,
		y: number,
		tip: string,
		teleportTo: string
	) {
		// create teleport
		let teleport = new Teleport(this, x, y, id, tip, teleportTo);

		// rotate with camera rotation
		this.fixedObjectsGroup.add(teleport);
	}

	onPause() {
		// pause HUD
		this.HUD.scene.pause();
	}

	onResume() {
		// resume HUD
		this.HUD.scene.resume();

		// reload shaders
		[this.player, ...this.enemyGroup.getChildren()].forEach(
			(object: Player | Enemy) => {
				object.applyShaders(
					store.get("settings.options.highPerformanceMode")
				);
			}
		);
	}

	onStop() {
		// stop HUD
		this.HUD.events.removeListener("update");
		this.HUD.scene.stop();

		// stop Debug info
		this.scene.stop("Debug");
	}
}
