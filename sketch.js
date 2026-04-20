let simulation;
let mapview;
let mapviewNight;
let timescaleValues = [0.1, 0.5, 1, 1.5, 2, 5, 10];
let currentTimescaleIndex = 2; // start at 1
let timescaleButton;
let darkModeToggle;
let driverLabelsToggle;
let customerLabelsToggle;
let hideVisualizationsToggle;
let debugModeToggle;
let darkModeEnabled = true;
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
  
  // Check if there are 1000 or more drivers and adjust settings accordingly
  if (simulation.availableDrivers.size >= 1000) {
    simulation.showVisualizations = false;
    simulation.debugMode = true;
  }
  
  // Check if there are 1000 or more drivers and adjust settings accordingly
  if (simulation.availableDrivers.size >= 1000) {
    simulation.showVisualizations = false;
    simulation.debugMode = true;
  }
  
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
  darkModeToggle.position(10, height - 120);
  darkModeToggle.mousePressed(() => {
    darkModeEnabled = !darkModeEnabled;
    const body = document.body;
    const html = document.documentElement;
    if (darkModeEnabled) {
      body.classList.add('dark-mode');
      html.classList.add('dark-mode');
      darkModeToggle.html('☀️ Light Mode');
      simulation.uiManager.updateCompanyLogoForDarkMode(true);
    } else {
      body.classList.remove('dark-mode');
      html.classList.remove('dark-mode');
      darkModeToggle.html('🌓 Dark Mode');
      simulation.uiManager.updateCompanyLogoForDarkMode(false);
    }
  });

  // Apply initial dark mode
  darkModeToggle.html('☀️ Light Mode');
  document.body.classList.add('dark-mode');
  document.documentElement.classList.add('dark-mode');
  simulation.uiManager.updateCompanyLogoForDarkMode(true);

  // Create label visibility toggles below the map
  driverLabelsToggle = createButton('Hide Driver Labels');
  driverLabelsToggle.position(10, height + 10);
  driverLabelsToggle.mousePressed(() => {
    simulation.showDriverLabels = !simulation.showDriverLabels;
    driverLabelsToggle.html(simulation.showDriverLabels ? 'Hide Driver Labels' : 'Show Driver Labels');
  });

  customerLabelsToggle = createButton('Hide Customer Labels');
  customerLabelsToggle.position(10, height + 50);
  customerLabelsToggle.mousePressed(() => {
    simulation.showCustomerLabels = !simulation.showCustomerLabels;
    customerLabelsToggle.html(simulation.showCustomerLabels ? 'Hide Customer Labels' : 'Show Customer Labels');
  });
  //ai assisted

  // Create hide all visualizations toggle
  hideVisualizationsToggle = createButton(simulation.showVisualizations ? 'Hide All Visualizations' : 'Show All Visualizations');
  hideVisualizationsToggle.position(10, height + 90);
  hideVisualizationsToggle.mousePressed(() => {
    simulation.showVisualizations = !simulation.showVisualizations;
    hideVisualizationsToggle.html(simulation.showVisualizations ? 'Hide All Visualizations' : 'Show All Visualizations');
  });

  // Create debug mode toggle
  debugModeToggle = createButton(simulation.debugMode ? 'Disable Debug Mode' : 'Enable Debug Mode');
  debugModeToggle.position(10, height + 130);
  debugModeToggle.mousePressed(() => {
    simulation.debugMode = !simulation.debugMode;
    debugModeToggle.html(simulation.debugMode ? 'Disable Debug Mode' : 'Enable Debug Mode');
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
