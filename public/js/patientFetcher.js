import Patient from "./patient.js"

export default async function fetchStreams() {
  try {
    const res = await fetch(`/api/v1/patients/patientData/download`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      return;
    }
    const patients = rows.map(row => new Patient(
      row?.id,
      row?.firstName,
      row?.lastName,
      row?.startTs,
      row?.endTs,
      row?.data?.spo2,
      row?.data?.hr,
      row?.data?.IR,
      row?.data?.accel_x,
      row?.data?.accel_y,
      row?.data?.accel_z,
      row?.data?.response_time,
      row?.data?.answered_correctly,
    ));
    return patients;
  } catch (err) {
    console.error('History fetch failed:', err);
  }
}