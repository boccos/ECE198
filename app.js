// server.js
require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const fssync = require('fs');

const ENABLE_MOCK_INGEST = process.env.ENABLE_MOCK_INGEST === 'true'; // Code for Testing



const PORT = process.env.PORT || 3000;
const API_TOKEN = 'banana' || process.env.INGEST_TOKEN; // change in prod

const app = express();
app.use(express.json({ limit: '200kb' }));
app.use(express.static(path.resolve(__dirname, 'public')));

// --- paths ---
const DATA_DIR = path.resolve(__dirname, 'data');
const STREAMS_DIR = path.join(DATA_DIR, 'streams');
const LATEST_DIR = path.join(DATA_DIR, 'latest');

// ensure folders exist
async function ensureDirs() {
  await fs.mkdir(STREAMS_DIR, { recursive: true });
  await fs.mkdir(LATEST_DIR, { recursive: true });
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

// Code for Testing
async function writeRecordToFiles(record) {
  await ensureDirs();

  // history stream
  const streamPath = path.join(STREAMS_DIR, `${record.patientId}.json`);
  await appendToHistoryJson(streamPath, record, 0); // 0 = no cap

  // latest snapshot
  const latestPath = path.join(LATEST_DIR, `${record.patientId}.json`);
  await fs.writeFile(latestPath, JSON.stringify(record, null, 2), 'utf-8');
}


// ---- auth helpers (allow header OR body-provided API_KEY) ----
const TOKEN_STR = process.env.INGEST_TOKENS || process.env.INGEST_TOKEN || 'banana';
const TOKENS = TOKEN_STR.split(',').map(s => s.trim()).filter(Boolean);

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

// healthcheck
app.get('/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// ESP32 ingest endpoint
// ESP32 ingest endpoint
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

  const isServerNative = typeof b === 'object' && b !== null && b.data && (b.patientId || patientId);
  const isEspNative = typeof b === 'object' && b !== null && (
    b.spO2 !== undefined || b.heart_rate !== undefined || b.IR !== undefined
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
    // Code for Testing (Uncomment below to restore normal operation)
    try {
      await writeRecordToFiles(record);
      res.status(202).json({ ok: true });
    } catch (err) {
      console.error('Ingest write failed:', err);
      res.status(500).json({ ok: false, error: 'server_error' });
    }

  /*try {
    await ensureDirs();

    // --- write to history JSON array ---
    const streamPath = path.join(STREAMS_DIR, `${patientId}.json`);
    await appendToHistoryJson(streamPath, record, 0); // optional cap

    // --- write latest snapshot ---
    const latestPath = path.join(LATEST_DIR, `${patientId}.json`);
    await fs.writeFile(latestPath, JSON.stringify(record, null, 2), 'utf-8');

    res.status(202).json({ ok: true });
  } catch (err) {
    console.error('Ingest write failed:', err);
    res.status(500).json({ ok: false, error: 'server_error' });
  } */
});


// latest snapshot (handy for quick checks/front-end)
app.get('/api/v1/patients/:id/latest', async (req, res) => {
  const p = path.join(LATEST_DIR, `${req.params.id}.json`);
  if (!fssync.existsSync(p)) return res.status(404).json({ ok: false, error: 'not_found' });
  const json = await fs.readFile(p, 'utf-8');
  res.setHeader('Content-Type', 'application/json');
  res.send(json);
});

// raw JSON download (optional)
app.get('/api/v1/patients/:id/download', (req, res) => {
  const p = path.join(STREAMS_DIR, `${req.params.id}.json`);
  if (!fssync.existsSync(p)) return res.status(404).json({ ok: false, error: 'not_found' });
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${req.params.id}.json"`);
  fssync.createReadStream(p).pipe(res);
});

// 404 last
app.use((req, res) => res.status(404).send('resource not found'));

// Code for testing
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


// Code for Testing
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

// start
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