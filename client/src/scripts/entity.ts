import OutlinePipelinePlugin from "phaser3-rex-plugins/plugins/outlinepipeline-plugin";
import GlowFilterPipelinePlugin from "phaser3-rex-plugins/plugins/glowfilter2pipeline-plugin";

export class Entity extends Phaser.Physics.Arcade.Sprite {
	isDead: boolean;
	textureKey: string;

	// config
	outline: OutlinePipelinePlugin.IConfig = {
		thickness: 1,
		outlineColor: 0x000000,
		quality: 1,
	};
	glow: GlowFilterPipelinePlugin.IConfig = {
		distance: 15,
		outerStrength: 1,
		glowColor: 0x000000,
		quality: 1,
	};

	constructor(scene: Phaser.Scene, x: number, y: number, textureKey: string) {
		// pass values
		super(scene, x, y, textureKey);

		// save values
		this.scene = scene;
		this.textureKey = textureKey;
		this.scene.add.existing(this);
		this.scene.physics.world.enableBody(this, 0);
		this.isDead = false;

		// apply shader
		this.applyShaders(true);
	}

	// kill entity
	kill() {
		// remove entity if not already dead
		if (!this.isDead) {
			this.isDead = true;
			this.destroy();
		}
	}

	applyShaders(performanceMode = false) {
		// get options
		let outlineSettings = this.outline;
		let glowSettings = this.glow;

		// performance mode enabled
		if (performanceMode === true) {
			outlineSettings.quality = 0.02;
			glowSettings.quality = 0.02;
		}

		// apply outline
		this.scene.plugins.get("rexOutlinePipeline").add(this, outlineSettings);

		// apply glow
		this.scene.plugins.get("rexGlowFilterPipeline").add(this, glowSettings);
	}
}
