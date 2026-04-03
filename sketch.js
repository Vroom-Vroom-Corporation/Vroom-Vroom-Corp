let simulation;
let mapview;
let mapviewNight;
let timescaleValues = [0.1, 0.5, 1, 1.5, 2, 5, 10];
let currentTimescaleIndex = 2; // start at 1
let timescaleButton;
let darkModeToggle;
let darkModeEnabled = false;
//let car;
function preload() {
  // make sure the path matches where the file actually lives; the image
  // was placed in the Data folder so include that in the relative path
  mapview = loadImage("Data/manhatmap.png");
  mapviewNight = loadImage("Data/manhatmapnightview.png");
}
function setup() {

  createCanvas(800, 600);

  // create a single driver positioned at the center of the canvas
  // Driver now accepts a p5.Vector directly (or x, y numbers)
  car = new Driver(0, createVector(400, 300));

  simulation = new SimulationController(width, height);
  
  // Pass night map and timeManager to TownMap for day/night transitions ai assisted
  simulation.map.setNightMap(mapviewNight, simulation.timeManager);
//ai assisted time scale ui
  // Set initial timescale
  simulation.timeManager.setTimeScale(timescaleValues[currentTimescaleIndex]);

  // Create timescale button in bottom right
  timescaleButton = createButton('Timescale: ' + timescaleValues[currentTimescaleIndex] + 'x');
  timescaleButton.position(width - 120, height - 40);
  timescaleButton.mousePressed(() => {
    currentTimescaleIndex = (currentTimescaleIndex + 1) % timescaleValues.length;
    let newScale = timescaleValues[currentTimescaleIndex];
    simulation.timeManager.setTimeScale(newScale);
    timescaleButton.html('Timescale: ' + newScale + 'x');
  });
  
  // Create dark mode toggle button in bottom left ai assesited
  darkModeToggle = createButton('🌓 Dark Mode');
  darkModeToggle.position(10, height - 40);
  darkModeToggle.mousePressed(() => {
    darkModeEnabled = !darkModeEnabled;
    const body = document.body;
    if (darkModeEnabled) {
      body.classList.add('dark-mode');
      darkModeToggle.html('☀️ Light Mode');
      simulation.uiManager.updateCompanyLogoForDarkMode(true);
    } else {
      body.classList.remove('dark-mode');
      darkModeToggle.html('🌓 Dark Mode');
      simulation.uiManager.updateCompanyLogoForDarkMode(false);
    }
  });
}

function draw() {
  background(0);
 // Circle(400, 300, 50);
 // car.update();
 // car.display();
  simulation.update();
  simulation.display();
  //circle(mouseX, mouseY, 10);
}

function mouseReleased() {

  // simulation.processMatching();  
  // console.log("Matching processed");
}
