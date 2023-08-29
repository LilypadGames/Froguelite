// imports
import store from "storejs";

// plugins
import AnimatedTiles from "phaser-animated-tiles/dist/AnimatedTiles.js";

// internal
import { Core } from "./internal/Core";

// scenes
import { HUD } from "./overlay/HUD";

// components
import { TilemapLevel, InfiniteLevel } from "../scripts/World";
import { Player } from "../scripts/Player";
import { Camera } from "../scripts/Camera";
import { Entity } from "../scripts/Entity";

/**
 * Handles meta mechanics of the game such as the camera and connections between the level, player, and HUD. It is provided level data and creates a new Level instance.
 */
export class Game extends Core {
	// TODO: create my own animated tile handling system, so that an individual tile's animations can be controlled and changed.
	// plugins
	animatedTiles!: AnimatedTiles;

	// HUD
	HUD!: HUD;

	// world
	level!: TilemapLevel | InfiniteLevel;
	levelID!: string;

	// player
	player!: Player;

	// enemy
	bossGroup!: Phaser.GameObjects.Group;

	// camera
	camera!: Camera;

	// keys
	keySHIFT!: Phaser.Input.Keyboard.Key;

	constructor() {
		super({ key: "Game" });
	}

	init(data: gameSceneData) {
		// save scene references
		super.init(data);

		// store current level
		this.levelID = data.level;
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

		// init groups
		this.bossGroup = this.add.group();

		// get level data
		const levelData = this.cache.json.get("world").level;

		// create world and add objects/enemies within it
		if (levelData[this.levelID].type == "tilemap") {
			this.level = new TilemapLevel(this, this.levelID);
		} else if (levelData[this.levelID].type == "infinite") {
			this.level = new InfiniteLevel(this, this.levelID);
		}

		// add player to world
		this.player = new Player(
			this,
			this.level.spawnpoint.x,
			this.level.spawnpoint.y
		);

		// set up camera to follow player
		this.camera = new Camera(this, 0, 0);
		this.camera.startFollow(this.player, false, 1, 1, 0, 0);

		// start HUD
		this.scene.launch("HUD", this);

		// play music
		if (this.cache.json.get("game").music.level[this.levelID])
			super.playMusic(
				this.cache.json.get("game").music.level[this.levelID]
			);

		// interact button
		this.sceneHead.events.on(
			"input_interact",
			this.player.checkInteract,
			this.player
		);
	}

	registerInputs() {
		// open inventory menu
		this.sceneHead.events.once(
			"input_inventory",
			this.toggleInventory,
			this
		);

		// core inputs
		super.registerInputs();
	}

	update() {
		// detect low performance
		if (this.game.loop.actualFps < 10) {
			// high performance mode is off
			if (this.sceneHead.highPerformanceMode.get() === false) {
				// turn on high performance mode
				this.sceneHead.highPerformanceMode.set(true);
			}
		}
	}

	pause(data: { pauseHUD: boolean } = { pauseHUD: true }) {
		// remove event listeners
		this.sceneHead.events.off(
			"input_inventory",
			this.toggleInventory,
			this
		);

		// pause HUD
		if (data.pauseHUD) this.HUD.scene.pause();

		// core pause
		super.pause();
	}

	resume() {
		// resume HUD
		this.HUD.scene.resume();

		// reload graphics
		this.reloadGraphics();

		// core resume
		super.resume();
	}

	shutdown() {
		// remove listeners
		this.sceneHead.events.off(
			"input_inventory",
			this.toggleInventory,
			this
		);
		this.sceneHead.events.off(
			"input_interact",
			this.player.checkInteract,
			this.player
		);

		// destroy player
		this.player.destroy();

		// stop HUD
		if (this.HUD) this.HUD.scene.stop();

		// stop Debug info
		this.scene.stop("Debug");

		// base class shutdown
		super.shutdown();
	}

	reloadGraphics() {
		this.children.list.forEach((object: any) => {
			if (object instanceof Entity)
				object.applyShaders(this.sceneHead.highPerformanceMode.get());
		});
	}

	toggleInventory() {
		// pause current scene
		this.scene.pause();

		// sfx
		this.sceneHead.play.sound("ui_open");

		// launch inventory menu
		this.scene.launch("Inventory", {
			sceneHead: this.sceneHead,
			scenePaused: this,
		});
	}
}
