import { leftOn, rightOn } from '../fetch/fetchLed.js'
import getAsyncCurrentPatient from "../fetch/livePatientDataFetcher.js"
import { getCurrentPatient, getLivePatient} from '../currentPatient.js';
import getDisplayText from '../displayText.js';

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
  document.getElementById("display-message").innerHTML += `
    <div class="stats-container">
      <div class="stats-left">
        <p>Responses: <strong>${patient.responseTime.length}</strong></p>
        <p>Accuracy: <strong>${patient.getCorrectPercentage()}</strong></p>
      </div>

      <div class="stats-right">
        <p>Average Response Time: <strong>${patient.getResponseTime()} ms</strong></p>
        <p>Average Correct Response Time: <strong>${patient.getCorrectTime()} ms</strong></p>
      </div>
    </div>
  `;
}

if (getLivePatient() === 'true') {
  asyncUpdateData();
  setInterval(() => asyncUpdateData(), 5000)
} else {
  showPastData();
}