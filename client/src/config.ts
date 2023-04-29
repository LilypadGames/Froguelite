// imports
import Phaser from "phaser";

// plugins
import OutlinePipelinePlugin from "phaser3-rex-plugins/plugins/outlinepipeline-plugin.js";
import GlowFilterPipelinePlugin from "phaser3-rex-plugins/plugins/glowfilter2pipeline-plugin.js";

// utility
import Utility from "./scripts/Utility";
import ColorScheme from "./scripts/ColorScheme";

//
// These are the settings for the game canvas and game itself.
//

// constants
const gameScale = {
	width: 1920,
	height: 1080,
};

export default {
	title: "Froguelike",
	version: "InDev v0.0.1",
	type: Phaser.WEBGL,
	scale: {
		parent: "game",
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		width: gameScale.width,
		height: gameScale.height,
	},
	backgroundColor: Utility.hex.toString(ColorScheme.Black),
	render: {
		pixelArt: true,
	},
	fps: {
		target: 60,
		forceSetTimeOut: true,
	},
	physics: {
		default: "matter",
		matter: {
			enableSleeping: true,
			debug: {
				showBody: true,
				showStaticBody: true,
			},
		},
	},
	dom: {
		createContainer: true,
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
	banner: false,
};
