// imports
import store from "storejs";

// internal
import { CoreOverlay } from "../internal/CoreOverlay";

// utility
import Utility from "../../scripts/Utility";

// UI components
import {
	Sizer,
	Label,
	Buttons,
	Slider,
	RoundRectangle,
} from "phaser3-rex-plugins/templates/ui/ui-components.js";
import ColorScheme from "../../scripts/ColorScheme";
import { Head } from "../internal/Head";
import Button from "phaser3-rex-plugins/plugins/button";

export class Options extends CoreOverlay {
	background!: Phaser.GameObjects.Rectangle;
	menu!: Sizer;

	constructor() {
		super({ key: "Options" });
	}

	init(pausedScene: Phaser.Scene) {
		// save paused scene
		super.init(pausedScene);
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
			space: { top: -20, item: 20 },
		})
			// title
			.add(
				this.make.text({
					text: "Options",
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

			// music controls
			.add(
				this.sliderToggler(
					"Music Volume",
					"musicVolume",
					(
						this.game.scene.getScene("Head") as Head
					).sceneMain.music.getState(),
					(this.game.scene.getScene("Head") as Head).sceneMain.music
						.getVolume,

					// toggle callback
					(value: boolean, currentSliderValue: number) => {
						// update state
						(
							this.game.scene.getScene("Head") as Head
						).sceneMain.music.setState(value);

						// save current value if toggled off
						if (!value)
							(
								this.game.scene.getScene("Head") as Head
							).sceneMain.music.setVolume(currentSliderValue);
					},

					// slider callback
					(value: number) => {
						// update volume
						(
							this.game.scene.getScene("Head") as Head
						).sceneMain.music.getState()
							? (
									this.game.scene.getScene("Head") as Head
							  ).sceneMain.music.setVolume(value)
							: 0;
					}
				),
				{
					align: "center",
				}
			)

			// performance mode
			.add(
				this.checkbox(
					"High Performance Mode",
					"highPerformanceMode",
					store.get("settings.options.highPerformanceMode"),
					(value: boolean) => {
						(
							this.game.scene.getScene("Head") as Head
						).highPerformanceMode.set(value);
					}
				),
				{
					align: "center",
				}
			)

			// go back
			.add(
				this.button("Back", "back", () => {
					this.resumePreviousScene();
				}),
				{
					align: "center",
				}
			)
			.layout();
	}

	shutdown() {
		// remove listeners
		this.events.removeListener("toggleChanged");
		this.events.removeListener("sliderChanged");

		// base class shutdown
		super.shutdown();
	}

	resumePreviousScene() {
		// resume
		super.resumePreviousScene();
	}

	button(text: string, id: string, clickCallback: () => void) {
		return new Buttons(this, {
			width: this.scale.gameSize.width / 3,
			orientation: "y",
			buttons: [
				new Label(this, {
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
					name: id,
				}),
			],
			click: {
				mode: "pointerup",
				clickInterval: 100,
			},
			align: "center",
		})
			.on(
				"button.over",
				(button: any) => {
					button
						.getElement("background")
						.setFillStyle(ColorScheme.Black, 0.5);
				},
				this
			)
			.on(
				"button.out",
				(button: any) => {
					// revert to default style
					button
						.getElement("background")
						.setFillStyle(ColorScheme.Black, 0.2);
				},
				this
			)
			.on(
				"button.click",
				(button: any) => {
					// callback
					if (button.name === id) clickCallback();
				},
				this
			);
	}

	sliderToggler(
		text: string,
		id: string,
		initialState: boolean,
		getValue: () => number,
		toggleCallback: (value: boolean, originalValue: number) => void,
		sliderCallback: (value: number) => void
	) {
		let background = this.add.rectangle(
			0,
			0,
			400,
			100,
			ColorScheme.Black,
			0.2
		);

		let sliderToggler = new Sizer(this, {
			width: this.scale.gameSize.width / 3,
			height: this.scale.gameSize.height / 20,
			orientation: "x",
			name: id,
		}).addBackground(background);

		let toggleButton = new Buttons(this, {
			orientation: "y",
			buttons: [
				new Label(this, {
					text: this.add.text(0, 0, text, {
						fontSize: "26px",
						fontFamily: "Pix",
						color: Utility.hex.toString(ColorScheme.White),
					}),
					icon: this.add
						.rectangle(0, 0, 35, 35)
						.setStrokeStyle(3, ColorScheme.White),
					rtl: true,
					name: id + "_button",
					space: {
						icon: 20,
						right: -10,
					},
				}),
			],
			click: {
				mode: "pointerup",
				clickInterval: 100,
			},
			type: "checkboxes",
			setValueCallbackScope: this,

			// value changed
			setValueCallback: (
				button: any,
				value: boolean,
				oldValue: boolean
			) => {
				// don't trigger if the same as before
				if (value === oldValue || oldValue === undefined) return;

				// change checkbox state dependant on current value
				button
					.getElement("icon")
					.setFillStyle(value ? ColorScheme.White : undefined);

				// toggle changed
				this.events.emit("toggleChanged", value);
			},
		})
			// set initial state
			.setButtonState(id + "_button", initialState)
			.on(
				"button.over",
				() => {
					// hover style
					background.setFillStyle(ColorScheme.Black, 0.5);
				},
				this
			)
			.on(
				"button.out",
				() => {
					// default style
					background.setFillStyle(ColorScheme.Black, 0.2);
				},
				this
			);

		let slider = new Slider(this, {
			width: this.scale.gameSize.width / 8,
			orientation: "x",
			name: id + "_slider",
			track: new RoundRectangle(
				this,
				0,
				0,
				0,
				0,
				10,
				ColorScheme.LightGray
			).addToDisplayList(),
			indicator: new RoundRectangle(
				this,
				0,
				0,
				0,
				0,
				10,
				ColorScheme.White
			).addToDisplayList(),
			thumb: new RoundRectangle(
				this,
				0,
				0,
				0,
				0,
				10,
				ColorScheme.White
			).addToDisplayList(),
			input: "click",
			easeValue: {
				duration: 80,
				ease: "Linear",
			},
			// value changed
			valuechangeCallback: (value: number, oldValue: number) => {
				// don't trigger if the same as before
				if (value === oldValue || oldValue === undefined) return;

				// slider changed
				this.events.emit("sliderChanged", value);
			},

			// initial state
			value: initialState ? getValue() : 0,
		})
			.on(
				"pointerover",
				() => {
					// hover style
					background.setFillStyle(ColorScheme.Black, 0.5);
				},
				this
			)
			.on(
				"pointerout",
				() => {
					// default style
					background.setFillStyle(ColorScheme.Black, 0.2);
				},
				this
			);

		// set up value change functionality and callbacks
		this.events.on(
			"toggleChanged",
			(value: boolean) => {
				// get the current slider value
				const currentSliderValue = slider.getValue();

				// show current slider value
				if (value) slider.setValue(getValue());
				// hide current slider value
				else slider.setValue(0);

				// callback
				toggleCallback(value, currentSliderValue);
			},
			this
		);
		this.events.on(
			"sliderChanged",
			(value: number) => {
				// re-enabled the disabled toggle button when the slider is changed to any value above 0
				if (!toggleButton.getButtonState(id + "_button") && value > 0)
					toggleButton.setButtonState(id + "_button", true);

				// disable toggle button if set to 0
				if (toggleButton.getButtonState(id + "_button") && value === 0)
					toggleButton.setButtonState(id + "_button", false);

				// callback
				sliderCallback(value);
			},
			this
		);

		// add components to sizer
		return sliderToggler
			.addSpace()
			.add(toggleButton)
			.add(slider)
			.addSpace();
	}

	checkbox(
		text: string,
		id: string,
		initialValue: boolean,
		valueChangeCallback: (value: boolean) => void
	) {
		return new Buttons(this, {
			width: this.scale.gameSize.width / 3,
			orientation: "y",
			buttons: [
				new Label(this, {
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
					icon: this.add
						.rectangle(0, 0, 35, 35)
						.setStrokeStyle(3, ColorScheme.White)
						.setFillStyle(
							initialValue ? ColorScheme.White : undefined
						),
					align: "center",
					name: id,
					space: {
						icon: 20,
					},
				}),
			],
			click: {
				mode: "pointerup",
				clickInterval: 100,
			},
			type: "checkboxes",
			setValueCallback: (button: any, value: boolean) => {
				// fill in checkbox or empty it dependant on checkbox value
				button
					.getElement("icon")
					.setFillStyle(value ? ColorScheme.White : undefined);

				// callback
				valueChangeCallback(value);
			},
			align: "center",
		})
			.setButtonState(id, initialValue)
			.on(
				"button.over",
				(button: any) => {
					button
						.getElement("background")
						.setFillStyle(ColorScheme.Black, 0.5);
				},
				this
			)
			.on(
				"button.out",
				(button: any) => {
					// revert to default style
					button
						.getElement("background")
						.setFillStyle(ColorScheme.Black, 0.2);
				},
				this
			);
	}
}
