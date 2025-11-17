import Patient from "./patient.js"

const INTERVAL_MS = 5000;


const currentPatient = new Patient(
  -1,
  "",
  "",
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  []
);

export default async function getCurrentPatient() {
  await fetchLatest();
  return currentPatient;
}

let firstServerTs = null;

let isFetching = false;

async function fetchLatest() {
  if (isFetching) return;
  isFetching = true;

  try {
    const res = await fetch(`/api/v1/patients/p001/latest`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();
    if (firstServerTs === null) {
      firstServerTs = rows?.serverTs;
    }
    currentPatient.updateData(rows?.serverTs - firstServerTs, rows?.data);
  } catch (err) {
    console.error('Live fetch failed:', err);
  } finally {
    isFetching = false;
  }
}

fetchLatest();
setInterval(fetchLatest, INTERVAL_MS);