// public/js/fetch.js
const INTERVAL_MS = 5000;

// Elements
const protectedEl = document.getElementById('password-protected');
const spo2El = document.getElementById('spo2');
const hrEl = document.getElementById('hr');
const statusEl = document.getElementById('status');
const patientIdInput = document.getElementById('patientIdInput');
const applyBtn = document.getElementById('applyPatientBtn');

// Persist patient choice
const LS_KEY = 'patientId';
function getPatientId() {
  return (patientIdInput?.value || localStorage.getItem(LS_KEY) || 'p001').trim();
}
function setPatientId(id) {
  if (patientIdInput) patientIdInput.value = id;
  localStorage.setItem(LS_KEY, id);
}
if (patientIdInput) {
  const saved = localStorage.getItem(LS_KEY);
  if (saved) patientIdInput.value = saved;
}
applyBtn?.addEventListener('click', () => setPatientId(getPatientId()));

// Fetch latest from backend
async function fetchLatest() {
  const id = getPatientId();
  try {
    const res = await fetch(`/api/v1/patients/${encodeURIComponent(id)}/latest`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    // Update UI
    spo2El.textContent = json?.data?.spo2 ?? '--';
    hrEl.textContent = json?.data?.hr ?? '--';
    const ts = json?.serverTs ?? json?.ts;
    statusEl.textContent = ts ? `Updated: ${new Date(ts).toLocaleTimeString()}` : 'Updated: —';
  } catch (err) {
    console.error('Latest fetch failed:', err);
    statusEl.textContent = '⚠️ Waiting for data...';
    spo2El.textContent = '--';
    hrEl.textContent = '--';
  }
}

// Only poll when the protected section is visible (after login)
function startPolling() {
  fetchLatest();
  return setInterval(fetchLatest, INTERVAL_MS);
}

// Observe visibility toggling by your login script
let pollTimer = null;
const obs = new MutationObserver(() => {
  const visible = protectedEl && !protectedEl.hasAttribute('hidden');
  if (visible && !pollTimer) {
    pollTimer = startPolling();
  } else if (!visible && pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
});
if (protectedEl) {
  obs.observe(protectedEl, { attributes: true, attributeFilter: ['hidden'] });
  // In case it's already visible on load:
  if (!protectedEl.hasAttribute('hidden')) pollTimer = startPolling();
}
