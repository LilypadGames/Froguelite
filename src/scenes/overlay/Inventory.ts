// internal
import { CoreOverlay } from "../internal/CoreOverlay";

// scenes
import { Game } from "../Game";

// plugin
import {
	Label,
	Buttons,
	RoundRectangle,
	FixWidthSizer,
	Sizer,
} from "phaser3-rex-plugins/templates/ui/ui-components.js";

// utility
import ColorScheme from "../../scripts/utility/ColorScheme";
import Utility from "../../scripts/utility/Utility";

// config
import config from "../../config";

export class Inventory extends CoreOverlay {
	worldView!: Phaser.Geom.Rectangle;
	background!: Phaser.GameObjects.Rectangle;
	characterRepresentation!: Phaser.GameObjects.Group;
	currentInventory!: "spells" | "armors";
	tabs!: Buttons;
	slots!: FixWidthSizer;
	selectionDescription!: Sizer;

	constructor() {
		super({ key: "Inventory" });
	}

	init(data: inventorySceneData) {
		super.init(data);

		// set to provided inventory, or default inventory (spells)
		this.currentInventory = data.inventory
			? this.currentInventory
			: "spells";
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
		this.characterRepresentation = this.createCharacterRepresentation();

		// tabs
		this.tabs = this.createTabs({
			spells: {
				id: "spells",
				icon: "gui_tab_spell",
				clickCallback: () => {
					if (this.slots.name !== "spells") {
						// remove current selection
						(
							(
								this.tabs.getByName(
									this.currentInventory
								) as Label
							).getElement("background") as RoundRectangle
						).setFillStyle(ColorScheme.Black);

						// set new selection
						(
							(this.tabs.getByName("spells") as Label).getElement(
								"background"
							) as RoundRectangle
						).setFillStyle(ColorScheme.LighterGray);

						// set new inventory
						this.currentInventory = "spells";

						// remove current inventory slots
						this.slots.destroy();

						// create new inventory slots
						this.populateSlots("spells");
					}
				},
			},
			armors: {
				id: "armors",
				icon: "gui_tab_armor",
				clickCallback: () => {
					if (this.slots.name !== "armors") {
						// remove current selection
						(
							(
								this.tabs.getByName(
									this.currentInventory
								) as Label
							).getElement("background") as RoundRectangle
						).setFillStyle(ColorScheme.Black);

						// set new selection
						(
							(this.tabs.getByName("armors") as Label).getElement(
								"background"
							) as RoundRectangle
						).setFillStyle(ColorScheme.LighterGray);

						// set new inventory
						this.currentInventory = "armors";

						// remove current inventory slots
						this.slots.destroy();

						// create new inventory slots
						this.populateSlots("armors");
					}
				},
			},
		});

		// populate inventory slots
		this.populateSlots(this.currentInventory);

		// selection description
		this.selectionDescription = this.createSelectionDescription();
	}

	registerInputs() {
		// detect input
		this.sceneHead.events.once(
			"input_inventory",
			this.resumePreviousScene,
			this
		);

		// core inputs
		super.registerInputs();
	}

	createCharacterRepresentation() {
		// base
		let characterRepresentation = this.add.group().add(
			this.add
				.image(
					this.scale.gameSize.width - this.scale.gameSize.width / 6,
					this.scale.gameSize.height / 2,
					this.cache.json.get("game").player.texture
				)
				.setDepth(config.depth.player.base)
				.setOrigin(0.5, 0.5)
				.setScale(50)
		);

		// armor torso
		if (
			(this.scenePaused as Game).player.armor.torso &&
			(this.scenePaused as Game).player.equipped.armor
		)
			characterRepresentation.add(
				this.add
					.image(
						this.scale.gameSize.width -
							this.scale.gameSize.width / 6,
						this.scale.gameSize.height / 2,
						(this.scenePaused as Game).player.equipped
							.armor as string
					)
					.setDepth(config.depth.player.armor)
					.setOrigin(0.5, 0.5)
					.setScale(50),
				true
			);

		return characterRepresentation;
	}

	updateCharacterRepresentation() {
		// torso
		if (
			(this.scenePaused as Game).player.armor.torso &&
			(this.scenePaused as Game).player.equipped.armor
		) {
			// update
			this.characterRepresentation.getChildren()[1] = this.add
				.image(
					this.scale.gameSize.width - this.scale.gameSize.width / 6,
					this.scale.gameSize.height / 2,
					(this.scenePaused as Game).player.equipped.armor as string
				)
				.setDepth(config.depth.player.armor)
				.setOrigin(0.5, 0.5)
				.setScale(50);
		}

		// no torso
		else if (this.characterRepresentation.getChildren()[1])
			this.characterRepresentation.getChildren()[1].destroy();
	}

	populateSlots(currentInventorySelection: "spells" | "armors") {
		// inventory
		let rows = 3;
		let columns = 7;

		// sizes
		let spacing = 10;
		let slotSize = 100;

		// convert inventory to singular
		let singularInventoryName: "spell" | "armor" =
			currentInventorySelection === "spells"
				? "spell"
				: currentInventorySelection === "armors"
				? "armor"
				: "spell";

		// get currently equipped item
		let getEquippedItem = () => {
			return (this.scenePaused as Game).player.equipped[
				singularInventoryName
			];
		};

		// get item in specified slot in player's inventory
		let getItemInSlot = (slotNumber: number) => {
			return (this.scenePaused as Game).player.inventory[
				currentInventorySelection
			][slotNumber];
		};

		// create inventory sizer
		this.slots = new FixWidthSizer(this, {
			x: this.game.canvas.width / 2 - this.game.canvas.width / 10,
			y: this.game.canvas.height / 2,
			width: columns * (slotSize + spacing * 2),
			space: { item: spacing },
			name: currentInventorySelection,
		})
			.setChildrenInteractive({
				click: { mode: "release", clickInterval: 100 },
			})
			.on("child.click", (slot: Label) => {
				// slot is not empty
				if (!getItemInSlot(Number(slot.name))) return;

				// spell slot already equipped (armor slots can be unequipped but spells cannot)
				if (
					this.currentInventory === "spells" &&
					getEquippedItem() === getItemInSlot(Number(slot.name))
				)
					return;

				// sfx
				this.sound.play("ui_select", {
					volume: this.sceneHead.audio.sfx.volume.value,
				});

				// unequip
				if (getEquippedItem() === getItemInSlot(Number(slot.name))) {
					(this.scenePaused as Game).player.unequip(
						singularInventoryName as "armor"
					);
				}

				// equip
				else {
					(this.scenePaused as Game).player.equip(
						singularInventoryName,
						getItemInSlot(Number(slot.name))
					);
				}

				// update character representation
				this.updateCharacterRepresentation();

				// update slot background
				(slot.getElement("background") as RoundRectangle).setFillStyle(
					getEquippedItem() === getItemInSlot(Number(slot.name))
						? ColorScheme.LighterGray
						: ColorScheme.Black
				);
			})
			.on(
				"child.over",
				(slot: Label) => {
					// slot is not empty
					if (!getItemInSlot(Number(slot.name))) return;

					// sfx
					this.sound.play("ui_hover", {
						volume: this.sceneHead.audio.sfx.volume.value,
					});

					// show selection information
					this.updateSelectionDescription(
						this.cache.json.get("lang.en_us")[
							singularInventoryName
						][getItemInSlot(Number(slot.name))].name,
						this.cache.json.get("lang.en_us")[
							singularInventoryName
						][getItemInSlot(Number(slot.name))].description
					);

					// darker background opacity and stroke
					(slot.getElement("background") as RoundRectangle)
						.setStrokeStyle(2, ColorScheme.White)
						// check slot's item compared to the players equipped item in order to use the proper background color
						.setFillStyle(
							getEquippedItem() ===
								getItemInSlot(Number(slot.name))
								? ColorScheme.LighterGray
								: ColorScheme.Black,
							0.8
						);
				},
				this
			)
			.on(
				"child.out",
				(slot: Label) => {
					// slot is not empty
					if (!getItemInSlot(Number(slot.name))) return;

					// hide selection information
					this.selectionDescription.setVisible(false);

					// normal background opacity
					(slot.getElement("background") as RoundRectangle)
						.setStrokeStyle(0)
						// check slot's item compared to the players equipped item in order to use the proper background color
						.setFillStyle(
							getEquippedItem() ===
								getItemInSlot(Number(slot.name))
								? ColorScheme.LighterGray
								: ColorScheme.Black,
							0.5
						);
				},
				this
			);

		// create slots
		for (let i = 0; i < rows * columns; i += 1) {
			// check if theres an item in this slot
			let slotItem = getItemInSlot(i);

			// create slot icon (if theres an item in this slot)
			let icon = slotItem
				? this.add
						.image(
							0,
							0,
							this.game.cache.json.get("game")[
								currentInventorySelection
							][slotItem].inventory.texture
						)
						.setScale(
							this.game.cache.json.get("game")[
								currentInventorySelection
							][slotItem].inventory.scale
						)
						.setOrigin(0.5, 0.5)
				: undefined;

			// get slot background color (equipped, not equipped, empty)
			let slotBackgroundColor =
				// equipped
				slotItem && getEquippedItem() === slotItem
					? ColorScheme.LighterGray
					: slotItem
					? // not equipped
					  ColorScheme.Black
					: // empty
					  ColorScheme.DarkGray;

			// add slot
			this.slots.add(
				// create slot
				new Label(this, {
					background: new RoundRectangle(
						this,
						0,
						0,
						0,
						0,
						10,
						// is this slot currently equipped?
						slotBackgroundColor,
						0.5
					).addToDisplayList(),
					icon: icon?.setDepth(2),
					align: "center",
					name: String(i),
					sizerEvents: true,
					space: {
						left: spacing,
						right: spacing,
						top: spacing,
						bottom: spacing,
					},
				}).setMinSize(slotSize, slotSize),
				{ key: "slot_" + i, padding: { top: 5, bottom: 5 } }
			);
		}

		// layout
		this.slots.layout();
	}

	createSelectionDescription() {
		return (
			new Sizer(this, {
				x: this.scale.gameSize.width - this.scale.gameSize.width / 6,
				y: this.scale.gameSize.height - this.scale.gameSize.height / 5,
				width: this.scale.gameSize.width / 15,
				orientation: "y",
				space: {
					top: 10,
					bottom: 10,
					left: 10,
					right: 10,
					item: 10,
				},
			})
				.addBackground(
					new RoundRectangle(
						this,
						0,
						0,
						0,
						0,
						10,
						ColorScheme.Black,
						0.5
					).addToDisplayList()
				)
				.add(
					new Phaser.GameObjects.Text(this, 0, 0, "", {
						fontSize: "36px",
						fontFamily: "Pix",
						color: Utility.hex.toString(ColorScheme.White),
						align: "center",
					})
						.setName("name")
						.addToDisplayList()
				)
				.add(
					new Phaser.GameObjects.Line(
						this,
						this.scale.gameSize.width / 6,
						0,
						0,
						0,
						this.scale.gameSize.width / 6,
						0,
						ColorScheme.Gray
					).addToDisplayList()
				)
				.add(
					new Phaser.GameObjects.Text(this, 0, 0, "", {
						fontSize: "28px",
						fontFamily: "Pix",
						color: Utility.hex.toString(ColorScheme.LighterGray),
						align: "center",
						wordWrap: {
							width: this.scale.gameSize.width / 4,
						},
					})
						.setName("description")
						.addToDisplayList()
				)
				.setOrigin(0.5, 0.5)
				.layout()

				// hide by default
				.setVisible(false)
		);
	}

	updateSelectionDescription(name: string, description: string) {
		// set name
		(
			this.selectionDescription.getByName(
				"name"
			) as Phaser.GameObjects.Text
		).setText(name);

		// set description
		(
			this.selectionDescription.getByName(
				"description"
			) as Phaser.GameObjects.Text
		).setText(description);

		// reset layout
		this.selectionDescription.layout();

		// show
		this.selectionDescription.setVisible(true);
	}

	createTabs(tabs: {
		[key: string]: {
			id: string;
			icon: string;
			clickCallback: () => void;
		};
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
						tabs[tabID].id === this.currentInventory
							? ColorScheme.LighterGray
							: ColorScheme.Black,
						0.5
					).addToDisplayList(),
					icon: this.add
						.image(0, 0, tabs[tabID].icon)
						.setScale(5)
						.setOrigin(0.5, 0.5),
					align: "center",
					name: tabs[tabID].id,
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
			x: this.scale.gameSize.width / 8,
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
			.on(
				"button.click",
				(button: Label) => {
					// sfx
					this.sound.play("ui_select", {
						volume: this.sceneHead.audio.sfx.volume.value,
					});

					// click callback
					tabs[button.name].clickCallback();
				},
				this
			)
			.on(
				"button.over",
				(button: Label) => {
					// sfx
					this.sound.play("ui_hover", {
						volume: this.sceneHead.audio.sfx.volume.value,
					});

					// darker background opacity and stroke
					(button.getElement("background") as RoundRectangle)
						.setStrokeStyle(2, ColorScheme.White)
						.setFillStyle(
							button.name === this.currentInventory
								? ColorScheme.LighterGray
								: ColorScheme.Black,
							0.8
						);
				},
				this
			)
			.on(
				"button.out",
				(button: Label) => {
					// normal background opacity
					(button.getElement("background") as RoundRectangle)
						.setStrokeStyle(0)
						.setFillStyle(
							button.name === this.currentInventory
								? ColorScheme.LighterGray
								: ColorScheme.Black,
							0.5
						);
				},
				this
			)
			.layout();
	}

	pause() {
		// remove listeners
		this.sceneHead.events.off(
			"input_inventory",
			this.resumePreviousScene,
			this
		);

		// core pause
		super.pause();
	}

	resume() {
		// show on resume
		this.show();

		// core resume
		super.resume();
	}

	shutdown() {
		// remove listeners
		this.sceneHead.events.off(
			"input_inventory",
			this.resumePreviousScene,
			this
		);

		// base class shutdown
		super.shutdown();
	}

	hide() {
		this.background.setVisible(false);
	}

	show() {
		this.background.setVisible(true);
	}
}
