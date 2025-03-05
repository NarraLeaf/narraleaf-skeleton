import React, {useEffect} from 'react';
import {useGame} from 'narraleaf-react';

// Import your assets
import "./src/base.css";
import {story} from "./src/story";

const App = ({children}: {children: React.ReactNode}) => {
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
            {children}
        </>
    );
};

export default App;
export {story}; // Exporting the story is required

