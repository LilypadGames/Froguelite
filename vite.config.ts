import path from "node:path";
import { defineConfig } from "vite";
import replace from "@rollup/plugin-replace";

// https://vitejs.dev/config/
export default defineConfig(async () => ({
	// Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
	// prevent vite from obscuring rust errors
	clearScreen: false,
	// tauri expects a fixed port, fail if that port is not available
	server: {
		port: 5500,
		strictPort: true,
	},
	// to make use of `TAURI_DEBUG` and other env variables
	// https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
	envPrefix: ["VITE_", "TAURI_"],
	// point to root of files
	root: "src",
	// asset folder
	publicDir: "assets",
	build: {
		// Tauri supports es2021
		target:
			process.env.TAURI_PLATFORM == "windows" ? "chrome105" : "safari13",
		// don't minify for debug builds
		minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
		// produce sourcemaps for debug builds
		sourcemap: !!process.env.TAURI_DEBUG,
		// specify build dir
		outDir: "dist",
		rollupOptions: {
			plugins: [
				//  Toggle the booleans here to enable / disable Phaser 3 features:
				replace({
					"typeof CANVAS_RENDERER": "'true'",
					"typeof WEBGL_RENDERER": "'true'",
					"typeof EXPERIMENTAL": "'true'",
					"typeof PLUGIN_CAMERA3D": "'false'",
					"typeof PLUGIN_FBINSTANT": "'false'",
					"typeof FEATURE_SOUND": "'true'",
				}),
			],
		},
	},
	// remap source folder
	resolve: {
		alias: { src: path.resolve(process.cwd(), "src") },
	},
}));
