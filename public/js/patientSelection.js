import Patient from "./patient.js"

const patients = [
    new Patient(0, "John", "Doe"),
    new Patient(1, "Jane", "Smith"),
];

const select = document.getElementById('patientSelect');
const infoDiv = document.getElementById('patientInfo');
const addOption = select.querySelector('option[value="add"]');

patients.forEach((patient) => {
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
    
}

select.addEventListener('change', (event) => {
    if (event.target.value === 'add') {
        openPatientForm(); 
    } else {
        showPatientInfo();
    }
});