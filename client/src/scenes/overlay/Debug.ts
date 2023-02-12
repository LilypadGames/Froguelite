import { Player } from "../../scripts/Player";
import { Game } from "../Game";
import { Core } from "../internal/Core";

export class Debug extends Core {
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

		// get mouse position relative to the camera view
		let mouse = {
			x:
				this.sceneGame.input.activePointer.x /
				this.sceneGame.cameras.main.zoomX,
			y:
				this.sceneGame.input.activePointer.y /
				this.sceneGame.cameras.main.zoomY,
		};

		// get player position relative to the camera view
		let player = {
			x: this.sceneGame.cameras.main.worldView.width / 2,
			y: this.sceneGame.cameras.main.worldView.height / 2,
		};

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
			"Actual Mouse Pos: (" + pointer.x + ", " + pointer.y + ")",
			"Actual Player Pos: (" + this.player.x + ", " + this.player.y + ")",
			"",
			"Relative Mouse Pos: (" + mouse.x + ", " + mouse.y + ")",
			"Relative Player Pos: (" + player.x + ", " + player.y + ")",
			"",
			"Camera Rotation: " + this.camera.rotation,
			"Player Rotation: " + this.player.rotation,
			"",
			"Player Velocity: (" +
				this.player.body.velocity.x +
				", " +
				this.player.body.velocity.y +
				")",
			"Pressed Keys: " + pressedKeys.join(", "),
		]);
	}
}
