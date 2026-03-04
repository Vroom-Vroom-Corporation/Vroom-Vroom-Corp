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
  }

  update() {
    this.frameCounter++;

    if (this.frameCounter % this.spawnInterval === 0) { //temp spawn logic
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

    // TODO: Insert into availableDrivers linked list <<<<<
    this.availableDrivers.insert(driver);
  }

  spawnRandomCustomer() {
    let loc = this.map.getRandomLocation();
    let customer = new Customer("C" + this.customerCounter++, loc);
this.pendingRequests.insert(customer);
    // TODO: Insert into pendingRequests linked list
  }

  updateDrivers() {
    // TODO:
    // Traverse driver list and call driver.update()
    this.availableDrivers.traverse((driver) => driver.update());
  }

  processMatching() {//<match algo
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
    // Traverse availableDrivers list and call render()
  //   if (this.head===null)
  // {
  //   return
  // }
  //   else{
  //     let prev=null;
  //     let current= this.head;
  //     for(let i=0; i<this.size; i++)
  //       {
  //         while(current.data!==i)
  //           {
  //              prev=current;
  //              //prev.isdeleverd=true;
  //             current=current.next;
  //           }
  //         if(current.data==i)
  //           current.display();
  //       }
  //   }
  }

  renderCustomers() {
    // Traverse pendingRequests list and call render()
  //   if (this.head===null)
  // {
  //   return
  // }
  //   else{
  //     let prev=null;
  //     let current= this.head;
  //     for(let i=0; i<this.size; i++)
  //       {
  //         while(current.data!==i)
  //           {
  //              prev=current;
  //              //prev.isdeleverd=true;
  //             current=current.next;
  //           }
  //         if(current.data==i)
  //           current.display();
  //       }
  //   }
  }

  renderHUD() {
    fill(0);
    textSize(14);
    textAlign(LEFT);
    text("Ride-Share Simulation", 20, 25);
    //ui here, maybe show number of pending requests, available drivers, etc.
  }
}
