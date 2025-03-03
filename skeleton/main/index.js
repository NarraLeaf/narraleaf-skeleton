import {AppConfig} from "narraleaf";

// Create a new app
const app = new AppConfig({
  forceSandbox: true
}).create();

// When the app is ready, launch the app with a window
app.onReady(async () => {
  // Launch the app with a window
  const window = await app.launchApp({
    backgroundColor: "black",
    width: 800,
    height: 600
  });

  // Close the app when the window is closed
  window.onClosed(() => {
    app.quit();
  });
});
