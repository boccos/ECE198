import { getCurrentPatient } from './currentPatient.js';

const INTERVAL_MS = 5000;

const currentPatient = getCurrentPatient();

export default async function getAsyncCurrentPatient() {
  if (currentPatient == null) {
    return null;
  }
  await fetchLatest();
  return currentPatient;
}

let firstServerTs = null;

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
      if (firstServerTs === null) {
        firstServerTs = row?.serverTs;
      }
      currentPatient.updateData(row?.serverTs - firstServerTs, row?.data);
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
    currentPatient.updateData(rows?.serverTs - firstServerTs, rows?.data);
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