import { AppConfig } from "narraleaf";

// Define window state type for IPC communication
type WindowState = {
    mode: "fullscreen" | "windowed";
};

// Define game preferences structure for persistent storage
type GamePreferences = {
    windowMode: "fullscreen" | "windowed";
    playerPreferences: Record<string, any>;
};

// Initialize NarraLeaf application with sandbox mode enabled
const app = new AppConfig({
    forceSandbox: true
}).configWindows({
    appIcon: "main/assets/app-icon.ico"
}).create();

// Main application initialization when ready
app.onReady(async () => {
    console.log(app.getEntryFile());
    
    // Create main application window with default settings
    const window = await app.launchApp({
        options: {
            backgroundColor: "white",
            width: 1280,
            height: 720,
        }
    });
    window.setTitle("My NarraLeaf App");

    // Handle window close event to properly quit the application
    window.onClose(() => {
        app.quit();
    });

    // Enable F12 key to toggle developer tools
    window.onKeyUp("F12", () => {
        window.toggleDevTools();
    });

    // Initialize persistent storage for game preferences
    const preferenceStore = app.createJsonStore<GamePreferences>("game_preferences");
    const initValue = await preferenceStore.read();
    
    // Apply saved window mode on startup
    if (initValue.windowMode === "fullscreen") {
        window.enterFullScreen();
    } else {
        window.exitFullScreen();
    }

    // IPC handlers for renderer-main communication
    // Save game preferences to persistent storage
    window.handleUserEvent<GamePreferences, void>("setGamePreferences", async (preferences) => {
        await preferenceStore.write(preferences);
    });
    
    // Retrieve game preferences from persistent storage
    window.handleUserEvent<void, GamePreferences>("getGamePreferences", async () => {
        return await preferenceStore.read();
    });
    
    // Get current window state for renderer
    window.handleUserEvent<void, WindowState>("getWindowState", async () => {
        return {
            mode: (await preferenceStore.read()).windowMode,
        };
    });
    
    // Set window state and apply changes
    window.handleUserEvent<WindowState, void>("setWindowState", async (state) => {
        if (state.mode === "fullscreen") {
            window.enterFullScreen();
        } else {
            window.exitFullScreen();
        }
    });
});
