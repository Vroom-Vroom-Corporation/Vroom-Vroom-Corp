let simulation;

function setup() {
  createCanvas(800, 600);
  simulation = new SimulationController(width, height);
}

function draw() {
  background(245);
  simulation.update();
  simulation.display();
}