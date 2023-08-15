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

		// execute when game is paused/resumed
		this.events.on("pause", this.onPause, this);
		this.events.on("resume", this.onResume, this);

		// play music
		if (this.cache.json.get("game").music.room[this.levelID])
			super.playMusic(
				this.cache.json.get("game").music.room[this.levelID]
			);
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

	shutdown() {
		// remove listeners
		this.events.removeListener("pause", this.onPause, this);
		this.events.removeListener("resume", this.onResume, this);

		// destroy player
		this.player.destroy();

		// stop HUD
		if (this.HUD) this.HUD.scene.stop();

		// stop Debug info
		this.scene.stop("Debug");

		// base class shutdown
		super.shutdown();
	}

	onPause(data: { pauseHUD: boolean } = { pauseHUD: true }) {
		// pause HUD
		if (data.pauseHUD) this.HUD.scene.pause();
	}

	onResume() {
		// resume HUD
		this.HUD.scene.resume();

		// reload graphics
		this.reloadGraphics();
	}

	reloadGraphics() {
		this.children.list.forEach((object: any) => {
			if (object instanceof Entity)
				object.applyShaders(this.sceneHead.highPerformanceMode.get());
		});
	}
}
