import { getCurrentPatient, getLivePatient } from '../currentPatient.js';

export default function getDisplayText(string) {
  if (getLivePatient() === 'true') {
    string = 'live ' + string;
  }
  return `The ${string} data of ${getCurrentPatient().getFullName()} from 
  ${new Date(getCurrentPatient().getStartTs()).toLocaleString()} to 
  ${new Date(getCurrentPatient().getEndTs()).toLocaleString()} is currently being displayed below.`;
}