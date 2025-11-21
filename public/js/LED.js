import { leftOn, rightOn } from './fetch/fetchLed.js'

const leftButton = document.getElementById("left-LED-button");
const rightButton = document.getElementById("right-LED-button");
const resetButton = document.getElementById("reset-button");

disableButtons(false);

leftButton.addEventListener("click", async function () {
    leftOn();
    disableButtons(true);
});

rightButton.addEventListener("click", async function () {
    rightOn();
    disableButtons(true);
});

resetButton.addEventListener("click", async function () {
    disableButtons(false);
});

function disableButtons(flag) {
    leftButton.disabled = flag;
    rightButton.disabled = flag;
    resetButton.disabled = !flag;
}

