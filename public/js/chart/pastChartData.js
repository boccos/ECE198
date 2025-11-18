import { getCurrentPatient } from '../currentPatient.js';

export default async function showChart(chart) {
  try {
    chart.data.datasets[0].data = getCurrentPatient().heartRate;
    chart.update();
  } catch (err) {
    console.error("Chart display failed:", err);
  }
}