class Customer {
  constructor(id, location, passengers = 1, amenitiesRequired = []) {
    this.id = id;
    this.location = location;
    this.passengers = passengers;
    this.amenitiesRequired = amenitiesRequired;

    this.requestTime = millis();
    // face image, subscrip plan ap ayp check canva
  }

  display() {
    fill(100,100,255); //blue
    rectMode(CENTER);
    rect(this.location.x, this.location.y, 18, 18);

    fill(255);
    textSize(10);
    textAlign(CENTER);
    text(this.id, this.location.x, this.location.y - 14);
  }
}
