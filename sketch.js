let simulation;
let mapview;
//let car;
function preload() {
  // make sure the path matches where the file actually lives; the image
  // was placed in the Data folder so include that in the relative path
  mapview = loadImage("Data/manhatmap.png");
}
function setup() {

  createCanvas(800, 600);

  // create a single driver positioned at the center of the canvas
  // Driver now accepts a p5.Vector directly (or x, y numbers)
  car = new Driver(0, createVector(400, 300));

  simulation = new SimulationController(width, height);
}

function draw() {
  background(0);
 // Circle(400, 300, 50);
 // car.update();
 // car.display();
  simulation.update();
  simulation.display();
  circle(mouseX, mouseY, 10);
}

function mouseReleased() {

  // simulation.processMatching();  
  // console.log("Matching processed");
}
