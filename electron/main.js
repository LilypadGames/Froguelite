// Modules to control application life and create native browser window
const { app, BrowserWindow } = require("electron");
const path = require("path");
const url = require("url");

require("@electron/remote/main").initialize();

process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";

// determine environment
let environment;
if (app.isPackaged) environment = "production";
else environment = process.env.NODE_ENV;

// open app
const createWindow = () => {
	// create renderer
	const mainWindow = new BrowserWindow({
		width: 1920,
		height: 1080,
		webPreferences: {
			nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
			contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
			enableRemoteModule: true,
			preload: path.join(__dirname, "preload.js"),
		},
	});

	// show menu bar dependent on mode
	mainWindow.setMenuBarVisibility(
		environment === "development" || environment === "dev preview"
	);

	// determine file path dependent on mode
	let filePath;
	if (environment === "production")
		filePath = url.format({
			pathname: path.join(__dirname, "./app/index.html"),
			protocol: "file:",
			slashes: true,
		});
	else if (environment === "preview" || environment === "dev preview")
		filePath = url.format({
			pathname: path.join(__dirname, "../electron/app/index.html"),
			protocol: "file:",
			slashes: true,
		});
	else if (environment === "development") filePath = "http://localhost:3000";

	// load the index.html of the app
	mainWindow.loadURL(filePath);

	// open devtools if in development mode
	if (environment === "development" || environment === "dev preview")
		mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	createWindow();

	app.on("activate", () => {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
