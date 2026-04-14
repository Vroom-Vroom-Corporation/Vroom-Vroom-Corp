class Driver {
  constructor(id, locationX, locationY, capacity = int(random(1, 4)), amenities = []) {
    // Allow passing a p5.Vector, a plain object with x/y, or separate numbers
    this.id = id;
    this.totalrides=0;
    this.totalrating = 0;
    this.numRatings = 0;
    this.avgrating = 0;
    this.lastRating = 0; // most recent rating
    this.speed = int(random(1, 5)); // unique speed for each driver
    this.chance = int (random(0,100));
    this.cartier = 0;
    //80 basic 15 silver 4 gold 1 platinum
    if (this.chance <= 1) {
      this.cartier = 4;
    } else if (this.chance > 1 && this.chance <= 5) {
      this.cartier = 3;
    } else if (this.chance > 5 && this.chance <= 20) {
      this.cartier = 2;
    } else {
      this.cartier = 1;
    }

    // this.amenities = null;
    if (locationX instanceof p5.Vector) {
      // copy so external changes don't affect internal state
      this.location = locationX.copy();
    } else if (
      locationX &&
      typeof locationX.x === "number" &&
      typeof locationX.y === "number"
    ) {
      // plain object {x, y} from TownMap.getRandomLocation
      this.location = createVector(locationX.x, locationX.y);
    } else {
      this.location = createVector(locationX, locationY);
    }

    // keep last location to draw Manhattan steps
    this.prevLocation = this.location.copy();

    this.capacity = capacity;
    // start with an array so UI can safely call join() later (array is ai altered to match ui)
    this.amenities = Array.isArray(amenities) ? [...amenities] : [];

   // else want === 4 -> nothing, leave amenities array empty
    if (this.cartier === 1) {
      this.amenities.push("BASIC");
    this.want = int(random(0,4));
      this.assignamenities(this.want);
    } else if (this.cartier === 2) {
      this.amenities.push("SILVER");
      this.speed += 1; // Silver drivers are faster
      for (let i = 0; i < 2; i++) {
        this.want = int(random(0,4));
        this.assignamenities(this.want);
      }
    } else if (this.cartier === 3) {
      this.speed += 2; // Gold drivers are even faster
      this.amenities.push("GOLD");
      for (let i = 0; i < 3; i++) {
        this.want = int(random(0,4));
        this.assignamenities(this.want);
      }
    } else if (this.cartier === 4) {
      this.speed += 3; // Platinum drivers are the fastest
      this.amenities.push("PLATINUM");
        this.amenities.push("WIFI");
            this.amenities.push("PET_FRIENDLY");
               this.amenities.push("WHEELCHAIR_ACCESSIBLE");
                     this.amenities.push("CHILD_SEAT");
    }

    this.state = "IDLE";
    this.status = "AVAILABLE";
    this.currentRide = null;
    this.busyTimer = 0;
    //ai aissisted timer for inactivity fire
    this.availableSince = (typeof simulation !== 'undefined' && simulation && simulation.timeManager)
      ? simulation.timeManager.getSimulationTime()
      : 0;
        
  }
  assignamenities(request) {
     // randomly assign an amenity requirement based on want
    if (request === 0) {
      this.amenities.push("WIFI");
    } else if (request === 1) {
      this.amenities.push("PET_FRIENDLY");
    } else if (request === 2) {
      this.amenities.push("WHEELCHAIR_ACCESSIBLE");
    } else if (request === 3) {
      this.amenities.push("CHILD_SEAT");
    } 
  }
  assignRide(request, duration) {
    this.status = "EN_ROUTE";
    this.currentRide = request;
    this.busyTimer = duration;
    this.target = request;
    this.state = "EN_ROUTE"
  }

  update() {
    //after 7 days of avalible, set status to inactive
    if (this.status === "AVAILABLE") {
      let currentSimTime = simulation.timeManager.getSimulationTime();
      if (!this.availableSince) {
        this.availableSince = currentSimTime;
      }
      if (currentSimTime - this.availableSince > 7 * 24 * 60 * 60 * 1000) {
        //turn off inactive code for high data
        //this.status = "INACTIVE";
      }
    }
    // Only proceed with movement if we have a target and a passenger
    if (!this.target || !this.currentRide) return;

    // remember where we started this frame for drawing the step
    this.prevLocation = this.location.copy();
    this.moveManhattan();

    let passenger = this.currentRide;
   // console.log(passenger.status, passenger.Pickedup, passenger.atdestination);
   //ai assisted function
    if (passenger.status === "MATCHED") {
      if (this.atTarget()) {
        passenger.Pickedup = true;
        passenger.status = "TRAVELLING";
        // Wrap destination as {location: {x, y}} for moveManhattan compatibility
        this.target = { location: passenger.destination };
        this.state = "TO_DESTINATION";
        //ai assisted event logging

        if (typeof simulation !== 'undefined' && typeof simulation.addEvent === 'function') {
          const now = simulation.timeManager ? simulation.timeManager.getSimulationTime() : millis();
          const remainingMs = Math.max(0, passenger.expireTime - now);
          const remainingSeconds = Math.ceil(remainingMs / 1000);
          simulation.addEvent("PICKUP", `${passenger.id} picked up by ${this.id} with ${remainingSeconds}s patience left`);
        }
      }
    } else if (passenger.Pickedup && !passenger.atdestination) {
      if (this.atTarget()) {
        passenger.atdestination = true;
        passenger.status = "DELIVERED";
        this.status = "AVAILABLE";
        this.currentRide = null;
        this.target = null;
        this.state = "IDLE";
        this.availableSince = simulation.timeManager.getSimulationTime();
      }
    } else if (passenger.status === "EXPIRED") {
      // If the passenger expired while we were en route, drop the ride
      this.status = "AVAILABLE";
      this.currentRide = null;
      this.target = null;
      this.state = "IDLE";
    }
  }
  //movement (from original base code)
moveManhattan() {
    if (!this.target) return;

    let scale = 1;
    if (typeof simulation !== 'undefined' && simulation.timeManager) {
      scale = simulation.timeManager.getTimeScale();
    }

    let step = this.speed * scale;
    if (step < 1) step = 1;

    let targetX = this.target.location.x;
    let targetY = this.target.location.y;

    if (abs(targetX - this.location.x) < step) {
      this.location.x = targetX;
    }
    if (abs(targetY - this.location.y) < step) {
      this.location.y = targetY;
    }

    // Manhatten movement
    if (this.location.x !== targetX) {
      let dir = Math.sign(targetX - this.location.x);
      this.location.x += dir * step;
    } else if (this.location.y !== targetY) {
      let dir = Math.sign(targetY - this.location.y);
      this.location.y += dir * step;
    }
  }
  atTarget() {
    let distance = dist(
      this.location.x,
      this.location.y,
      this.target.location.x,
      this.target.location.y
    );
    return distance < 5;
  }
  display(showLabels = true) {
      fill(
      this.state === "IDLE"
        ? "white"
        : this.state === "EN_ROUTE"
        ? "orange"
        : "blue"
    );

//Direction lines to show drivers movement

    // draw the planned Manhattan path (like a GPS) to the current target
    if (this.target) {
      let tx = this.target.location.x;
      let ty = this.target.location.y;

      // color matches driver state
      strokeWeight(5);
      if (this.state === "EN_ROUTE") {
        stroke(255, 165, 0); // orange
      } else if (this.state === "TO_DESTINATION") {
        stroke(0, 0, 255); // blue
      } else if (this.state === "IDLE") {
        stroke(150); // gray when not moving
      } else {
        stroke(0);
      }
     
      line(this.location.x, this.location.y, tx, this.location.y);
      line(tx, this.location.y, tx, ty);
       strokeWeight(1);
    }

    // draw driver
    stroke(0);
    strokeWeight(1);
    ellipse(this.location.x, this.location.y, 22);
    fill(255);
    if (this.cartier === 1) {
      fill(200);
    } else if (this.cartier === 2) {
      fill(168, 168, 168); // Silver
    } else if (this.cartier === 3) {
      fill(255, 220, 92); // Gold
    } else if (this.cartier === 4) {
      fill(168, 190, 255); // Platinum
    }
    if (showLabels) {
      textSize(10);
      textAlign(CENTER);
      text(this.id, this.location.x, this.location.y - 15);
      //capacity on the right, speed on the left, total rides below
      text("C:" + this.capacity, this.location.x + 15, this.location.y);
      text("S:" + this.speed, this.location.x - 15, this.location.y);
      text("R:" + (this.totalrides || 0), this.location.x, this.location.y + 15);
    }
  }
}
