// 程序化关卡障碍物生成逻辑 - 用于第2-4关

class ProceduralLevel {
  constructor(dayID, config) {
    this.dayID = dayID;
    this.config = config;
    this.levelText = `this is level${dayID}`;
    this.frameCounter = 0;
    this.displayDuration = 180; // 3秒显示（60fps）
  }

  setup() {
    console.log(`[ProceduralLevel] Setup - ${this.levelText}`);
    console.log(this.levelText);
    this.frameCounter = 0;
  }

  update() {
    // Procedural level update logic
    this.frameCounter++;
    if (player.distanceRun >= this.config.totalDistance && player.health > 0) {
      // Only trigger once
      if (levelController.getLevelPhase() === "RUNNING") {
        console.log(`[ProceduralLevel] Victory condition met! Distance: ${player.distanceRun}, Target: ${this.config.totalDistance}`);
        levelController.triggerVictoryPhase();
      }
    }

  }

  display() {
    // Display level text in center of screen for first 3 seconds
    if (this.frameCounter < this.displayDuration) {
      push();
      fill(255, 255, 255, 255);
      textSize(48);
      textAlign(CENTER, CENTER);
      text(this.levelText, GLOBAL_CONFIG.resolutionW / 2, GLOBAL_CONFIG.resolutionH / 2);
      pop();
    }
  }

  reset() {
    console.log(`[ProceduralLevel] Reset - ${this.levelText}`);
    this.frameCounter = 0;
  }

  cleanup() {
    console.log(`[ProceduralLevel] Cleanup - ${this.levelText}`);
  }
}
