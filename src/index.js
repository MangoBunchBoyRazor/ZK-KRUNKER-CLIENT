//modules
require("v8-compile-cache"); //For better startup
const path = require("path");
const { app, BrowserWindow, Menu, ipcMain, globalShortcut } = require("electron");
const shortcuts = require("electron-localshortcut");
const Store = require("electron-store");
Menu.setApplicationMenu(null);
const config = new Store();
const DiscordRPC = require("discord-rpc");
const fs = require("fs");
const { dir } = require("console");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

//Performance improvements
app.commandLine.appendSwitch("force_high_performance_gpu"); //Use better gpu
app.commandLine.appendSwitch("force-high-performance-gpu"); //Use better gpu-try2
app.commandLine.appendSwitch("disable-frame-rate-limit"); //Uncap fps
app.commandLine.appendSwitch("disable-gpu-vsync"); //Uncap fps 2
app.commandLine.appendSwitch("in-process-gpu"); //Performance improve
app.commandLine.appendSwitch("ignore-gpu-blacklist"); //Performance improve

let win;

const createWindow = () => {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1120,
    height: 645,
    frame: true,
	titleBarStyle: 'hidden',
    show: false,
    icon: __dirname + "/media/icon/icon.ico",
    webPreferences: {
      nodeIntergation: true,
      preload: path.join(__dirname, "preload.js"),
      webSecurity: false,
    },
  });

 //Splash-
  splash = new BrowserWindow({width: 810, height: 610, transparent: true, frame: false, alwaysOnTop: true});
  splash.loadFile(path.join(__dirname, "splash.html"));
  //-

  //win.loadFile(path.join(__dirname, "index.html"));
    win.loadURL('https://krunker.io');
	
  if (config.get("enablePointerLockOptions", false)) {
    app.commandLine.appendSwitch("enable-pointer-lock-options");
  }
  
  let contents = win.webContents;
  shortcuts.register(win, "Escape", () =>
    contents.executeJavaScript("document.exitPointerLock()", true)
  );

   let cont2 = win.webContents;
  shortcuts.register(win, "F11", () =>
    cont2.executeJavaScript("win.setFullScreen()", true)
  );
  
  app.whenReady().then(() => {
  globalShortcut.register('F11', () => {
    win.setFullScreen(true)
  })
  globalShortcut.register('Escape', () => {
    win.setFullScreen(false)
  })
  globalShortcut.register('Escape', () => {
    document.exitPointerLock(true)
  })
})
  
  win.once("ready-to-show", () => {
    win.show();
    splash.destroy();
  });
  
}

app.allowRendererProcessReuse = true;
app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


//RPC CODE
const clientId = "826389993122562048";  

DiscordRPC.register(clientId);

const rpc = new DiscordRPC.Client({ transport: "ipc" });
const startTimestamp = new Date();

async function setActivity() {
  if (!rpc || !win) {
    setTimeout(() => {
      setActivity();
    }, 15000);

    return;
  }

  rpc.setActivity({
    details: `Choking Nukes`,
    state: "Playing on ZK Client",
    startTimestamp,
    largeImageKey: "icon_512x512",
    largeImageText: "ZK Client",
  });
}

rpc.on("ready", () => {
  setActivity();
});

rpc.login({ clientId }).catch(console.error);

//Resource Swapper
const urls = [];
const css = [];
let newPath;
const getCSSFiles = (pa) => {
  try {
    fs.readdirSync(pa, { withFileTypes: true }).forEach((dir) => {
      css.push(`${pa}/${dir.name}`);
    });
  } catch (err) {
    console.log(err);
  }
};
const recursiveSwap = (dpath) => {
  try {
    fs.readdirSync(dpath, { withFileTypes: true }).forEach((dir) => {
      if (dir.isDirectory()) {
        if (dir.name == "css") getCSSFiles(`${dpath}/${dir.name}`);
        recursiveSwap(`${dpath}/${dir.name}`);
      } else {
        newPath = `${dpath}/${dir.name}`;
        const cPath = newPath.replace(
          `${app.getPath("documents")}\\ZK-SWAP`,
          ""
        );

        if (cPath.indexOf("models") != -1 || cPath.indexOf("textures") != -1) {
          urls.push(
            `*://assets.krunker.io${cPath}*`,
            `*://assets.krunker.io${cPath}?*`
          );
        } else
          urls.push(
            `*://krunker.io${cPath}*`,
            `*://krunker.io${cPath}?*`,
            `*://comp.krunker.io${cPath}*`,
            `*://comp.krunker.io${cPath}?*`
          );
      }
    });
  } catch (err) {
    console.error(err);
  }
};

//Looking for resource swapper directory in documents
const dirPath = path.join(app.getPath("documents"), "ZK-SWAP");

if (fs.existsSync(dirPath)) {
  recursiveSwap(dirPath);
} else {
  fs.mkdirSync(dirPath);
  recursiveSwap(dirPath);
}

ipcMain.on("swapFiles", () => {
  win.webContents.send("css-urls", { urls: css });
  if (urls[0]) {
    win.webContents.session.webRequest.onBeforeRequest(
      { urls: urls },
      (details, callback) => {
        callback({
          redirectURL:
            "file:///" + path.join(dirPath, new URL(details.url).pathname),
        });
      }
    );
  }
});


