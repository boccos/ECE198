import Patient from "./patient.js"

export function setCurrentPatient(patient, bool) {
    localStorage.setItem('currentPatient', JSON.stringify(patient));
    localStorage.setItem('livePatient', bool);
}

export function getCurrentPatient() {
    const saved = localStorage.getItem('currentPatient');
    if (!saved) return null;
    const obj = JSON.parse(saved);
    return new Patient(
      obj?.id,
      obj?.firstName,
      obj?.lastName,
      obj?.startTs,
      obj?.endTs,
      obj?.spO2,
      obj?.heartRate,
      obj?.IR,
      obj?.accelX,
      obj?.accelY,
      obj?.accelZ,
      obj?.responseTime,
      obj?.answeredCorrectly,
    )
}

export function getLivePatient() {
    return localStorage.getItem('livePatient');
}