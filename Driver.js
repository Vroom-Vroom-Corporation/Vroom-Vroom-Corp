class Driver {
  constructor(id, locationX, locationY, capacity = int(random(1, 4)), amenities = []) {
    // Allow passing a p5.Vector, a plain object with x/y, or separate numbers
    this.id = id;

    this.speed = int(random(1, 4)); // unique speed for each driver
    this.cartier = int(random(1,4));
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
      this.location = createVector(locationX.x, locationY.y);
    } else {
      this.location = createVector(locationX, locationY);
    }

    // keep last location to draw Manhattan steps
    this.prevLocation = this.location.copy();

    this.capacity = capacity;
    // start with an array so UI can safely call join() later
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

    this.state = null;
    this.status = "AVAILABLE";
    this.currentRide = null;
    this.busyTimer = 0;
        
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
    // Only proceed with movement if we have a target and a passenger
    if (!this.target || !this.currentRide) return;

    // remember where we started this frame for drawing the step
    this.prevLocation = this.location.copy();
    this.moveManhattan();

    let passenger = this.currentRide;
   // console.log(passenger.status, passenger.Pickedup, passenger.atdestination);
    if (passenger.status === "MATCHED") {
      if (this.atTarget()) {
        passenger.Pickedup = true;
        passenger.status = "TRAVELLING";
        // Wrap destination as {location: {x, y}} for moveManhattan compatibility
        this.target = { location: passenger.destination };
        this.state = "TO_DESTINATION";
      }
    } else if (passenger.Pickedup && !passenger.atdestination) {
      if (this.atTarget()) {
        passenger.atdestination = true;
        passenger.status = "DELIVERED";
        this.status = "AVAILABLE";
        this.currentRide = null;
        this.target = null;
        this.state = "IDLE";
      }
    } else if (passenger.status === "EXPIRED") {
      // If the passenger expired while we were en route, drop the ride
      this.status = "AVAILABLE";
      this.currentRide = null;
      this.target = null;
      this.state = "IDLE";
    }
  }
moveManhattan() {
    if (!this.target) return;

    let targetX = this.target.location.x;
    let targetY = this.target.location.y;

    if(abs(targetX - this.location.x) < this.speed) {
      this.location.x = targetX;

    }
    if(abs(targetY - this.location.y) < this.speed) {
      this.location.y = targetY;

    }

    // Move horizontally first
    if (this.location.x !== targetX) {
      let dir = Math.sign(targetX - this.location.x); 
      this.location.x += dir * this.speed;
    }
    // Then move vertically
    else if (this.location.y !== targetY) {
      let dir = Math.sign(targetY - this.location.y);
      this.location.y += dir * this.speed;
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
  display() {
      fill(
      this.state === "IDLE"
        ? "white"
        : this.state === "EN_ROUTE"
        ? "orange"
        : "blue"
    );

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

    // draw the driver itself
    stroke(0);
    strokeWeight(1);
    ellipse(this.location.x, this.location.y, 22);
    fill(255);
    textSize(10);
    textAlign(CENTER);
    text(this.id, this.location.x, this.location.y - 15);
    text("C:" + this.capacity, this.location.x+15, this.location.y);
        text("S:" + this.speed, this.location.x-15, this.location.y);
  }
}
