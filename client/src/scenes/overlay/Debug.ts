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
		if (this.player.keyArrows.up.isDown) pressedKeys.push("Up Arrow");
		if (this.player.keyArrows.down.isDown) pressedKeys.push("Down Arrow");
		if (this.player.keyArrows.left.isDown) pressedKeys.push("Left Arrow");
		if (this.player.keyArrows.right.isDown) pressedKeys.push("Right Arrow");
		if (this.player.keyWASD.W.isDown) pressedKeys.push("W Key (Up)");
		if (this.player.keyWASD.S.isDown) pressedKeys.push("S Key (Down)");
		if (this.player.keyWASD.A.isDown) pressedKeys.push("A Key (Left)");
		if (this.player.keyWASD.D.isDown) pressedKeys.push("D Key (Right)");

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
