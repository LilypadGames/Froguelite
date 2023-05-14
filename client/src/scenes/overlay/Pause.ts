// internal
import { Head } from "../internal/Head";
import { CoreOverlay } from "../internal/CoreOverlay";

// plugins
import {
	Sizer,
	Label,
	Buttons,
} from "phaser3-rex-plugins/templates/ui/ui-components.js";

// utility
import ColorScheme from "../../scripts/utility/ColorScheme";
import Utility from "../../scripts/utility/Utility";

// types
type Button = {
	name: string;
	getElement: (arg0: string) => {
		(): any;
		new (): any;
		setFillStyle: { (arg0: number, arg1: number): void; new (): any };
	};
};

export class Pause extends CoreOverlay {
	worldView!: Phaser.Geom.Rectangle;
	background!: Phaser.GameObjects.Rectangle;
	menu!: Sizer;

	constructor() {
		super({ key: "Pause" });
	}

	preload() {
		// set up ESC key
		super.preload();
	}

	create() {
		// create transparent background overlay
		this.background = this.add.rectangle(
			this.scale.gameSize.width / 2,
			this.scale.gameSize.height / 2,
			this.scale.gameSize.width,
			this.scale.gameSize.height,
			ColorScheme.Black,
			0.5
		);

		// create menu (title with buttons)
		this.menu = new Sizer(this, {
			x: this.scale.gameSize.width / 2,
			y: this.scale.gameSize.height / 2.2,
			orientation: "y",
		})
			// title
			.add(
				this.make.text({
					text: "Paused",
					style: {
						fontSize: "42px",
						fontFamily: "Pix",
						color: Utility.hex.toString(ColorScheme.White),
						align: "center",
					},
					origin: { x: 0.5, y: 0.5 },
					add: true,
				}),
				{ align: "center" }
			)

			// buttons
			.add(
				new Buttons(this, {
					width: this.scale.gameSize.width / 4,
					orientation: "y",
					buttons: [
						this.button("Resume", "resume"),
						this.button("Options", "options"),
						this.button("Restart", "restart"),
						// this.button("Quit", "quit"),
					],
					align: "center",
					space: {
						item: 20,
					},
				})
					.on(
						"button.over",
						(button: Button) => {
							// special color for restart button
							if (button.name === "restart") {
								button
									.getElement("background")
									.setFillStyle(ColorScheme.Red, 0.5);
							}
							// other buttons
							else {
								button
									.getElement("background")
									.setFillStyle(ColorScheme.Black, 0.5);
							}

							// sfx
							this.sound.play("ui_hover", {
								volume: this.sceneHead.audio.sfx.volume.value,
							});
						},
						this
					)
					.on(
						"button.out",
						(button: Button) => {
							// revert to default style
							button
								.getElement("background")
								.setFillStyle(ColorScheme.Black, 0.2);
						},
						this
					)
					.on(
						"button.click",
						(button: Button) => {
							// resume button
							if (button.name === "resume") {
								// sfx
								this.sound.play("ui_back", {
									volume: this.sceneHead.audio.sfx.volume
										.value,
								});

								// go back to previous scene
								this.resumePreviousScene();
							}
							// options menu
							else if (button.name === "options") {
								// sfx
								this.sound.play("ui_select", {
									volume: this.sceneHead.audio.sfx.volume
										.value,
								});

								// hide pause menu
								this.hide();

								// pause the pause menu
								this.scene.pause();

								// launch the options menu
								this.scene.launch("Options", {
									sceneHead: this.sceneHead,
									scenePaused: this,
								});
							}
							// restart button
							else if (button.name === "restart") {
								// reload the page to start from menu
								this.sceneHead.restart();
							}
						},
						this
					),
				{ align: "center" }
			)
			.layout();

		// show menu when resumed
		this.events.on("resume", this.show, this);
	}

	shutdown() {
		//remove listeners
		this.events.removeListener("resume", this.show, this);

		// base class shutdown
		super.shutdown();
	}

	button(text: string, id: string) {
		return new Label(this, {
			height: this.scale.gameSize.height / 20,
			background: this.add.rectangle(
				0,
				0,
				400,
				100,
				ColorScheme.Black,
				0.2
			),
			text: this.make.text({
				text: text,
				style: {
					fontSize: "26px",
					fontFamily: "Pix",
					color: Utility.hex.toString(ColorScheme.White),
				},
				origin: { x: 0.5, y: 0.5 },
				add: true,
			}),
			align: "center",
			space: {
				top: 8,
				bottom: 8,
			},
			name: id,
		});
	}

	hide() {
		this.background.setVisible(false);
		this.menu.setVisible(false);
	}

	show() {
		this.background.setVisible(true);
		this.menu.setVisible(true);
	}
}
