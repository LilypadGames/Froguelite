import OutlinePipelinePlugin from "phaser3-rex-plugins/plugins/outlinepipeline-plugin";
import GlowFilterPipelinePlugin from "phaser3-rex-plugins/plugins/glowfilter2pipeline-plugin";

export class Entity extends Phaser.Physics.Arcade.Sprite {
	isDead: boolean;
	textureKey: string;

	// config
	outline: OutlinePipelinePlugin.IConfig = {
		thickness: 1,
		outlineColor: 0x000000,
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

		// apply outline
		scene.plugins.get("rexOutlinePipeline").add(this, this.outline);

		// apply glow
		scene.plugins.get("rexGlowFilterPipeline").add(this, this.glow);
	}

	// kill entity
	kill() {
		// remove entity if not already dead
		if (!this.isDead) {
			this.isDead = true;
			this.destroy();
		}
	}
}
