class SimulationController {
  constructor(width, height) {
    this.map = new TownMap(width, height);
    this.doomsdayclock = new UniversalDeathClock();
    this.timeManager = new TimeManager();
    this.VroomVroomCorp = new Company("Vroom Vroom Corporation");

    // STUDENTS MUST INITIALIZE THESE AS LINKED LISTS
    this.availableDrivers = new LinkedList();
    this.pendingRequests = new LinkedList();
    this.activeMatches = new LinkedList();
    this.expiredRequests = new LinkedList();
    this.eventLog = new LinkedList(); //event log might incude active and expired requests, or we can have separate logs for each
    this.eventLogSize = 0;
    this.maxEventLogSize = 50;

    this.frameCounter = 0;

    this.driverCounter = 1;
    this.customerCounter = 1;
    this.lastMonthlyHiringTime = this.timeManager.getSimulationTime();
    this.uiManager = new UIManager();
    this.addEvent("SYSTEM", "Simulation started");
    //inital spawning for drivers
    for (let i = 0; i < 1000; i++) {
          this.spawnRandomDriver();
    }
    //test case for spawning customers at start
    for (let i = 0; i < 1000; i++) {
      this.spawnRandomCustomer();
    }
       
            
  }

  update() {
    this.frameCounter++;
    this.MassLayoffs();
    // Calculate dynamic spawn interval based on current time
    const baseSpawnInterval = this.calculateSpawnInterval();
    const timeScale = this.timeManager.getTimeScale();
    const spawnInterval = Math.max(1, Math.round(baseSpawnInterval / timeScale));

    if (this.frameCounter % spawnInterval === 0) {
      this.spawnRandomCustomer();
    }

    this.updateDrivers();
    this.updateCustomers();

   this.processMatching();      // STUDENTS IMPLEMENT
   this.handleExpirations();    // STUDENTS IMPLEMENT
    
    // Update UI sidebar with active customers
    this.updateUI();

    // Trigger monthly hiring at fixed simulation intervals.
    const currentSimTime = this.timeManager.getSimulationTime();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    if (currentSimTime - this.lastMonthlyHiringTime >= weekMs) { // 15 day timer is ai assisted
      this.monthlyHiring();
      // Keep the next cycle aligned to 15 days. If we are far past one or more cycles, catch up.
      const cyclesPassed = Math.floor((currentSimTime - this.lastMonthlyHiringTime) / weekMs);
      this.lastMonthlyHiringTime += cyclesPassed * weekMs;
    }

  }

  display() {
    this.map.drawGrid();
    this.renderDrivers();
    this.renderCustomers();
    this.renderHUD();
  }
  //hire and fire drivers at the end of each month based on profit and satisfaction
  MassLayoffs() {
    this.availableDrivers.traverse((driver) => {
      if (driver) {
    //fire if negative rating after 10 rides
    if (driver.avgrating < 2 && driver.totalrides >= 10) {
      this.availableDrivers.delete((d) => d.id === driver.id);
      this.addEvent(driver.id, "Fired due to low rating");
      console.log(driver.id, "fired due to low rating:", driver.avgrating, "after", driver.totalrides, "rides");
    }
    //fire if under average after 20
    if (driver.avgrating < this.VroomVroomCorp.avgrating && driver.totalrides >= 20) {
      this.availableDrivers.delete((d) => d.id === driver.id);
      this.addEvent(driver.id, "Fired due to below average rating");
      console.log(driver.id, "fired due to below average rating:", driver.avgrating, "compared to company average of", this.VroomVroomCorp.avgrating, "after", driver.totalrides, "rides");
    }
    //Fire if inactive for a week
    if (driver.status === "INACTIVE") {
      this.availableDrivers.delete((d) => d.id === driver.id);
      this.addEvent(driver.id, "Fired due to inactivity");
      console.log(driver.id, "fired due to inactivity");
    }
      }
    });
  }

  monthlyHiring() {
    //every month, hire the avgrating # of drivers (rounded down) remove cost of hiring from earnings, add to expenses, then add new drivers to available drivers linked list
    const driversToHire = 5; //may cahnge to fixed value 
    for (let i = 0; i < driversToHire; i++) {
      const d = this.spawnRandomDriver();
      //basic 100. silver 500. gold 1000. platinum 5000.

      let hiringCost = 100; // this can be adjusted based on driver quality or market conditions
      if (d.cartier === 1) {
        hiringCost = 100;
      } else if (d.cartier === 2) {
        hiringCost = 500;
      } else if (d.cartier === 3) {
        hiringCost = 1000;
      } else if (d.cartier === 4) {
        hiringCost = 5000;
      }
      this.VroomVroomCorp.incurExpense(hiringCost); // cost of hiring a driver
    }
  }

  spawnRandomDriver() {
    const loc = this.map.getRandomLocation();
    // convert to p5.Vector so the driver has a proper location
    const vec = createVector(loc.x, loc.y);
    const driver = new Driver("D" + this.driverCounter++, vec);

    // initialize availability timestamp for inactivity tracking // ai assisted
    driver.availableSince = this.timeManager.getSimulationTime();

    // insert into availableDrivers linked list
    this.availableDrivers.insert(driver);
    this.addEvent(driver.id, `Hired with capacity ${driver.capacity} at (${Math.round(vec.x)}, ${Math.round(vec.y)})`); //ai assisted doucmentation

    return driver;
  }

  spawnRandomCustomer() {
    const loc = this.map.getRandomLocation();
    const dest = this.map.getRandomLocation();
    const customer = new Customer("C" + this.customerCounter++, loc, dest, this.timeManager);
    this.pendingRequests.insert(customer);
    //assisted doucmentation
    this.addEvent(customer.id, `New request with ${customer.passengers} passengers from (${Math.round(loc.x)}, ${Math.round(loc.y)}) to (${Math.round(dest.x)}, ${Math.round(dest.y)})`);
    this.VroomVroomCorp.updateFinancials(10); //change with customer class, maybe based on passengers or distance or smth
  }

  // Calculate spawn interval based on current simulation time
  // Returns shorter intervals during peak hours for increased spawning rates
  calculateSpawnInterval() { //ai assisted
    const hour = this.timeManager.getHour();
    const isWeekday = this.timeManager.isWeekday();

    // Peak hours: 7-9 AM (7:00-8:59) and 4-6 PM (16:00-17:59)
    const isMorningPeak = hour >= 7 && hour < 9;
    const isEveningPeak = hour >= 16 && hour < 18;

    // base interval depends on peak vs off-peak
    const baseInterval = (isWeekday && (isMorningPeak || isEveningPeak)) ? 60 : 180;

    // adjust interval based on company average rating
    // higher rating -> more frequent spawns, lower rating -> slower spawns
    const rating = this.VroomVroomCorp.avgrating || 1; // avoid division by zero
    const ratingFactor = rating / 5; // normalize to 0..1 (assuming 5 is max rating)

    // combine base interval with rating factor; ensure it never goes below a minimum
    const interval =(( baseInterval / (1 + ratingFactor))/5);
    return Math.max(20, Math.round(interval));
  }

  updateDrivers() {
    // TODO:
    // Traverse driver list and call driver.update()
    this.availableDrivers.traverse((driver) => driver.update());
  }

  updateCustomers() {
    this.pendingRequests.traverse((customer) => customer.update());
    this.activeMatches.traverse((customer) => customer.update());
    this.handleRideCompletions();
    this.handleExpirations();
  }

//driversort()
//{
//every 14 days, sort drivers based on rating
//highest frst
//lowest last
//greater likelihood of a match early, lowering wait times
//}

//customersort()
//{
//every 50 (num can change) requests, order passengers to prioritize higher paying and more needy
//prioirty sub tier > time until expiry > passenger count > amenity count
//}

  processMatching() {
    // Get the first pending customer
    //sort customer by priority here
    this.pendingRequests.traverse((customer) => {
    //prioritize hier teir cousmuers, customer sort here
    if (!customer || customer.status !== "PENDING") return; // no pending requests
    //driver sort
    let bestDriver = null;
    let bestScore = -Infinity;
  
    // Get the first available driver that can reach within time
    //limit to the x closest drivers, maybe conditional to rush hours
    // => means its a function
     this.availableDrivers.traverse(
      (d) => {
        if (d.status !== "AVAILABLE") return;
        if (d.capacity < customer.passengers) return; // capacity check
        //time check
        let distance = this.map.getDistance(d.location, customer.location);
        const now = this.timeManager.getSimulationTime();
        let remaining_ms = customer.expireTime - now;
        const traveltime = (distance / Math.max(d.speed, 0.1)) * (1000/60); // time to reach customer in ms
        if (traveltime > remaining_ms) return; // can't reach in time
        //logging is ai assisted for debugging pruposes
       
        //distance score = like 100 - distacee, so closer drivers get higher score
        //amenity score = if driver has all amenities, +50, if missing 1 amenity, -20, missing 2 amenities -40, missing 3 amenities -60, missing all amenities -80
        let distanceScore = 100 - distance;
        let amenityScore = 0;
  
        const requiredAmenities = customer.amenitiesRequired; // note:ai recommeded putting || [];
        for (let i = 0; i < requiredAmenities.length; i++) {
          for (let j = 0; j < d.amenities.length; j++) {
            if(d.amenities[j] === requiredAmenities[i]){
              amenityScore += 30;
            }
          }
        }
        let currentscore = distanceScore + amenityScore;// add scores
        if (currentscore > bestScore) {
          bestScore = currentscore;
          bestDriver = d;
     
        }
        
        // go to next driver in the list and repeat, if driver next is false, return highest rated driver
        // during rush hours, perhaps limit the amount of drivers assesed per passenger to speed up matching
      }
    );
    if (bestDriver) {
      // console.log(bestDriver.id, "score:", bestScore, "distanceScore:", bestDistanceScore, "amenityScore:", bestAmenityScore);
    }
    // If both exist, assign the customer as the driver's target
    if (bestDriver && customer) {
      bestDriver.assignRide(customer, 300);
      customer.aknowledgeMatch(bestDriver);
      this.addEvent("MATCH", `${customer.id} matched with ${bestDriver.id}`);// debugging by ai
      // Move the customer from pendingRequests to activeMatches
      this.pendingRequests.delete((c) => c.id === customer.id);
      this.activeMatches.insert(customer);
    }
    });
  }

//monee

  handleRideCompletions() {
    // Check for completed rides and generate revenue
    this.activeMatches.traverse((customer) => {
        if (customer.status === "DELIVERED") {
        // Calculate fare based on distance and passengers
          const rawDistance = this.map.getDistance(customer.location, customer.destination);
          const distance = isNaN(rawDistance) ? 0 : rawDistance;
        let score =0;
          let tips=0;

          //fare for basic and poor customers
        let baseFare = 5.00;
        let distanceRate = 2.50; // $2.50 per unit distance
        let passengerRate = 1.50; // $1.50 per passenger
          if (customer.subscriptionPlan === "SILVER") {
            passengerRate = 2.25;
            distanceRate = 3.00;
            baseFare = 7.50;
            score +=1;
          } else if (customer.subscriptionPlan === "GOLD") {
            passengerRate = 5.00;
            distanceRate = 5.00;
            baseFare = 10.00;
            score +=3;
          } else if (customer.subscriptionPlan === "PLATINUM") {
            passengerRate = 100.75;
            distanceRate = 50.75;
            baseFare = 250.00;
            score +=5;
          }
          score += customer.driversatsfaction/5; // increase score based on driver satisfaction, max 5 points
            tips = isNaN(customer.driversatsfaction) ? 0 : customer.driversatsfaction; // tips based on driver satisfaction, max 10% of fare
        const fare = baseFare + (distance/1000 * distanceRate) + ((isNaN(customer.passengers) ? 1 : customer.passengers) * passengerRate) + tips;
        // increased earnings amenities
        
        // Random ride time between 8-25 minutes
        const rideTime = Math.random() * 17 + 8;
        
        // Complete the ride
        this.VroomVroomCorp.completeRide(fare, rideTime);
        //ai debugging
        this.addEvent("RIDE", `${customer.id} completed ride - $${fare.toFixed(2)} earned`);
        // console.log(`${customer.id} completed ride - $${fare.toFixed(2)} earned`);
        // console.log(tips);
          // console.log("this ride is:"+score);
        // Remove from active matches
        this.activeMatches.delete((c) => c.id === customer.id);
        // Update driver rating and total rides based on completed delivery
        if (customer.assignedDriver) {
          const driver = this.availableDrivers.search((d) => d.id === customer.assignedDriver.id);
          if (driver) {
            driver.totalrides = (driver.totalrides || 0) + 1;
            driver.numRatings++;
            driver.totalrating += score;
            driver.avgrating = driver.totalrating / driver.numRatings;
            driver.lastRating = score; // record latest rating
            // update company-level averages as well
            this.VroomVroomCorp.totalrating += score;
            this.VroomVroomCorp.numRatings++;
            this.VroomVroomCorp.avgrating = this.VroomVroomCorp.totalrating / this.VroomVroomCorp.numRatings;
            this.VroomVroomCorp.lastRating = score; // update company last rating
            // console.log("driver rating updated:", driver.avgrating);
            // console.log("company average rating updated:", this.VroomVroomCorp.avgrating);
            // console.log("driver total rides updated:", driver.totalrides);
          }
        }
      }
    });
  }

  handleExpirations() {
    // Move expired from pendingRequests to expiredRequests
    this.pendingRequests.traverse((customer) => {
      if (customer.status === "EXPIRED") {
        this.expiredRequests.insert(customer);
        this.pendingRequests.delete((c) => c.id === customer.id);
        this.addEvent("EXPIRE", `Request ${customer.id} expired without match`);
      }
    });
    // Move expired from activeMatches to expiredRequests
    this.activeMatches.traverse((customer) => {
      if (customer.status === "EXPIRED") {
        this.expiredRequests.insert(customer);
        this.activeMatches.delete((c) => c.id === customer.id);
        this.addEvent("EXPIRE", `Request ${customer.id} expired after match`);
      }
    });
  }



  renderDrivers() {
    // walk the availableDrivers linked list and call display() on each
    this.availableDrivers.traverse((driver) => {
      if (driver && typeof driver.display === "function") {
          if (dist(mouseX, mouseY, driver.location.x, driver.location.y) < 20) {
            fill(255, 255, 0);
            // Show driver details on hover
            textSize(12);
            textAlign(LEFT);
            //ui ai assisted
            text(`TIER: ${driver.cartier}`, driver.location.x + 15, driver.location.y - 10);
            text(`Rating: ${driver.avgrating.toFixed(1)}`, driver.location.x + 15, driver.location.y + 5);
            text(`Rides: ${driver.totalrides}`, driver.location.x + 15, driver.location.y + 20);
          }

        driver.display();

      }
    });
  }

  renderCustomers() {
    // walk the pendingRequests linked list and draw each customer (kill myself)
    this.pendingRequests.traverse((cust) => {
      if (cust.status === "EXPIRED") {
        this.pendingRequests.delete((c) => c.id === cust.id);
      }
      if (cust && typeof cust.display === "function") {

          if (dist(mouseX, mouseY, cust.location.x, cust.location.y) < 20) {
            //show destination and path
            //
          }

        cust.display();

      }
    });
    
    // also render matched/in-transit customers
    this.activeMatches.traverse((cust) => {
      if (cust.status === "EXPIRED") {
        this.activeMatches.delete((c) => c.id === cust.id);
      }
      if (cust && typeof cust.display === "function") {
        cust.display();
        if (cust.status === "DELIVERED") {
          // Move to expiredRequests or event log as needed
          this.activeMatches.delete((c) => c.id === cust.id);
          // this.expiredRequests.insert(cust); // if you want to keep track of delivered customers
        }

      }
    });
  }

  renderHUD() {
    fill(255);
    textSize(14);
    textAlign(LEFT);
    text("Vroom Vroom Corporation © 2026", 570, 25);
    //ui here, maybe show number of pending requests, available drivers, etc.
  }

  updateUI() { ///ai assisted
    const pendingCustomers = [];
    const matchedCustomers = [];
    const travelingCustomers = [];
    const allDrivers = [];

    // Collect pending customers
    this.pendingRequests.traverse((customer) => {
      if (customer.status === "PENDING") {
        pendingCustomers.push(customer);
      }
    });

    // Collect matched customers
    this.activeMatches.traverse((customer) => {
      if (customer.status === "MATCHED") {
        matchedCustomers.push(customer);
      }
    });

    // Collect traveling customers
    this.activeMatches.traverse((customer) => {
      if (customer.status === "TRAVELLING") {
        travelingCustomers.push(customer);
      }
    });

    // Collect all drivers
    this.availableDrivers.traverse((driver) => {
      allDrivers.push(driver);
    });

    // Update the UI manager
    if (this.uiManager) {
      this.uiManager.updateCustomerList(pendingCustomers, matchedCustomers, travelingCustomers, this);
      this.uiManager.updateDriverList(allDrivers);
      this.uiManager.updateTimeDisplay(this.timeManager);
      this.uiManager.updateEventLog(this.eventLog);
      
      // Update company info
      this.VroomVroomCorp.setActiveDrivers(allDrivers.length);
      this.uiManager.updateCompanyInfo(this.VroomVroomCorp.getCompanyData());
    }
  }

  addEvent(source, message) {
    const timestamp = this.timeManager.getFormattedDateTime();
    const event = {
      timestamp: timestamp,
      source: source,
      message: message
    };

    this.eventLog.insert(event);
    this.eventLogSize++;

    // If event log exceeds max size, remove the oldest (first) event
    if (this.eventLogSize > this.maxEventLogSize) {
      let firstEvent = null;
      this.eventLog.head.data;
      
      // Get the first event to delete
      if (this.eventLog.head) {
        firstEvent = this.eventLog.head.data;
        // Delete the first event by matching its reference
        this.eventLog.delete((e) => e === firstEvent);
        this.eventLogSize--;
      }
    }
  }
}
