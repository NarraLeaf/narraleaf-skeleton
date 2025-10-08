import { useRouter } from "narraleaf-react";
import { useGamePlayback } from "narraleaf/renderer";
import { useEffect } from "react";
import { QuickMenu } from "../src/components/QuickMenu";
import { useGlobalStateConfig } from "../src/components/GlobalState";

export default function Index() {
    const router = useRouter();
    const { isPlaying } = useGamePlayback();
    const [splashScreen, setSplashScreen] = useGlobalStateConfig("isSplashScreen");

    useEffect(() => {
        // if the game is in playing, return
        if (isPlaying) { return };
        
        // if splashScreen is not played, navigate to splash-screen
        if (splashScreen) {
            router.navigate("/splash-screen");
            setSplashScreen(false);
        } else {
            router.navigate("/home");
        }

    }, [isPlaying]);

    return (
        isPlaying && <QuickMenu />
    );
}