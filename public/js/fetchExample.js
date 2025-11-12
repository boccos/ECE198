const INTERVAL_MS = 5000;

const protectedEl = document.getElementById('password-protected');
const spo2El = document.getElementById('spo2');
const hrEl = document.getElementById('hr');
const statusEl = document.getElementById('status');
const idInput = document.getElementById('idInput');
const applyBtn = document.getElementById('applyPatientBtn');

const LS_KEY = 'id';
function getid() {
  return (idInput?.value || localStorage.getItem(LS_KEY) || 'p001').trim();
}
function setid(id) {
  if (idInput) idInput.value = id;
  localStorage.setItem(LS_KEY, id);
}
if (idInput) {
  const saved = localStorage.getItem(LS_KEY);
  if (saved) idInput.value = saved;
}
applyBtn?.addEventListener('click', () => setid(getid()));

async function fetchStreams() {
  const id = getid();
  try {
    // fetch the JSON array history file
    const res = await fetch(`/api/v1/patients/${encodeURIComponent(id)}/download`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json(); // <-- array of records

    if (!Array.isArray(rows) || rows.length === 0) {
      statusEl.textContent = 'No data yet';
      spo2El.textContent = hrEl.textContent = '--';
      return;
    }

    const latest = rows[rows.length - 1]; // last entry = latest
    spo2El.textContent = latest?.data?.spo2 ?? '--';
    hrEl.textContent   = latest?.data?.hr ?? '--';

    const ts = latest?.serverTs ?? latest?.ts;
    statusEl.textContent = ts ? `Updated: ${new Date(ts).toLocaleTimeString()}` : 'Updated: —';
  } catch (err) {
    console.error('History fetch failed:', err);
    statusEl.textContent = '⚠️ Waiting for data...';
    spo2El.textContent = hrEl.textContent = '--';
  }
}

function startPolling() {
  fetchStreams();
  return setInterval(fetchStreams, INTERVAL_MS);
}

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
  if (!protectedEl.hasAttribute('hidden')) pollTimer = startPolling();
}
