export default class Patient {
  constructor(id, firstName, lastName, spO2, heartRate, IR, accelX, accelY, accelZ, responseTime, answeredCorrectly) {
    if (typeof id === 'string') {
      this.id = parseInt(id.slice(1), 10);
    } else {
      this.id = id;
    }
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

  updateData(deltaTime, data) {
    if (this.spO2.length > 1 && this.spO2[this.spO2.length - 1][0] === deltaTime) {
      return;
    }
    this.spO2.push([deltaTime, data?.spo2]);
    this.heartRate.push([deltaTime, data?.hr]);
    this.IR.push([deltaTime, data?.IR]);
    this.accelX.push([deltaTime, data?.accel_x]);
    this.accelY.push([deltaTime, data?.accel_y]);
    this.accelZ.push([deltaTime, data?.accel_z]);
    this.responseTime.push([deltaTime, data?.response_time]);
    this.answeredCorrectly.push([deltaTime, data?.answered_correctly]);
  }
}