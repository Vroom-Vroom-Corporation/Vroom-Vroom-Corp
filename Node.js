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

class Company{
  constructor(name) {
    this.name = name;
    this.revenue = 0;
    this.expenses = 0;
    this.profit = 0;
    this.totalRides = 0;
    this.activeDrivers = 0;
    this.satisfaction = 95; // Base satisfaction percentage
    this.avgRideTime = 12; // Average ride time in minutes
    this.revenueHistory = []; // Track revenue over time for graph
    this.lastRevenueUpdate = 0;
  }

  updateFinancials(amount) {
    this.revenue += amount;
    this.profit = this.revenue - this.expenses;
    
    // Track revenue history for graph (every $1000 increment)
    const revenueIncrement = Math.floor(this.revenue / 1000);
    if (revenueIncrement > this.lastRevenueUpdate) {
      this.revenueHistory.push(amount);
      this.lastRevenueUpdate = revenueIncrement;
      
      // Keep only last 10 data points for the graph
      if (this.revenueHistory.length > 10) {
        this.revenueHistory.shift();
      }
    }
  }

  incurExpense(amount) {
    this.expenses += amount;
    this.profit = this.revenue - this.expenses;
  }

  completeRide(fare, rideTime) {
    this.totalRides++;
    this.updateFinancials(fare);
    
    // Update average ride time (weighted average)
    this.avgRideTime = ((this.avgRideTime * (this.totalRides - 1)) + rideTime) / this.totalRides;
    
    // Adjust satisfaction based on ride time (faster rides = higher satisfaction)
    if (rideTime < 10) {
      this.satisfaction = Math.min(100, this.satisfaction + 0.1);
    } else if (rideTime > 20) {
      this.satisfaction = Math.max(80, this.satisfaction - 0.1);
    }
  }

  setActiveDrivers(count) {
    this.activeDrivers = count;
  }

  getCompanyData() {
    return {
      revenue: Math.round(this.revenue),
      expenses: Math.round(this.expenses),
      profit: Math.round(this.profit),
      totalRides: this.totalRides,
      activeDrivers: this.activeDrivers,
      satisfaction: Math.round(this.satisfaction),
      avgRideTime: Math.round(this.avgRideTime),
      revenueHistory: this.revenueHistory.slice() // Copy the array
    };
  }

  monthlyReport() {
    console.log(`Monthly Report for ${this.name}:`);
    console.log(`Revenue: $${this.revenue.toFixed(2)}`);
    console.log(`Expenses: $${this.expenses.toFixed(2)}`);
    console.log(`Profit: $${this.profit.toFixed(2)}`);
    console.log(`Total Rides: ${this.totalRides}`);
    console.log(`Active Drivers: ${this.activeDrivers}`);
    console.log(`Customer Satisfaction: ${this.satisfaction.toFixed(1)}%`);
  }

}
