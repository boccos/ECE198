import Patient from "./patient.js";
import fetchStreams from "./pastPatientDataFetcher.js";
import { setCurrentPatient, getCurrentPatient, getLivePatient } from "./currentPatient.js";

const API_KEY = "banana"; // MUST match your backend INGEST_TOKEN / INGEST_TOKENS

const patients = await fetchStreams();
const select = document.getElementById("patient-select");
const infoDiv = document.getElementById("patient-info");
const beginButton = document.getElementById("begin-collection");
const endButton = document.getElementById("end-collection");

// ----------------- Initial dropdown population -----------------
patients.forEach((patient) => {
  const option = document.createElement("option");
  option.value = patient.id;
  option.textContent = patient.getFullName();
  select.appendChild(option);
});


if (getLivePatient() === "true") {
  // there's an active live patient
  addPatient(getCurrentPatient());
  beginButton.style.display = "none";
  select.disabled = true;
} else if (getCurrentPatient() != null) {
  infoDiv.innerHTML = `<h3>${getCurrentPatient().getFullName()}'s information is currently being displayed!</h3>`;
  endButton.style.display = "none";
} else {
  // no current patient yet
  endButton.style.display = "none";
}

if (getCurrentPatient() != null) {
  select.value = getCurrentPatient().id;
}

// ----------------- Patient change handler -----------------
select.addEventListener("change", (event) => {
  const selectedId = parseInt(select.value);
  const patient = patients.find((p) => p.id === selectedId);
  if (!patient) return;

  setCurrentPatient(patient, false);
  infoDiv.innerHTML = `<h3>${patient.getFullName()}'s information is currently being displayed!</h3>`;
});

// ----------------- BEGIN COLLECTION -----------------
beginButton.addEventListener("click", async function (event) {
  if (!document.getElementById("patient-form").checkValidity()) {
    return;
  }
  event.preventDefault();

  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const patient = new Patient(select.length, firstName, lastName);

  // Add new patient to dropdown and select it
  addPatient(patient);

  setCurrentPatient(patient, true);
  select.disabled = true;
  infoDiv.innerHTML = "";
  beginButton.style.display = "none";
  endButton.style.display = "block";

  // 🔴 Tell backend to BEGIN SESSION (clears streams/latest, sets active=true)
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
    }
  } catch (err) {
    console.error("Error calling /api/v1/session/begin:", err);
    alert("Error calling /api/v1/session/begin: " + err.message);
  }
});

// ----------------- END COLLECTION -----------------
endButton.addEventListener("click", async function (event) {
  event.preventDefault();
  select.disabled = false;

  const patient = getCurrentPatient();
  if (patient.spO2.length === 0) {
    confirm("No data has been collected yet. Please wait.");
    return;
  }
  patient.setEndTs(patient.getStartTs() + patient.spO2[patient.spO2.length - 1][0]);
  console.log(patient.spO2[patient.spO2.length - 1][0]);
  setCurrentPatient(patient, false);
  beginButton.style.display = "block";
  endButton.style.display = "none";
  infoDiv.innerHTML = `<h3>${patient.getFullName()}'s information is currently being displayed!</h3>`;

  // 🔴 Tell backend to END SESSION (streams → streams+, clear streams/latest, set inactive)
  try {
    const res = await fetch("/api/v1/session/end", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify(getCurrentPatient()),
    });

    const data = await res.json().catch(() => ({}));
    console.log("[UI] /session/end response:", res.status, data);

    if (!res.ok || !data.ok) {
      alert("Failed to end session: " + (data.error || res.status));
    }
  } catch (err) {
    console.error("Error calling /api/v1/session/end:", err);
    alert("Error calling /api/v1/session/end: " + err.message);
  }
})


function addPatient(patient) {
  const option = document.createElement("option");
  option.value = patient.id;
  option.textContent = patient.getFullName();
  select.appendChild(option);
  select.value = patient.id;
}

