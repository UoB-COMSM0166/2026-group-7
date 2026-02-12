// Player Entity & HUD System
// Responsibilities: Management of player physics, survival metrics, and real-time HUD rendering.

class Player {
    /**
     * CONSTRUCTOR: ENTITY INITIALIZATION
     * Sets default survival metrics and establishes world-space movement constraints.
     */
    constructor() {
        // Core Statistics: Health, speed, and distance tracking
        this.resetStatsToDefault();
        this.distanceRun = 0;
        this.playTimeFrames = 0;
        
        // Visual Constants: Defined dimensions following the flat pixel aesthetic
        this.width = 60;
        this.height = 100;
        this.color = color(255, 200, 150);

        // MOVEMENT BOUNDARIES (Precision 2-2-2 Layout)
        // Restricted to the walkable zone: 500 (Left Sidewalk) to 1420 (Right Sidewalk)
        this.minX = 500 + this.width / 2;
        this.maxX = 1420 - this.width / 2;
        
        // Initial Scene Coordinates: Spawn position for the Bedroom scene
        this.x = 500;
        this.y = 540;
    }

    /**
     * STATS RESET: DEFAULT PARAMETERS
     * Restores the entity to the baseline values defined in PLAYER_DEFAULTS.
     */
    resetStatsToDefault() {
        this.health = PLAYER_DEFAULTS.baseHealth;
        this.maxHealth = PLAYER_DEFAULTS.baseHealth;
        this.healthDecay = PLAYER_DEFAULTS.healthDecay;
        this.baseSpeed = PLAYER_DEFAULTS.baseSpeed;
    }

    /**
     * STATS RESET: SESSION PARAMETERS
     * Clears session-specific tracking (distance and time) for a new level attempt.
     */
    applyLevelStats(dayID) {
        this.resetStatsToDefault();
        this.distanceRun = 0;
        this.playTimeFrames = 0;
    }

    /**
     * CORE PHYSICS & STATE MONITORING
     * Primary update loop that handles movement logic and evaluates survival thresholds.
     */
    update() {
        // Logic Routing: Different movement physics based on the active scene
        if (gameState.currentState === STATE_ROOM) {
            this.handleRoomMovement();
        } 
        else if (gameState.currentState === STATE_DAY_RUN) {
            this.handleRunMovement();
            
            // Progression Tracking: Increments distance and frame-based time
            this.distanceRun += 0.5;
            this.playTimeFrames++;
            
            // MONITORING: FAIL CONDITION 1 - STAMINA EXHAUSTION
            if (this.health > 0) {
                this.health -= this.healthDecay;
            } else {
                this.triggerGameOver("EXHAUSTED");
            }

            // MONITORING: FAIL CONDITION 2 - TIME THRESHOLD (9:00 AM)
            // 30 mins (08:30 to 09:00) = 1800s = 108,000 frames at 60 FPS
            if (this.playTimeFrames > 108000) {
                this.triggerGameOver("LATE");
            }

            // MONITORING: WIN CONDITION - DISTANCE GOAL
            let targetDist = DAYS_CONFIG[currentDayID].totalDistance;
            if (this.distanceRun >= targetDist) {
                gameState.setState(STATE_WIN);
            }
        }
    }

    /**
     * RENDERING ENGINE: CHARACTER DISPLAY
     * Selects visual representation (Circle vs. Sprite-box) based on active GameState.
     */
    display() {
        if (gameState.currentState === STATE_ROOM) {
            push(); 
            fill(this.color); 
            stroke(0); 
            strokeWeight(2); 
            circle(this.x, this.y, 50); 
            pop();
        } 
        else if (gameState.currentState === STATE_DAY_RUN) {
            // Visual Layer: Ground Shadow for spatial depth
            push(); 
            rectMode(CENTER); 
            noStroke();
            fill(0, 50); 
            ellipse(this.x, this.y + 45, 50, 15);
            
            // Visual Layer: Character Geometry
            fill(this.color); 
            rect(this.x, this.y, this.width, this.height, 8);
            pop();

            // Render HUD Interface
            this.drawTopBar();
        }
    }

    /**
     * HUD: TOP NAVIGATION BAR
     * Draws the global information header including the Clock, Health, and Progress bars.
     */
    drawTopBar() {
        push();
        fill(20, 20, 30); 
        noStroke(); 
        rect(0, 0, width, 100);

        this.drawClock(width / 2, 50);
        this.drawHealthBar(50, 50);
        this.drawProgressBar(width - 450, 50);
        this.drawPauseIcon(width - 60, 50);
        pop();
    }

    /**
     * HUD ELEMENT: CLOCK SYSTEM (08:30:00 START)
     * Translates frame counts into a digital time format with a "Bristol Time" label.
     */
    drawClock(x, y) {
        let startSeconds = 8.5 * 3600; // Fixed start time at 08:30:00 AM
        let elapsedSeconds = this.playTimeFrames / 60;
        let totalTime = startSeconds + elapsedSeconds;

        let hh = Math.floor(totalTime / 3600);
        let mm = Math.floor((totalTime % 3600) / 60);
        let ss = Math.floor(totalTime % 60);

        textAlign(CENTER, CENTER);
        textSize(44); 
        textStyle(BOLD); 
        fill(255, 215, 0);
        text(`${nf(hh, 2)}:${nf(mm, 2)}:${nf(ss, 2)}`, x, y);
        
        // Critical Feedback: Turns text red if player exceeds the 9:00 AM threshold
        if (hh >= 9) fill(255, 50, 50); 
        textSize(12); 
        fill(150); 
        textStyle(NORMAL);
        text("BRISTOL TIME", x, y + 32);
    }

    /**
     * HUD ELEMENT: ENERGY/HEALTH BAR
     * Visualizes the remaining stamina with a dynamic green-to-gray scale.
     */
    drawHealthBar(x, y) {
        fill(255); 
        textSize(14); 
        textStyle(BOLD); 
        text("ENERGY", x, y - 22);
        
        fill(50); 
        rect(x, y, 200, 24, 4);
        
        let pct = constrain(this.health / this.maxHealth, 0, 1);
        fill(0, 255, 100); 
        rect(x + 2, y + 2, (200 - 4) * pct, 20, 3);
    }

    /**
     * HUD ELEMENT: DISTANCE PROGRESS BAR
     * Maps the distance run against the level's total distance target.
     */
    drawProgressBar(x, y) {
        fill(255); 
        textSize(14); 
        textStyle(BOLD); 
        text("PROGRESS", x, y - 22);
        
        fill(50); 
        rect(x, y, 300, 24, 4);
        
        let total = DAYS_CONFIG[currentDayID].totalDistance;
        let pct = constrain(this.distanceRun / total, 0, 1);
        fill(50, 150, 255); 
        rect(x + 2, y + 2, (300 - 4) * pct, 20, 3);
    }

    /**
     * HUD ELEMENT: PAUSE INDICATOR
     * Renders a pause symbol to signify the interactable area for pausing.
     */
    drawPauseIcon(x, y) {
        noFill(); 
        stroke(255); 
        strokeWeight(2); 
        circle(x, y, 50);
        fill(255); 
        noStroke(); 
        rect(x - 8, y, 6, 22); 
        rect(x + 8, y, 6, 22);
    }

    /**
     * INTERACTION: DAMAGE & COLLISION PROCESSING
     * Deducts health based on impact intensity and monitors for critical hit types (e.g., BUS).
     */
    takeDamage(damage, type) {
        this.health -= damage;
        
        // MONITORING: FAIL CONDITION 3 - INSTANT COLLISION (BUS)
        if (type === "BUS") {
            this.triggerGameOver("HIT_BUS");
        }
    }

    /**
     * STATE LOGIC: GAME OVER TRIGGER
     * Logs the failure cause and transitions the global state to STATE_FAIL.
     */
    triggerGameOver(reason) {
        console.log(`[Player] Game Over Reason: ${reason}`);
        gameState.failReason = reason;
        gameState.setState(STATE_FAIL);
    }

    /**
     * MOVEMENT LOGIC: BEDROOM (ROOM)
     * Standard 4-directional movement for the indoor exploration scene.
     */
    handleRoomMovement() {
        let s = 15;
        if (keyIsDown(87)) this.y -= s; // W Key
        if (keyIsDown(83)) this.y += s; // S Key
        if (keyIsDown(65)) this.x -= s; // A Key
        if (keyIsDown(68)) this.x += s; // D Key
        
        // World-space constraints for the bedroom interior
        this.x = constrain(this.x, 25, width - 25);
        this.y = constrain(this.y, 50, height - 25);
    }

    /**
     * MOVEMENT LOGIC: DAY RUN (PARKOUR)
     * Horizontal-only movement for lane switching during the running scene.
     */
    handleRunMovement() {
        let s = this.baseSpeed;
        if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) this.x -= s;
        if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) this.x += s;
        
        // Precision constraints based on the 2-2-2 environment layout
        this.x = constrain(this.x, this.minX, this.maxX);
    }
}