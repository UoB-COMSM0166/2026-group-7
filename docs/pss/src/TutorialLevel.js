// Tutorial level logic - used for Day 1

class TutorialLevel {
   constructor(dayID, config) {
      this.dayID = dayID;
      this.config = config;
      this.levelText = `this is level${dayID}`;
      this.frameCounter = 0;
      this.displayDuration = 180; // Display for 3 seconds at 60 fps
   }

   setup() {
      console.log(`[TutorialLevel] Setup - ${this.levelText}`);
      console.log(this.levelText);
      this.frameCounter = 0;
   }

   update() {
      // Tutorial level update logic
      this.frameCounter++;
      
      // Check for victory condition (tutorial can also be won)
      if (player.distanceRun >= this.config.totalDistance && player.health > 0) {
         levelController.triggerVictoryPhase();
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
      console.log(`[TutorialLevel] Reset - ${this.levelText}`);
      this.frameCounter = 0;
   }

   cleanup() {
      console.log(`[TutorialLevel] Cleanup - ${this.levelText}`);
   }
}

