class Customer {
  constructor(id, location, destination) {
    this.id = id;
    this.location = location;
    this.passengers = int(random(1, 4));
    this.amenitiesRequired = null;
    this.destination = destination; // {x, y} object
    this.requestTime = millis();
    this.status = "PENDING"; // PENDING, MATCHED, EXPIRED
    this.Pickedup = false;
    this.atdestination = false;
    this.expireTime = this.requestTime + int(random(10000,30000)); // expires after 20 seconds
    // face image, subscrip plan ap ayp check canva
  }

  aknowledgeMatch() {
    this.status = "MATCHED";
  }

  update() {  
    console.log("deezx");
    if (millis() > this.expireTime) {
      if(this.status === "PENDING"||this.status === "MATCHED") {
      this.status = "EXPIRED";
    }    
  }
}

  display() {
   

    if (this.status === "PENDING") {
    fill(100,100,255); //blue
    rectMode(CENTER);
    rect(this.location.x, this.location.y, 18, 18);
        fill(255);
    textSize(10);
    textAlign(CENTER);
    text(this.id, this.location.x, this.location.y - 14);
        text(this.passengers, this.location.x, this.location.y + 14);
        text(Math.max(0, Math.ceil((this.expireTime - millis()) / 1000)), this.location.x-15, this.location.y );
    } else if (this.status === "MATCHED") {
      fill(255, 100, 100);
      rectMode(CENTER);
      rect(this.location.x, this.location.y, 18, 18);
          fill(255);
    textSize(10);
    textAlign(CENTER);
    text(this.id, this.location.x, this.location.y - 14);
        text(this.passengers, this.location.x, this.location.y + 14);
                text(Math.max(0, Math.ceil((this.expireTime - millis()) / 1000)), this.location.x-15, this.location.y );
    }  else if (this.status === "TRAVELLING") {
      fill(255);
      rectMode(CENTER);
      rect(this.destination.x, this.destination.y, 18, 18);
          fill(255);
    textSize(10);
    textAlign(CENTER);
    text(this.id, this.destination.x, this.destination.y - 14);
    }  else if (this.status === "EXPIRED") {
      fill(150);
      rectMode(CENTER);
      rect(this.location.x, this.location.y, 18, 18);
    }  else if (this.status === "DELIVERED") {
      fill(0,255,0);
      rectMode(CENTER);
      rect(this.destination.x, this.destination.y, 18, 18);
     }

    //when picked up, change from pickup location to dropoff location, and change color to purple or smth
  }
}
