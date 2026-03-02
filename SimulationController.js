class SimulationController {
  constructor(width, height) {
    this.map = new TownMap(width, height);

    // STUDENTS MUST INITIALIZE THESE AS LINKED LISTS
    this.availableDrivers = null;
    this.pendingRequests = null;
    this.activeMatches = null;
    this.expiredRequests = null;
    this.eventLog = null;

    this.spawnInterval = 180;
    this.frameCounter = 0;

    this.driverCounter = 1;
    this.customerCounter = 1;
  }

  update() {
    this.frameCounter++;

    if (this.frameCounter % this.spawnInterval === 0) {
      this.spawnRandomDriver();
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
    let loc = this.map.getRandomLocation();
    let driver = new Driver("D" + this.driverCounter++, loc);

    // TODO: Insert into availableDrivers linked list
  }

  spawnRandomCustomer() {
    let loc = this.map.getRandomLocation();
    let customer = new Customer("C" + this.customerCounter++, loc);

    // TODO: Insert into pendingRequests linked list
  }

  updateDrivers() {
    // TODO:
    // Traverse driver list and call driver.update()
  }

  processMatching() {
    /*
      STUDENTS IMPLEMENT:

      1. Traverse pendingRequests
      2. For each request:
         - Traverse availableDrivers
         - Compute composite score
         - Select best driver
      3. Move nodes between lists
      4. Add event to eventLog
    */
  }

  handleExpirations() {
    /*
      STUDENTS IMPLEMENT:

      - If request older than time window
      - Remove from pendingRequests
      - Add to expiredRequests
      - Log event
    */
  }

  renderDrivers() {
    // Traverse availableDrivers list and call render()
  }

  renderCustomers() {
    // Traverse pendingRequests list and call render()
  }

  renderHUD() {
    fill(0);
    textSize(14);
    textAlign(LEFT);
    text("Ride-Share Simulation", 20, 25);
  }
}
