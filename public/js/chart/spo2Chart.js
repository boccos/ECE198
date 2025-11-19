import updateLiveChart from "./liveChartData.js";
import showPastChart from "./pastChartData.js";
import { getLivePatient } from '../currentPatient.js';
import getDisplayText from './displayText.js';

document.getElementById('display-message').innerHTML = getDisplayText('Blood Oxygen Level');

let chart = new Chart(document.getElementById("chart"), {
  type: "line",
  data: {
    datasets: [{
      label: "spo2",
      data: [],
      borderColor: "red",
      fill: false,
    }]
  },
  options: {
    responsive: true,
    animation: false,
    scales: {
      x: {
        type: "linear",
        title: {
          display: true,
          text: "Time",
        },
      },
      y: {
        title: {
          display: true,
          text: "spo2",
        },
      }
    }
  }
});

if (getLivePatient() === 'true') {
  updateLiveChart(chart, "spO2");
} else {
  showPastChart(chart, "spO2");
}