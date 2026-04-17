class Customer {
  constructor(id, location, destination, timeManager) {
    this.timeManager = timeManager;
    this.id = id;
    this.location = createVector(location.x, location.y);
    this.passengers = int(random(1, 4));
    this.amenitiesRequired = [];
    this.destination = createVector(destination.x, destination.y); // {x, y} object
    //ai assisted timer for request expiration
    this.requestTime = this.timeManager ? this.timeManager.getSimulationTime() : millis();
    this.amenitiesRequired = [];
//50 nothing 30 1 amenity,15 2 amnities, 5 3 amenities
    this.amnityCount = int(random(0, 100));
    if (this.amnityCount < 50) {
      // no amenities required
    } else if (this.amnityCount < 80) {
     this.amentiys=1;
    } else if (this.amnityCount < 95) {
        this.amentiys=2;
    } else {  
        this.amentiys=3;
    }
 
    for (let i = 0; i < this.amentiys; i++) 
    {
    this.assignAmenities();
       
          
            }
      //initinalizing sub tier
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
    //random expire time in real millis, converted to sim time
    let expireDelay = 3000; // 30 real seconds
    // expireTime is calculated in simulation time
    // timeScale is already factored into getSimulationTime(), so we don't divide by it here
    this.expireTime = this.requestTime + expireDelay * (this.timeManager ? this.timeManager.simulationSpeed : 1000);
    this.assignedDriver = null; // will store driver object when matched
    // face image, subscrip plan ap ayp check canva
  }

  assignAmenities(){
       this.want = int(random(0,100));
          //50 wifi 25 pet friendly 15 wheelchair accessible 10 child seat
    if (this.want < 50) {
      // if already have wifi, assign pet friendly, if already have pet friendly, assign wheelchair accessible, if already have wheelchair accessible, assign child seat
      if (this.amenitiesRequired.includes("WIFI")) {
        this.assignAmenities();
      }
      this.amenitiesRequired.push("WIFI");
    }
      else if (this.want < 75) {
           if (this.amenitiesRequired.includes("PET_FRIENDLY")) {
            this.assignAmenities();
      }
        this.amenitiesRequired.push("PET_FRIENDLY");
      }
        else if (this.want < 90) {
             if (this.amenitiesRequired.includes("WHEELCHAIR_ACCESSIBLE")) {;
            this.assignAmenities();
      }
          this.amenitiesRequired.push("WHEELCHAIR_ACCESSIBLE");
        }
            else if (this.want < 100) {
                 if (this.amenitiesRequired.includes("CHILD_SEAT")) {
            this.assignAmenities();
      }
              this.amenitiesRequired.push("CHILD_SEAT");
            }
  }

  aknowledgeMatch(driver) {
    this.status = "MATCHED";
    this.assignedDriver = driver; // remember which driver was assigned
    //if driver has the amenity required, increase satisfaction, otherwise decrease satisfaction
    //ai modifed to match modified systems
    const hasRequiredAmenities = this.amenitiesRequired.length === 0 || this.amenitiesRequired.every(amenity => driver.amenities.includes(amenity));
    if (hasRequiredAmenities) {
      this.driversatsfaction = (this.driversatsfaction || 0) + 5; // increase satisfaction by 5 for a match
    } else {
      this.driversatsfaction = (this.driversatsfaction || 0) - 5; // decrease satisfaction by 5 for a mismatch
    }
    //driver.ame
  }

  update() {
    //ai assisted timer for request expiration
    const now = this.timeManager ? this.timeManager.getSimulationTime() : millis();

    if (now > this.expireTime) {
      if (this.status === "PENDING" || this.status === "MATCHED") {
        this.status = "EXPIRED";
      }
    }
  }


  display(showLabels = true) {
   

    if (this.status === "PENDING") {
    fill(100,100,255); //blue
    rectMode(CENTER);
    rect(this.location.x, this.location.y, 18, 18);
    
        fill(255);
    if (showLabels) {
      textSize(10);
      textAlign(CENTER);
      text(this.id, this.location.x, this.location.y - 14);
          text(this.passengers, this.location.x, this.location.y + 14);
          text(Math.max(0, Math.ceil((this.expireTime - this.timeManager.getSimulationTime()) / this.timeManager.simulationSpeed / 1000)), this.location.x-15, this.location.y );
    }
    } else if (this.status === "MATCHED") {
      fill(255, 100, 100);
      rectMode(CENTER);
      rect(this.location.x, this.location.y, 18, 18);
          fill(255);
    if (showLabels) {
      textSize(10);
      textAlign(CENTER);
      text(this.id, this.location.x, this.location.y - 14);
          text(this.passengers, this.location.x, this.location.y + 14);
                  text(Math.max(0, Math.ceil((this.expireTime - this.timeManager.getSimulationTime()) / this.timeManager.simulationSpeed / 1000)), this.location.x-15, this.location.y );
    }
    }  else if (this.status === "TRAVELLING") {
      fill(255);
      rectMode(CENTER);
      rect(this.destination.x, this.destination.y, 18, 18);
          fill(255);
    if (showLabels) {
      textSize(10);
      textAlign(CENTER);
      text(this.id, this.destination.x, this.destination.y - 14);
    }
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
