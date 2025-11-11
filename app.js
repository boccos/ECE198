// server.js
require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const fssync = require('fs');

const PORT = process.env.PORT || 3000;
const API_TOKEN = process.env.INGEST_TOKEN || 'secret'; // change in prod

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
function authorized(req, res) {
  const key = req.header('x-api-key');
  if (!key || key !== API_TOKEN) {
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
app.post('/api/v1/ingest', async (req, res) => {
  if (!authorized(req, res)) return;

  const { patientId, sensor, data, ts } = req.body || {};
  if (typeof patientId !== 'string' || !patientId.trim()) {
    return res.status(400).json({ ok: false, error: 'patientId required' });
  }
  if (typeof sensor !== 'string' || !sensor.trim()) {
    return res.status(400).json({ ok: false, error: 'sensor required' });
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return res.status(400).json({ ok: false, error: 'data object required' });
  }

  const record = {
    patientId,
    sensor,
    data,
    ts: Number.isFinite(ts) ? Number(ts) : undefined,
    serverTs: Date.now()
  };

  try {
    await ensureDirs();

    const streamPath = path.join(STREAMS_DIR, `${patientId}.json`);
    await fs.appendFile(streamPath, JSON.stringify(record) + '\n', 'utf-8');

    const latestPath = path.join(LATEST_DIR, `${patientId}.json`);
    await fs.writeFile(latestPath, JSON.stringify(record, null, 2), 'utf-8');

    res.status(202).json({ ok: true });
  } catch (err) {
    console.error('Ingest write failed:', err);
    res.status(500).json({ ok: false, error: 'server_error' });
  }
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
  res.setHeader('Content-Type', 'application/x-json');
  res.setHeader('Content-Disposition', `attachment; filename="${req.params.id}.json"`);
  fssync.createReadStream(p).pipe(res);
});

// 404 last
app.use((req, res) => res.status(404).send('resource not found'));

// start
ensureDirs().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Ingest token: ${API_TOKEN === 'secret' ? 'DEFAULT (change in prod)' : 'SET'}`);
  });
}).catch((e) => {
  console.error('Startup failed:', e);
  process.exit(1);
});
