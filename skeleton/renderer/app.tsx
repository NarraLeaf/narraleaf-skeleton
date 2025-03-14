import React, {useEffect} from 'react';
import {useGame} from 'narraleaf-react';
import {Meta, SplashScreenDefinition} from 'narraleaf/client';

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

const splashScreen: SplashScreenDefinition[] = [{
    initial: {opacity: 0},
    animate: {opacity: 1, transition: {duration: 2}}, // enter in 2 seconds
    exit: {opacity: 0, transition: {duration: 1}}, // exit in 1 second
    duration: 3, // stay for 3 seconds
    splashScreen:(
        <div className={"splash-screen"}>
            <div><p className={"splash-text"}>Created with NarraLeaf</p></div>
        </div>
    )
}];

export default App;
export const meta: Meta = {
    story,
    splashScreen
};

