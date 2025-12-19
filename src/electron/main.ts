import {app, BrowserWindow} from "electron"
import path from "path";

app.on("ready", () => {
    const mainWindow = new BrowserWindow({show: false});
    mainWindow.maximize();
    mainWindow.show();
    mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
})