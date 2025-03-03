import React, {useEffect} from 'react';
import {Page, useGame} from 'narraleaf-react';

// Import your assets
import "./src/base.css";
import {story} from "./src/story";

// Import your pages
import Home from "./pages/home";

const App = () => {
    // Access the game instance by using the useGame hook
    const {game} = useGame();

    useEffect(() => {
        game.configure({
            player: {
                width: 1920,
                height: 1080,
                aspectRatio: 16 / 9,
            },
            /* Add your custom configurations here */
        });
    }, []);

    return (
        <>
            {/* Place your pages here */}
            <Page id={"home"}>
                <Home />
            </Page>
        </>
    );
};

export default App;
export {story}; // Exporting the story is required

