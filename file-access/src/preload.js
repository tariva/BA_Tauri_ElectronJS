// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  require: (moduleName) => {
    // Check the module name and return only the allowed modules
    if (["fs", "path", "del", "util"].includes(moduleName)) {
      return require(moduleName);
    }
    if (moduleName === "ROOT") {
      return process.cwd();
    }
    throw new Error(`Cannot require '${moduleName}' module in renderer.`);
  },
});
