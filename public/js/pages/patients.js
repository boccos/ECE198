import Patient from "../patientClass.js";
import fetchPastStreams from "../fetch/pastPatientDataFetcher.js";
import { fetchStreams } from "../fetch/livePatientDataFetcher.js"
import { setCurrentPatient, getCurrentPatient, getLivePatient } from "../currentPatient.js";
import { beginSession, endSession } from "../fetch/sessionHandler.js";

const patients = await fetchPastStreams();
const select = document.getElementById("patient-select");
const beginButton = document.getElementById("begin-collection");
const endButton = document.getElementById("end-collection");

patients.forEach((patient) => {
  const option = document.createElement("option");
  option.value = patient.id;
  option.textContent = patient.getFullName();
  select.appendChild(option);
});


if (getLivePatient() === "true") {
  addPatient(getCurrentPatient());
  beginButton.hidden = true;
  endButton.hidden = false;
  select.disabled = true;
} else {
  beginButton.hidden = false;
  endButton.hidden = true;
}

if (getCurrentPatient() != null) {
  select.value = getCurrentPatient().id;
}

select.addEventListener("change", (event) => {
  const selectedId = parseInt(select.value);
  const patient = patients.find((p) => p.id === selectedId);
  if (!patient) return;
  setCurrentPatient(patient, false);
});

beginButton.addEventListener("click", async function (event) {
  if (!document.getElementById("patient-form").checkValidity()) {
    return;
  }
  event.preventDefault();

  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const patient = new Patient(select.length, firstName, lastName);

  addPatient(patient);

  setCurrentPatient(patient, true);
  select.disabled = true;
  beginButton.hidden = true;
  endButton.hidden = false;

  beginSession();
});

endButton.addEventListener("click", async function (event) {
  event.preventDefault();
  select.disabled = false;

  const patient = await fetchStreams(getCurrentPatient());
  if (patient === undefined || patient.spO2.length === 0) {
    confirm("No data has been collected. Please wait.");
    return;
  }
  patient.setEndTs(patient.spO2[patient.spO2.length - 1][0]);
  setCurrentPatient(patient, false);
  beginButton.hidden = false;
  endButton.hidden = true;
  endSession(JSON.stringify(getCurrentPatient()));
});

function addPatient(patient) {
  const option = document.createElement("option");
  option.value = patient.id;
  option.textContent = patient.getFullName();
  select.appendChild(option);
  select.value = patient.id;
}