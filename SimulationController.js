class SimulationController {
  constructor(width, height) {
    this.map = new TownMap(width, height);


    
    // STUDENTS MUST INITIALIZE THESE AS LINKED LISTS
    this.availableDrivers = new LinkedList();
    this.pendingRequests = new LinkedList();
    this.activeMatches = null;
    this.expiredRequests = null;
    this.eventLog = null; //event log might incude active and expired requests, or we can have separate logs for each

    this.spawnInterval = 180;
    this.frameCounter = 0;

    this.driverCounter = 1;
    this.customerCounter = 1;
          this.spawnRandomDriver();
  }

  update() {
    this.frameCounter++;

    if (this.frameCounter % this.spawnInterval === 0) { //temp spawn logic

      this.spawnRandomCustomer();
    }

    this.updateDrivers();

    this.processMatching();      // STUDENTS IMPLEMENT
    this.handleExpirations();    // STUDENTS IMPLEMENT
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
  }

  spawnRandomCustomer() {
    const loc = this.map.getRandomLocation();
    const dest = this.map.getRandomLocation();
    const customer = new Customer("C" + this.customerCounter++, loc, dest);
    this.pendingRequests.insert(customer);
  }

  updateDrivers() {
    // TODO:
    // Traverse driver list and call driver.update()
    this.availableDrivers.traverse((driver) => driver.update());
  }

  processMatching() {
    // Get the first pending customer
    const firstCustomer = this.pendingRequests.search(() => true);
    
    // Get the first available driver
    const driver = this.availableDrivers.search(
      (d) => d.status === "AVAILABLE"
    );
    
    // If both exist, assign the customer as the driver's target
    if (driver && firstCustomer) {
      driver.assignRide(firstCustomer, 300);
      firstCustomer.aknowledgeMatch();

      // Remove the customer from pendingRequests
      this.pendingRequests.delete((c) => c.id === firstCustomer.id);
    }
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
      if (cust && typeof cust.display === "function") {
        cust.display();
      }
    });
  }

  renderHUD() {
    fill(0);
    textSize(14);
    textAlign(LEFT);
    text("Vroom Vroom", 20, 25);
    //ui here, maybe show number of pending requests, available drivers, etc.
  }
}
