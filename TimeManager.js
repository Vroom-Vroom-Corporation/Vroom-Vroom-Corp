class TimeManager {
  constructor() {
    // Start at March 9, 2026, 00:00:00
    this.startDate = new Date(2026, 2, 9, 0, 0, 0); // Month is 0-indexed
    this.startMillis = millis();
    this.simulationSpeed = 1000; // 1 real millisecond = 1000 simulation milliseconds (1 real second = 16.67 sim minutes at 60fps)
  }

  // Get current simulation time in milliseconds since start
  getSimulationTime() {
    const elapsed = millis() - this.startMillis;
    return elapsed * this.simulationSpeed;
  }

  // Get current date and time
  getCurrentDateTime() {
    const simTime = this.getSimulationTime();
    const currentDate = new Date(this.startDate.getTime() + simTime);
    return currentDate;
  }

  // Get formatted time string (HH:MM:SS)
  getTimeString() {
    const date = this.getCurrentDateTime();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  // Get formatted date string (MMM DD, YYYY)
  getDateString() {
    const date = this.getCurrentDateTime();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  }

  // Get full date-time for logging
  getFormattedDateTime() {
    return `${this.getDateString()} ${this.getTimeString()}`;
  }

  // Get day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  getDayOfWeek() {
    const date = this.getCurrentDateTime();
    return date.getDay();
  }

  // Get current hour (0-23)
  getHour() {
    const date = this.getCurrentDateTime();
    return date.getHours();
  }

  // Check if current time is a weekday (Monday-Friday)
  isWeekday() {
    const day = this.getDayOfWeek();
    return day >= 1 && day <= 5; // 1 = Monday, 5 = Friday
  }
}
