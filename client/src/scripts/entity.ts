import OutlinePipelinePlugin from "phaser3-rex-plugins/plugins/outlinepipeline-plugin.js";
import GlowFilterPipelinePlugin from "phaser3-rex-plugins/plugins/glowfilter2pipeline-plugin";
import store from "storejs";
import OutlinePostFxPipeline from "phaser3-rex-plugins/plugins/outlinepipeline";
import GlowFilterPostFxPipeline from "phaser3-rex-plugins/plugins/glowfilter2pipeline";

export class Entity extends Phaser.Physics.Arcade.Sprite {
	textureKey: string;

	// shaders
	outlineFxInstance!: OutlinePostFxPipeline;
	glowFxInstance!: GlowFilterPostFxPipeline;
	outlineFx = this.scene.plugins.get(
		"rexOutlinePipeline"
	) as OutlinePipelinePlugin;
	glowFx = this.scene.plugins.get(
		"rexGlowFilterPipeline"
	) as GlowFilterPipelinePlugin;

	// config
	outline = {
		thickness: 1,
		outlineColor: 0x000000,
		quality: 1,
	};
	glow = {
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

		// apply shader
		this.applyShaders(store.get("settings.options.highPerformanceMode"));
	}

	applyShaders(performanceMode = false) {
		// get options
		let outlineSettings = this.outline;
		let glowSettings = this.glow;

		// performance mode enabled
		if (performanceMode) {
			outlineSettings.quality = 0.02;
			glowSettings.quality = 0.02;
		}

		// remove FX
		if (this.outlineFxInstance !== undefined) this.outlineFx.remove(this);
		if (this.glowFxInstance !== undefined) this.glowFx.remove(this);

		// set FX
		this.outlineFxInstance = this.outlineFx.add(this, outlineSettings);
		this.glowFxInstance = this.glowFx.add(this, glowSettings);
	}
}
