// renderer/src/story.ts

// First, import the necessary classes
import { Story, Scene, Character, Image, Menu, Transform, c, b } from "narraleaf-react";

// Create a new story
// The name of the story is human-readable and is used for debugging purposes
const story = new Story("My First NarraLeaf Story");

// Create a new scene
// The name of the scene should be unique and is used for debugging purposes
const scene1 = new Scene("scene 1: hello world", {
    background: "#eaeaef",
});

// then let's create a "character" with image
const character1 = new Character("Narra");
const character1Image = new Image({
    src: "/static/img/char/narra.png",
    position: {
        xalign: 0.5,
        yalign: 0.4,
    },
    zoom: 0.6
});

// Add actions to the scene
scene1.action([
    // Show the image for 1 second
    character1Image.show({ duration: 1000 }),

    // apply an animation to the image
    character1Image.transform(
        Transform.create()
            .position({ yoffset: -30 })
            .commit({ duration: 300, ease: "easeInOut" })
            .position({ yoffset: 0 })
            .commit({ duration: 300, ease: "easeInOut" })
    ),

    // Narrate something
    "I am Narrator. I will be your guide through this story.",

    // Say something
    character1
        .say`Hello, world!`
        .say`This is my first NarraLeaf story.`
        .say`Start editing ${b(c("renderer/src/story.ts", "blue"))} and enjoy the journey!`,

    Menu.prompt("Start the journey")
        .choose("Yes I will!", [
            // Short-hand for character1.say`Great! Let's start the journey!`
            character1`Great! Let's start the journey!`
        ])
        .choose(c("No, I'm going to check the documentation", "#d9dce3"), [
            character1`Sure! Take your time!`
        ])
]);

// Add the scene to the story
story.entry(scene1);

export { story, scene1 };