import Patient from "./patient.js"

export default async function fetchStreams() {
  try {
    const res = await fetch(`/api/v1/patients/patientData/download`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      return;
    }
    const patients = rows.map(row => new Patient(row?.id,
      row?.firstName,
      row?.lastName,
      row?.data?.spO2,
      row?.data?.heartRate,
      row?.data?.IR,
      row?.data?.accelX,
      row?.data?.accelY,
      row?.data?.accelZ,
      row?.data?.responseTime,
      row?.data?.answeredCorrectly,
    ));
    console.log(patients);
    return patients;
  } catch (err) {
    console.error('History fetch failed:', err);
  }
}