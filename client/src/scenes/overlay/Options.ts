import { Core } from "../internal/Core";
import {
	Sizer,
	Label,
	Buttons,
} from "phaser3-rex-plugins/templates/ui/ui-components.js";
import store from "storejs";

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

		// get initial values
		let highPerformanceMode = store.get(
			"settings.options.highPerformanceMode"
		);

		// create menu (title with buttons)
		const menu = new Sizer(this, {
			x: window.innerWidth / 2,
			y: window.innerHeight / 2.2,
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
					width: window.innerWidth / 3,
					orientation: "y",
					buttons: [
						this.checkbox(
							"High Performance Mode",
							"highPerformanceMode",
							highPerformanceMode
						),
					],
					click: {
						mode: "pointerup",
						clickInterval: 100,
					},
					type: "checkboxes",
					setValueCallback: (button: any, value) => {
						// fill in checkbox or empty it dependant on checkbox value
						button
							.getElement("icon")
							.setFillStyle(value ? 0xffffff : undefined);

						// high performance mode changed
						if (button.name === "highPerformanceMode") {
							this.core.highPerformanceMode.set(value);
						}
					},
					align: "center",
					space: {
						item: 20,
						top: 30,
					},
				})
					.setButtonState("highPerformanceMode", highPerformanceMode)
					.on(
						"button.over",
						(button: any) => {
							button
								.getElement("background")
								.setFillStyle(0x000000, 0.5);
						},
						this
					)
					.on(
						"button.out",
						(button: any) => {
							// revert to default style
							button
								.getElement("background")
								.setFillStyle(0x000000, 0.2);
						},
						this
					)
			)
			.add(
				new Buttons(this, {
					width: window.innerWidth / 3,
					orientation: "y",
					buttons: [this.button("Back", "back")],
					click: {
						mode: "pointerup",
						clickInterval: 100,
					},
					align: "center",
					space: {
						item: 20,
					},
				})
					.on(
						"button.over",
						(button: any) => {
							button
								.getElement("background")
								.setFillStyle(0x000000, 0.5);
						},
						this
					)
					.on(
						"button.out",
						(button: any) => {
							// revert to default style
							button
								.getElement("background")
								.setFillStyle(0x000000, 0.2);
						},
						this
					)
					.on(
						"button.click",
						(button: any) => {
							// back button
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

	checkbox(text: string, id: string, initialValue: boolean) {
		let checkbox = new Label(this, {
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
			icon: this.add
				.rectangle(0, 0, 35, 35)
				.setStrokeStyle(3, 0xffffff)
				.setFillStyle(initialValue ? 0xffffff : undefined),
			align: "center",
			space: {
				left: 10,
				right: 10,
				top: 10,
				bottom: 10,
				icon: 30,
				text: 10,
			},
			name: id,
		});

		return checkbox;
	}

	back() {
		// resume previous scene
		this.scene.resume(this.previousScene);

		// stop options menu
		this.scene.stop();
	}
}
