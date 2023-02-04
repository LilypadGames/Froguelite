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

export class Options extends Core {
	previousScene!: Phaser.Scene;

	constructor() {
		super({ key: "Options" });
	}

	init(previousScene: Phaser.Scene) {
		// save values
		this.previousScene = previousScene;
	}

	preload() {
		// populate key input
		this.keyESC = this.input.keyboard.addKey(
			Phaser.Input.Keyboard.KeyCodes.ESC
		);

		// pause or resume
		this.keyESC.on("down", () => {
			this.back();
		});
	}

	create() {
		// create core mechanics
		this.core.create();

		// create transparent background overlay
		const background = this.add.rectangle(
			window.innerWidth / 2,
			window.innerHeight / 2,
			window.innerWidth,
			window.innerHeight,
			0x000000,
			0.5
		);

		// create menu (title with buttons)
		const menu = new Sizer(this, {
			x: window.innerWidth / 2,
			y: window.innerHeight / 2.2,
			width: window.innerWidth / 4,
			orientation: "y",
		})
			.add(
				this.make.text({
					text: "Options",
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
					width: window.innerWidth / 4,
					orientation: "y",
					buttons: [
						this.button(
							"Low Performance Mode",
							"lowperformancemode"
						),
						this.button("Back", "back"),
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
							button
								.getElement("background")
								.setFillStyle(0x000000, 0.5);
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
							if (button.name === "back") {
								this.back();
							}
						},
						this
					)
			)
			.layout();
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

	back() {
		// resume previous scene
		this.scene.resume(this.previousScene);

		// stop options menu
		this.scene.stop();
	}
}
