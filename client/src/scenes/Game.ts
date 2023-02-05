import { Core } from "./internal/Core";
import { Enemy } from "../scripts/Enemy";
import { Player } from "../scripts/Player";
import { Camera } from "../scripts/Camera";
import store from "storejs";

//
// This is the actual game. Every level of actual gameplay is handled by this scene. The level and its information is passed to this scene and is then populated.
//

export class Game extends Core {
	// world
	collisionLayers: Array<Phaser.Tilemaps.TilemapLayer> = [];
	spawnpoint: any;

	// player/enemies/objects
	player!: Player;
	enemyList: Array<Enemy> = [];

	// camera
	camera!: Camera;

	constructor() {
		super({ key: "Game" });
	}

	preload() {
		// preload core mechanics
		this.core.preload();
	}

	create() {
		// create core mechanics
		this.core.create();

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
			window.innerHeight,
			8
		);
		this.camera.startFollow(this.player, false, 1, 1, 0, 0);

		// fade in to begin
		// this.camera.fadeIn();

		// execute when game is resumed
		this.events.on("resume", this.resume, this);
	}

	update() {
		// handle player
		this.player.update();

		// handle camera rotation (pass objects to rotate counter to the camera)
		this.camera.handleRotation([this.player, ...this.enemyList]);
	}

	// create tilemap world
	createWorld() {
		// make map
		const map = this.make.tilemap({ key: "riverside" });
		const tileset = map.addTilesetImage("tiles", "world_tiles");

		// init layers
		map.layers.forEach((layer) => {
			// add layer
			map.createLayer(layer.name, tileset, 0, 0);

			// fix culling (fixes pop-in when player rotates camera)
			layer.tilemapLayer.setCullPadding(4, 4)

			// add collisions (if layer has them)
			layer.properties.forEach((property: any) => {
				if (property.name === "wall" && property.value) {
					this.collisionLayers.push(layer.tilemapLayer);
					layer.tilemapLayer.setCollisionByExclusion([-1]);
				}
			});
		});

		// get spawnpoint
		this.spawnpoint = map.findObject(
			"Objects",
			(obj) => obj.name === "Spawn"
		);

		// spawn enemies
		map.filterObjects("Objects", (obj) =>
			obj.name.includes("Enemy")
		).forEach((obj) => {
			this.spawnEnemy(
				obj.name.split(",")[1].replace(" ", ""),
				typeof obj.x === "number" ? obj.x : 0,
				typeof obj.y === "number" ? obj.y : 0
			);
		});
	}

	// add player to world
	addPlayer(x: number, y: number) {
		// create player
		let player = new Player(this, x, y, "pp").setOrigin(0.5, 0.5);

		// add collisions with layers
		this.collisionLayers.forEach((layer) => {
			this.physics.add.collider(player, layer);
		});

		// add collisions with enemies
		this.enemyList.forEach((enemy) => {
			this.physics.add.collider(player, enemy);
		});

		return player;
	}

	// spawn enemy
	spawnEnemy(id: string, x: number, y: number) {
		// create enemy
		let enemy = new Enemy(this, x, y, id);

		// add collisions with layers
		this.collisionLayers.forEach((layer) => {
			this.physics.add.collider(enemy, layer);
		});

		// add collisions with other enemies
		if (this.enemyList.length != 0) {
			this.enemyList.forEach((otherEnemy) => {
				this.physics.add.collider(enemy, otherEnemy);
			});
		}

		// add enemy to enemy list
		this.enemyList.push(enemy);

		return enemy;
	}

	resume() {
		[this.player, ...this.enemyList].forEach((object) => {
			object.applyShaders(
				store.get("settings.options.highPerformanceMode")
			);
		});
	}
}
