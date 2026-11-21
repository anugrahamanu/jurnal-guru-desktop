const { contextBridge } = require('electron');

try {
  contextBridge.exposeInMainWorld('isDesktopApp', true);
  contextBridge.exposeInMainWorld('desktopVersion', '1.0.0');
} catch (e) {
  window.isDesktopApp = true;
  window.desktopVersion = '1.0.0';
}
