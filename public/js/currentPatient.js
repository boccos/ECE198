import Patient from "./patient.js"

export function setCurrentPatient(patient) {
    localStorage.setItem('currentPatient', JSON.stringify(patient));
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
      obj?.data?.spo2,
      obj?.data?.hr,
      obj?.data?.IR,
      obj?.data?.accel_x,
      obj?.data?.accel_y,
      obj?.data?.accel_z,
      obj?.data?.response_time,
      obj?.data?.answered_correctly,
    )
}