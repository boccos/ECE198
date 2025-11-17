import getCurrentPatient from "./liveFetcher.js"

let chart = new Chart(document.getElementById("testGraphData"), {
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
    const patient = await getCurrentPatient();
    chart.data.datasets[0].data = patient.heartRate; // assuming patient.heartRate exists
    chart.update();
  } catch (err) {
    console.error("Chart update failed:", err);
  }
}

// Initial update
updateChart();

// Update every 5 seconds
setInterval(updateChart, 5000);