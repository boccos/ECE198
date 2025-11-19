import Patient from "./patient.js"

export default async function fetchStreamsPlus() {
  try {
    const res = await fetch(`/api/v1/patients/patientData/download`);
    if (res.status === 404) {
      console.info("[fetchStreams] No patientData.json yet, returning []");
      return [];
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      return [];
    }
    const patients = rows.map(row => new Patient(
      row?.id,
      row?.firstName,
      row?.lastName,
      row?.startTs,
      row?.endTs,
      row?.spO2,
      row?.heartRate,
      row?.IR,
      row?.accelX,
      row?.accelY,
      row?.accelZ,
      row?.responseTime,
      row?.answeredCorrectly,
    ));
    return patients;
  } catch (err) {
    console.error('History fetch failed:', err);
    return [];
  }
}