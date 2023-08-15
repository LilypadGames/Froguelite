// imports
import Phaser from "phaser";

// plugins
import AnimatedTiles from "phaser-animated-tiles";
import OutlinePipelinePlugin from "phaser3-rex-plugins/plugins/outlinepipeline-plugin.js";
import GlowFilterPipelinePlugin from "phaser3-rex-plugins/plugins/glowfilter2pipeline-plugin.js";
import MergedInput from "phaser3-merged-input";

// utility
import Utility from "./scripts/utility/Utility";
import ColorScheme from "./scripts/utility/ColorScheme";

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
	input: {
		gamepad: true,
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
		scene: [
			{
				key: "AnimatedTiles",
				plugin: AnimatedTiles,
				mapping: "AnimatedTiles",
			},
			{
				key: "mergedInput",
				plugin: MergedInput,
				mapping: "mergedInput",
			},
		],
	},
	banner: false,
	depth: {
		world: 1,
		structure: 2,
		interactable: 3,
		projectiles: 4,
		enemy: 5,
		player: {
			base: 6,
			armor: 7,
		},
		particle: 8,
		overlay: 100000,
		debug: 100001,
	},
	collisionGroup: {
		world: 0,
		interactables: 0,
		player: 0,
		enemy: 0,
		spell: 0,
		traversable: 0,
	},
	world: {
		chunkSize: 18,
		tileSize: 25,
	},
};
