class Driver {
  constructor(id, locationX, locationY, capacity = 4, amenities = []) {
    // Allow passing a p5.Vector, a plain object with x/y, or separate numbers
    this.id = id;

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
    this.amenities = amenities;

    this.state = null;
    this.status = "AVAILABLE";
    this.currentRide = null;
    this.busyTimer = 0;
  }

  assignRide(request, duration) {
    this.status = "BUSY";
    this.currentRide = request;
    this.busyTimer = duration;
    this.target = request;
    this.state = "BUSY"
  }

  update() {
    if (this.status === "BUSY") {
      this.busyTimer--;
      if (this.busyTimer <= 0) {
        this.status = "AVAILABLE";
        this.currentRide = null;
      }
    }
  }
moveManhattan() {
    if (!this.target) return;

    let targetX = this.target.location.x;
    let targetY = this.target.location.y;

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
    return (
      this.location.x === this.target.location.x &&
      this.location.y === this.target.location.y
    );

  }
  display() {
    fill(this.status === "AVAILABLE" ? "green" : "red");
    ellipse(this.location.x, this.location.y, 22);
    fill(0);
    textSize(10);
    textAlign(CENTER);
    text(this.id, this.location.x, this.location.y - 15);
  }
}
