import updateLiveChart from "./liveChartData.js";
import showPastChart from "./pastChartData.js";
import { getLivePatient } from '../currentPatient.js';
import getDisplayText from './displayText.js';

document.getElementById('display-message').innerHTML = getDisplayText('Heart-Rate');

let chart = new Chart(document.getElementById("chart"), {
  type: "line",
  data: {
    datasets: [{
      label: "Heart Rate",
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
          text: "Heart Rate",
        },
      }
    }
  }
});

if (getLivePatient() === 'true') {
  updateLiveChart(chart, "hr");
} else {
  showPastChart(chart, "hr");
}