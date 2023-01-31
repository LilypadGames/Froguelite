import Phaser from "phaser";

export class Core extends Phaser.Scene {
	constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
		super(config);
	}

	core:object = {
		//cursor
		cursor: {
			init: () => {
				//default
				this.input.setDefaultCursor(
					"url(assets/input/cursors/cursor_large.cur), pointer"
				);
	
				//click
				this.input.on("pointerdown", () => {
					this.input.setDefaultCursor(
						"url(assets/input/cursors/cursor_small.cur), pointer"
					);
				});
	
				//un-click
				this.input.on("pointerup", () => {
					this.input.setDefaultCursor(
						"url(assets/input/cursors/cursor_large.cur), pointer"
					);
				});
			}
		}
	};
}
