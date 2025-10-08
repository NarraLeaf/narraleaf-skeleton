import {Story, Scene, Character, c} from "narraleaf-react";

const c1 = new Character("Character 1");

const scene1 = new Scene("Scene 1");
scene1.action([
    c1`Hello, World!`,
    c1`This is a ${c("NarraLeaf", "blue")} story!`,

    /**
     * Continue your story here!
     * 
     * Check out the [React.NarraLeaf.com](https://react.narraleaf.com/) for story script documentation
     */
]);

const story = new Story("My Story").entry(scene1);
export {story};
