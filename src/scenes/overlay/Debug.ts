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
		this.debugText = this.add
			.text(0, 0, "", {
				fontSize: "32px",
			})
			.setScrollFactor(0);

		// enable debug lines
		this.sceneGame.matter.world.drawDebug = true;
	}

	update() {
		// get actual mouse position
		let pointer = this.sceneGame.input.activePointer;

		// update pointer world position
		pointer.updateWorldPoint(this.camera);

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
		if (this.sceneGame.sceneHead.playerInput.buttons_mapped.START > 0)
			pressedKeys.push("START");
		if (this.sceneGame.sceneHead.playerInput.buttons_mapped.SELECT > 0)
			pressedKeys.push("SELECT");
		if (this.sceneGame.sceneHead.playerInput.buttons_mapped.RC_E > 0)
			pressedKeys.push("RC_E");
		if (this.sceneGame.sceneHead.playerInput.buttons_mapped.RC_W > 0)
			pressedKeys.push("RC_W");
		if (this.sceneGame.sceneHead.playerInput.buttons_mapped.LB > 0)
			pressedKeys.push("LB");
		if (this.sceneGame.sceneHead.playerInput.buttons_mapped.RB > 0)
			pressedKeys.push("RB");
		if (this.sceneGame.sceneHead.playerInput.buttons_mapped.LC_N > 0)
			pressedKeys.push("LC_N");
		if (this.sceneGame.sceneHead.playerInput.buttons_mapped.LC_S > 0)
			pressedKeys.push("LC_S");

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
