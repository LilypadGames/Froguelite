// scenes
import { Head } from "../scenes/internal/Head";

declare interface sceneData {
	sceneHead: Head;
}

// overlays
declare interface overlaySceneData extends sceneData {
	scenePaused: Phaser.Scene;
}

declare interface inventorySceneData extends overlaySceneData {
	inventory?: string;
}

// main scenes
declare interface gameSceneData extends sceneData {
	level: string;
}
