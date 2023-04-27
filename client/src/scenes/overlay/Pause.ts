import { Core } from "../internal/Core";
import {
	Sizer,
	Label,
	Buttons,
} from "phaser3-rex-plugins/templates/ui/ui-components.js";

type Button = {
	name: string;
	getElement: (arg0: string) => {
		(): any;
		new (): any;
		setFillStyle: { (arg0: number, arg1: number): void; new (): any };
	};
};

export class Pause extends Core {
	pausedScene!: Phaser.Scene;
	worldView!: Phaser.Geom.Rectangle;
	background!: Phaser.GameObjects.Rectangle;
	menu!: Sizer;

	constructor() {
		super({ key: "Pause" });
	}

	init(pausedScene: Phaser.Scene) {
		// save values
		this.pausedScene = pausedScene;
	}

	preload() {
		// populate key input
		this.keyESC = (
			this.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin
		).addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

		// pause or resume
		this.keyESC.on("down", () => {
			this.resume();
		});
	}

	create() {
		// create core mechanics
		this.core.create();

		// create transparent background overlay
		this.background = this.add.rectangle(
			this.scale.gameSize.width / 2,
			this.scale.gameSize.height / 2,
			this.scale.gameSize.width,
			this.scale.gameSize.height,
			0x000000,
			0.5
		);

		// create menu (title with buttons)
		this.menu = new Sizer(this, {
			x: this.scale.gameSize.width / 2,
			y: this.scale.gameSize.height / 2.2,
			orientation: "y",
		})
			.add(
				this.make.text({
					text: "Paused",
					style: {
						fontSize: "42px",
						fontFamily: "Pix",
						color: "#ffffff",
						align: "center",
					},
					origin: { x: 0.5, y: 0.5 },
					add: true,
				})
			)
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
						top: 30,
					},
				})
					.on(
						"button.over",
						(button: Button) => {
							// special color for restart button
							if (button.name === "restart") {
								button
									.getElement("background")
									.setFillStyle(0xff0000, 0.5);
							}
							// other buttons
							else {
								button
									.getElement("background")
									.setFillStyle(0x000000, 0.5);
							}
						},
						this
					)
					.on(
						"button.out",
						(button: Button) => {
							// revert to default style
							button
								.getElement("background")
								.setFillStyle(0x000000, 0.2);
						},
						this
					)
					.on(
						"button.click",
						(button: Button) => {
							// resume button
							if (button.name === "resume") {
								// go back to previous scene
								this.resume();
							}
							// options menu
							else if (button.name === "options") {
								// hide pause menu
								this.hide();

								// pause the pause menu
								this.scene.pause();

								// launch the options menu
								this.scene.launch("Options", this);
							}
							// restart button
							else if (button.name === "restart") {
								// reload the page to start from menu
								this.core.restart();
							}
						},
						this
					)
			)
			.layout();

		// show menu when resumed
		this.events.on("resume", this.show, this);
	}

	button(text: string, id: string) {
		return new Label(this, {
			background: this.add.rectangle(0, 0, 400, 100, 0x000000, 0.2),
			text: this.make.text({
				text: text,
				style: {
					fontSize: "26px",
					fontFamily: "Pix",
					color: "#ffffff",
				},
				origin: { x: 0.5, y: 0.5 },
				add: true,
			}),
			align: "center",
			space: {
				left: 10,
				right: 10,
				top: 10,
				bottom: 10,
				icon: 10,
				text: 10,
			},
			name: id,
		});
	}

	resume() {
		// resume previous scene
		this.scene.resume(this.pausedScene);

		// stop pause menu
		this.scene.stop();
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
