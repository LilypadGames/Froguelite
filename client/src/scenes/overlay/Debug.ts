import { Player } from "../../scripts/Player";
import { Core } from "../internal/Core";

export class Debug extends Core {
	debugText!: Phaser.GameObjects.Text;
	player!: Player;
	mainScene!: Phaser.Scene;

	constructor() {
		super({ key: "Debug" });
	}

	init(data: { mainScene: Phaser.Scene; player: Player }) {
		// save values
		this.mainScene = data.mainScene;
		this.player = data.player;
	}

	preload() {}

	create() {
		this.debugText = this.add.text(0, 0, "").setScrollFactor(0);
	}

	update() {
		// get actual mouse position
		let pointer = this.mainScene.input.activePointer;

		// get mouse position relative to the camera view
		let mouse = {
			x:
				this.mainScene.input.activePointer.x /
				this.mainScene.cameras.main.zoomX,
			y:
				this.mainScene.input.activePointer.y /
				this.mainScene.cameras.main.zoomY,
		};

		// get player position relative to the camera view
		let player = {
			x: this.mainScene.cameras.main.worldView.width / 2,
			y: this.mainScene.cameras.main.worldView.height / 2,
		};

		// update debug
		this.debugText.setText([
			"Actual Mouse x: " + pointer.x,
			"Actual Mouse y: " + pointer.y,
			"Actual Player x: " + this.player.x,
			"Actual Player y: " + this.player.y,
			"",
			"Relative Mouse x: " + mouse.x,
			"Relative Mouse y: " + mouse.y,
			"Relative Player x: " + player.x,
			"Relative Player y: " + player.y,
		]);
	}
}
