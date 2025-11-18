import updateLiveChart from "./liveChartData.js";
import showPastChart from "./pastChartData.js";
import { getCurrentPatient, getLivePatient} from '../currentPatient.js';

document.getElementById('patient-heartrate-message').textContent = 
`The heart rate data of ${getCurrentPatient().getFullName()} from 
${new Date(getCurrentPatient().getStartTs()).toLocaleString()} to 
${new Date(getCurrentPatient().getEndTs()).toLocaleString()} is currently being displayed below.`;

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
  updateLiveChart(chart);
} else {
  showPastChart(chart);
}