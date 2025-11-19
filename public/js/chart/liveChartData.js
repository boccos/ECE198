import getAsyncCurrentPatient from "../fetch/livePatientDataFetcher.js"

async function asyncUpdateChart(chart, cmd) {
  try {
    const patient = await getAsyncCurrentPatient();
    switch (cmd) {
      case "spO2":
        chart.data.datasets[0].data = patient.spO2;
        break;
      case "hr":
        chart.data.datasets[0].data = patient.heartRate;
        break;
      case "IR":
        chart.data.datasets[0].data = patient.IR;
        break;
      case "acc":
        chart.data.datasets[0].data = patient.accel;
        break;
    }
    chart.update();
  } catch (err) {
    console.error("Chart update failed:", err);
  }
}

export default function updateChart(chart, cmd) {
  asyncUpdateChart(chart, cmd);
  setInterval(() => asyncUpdateChart(chart, cmd), 5000)
}