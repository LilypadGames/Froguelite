import Phaser from "phaser";

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
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
};
