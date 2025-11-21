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

  getStartTs() {
    return this.startTs;
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

  getCorrectPercentage() {
    let cnt = 0;
    for (let answer of this.answeredCorrectly) {
      if (answer[1]) ++cnt;
    }
    return (cnt / this.answeredCorrectly.length).toFixed(2) * 100 + '%';
  }

  getResponseTime() {
    let sum = 0;
    for (let time of this.responseTime) {
      sum += time[1];
    }
    return (sum / this.responseTime.length).toFixed(2);
  }

  getCorrectTime() {
    let sum = 0;
    let cnt = 0;
    for (let i = 0; i < this.answeredCorrectly.length; i++) {
      if (this.answeredCorrectly[i][1]) {
        ++cnt;
        sum += this.responseTime[i][1];
      }
    }
   return (sum / cnt).toFixed(2);
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
    if (data?.response_time !== undefined) {
      this.responseTime.push([date, data?.response_time]);
    }
    if (data?.answered_correctly !== undefined) {
      this.answeredCorrectly.push([date, data?.answered_correctly]);
    }
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