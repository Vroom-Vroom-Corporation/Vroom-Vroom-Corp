class Customer {
  constructor(id, location, destination) {
    this.id = id;
    this.location = location;
    this.passengers = int(random(1, 4));
    this.amenitiesRequired = null;
    this.destination = destination; // {x, y} object
    this.requestTime = millis();
    this.driversatsfaction = 0;

    this.want = int(random(0,5));
    if (this.want === 0) {
      this.amenitiesRequired = "WIFI";
    }
      else if (this.want === 1) {
        this.amenitiesRequired = "PET_FRIENDLY";
      }
        else if (this.want === 2) {
          this.amenitiesRequired = "WHEELCHAIR_ACCESSIBLE";
        }
            else if (this.want === 3) {
              this.amenitiesRequired = "CHILD_SEAT";
            }
              else if (this.want === 4) {
                this.amenitiesRequired = "NOTHING";
              }
      this.subtier = int(random(1,4));
      this.subscriptionPlan = null;
      if (this.subtier === 1) {
        this.subscriptionPlan = "BASIC";
      }
        else if (this.subtier === 2) {
          this.subscriptionPlan = "SILVER";
        }
            else if (this.subtier === 3) {
              this.subscriptionPlan = "GOLD";
            }
            else if (this.subtier === 4) {
              this.subscriptionPlan = "PLATINUM";
            }
    this.status = "PENDING"; // PENDING, MATCHED, EXPIRED
    this.Pickedup = false;
    this.atdestination = false;
    this.expireTime = this.requestTime + int(random(10000,30000)); // expires after 20 seconds
    this.assignedDriver = null; // will store driver object when matched
    // face image, subscrip plan ap ayp check canva
  }

  aknowledgeMatch(driver) {
    this.status = "MATCHED";
    this.assignedDriver = driver; // remember which driver was assigned
    //if driver has the amenity required, increase satisfaction, otherwise decrease satisfaction
    if (driver.amenities.includes(this.amenitiesRequired) || this.amenitiesRequired === "NOTHING") {
      this.driversatsfaction += 5; // increase satisfaction by 5 for a match
    } else {
      this.driversatsfaction -= 5; // decrease satisfaction by 5 for a mismatch
    }
    //driver.ame
  }

  update() {  
    //console.log("deezx");
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
