import { KeyBindingType, useGame } from 'narraleaf-react';
import React, { useEffect } from 'react';
import { GameMetadata, requestMain } from 'narraleaf/renderer';

// Import core assets and components
import "./src/base.css";
import { scene1, story } from "./src/story";
import { GameDialog } from './src/components/Dialog';
import { DefaultMenu } from './src/components/Menu';
import { GlobalStateConfigProvider } from './src/components/GlobalState';
import GameNotification from './src/components/Notifications';

// Import settings and plugin components
import { GamePreferences } from './pages/home/settings';
import { createPreloadEntryPlugin } from './src/plugins';

// Main App component that initializes game configuration and plugins
const App = ({ children }: { children: React.ReactNode }) => {
    // Access the game instance by using the useGame hook
    const game = useGame();
    
    // Initialize game configuration and preferences
    useEffect(() => {
        requestMain<void, GamePreferences>("getGamePreferences").then((preferences) => {
            // Import player preferences from main process
            game.preference.importPreferences(preferences.playerPreferences);

            // Configure game settings and components
            game.configure({
                // Display resolution settings
                width: 1280, // set the resolution width
                height: 720, // set the resolution height
                aspectRatio: 16 / 9, // set the aspect ratio
                dialogWidth: 1280,
                dialogHeight: 720,

                // Game behavior configuration
                ratioUpdateInterval: 0, // disable the ratio update interval
                screenshotQuality: 0.2,

                // UI component customization
                dialog: GameDialog,
                notification: GameNotification,
                menu: DefaultMenu,
                defaultTextColor: "white",
                defaultNametagColor: "#40a8c5",
                fontSize: 20,
                fontWeight: 500,
            });

            // Configure keyboard shortcuts
            game.keyMap.addKeyBinding(KeyBindingType.skipAction, "Control");
        });
    }, []);

    // Initialize preload plugin for scene management
    useEffect(() => {
        const plugin = createPreloadEntryPlugin(scene1);
        game.use(plugin);
    }, []);

    return (
        <GlobalStateConfigProvider>
            {children}
        </GlobalStateConfigProvider>
    );
};

export default App;

// Export game metadata for the Narraleaf framework
export const metadata: GameMetadata = {
    story,
};

