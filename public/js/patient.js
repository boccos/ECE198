export default class Patient {
  constructor(id, firstName, lastName, startTs=-1, endTs=-1, spO2=[], heartRate=[], IR=[], accelX=[], accelY=[], accelZ=[], responseTime=[], answeredCorrectly=[]) {
    if (typeof id === 'string') {
      this.id = parseInt(id.slice(1), 10);
    } else {
      this.id = id;
    }
    this.startTs = startTs;
    this.endTs = endTs;
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

  setId(id) {
    this.id = id;
  }

  setStartTs(startTs) {
    this.startTs = startTs;
  }

  setEndTs(endTs) {
    this.endTs = endTs;
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