import { getCurrentPatient, setCurrentPatient} from './currentPatient.js';

const INTERVAL_MS = 5000;

const currentPatient = getCurrentPatient();
currentPatient.clearData();

export default async function getAsyncCurrentPatient() {
  if (currentPatient == null) {
    return null;
  }
  await fetchLatest();
  setCurrentPatient(currentPatient, true);
  return currentPatient;
}

let isFetching = false;

async function fetchStreams() {
  try {
    const res = await fetch(`/api/v1/patients/p001/download`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      return;
    }
    for (const row of rows) {
      currentPatient.updateData(row?.serverTs, row?.data);
    }
  } catch (err) {
    console.error('History fetch failed:', err);
  }
}

async function fetchLatest() {
  if (isFetching) return;
  isFetching = true;
  
  try {
    const res = await fetch(`/api/v1/patients/p001/latest`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();
    currentPatient.updateData(rows?.serverTs, rows?.data);
  } catch (err) {
    console.error('Live fetch failed:', err);
  } finally {
    isFetching = false;
  }
}

if (currentPatient != null) {
  fetchStreams();
  fetchLatest();
  setInterval(fetchLatest, INTERVAL_MS);
}