// server.js
require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const fssync = require('fs');

// ---------------------------------------------------------
// Config / Constants
// ---------------------------------------------------------

// TESTING FLAG:
// - For TESTING with mock data:  set ENABLE_MOCK_INGEST=true  in .env
// - For REAL IMPLEMENTATION:     set ENABLE_MOCK_INGEST=false (or remove it)
const ENABLE_MOCK_INGEST = process.env.ENABLE_MOCK_INGEST === 'true';

const PORT = process.env.PORT || 3000;
const API_TOKEN = 'banana' || process.env.INGEST_TOKEN; // change in prod

const app = express();
app.use(express.json({ limit: '200kb' }));
app.use(express.static(path.resolve(__dirname, 'public')));

// --- paths ---
const DATA_DIR = path.resolve(__dirname, 'data');
const STREAMS_DIR = path.join(DATA_DIR, 'streams');
const LATEST_DIR = path.join(DATA_DIR, 'latest');
const STREAMS_PLUS_DIR = path.join(DATA_DIR, 'streams+');   // holds all past sessions
const SESSION_FILE = path.join(DATA_DIR, 'session.json');   // stores session active/inactive

// ---- auth helpers (allow header OR body-provided API_KEY) ----
const TOKEN_STR = process.env.INGEST_TOKENS || process.env.INGEST_TOKEN || 'banana';
const TOKENS = TOKEN_STR.split(',').map(s => s.trim()).filter(Boolean);

// ---------------------------------------------------------
// Directory / File Helpers
// ---------------------------------------------------------

// ensure folders exist
async function ensureDirs() {
  await fs.mkdir(STREAMS_DIR, { recursive: true });
  await fs.mkdir(LATEST_DIR, { recursive: true });
  await fs.mkdir(STREAMS_PLUS_DIR, { recursive: true });
}

// clear all files in a directory (but keep the directory itself)
async function clearDir(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    await Promise.all(
      entries.map(entry =>
        fs.rm(path.join(dirPath, entry.name), { recursive: true, force: true })
      )
    );
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
}

async function readJsonArray(filePath) {
  try {
    const txt = await fs.readFile(filePath, 'utf-8');
    const arr = JSON.parse(txt);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function appendToHistoryJson(filePath, record, maxLen = 0) {
  const arr = await readJsonArray(filePath);
  arr.push(record);
  if (maxLen > 0 && arr.length > maxLen) {
    arr.splice(0, arr.length - maxLen);
  }
  await fs.writeFile(filePath, JSON.stringify(arr, null, 2), 'utf-8');
}

// ---------------------------------------------------------
// Session State Helpers
// ---------------------------------------------------------

async function getSessionActive() {
  try {
    const txt = await fs.readFile(SESSION_FILE, 'utf-8');
    const obj = JSON.parse(txt);
    return !!obj.active;
  } catch {
    // default: no active session until Begin Session is pressed
    return false;
  }
}

async function setSessionActive(active) {
  await fs.writeFile(
    SESSION_FILE,
    JSON.stringify(
      {
        active: !!active,
        updatedAt: new Date().toISOString()
      },
      null,
      2
    ),
    'utf-8'
  );
}

// copy / append everything from streams → streams+ (used on End Session)
async function appendSessionToStreamsPlus() {
  await ensureDirs();
  const files = await fs.readdir(STREAMS_DIR);

  for (const file of files) {
    if (!file.endsWith('.json')) continue;

    const srcPath = path.join(STREAMS_DIR, file);
    const destPath = path.join(STREAMS_PLUS_DIR, file);

    const sessionRecords = await readJsonArray(srcPath);
    if (!sessionRecords.length) continue;

    const existing = await readJsonArray(destPath);
    existing.push(...sessionRecords);

    await fs.writeFile(destPath, JSON.stringify(existing, null, 2), 'utf-8');
  }
}

// ---------------------------------------------------------
// Central Write Logic (used by BOTH testing + real ingestion)
// ---------------------------------------------------------

async function writeRecordToFiles(record) {
  await ensureDirs();

  const sessionActive = await getSessionActive();
  if (!sessionActive) {
    console.log('writeRecordToFiles: session NOT active, skipping write');   // <-- key log
    return;
  }

  console.log('writeRecordToFiles: writing record for', record.patientId);   // <-- key log

  // history stream (current session only)
  const streamPath = path.join(STREAMS_DIR, `${record.patientId}.json`);
  await appendToHistoryJson(streamPath, record, 0); // 0 = no cap

  // latest snapshot (overwritten each time)
  const latestPath = path.join(LATEST_DIR, `${record.patientId}.json`);
  await fs.writeFile(latestPath, JSON.stringify(record, null, 2), 'utf-8');
}


// ---------------------------------------------------------
// Auth
// ---------------------------------------------------------

function extractApiKey(req) {
  // prefer header; fall back to body.API_KEY for ESP payloads
  return req.header('x-api-key') || (req.body && req.body.API_KEY);
}

function authorized(req, res) {
  const key = extractApiKey(req);
  if (!key || !TOKENS.includes(String(key))) {
    res.status(401).json({ ok: false, error: 'unauthorized' });
    return false;
  }
  return true;
}

// ---------------------------------------------------------
// Routes
// ---------------------------------------------------------

// healthcheck
app.get('/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// ---------------------------------------------------------
// Session control (Begin / End)
// ---------------------------------------------------------

// Begin Session:
// - clears streams and latest
// - marks session as active
app.post('/api/v1/session/begin', async (req, res) => {
  console.log('SESSION BEGIN hit, x-api-key =', extractApiKey(req));   // <-- add this

  if (!authorized(req, res)) {
    console.log('SESSION BEGIN: unauthorized');                        // <-- add this
    return;
  }

  try {
    await ensureDirs();
    await clearDir(STREAMS_DIR);
    await clearDir(LATEST_DIR);
    await setSessionActive(true);

    console.log('SESSION BEGIN: sessionActive set to true');           // <-- add this

    res.json({ ok: true, sessionActive: true });
  } catch (err) {
    console.error('Begin session failed:', err);
    res.status(500).json({ ok: false, error: 'server_error' });
  }
});


// End Session:
// - appends the whole current session (streams) into streams+
// - clears streams and latest
// - marks session as inactive
// - after this, ingest writes are ignored until Begin Session again
app.post('/api/v1/session/end', async (req, res) => {
  console.log('SESSION END hit, x-api-key =', extractApiKey(req));     // <-- add

  if (!authorized(req, res)) {
    console.log('SESSION END: unauthorized');                          // <-- add
    return;
  }

  try {
    await ensureDirs();
    await appendSessionToStreamsPlus();
    await clearDir(STREAMS_DIR);
    await clearDir(LATEST_DIR);
    await setSessionActive(false);

    console.log('SESSION END: sessionActive set to false');            // <-- add

    res.json({ ok: true, sessionActive: false });
  } catch (err) {
    console.error('End session failed:', err);
    res.status(500).json({ ok: false, error: 'server_error' });
  }
});


// ---------------------------------------------------------
// Ingest Endpoint (REAL IMPLEMENTATION used in BOTH modes)
// ---------------------------------------------------------

app.post('/api/v1/ingest', async (req, res) => {
  if (!authorized(req, res)) return;

  // We accept two shapes:
  // (1) "server native" → { patientId, sensor, data: {...}, ts? }
  // (2) "ESP native"    → { API_KEY, spO2, heart_rate, IR, accel_x, accel_y, accel_z, response_time, answered_correctly }
  const b = req.body || {};

  // Resolve patientId: allow query `?patientId=...`, else env default, else 'p001'
  const patientId = (req.query.patientId && String(req.query.patientId).trim())
    || process.env.DEFAULT_PATIENT_ID
    || b.patientId // if ESP also sends it, use it
    || 'p001';

  let record;

  const isServerNative =
    typeof b === 'object' &&
    b !== null &&
    b.data &&
    (b.patientId || patientId);

  const isEspNative =
    typeof b === 'object' &&
    b !== null &&
    (
      b.spO2 !== undefined ||
      b.heart_rate !== undefined ||
      b.IR !== undefined
    );

  if (isServerNative) {
    // Use as-is, but make sure patientId / serverTs are set
    if (typeof patientId !== 'string' || !patientId.trim()) {
      return res.status(400).json({ ok: false, error: 'patientId required' });
    }
    if (typeof b.sensor !== 'string' || !b.sensor.trim()) {
      return res.status(400).json({ ok: false, error: 'sensor required' });
    }
    if (typeof b.data !== 'object' || b.data === null || Array.isArray(b.data)) {
      return res.status(400).json({ ok: false, error: 'data object required' });
    }

    record = {
      patientId,
      sensor: b.sensor,
      data: b.data,
      ts: Number.isFinite(b.ts) ? Number(b.ts) : undefined,
      serverTs: Date.now()
    };
  } else if (isEspNative) {
    // Map ESP fields into a single 'data' object
    record = {
      patientId,
      sensor: 'esp32', // or 'spo2'/'combined'—purely a label for your UI
      data: {
        spo2: b.spO2,
        hr: b.heart_rate,
        IR: b.IR,
        accel_x: b.accel_x,
        accel_y: b.accel_y,
        accel_z: b.accel_z,
        response_time: b.response_time,
        answered_correctly: b.answered_correctly
      },
      // If you add a device timestamp later, you can place it in ts:
      ts: undefined,
      serverTs: Date.now()
    };
  } else {
    return res.status(400).json({ ok: false, error: 'invalid_payload' });
  }

  // NOTE:
  // - This block is used for BOTH testing and real ESP32 ingestion.
  // - The ONLY difference between "testing" and "real" is whether
  //   we also generate mock data elsewhere.
  try {
    await writeRecordToFiles(record);
    res.status(202).json({ ok: true });
  } catch (err) {
    console.error('Ingest write failed:', err);
    res.status(500).json({ ok: false, error: 'server_error' });
  }
});

// latest snapshot (handy for quick checks/front-end)
app.get('/api/v1/patients/:id/latest', async (req, res) => {
  const p = path.join(LATEST_DIR, `${req.params.id}.json`);
  if (!fssync.existsSync(p)) {
    return res.status(404).json({ ok: false, error: 'not_found' });
  }
  const json = await fs.readFile(p, 'utf-8');
  res.setHeader('Content-Type', 'application/json');
  res.send(json);
});

// raw JSON download (optional)
app.get('/api/v1/patients/:id/download', (req, res) => {
  const p = path.join(STREAMS_DIR, `${req.params.id}.json`);
  if (!fssync.existsSync(p)) {
    return res.status(404).json({ ok: false, error: 'not_found' });
  }
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${req.params.id}.json"`);
  fssync.createReadStream(p).pipe(res);
});

// 404 last
app.use((req, res) => res.status(404).send('resource not found'));

// ---------------------------------------------------------
// Mock / Testing Helpers
// ---------------------------------------------------------

// === TESTING-ONLY HELPER ===
// Safe to leave in production, but you can delete/comment if you want.
function makeMockRecord(patientId = 'p001') {
  return {
    patientId,
    sensor: 'esp32',
    data: {
      // tweak ranges however you like for testing
      spo2: 90 + Math.floor(Math.random() * 11),   // 90–100
      hr: 60 + Math.floor(Math.random() * 41),     // 60–100
      IR: 400 + Math.floor(Math.random() * 300),   // 400–699
      accel_x: 200 + Math.random() * 150,          // random-ish floats
      accel_y: 0 + Math.random() * 150,
      accel_z: 200 + Math.random() * 150,
      response_time: Math.random() * 5,            // 0–5 seconds
      answered_correctly: Math.random() < 0.5
    },
    ts: undefined,
    serverTs: Date.now()
  };
}

// ---------------------------------------------------------
// Startup
// ---------------------------------------------------------

// === OPTION 1: TESTING CONFIGURATION (WITH MOCK INGEST) ===
// This is ACTIVE right now.
// - It starts the server
// - If ENABLE_MOCK_INGEST=true in .env, it writes fake data every 5 seconds.
ensureDirs().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Ingest token: ${API_TOKEN === 'banana' ? 'DEFAULT (change in prod)' : 'SET'}`);

    if (ENABLE_MOCK_INGEST) {
      console.log('Mock ingest enabled: writing test data every 5s for patient p001');
      setInterval(() => {
        const mockRecord = makeMockRecord('p001');

        // fire-and-forget async write
        writeRecordToFiles(mockRecord).catch((err) => {
          console.error('Mock ingest write failed:', err);
        });
      }, 5000); // 5 seconds
    }
  });
}).catch((e) => {
  console.error('Startup failed:', e);
  process.exit(1);
});

// === OPTION 2: PRODUCTION CONFIGURATION (NO MOCK INGEST) ===
// This is COMMENTED OUT right now. Use this when you want only real ESP32 data.
// To switch to production mode later:
//   1) Comment out the TESTING block above
//   2) Uncomment the block below
/*
ensureDirs().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Ingest token: ${API_TOKEN === 'banana' ? 'DEFAULT (change in prod)' : 'SET'}`);
  });
}).catch((e) => {
  console.error('Startup failed:', e);
  process.exit(1);
});
*/