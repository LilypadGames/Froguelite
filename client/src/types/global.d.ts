// scenes
import { Head } from "../scenes/internal/Head";

declare interface sceneData {
	sceneHead: Head;
}

declare interface overlaySceneData extends sceneData {
	scenePaused: Phaser.Scene;
}

declare interface gameSceneData extends sceneData {
	level: string;
}
