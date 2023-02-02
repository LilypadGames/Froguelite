import Phaser from "phaser";
import OutlinePipelinePlugin from "phaser3-rex-plugins/plugins/outlinepipeline-plugin.js";
import GlowFilterPipelinePlugin from "phaser3-rex-plugins/plugins/glowfilter2pipeline-plugin.js";

//
// These are the settings for the game canvas and game itself.
//

export default {
	type: Phaser.AUTO,
	parent: "game",
	backgroundColor: "#111",
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		width: window.innerWidth,
		height: window.innerHeight,
	},
	render: {
		pixelArt: true,
	},
	physics: {
		default: "arcade",
		arcade: {
			debug: false,
		},
	},
	plugins: {
		global: [
			{
				key: "rexOutlinePipeline",
				plugin: OutlinePipelinePlugin,
				start: true,
			},
			{
				key: "rexGlowFilterPipeline",
				plugin: GlowFilterPipelinePlugin,
				start: true,
			},
		],
	},
};
