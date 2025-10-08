import {IGamePluginRegistry, LiveGameEventToken, Scene} from "narraleaf-react";

// Plugin factory function to create a preload entry plugin
export function createPreloadEntryPlugin(entry: Scene): IGamePluginRegistry {
    let tokens: LiveGameEventToken[] = [];
    return {
        name: "app:preload-entry",
        register(game) {
            // Hook into game initialization to preload the entry scene
            tokens.push(game.hooks.hook("init", () => {
                if (!game.getLiveGame().getGameState()) {
                    console.warn("Game state is not found");
                }
                game.getLiveGame().getGameState()?.preloadScene(entry);
            }));
        },
        unregister() {
            // Clean up all registered tokens when plugin is unregistered
            tokens.forEach((token) => {
                token.cancel();
            });
        }
    };
}
