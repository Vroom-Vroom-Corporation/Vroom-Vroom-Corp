class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
    //test update
    //let a = 1;
    
  }
}

class UniversalDeathClock {
  constructor() {
    this.startTime = millis();
  }
// Returns elapsed time in seconds
  getElapsedTime() {
    return (millis() - this.startTime) / 1000;
  }
  //transform to 24 hour clock
  getTimeOfDay() {
    const totalSeconds = this.getElapsedTime();
    const secondsInDay = 24 * 60 * 60;
    const timeOfDaySeconds = totalSeconds % secondsInDay;
    const hours = Math.floor(timeOfDaySeconds / 3600);
    const minutes = Math.floor((timeOfDaySeconds % 3600) / 60);
    const seconds = Math.floor(timeOfDaySeconds % 60);
    return { hours, minutes, seconds };
  }
  //calandar
  getDate() {
    const totalSeconds = this.getElapsedTime();
    const secondsInDay = 24 * 60 * 60;
    const days = Math.floor(totalSeconds / secondsInDay);
    const years = Math.floor(days / 365);
    const remainingDays = days % 365;
    const months = Math.floor(remainingDays / 30);
    const dayOfMonth = remainingDays % 30 + 1;
    return { year: 2024 + years, month: months + 1, day: dayOfMonth };
  }
}

// class Eventinst {
//   constructor(type, data, time) {
//     this.type = type;
//     this.data = data;
//     this.time = time;
//   }
// }
