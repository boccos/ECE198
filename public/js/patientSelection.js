import Patient from "./patient.js"
import fetchStreams from "./pastPatientDataFetcher.js"
import { setCurrentPatient, getCurrentPatient, getLivePatient } from './currentPatient.js';

const patients = await fetchStreams();
const select = document.getElementById('patient-select');
const infoDiv = document.getElementById('patient-info');
const beginButton = document.getElementById('begin-collection');
const endButton = document.getElementById('end-collection');

patients.forEach(patient => {
    const option = document.createElement("option");
    option.value = patient.id;
    option.textContent = patient.getFullName();
    select.appendChild(option);
});

if (getCurrentPatient() != null) {
    select.value = getCurrentPatient().id;
}

if (getLivePatient() === 'true') {
    beginButton.style.display = 'none';
    select.disabled = true;
} else {
    infoDiv.innerHTML = `<h3>${getCurrentPatient().getFullName()}'s information is currently being displayed!</h3>`;
    endButton.style.display = 'none';
}

select.addEventListener('change', (event) => {
    const selectedId = parseInt(select.value);
    const patient = patients.find(p => p.id === selectedId);
    setCurrentPatient(patient, false);
    infoDiv.innerHTML = `<h3>${getCurrentPatient().getFullName()}'s information is currently being displayed!</h3>`;
});

beginButton.addEventListener('click', function (event) {
    if (!document.getElementById("patient-form").checkValidity()) {
        return;
    }
    event.preventDefault();
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const patient = new Patient(select.length, firstName, lastName);

    const option = document.createElement("option");
    option.value = patient.id;
    option.textContent = patient.getFullName();
    select.appendChild(option);
    select.value = patient.id;
    
    setCurrentPatient(patient, true);
    select.disabled = true;
    infoDiv.innerHTML = '';
    beginButton.style.display = 'none';
    endButton.style.display = 'block';
});

endButton.addEventListener('click', function (event) {
    event.preventDefault();
    select.disabled = false;
    setCurrentPatient(getCurrentPatient(), false);
    beginButton.style.display = 'block';
    endButton.style.display = 'none';
    infoDiv.innerHTML = `<h3>${getCurrentPatient().getFullName()}'s information is currently being displayed!</h3>`;
    // add JSON.stringify(getCurrentPatient) to streams+
});