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
      this.accel.push([accelX[i][0], Math.sqrt(accelX[i][1] * accelX[i][1] + accelY[i][1] * accelY[i][1] + accelZ[i][1] * accelZ[i][1]).toFixed(2)]);
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
    if (this.spO2.length > 1 && this.spO2[this.spO2.length - 1][0] === time) {
      return;
    }
    const date = new Date(time);
    this.spO2.push([date, data?.spo2]);
    this.heartRate.push([date, data?.hr]);
    this.IR.push([date, data?.IR]);
    this.accelX.push([date, data?.accel_x]);
    this.accelY.push([date, data?.accel_y]);
    this.accelZ.push([date, data?.accel_z]);
    this.accel.push([date, Math.sqrt(data?.accel_x * data?.accel_x + data?.accel_y * data?.accel_y + data?.accel_z * data?.accel_z).toFixed(2)]);
    this.responseTime.push([date, data?.response_time]);
    this.answeredCorrectly.push([date, data?.answered_correctly]);
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