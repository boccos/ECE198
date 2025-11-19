import { getCurrentPatient, getLivePatient } from '../currentPatient.js';

export default function getDisplayText(string) {
  if (getLivePatient() === 'true') {
    string = 'Live ' + string;
  }
  let endDate = "Present ";
  if (getCurrentPatient().getEndTs() != -1) {
    endDate = new Date(getCurrentPatient().getEndTs()).toLocaleString();
  }
  if (getCurrentPatient().getStartTs() === -1) {
    return `
  ${string} Data<br>
  Patient: <strong>${getCurrentPatient().getFullName()}</strong><br>
  Time: No Data`
  }
  return `
  ${string} Data<br>
  Patient: <strong>${getCurrentPatient().getFullName()}</strong><br>
  Time: <strong>${new Date(getCurrentPatient().getStartTs()).toLocaleString()}</strong> to <strong>${endDate}</strong>`;
}