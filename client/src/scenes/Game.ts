import { Core } from "./internal/Core";
import store from "storejs";
import { Enemy } from "../scripts/Enemy";
import { Player } from "../scripts/Player";
import { Camera } from "../scripts/Camera";
import { Teleport } from "../scripts/Teleport";
import { HUD } from "./overlay/HUD";
import { GameObjects } from "phaser";
import { Entity } from "../scripts/Entity";
import { Healthbar } from "../scripts/Healthbar";

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

	constructor() {
		super({ key: "Game" });
	}

	init(data: { level: string }) {
		this.level = data.level;
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
		this.bossGroup = this.add.group();

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
		// handle player
		this.player.update();

		// handle bosses
		if (this.bossGroup.getLength() > 0) this.handleBosses();

		// detect low performance
		if (this.game.loop.actualFps < 10) {
			// high performance mode is off
			if (this.core.highPerformanceMode.get() === false) {
				// turn on high performance mode
				this.core.highPerformanceMode.set(true);

				// reload graphics
				this.reloadGraphics();
			}
		}
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

	onStop() {
		// stop HUD
		this.HUD.events.removeListener("postupdate");
		this.HUD.scene.stop();

		// stop Debug info
		this.scene.stop("Debug");
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

		// populate objects in object layer
		map.objects.forEach((objectLayer) => {
			// each object
			objectLayer.objects.forEach((object) => {
				// has x/y
				if (object.x === undefined || object.y === undefined) return;
				// general properties
				type properties = {
					type: string;
				};
				// object properties
				interface gameObjectProperties extends properties {
					id: string;
				}
				// teleport properties
				interface teleportProperties extends gameObjectProperties {
					tip: string;
					teleportTo: string;
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
						(properties as gameObjectProperties)["id"],
						object.x,
						object.y
					);
				}

				// teleport
				if (properties.type === "teleport") {
					this.spawnTeleport(
						(properties as teleportProperties).id,
						(object as any).x,
						(object as any).y,
						(properties as teleportProperties).tip,
						(properties as teleportProperties).teleportTo
					);
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

		// add enemy to boss group
		if (enemy.details && enemy.details.boss) this.bossGroup.add(enemy);
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

	// handle bosses
	handleBosses() {
		// init distance object
		var distance: {
			[key: number]: number;
		} = {};

		// get distance between boss and player
		(this.bossGroup.getChildren() as Array<Enemy>).forEach(
			(boss: Enemy, index: number) => {
				// is ded
				if (boss.isDead) return;

				// doesn't have health bar
				if (
					boss.details === undefined ||
					boss.details.healthbarID == undefined
				)
					return;

				// get distance
				distance[index] = Phaser.Math.Distance.Between(
					boss.x,
					boss.y,
					this.player.x,
					this.player.y
				);
			}
		);

		// bosses found
		if (Object.keys(distance).length > 0) {
			// find shortest distance
			var min: number = Number(
				Object.keys(distance).reduce((key, v) =>
					distance[v as any] < distance[key as any] ? v : key
				)
			);

			// get closest boss
			let closestBoss = (this.bossGroup.getChildren() as Array<Enemy>)[
				min
			];

			// distance is within threshold
			if (distance[min] <= 300) {
				// init health bar if not already initialized
				if (closestBoss.healthbar === undefined) {
					// create healthbar
					closestBoss.healthbar = new Healthbar(
						this.HUD,
						closestBoss,
						0,
						0,
						(closestBoss.details as any).healthbarID as string,
						closestBoss.getHealthPercent()
					);
				}

				// show boss bar
				if (closestBoss.healthbar.bar.visible === false)
					closestBoss.healthbar.show();
			}
			// hide boss bar
			else {
				if (closestBoss.healthbar.bar.visible === true)
					closestBoss.healthbar.hide();
			}

			// hide boss bar of others
			(this.bossGroup.getChildren() as Array<Enemy>).forEach(
				(boss: Enemy, index: number) => {
					// skip closest
					if (index === min) return;

					// is ded
					if (boss.isDead) return;

					// doesn't have health bar
					if (boss.healthbar === undefined) return;

					// hide boss bar
					if (boss.healthbar.bar.visible === true)
						boss.healthbar.hide();
				}
			);
		}
	}
}
