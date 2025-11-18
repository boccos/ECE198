import { getCurrentPatient } from '../currentPatient.js';

export default async function showChart(chart) {
  try {
    chart.data.datasets[0].data = getCurrentPatient().heartRate;
    console.log(chart.data.datasets[0].data);
    chart.update();
  } catch (err) {
    console.error("Chart display failed:", err);
  }
}