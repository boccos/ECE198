import {leftOn, rightOn} from './fetch/fetchLed.js'

const leftButton = document.getElementById("left-LED-button");
const rightButton = document.getElementById("right-LED-button");

leftButton.addEventListener("click", async function () {
    leftOn();
});

rightButton.addEventListener("click", async function () {
    rightOn();
});
