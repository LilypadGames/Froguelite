import { Game } from "../scenes/Game";
import OutlinePipelinePlugin from "phaser3-rex-plugins/plugins/outlinepipeline-plugin.js";
import GlowFilterPipelinePlugin from "phaser3-rex-plugins/plugins/glowfilter2pipeline-plugin";
import OutlinePostFxPipeline from "phaser3-rex-plugins/plugins/outlinepipeline";
import GlowFilterPostFxPipeline from "phaser3-rex-plugins/plugins/glowfilter2pipeline";
import store from "storejs";

export class Entity extends Phaser.Physics.Matter.Sprite {
	scene: Game;
	textureKey: string;
	entityType: string;

	// shaders
	outlineFxInstance!: OutlinePostFxPipeline;
	glowFxInstance!: GlowFilterPostFxPipeline;
	outlineFx;
	glowFx;

	// config
	outline = {
		thickness: 1,
		outlineColor: 0x000000,
		quality: 0.3,
	};
	glow = {
		distance: 15,
		outerStrength: 1,
		glowColor: 0x000000,
		quality: 0.3,
	};

	constructor(
		scene: Game,
		x: number,
		y: number,
		textureKey: string,
		label: string,
		entityType: string
	) {
		// pass values
		super(scene.matter.world, x, y, textureKey, undefined);

		// save values
		this.scene = scene;
		this.textureKey = textureKey;
		this.entityType = entityType;

		// get effect plugins
		this.glowFx = this.scene.plugins.get(
			"rexGlowFilterPipeline"
		) as GlowFilterPipelinePlugin;
		this.outlineFx = this.scene.plugins.get(
			"rexOutlinePipeline"
		) as OutlinePipelinePlugin;

		// add entity to scene
		this.scene.add.existing(this);

		// set up collisions
		this.setBody(
			{ type: "rectangle", width: this.width, height: this.height },
			{
				isSensor: false,
				label: label,
			}
		);

		// prevent rotation when moving
		this.setFixedRotation();
		this.setFriction(1, 0.2, 10);
		this.setBounce(0);

		// apply shader
		this.applyShaders(store.get("settings.options.highPerformanceMode"));
	}

	// show
	show() {
		this.setVisible(true);
		this.setActive(true);
	}

	// hide
	hide() {
		this.setVisible(false);
		this.setActive(false);
	}

	applyShaders(performanceMode = false) {
		// get options
		let outlineSettings = JSON.parse(JSON.stringify(this.outline));
		let glowSettings = JSON.parse(JSON.stringify(this.glow));

		// performance mode enabled
		if (performanceMode) {
			outlineSettings.quality = 0;
			glowSettings.quality = 0;
		}

		// remove old FX
		if (this.outlineFxInstance !== undefined) this.outlineFx.remove(this);
		if (this.glowFxInstance !== undefined) this.glowFx.remove(this);

		// set new FX
		if (outlineSettings.quality > 0)
			this.outlineFxInstance = this.outlineFx.add(this, outlineSettings);
		if (glowSettings.quality > 0)
			this.glowFxInstance = this.glowFx.add(this, glowSettings);
	}

	getRelativePosition(camera: Phaser.Cameras.Scene2D.Camera) {
		// get ox/oy
		let ox = camera.originX * camera.width;
		let oy = camera.originY * camera.height;

		// transform point
		let relativePos: Phaser.Geom.Point = Phaser.Math.TransformXY(
			this.x,
			this.y,
			ox + camera.scrollX,
			oy + camera.scrollY,
			-(camera as any).rotation,
			1 / camera.zoom,
			1 / camera.zoom
		) as Phaser.Geom.Point;

		// translate back
		relativePos.x += ox;
		relativePos.y += oy;

		// return
		return relativePos;
	}
}
