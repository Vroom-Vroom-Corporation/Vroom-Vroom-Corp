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
    this.uiManager = new UIManager();
    this.addEvent("SYSTEM", "Simulation started");
    //temp 3 drivers
    for (let i = 0; i < 10; i++) {
          this.spawnRandomDriver();
    }
       
            
  }

  update() {
    this.frameCounter++;
    
    // Calculate dynamic spawn interval based on current time
    const spawnInterval = this.calculateSpawnInterval();

    if (this.frameCounter % spawnInterval === 0) {
      this.spawnRandomCustomer();
    }

    this.updateDrivers();
    this.updateCustomers();

   this.processMatching();      // STUDENTS IMPLEMENT
    this.handleExpirations();    // STUDENTS IMPLEMENT
    
    // Update UI sidebar with active customers
    this.updateUI();
  }

  display() {
    this.map.drawGrid();
    this.renderDrivers();
    this.renderCustomers();
    this.renderHUD();
  }

  spawnRandomDriver() {
    const loc = this.map.getRandomLocation();
    // convert to p5.Vector so the driver has a proper location
    const vec = createVector(loc.x, loc.y);
    const driver = new Driver("D" + this.driverCounter++, vec);

    // insert into availableDrivers linked list
    this.availableDrivers.insert(driver);
    this.addEvent(driver.id, `Hired with capacity ${driver.capacity} at (${Math.round(vec.x)}, ${Math.round(vec.y)})`);
  }

  spawnRandomCustomer() {
    const loc = this.map.getRandomLocation();
    const dest = this.map.getRandomLocation();
    const customer = new Customer("C" + this.customerCounter++, loc, dest);
    this.pendingRequests.insert(customer);
    this.addEvent(customer.id, `New request with ${customer.passengers} passengers from (${Math.round(loc.x)}, ${Math.round(loc.y)}) to (${Math.round(dest.x)}, ${Math.round(dest.y)})`);
    this.VroomVroomCorp.updateFinancials(10); //change with customer class, maybe based on passengers or distance or smth
  }

  // Calculate spawn interval based on current simulation time
  // Returns shorter intervals during peak hours for increased spawning rates
  calculateSpawnInterval() {
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
    const interval = baseInterval / (1 + ratingFactor);
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
  }

  processMatching() {
    // Get the first pending customer
    const firstCustomer = this.pendingRequests.search(() => true);
    
    if (!firstCustomer) return; // no pending requests
    let bestDriver = null;
    let bestScore = -Infinity;
    let currentscore = -Infinity;
    // Get the first available driver that can reach within time
    const driver = this.availableDrivers.search(
      (d) => {
        if (d.status !== "AVAILABLE") return false;
        if (d.capacity < firstCustomer.passengers) return false; // capacity check
        let distance = this.map.getDistance(d.location, firstCustomer.location);
        let remaining_ms = firstCustomer.expireTime - millis();
        let frames_to_reach = distance / d.speed;
        let remaining_frames = remaining_ms * 60 / 1000; // assuming 60 FPS
        console.log(`Evaluating driver ${d.id}: distance=${distance}, frames_to_reach=${frames_to_reach.toFixed(2)}, remaining_frames=${remaining_frames.toFixed(2)}`);
        //distance score = like 100 - distacee, so closer drivers get higher score
        //amenity score = if driver has all amenities, +50, if missing 1 amenity, -20, missing 2 amenities -40, missing 3 amenities -60, missing all amenities -80
        let distanceScore = 100 - distance;
        let amenityScore = 0;
        if (Array.isArray(d.amenities)) {
          const requiredAmenities = firstCustomer.amenities || [];
          const hasAllRequired = requiredAmenities.every((amenity) => d.amenities.includes(amenity));
          if (hasAllRequired) {
            amenityScore = 50;
          } else {
            const missingAmenities = requiredAmenities.filter((amenity) => !d.amenities.includes(amenity));
            amenityScore = -20 * missingAmenities.length;
          }
        }
        currentscore = distanceScore + amenityScore;// add scores
        if (currentscore > bestScore) {
          bestScore = currentscore;
          bestDriver = d;
        }
        console.log(bestDriver.id, "score:", bestScore, "distanceScore:", distanceScore, "amenityScore:", amenityScore);
        // go to next driver in the list and repeat, if driver next is false, return highest rated driver
          if (!d.next) {
           console.log(bestDriver.id, "final best score:", bestScore);
            return true; // stop searching, we will return bestDriver after traversal

          } else {            return false; // keep searching for better driver
          }
        //if driver next is false, return highest rated driver
        //return frames_to_reach < remaining_frames;
      }
    );
    
    // If both exist, assign the customer as the driver's target
    if (driver && firstCustomer) {
      driver.assignRide(firstCustomer, 300);
      firstCustomer.aknowledgeMatch(driver);
      this.addEvent("MATCH", `${firstCustomer.id} matched with ${driver.id}`);
      // Move the customer from pendingRequests to activeMatches
      this.pendingRequests.delete((c) => c.id === firstCustomer.id);
      this.activeMatches.insert(firstCustomer);
    }
  }

  handleRideCompletions() {
    // Check for completed rides and generate revenue
    this.activeMatches.traverse((customer) => {
        if (customer.status === "DELIVERED") {
        // Calculate fare based on distance and passengers
          const distance = this.map.getDistance(customer.location, customer.destination);
        let score =0;
          let tips=0;
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
            tips = customer.driversatsfaction; // tips based on driver satisfaction, max 10% of fare
        const fare = baseFare + (distance/1000 * distanceRate) + (customer.passengers * passengerRate) + tips;
        // increased earnings amenities
        
        // Random ride time between 8-25 minutes
        const rideTime = Math.random() * 17 + 8;
        
        // Complete the ride
        this.VroomVroomCorp.completeRide(fare, rideTime);
        this.addEvent("RIDE", `${customer.id} completed ride - $${fare.toFixed(2)} earned`);
        console.log(`${customer.id} completed ride - $${fare.toFixed(2)} earned`);
        console.log(tips);
          console.log("this ride is:"+score);
        // Remove from active matches
        this.activeMatches.delete((c) => c.id === customer.id);
        // Update driver rating based on score (use assignedDriver reference)
        if (customer.assignedDriver) {
          const driver = this.availableDrivers.search((d) => d.id === customer.assignedDriver.id);
          if (driver) {
            driver.numRatings++;
            driver.totalrating += score;
            driver.avgrating = driver.totalrating / driver.numRatings;
            driver.lastRating = score; // record latest rating
            // update company-level averages as well
            this.VroomVroomCorp.totalrating += score;
            this.VroomVroomCorp.numRatings++;
            this.VroomVroomCorp.avgrating = this.VroomVroomCorp.totalrating / this.VroomVroomCorp.numRatings;
            this.VroomVroomCorp.lastRating = score; // update company last rating
            console.log("driver rating updated:", driver.avgrating);
            console.log("company average rating updated:", this.VroomVroomCorp.avgrating);
          }
        }
      }
    });
  }

  handleExpirations() {//<
    /*
      STUDENTS IMPLEMENT:

      - If request older than time window
      - Remove from pendingRequests
      - Add to expiredRequests
      - Log event
    */
  }

  renderDrivers() {
    // walk the availableDrivers linked list and call display() on each
    this.availableDrivers.traverse((driver) => {
      if (driver && typeof driver.display === "function") {
        driver.display();
      }
    });
  }

  renderCustomers() {
    // walk the pendingRequests linked list and draw each customer
    this.pendingRequests.traverse((cust) => {
      if (cust.status === "EXPIRED") {
        this.pendingRequests.delete((c) => c.id === cust.id);
      }
      if (cust && typeof cust.display === "function") {
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

  updateUI() {
    const pendingCustomers = [];
    const matchedCustomers = [];
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

    // Collect all drivers
    this.availableDrivers.traverse((driver) => {
      allDrivers.push(driver);
    });

    // Update the UI manager
    if (this.uiManager) {
      this.uiManager.updateCustomerList(pendingCustomers, matchedCustomers, this);
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
