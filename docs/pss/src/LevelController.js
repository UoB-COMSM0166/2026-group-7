/**
 * LEVEL CONTROLLER
 * Responsibilities: Route dayID to appropriate level instance, manage level lifecycle,
 * apply difficulty parameters, and coordinate transitions between scenes.
 */
class LevelController {
   /**
    * CONSTRUCTOR: INITIALIZATION
    * Creates references for level instances and configuration storage.
    */
   constructor() {
      // Level Instance References
      this.proceduralLevel = null;
      this.currentLevel = null;

      // Session tracking
      this.currentDayID = 1;
      this.levelType = "NORMAL"; // NORMAL level

      // Victory Phase Management
      this.levelPhase = "RUNNING"; // RUNNING, VICTORY_TRANSITION, or VICTORY_ZONE
      this.victoryStartScrollPos = 0; // Record scrollPos when victory triggers
      this.victoryPreRollDistance = 0; // Pixels to finish current run tile before destination enters
      this.victoryZoneFrames = 0; // Frames spent in victory zone (1.5s = 90 frames)
      this.victoryZoneStartY = 0; // Y position of victory bg when entering VICTORY_ZONE
      this.failSettlementPending = false;
      this.pendingFailReason = "";
   }

   /**
    * LIFECYCLE: LEVEL INITIALIZATION
    * Called when entering DAY_RUN state from the room scene.
    * Routes to the correct level based on currentDayID.
    */
   initializeLevel(dayID) {
      console.log(`[LevelController] Initializing Level - Day ${dayID}`);

      this.currentDayID = dayID;
      this.resetRunPhaseState();
      const levelConfig = DAYS_CONFIG[dayID];

      if (!levelConfig) {
         console.error(`[LevelController] ERROR: Day ${dayID} not found in DAYS_CONFIG`);
         return false;
      }

      // Initialize procedural level
      this.initializeProceduralLevel(dayID, levelConfig);

      // Apply level-specific difficulty parameters to player
      this.applyDifficultyParameters(dayID);

      // Load background images for this day
      this.loadLevelBackgrounds(dayID);

      return true;
   }

   /**
    * SESSION RESET: PREPARE A FRESH RUN
    * Ensures re-entering a day after WIN/FAIL starts from RUNNING phase.
    */
   resetRunPhaseState() {
      this.levelPhase = "RUNNING";
      this.victoryStartScrollPos = 0;
      this.victoryPreRollDistance = 0;
      this.victoryZoneFrames = 0;
      this.victoryZoneStartY = 0;
      this.failSettlementPending = false;
      this.pendingFailReason = "";

      if (typeof env !== "undefined" && env) {
         env.scrollPos = 0;
         env.defaultBgHeadIndex = 0;
      }
   }

   /**
    * ASSET LOADING: BACKGROUND IMAGES
    * Dynamically loads default and destination backgrounds for the current day.
    */
   loadLevelBackgrounds(dayID) {
      console.log(`[LevelController] Loading backgrounds for Day ${dayID}`);

      try {
         const backgroundThemeByDay = {
            1: "sunny",
            2: "sunny",
            3: "lightRain",
            4: "lightRain",
            5: "heavyRain"
         };
         const themeKey = backgroundThemeByDay[dayID] || "sunny";
         const preloadedRunTiles =
            assets && assets.runBackgrounds && Array.isArray(assets.runBackgrounds[themeKey])
               ? assets.runBackgrounds[themeKey].filter(Boolean)
               : [];
         const preloadedDestination =
            assets && assets.destinationBackgrounds
               ? (assets.destinationBackgrounds[themeKey] || null)
               : null;

         env.defaultBgCycle = [...preloadedRunTiles].sort(() => Math.random() - 0.5);
         env.defaultBgHeadIndex = 0;
         env.defaultBg = env.defaultBgCycle[0] || null;
         env.destinationBg = preloadedDestination;
         if (env && typeof env.configureWeather === "function") {
            // Day 3 uses lightRain backgrounds but should not have rain effects
            const weatherTheme = dayID === 3 ? "sunny" : themeKey;
            env.configureWeather(weatherTheme);
         }

         if (!env.defaultBg) {
            console.warn(`[LevelController] Missing preloaded run backgrounds for theme "${themeKey}"`);
         }
         if (!env.destinationBg) {
            console.warn(`[LevelController] Missing preloaded destination background for theme "${themeKey}"`);
         }
      } catch (error) {
         console.error(`[LevelController] Error loading backgrounds: ${error}`);
      }
   }

   /**
    * LEVEL ROUTING: PROCEDURAL LEVEL
    * Instantiate and initialize the ProceduralLevel for all days.
    */
   initializeProceduralLevel(dayID, config) {
      console.log(`[LevelController] → Loading Procedural Level (Day ${dayID})`);

      this.proceduralLevel = new ProceduralLevel(dayID, config);
      this.currentLevel = this.proceduralLevel;
      this.levelType = "NORMAL";

      // Initialize level with session data
      this.proceduralLevel.setup();

      // Set obstacle manager difficulty config
      if (typeof obstacleManager !== 'undefined' && obstacleManager) {
         const difficultyConfig = this.proceduralLevel.getDifficultyConfig();
         console.log(`[LevelController] Setting level config for ObstacleManager:`, difficultyConfig);
         obstacleManager.setLevelConfig(difficultyConfig);
      } else {
         console.warn(`[LevelController] obstacleManager is not defined!`);
      }
   }

   /**
    * DIFFICULTY PARAMETERS: APPLY TO SYSTEMS
    * Transfers level-specific parameters to player and obstacle manager.
    */
   applyDifficultyParameters(dayID) {
      const config = DAYS_CONFIG[dayID];

      console.log(`[LevelController] Applying difficulty parameters for Day ${dayID}:`);
      console.log(`  - scrollSpeed: ${config.baseScrollSpeed}`);
      console.log(`  - playerSpeed: ${config.basePlayerSpeed}`);
      console.log(`  - healthDecay: ${config.healthDecay}`);

      // Apply to Player
      if (player) {
         player.baseSpeed = config.basePlayerSpeed;
         player.healthDecay = config.healthDecay;
      }

      // Update global scroll speed
      GLOBAL_CONFIG.scrollSpeed = config.baseScrollSpeed;
   }

   /**
    * LIFECYCLE: UPDATE LOOP
    * Called every frame during STATE_DAY_RUN.
    * Delegates to the current level's update logic.
    */
   update() {
      if (!this.currentLevel) return;

      this.currentLevel.update();
   }

   /**
    * LIFECYCLE: DISPLAY/RENDER
    * Called every frame during STATE_DAY_RUN.
    * Delegates to the current level's display logic.
    */
   display() {
      if (!this.currentLevel) return;

      this.currentLevel.display();
   }

   /**
    * LIFECYCLE: LEVEL RESET
    * Called when restarting a level after failure.
    */
   resetLevel() {
      console.log(`[LevelController] Resetting Level - Day ${this.currentDayID}`);

      if (this.currentLevel) {
         this.currentLevel.reset();
      }

      // Reset player to level start state
      if (player) {
         player.applyLevelStats(this.currentDayID);
      }
   }

   /**
    * LIFECYCLE: LEVEL CLEANUP
    * Called when leaving a level to prepare for next scene.
    */
   cleanup() {
      console.log(`[LevelController] Cleaning up Level - Day ${this.currentDayID}`);

      if (this.currentLevel) {
         this.currentLevel.cleanup();
      }

      this.currentLevel = null;
   }

   /**
    * QUERY: GET CURRENT LEVEL TYPE
    * Returns the type of level currently active (NORMAL).
    */
   getLevelType() {
      return this.levelType;
   }

   /**
    * QUERY: GET CURRENT DAY CONFIG
    * Returns the configuration object for the current day.
    */
   getCurrentDayConfig() {
      return DAYS_CONFIG[this.currentDayID];
   }

   /**
    * QUERY: GET PROGRESS
    * Returns completion percentage of the current level.
    */
   getProgressPercentage() {
      if (!player) return 0;
      const config = this.getCurrentDayConfig();
      return Math.min(100, (player.distanceRun / config.totalDistance) * 100);
   }

   /**
    * VICTORY PHASE: TRIGGER VICTORY TRANSITION
    * Called when player reaches the target distance with health > 0.
    * Records current scroll position and transitions to victory phase.
    */
   triggerVictoryPhase() {
      console.log(`[LevelController] 🎉 Victory Triggered!`);
      console.log(`  - Current ScrollPos: ${env.scrollPos}`);
      console.log(`  - Level Phase: ${this.levelPhase}`);
      this.levelPhase = "VICTORY_TRANSITION";
      this.victoryStartScrollPos = env.scrollPos;
      const runTileHeight = (env && env.defaultBg && env.defaultBg.height) ? env.defaultBg.height : 1080;
      const normalizedOffset = ((env.scrollPos % runTileHeight) + runTileHeight) % runTileHeight;
      this.victoryPreRollDistance = normalizedOffset === 0 ? 0 : (runTileHeight - normalizedOffset);
      console.log(`  - Victory Start ScrollPos: ${this.victoryStartScrollPos}`);
      console.log(`  - Victory Pre-Roll Distance: ${this.victoryPreRollDistance}`);

      // Freeze avatar into forward-running pose when reaching destination.
      if (player && typeof player.forceForwardRunPose === "function") {
         player.forceForwardRunPose();
      }

      // Notify ObstacleManager to stop spawning
      if (obstacleManager) {
         obstacleManager.stopSpawning();
      }
   }

   /**
    * FAIL SETTLEMENT: in endless runs we still scroll into destination before showing results.
    */
   triggerFailSettlement(reason) {
      if (this.failSettlementPending || this.levelPhase !== "RUNNING") return;
      this.failSettlementPending = true;
      this.pendingFailReason = reason || "EXHAUSTED";
      this.triggerVictoryPhase();
   }

   /**
    * VICTORY PHASE: CHECK TRANSITION COMPLETION & HANDLE SETTLEMENT
    * Monitors if victory background has fully scrolled in and displays for 1.5 seconds.
    */
   checkSettlementPoint() {
      if (this.levelPhase === "VICTORY_TRANSITION") {
         const bgHeight = (env && env.destinationBg && env.destinationBg.height)
            ? env.destinationBg.height
            : 1080;
         const preRoll = Math.max(0, Number(this.victoryPreRollDistance) || 0);
         const scrolledSinceVictory = env.scrollPos - this.victoryStartScrollPos;
         const targetDistance = preRoll + bgHeight;
         console.log(`[checkSettlementPoint] TRANSITION: scrolled=${scrolledSinceVictory.toFixed(1)}, preRoll=${preRoll.toFixed(1)}, target=${targetDistance}`);

         if (scrolledSinceVictory >= targetDistance) {
            console.log(`[LevelController] 🎉 Victory Background Fully Visible! Entering settlement.`);
            this.levelPhase = "VICTORY_ZONE";
            this.victoryZoneFrames = 0;
            // Record victory bg Y position when entering VICTORY_ZONE (should be 0, bg top aligned with screen top)
            this.victoryZoneStartY = (scrolledSinceVictory - preRoll) - bgHeight;
            GLOBAL_CONFIG.scrollSpeed = 0;
         }
         // Continue to next check without returning false yet
      }

      if (this.levelPhase === "VICTORY_ZONE") {
         this.victoryZoneFrames++;
         console.log(`[checkSettlementPoint] ZONE: frames=${this.victoryZoneFrames}/90`);

         if (this.victoryZoneFrames >= 90) {
            if (this.failSettlementPending) {
               console.log(`[LevelController] ✨ 1.5 seconds elapsed. Triggering FAIL settlement.`);
               return "FAIL";
            }
            console.log(`[LevelController] ✨ 1.5 seconds elapsed. Triggering WIN!`);
            return "WIN";
         }
      }

      return false;
   }

   consumePendingFailReason() {
      const reason = this.pendingFailReason || "EXHAUSTED";
      this.failSettlementPending = false;
      this.pendingFailReason = "";
      return reason;
   }


   getLevelPhase() {
      return this.levelPhase;
   }
}
