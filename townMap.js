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
    return dist(loc1.x, loc1.y, loc2.x, loc2.y);
    //get ai to change this into mhnattan moveo
  }

  drawGrid() {
    //lol put a image of google earth or smth
    stroke(170);
    for (let x = 0; x < this.width; x += this.gridSize) {
      line(x, 0, x, this.height);
    }
    for (let y = 0; y < this.height; y += this.gridSize) {
      line(0, y, this.width, y);
    }
  }
}
