// scenes
import { Game } from "../Game";

// components
import { Player } from "../../scripts/Player";

export class Debug extends Phaser.Scene {
	sceneGame!: Game;
	player!: Player;
	camera!: Phaser.Cameras.Scene2D.Camera;
	debugText!: Phaser.GameObjects.Text;

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

	preload() {}

	create() {
		// init debug info text
		this.debugText = this.add.text(0, 0, "").setScrollFactor(0);

		// enable debug lines
		this.sceneGame.matter.world.drawDebug = true;
	}

	update() {
		// get actual mouse position
		let pointer = this.sceneGame.input.activePointer;

		// get relative positions
		let relativePosCamera = this.player.getRelativePosition(this.camera);

		// init pressed keys
		let pressedKeys: Array<string> = [];

		// populate pressed keys
		if (this.sceneGame.sceneHead.playerInput.direction.UP)
			pressedKeys.push("UP");
		if (this.sceneGame.sceneHead.playerInput.direction.DOWN)
			pressedKeys.push("DOWN");
		if (this.sceneGame.sceneHead.playerInput.direction.LEFT)
			pressedKeys.push("LEFT");
		if (this.sceneGame.sceneHead.playerInput.direction.RIGHT)
			pressedKeys.push("RIGHT");
		if (
			this.sceneGame.sceneHead.playerInput.interaction_mapped.pressed.includes(
				"START"
			)
		)
			pressedKeys.push("START");
		if (
			this.sceneGame.sceneHead.playerInput.interaction_mapped.pressed.includes(
				"SELECT"
			)
		)
			pressedKeys.push("SELECT");
		if (
			this.sceneGame.sceneHead.playerInput.interaction_mapped.pressed.includes(
				"RC_E"
			)
		)
			pressedKeys.push("INTERACT");
		if (
			this.sceneGame.sceneHead.playerInput.interaction_mapped.pressed.includes(
				"LB"
			)
		)
			pressedKeys.push("CYCLE LEFT");
		if (
			this.sceneGame.sceneHead.playerInput.interaction_mapped.pressed.includes(
				"RB"
			)
		)
			pressedKeys.push("CYCLE RIGHT");

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
			"Pressed Keys: " + pressedKeys.join(", "),
		]);
	}
}
