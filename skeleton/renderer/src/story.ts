import {Story, Scene} from "narraleaf-react";

const story = new Story("My Story");
const scene1 = new Scene("Scene 1");

story.entry(scene1);

export {story};
