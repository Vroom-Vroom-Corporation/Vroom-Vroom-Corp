class Driver {
  constructor(id, locationX, locationY, capacity = int(random(1, 4)), amenities = []) {
    // Allow passing a p5.Vector, a plain object with x/y, or separate numbers
    this.id = id;
    this.want = int(random(0,4));
    this.cartier = int(random(1,4));
    this.amenities = null;
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

    this.capacity = capacity;
    // start with an array so UI can safely call join() later
    this.amenities = Array.isArray(amenities) ? [...amenities] : [];

    // randomly assign an amenity requirement based on want
    if (this.want === 0) {
      this.amenities.push("WIFI");
    } else if (this.want === 1) {
      this.amenities.push("PET_FRIENDLY");
    } else if (this.want === 2) {
      this.amenities.push("WHEELCHAIR_ACCESSIBLE");
    } else if (this.want === 3) {
      this.amenities.push("CHILD_SEAT");
    } // else want === 4 -> nothing, leave amenities array empty
    if (this.cartier === 1) {
      this.amenities.push("BASIC");
    } else if (this.cartier === 2) {
      this.amenities.push("SILVER");
    } else if (this.cartier === 3) {
      this.amenities.push("GOLD");
    } else if (this.cartier === 4) {
      this.amenities.push("PLATINUM");
    }

    this.state = null;
    this.status = "AVAILABLE";
    this.currentRide = null;
    this.busyTimer = 0;
        
    this.speed = int(random(1, 4)); // unique speed for each driver
  }

  assignRide(request, duration) {
    this.status = "EN_ROUTE";
    this.currentRide = request;
    this.busyTimer = duration;
    this.target = request;
    this.state = "EN_ROUTE"
  }

  update() {
    // if (this.status === "EN_ROUTE") {
    //   this.busyTimer--;
    //   if (this.busyTimer <= 0) {
    //     this.status = "AVAILABLE";
    //     this.currentRide = null;
    //     this.target = null;
    //     this.state = null;
    //   }
    // }

    // Only proceed with movement if we have a target and a passenger
    if (!this.target || !this.currentRide) return;
    
    this.moveManhattan();
    let passenger = this.currentRide;
    console.log(passenger.status, passenger.Pickedup, passenger.atdestination);
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
        ? "grey"
        : this.state === "EN_ROUTE"
        ? "orange"
        : "blue"
    )
    ellipse(this.location.x, this.location.y, 22);
    fill(255);
    textSize(10);
    textAlign(CENTER);
    text(this.id, this.location.x, this.location.y - 15);
    text("C:" + this.capacity, this.location.x+15, this.location.y);
        text("S:" + this.speed, this.location.x-15, this.location.y);
  }
}
