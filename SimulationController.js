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
    this.firedDrivers = new LinkedList();
    this.eventLog = new LinkedList(); //event log might incude active and expired requests, or we can have separate logs for each
    this.eventLogSize = 0;
    this.maxEventLogSize = 50;
    this.requestcount = 0;
    this.lastCustomerSortCount = 0;
    this.frameCounter = 0;
//ai aissisted
    // Grid for spatial bucketing of drivers (10x10 grid for 800x600 map)
    this.gridSize = 10;
    this.cellWidth = width / this.gridSize;
    this.cellHeight = height / this.gridSize;
    this.driverGrid = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill().map(() => new LinkedList()));
    this.lastGridUpdate = 0;

    this.driverCounter = 1;
    this.customerCounter = 1;
    this.lastMonthlyHiringTime = this.timeManager.getSimulationTime();
    this.uiManager = new UIManager();
    this.showDriverLabels = true;
    this.showCustomerLabels = true;
    //ai assisted
    this.showVisualizations = true;
    //ai assisted
    this.debugMode = false;
    this.lastMatchTime = 0;
    this.longestMatchTime = 0;
    this.matchTimes = [];
    this.matchTimeWindow = 100;
    this.matchTimeIndex = 0;
    // Idle time tracking for debug mode
    this.totalCustomerIdleTime = 0;
    this.totalDriverIdleTime = 0;
    this.totalCustomerTime = 0;
    this.totalDriverTime = 0;
    this.lastIdleUpdateTime = this.timeManager.getSimulationTime();
    this.addEvent("SYSTEM", "Simulation started");
    //inital spawning for drivers
    for (let i = 0; i < 1000; i++) {
          this.spawnRandomDriver();
    }
    // Initialize driver grid with spawned drivers
    this.updateDriverGrid();
    //test case for spawning customers at start
    // for (let i = 0; i < 1000; i++) {
    //   this.spawnRandomCustomer();
    // }
       
            
  }

  update() {
    this.frameCounter++;

    // Update idle time tracking for debug mode
    const currentTime = this.timeManager.getSimulationTime();
    const deltaTime = currentTime - this.lastIdleUpdateTime;
    if (deltaTime > 0) {
      // Count idle customers (status PENDING)
      let idleCustomerCount = 0;
      this.pendingRequests.traverse((customer) => {
        if (customer.status === "PENDING") {
          idleCustomerCount++;
        }
      });
      this.totalCustomerIdleTime += idleCustomerCount * deltaTime;

      // Count idle drivers (state IDLE)
      let idleDriverCount = 0;
      this.availableDrivers.traverse((driver) => {
        if (driver.state === "IDLE") {
          idleDriverCount++;
        }
      });
      this.totalDriverIdleTime += idleDriverCount * deltaTime;

      // Accumulate total existence time
      this.totalCustomerTime += (this.pendingRequests.size + this.activeMatches.size + this.expiredRequests.size) * deltaTime;
      this.totalDriverTime += this.availableDrivers.size * deltaTime;

      this.lastIdleUpdateTime = currentTime;
    }
           
    //note: keep drivers constant for now
    this.MassLayoffs();
    // Calculate dynamic spawn interval based on current time
    const baseSpawnInterval = this.calculateSpawnInterval();
    const timeScale = this.timeManager.getTimeScale();
    const spawnInterval = Math.max(1, Math.round(baseSpawnInterval));

    if (this.frameCounter % spawnInterval === 0) {
      const spawnCount = Math.max(1, Math.round((this.driverCounter / 200)*timeScale));
      for (let i = 0; i < spawnCount; i++) { // spawn multiple customers if timeScale is high to keep up with accelerated time
        this.spawnRandomCustomer();
      }
    }

    this.csorttimer(this.requestcount);
//if (this.frameCounter % 5 === 0) {  // Update every 5 frames (helps perforance?)
    this.updateDrivers();
    //ai aissisted
    if (this.frameCounter % 10 === 0) {
      this.updateDriverGrid();
    }
    this.updateCustomers();
//}
   this.processMatching();      // STUDENTS IMPLEMENT
  // this.handleExpirations();    // STUDENTS IMPLEMENT
    
    // Update UI sidebar with active customers
    if (this.frameCounter % 10 === 0) { // Update UI every 10 frames to reduce overhead
    this.updateUI();
    }

    // Trigger monthly hiring at fixed simulation intervals.
    const currentSimTime = this.timeManager.getSimulationTime();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    if (currentSimTime - this.lastMonthlyHiringTime >= weekMs) { // 15 day timer is ai assisted
      //keep drivers constant for now
      //this.monthlyHiring();
      // Keep the next cycle aligned to 15 days. If we are far past one or more cycles, catch up.
      const cyclesPassed = Math.floor((currentSimTime - this.lastMonthlyHiringTime) / weekMs);
      this.lastMonthlyHiringTime += cyclesPassed * weekMs;
    }

  }

  display() {
    if (!this.showVisualizations) {
      // Still show debug info even when visualizations are hidden
      this.renderDebugInfo();
      return;
    }
    this.map.drawGrid();
    this.renderDrivers();
    this.renderCustomers();
    this.renderHUD();
    // Draw debug info last so it's on top
    this.renderDebugInfo();
  }
  //hire and fire drivers at the end of each month based on profit and satisfaction
  fireDriver(driver, reason) {
    if (!driver) return;
    if (driver.status !== "AVAILABLE") return; // only fire available drivers
    const removed = this.availableDrivers.delete((d) => d.id === driver.id);
    if (!removed) return;
    driver.status = "FIRED";
    driver.fireReason = reason;
    this.firedDrivers.insert(driver);
    this.addEvent(driver.id, reason);
    this.driverCounter--;
          this.monthlyHiring(); // hire a new driver to replace the fired one, keeping total driver count constant
  }

  MassLayoffs() {
    this.availableDrivers.traverse((driver) => {
      //add cant fire drivers if list is at or under 5
      if (this.availableDrivers.size <= 5) {
        return;
      }

      if (!driver) return;

      if (driver.avgrating < 2 && driver.totalrides >= 10) {//this should be compan rating
        this.fireDriver(driver, "Fired due to low rating");
       // console.log(driver.id, "fired due to low rating:", driver.avgrating, "after", driver.totalrides, "rides");
      } else if (driver.avgrating < this.VroomVroomCorp.avgrating && driver.totalrides >= 20) {
        this.fireDriver(driver, "Fired due to below average rating");
        //console.log(driver.id, "fired due to below average rating:", driver.avgrating, "compared to company average of", this.VroomVroomCorp.avgrating, "after", driver.totalrides, "rides");
      } else if (driver.status === "INACTIVE") {
        this.fireDriver(driver, "Fired due to inactivity");
       // console.log(driver.id, "fired due to inactivity");
      }

    });
  }

  monthlyHiring() { //weekly now but whatever
    //every month, hire the avgrating # of drivers (rounded down) remove cost of hiring from earnings, add to expenses, then add new drivers to available drivers linked list
    const driversToHire = 1; //may cahnge to fixed value 
    //for (let i = 0; i < driversToHire; i++) {
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
      //this.driverCounter++;
      console.log("this.driverCounter: " + this.driverCounter);
   // }
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
    // Cap pending requests to prevent runaway list growth, this could be adj based on driver amt
    if (this.pendingRequests.size >= this.driverCounter*2) {
      return; // Stop spawning if queue is too large
    }
    this.requestcount++;
    const loc = this.map.getRandomLocation();
    const dest = this.map.getRandomLocation();
    const customer = new Customer("C" + this.customerCounter++, loc, dest, this.timeManager);
    this.pendingRequests.insert(customer);
    //assisted doucmentation
    this.addEvent(customer.id, `New request with ${customer.passengers} passengers from (${Math.round(loc.x)}, ${Math.round(loc.y)}) to (${Math.round(dest.x)}, ${Math.round(dest.y)})`);
    this.VroomVroomCorp.updateFinancials(10); //change with customer class, maybe based on passengers or distance or smth
  }
  //ai assisted grid update, only update every 10 frames to save on performance, maybe make this adaptive based on how many drivers there are or something

  updateDriverGrid() {
    // Clear the grid
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        this.driverGrid[y][x] = new LinkedList();
      }
    }
    // Populate the grid with current driver positions
    this.availableDrivers.traverse((driver) => {
      const cellX = Math.floor(driver.location.x / this.cellWidth);
      const cellY = Math.floor(driver.location.y / this.cellHeight);
      if (cellX >= 0 && cellX < this.gridSize && cellY >= 0 && cellY < this.gridSize) {
        this.driverGrid[cellY][cellX].insert(driver);
      }
    });
  }

  // Calculate spawn interval based on current simulation time
  // Returns shorter intervals during peak hours for increased spawning rates
  calculateSpawnInterval() { //ai assisted
    const hour = this.timeManager.getHour();
    const isWeekday = this.timeManager.isWeekday();

    // Peak hours: 7-9 AM (7:00-9:59) and 4-6 PM (16:00-18:59)
    const isMorningPeak = hour >= 7 && hour < 10;
    const isEveningPeak = hour >= 16 && hour < 19;
    //source https://www.daisylimo.com/blog/when-is-rush-hour-in-new-york-and-new-jersey/
    // base interval depends on peak vs off-peak (ai assisted)
    const baseInterval = (isWeekday && (isMorningPeak || isEveningPeak)) ? 30 : 90;
    



    // adjust interval based on company average rating
    // higher rating -> more frequent spawns, lower rating -> slower spawns
    // const ratingFactor = 1 + (this.VroomVroomCorp.avgrating || 1); // keep rating effect

    // if there are many drivers, spawn passengers faster at ~1 driver : 1.5 customers
    const driverCount = this.availableDrivers ? this.availableDrivers.size : 0;
    const driverSpawnFactor = 1 + (driverCount ** 2)/100;

    // combine base interval with rating and driver supply
    const interval = baseInterval / (1 * driverSpawnFactor); //change 1 to ratingFactor
    
    // Reduce spawn rate to 30% during night hours (10 PM to 6 AM)
    const isNight = hour >= 22 || hour < 6;
    const nightMultiplier = isNight ? 1 / 0.3 : 1;
    const adjustedInterval = interval * nightMultiplier;
    
    return Math.max(1, Math.round(adjustedInterval));
  }

  updateDrivers() {
    // TODO:
    // Traverse driver list and call driver.update()
    this.availableDrivers.traverse((driver) => driver.update());
  }

  updateCustomers() {
    this.pendingRequests.traverse((customer) => {
  customer.update();
  if (customer.status === "EXPIRED") {
    this.expiredRequests.insert(customer);
    this.pendingRequests.delete((c) => c.id === customer.id);
    this.addEvent("EXPIRE", `Request ${customer.id} expired without match`);
  }
});
this.activeMatches.traverse((customer) => {
  customer.update();
  if (customer.status === "EXPIRED") {
    this.expiredRequests.insert(customer);
    this.activeMatches.delete((c) => c.id === customer.id);
    if (this.frameCounter % 5 !== 0) return;

      if (customer.status === "EXPIRED") {
        this.expiredRequests.insert(customer);
        this.activeMatches.delete((c) => c.id === customer.id);
        this.addEvent("EXPIRE", `Request ${customer.id} expired after match`);
      }
 
  }
});
this.handleRideCompletions();

  }

//driversort()
//{
//every 14 days, sort drivers based on rating
//highest frst
//lowest last
//greater likelihood of a match early, lowering wait times
//}

csorttimer(requestCount) {
  // every 500 requests, sort customers based on priority once per 50-request milestone
  if (requestCount > 0 && requestCount % 1000 === 0 && 
        requestCount > this.lastCustomerSortCount && 
        this.pendingRequests.size <= 2000)  {
    this.customersort();
    this.lastCustomerSortCount = requestCount;
   // console.log("customerssorted");
    //debugging
      //console.log("Customer list order:");
  this.pendingRequests.traverse((customer) => {
   // console.log(` - ${customer.id}: ${customer.subscriptionPlan}, ${customer.expireTime}, ${customer.passengers}, ${customer.amenitiesRequired ? customer.amenitiesRequired.length : 0}`);
  });
  }
  //every 50 passenger requests, sort customers based on priority
  //priority sub tier > time until expiry > passenger count > amenity count
  //log list order for debugging purposes


}

customersort()
{
  // every 50 requests (configurable), order passengers to prioritize higher paying and more needy
  // priority sub tier > time until expiry > passenger count > amenity count
  // quicksort implimentation from ai (stole this from tony hoerr himselve)
  const items = [];
  this.pendingRequests.traverse((customer) => {
    items.push(customer);
  });

     // Skip sorting for very small or very large lists
    if (items.length <= 1 || items.length > 2500) {
      return;
    }

  const swap = (arr, i, j) => {
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  };

  const shouldSwap = (left, right) => {
    // TODO: replace this comparison logic with your own priority conditions.
    // Return true when `left` should come before `right` in the sorted order.
    //sub tier priority > time until expiry > passenger count > amenity count
    if (left.subscriptionPlan !== right.subscriptionPlan) {
      const tierPriority = { "PLATINUM": 4, "GOLD": 3, "SILVER": 2, "BASIC": 1, "POOR": 0 };
      return (tierPriority[left.subscriptionPlan] || 0) > (tierPriority[right.subscriptionPlan] || 0);
    } else if (left.expireTime !== right.expireTime) {
      return left.expireTime < right.expireTime; // earlier expiry first
    } else if (left.passengers !== right.passengers) {
      return left.passengers > right.passengers; // more passengers first
    } else {
      const leftAmenities = left.amenitiesRequired ? left.amenitiesRequired.length : 0;
      const rightAmenities = right.amenitiesRequired ? right.amenitiesRequired.length : 0;
      return leftAmenities > rightAmenities; // more amenities first
    } 

  };

  const partition = (arr, low, high) => {
    const pivot = arr[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
      if (shouldSwap(arr[j], pivot)) {
        i += 1;
        swap(arr, i, j);
      }
    }

    swap(arr, i + 1, high);
    return i + 1;
  };

  const quickSortRange = (arr, low, high) => {
    if (low < high) {
      const pivotIndex = partition(arr, low, high);
      quickSortRange(arr, low, pivotIndex - 1);
      quickSortRange(arr, pivotIndex + 1, high);
    }
  };

  quickSortRange(items, 0, items.length - 1);

  this.pendingRequests = new LinkedList();
  items.forEach((customer) => this.pendingRequests.insert(customer));
}
//ai assisted sorting algoritm for distance
  findClosestDrivers(customer, customerLocation, minCapacity, baseLimit, requestFactor) {
    // Calculate active requests (pending + active matches)
    const activeRequests = this.pendingRequests.size + this.activeMatches.size;
    
    // Adjust limit: more requests = fewer drivers evaluated, but not below 3
    const adjustedLimit = Math.max(3, Math.floor(baseLimit - (activeRequests * requestFactor)));
    
    const candidates = [];
    // Use grid-based bucketing to check only nearby drivers
    const cellX = Math.floor(customerLocation.x / this.cellWidth);
    const cellY = Math.floor(customerLocation.y / this.cellHeight);
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const cx = cellX + dx;
        const cy = cellY + dy;
        if (cx >= 0 && cx < this.gridSize && cy >= 0 && cy < this.gridSize) {
          this.driverGrid[cy][cx].traverse((driver) => {
            if (driver.status !== "AVAILABLE") return;
            if (driver.capacity < minCapacity) return;
            const distance = this.map.getDistance(driver.location, customerLocation);
            const now = this.timeManager.getSimulationTime();
            let remaining_ms = customer.expireTime - now;
            const traveltime = (distance / Math.max(driver.speed, 0.1)) * (1000/60); // time to reach customer in ms
            if (traveltime > remaining_ms) return; // can't reach in time
            candidates.push({ driver, distance });
          });
        }
      }
    }
    // Sort by distance ascending
    candidates.sort((a, b) => a.distance - b.distance);
    // Return top adjustedLimit drivers
    return candidates.slice(0, adjustedLimit).map(c => c.driver);
  }

  processMatching() {
    const startTime = performance.now();
    // Get the first pending customer
    this.pendingRequests.traverse((customer) => {
    //prioritize hier teir cousmuers, customer sort here
    if (!customer || customer.status !== "PENDING") return; // no pending requests
    //driver sort
    let bestDriver = null;
    let bestScore = -Infinity;
  
    // Get the first available driver that can reach within time
    //limit to the x closest drivers, maybe conditional to rush hours
    // => means its a function
    //10 closest drivers

    let candidates = [];
    if (this.availableDrivers.size <= 50) {
      // For small number of drivers, search all available drivers, ignore distance
      this.availableDrivers.traverse((d) => {
        if (d.status !== "AVAILABLE") return;
        if (d.capacity < customer.passengers) return;
        const distance = this.map.getDistance(d.location, customer.location);
        const now = this.timeManager.getSimulationTime();
        let remaining_ms = customer.expireTime - now;
        const traveltime = (distance / Math.max(d.speed, 0.1)) * (1000/60); // time to reach customer in ms
        if (traveltime > remaining_ms) return; // can't reach in time
        candidates.push(d);
      });
    } else {
      candidates = this.findClosestDrivers(customer, customer.location, customer.passengers, 20, 0.05*(this.driverCounter/10));
    }

    for (let d of candidates) {
      //time check
      let distance = this.map.getDistance(d.location, customer.location);

      //logging is ai assisted for debugging pruposes
     
      //distance score = like 100 - distacee, so closer drivers get higher score
      //amenity score = if driver has all amenities, +50, if missing 1 amenity, -20, missing 2 amenities -40, missing 3 amenities -60, missing all amenities -80
      let distanceScore = this.availableDrivers.size <= 50 ? 0 : (100 - distance); // ignore distance for small driver count
      let amenityScore = 0;
      let ratingScore = d.avgrating * 20; // convert rating to a score out of 100

      // const requiredAmenities = customer.amenitiesRequired; // note:ai recommeded putting || [];
      // for (let i = 0; i < requiredAmenities.length; i++) {
      //   for (let j = 0; j < d.amenities.length; j++) {
      //     if(d.amenities[j] === requiredAmenities[i]){
      //       amenityScore += 30;
      //     }
      //   }
      // }
      const requiredAmenities = customer.amenitiesRequired || [];
for (let req of requiredAmenities) {
  if (d.amenitySet && d.amenitySet.has(req)) {
    amenityScore += 30;
  }
}
      let currentscore = distanceScore + amenityScore + ratingScore;// add scores
      if (currentscore > bestScore) {
        bestScore = currentscore;
        bestDriver = d;
   
      }
      
      // go to next driver in the list and repeat, if driver next is false, return highest rated driver
      // during rush hours, perhaps limit the amount of drivers assesed per passenger to speed up matching
    }
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
    //ai assisded data alansiis
    const endTime = performance.now();
    this.lastMatchTime = endTime - startTime;

    const oldValue = this.matchTimes.length === this.matchTimeWindow
      ? this.matchTimes[this.matchTimeIndex]
      : null;

    if (this.matchTimes.length < this.matchTimeWindow) {
      this.matchTimes.push(this.lastMatchTime);
    } else {
      this.matchTimes[this.matchTimeIndex] = this.lastMatchTime;
    }

    this.matchTimeIndex = (this.matchTimeIndex + 1) % this.matchTimeWindow;

    if (this.lastMatchTime >= this.longestMatchTime) {
      this.longestMatchTime = this.lastMatchTime;
    } else if (oldValue === this.longestMatchTime) {
      this.longestMatchTime = Math.max(...this.matchTimes);
    }
  }

//monee

  handleRideCompletions() {
    // Check for completed rides and generate revenue
    this.activeMatches.traverse((customer) => {
        if (customer.status === "DELIVERED") {
        // Calculate fare based on distance and passengers
          const rawDistance = this.map.getDistance(customer.location, customer.destination);
          const distance = isNaN(rawDistance) ? 0 : rawDistance; // ai debugging
        let score =0;
        //scoreing class : 0:1:3:5 +- up to 20/5 -> 4  
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
          
          // Clamp score to 0-5 range
          score = Math.max(0, Math.min(5, score));
          
            tips = isNaN(customer.driversatsfaction) ? 0 : customer.driversatsfaction; // tips based on driver satisfaction, max 10% of fare
        const fare = baseFare + (distance/1000 * distanceRate) + ((isNaN(customer.passengers) ? 1 : customer.passengers) * passengerRate) + tips; // ai assisted debugging
        // increased earnings amenities
        
        // Random ride time between 8-25 minutes
        const rideTime = Math.random() * 17 + 8;// temp ride time for testing, might remove later
        
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
            //ai assisted documentation
            driver.totalrides = (driver.totalrides || 0) + 1;
            //rating systme
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
        // Batch expiration handling - only check every 5 frames
    if (this.frameCounter % 5 !== 0) return;
    // Move expired from pendingRequests to expiredRequests
    // this.pendingRequests.traverse((customer) => {
    //   if (customer.status === "EXPIRED") {
    //     this.expiredRequests.insert(customer);
    //     this.pendingRequests.delete((c) => c.id === customer.id);
    //     this.addEvent("EXPIRE", `Request ${customer.id} expired without match`);
    //   }
    // });
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
    if (!this.showVisualizations) return;
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

        driver.display(this.showDriverLabels);

      }
    });
  }

  renderCustomers() {
    if (!this.showVisualizations) return;
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

        cust.display(this.showCustomerLabels);

      }
    });
    
    // also render matched/in-transit customers
    this.activeMatches.traverse((cust) => {
      if (cust.status === "EXPIRED") {
        this.activeMatches.delete((c) => c.id === cust.id);
      }
      if (cust && typeof cust.display === "function") {
        cust.display(this.showCustomerLabels);
        if (cust.status === "DELIVERED") {
          // Move to expiredRequests or event log as needed
          this.activeMatches.delete((c) => c.id === cust.id);
         
        }

      }
    });
  }

  renderHUD() {
    fill(255);
    textSize(14);
    textAlign(LEFT);
    text("Vroom Vroom Corporation © 2026", 570, 25);
   
  }

  renderDebugInfo() {//ai asisst
    if (!this.debugMode) return;
    
    // Save current drawing state
    push();
    
    // Position to match copyright location
    const x = 570;
    const y = 25;
    
    // Draw debug text with black outline for visibility
    fill(255, 0, 0); // red text
    stroke(0); // black outline
    strokeWeight(3);
    textSize(14);
    textAlign(LEFT);
    text("Vroom Vroom Corporation © 2026", x, y);
    text(`Last match time: ${this.lastMatchTime.toFixed(2)}ms`, x + 10, y + 20);
    
    // Calculate average of last 100 match times
    const avgMatchTime = this.matchTimes.length > 0 ? this.matchTimes.reduce((a, b) => a + b, 0) / this.matchTimes.length : 0;
    text(`Avg match time (last 100): ${avgMatchTime.toFixed(2)}ms`, x + 10, y + 40);
    
    // Calculate average idle time per day per entity
    const minutesPerDay = 24 * 60;
    const avgCustomerIdleMinutesPerDay = this.totalCustomerTime > 0 ? (this.totalCustomerIdleTime / this.totalCustomerTime) * minutesPerDay : 0;
    const avgDriverIdleMinutesPerDay = this.totalDriverTime > 0 ? (this.totalDriverIdleTime / this.totalDriverTime) * minutesPerDay : 0;
    text(`Avg customer idle time/day: ${avgCustomerIdleMinutesPerDay.toFixed(2)} minutes`, x + 10, y + 60);
    text(`Avg driver idle time/day: ${avgDriverIdleMinutesPerDay.toFixed(2)} minutes`, x + 10, y + 80);
    
    text(`Debug: ${this.pendingRequests.size} pending, ${this.availableDrivers.size} drivers`, x + 10, y + 100);
    
    // Draw pie chart for drivers and customers ai assisted
    let driverIdleCount = 0;
    let driverEnRouteCount = 0;
    let driverToDestinationCount = 0;
    let driverInactiveCount = 0;
    let driverOtherCount = 0;

    this.availableDrivers.traverse((driver) => {
      if (!driver) return;
      if (driver.status === "INACTIVE") {
        driverInactiveCount += 1;
      } else if (driver.state === "IDLE") {
        driverIdleCount += 1;
      } else if (driver.state === "EN_ROUTE") {
        driverEnRouteCount += 1;
      } else if (driver.state === "TO_DESTINATION") {
        driverToDestinationCount += 1;
      } else {
        driverOtherCount += 1;
      }
    });

    const pendingCount = this.pendingRequests.size;
    let matchedCount = 0;
    let inTransitCount = 0;
    this.activeMatches.traverse((customer) => {
      if (customer.status === "MATCHED") {
        matchedCount++;
      } else if (customer.status === "TRAVELLING") {
        inTransitCount++;
      }
    });
    const total = driverIdleCount + driverEnRouteCount + driverToDestinationCount + driverInactiveCount + driverOtherCount + pendingCount + matchedCount + inTransitCount;
    if (total > 0) {
      const pieX = 400;
      const pieY = height - 300;
      const pieRadius = 100;
      
      // Title
      fill(255);
      textAlign(CENTER);
      textSize(14);
      text("Simulation Breakdown", pieX, pieY - pieRadius - 30);
      
      let startAngle = 0;
      const driverIdleAngle = (driverIdleCount / total) * TWO_PI;
      const driverEnRouteAngle = (driverEnRouteCount / total) * TWO_PI;
      const driverToDestinationAngle = (driverToDestinationCount / total) * TWO_PI;
      const driverInactiveAngle = (driverInactiveCount / total) * TWO_PI;
      const driverOtherAngle = (driverOtherCount / total) * TWO_PI;
      const pendingAngle = (pendingCount / total) * TWO_PI;
      const matchedAngle = (matchedCount / total) * TWO_PI;
      const inTransitAngle = (inTransitCount / total) * TWO_PI;
      
      noStroke();
      
      // Driver idle slice (yellow - warm)
      fill(255, 255, 0);
      arc(pieX, pieY, pieRadius * 2, pieRadius * 2, startAngle, startAngle + driverIdleAngle);
      startAngle += driverIdleAngle;
      
      // Driver en route slice (orange - warm)
      fill(255, 165, 0);
      arc(pieX, pieY, pieRadius * 2, pieRadius * 2, startAngle, startAngle + driverEnRouteAngle);
      startAngle += driverEnRouteAngle;
      
      // Driver to destination slice (red - warm)
      fill(255, 0, 0);
      arc(pieX, pieY, pieRadius * 2, pieRadius * 2, startAngle, startAngle + driverToDestinationAngle);
      startAngle += driverToDestinationAngle;
      
      // Driver inactive slice (brown - warm)
      fill(139, 69, 19);
      arc(pieX, pieY, pieRadius * 2, pieRadius * 2, startAngle, startAngle + driverInactiveAngle);
      startAngle += driverInactiveAngle;
      
      // Driver other slice (pink - warm)
      if (driverOtherCount > 0) {
        fill(255, 192, 203);
        arc(pieX, pieY, pieRadius * 2, pieRadius * 2, startAngle, startAngle + driverOtherAngle);
        startAngle += driverOtherAngle;
      }
      
      // Pending customer slice (blue - cool)
      fill(0, 0, 255);
      arc(pieX, pieY, pieRadius * 2, pieRadius * 2, startAngle, startAngle + pendingAngle);
      startAngle += pendingAngle;
      
      // Matched customer slice (green - cool)
      fill(0, 255, 0);
      arc(pieX, pieY, pieRadius * 2, pieRadius * 2, startAngle, startAngle + matchedAngle);
      startAngle += matchedAngle;
      
      // In transit customer slice (purple - cool)
      fill(128, 0, 128);
      arc(pieX, pieY, pieRadius * 2, pieRadius * 2, startAngle, startAngle + inTransitAngle);
      
      // Add labels, split by drivers (left) and passengers (right)
      textAlign(CENTER);
      textSize(12);
      stroke(0);
      strokeWeight(2);

      // Drivers (left side)
      fill(255, 255, 0); // idle - yellow
      text(`Idle: ${driverIdleCount}`, pieX - pieRadius - 60, pieY - 40);

      fill(255, 165, 0); // en route - orange
      text(`En route: ${driverEnRouteCount}`, pieX - pieRadius - 60, pieY - 20);

      fill(255, 0, 0); // to dest - red
      text(`To dest: ${driverToDestinationCount}`, pieX - pieRadius - 60, pieY);

      fill(139, 69, 19); // inactive - brown
      text(`Inactive: ${driverInactiveCount}`, pieX - pieRadius - 60, pieY + 20);

      if (driverOtherCount > 0) {
        fill(255, 192, 203); // other - pink
        text(`Other: ${driverOtherCount}`, pieX - pieRadius - 60, pieY + 40);
      }

      // Passengers (right side)
      fill(0, 0, 255); // pending - blue
      text(`Pending: ${pendingCount}`, pieX + pieRadius + 60, pieY - 20);

      fill(0, 255, 0); // matched - green
      text(`Matched: ${matchedCount}`, pieX + pieRadius + 60, pieY);

      fill(128, 0, 128); // in transit - purple
      text(`In transit: ${inTransitCount}`, pieX + pieRadius + 60, pieY + 20);
    }
    
    // Restore drawing state
    pop();
  }

  updateUI() { ///ai assisted
    const pendingCustomers = [];
    const matchedCustomers = [];
    const travelingCustomers = [];
    const expiredCustomers = [];
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

    // Collect expired customers
    this.expiredRequests.traverse((customer) => {
      expiredCustomers.push(customer);
    });

    // Collect all drivers
    this.availableDrivers.traverse((driver) => {
      allDrivers.push(driver);
    });

    const firedDrivers = [];
    this.firedDrivers.traverse((driver) => {
      firedDrivers.push(driver);
    });

    // Update the UI manager
    if (this.uiManager) {
      this.uiManager.updateCustomerList(pendingCustomers, matchedCustomers, travelingCustomers, expiredCustomers, this);
      this.uiManager.updateDriverList(allDrivers, firedDrivers);
      this.uiManager.updateTimeDisplay(this.timeManager);
      this.uiManager.updateEventLog(this.eventLog);
      
      // Update company info
      this.VroomVroomCorp.setActiveDrivers(allDrivers.length);
      this.VroomVroomCorp.setExpiredRequests(expiredCustomers.length);
      this.uiManager.updateCompanyInfo(this.VroomVroomCorp.getCompanyData());
    }
  }
//ai assisted event logging system, logs important events like matches, expirations, hirings, firings, and rides with timestamps. This can be displayed in the UI for debugging and player information.
  addEvent(source, message) {
    const timestamp = this.timeManager.getFormattedDateTime();
    const event = {
      timestamp: timestamp,
      source: source,
      message: message
    };

    this.eventLog.insert(event);
    this.eventLogSize++;
    if (this.eventLogSize > this.maxEventLogSize) {
  // Traverse and delete old events
  //export log to console for debugging before deleting
 // console.log("Event log exceeded max size. Exporting log:");
  //turn off for perforance
  // this.eventLog.traverse((e) => {
  //   //console.log("exported event");
  //   console.log(`[${e.timestamp}] ${e.source}: ${e.message}`);
  // });
  this.eventLog.delete(() => true); // delete all events
  this.eventLogSize = 0;
}
  }
}
