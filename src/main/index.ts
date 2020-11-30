import { app, BrowserWindow, ipcMain, Menu } from "electron";
import * as path from "path";
import { exec } from "child_process";

declare const MAIN_WINDOW_WEBPACK_ENTRY: any;

//Handle creating/removing shortcuts on Windows when installing/uninstalling.
const HandleStartupEvent = () => {
	if (require("electron-squirrel-startup")) {
		//eslint-disable-line global-require
		if (process.platform !== "win32") {
			app.quit();
			return false;
		}

		const squirrelCommand = process.argv[1];
		switch (squirrelCommand) {
			case "--squirrel-install":
			case "--squirrel-updated": {
				const target = path.basename(process.execPath);
				const updateDotExe = path.resolve(path.dirname(process.execPath), "..", "update.exe");
				const createShortcuts = `${updateDotExe} --createShortcut=${target} --shortcut-locations=Desktop,StartMenu`;
				exec(createShortcuts);

				app.quit();
				return true;
			}
			case "--squirrel-uninstall": {
				const target = path.basename(process.execPath);
				const updateDotExe = path.resolve(path.dirname(process.execPath), ".." + "update.exe");
				const createShortcuts = `${updateDotExe} --removeShortcut=${target}`;
				exec(createShortcuts);

				//Add code to delete app data
				/*
					CODE
				*/

				app.quit();
				return true;
			}
		}
	}
};

HandleStartupEvent();

let MainWindow: BrowserWindow = null;

const CreateEventListners = () => {
	ipcMain.on("AppCallingMainEvent", async (event, data: any) => {
		console.log("AppCallingMainEvent data:", data);

		if (MainWindow !== null)
			MainWindow.webContents.send("MainCallingAppEvent", "This is an event response");
	});
};

const CreateWindow = (): void => {
	if (MainWindow === null) {
		MainWindow = new BrowserWindow({
			width: 1200,
			height: 900,
			webPreferences: {
				nodeIntegration: true,
				webSecurity: true,
			},
		});

		MainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY); //Load index.html

		MainWindow.webContents.openDevTools(); //Open dev tools
	}
};

const CreateMenu = () => {
	const isMac = process.platform === "darwin";

	//Menu item docs: https://www.electronjs.org/docs/api/menu-item
	const template = [
		...(isMac ? [{
			label: app.name,
			submenu: [
				{ role: "about" },
				{ type: "separator" },
				{ role: "services" },
				{ type: "separator" },
				{ role: "hide" },
				{ role: "hideothers" },
				{ role: "unhide" },
				{ type: "separator" },
				{ role: "quit" }
			]
		}] : []),
		{
			label: "File",
			submenu: [
				isMac ? { role: "close" } : { role: "quit" }
			]
		},
		{
			label: "Edit",
			submenu: [
				{ role: "undo" },
				{ role: "redo" },
				{ type: "separator" },
				{ role: "cut" },
				{ role: "copy" },
				{ role: "paste" },
				{ type: "separator" },
				{
					label: "Custom button",
					click: async () => {
						console.log("Custom button");
					}
				}
			]
		},
		{
			label: "Window",
			submenu: [
				{ role: "minimize" },
				{ role: "zoom" },
				...(isMac
					?
					[
						{ type: "separator" },
						{ role: "front" },
						{ type: "separator" },
						{ role: "window" }
					]
					:
					[
						{ role: "close" }
					]
				)
			]
		},
		{
			role: "help",
			submenu: [
				{
					label: "Learn More",
					click: async () => {
						const { shell } = require("electron")
						await shell.openExternal("https://electronjs.org")
					}
				}
			]
		}
	] as Electron.MenuItemConstructorOptions[];

	const NewMenu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(NewMenu);
};

app.on("ready", () => {
	CreateEventListners();

	CreateMenu();

	CreateWindow();
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

/*
app.on("activate", () => {
	//On OS X it's common to re-create a window in the app when the dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) {
		CreateWindow();
	}
});
*/
