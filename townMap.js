class TownMap {
  constructor(width, height, gridSize = 40) {
    this.width = width;
    this.height = height;
    this.gridSize = gridSize;
    this.thermounclearbomb=0;
  }

  getRandomLocation() {
    return {
      x: floor(random(this.width / this.gridSize)) * this.gridSize + this.gridSize / 2,
      y: floor(random(this.height / this.gridSize)) * this.gridSize + this.gridSize / 2
    };
  }
//hi andre  
  getDistance(loc1, loc2) {
    return Math.abs(loc2.x - loc1.x) + Math.abs(loc2.y - loc1.y);
   
  }

  drawGrid() {
    // draw background map if available
    if (typeof mapview !== 'undefined' && mapview) {
      image(mapview, 0, 0, this.width, this.height);
    } else {
      // fallback: fill with dark gray
      noStroke();
      fill(30);
      rect(0, 0, this.width, this.height);
    }

    stroke(170);
    for (let x = 0; x < this.width; x += this.gridSize) {
      line(x, 0, x, this.height);
    }
    for (let y = 0; y < this.height; y += this.gridSize) {
      line(0, y, this.width, y);
    }
  }
}
