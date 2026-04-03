class TownMap {
  constructor(width, height, gridSize = 40) {
    this.width = width;
    this.height = height;
    this.gridSize = gridSize;
    this.thermounclearbomb = 0;
    
    // Sunset/Sunrise times for 2026 (month: [sunrise in hours, sunset in hours]) sunset/sunrise timers are ai assisted based on real world data for NYC in 2026, with a 60 minute fade duration for day/night transition
    this.sunTimes = {
      0: [7 + 15/60, 17 + 0/60],      // January
      1: [6 + 50/60, 17 + 40/60],     // February
      2: [6 + 45/60, 19 + 10/60],     // March
      3: [6 + 5/60, 19 + 40/60],      // April
      4: [5 + 30/60, 20 + 10/60],     // May
      5: [5 + 25/60, 20 + 30/60],     // June
      6: [5 + 45/60, 20 + 20/60],     // July
      7: [6 + 10/60, 19 + 45/60],     // August
      8: [6 + 40/60, 18 + 55/60],     // September
      9: [7 + 0/60, 18 + 5/60],       // October
      10: [7 + 5/60, 16 + 35/60],     // November
      11: [7 + 15/60, 16 + 30/60]     // December
    };
    
    this.nightMap = null;
    this.timeManager = null;
    this.nightAlpha = 0; // 0 = day, 1 = full night
    this.fadeDurationMinutes = 60; // 60 real minutes for fade
  }
  
  setNightMap(nightImage, timeManager) {
    this.nightMap = nightImage;
    this.timeManager = timeManager;
  }
  
  getSunTimes(date) {
    const month = date.getMonth();
    return this.sunTimes[month];
  }
  
  // Get current fade alpha (0 = day, 1 = night)
  // Returns how much night to show (0-1)
  getNightAlpha(currentTime) {
    if (!this.timeManager) return 0;
    
    const date = this.timeManager.getCurrentDateTime();
    const [sunrise, sunset] = this.getSunTimes(date);
    
    const currentHours = date.getHours() + date.getMinutes() / 60;
    const fadeDurationHours = this.fadeDurationMinutes / 60;
    
    // Fade in: from (sunset - fadeDuration/2) to (sunset + fadeDuration/2)
    const sunsetFadeStart = sunset - fadeDurationHours / 2;
    const sunsetFadeEnd = sunset + fadeDurationHours / 2;
    
    // Fade out: from (sunrise - fadeDuration/2) to (sunrise + fadeDuration/2)
    const sunriseFadeStart = sunrise - fadeDurationHours / 2;
    const sunriseFadeEnd = sunrise + fadeDurationHours / 2;
    
    // During sunset fade
    if (currentHours >= sunsetFadeStart && currentHours <= sunsetFadeEnd) {
      const progress = (currentHours - sunsetFadeStart) / fadeDurationHours;
      return Math.min(1, Math.max(0, progress));
    }
    
    // Full night
    if (currentHours > sunsetFadeEnd && currentHours < sunriseFadeStart) {
      return 1;
    }
    
    // During sunrise fade
    if (currentHours >= sunriseFadeStart && currentHours <= sunriseFadeEnd) {
      const progress = 1 - ((currentHours - sunriseFadeStart) / fadeDurationHours);
      return Math.min(1, Math.max(0, progress));
    }
    
    // Day
    return 0;
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
    // draw background day map if available
    if (typeof mapview !== 'undefined' && mapview) {
      tint(255, 255); // full opacity for day map
      image(mapview, 0, 0, this.width, this.height);
    } else {
      // fallback: fill with dark gray
      noStroke();
      fill(30);
      rect(0, 0, this.width, this.height);
    }
    
    // Draw night map overlay with alpha blending
    if (this.nightMap && this.timeManager) {
      const alpha = this.getNightAlpha(this.timeManager.getSimulationTime());
      if (alpha > 0) {
        tint(255, alpha * 255); // fade in night map
        image(this.nightMap, 0, 0, this.width, this.height);
      }
    }
    
    // Reset tint and draw grid
    noTint();
    stroke(170);
    for (let x = 0; x < this.width; x += this.gridSize) {
      line(x, 0, x, this.height);
    }
    for (let y = 0; y < this.height; y += this.gridSize) {
      line(0, y, this.width, y);
    }
  }
}
