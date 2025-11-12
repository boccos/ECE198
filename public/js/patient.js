export default class Patient {
  constructor(id, firstName, lastName, spO2, heartRate, IR, accelX, accelY, accelZ, responseTime, answeredCorrectly) {
    this.id = parseInt(id.slice(1), 10);
    this.firstName = firstName;
    this.lastName = lastName;
    this.spO2 = spO2;
    this.heartRate = heartRate;
    this.IR = IR;
    this.accelX = accelX;
    this.accelY = accelY;
    this.accelZ = accelZ;
    this.responseTime = responseTime;
    this.answeredCorrectly = answeredCorrectly;
  }

  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}