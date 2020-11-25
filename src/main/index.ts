import { app, BrowserWindow, ipcMain } from "electron";
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
        const updateDotExe = path.resolve(
          path.dirname(process.execPath),
          "..",
          "update.exe"
        );
        const createShortcuts = `${updateDotExe} --createShortcut=${target} --shortcut-locations=Desktop,StartMenu`;
        exec(createShortcuts);

        app.quit();
        return true;
      }
      case "--squirrel-uninstall": {
        const target = path.basename(process.execPath);
        const updateDotExe = path.resolve(
          path.dirname(process.execPath),
          ".." + "update.exe"
        );
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

const CreateEventListners = () => {
  ipcMain.on("AppCallingMainEvent", async (event, data: any) => {
    console.log("AppCallingMainEvent data:", data);

    if (MainWindow !== null)
      MainWindow.webContents.send(
        "MainCallingAppEvent",
        "This is an event response"
      );
  });
};

app.on("ready", () => {
  CreateEventListners();

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
