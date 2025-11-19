// app.js / server.js
require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const fssync = require("fs");

// ---------------------------------------------------------
// Config / Constants
// ---------------------------------------------------------

const ENABLE_MOCK_INGEST = process.env.ENABLE_MOCK_INGEST === "true";
const PORT = process.env.PORT || 3000;

// main API token (used by frontend + ESP32)
const API_TOKEN = process.env.INGEST_TOKEN || "banana";

// allow either INGEST_TOKENS (comma separated) or single INGEST_TOKEN
const TOKEN_STR =
  process.env.INGEST_TOKENS || process.env.INGEST_TOKEN || "banana";
const TOKENS = TOKEN_STR.split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// paths
const app = express();
app.use(express.json({ limit: "200kb" }));
app.use(express.static(path.resolve(__dirname, "public")));

const DATA_DIR = path.resolve(__dirname, "data");
const STREAMS_DIR = path.join(DATA_DIR, "streams");
const LATEST_DIR = path.join(DATA_DIR, "latest");
const STREAMS_PLUS_DIR = path.join(DATA_DIR, "streams+"); // holds all past sessions
const SESSION_FILE = path.join(DATA_DIR, "session.json"); // stores session active/inactive
const PATIENT_DATA_FILE = path.join(STREAMS_PLUS_DIR, "patientData.json"); // <-- aggregated completed sessions

// ---------------------------------------------------------
// Directory / File Helpers
// ---------------------------------------------------------

async function ensureDirs() {
  await fs.mkdir(STREAMS_DIR, { recursive: true });
  await fs.mkdir(LATEST_DIR, { recursive: true });
  await fs.mkdir(STREAMS_PLUS_DIR, { recursive: true });
}

async function clearDir(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    await Promise.all(
      entries.map((entry) =>
        fs.rm(path.join(dirPath, entry.name), {
          recursive: true,
          force: true,
        })
      )
    );
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }
}

async function readJsonArray(filePath) {
  try {
    const txt = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(txt);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function appendToArrayFile(filePath, record) {
  const arr = await readJsonArray(filePath);
  arr.push(record);
  await fs.writeFile(filePath, JSON.stringify(arr, null, 2), "utf-8");
  return arr.length;
}

// ---------------------------------------------------------
// Session State Helpers
// ---------------------------------------------------------

async function getSessionActive() {
  try {
    const txt = await fs.readFile(SESSION_FILE, "utf-8");
    const obj = JSON.parse(txt);
    return !!obj.active;
  } catch {
    return false; // default: inactive until Begin pressed
  }
}

async function setSessionActive(active) {
  await fs.writeFile(
    SESSION_FILE,
    JSON.stringify(
      {
        active: !!active,
        updatedAt: new Date().toISOString(),
      },
      null,
      2
    ),
    "utf-8"
  );
}

// ---------------------------------------------------------
// Central Write Logic (streams + latest)
// ---------------------------------------------------------

async function writeRecordToFiles(record) {
  await ensureDirs();

  const sessionActive = await getSessionActive();
  if (!sessionActive) {
    console.log("[INGEST] session NOT active → skip write");
    return;
  }

  const streamPath = path.join(STREAMS_DIR, `${record.patientId}.json`);
  const latestPath = path.join(LATEST_DIR, `${record.patientId}.json`);

  const len = await appendToArrayFile(streamPath, record);
  await fs.writeFile(latestPath, JSON.stringify(record, null, 2), "utf-8");

  console.log("[INGEST] wrote record for", record.patientId, {
    streamPath,
    latestPath,
    streamLen: len,
  });
}

// ---------------------------------------------------------
// Auth
// ---------------------------------------------------------

function extractApiKey(req) {
  return req.header("x-api-key") || (req.body && req.body.API_KEY);
}

function authorized(req, res) {
  const key = extractApiKey(req);
  if (!key || !TOKENS.includes(String(key))) {
    res.status(401).json({ ok: false, error: "unauthorized" });
    return false;
  }
  return true;
}

// ---------------------------------------------------------
// Routes
// ---------------------------------------------------------

// healthcheck
app.get("/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// handy status endpoint
app.get("/api/v1/session/status", async (req, res) => {
  const active = await getSessionActive();
  res.json({ ok: true, active });
});

// ---------------- Session control (Begin / End) ----------------

// Begin Session:
// - clears streams and latest
// - marks session as active
app.post("/api/v1/session/begin", async (req, res) => {
  console.log("SESSION BEGIN hit, x-api-key =", extractApiKey(req));

  if (!authorized(req, res)) {
    console.log("SESSION BEGIN: unauthorized");
    return;
  }

  try {
    await ensureDirs();
    await clearDir(STREAMS_DIR);
    await clearDir(LATEST_DIR);
    await setSessionActive(true);

    console.log("SESSION BEGIN: sessionActive set to true");

    res.json({ ok: true, sessionActive: true });
  } catch (err) {
    console.error("Begin session failed:", err);
    res.status(500).json({ ok: false, error: "server_error" });
  }
});

// End Session:
// - APPENDS req.body (frontend getCurrentPatient()) to streams+/patientData.json
// - clears streams and latest
// - marks session as inactive
app.post("/api/v1/session/end", async (req, res) => {
  console.log("SESSION END hit, x-api-key =", extractApiKey(req));

  if (!authorized(req, res)) {
    console.log("SESSION END: unauthorized");
    return;
  }

  try {
    await ensureDirs();

    const patientSummary = req.body || null;
    if (patientSummary) {
      // append front-end summary to streams+/patientData.json
      const len = await appendToArrayFile(PATIENT_DATA_FILE, patientSummary);
      console.log(
        "SESSION END: appended patient summary to",
        PATIENT_DATA_FILE,
        "length now =",
        len
      );
    } else {
      console.log("SESSION END: no patientSummary in body");
    }

    // clear per-session measurement data
    await clearDir(STREAMS_DIR);
    await clearDir(LATEST_DIR);
    await setSessionActive(false);

    console.log("SESSION END: cleared streams/latest and set sessionActive=false");

    res.json({ ok: true, sessionActive: false });
  } catch (err) {
    console.error("End session failed:", err);
    res.status(500).json({ ok: false, error: "server_error" });
  }
});

// ---------------- Ingest endpoint (ESP32 + server-side) ----------------

app.post("/api/v1/ingest", async (req, res) => {
  if (!authorized(req, res)) return;

  const b = req.body || {};

  // resolve patientId
  const patientId =
    (req.query.patientId && String(req.query.patientId).trim()) ||
    process.env.DEFAULT_PATIENT_ID ||
    b.patientId ||
    "p001";

  let record;

  const isServerNative =
    typeof b === "object" && b !== null && b.data && (b.patientId || patientId);

  const isEspNative =
    typeof b === "object" &&
    b !== null &&
    (b.spO2 !== undefined || b.heart_rate !== undefined || b.IR !== undefined);

  if (isServerNative) {
    if (typeof patientId !== "string" || !patientId.trim()) {
      return res.status(400).json({ ok: false, error: "patientId required" });
    }
    if (typeof b.sensor !== "string" || !b.sensor.trim()) {
      return res.status(400).json({ ok: false, error: "sensor required" });
    }
    if (typeof b.data !== "object" || b.data === null || Array.isArray(b.data)) {
      return res
        .status(400)
        .json({ ok: false, error: "data object required" });
    }

    record = {
      patientId,
      sensor: b.sensor,
      data: b.data,
      ts: Number.isFinite(b.ts) ? Number(b.ts) : undefined,
      serverTs: Date.now(),
    };
  } else if (isEspNative) {
    record = {
      patientId,
      sensor: "esp32",
      data: {
        spo2: b.spO2,
        hr: b.heart_rate,
        IR: b.IR,
        accel_x: b.accel_x,
        accel_y: b.accel_y,
        accel_z: b.accel_z,
        response_time: b.response_time,
        answered_correctly: b.answered_correctly,
      },
      ts: undefined,
      serverTs: Date.now(),
    };
  } else {
    return res.status(400).json({ ok: false, error: "invalid_payload" });
  }

  try {
    await writeRecordToFiles(record);
    res.status(202).json({ ok: true });
  } catch (err) {
    console.error("Ingest write failed:", err);
    res.status(500).json({ ok: false, error: "server_error" });
  }
});

// ---------------- Past patients (streams+/patientData.json) ----------------

// used by pastPatientDataFetcher.js → GET /api/v1/patients/patientData/download
app.get("/api/v1/patients/patientData/download", async (req, res) => {
  await ensureDirs();

  if (!fssync.existsSync(PATIENT_DATA_FILE)) {
    // no past sessions yet → send empty array
    return res.json([]);
  }

  try {
    const txt = await fs.readFile(PATIENT_DATA_FILE, "utf-8");
    const arr = JSON.parse(txt);
    if (!Array.isArray(arr)) {
      return res.json([]);
    }
    res.json(arr);
  } catch (err) {
    console.error("Error reading patientData.json:", err);
    res.json([]); // fail soft to keep frontend happy
  }
});

// ---------------- Latest snapshot + raw download (per patientId) ----------------

// latest snapshot (from latest/<id>.json)
app.get("/api/v1/patients/:id/latest", async (req, res) => {
  const p = path.join(LATEST_DIR, `${req.params.id}.json`);
  if (!fssync.existsSync(p)) {
    return res.status(404).json({ ok: false, error: "not_found" });
  }
  const json = await fs.readFile(p, "utf-8");
  res.setHeader("Content-Type", "application/json");
  res.send(json);
});

// raw JSON for measurement history (from streams/<id>.json)
app.get("/api/v1/patients/:id/download", async (req, res) => {
  const p = path.join(STREAMS_DIR, `${req.params.id}.json`);
  if (!fssync.existsSync(p)) {
    return res.status(404).json({ ok: false, error: "not_found" });
  }
  res.setHeader("Content-Type", "application/json");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${req.params.id}.json"`
  );
  fssync.createReadStream(p).pipe(res);
});

// 404 last
app.use((req, res) => res.status(404).send("resource not found"));

// ---------------------------------------------------------
// Mock / Testing Helpers
// ---------------------------------------------------------

function makeMockRecord(patientId = "p001") {
  return {
    patientId,
    sensor: "esp32",
    data: {
      spo2: 90 + Math.floor(Math.random() * 11), // 90–100
      hr: 60 + Math.floor(Math.random() * 41), // 60–100
      IR: 400 + Math.floor(Math.random() * 300), // 400–699
      accel_x: 200 + Math.random() * 150,
      accel_y: 0 + Math.random() * 150,
      accel_z: 200 + Math.random() * 150,
      response_time: Math.random() * 5,
      answered_correctly: Math.random() < 0.5,
    },
    ts: undefined,
    serverTs: Date.now(),
  };
}

// ---------------------------------------------------------
// Startup
// ---------------------------------------------------------

ensureDirs()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log("[BOOT] tokens =", TOKENS);
      console.log("ENABLE_MOCK_INGEST =", ENABLE_MOCK_INGEST);

      if (ENABLE_MOCK_INGEST) {
        console.log(
          "[MOCK] generating records every 5s (only when session is active)"
        );
        setInterval(async () => {
          const mockRecord = makeMockRecord("p001");
          try {
            await writeRecordToFiles(mockRecord);
          } catch (err) {
            console.error("Mock ingest write failed:", err);
          }
        }, 5000);
      }
    });
  })
  .catch((e) => {
    console.error("Startup failed:", e);
    process.exit(1);
  });
