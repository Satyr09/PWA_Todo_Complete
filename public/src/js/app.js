let deferredPrompt = null;

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function() {
    navigator.serviceWorker.register("/sw.js").then(sw => {
      console.log("[App.js] Service worker registered");
    });
  });
}
window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredPrompt = e;
  console.log("[App.js] App ready to show install prompt/banner");

  return true;
});
