import { getCurrentPatient } from '../currentPatient.js';

export default async function showChart(chart, cmd) {
  try {
    switch (cmd) {
      case "spO2":
        chart.data.datasets[0].data = getCurrentPatient().spO2;
        break;
      case "hr":
        chart.data.datasets[0].data = getCurrentPatient().heartRate;
        break;
      case "IR":
        chart.data.datasets[0].data = getCurrentPatient().IR;
        break;
      case "acc":
        chart.data.datasets[0].data = getCurrentPatient().accel;
        break;
    }
    chart.update();
  } catch (err) {
    console.error("Chart display failed:", err);
  }
}