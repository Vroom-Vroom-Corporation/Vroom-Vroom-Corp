let simulation;
let car;
function setup() {
  createCanvas(800, 600);
  car = new Driver(0, createVector(400, 300), 4 ,[]);
  simulation = new SimulationController(width, height);
}

function draw() {
 // background(0);
 // Circle(400, 300, 50);
  car.update();
  car.display();
  simulation.update();
  simulation.display();
}
