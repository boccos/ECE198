import getAsyncCurrentPatient from "../liveFetcher.js"
import { getCurrentPatient } from '../currentPatient.js';

document.getElementById('patient-heartrate-message').textContent = 
`The heart rate data of ${getCurrentPatient().getFullName()} from 
${new Date(getCurrentPatient().getStartTs()).toLocaleString()} to 
${new Date(getCurrentPatient().getEndTs()).toLocaleString()} is currently being displayed below.`;

let chart = new Chart(document.getElementById("liveGraphData"), {
  type: "line",
  data: {
    datasets: [{
      label: "Heart Rate",
      data: [], // will hold {x, y} objects
      borderColor: "red",
      fill: false,
    }]
  },
  options: {
    responsive: true,
    animation: false,
    scales: {
      x: {
        type: "linear", // or "time" if x is a timestamp
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

async function updateChart() {
  try {
    const patient = await getAsyncCurrentPatient();
    chart.data.datasets[0].data = patient.heartRate; // assuming patient.heartRate exists
    chart.update();
    // console.log(JSON.stringify(patient));
  } catch (err) {
    console.error("Chart update failed:", err);
  }
}

// Initial update
updateChart();

// Update every 5 seconds
setInterval(updateChart, 5000);