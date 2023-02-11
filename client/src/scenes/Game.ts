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

	// collisions
	CollisionGroup = {
		Enemy: 0b0010,
	};
	CollisionCategory = {
		Player: 0b0001,
		Enemy: 0b0010,
		Projectile: 0b0100,
	};

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
			layer.tilemapLayer.setCullPadding(4, 4);

			// add collisions (if layer has them)
			layer.properties.forEach((property: any) => {
				if (property.name === "wall" && property.value) {
					this.collisionLayers.push(layer.tilemapLayer);
					layer.tilemapLayer.setCollisionByExclusion([-1, 0]);
					this.matter.world.convertTilemapLayer(layer.tilemapLayer);
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
			// this.physics.add.collider(player, layer);
		});

		// add collisions with enemies
		// this.physics.add.collider(player, this.enemyGroup);

		// rotate with camera rotation
		this.fixedObjectsGroup.add(player);

		return player;
	}

	// spawn enemy
	spawnEnemy(id: string, x: number, y: number) {
		// create enemy
		let enemy = new Enemy(this, x, y, id);

		// add collisions with layers
		this.collisionLayers.forEach((layer) => {
			// this.physics.add.collider(enemy, layer);
		});

		// add collisions with other enemies
		if (this.enemyGroup.getChildren().length != 0) {
			this.enemyGroup.getChildren().forEach((otherEnemy) => {
				if (enemy != otherEnemy) {
					// this.physics.add.collider(enemy, otherEnemy);
				}
			});
		}

		// rotate with camera rotation
		this.fixedObjectsGroup.add(enemy);

		// add enemy to enemy group
		this.enemyGroup.add(enemy);

		return enemy;
	}

	resume() {
		[this.player, ...this.enemyGroup.getChildren()].forEach(
			(object: Player | Enemy) => {
				object.applyShaders(
					store.get("settings.options.highPerformanceMode")
				);
			}
		);
	}
}
