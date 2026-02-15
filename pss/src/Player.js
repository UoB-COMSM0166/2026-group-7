// Park Street Survivor - Player Entity & HUD
// Responsibilities: Player physics, survival metrics, animation, and real-time HUD rendering.

class Player {

    // ─── INITIALISATION ──────────────────────────────────────────────────────

    /**
     * Sets default survival metrics and establishes world-space movement constraints.
     */
    constructor() {
        this.resetStatsToDefault();
        this.distanceRun   = 0;
        this.playTimeFrames = 0;

        // Sprite dimensions (flat pixel aesthetic)
        this.width  = 120;
        this.height = 160;
        this.hitboxW = 60;

        // Walkable X range: left sidewalk (500) to right sidewalk (1420)
        this.minX = 500 + this.width / 2;
        this.maxX = 1420 - this.width / 2;

        // Default spawn position for the bedroom scene
        this.x = 500;
        this.y = 540;

        // Walking animation state
        this.dir        = 'south';
        this.animFrame  = 0;
        this.isWalking  = false;
        this.animSpeed  = 0.18;
    }

    /**
     * Restores the entity to the baseline values defined in PLAYER_DEFAULTS.
     */
    resetStatsToDefault() {
        this.health      = PLAYER_DEFAULTS.baseHealth;
        this.maxHealth   = PLAYER_DEFAULTS.baseHealth;
        this.healthDecay = PLAYER_DEFAULTS.healthDecay;
        this.baseSpeed   = PLAYER_DEFAULTS.baseSpeed;
    }

    /**
     * Resets session-specific tracking (distance and time) for a new level attempt.
     */
    applyLevelStats(dayID) {
        this.resetStatsToDefault();
        this.distanceRun    = 0;
        this.playTimeFrames = 0;
    }

    // ─── CORE UPDATE ─────────────────────────────────────────────────────────

    /**
     * Primary update loop: routes movement logic and evaluates all survival conditions.
     */
    update() {
        if (gameState.currentState === STATE_ROOM) {
            this.handleRoomMovement();
        } else if (gameState.currentState === STATE_DAY_RUN) {
            this.handleRunMovement();

            // Track distance and elapsed frames
            this.distanceRun    += 0.5;
            this.playTimeFrames++;

            // Fail condition 1: stamina exhaustion
            if (this.health > 0) {
                this.health -= this.healthDecay;
            } else {
                this.triggerGameOver("EXHAUSTED");
            }

            // Fail condition 2: time limit exceeded (08:30 → 09:00 = 1800s = 108,000 frames at 60 FPS)
            if (this.playTimeFrames > 108000) {
                this.triggerGameOver("LATE");
            }

            // Win condition: distance goal reached
            let targetDist = DAYS_CONFIG[currentDayID].totalDistance;
            if (this.distanceRun >= targetDist) {
                gameState.setState(STATE_WIN);
            }
        }

        // Advance walk animation, or reset to idle when stationary
        if (this.isWalking) {
            this.animFrame += this.animSpeed;
        } else {
            this.animFrame = 0;
        }
    }

    // ─── MOVEMENT ────────────────────────────────────────────────────────────

    /**
     * 4-directional movement for the bedroom scene, with collision detection via RoomScene.
     */
    handleRoomMovement() {
        let s     = 8;
        let oldX  = this.x;
        let oldY  = this.y;
        let moveX = 0;
        let moveY = 0;

        if      (keyIsDown(87) || keyIsDown(UP_ARROW))    { moveY -= s; this.dir = 'north'; }
        else if (keyIsDown(83) || keyIsDown(DOWN_ARROW))  { moveY += s; this.dir = 'south'; }
        if      (keyIsDown(65) || keyIsDown(LEFT_ARROW))  { moveX -= s; this.dir = 'west';  }
        else if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) { moveX += s; this.dir = 'east';  }

        this.isWalking = (moveX !== 0 || moveY !== 0);

        let newX = oldX + moveX;
        let newY = oldY + moveY;

        if (typeof roomScene !== 'undefined' && roomScene.getValidPosition) {
            let validPos = roomScene.getValidPosition(newX, newY, oldX, oldY);
            this.x = validPos.x;
            this.y = validPos.y;
        } else {
            // Fallback: simple screen-boundary clamp
            this.x = constrain(newX, 50, width - 50);
            this.y = constrain(newY, 50, height - 50);
        }
    }

    /**
     * Horizontal-only movement for lane switching during the run scene.
     */
    handleRunMovement() {
        let s = this.baseSpeed;
        if (keyIsDown(65) || keyIsDown(LEFT_ARROW))  this.x -= s;
        if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) this.x += s;
        // Constrain to the 2-2-2 layout boundaries
        this.x = constrain(this.x, this.minX, this.maxX);
    }

    // ─── RENDERING ───────────────────────────────────────────────────────────

    /**
     * Draws the player sprite (walk cycle or idle) and the HUD during a run.
     */
    display() {
        let animSet = assets.playerAnim[this.dir];

        if (animSet) {
            imageMode(CENTER);
            let imgToDraw;

            if (this.isWalking && animSet.walk.length > 0) {
                let index = floor(this.animFrame) % animSet.walk.length;
                imgToDraw = animSet.walk[index];
            } else {
                imgToDraw = animSet.idle;
            }

            if (imgToDraw) {
                let visualPadding = 35;
                let drawY = this.y - (this.height / 2) + visualPadding;
                image(imgToDraw, this.x, drawY, this.width, this.height);

                if (developerMode) {
                    // Red dot marks the active collision point (foot level)
                    fill(255, 0, 0);
                    noStroke();
                    circle(this.x, this.y, 8);
                }
            }
        }

        if (gameState.currentState === STATE_DAY_RUN) {
            this.drawTopBar();
        }
    }

    // ─── HUD ─────────────────────────────────────────────────────────────────

    /**
     * Draws the top navigation bar containing the clock, energy bar, and progress bar.
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
     * Translates elapsed frames into a digital clock display starting at 08:30:00.
     */
    drawClock(x, y) {
        let startSeconds  = 8.5 * 3600; // Fixed start time: 08:30:00
        let elapsedSeconds = this.playTimeFrames / 60;
        let totalTime      = startSeconds + elapsedSeconds;

        let hh = Math.floor(totalTime / 3600);
        let mm = Math.floor((totalTime % 3600) / 60);
        let ss = Math.floor(totalTime % 60);

        textAlign(CENTER, CENTER);
        textSize(44);
        textStyle(BOLD);
        fill(255, 215, 0);
        text(`${nf(hh, 2)}:${nf(mm, 2)}:${nf(ss, 2)}`, x, y);

        // Turn red once the 09:00 deadline is passed
        if (hh >= 9) fill(255, 50, 50);
        textSize(12);
        fill(150);
        textStyle(NORMAL);
        text("BRISTOL TIME", x, y + 32);
    }

    /**
     * Renders the energy bar with a green fill that depletes as stamina drops.
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
     * Renders the distance progress bar mapped against the level's total distance target.
     */
    drawProgressBar(x, y) {
        fill(255);
        textSize(14);
        textStyle(BOLD);
        text("PROGRESS", x, y - 22);

        fill(50);
        rect(x, y, 300, 24, 4);

        let total = DAYS_CONFIG[currentDayID].totalDistance;
        let pct   = constrain(this.distanceRun / total, 0, 1);
        fill(50, 150, 255);
        rect(x + 2, y + 2, (300 - 4) * pct, 20, 3);
    }

    /**
     * Renders the pause icon (two vertical bars inside a circle) in the HUD.
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

    // ─── GAME STATE ──────────────────────────────────────────────────────────

    /**
     * Deducts health from a collision impact; triggers an instant fail on BUS hits.
     */
    takeDamage(damage, type) {
        this.health -= damage;
        if (type === "BUS") {
            this.triggerGameOver("HIT_BUS");
        }
    }

    /**
     * Records the failure reason and transitions to the STATE_FAIL screen.
     */
    triggerGameOver(reason) {
        console.log(`[Player] Game Over Reason: ${reason}`);
        gameState.failReason = reason;
        gameState.setState(STATE_FAIL);
    }
}
