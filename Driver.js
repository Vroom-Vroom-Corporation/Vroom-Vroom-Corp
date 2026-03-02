class Driver {
  constructor(id, location, capacity = 4, amenities = []) {
    this.id = id;
    this.location = location;
    this.capacity = capacity;
    this.amenities = amenities;

    this.status = "AVAILABLE";
    this.currentRide = null;
    this.busyTimer = 0;
  }

  assignRide(request, duration) {
    this.status = "BUSY";
    this.currentRide = request;
    this.busyTimer = duration;
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

  display() {
    fill(this.status === "AVAILABLE" ? "green" : "red");
    ellipse(this.location.x, this.location.y, 22);
    fill(0);
    textSize(10);
    textAlign(CENTER);
    text(this.id, this.location.x, this.location.y - 15);
  }
}
