import { NarraLeafLogo } from "./NarraLeafLogo";

export const splashScreen = [{
    initial: {opacity: 0, scale: 0.95},
    animate: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 3,
            ease: "easeOut"
        }
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        transition: {
            duration: 0.5,
            ease: "circInOut"
        }
    },
    duration: 3,
    splashScreen:(
        <div className="flex justify-center items-center w-full h-full min-w-screen min-h-screen text-black overflow-hidden">
            <div className="transform transition-all">
                <NarraLeafLogo />
            </div>
        </div>
    )
}];
