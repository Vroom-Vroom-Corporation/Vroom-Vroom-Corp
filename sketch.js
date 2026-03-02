//practice example

let courier;
let delivery;
let logs;

function setup() {
  createCanvas(600, 400);
  
  courier = new Courier(80, 120);
  //delivery = new DeliveryRequest(440, 320);
  logs = new  Delivlist();
  //courier.assignDelivery(delivery);
  
}

function draw() {
  background(40);
  
  drawGrid(40);
  
 // delivery.display();
  
  courier.update();
  courier.display();
    logs.listdisplay();
  if(courier.state==="IDLE"|| courier.state=== "DELIVERED"){
    logs.addDeliv();
    console.log("wtf");
  }

}
function mouseReleased()
{
    logs.addDeliv();
    console.log("wtf");
  
}
function drawGrid(size) {
  stroke(60);
  for (let x = 0; x < width; x += size) {
    line(x, 0, x, height);
  }
  for (let y = 0; y < height; y += size) {
    line(0, y, width, y);
  }
}

class Courier {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.speed = 2;
    this.state = "IDLE"; // IDLE, EN_ROUTE, DELIVERED
    this.target = null;
  }

  assignDelivery(delivery) {
    this.target = delivery;
    this.state = "EN_ROUTE";
  }

  update() {
    if (this.state === "EN_ROUTE") {
      this.moveManhattan();
      
      if (this.atTarget()) {
        this.state = "DELIVERED";
      }
    }
  }

  moveManhattan() {
    if (!this.target) return;

    let targetX = this.target.position.x;
    let targetY = this.target.position.y;

    // Move horizontally first
    if (this.position.x !== targetX) {
      let dir = Math.sign(targetX - this.position.x); 
      this.position.x += dir * this.speed;
    }
    // Then move vertically
    else if (this.position.y !== targetY) {
      let dir = Math.sign(targetY - this.position.y);
      this.position.y += dir * this.speed;
    }
  }

  atTarget() {
    return (
      this.position.x === this.target.position.x &&
      this.position.y === this.target.position.y
    );
  }

  display() {
    fill(
      this.state === "IDLE" ? "crimson" :
      this.state === "EN_ROUTE" ? "rgb(104,236,108)" :
      "maroon"
    );
    
    noStroke();
    ellipse(this.position.x, this.position.y, 20);
    
    fill(180);
    textAlign(CENTER);
    text(this.state, this.position.x, this.position.y - 20);
  }
}

class Delivlist {
  constructor(){
    this.head=null;
    this.size=0;
  }
  listdisplay()
  {
if (this.head===null)
  {
    return
  }
    else{
      let prev=null;
      let current= this.head;
      for(let i=0; i<this.size; i++)
        {
          while(current.data!==i)
            {
               prev=current;
               prev.isdeleverd=true;
              current=current.next;
            }
          if(current.data==i)
            current.display();
        }
    }
  }
  addDeliv()
  {
    let link = new DeliveryRequest(40*int(random(1,13)), 40*int(random(1,10)),this.size);
    if (this.head === null) {
    this.head = link;}
    else{  
   let current=this.head;
      while(current.next!==null)
        {
          current=current.next;
        }
      current.next=link;
    }
    this.size++;
      courier.assignDelivery(link);
    console.log("yo deliveru",this.size);
  }
  
}

class DeliveryRequest {
  constructor(x, y, data) {
    this.position = createVector(x, y);
    this.data=data;
    this.next=null;
    this.isdeleverd=false;
  }

  display() {
    if(this.isdeleverd==false){
    fill(100,255,100);
    }
   else{fill(20)}
    rectMode(CENTER);
    noStroke();
    rect(this.position.x, this.position.y, 20, 20);
  }
}
