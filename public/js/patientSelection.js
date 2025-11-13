import Patient from "./patient.js"
import fetchStreams from "./patientFetcher.js"

const patients = await fetchStreams("p001");
const select = document.getElementById('patient-select');
const infoDiv = document.getElementById('patient-info');
const addOption = select.querySelector('option[value="add"]');
const addPatient = document.getElementById('add-patient');

patients.forEach(patient => {
    const option = document.createElement("option");
    option.value = patient.id;
    option.textContent = patient.getFullName();
    select.insertBefore(option, addOption);
});

function showPatientInfo() {
    const selectedId = parseInt(select.value);
    const patient = patients.find(p => p.id === selectedId);
    infoDiv.innerHTML = `
        <h3>${patient.getFullName()}'s information is currently being displayed!</h3>
      `;
}

function openPatientForm() {
    infoDiv.innerHTML = ``;
    addPatient.hidden = false;
}

document.getElementById("patient-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const patient = new Patient(select.length - 1, firstName, lastName);

    const option = document.createElement("option");
    option.value = patient.id;
    option.textContent = patient.getFullName();
    select.insertBefore(option, addOption);
    select.value = patient.id;
});

select.addEventListener('change', (event) => {
    if (event.target.value === 'add') {
        openPatientForm();
    } else {
        showPatientInfo();
    }
});