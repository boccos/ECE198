import getAsyncCurrentPatient from "../livePatientDataFetcher.js"

async function asyncUpdateChart(chart) {
  try {
    const patient = await getAsyncCurrentPatient();
    chart.data.datasets[0].data = patient.heartRate;
    chart.update();
  } catch (err) {
    console.error("Chart update failed:", err);
  }
}

export default function updateChart(chart) {
  asyncUpdateChart(chart);
  setInterval(() => asyncUpdateChart(chart), 5000)
}