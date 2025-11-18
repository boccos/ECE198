import Patient from "./patient.js";
import fetchStreams from "./pastPatientDataFetcher.js";
import { setCurrentPatient, getCurrentPatient, getLivePatient } from "./currentPatient.js";

const API_KEY = "banana"; // must match your backend INGEST_TOKEN / INGEST_TOKENS

const patients = await fetchStreams();
const select = document.getElementById("patient-select");
const infoDiv = document.getElementById("patient-info");
const beginBtn = document.getElementById("begin-collection");
const endBtn = document.getElementById("end-collection");

// Defensive: make sure elements exist
if (!select) {
  console.error("❌ #patient-select not found in DOM");
}
if (!beginBtn) {
  console.error("❌ #begin-collection button not found in DOM");
}
if (!endBtn) {
  console.error("❌ #end-collection button not found in DOM");
}

// ----------------- populate select -----------------
patients.forEach((patient) => {
  const option = document.createElement("option");
  option.value = patient.id;
  option.textContent = patient.getFullName();
  select.appendChild(option);
});

if (getLivePatient() === "true") {
  addLivePatient(getCurrentPatient());
}

// ----------------- patient change handler -----------------
select.addEventListener("change", (event) => {
  const selectedId = parseInt(select.value);
  const patient = patients.find((p) => p.id === selectedId);
  if (!patient) return;

  setCurrentPatient(patient, false);
  infoDiv.innerHTML = `
    <h3>${patient.getFullName()}'s information is currently being displayed!</h3>
  `;
});

// ----------------- BEGIN COLLECTION -----------------
if (beginBtn) {
  beginBtn.addEventListener("click", async function (event) {
    event.preventDefault();
    console.log("[UI] Begin collection clicked");

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    if (!firstName || !lastName) {
      alert("Please enter both first and last name.");
      return;
    }

    const patient = new Patient(select.length, firstName, lastName);
    addLivePatient(patient);
    setCurrentPatient(patient, true);

    try {
      const res = await fetch("/api/v1/session/begin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({}),
      });

      const data = await res.json().catch(() => ({}));
      console.log("[UI] /session/begin response:", res.status, data);

      if (!res.ok || !data.ok) {
        alert("Failed to begin session: " + (data.error || res.status));
      } else {
        infoDiv.innerHTML = `
          <h3>Now collecting live data for ${patient.getFullName()}!</h3>
        `;
      }
    } catch (err) {
      console.error("Error calling /api/v1/session/begin:", err);
      alert("Error calling /api/v1/session/begin: " + err.message);
    }
  });
}

// ----------------- END COLLECTION -----------------
if (endBtn) {
  endBtn.addEventListener("click", async function (event) {
    event.preventDefault();
    console.log("[UI] End collection clicked");
    select.disabled = false;

    try {
      const res = await fetch("/api/v1/session/end", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({}),
      });

      const data = await res.json().catch(() => ({}));
      console.log("[UI] /session/end response:", res.status, data);

      if (!res.ok || !data.ok) {
        alert("Failed to end session: " + (data.error || res.status));
        return;
      }

      const current = getCurrentPatient();
      setCurrentPatient(current, false);

      infoDiv.innerHTML = `
        <h3>Collection ended for ${
          current ? current.getFullName() : "current patient"
        }. Session archived.</h3>
      `;
    } catch (err) {
      console.error("Error calling /api/v1/session/end:", err);
      alert("Error calling /api/v1/session/end: " + err.message);
    }
  });
}

// ----------------- helper -----------------
function addLivePatient(patient) {
  const option = document.createElement("option");
  option.value = patient.id;
  option.textContent = patient.getFullName();
  select.appendChild(option);
  select.value = patient.id;
  select.disabled = true;
}
