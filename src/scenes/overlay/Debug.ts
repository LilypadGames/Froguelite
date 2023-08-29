// scenes
import { Game } from "../Game";

// components
import { Player } from "../../scripts/Player";

export class Debug extends Phaser.Scene {
	sceneGame!: Game;
	player!: Player;
	camera!: Phaser.Cameras.Scene2D.Camera;
	debugText!: Phaser.GameObjects.Text;
	activeInputs: Array<string> = [];

	constructor() {
		super({ key: "Debug" });
	}

	init(sceneGame: Game) {
		// save values
		this.sceneGame = sceneGame;

		// get player
		this.player = sceneGame.player;

		// get camera
		this.camera = sceneGame.cameras.main;
	}

	create() {
		// init debug info text
		this.debugText = this.add
			.text(0, 0, "", {
				fontSize: "32px",
			})
			.setScrollFactor(0);

		// enable debug lines
		this.sceneGame.matter.world.drawDebug = true;

		// detect inputs
		this.sceneGame.sceneHead.events.on(
			"onInput",
			this.updateActiveInputs,
			this
		);

		// events
		this.events.once("shutdown", this.shutdown, this);
	}

	update() {
		// get actual mouse position
		let pointer = this.sceneGame.input.activePointer;

		// update pointer world position
		pointer.updateWorldPoint(this.camera);

		// get relative positions
		let relativePosCamera = this.player.getRelativePosition(this.camera);

		// update debug
		this.debugText.setText([
			"FPS: " + this.game.loop.actualFps,
			"Camera World View: (" +
				this.camera.worldView.x +
				", " +
				this.camera.worldView.y +
				")",
			"Camera Scroll: (" +
				this.camera.scrollX +
				", " +
				this.camera.scrollY +
				")",
			"Camera Zoom: " + this.camera.zoom,
			"Camera Rotation: " + (this.camera as any).rotation,
			"",
			"World Mouse Pos: (" + pointer.worldX + ", " + pointer.worldY + ")",
			"World Player Pos: (" + this.player.x + ", " + this.player.y + ")",
			"",
			"Canvas-Relative Player Pos: (" +
				relativePosCamera.x +
				", " +
				relativePosCamera.y +
				")",
			"Canvas-Relative Mouse Pos: (" + pointer.x + ", " + pointer.y + ")",
			"",
			"Player Rotation: " + this.player.rotation,
			"Player Velocity: (" +
				(this.player.body as MatterJS.BodyType).velocity.x +
				", " +
				(this.player.body as MatterJS.BodyType).velocity.y +
				")",
			"Active Inputs: " + this.activeInputs.join(", "),
		]);

		// refresh pressed keys
		this.activeInputs = [];
	}

	// update the list of currently pressed inputs
	updateActiveInputs(input: string) {
		this.activeInputs.push(input);
	}

	shutdown() {
		// remove listeners
		this.sceneGame.sceneHead.events.off(
			"onInput",
			this.updateActiveInputs,
			this
		);
	}
}
