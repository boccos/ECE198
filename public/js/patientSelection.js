import Patient from "./patient.js"
import fetchStreams from "./pastPatientDataFetcher.js"
import { setCurrentPatient, getCurrentPatient, getLivePatient } from './currentPatient.js';

const patients = await fetchStreams();
const select = document.getElementById('patient-select');
const infoDiv = document.getElementById('patient-info');

patients.forEach(patient => {
    const option = document.createElement("option");
    option.value = patient.id;
    option.textContent = patient.getFullName();
    select.appendChild(option);
});
if (getLivePatient() === 'true') {
    addLivePatient(getCurrentPatient());
}

select.addEventListener('change', (event) => {
    const selectedId = parseInt(select.value);
    const patient = patients.find(p => p.id === selectedId);
    setCurrentPatient(patient, false);
    infoDiv.innerHTML = `
        <h3>${patient.getFullName()}'s information is currently being displayed!</h3>
        `;
});

document.getElementById('begin-collection').addEventListener('click', function (event) {
    event.preventDefault();
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const patient = new Patient(select.length, firstName, lastName);

    addLivePatient(patient);
    setCurrentPatient(patient, true);
});

document.getElementById('end-collection').addEventListener('click', function (event) {
    event.preventDefault();
    select.disabled = false;
    console.log("hi");
    // add to streams+
});

function addLivePatient(patient) {
    const option = document.createElement("option");
    option.value = patient.id;
    option.textContent = patient.getFullName();
    select.appendChild(option);
    select.value = patient.id;
    select.disabled = true;
}