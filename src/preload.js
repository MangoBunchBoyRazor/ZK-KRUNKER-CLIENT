const { ipcRenderer } = require("electron");
let cssurls;

window.addEventListener("DOMContentLoaded", () => {
  if (document.location.href.startsWith("https://krunker.io/")) {
    ipcRenderer.send("swapFiles");
  }
});

window.prompt = importSettings = () => {
  const tempHTML = `<div class="setHed">Import Settings</div>
    <div class="settName" id="importSettings_div" style="display:block">Settings Input<input type="url" placeholder="Paste Settings Here" name="url" class="inputGrey2" id="settingString"></div>
    <a class="+" id="importBtn">Import</a>`;
  menuWindow.innerHTML = tempHTML;
  importBtn.addEventListener("click", () => {
    parseSettings(settingString.value);
  });
  parseSettings = (string) => {
    if (string) {
      try {
        const json = JSON.parse(string);
        for (const setting in json) {
          setSetting(setting, json[setting]);
          showWindow(1);
        }
      } catch (err) {
        console.error(err);
        alert("Error importing settings.");
      }
    }
  };
};

ipcRenderer.on("css-urls", (e, d) => {
  cssurls = d.urls;
  cssurls.forEach((url) => {
    const cssEl = document.createElement("link");
    cssEl.href = url;
    cssEl.rel = "stylesheet";
    document.head.appendChild(cssEl);
  });
});

//Client popup workaround from idkr
window.OffCliV = true;
