import {AppConfig} from "narraleaf";

const app = new AppConfig({
    forceSandbox: true
}).configWindows({
    // Add windows specific configurations here
}).configMac({
    // Add mac specific configurations here
}).configLinux({
    // Add linux specific configurations here
}).create();

app.onReady(() => {
    const window = app.createWindow({
        backgroundColor: "#fff",
        width: 800,
        height: 600
    });

    window.loadFile(app.getEntryFile());
    window.show();
});
