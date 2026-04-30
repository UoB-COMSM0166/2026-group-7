class LevelController {
   constructor() {
      this.proceduralLevel = null;
      this.currentLevel = null;

      this.currentDayID = 1;
      this.levelType = "NORMAL";

      this.levelPhase = "RUNNING"; // RUNNING, VICTORY_TRANSITION, or VICTORY_ZONE
      this.victoryStartScrollPos = 0;
      this.victoryPreRollDistance = 0;
      this.victoryZoneFrames = 0;
      this.victoryZoneStartY = 0;
      this.failSettlementPending = false;
      this.pendingFailReason = "";
   }

   initializeLevel(dayID) {
      this.currentDayID = dayID;
      this.resetRunPhaseState();
      const levelConfig = DAYS_CONFIG[dayID];

      if (!levelConfig) {
         console.error(`[LevelController] ERROR: Day ${dayID} not found in DAYS_CONFIG`);
         return false;
      }

      this.initializeProceduralLevel(dayID, levelConfig);
      this.applyDifficultyParameters(dayID);
      this.loadLevelBackgrounds(dayID);

      return true;
   }

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

   loadLevelBackgrounds(dayID) {
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
            // it should be gloomy weather to make the weather changing more subtle but smooth
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

   initializeProceduralLevel(dayID, config) {
      this.proceduralLevel = new ProceduralLevel(dayID, config);
      this.currentLevel = this.proceduralLevel;
      this.levelType = "NORMAL";

      this.proceduralLevel.setup();

      if (typeof obstacleManager !== 'undefined' && obstacleManager) {
         const difficultyConfig = this.proceduralLevel.getDifficultyConfig();
         obstacleManager.setLevelConfig(difficultyConfig);
      } else {
         console.warn(`[LevelController] obstacleManager is not defined!`);
      }
   }

   // We need a more subtle combined effects to make the difficulties change and make it more fun
   applyDifficultyParameters(dayID) {
      const config = DAYS_CONFIG[dayID];

      if (player) {
         player.baseSpeed = config.basePlayerSpeed;
         player.healthDecay = config.healthDecay;
      }

      GLOBAL_CONFIG.scrollSpeed = config.baseScrollSpeed;
   }

   update() {
      if (!this.currentLevel) return;
      this.currentLevel.update();
   }

   display() {
      if (!this.currentLevel) return;
      this.currentLevel.display();
   }

   resetLevel() {
      if (this.currentLevel) {
         this.currentLevel.reset();
      }

      if (player) {
         player.applyLevelStats(this.currentDayID);
      }
   }

   cleanup() {
      if (this.currentLevel) {
         this.currentLevel.cleanup();
      }

      this.currentLevel = null;
   }

   getCurrentDayConfig() {
      return DAYS_CONFIG[this.currentDayID];
   }

   triggerVictoryPhase() {
      this.levelPhase = "VICTORY_TRANSITION";
      this.victoryStartScrollPos = env.scrollPos;
      const runTileHeight = (env && env.defaultBg && env.defaultBg.height) ? env.defaultBg.height : 1080;
      // make the transition more smooth
      const normalizedOffset = ((env.scrollPos % runTileHeight) + runTileHeight) % runTileHeight;
      this.victoryPreRollDistance = normalizedOffset === 0 ? 0 : (runTileHeight - normalizedOffset);

      // Freeze avatar into forward-running pose when reaching destination.
      if (player && typeof player.forceForwardRunPose === "function") {
         player.forceForwardRunPose();
      }

      // Clear speed boost so the "SPEED UP" banner does not persist into the victory scroll.
      if (player) player.speedBoostFramesRemaining = 0;

      if (obstacleManager) {
         obstacleManager.stopSpawning();
      }
   }

   /** In endless runs, scroll into the destination before showing results. */
   triggerFailSettlement(reason) {
      if (this.failSettlementPending || this.levelPhase !== "RUNNING") return;
      this.failSettlementPending = true;
      this.pendingFailReason = reason || "EXHAUSTED";
      this.triggerVictoryPhase();
   }

   /** @returns {"WIN"|"FAIL"|false} — settlement result once the destination finishes scrolling in. */
   checkSettlementPoint() {
      if (this.levelPhase === "VICTORY_TRANSITION") {
         const bgHeight = (env && env.destinationBg && env.destinationBg.height)
            ? env.destinationBg.height
            : 1080;
         const preRoll = Math.max(0, Number(this.victoryPreRollDistance) || 0);
         const scrolledSinceVictory = env.scrollPos - this.victoryStartScrollPos;
         const targetDistance = preRoll + bgHeight;

         if (scrolledSinceVictory >= targetDistance) {
            this.levelPhase = "VICTORY_ZONE";
            this.victoryZoneFrames = 0;
            this.victoryZoneStartY = (scrolledSinceVictory - preRoll) - bgHeight;
            GLOBAL_CONFIG.scrollSpeed = 0;
         }
      }

      if (this.levelPhase === "VICTORY_ZONE") {
         this.victoryZoneFrames++;

         if (this.victoryZoneFrames >= 90) {
            return this.failSettlementPending ? "FAIL" : "WIN";
         }
      }

      return false;
   }

   getLevelPhase() {
      return this.levelPhase;
   }

   exportRunStateSnapshot() {
      return {
         currentDayID: this.currentDayID,
         levelPhase: this.levelPhase,
         victoryStartScrollPos: this.victoryStartScrollPos,
         victoryPreRollDistance: this.victoryPreRollDistance,
         victoryZoneFrames: this.victoryZoneFrames,
         victoryZoneStartY: this.victoryZoneStartY,
         failSettlementPending: this.failSettlementPending,
         pendingFailReason: this.pendingFailReason
      };
   }

   restoreRunStateSnapshot(snapshot) {
      if (!snapshot) return;
      this.currentDayID = Number.isFinite(Number(snapshot.currentDayID))
         ? Number(snapshot.currentDayID)
         : this.currentDayID;
      this.levelPhase = snapshot.levelPhase || "RUNNING";
      this.victoryStartScrollPos = Number.isFinite(Number(snapshot.victoryStartScrollPos))
         ? Number(snapshot.victoryStartScrollPos)
         : 0;
      this.victoryPreRollDistance = Number.isFinite(Number(snapshot.victoryPreRollDistance))
         ? Number(snapshot.victoryPreRollDistance)
         : 0;
      this.victoryZoneFrames = Number.isFinite(Number(snapshot.victoryZoneFrames))
         ? Number(snapshot.victoryZoneFrames)
         : 0;
      this.victoryZoneStartY = Number.isFinite(Number(snapshot.victoryZoneStartY))
         ? Number(snapshot.victoryZoneStartY)
         : 0;
      this.failSettlementPending = !!snapshot.failSettlementPending;
      this.pendingFailReason = snapshot.pendingFailReason || "";
   }
}
