const { ipcRenderer } = require("electron");

//#region *** Custom Import Settings Menu ***
window.prompt = importSettings = () => {
  // *** Set The Inner HTML ***

  var tempHTML = `<div class="setHed">Import Settings</div>
    <div class="settName" id="importSettings_div" style="display:block">Settings String<input type="url" placeholder="Paste Settings String Here" name="url" class="inputGrey2" id="settingString"></div>
    <a class="+" id="importBtn">Import</a>`;
  win.innerHTML = tempHTML;
  importBtn.addEventListener("click", () => {
    parseSettings(settingString.value);
  });

  // *** Parse Settings ***

  parseSettings = (string) => {
    if (string) {
      try {
        var json = JSON.parse(string);
        for (var setting in json) {
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



let cssurls;
window.addEventListener("DOMContentLoaded", () => {
  if (document.location.href.startsWith("https://krunker.io/")) {
    ipcRenderer.send("swapFiles");
  }
});


ipcRenderer.on("css-urls", (e, d) => {
  cssurls = d.urls;
  cssurls.forEach((url) => {
    const cssEl = document.createElement("link");
    cssEl.href = url;
    cssEl.rel = "stylesheet";
    document.head.appendChild(cssEl);
  });
});

//popup workaround 
window.OffCliV = true;
//



