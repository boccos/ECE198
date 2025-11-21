import { leftOn, rightOn } from './fetch/fetchLed.js'
import getAsyncCurrentPatient from "./fetch/livePatientDataFetcher.js"
import { getCurrentPatient, getLivePatient} from './currentPatient.js';
import getDisplayText from './chart/displayText.js';

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



document.getElementById('display-message').innerHTML = getDisplayText('Patient Responsiveness');

async function asyncUpdateData() {
  document.getElementById('display-message').innerHTML = getDisplayText('Patient Responsiveness');
  const patient = await getAsyncCurrentPatient();
  setDisplay(patient);
}

async function showPastData() {
  const patient = getCurrentPatient();
  setDisplay(patient);
}

function setDisplay(patient) {
  document.getElementById('display-message').innerHTML += `
  <br><br>Responses: <strong>${patient.responseTime.length}</strong><br>
  Accuracy: <strong>${patient.getCorrectPercentage()}</strong><br>
  Average Response Time: <strong>${patient.getResponseTime()}  ms</strong><br>
  Average Correct Response Time: <strong>${patient.getCorrectTime()}  ms</strong>`;
}

if (getLivePatient() === 'true') {
  asyncUpdateData();
  setInterval(() => asyncUpdateData(), 5000)
} else {
  showPastData();
}