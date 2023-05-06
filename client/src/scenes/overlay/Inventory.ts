// internal
import { CoreOverlay } from "../internal/CoreOverlay";

// plugin
import {
	Sizer,
	Label,
	Buttons,
	Slider,
	RoundRectangle,
} from "phaser3-rex-plugins/templates/ui/ui-components.js";

// utility
import ColorScheme from "../../scripts/ColorScheme";

export class Inventory extends CoreOverlay {
	worldView!: Phaser.Geom.Rectangle;
	background!: Phaser.GameObjects.Rectangle;
	keyTAB!: Phaser.Input.Keyboard.Key;
	playerRepresentation!: Phaser.GameObjects.Image;
	tabs!: Buttons;

	constructor() {
		super({ key: "Inventory" });
	}

	preload() {
		// set up ESC key
		super.preload();

		// make TAB key close inventory (like ESC key)
		this.keyTAB = (
			this.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin
		).addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
		this.keyTAB.once("down", super.resumePreviousScene, this);
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

		// top banner
		this.add
			.rectangle(
				0,
				0,
				this.scale.gameSize.width,
				this.scale.gameSize.height / 8,
				ColorScheme.Black,
				0.25
			)
			.setOrigin(0, 0);

		// bottom banner
		this.add
			.rectangle(
				0,
				this.scale.gameSize.height,
				this.scale.gameSize.width,
				this.scale.gameSize.height / 10,
				ColorScheme.Black,
				0.25
			)
			.setOrigin(0, 1);

		// player representation
		this.playerRepresentation = this.add
			.image(
				this.scale.gameSize.width - this.scale.gameSize.width / 6,
				this.scale.gameSize.height / 2,
				this.cache.json.get("game").player.texture
			)
			.setScale(50);

		// tabs
		this.tabs = this.createTabs({
			spell: {
				icon: "gui_tab_spell",
				clickCallback: () => {
					console.log("Spell Tab Clicked");
				},
			},
			armor: {
				icon: "gui_tab_armor",
				clickCallback: () => {
					console.log("Armor Tab Clicked");
				},
			},
		});

		// populate inventory

		// selection marker

		// selection description

		// show menu when resumed
		this.events.on("resume", this.show, this);
	}

	shutdown() {
		// remove listeners
		this.events.removeListener("resume", this.show, this);
		this.keyTAB.removeListener("down", super.resumePreviousScene, this);

		// base class shutdown
		super.shutdown();
	}

	hide() {
		this.background.setVisible(false);
	}

	show() {
		this.background.setVisible(true);
	}

	createTabs(tabs: {
		[key: string]: { icon: string; clickCallback: () => void };
	}) {
		// create tabs
		let createdTabs: Label[] = [];
		for (const tabID in tabs) {
			createdTabs.push(
				new Label(this, {
					background: new RoundRectangle(
						this,
						0,
						0,
						0,
						0,
						10,
						ColorScheme.Black,
						0.3
					).addToDisplayList(),
					icon: this.add
						.image(0, 0, tabs[tabID].icon)
						.setScale(5)
						.setOrigin(0.5, 0.5),
					align: "center",
					name: tabID,
					space: {
						left: 20,
						right: 20,
						top: 20,
						bottom: 20,
					},
				})
			);
		}

		// create button
		return new Buttons(this, {
			x: this.scale.gameSize.width / 16,
			y: this.scale.gameSize.height / 2,
			buttons: createdTabs,
			orientation: "y",
			click: {
				mode: "pointerup",
				clickInterval: 100,
			},
			align: "center",
			space: {
				item: 20,
			},
		})
			.on("button.click", (button: any) => {
				// sfx
				this.sound.play("ui_select", { volume: 0.75 });

				tabs[button.name].clickCallback();
			})
			.on(
				"button.over",
				(button: any) => {
					// sfx
					this.sound.play("ui_hover", { volume: 0.75 });

					// darker background opacity and stroke
					button
						.getElement("background")
						.setStrokeStyle(2, ColorScheme.White)
						.setFillStyle(ColorScheme.Black, 0.8);
				},
				this
			)
			.on(
				"button.out",
				(button: any) => {
					// normal background opacity
					button
						.getElement("background")
						.setStrokeStyle(0)
						.setFillStyle(ColorScheme.Black, 0.3);
				},
				this
			)
			.layout();
	}
}
