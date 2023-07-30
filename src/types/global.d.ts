// scenes
import { Head } from "../scenes/internal/Head";

declare global {
	interface sceneData {
		sceneHead: Head;
	}

	// overlays
	interface overlaySceneData extends sceneData {
		scenePaused: Phaser.Scene;
	}

	interface inventorySceneData extends overlaySceneData {
		inventory?: string;
	}

	// main scenes
	interface gameSceneData extends sceneData {
		level: string;
	}

	// player
	interface playerStats {
		health: number;
		healthMax: number;
		speed: number;
		fireRate?: number;
	}

	interface playerDetails {
		healthbar?: {
			scale: number;
			width: number;
		};
		boss?: boolean;
	}

	interface playerEquipped {
		spell: string;
		armor?: string;
	}

	interface playerInventory {
		spells: string[];
		armors: string[];
	}
}
