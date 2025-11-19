export default class Patient {
  constructor(id, firstName, lastName, startTs = -1, endTs = -1, spO2 = [], heartRate = [], IR = [], accelX = [], accelY = [], accelZ = [], responseTime = [], answeredCorrectly = []) {
    if (typeof id === 'string') {
      this.id = parseInt(id.slice(1), 10);
    } else {
      this.id = id;
    }
    this.firstName = firstName;
    this.lastName = lastName;
    this.startTs = startTs;
    this.endTs = endTs;
    this.spO2 = spO2;
    this.heartRate = heartRate;
    this.IR = IR;
    this.accelX = accelX;
    this.accelY = accelY;
    this.accelZ = accelZ;
    this.accel = [];
    for (let i = 0; i < accelX.length; i++) {
      this.accel.push([accelX[i][0], Math.sqrt(accelX[i][1] * accelX[i][1] + accelY[i][1] * accelY[i][1] + accelZ[i][1] * accelZ[i][1])]);
    }
    this.responseTime = responseTime;
    this.answeredCorrectly = answeredCorrectly;
  }

  setId(id) {
    this.id = id;
  }

  getStartTs() {
    return this.startTs;
  }

  setStartTs(startTs) {
    this.startTs = startTs;
  }

  getEndTs() {
    return this.endTs;
  }

  setEndTs(endTs) {
    this.endTs = endTs;
  }

  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  updateData(time, data) {
    if (this.startTs === -1) {
      this.startTs = time;
    }
    const deltaTime = time - this.startTs;
    if (this.spO2.length > 1 && this.spO2[this.spO2.length - 1][0] === deltaTime) {
      return;
    }
    this.spO2.push([deltaTime, data?.spo2]);
    this.heartRate.push([deltaTime, data?.hr]);
    this.IR.push([deltaTime, data?.IR]);
    this.accelX.push([deltaTime, data?.accel_x]);
    this.accelY.push([deltaTime, data?.accel_y]);
    this.accelZ.push([deltaTime, data?.accel_z]);
    this.accel.push([deltaTime, Math.sqrt(data?.accel_x * data?.accel_x + data?.accel_y * data?.accel_y + data?.accel_z * data?.accel_z)]);
    this.responseTime.push([deltaTime, data?.response_time]);
    this.answeredCorrectly.push([deltaTime, data?.answered_correctly]);
  }

  clearData() {
    this.spO2 = [];
    this.heartRate = [];
    this.IR = [];
    this.accelX = [];
    this.accelY = [];
    this.accelZ = [];
    this.accel = [];
    this.responseTime = [];
    this.answeredCorrectly = [];
  }
}