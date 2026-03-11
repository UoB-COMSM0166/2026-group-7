// Park Street Survivor - Player Entity & HUD
// Responsibilities: Player physics, survival metrics, animation, and real-time HUD rendering.

class Player {

    // ─── INITIALISATION ──────────────────────────────────────────────────────

    /**
     * Sets default survival metrics and establishes world-space movement constraints.
     */
    constructor() {
        this.resetStatsToDefault();
        this.distanceRun = 0;
        this.playTimeFrames = 0;
        this.carHitCount = 0;
        this.coffeeCupCount = 0;

        // Sprite dimensions (flat pixel aesthetic)
        this.width = 160;
        this.height = 160;
        this.hitboxW = 60;

        // Walkable X range: left sidewalk (500) to right sidewalk (1420)
        this.minX = 500 + this.width / 2;
        this.maxX = 1420 - this.width / 2;

        // Fixed run lanes (ordered by lane1..lane4)
        this.runLaneCenters = [
            GLOBAL_CONFIG.lanes.lane1,
            GLOBAL_CONFIG.lanes.lane2,
            GLOBAL_CONFIG.lanes.lane3,
            GLOBAL_CONFIG.lanes.lane4
        ];
        this.currentLaneIndex = 0;
        this.targetLaneIndex = 0;
        this.laneVelocityX = 0;
        this.laneSpringK = 0.22;//Adsorption strength
        this.laneSpringDamping = 0.50;//The smaller the value, the faster it stops.
        this.leftHeld = false;
        this.rightHeld = false;

        // Default spawn position for the day run scene
        this.x = this.runLaneCenters[this.currentLaneIndex];
        this.y = PLAYER_RUN_FOOT_Y;

        // Walking animation state
        this.dir        = 'south';
        this.animFrame  = 0;
        this.isWalking  = false;
        this.animSpeed  = 0.12;  // room walk pace (was 0.18)
        this.runAnimSpeed = 0.28;

        // Status effects
        this.stunFramesRemaining = 0;
        this.laneDelayFramesRemaining = 0;
        this.speedBoostFramesRemaining = 0;
        this.invincibleFramesRemaining = 0;
        this.hpLockFramesRemaining = 0;
        this.hpLockValue = 0;
        this.activeSpeedMultiplier = 1;
        this.baseRunScrollSpeed = null;
        this.wasSpeedBoostActive = false;
        this.puddleTrapActive = false;
        this.puddleEscapePressCount = 0;
        this.puddleEscapePressRequired = 3;
        this.puddleSlowMultiplier = 0.72;

        // ── PERFORMANCE: Clock display cache ──
        this._clockStr     = "08:30:00";
        this._clockRed     = false;
        this._lastClockSec = -1;

        // ── Carried utility item state (selected in Room before DAY_RUN) ──
        this.carriedUtilityItem = null;      // "Soft Gummy Vitamins" | "Tangle" | "Headphones" | "Rain Boots" | null
        this.utilityItemCharges = 0;         // remaining uses
        this.utilityItemArmed = false;       // for E-activated passive items: Tangle / Headphones / Rain Boots
        this.utilityHudSwapProgress = 0;     // 0 = backpack main, 1 = utility item main
    }

    /**
     * Restores the entity to the baseline values defined in PLAYER_DEFAULTS.
     */
    resetStatsToDefault() {
        this.health = PLAYER_DEFAULTS.baseHealth;
        this.maxHealth = PLAYER_DEFAULTS.baseHealth;
        this.healthDecay = PLAYER_DEFAULTS.healthDecay;
        this.baseSpeed = PLAYER_DEFAULTS.baseSpeed;
    }

    /**
     * Resets session-specific tracking (distance and time) for a new level attempt.
     */
    applyLevelStats(dayID) {
        this.resetStatsToDefault();
        this.distanceRun = 0;
        this.playTimeFrames = 0;
        this.carHitCount = 0;
        this.coffeeCupCount = 0;
        this.currentLaneIndex = 0;
        this.targetLaneIndex = 0;
        this.laneVelocityX = 0;
        this.x = this.runLaneCenters[this.currentLaneIndex];
        this.stunFramesRemaining = 0;
        this.laneDelayFramesRemaining = 0;
        this.speedBoostFramesRemaining = 0;
        this.invincibleFramesRemaining = 0;
        this.hpLockFramesRemaining = 0;
        this.hpLockValue = 0;
        this.activeSpeedMultiplier = 1;
        this.baseRunScrollSpeed = null;
        this.wasSpeedBoostActive = false;
        this.puddleTrapActive = false;
        this.puddleEscapePressCount = 0;
        this.puddleEscapePressRequired = 3;
        this.puddleSlowMultiplier = 0.72;
        // In DAY_RUN, default forward-running view should be back-facing.
        this.dir = 'north';

        this.carriedUtilityItem = null;
        this.utilityItemCharges = 0;
        this.utilityItemArmed = false;
        this.utilityHudSwapProgress = 0;
    }

    // ─── CARRIED UTILITY ITEM ───────────────────────────────────────────────

    /**
     * Reads backpackUI.topSlots and stores the selected utility item as the
     * authoritative DAY_RUN item state on the player.
     * Required items (Student ID / Laptop) are ignored here.
     */
    syncUtilityItemFromBackpack() {
        if (typeof backpackUI === "undefined" || !backpackUI || !Array.isArray(backpackUI.topSlots)) {
            this.clearUtilityItemState();
            return;
        }

        const utilityNames = [
            "Soft Gummy Vitamins",
            "Tangle",
            "Headphones",
            "Rain Boots"
        ];

        const selected = backpackUI.topSlots.find(name => utilityNames.includes(name)) || null;

        if (!selected) {
            this.clearUtilityItemState();
            return;
        }

        this.carriedUtilityItem = selected;
        this.utilityItemCharges = this.getDefaultChargesForUtilityItem(selected);
        this.utilityItemArmed = false;
        this.saveUtilityItemSnapshot();
    }

    /**
     * Clears the currently carried utility item state.
     */
    clearUtilityItemState(preserveRunSnapshot = false) {
        this.carriedUtilityItem = null;
        this.utilityItemCharges = 0;
        this.utilityItemArmed = false;
        this.utilityHudSwapProgress = 0;
        if (!preserveRunSnapshot) {
            this.saveUtilityItemSnapshot();
        }
    }

    isPassiveUtilityItem(itemName) {
        return itemName === "Tangle" ||
               itemName === "Headphones" ||
               itemName === "Rain Boots";
    }

    saveUtilityItemSnapshot() {
        if (typeof gameState !== "undefined" && gameState &&
            typeof gameState.saveRunUtilityItemSnapshot === "function") {
            gameState.saveRunUtilityItemSnapshot(
                this.carriedUtilityItem,
                this.utilityItemCharges,
                this.utilityItemArmed
            );
        }
    }

    /**
     * Returns the default number of uses for the given utility item.
     */
    getDefaultChargesForUtilityItem(itemName) {
        if (itemName === "Soft Gummy Vitamins") return 1;
        if (itemName === "Tangle") return 10;
        if (itemName === "Headphones") return 5;
        if (itemName === "Rain Boots") return 3;
        return 0;
    }

    /**
     * Returns true if the player still has a usable carried utility item.
     */
    hasUsableUtilityItem() {
        return !!this.carriedUtilityItem && this.utilityItemCharges > 0;
    }

    /**
     * Consumes one charge from the carried utility item.
     * If charges reach 0, the item is removed and the HUD should fall back to backpack.
     */
    consumeUtilityItemCharge() {
        if (!this.hasUsableUtilityItem()) return false;

        const consumedItem = this.carriedUtilityItem;
        this.utilityItemCharges = max(0, this.utilityItemCharges - 1);
        this.utilityItemArmed = this.isPassiveUtilityItem(consumedItem) && this.utilityItemCharges > 0;

        if (this.utilityItemCharges <= 0) {
            // Keep the run-start snapshot intact so restart can restore fresh charges.
            this.clearUtilityItemState(true);
            return true;
        }

        this.saveUtilityItemSnapshot();
        return true;
    }

    /**
     * Activates the carried utility item with the E key.
     * - Vitamins: immediate full heal + consume 1 charge
     * - Tangle / Headphones / Rain Boots: arm once, do not consume yet
     * @returns {boolean} True if the key press was consumed.
     */
    activateUtilityItem() {
        if (!this.hasUsableUtilityItem()) return false;

        if (this.carriedUtilityItem === "Soft Gummy Vitamins") {
            this.health = this.maxHealth;
            this.consumeUtilityItemCharge();
            return true;
        }

        if (
            this.carriedUtilityItem === "Tangle" ||
            this.carriedUtilityItem === "Headphones" ||
            this.carriedUtilityItem === "Rain Boots"
        ) {
            this.utilityItemArmed = true;
            this.saveUtilityItemSnapshot();
            return true;
        }

        return false;
    }

        /**
     * Returns true when the armed utility item should cancel the next Fantasy Coffee.
     */
    shouldTriggerTangle() {
        return this.utilityItemArmed &&
               this.carriedUtilityItem === "Tangle" &&
               this.utilityItemCharges > 0;
    }

    /**
     * Returns true when the armed utility item should cancel the next Promoter poster.
     */
    shouldTriggerHeadphones() {
        return this.utilityItemArmed &&
               this.carriedUtilityItem === "Headphones" &&
               this.utilityItemCharges > 0;
    }

    /**
     * Returns true when the armed utility item should cancel the next Puddle trap.
     */
    shouldTriggerRainBoots() {
        return this.utilityItemArmed &&
               this.carriedUtilityItem === "Rain Boots" &&
               this.utilityItemCharges > 0;
    }

    /**
     * Consumes the currently armed utility item if it matches the expected item name.
     * Returns true when consumption succeeds.
     */
    consumeArmedUtilityItem(expectedItemName) {
        if (!this.utilityItemArmed) return false;
        if (this.carriedUtilityItem !== expectedItemName) return false;
        if (!this.hasUsableUtilityItem()) return false;

        return this.consumeUtilityItemCharge();
    }

    /**
     * Returns the HUD icon image for the currently carried utility item.
     * Falls back to the default backpack icon when no usable item is carried.
     */
    getUtilityItemHudIcon() {
        if (!this.hasUsableUtilityItem()) return assets.backpackImg || null;

        if (this.carriedUtilityItem === "Soft Gummy Vitamins") return assets.vitaminImg || assets.backpackImg || null;
        if (this.carriedUtilityItem === "Tangle") return assets.tangleImg || assets.backpackImg || null;
        if (this.carriedUtilityItem === "Headphones") return assets.headphoneImg || assets.backpackImg || null;
        if (this.carriedUtilityItem === "Rain Boots") return assets.rainbootImg || assets.backpackImg || null;

        return assets.backpackImg || null;
    }

    getEquippedUtilityItemIcon() {
        if (!this.hasUsableUtilityItem()) return null;
        if (this.carriedUtilityItem === "Soft Gummy Vitamins") return assets.vitaminImg || null;
        if (this.carriedUtilityItem === "Tangle") return assets.tangleImg || null;
        if (this.carriedUtilityItem === "Headphones") return assets.headphoneImg || null;
        if (this.carriedUtilityItem === "Rain Boots") return assets.rainbootImg || null;
        return null;
    }

    /**
     * Restores the carried utility item from the current run snapshot.
     * Used by restart run so the player keeps the same item with fresh charges.
     */
    restoreUtilityItemFromRunSnapshot() {
        if (typeof gameState === "undefined" || !gameState) {
            this.clearUtilityItemState();
            return;
        }

        const itemName = gameState.runUtilityItemName || null;
        if (!itemName) {
            this.clearUtilityItemState();
            return;
        }

        this.carriedUtilityItem = itemName;
        this.utilityItemCharges = this.getDefaultChargesForUtilityItem(itemName);
        this.utilityItemArmed = false;
        this.saveUtilityItemSnapshot();
    }

    // ─── CORE UPDATE ─────────────────────────────────────────────────────────

    /**
     * Primary update loop: routes movement logic and evaluates all survival conditions.
     */
    update() {
        if (gameState.currentState === STATE_ROOM) {
            this.handleRoomMovement();
        } else if (gameState.currentState === STATE_DAY_RUN) {
            // Respect the level phase from LevelController
            const levelPhase = levelController ? levelController.getLevelPhase() : "RUNNING";

            // Player movement and health decay only in RUNNING phase
            if (levelPhase === "RUNNING") {
                this.handleRunMovement();
                this.applyRunScrollSpeed();

                // Track distance
                this.distanceRun += 0.5;

                // Fail condition 1: stamina exhaustion
                if (this.hpLockFramesRemaining > 0) {
                    this.health = this.hpLockValue;
                } else if (this.health > 0) {
                    this.health -= this.healthDecay;
                } else {
                    this.triggerGameOver("EXHAUSTED");
                }
            }
            // In VICTORY_TRANSITION and VICTORY_ZONE: player stops moving
            else {
                this.forceForwardRunPose();
            }

            this.playTimeFrames++;

            // Story mode only: fail if time limit exceeded (08:30 -> 09:00).
            if (!isEndlessRunMode() && this.playTimeFrames > 108000) {
                this.triggerGameOver("LATE");
            }

            // Win condition: distance goal reached → trigger victory phase
            let targetDist = DAYS_CONFIG[currentDayID].totalDistance;
            if (!isEndlessRunMode() && this.distanceRun >= targetDist && this.health > 0) {
                if (levelController && levelController.getLevelPhase() === "RUNNING") {
                    levelController.triggerVictoryPhase();
                }
            }
        }

        // Day run should always look like forward running; room keeps walk/idle behavior.
        const inRunScene = gameState.currentState === STATE_DAY_RUN;
        const shouldAnimate = inRunScene || this.isWalking;
        const frameSpeed = inRunScene ? this.runAnimSpeed : this.animSpeed;

        if (shouldAnimate) this.animFrame += frameSpeed;
        else this.animFrame = 0;

        // Countdown status effects.
        if (this.stunFramesRemaining > 0) this.stunFramesRemaining--;
        else if (this.laneDelayFramesRemaining > 0) this.laneDelayFramesRemaining--;
        if (this.speedBoostFramesRemaining > 0) this.speedBoostFramesRemaining--;
        if (this.invincibleFramesRemaining > 0) this.invincibleFramesRemaining--;
        if (this.hpLockFramesRemaining > 0) this.hpLockFramesRemaining--;

        const hudTarget = this.hasUsableUtilityItem() ? 1 : 0;
        this.utilityHudSwapProgress = lerp(this.utilityHudSwapProgress, hudTarget, 0.18);
        if (Math.abs(this.utilityHudSwapProgress - hudTarget) < 0.01) {
            this.utilityHudSwapProgress = hudTarget;
        }
    }

    // ─── MOVEMENT ────────────────────────────────────────────────────────────

    /**
     * 4-directional movement for the bedroom scene, with collision detection via RoomScene.
     */
    handleRoomMovement() {
        let s = 7; // room walk speed (was 12)
        let oldX = this.x;
        let oldY = this.y;
        let moveX = 0;
        let moveY = 0;

        if (keyIsDown(87) || keyIsDown(UP_ARROW)) { moveY -= s; this.dir = 'north'; }
        else if (keyIsDown(83) || keyIsDown(DOWN_ARROW)) { moveY += s; this.dir = 'south'; }
        if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) { moveX -= s; this.dir = 'west'; }
        else if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) { moveX += s; this.dir = 'east'; }

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
        // Stage 1: hard stun (no lane input or movement response)
        if (this.stunFramesRemaining > 0) {
            this.leftHeld = false;
            this.rightHeld = false;
            this.isWalking = true;
            this.dir = 'north';
            return;
        }

        const leftDown = keyIsDown(65) || keyIsDown(LEFT_ARROW);
        const rightDown = keyIsDown(68) || keyIsDown(RIGHT_ARROW);
        const laneChangeLocked = this.laneDelayFramesRemaining > 0;

        // Rising-edge input: one lane change per key press.
        if (!laneChangeLocked && leftDown && !this.leftHeld) {
            this.targetLaneIndex = max(0, this.targetLaneIndex - 1);
            this.dir = 'west';
        }
        if (!laneChangeLocked && rightDown && !this.rightHeld) {
            this.targetLaneIndex = min(this.runLaneCenters.length - 1, this.targetLaneIndex + 1);
            this.dir = 'east';
        }
        this.leftHeld = leftDown;
        this.rightHeld = rightDown;

        // Non-linear magnetic snap to lane center (spring + damping).
        const targetX = this.runLaneCenters[this.targetLaneIndex];
        const distX = targetX - this.x;
        this.laneVelocityX += distX * this.laneSpringK;
        this.laneVelocityX *= this.laneSpringDamping;
        this.x += this.laneVelocityX;

        if (abs(distX) < 0.6 && abs(this.laneVelocityX) < 0.6) {
            this.x = targetX;
            this.laneVelocityX = 0;
            this.currentLaneIndex = this.targetLaneIndex;
        }

        // Keep final position inside playable width.
        this.x = constrain(this.x, this.minX, this.maxX);

        // Return to forward-running (back-facing) pose after lane switching settles.
        if (!leftDown && !rightDown && abs(this.laneVelocityX) <= 0.2 && this.currentLaneIndex === this.targetLaneIndex) {
            this.dir = 'north';
        }

        // Keep this true so run scene continuously plays movement frames.
        this.isWalking = true;
    }

    /**
     * Forces the run avatar to face forward (back-facing / north) and clears
     * lateral input memory so it never sticks on east/west at destination.
     */
    forceForwardRunPose() {
        this.dir = 'north';
        this.leftHeld = false;
        this.rightHeld = false;
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

            const shouldUseWalkFrames = this.isWalking || gameState.currentState === STATE_DAY_RUN;
            if (shouldUseWalkFrames && animSet.walk.length > 0) {
                let index = floor(this.animFrame) % animSet.walk.length;
                imgToDraw = animSet.walk[index];
            } else {
                imgToDraw = animSet.idle;
            }

            if (imgToDraw) {
                let visualPadding = 35;
                let drawY = this.y - (this.height / 2) + visualPadding;

                if (this.puddleTrapActive) {
                    const puddlePath = OBSTACLE_CONFIG &&
                        OBSTACLE_CONFIG.PUDDLE &&
                        OBSTACLE_CONFIG.PUDDLE.sprite;
                    let puddleImg = null;
                    if (puddlePath && obstacleManager && typeof obstacleManager.getSpriteImage === "function") {
                        puddleImg = obstacleManager.getSpriteImage(puddlePath);
                    }
                    if (puddleImg) {
                        imageMode(CENTER);
                        image(puddleImg, this.x, this.y + 8, 170, 80);
                    }
                }

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
            this.drawSpeedBoostBanner();
        }


    }

    // ─── HUD ─────────────────────────────────────────────────────────────────

    /**
     * Draws the top navigation bar containing the clock, energy bar, and progress bar.
     */
    drawTopBar() {
        push();

        // Align energy bar bottom edge with inventory frame bottom edge.
        this.drawHealthBar(this.hudX(210), this.hudY(111));
        this.drawBackpackIcon(this.hudX(30), this.hudY(21));
        this.drawUtilityItemCharges(this.hudX(146), this.hudY(7));

        this.drawProgressBar(this.hudX(30), this.hudY(300));

        pop();
    }

    /**
     * Translates elapsed frames into a digital clock display starting at 08:30:00.
     */
    drawClock(x, y) {
        // Rebuild the formatted string only when the displayed second changes
        let currentSec = Math.floor(this.playTimeFrames / 60);
        if (currentSec !== this._lastClockSec) {
            this._lastClockSec = currentSec;
            const START = 8.5 * 3600; // 08:30:00 in seconds
            let total = START + currentSec;
            let hh = Math.floor(total / 3600);
            let mm = Math.floor((total % 3600) / 60);
            let ss = Math.floor(total % 60);
            this._clockStr = (hh < 10 ? '0' : '') + hh + ':' +
                             (mm < 10 ? '0' : '') + mm + ':' +
                             (ss < 10 ? '0' : '') + ss;
            this._clockRed = (hh >= 9);
        }

        textAlign(CENTER, CENTER);
        textSize(44);
        textStyle(BOLD);
        fill(this._clockRed ? color(255, 50, 50) : color(255, 215, 0));
        text(this._clockStr, x, y);
        textSize(12);
        fill(150);
        textStyle(NORMAL);
        text("BRISTOL TIME", x, y + 32);
    }

    /**
     * Renders the energy bar with a green fill that depletes as stamina drops.
     */
    drawHealthBar(x, y) {
        const frameW = this.hudW(410);
        const frameH = this.hudH(70);
        const frameR = this.hudU(40);
        const strokeW = this.hudU(7);
        const inset = this.hudU(6);
        const innerX = x + inset;
        const innerY = y + inset;
        const innerW = frameW - inset * 2;
        const innerH = frameH - inset * 2;
        const pct = constrain(this.health / this.maxHealth, 0, 1);
        const fillW = innerW * pct;

        this.drawHudRoundedPanel(x, y, frameW, frameH, frameR, {
            bg: "#F5F0FF",
            stroke: "#9B8FB8",
            strokeWeight: strokeW,
            outerShadowColor: "#000000",
            outerShadowAlpha: 0.5,
            outerShadowDistance: this.hudU(7),
            outerShadowAngleDeg: 100,
            innerShadowColor: "#FFFFFF",
            innerShadowAlpha: 0.8,
            innerShadowDistance: this.hudU(11),
            innerShadowAngleDeg: 90
        });

        if (fillW > 0) {
            push();
            this.clipRoundedRect(innerX, innerY, innerW, innerH, max(this.hudU(8), frameR - inset));
            const grad = drawingContext.createLinearGradient(innerX, innerY, innerX, innerY + innerH);
            grad.addColorStop(0, "#FF85C0");
            grad.addColorStop(0.55, "#FF5AA8");
            grad.addColorStop(1, "#E64A96");
            drawingContext.fillStyle = grad;
            noStroke();
            rect(innerX, innerY, fillW, innerH, max(this.hudU(8), frameR - inset));
            pop();
        }

        const textShadow = this.shadowOffset(this.hudU(6), 45);
        push();
        textFont(fonts.jersey20 || 'sans-serif');
        textSize(this.hudU(48));
        textAlign(LEFT, TOP);
        noStroke();
        fill(this.colorWithAlpha("#000000", 0.5));
        text("ENERGY", this.hudX(230) + textShadow.x, this.hudY(21) + textShadow.y);
        fill("#FFFFFF");
        text("ENERGY", this.hudX(230), this.hudY(21));
        pop();
    }

    /**
     * Draws remaining utility-item charges as dots under the health bar.
     * Label is displayed to the left of the dots.
     */
    drawUtilityItemCharges(x, y) {
        const d = this.hudU(73);
        const r = d / 2;
        const cx = x + r;
        const cy = y + r;
        const count = this.hasUsableUtilityItem() ? max(0, floor(this.utilityItemCharges || 0)) : 0;

        const outerOff = this.shadowOffset(this.hudU(7), 45);
        const innerOff = this.shadowOffset(this.hudU(11), 45);

        // Draw shadows first so they stay beneath the badge fill.
        push();
        noStroke();
        fill(this.colorWithAlpha("#CC5555", 0.5));
        circle(cx + outerOff.x, cy + outerOff.y, d);
        pop();

        push();
        noStroke();
        fill(this.colorWithAlpha("#FF9999", 0.5));
        circle(cx + innerOff.x, cy + innerOff.y, d);
        pop();

        push();
        noStroke();
        fill("#FF6B6B");
        circle(cx, cy, d);
        pop();

        push();
        noFill();
        stroke("#FFFFFF");
        strokeWeight(this.hudU(7));
        circle(cx, cy, d);
        pop();

        push();
        textFont(fonts.jersey20 || 'sans-serif');
        textSize(this.hudU(48));
        textAlign(CENTER, CENTER);
        noStroke();
        fill("#FFFFFF");
        text(String(count), cx, cy - this.hudU(2));
        pop();
    }

    /**
     * Backpack HUD: circular base plate + carried utility item icon.
     * - No utility item / no charges left -> backpack icon
     * - Utility item equipped with charges left -> item icon
     */
    drawBackpackIcon(x, y) {
        const swap = constrain(this.utilityHudSwapProgress || 0, 0, 1);
        const hasUtility = this.hasUsableUtilityItem() && !!this.getEquippedUtilityItemIcon();
        const backpackImg = assets.backpackImg || null;
        const utilityImg = this.getEquippedUtilityItemIcon();

        const frameW = this.hudW(160);
        const frameH = this.hudH(160);
        const frameR = this.hudU(34);

        this.drawHudRoundedPanel(x, y, frameW, frameH, frameR, {
            bg: "#F5F0FF",
            stroke: "#9B8FB8",
            strokeWeight: this.hudU(7),
            outerShadowColor: "#000000",
            outerShadowAlpha: 0.5,
            outerShadowDistance: this.hudU(7),
            outerShadowAngleDeg: 100,
            innerShadowColor: "#FFFFFF",
            innerShadowAlpha: 0.8,
            innerShadowDistance: this.hudU(11),
            innerShadowAngleDeg: 90
        });

        const cx = x + frameW / 2;
        const cy = y + frameH / 2;
        const pulse = 1 + sin(frameCount * 0.18) * 0.04 * swap;
        const scaledH = this.hudU(120) * pulse;

        if (!hasUtility) {
            this.drawHudIconFitted(backpackImg, cx, cy, scaledH, 255, -8);
            return;
        }
        this.drawHudIconFitted(backpackImg, cx, cy, scaledH, 255 * (1 - swap), -8);
        this.drawHudIconFitted(utilityImg, cx, cy, scaledH, 255 * swap, -3);
        const labelW = this.hudW(120);
        const labelH = this.hudH(30);
        const labelX = x + frameW / 2 - labelW / 2;
        const labelY = y + frameH + this.hudU(6);

        push();
        rectMode(CORNER);
        noStroke();
        fill(60, 50, 90, 220);
        rect(labelX, labelY, labelW, labelH, this.hudU(12));

        fill(255);
        textFont(fonts.jersey20 || 'sans-serif');
        textSize(this.hudU(22));
        textAlign(CENTER, CENTER);
        text("PRESS E", labelX + labelW / 2, labelY + labelH / 2 + this.hudU(1));
        pop();

        this.drawHudIconFitted(backpackImg, cx, cy, scaledH, 255 * (1 - swap), -8);
        this.drawHudIconFitted(utilityImg, cx, cy, scaledH, 255 * swap, -3);
    }
   
    /**
     * Renders the distance progress bar mapped against the level's total distance target.
     */
    drawProgressBar(x, y) {
        const frameW = this.hudW(70);
        const frameH = this.hudH(480);
        const frameR = this.hudU(20);
        const inset = this.hudU(6);
        const innerX = x + inset;
        const innerY = y + inset;
        const innerW = frameW - inset * 2;
        const innerH = frameH - inset * 2;
        const endlessMode = (typeof isEndlessRunMode === "function") && isEndlessRunMode();
        let pct = 0;

        if (endlessMode) {
            pct = this.getEndlessProgressRatio();
        } else {
            let total = DAYS_CONFIG[currentDayID].totalDistance;
            pct = constrain(this.distanceRun / total, 0, 1);
        }

        const fillH = innerH * pct;

        this.drawHudRoundedPanel(x, y, frameW, frameH, frameR, {
            bg: "#F5F0FF",
            stroke: "#9B8FB8",
            strokeWeight: this.hudU(7),
            outerShadowColor: "#000000",
            outerShadowAlpha: 0.5,
            outerShadowDistance: this.hudU(7),
            outerShadowAngleDeg: 100,
            innerShadowColor: "#FFFFFF",
            innerShadowAlpha: 0.8,
            innerShadowDistance: this.hudU(11),
            innerShadowAngleDeg: 90
        });

        if (fillH > 0) {
            push();
            this.clipRoundedRect(innerX, innerY, innerW, innerH, max(this.hudU(8), frameR - inset));
            const grad = drawingContext.createLinearGradient(innerX, innerY + innerH, innerX, innerY);
            grad.addColorStop(0, "#F9A825");
            grad.addColorStop(0.55, "#FFC107");
            grad.addColorStop(1, "#FFD93D");
            drawingContext.fillStyle = grad;
            noStroke();
            rect(innerX, innerY + innerH - fillH, innerW, fillH, max(this.hudU(8), frameR - inset));
            pop();
        }

        if (endlessMode) {
            this.drawEndlessProgressMarkers(x, y, frameW, frameH, inset);
            return;
        }

        const flagImg = assets.distanceFlagImg || null;
        if (flagImg) {
            imageMode(CORNER);
            image(flagImg, this.hudX(38), this.hudY(255), this.hudW(79), this.hudH(91));
        }
    }

    getEndlessProgressRatio() {
        const checkpointSec = 30;
        const rivalCount = this.getEndlessProgressPortraits().length;
        const totalSec = Math.max(0, floor((this.playTimeFrames || 0) / 60));
        return constrain(totalSec / (checkpointSec * rivalCount), 0, 1);
    }

    getEndlessProgressPortraits() {
        return [
            assets.portraitWiola,
            assets.portraitLayla,
            assets.portraitRaymond,
            assets.portraitYuki,
            assets.portraitCharlotte
        ];
    }

    drawEndlessProgressMarkers(x, y, frameW, frameH, inset) {
        const portraits = this.getEndlessProgressPortraits();
        const checkpointSec = 30;
        const totalSec = Math.max(0, floor((this.playTimeFrames || 0) / 60));
        const passedNpcCount = floor(max(0, this.playTimeFrames || 0) / (60 * checkpointSec));
        const markerCount = portraits.length;
        const innerX = x + inset;
        const innerY = y + inset;
        const innerW = frameW - inset * 2;
        const innerH = frameH - inset * 2;
        const avatarSize = this.hudU(42);
        const avatarX = innerX + (innerW - avatarSize) / 2;

        push();
        textAlign(CENTER, CENTER);
        textFont(fonts.jersey20 || "sans-serif");
        textSize(this.hudU(28));
        noStroke();
        fill("#FFFFFF");
        text("AHEAD", x + frameW / 2, y - this.hudU(18));
        pop();

        for (let i = 0; i < markerCount; i++) {
            const markerRatio = (i + 1) / markerCount;
            const centerY = innerY + innerH - innerH * markerRatio;
            this.drawHudPortraitMarker(
                portraits[i],
                avatarX,
                centerY - avatarSize / 2,
                avatarSize,
                avatarSize,
                i < passedNpcCount
            );
        }

        const flagImg = assets.distanceFlagImg || null;
        if (flagImg) {
            const ratio = this.getEndlessProgressRatio();
            const flagW = this.hudW(68);
            const flagH = this.hudH(78);
            const flagX = x - this.hudW(6);
            const flagY = innerY + innerH - innerH * ratio - flagH * 0.5;

            push();
            imageMode(CORNER);
            image(flagImg, flagX, constrain(flagY, y - this.hudH(18), y + frameH - flagH), flagW, flagH);
            pop();
        }

        if (totalSec > checkpointSec * markerCount) {
            push();
            textAlign(CENTER, CENTER);
            textFont(fonts.body || "sans-serif");
            textSize(this.hudU(30));
            textStyle(BOLD);
            stroke(0);
            strokeWeight(this.hudU(5));
            fill("#FF2A2A");
            text("winner!", x + frameW / 2, y - this.hudU(58));
            pop();
        }
    }

    drawHudPortraitMarker(img, x, y, w, h, passed) {
        const radius = this.hudU(16);
        push();
        noStroke();
        fill("#FFFFFF");
        rect(x, y, w, h, radius);
        pop();

        push();
        drawingContext.save();
        this.clipRoundedRect(x, y, w, h, radius);
        imageMode(CORNER);
        rectMode(CORNER);
        if (img && img.width > 0 && img.height > 0) {
            const imgRatio = img.width / img.height;
            const boxRatio = w / h;
            let sx = 0;
            let sy = 0;
            let sw = img.width;
            let sh = img.height;
            if (imgRatio > boxRatio) {
                sw = img.height * boxRatio;
                sx = (img.width - sw) * 0.5;
            } else {
                sh = img.width / boxRatio;
                sy = (img.height - sh) * 0.5;
            }
            tint(255, passed ? 150 : 255);
            image(img, x, y, w, h, sx, sy, sw, sh);
            noTint();
        } else {
            noStroke();
            fill(passed ? 180 : 230);
            rect(x, y, w, h, radius);
        }
        drawingContext.restore();

        noFill();
        stroke(passed ? "#FFD93D" : "#FFFFFF");
        strokeWeight(this.hudU(4));
        rect(x, y, w, h, radius);
        pop();
    }

    getHudScale() {
        const sx = width / 1920;
        const sy = height / 1080;
        const su = min(sx, sy);
        return { sx, sy, su };
    }

    hudX(v) {
        return v * (width / 1920);
    }

    hudY(v) {
        return v * (height / 1080);
    }

    hudW(v) {
        return v * (width / 1920);
    }

    hudH(v) {
        return v * (height / 1080);
    }

    hudU(v) {
        const s = min(width / 1920, height / 1080);
        return v * s;
    }

    drawHudRoundedPanel(x, y, w, h, r, style) {
        const outer = this.shadowOffset(style.outerShadowDistance, style.outerShadowAngleDeg);

        push();
        noStroke();
        fill(this.colorWithAlpha(style.outerShadowColor, style.outerShadowAlpha));
        rect(x + outer.x, y + outer.y, w, h, r);
        pop();

        push();
        noStroke();
        fill(style.bg);
        rect(x, y, w, h, r);
        pop();

        push();
        this.clipRoundedRect(x, y, w, h, r);
        const inner = this.shadowOffset(style.innerShadowDistance, style.innerShadowAngleDeg);
        noStroke();
        fill(this.colorWithAlpha(style.innerShadowColor, style.innerShadowAlpha));
        rect(x + inner.x, y + inner.y, w, h, r);
        pop();

        push();
        noFill();
        stroke(style.stroke);
        strokeWeight(style.strokeWeight);
        rect(x, y, w, h, r);
        pop();
    }

    drawHudIconFitted(img, cx, cy, targetH, alpha, rotDeg) {
        if (!img || alpha <= 0) return;

        const ratio = img.width > 0 && img.height > 0 ? (img.width / img.height) : 1;
        const drawH = targetH;
        const drawW = drawH * ratio;

        push();
        imageMode(CENTER);
        tint(255, constrain(alpha, 0, 255));
        translate(cx, cy);
        rotate(radians(rotDeg || 0));
        image(img, 0, 0, drawW, drawH);
        noTint();
        pop();
    }

    clipRoundedRect(x, y, w, h, r) {
        const ctx = drawingContext;
        const rr = min(r, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + rr, y);
        ctx.lineTo(x + w - rr, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
        ctx.lineTo(x + w, y + h - rr);
        ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
        ctx.lineTo(x + rr, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
        ctx.lineTo(x, y + rr);
        ctx.quadraticCurveTo(x, y, x + rr, y);
        ctx.closePath();
        ctx.clip();
    }

    clipCircle(cx, cy, d) {
        const ctx = drawingContext;
        ctx.beginPath();
        ctx.arc(cx, cy, d / 2, 0, TWO_PI);
        ctx.closePath();
        ctx.clip();
    }

    shadowOffset(distance, angleDeg) {
        return {
            x: cos(radians(angleDeg)) * distance,
            y: sin(radians(angleDeg)) * distance
        };
    }

    colorWithAlpha(hex, alpha) {
        const clean = String(hex || "#000000").replace("#", "");
        const full = clean.length === 3
            ? clean.split("").map(c => c + c).join("")
            : clean;
        const r = parseInt(full.slice(0, 2), 16) || 0;
        const g = parseInt(full.slice(2, 4), 16) || 0;
        const b = parseInt(full.slice(4, 6), 16) || 0;
        return `rgba(${r}, ${g}, ${b}, ${constrain(alpha, 0, 1)})`;
    }

    drawSpeedBoostBanner() {
        if (this.speedBoostFramesRemaining <= 0) return;

        push();
        textAlign(CENTER, CENTER);
        textSize(48);
        textStyle(BOLD);
        fill(255, 230, 80, 235);
        stroke(30, 30, 30, 160);
        strokeWeight(4);
        text("SPEED UP", width / 2, height * 0.38);
        pop();
    }

    applyRunScrollSpeed() {
        if (this.baseRunScrollSpeed === null) {
            this.baseRunScrollSpeed = GLOBAL_CONFIG.scrollSpeed;
        }

        const puddleMul = this.puddleTrapActive ? this.puddleSlowMultiplier : 1;
        if (this.speedBoostFramesRemaining > 0) {
            GLOBAL_CONFIG.scrollSpeed = this.baseRunScrollSpeed * this.activeSpeedMultiplier * puddleMul;
            this.wasSpeedBoostActive = true;
        } else if (this.wasSpeedBoostActive || this.puddleTrapActive) {
            GLOBAL_CONFIG.scrollSpeed = this.baseRunScrollSpeed * puddleMul;
            this.wasSpeedBoostActive = false;
        }
    }

    // ─── GAME STATE ──────────────────────────────────────────────────────────

    /**
     * Deducts health from a collision impact; triggers an instant fail on BUS hits.
     */
    takeDamage(damage, type) {
        if (this.isInvincibleActive()) return;
        this.health -= damage;
        if (damage > 0) this.carHitCount++;
        if (type === "BUS") {
            this.triggerGameOver("HIT_BUS");
        }
    }

    /**
     * Applies Scooter Rider crowd-control sequence:
     * 0.5s stun -> 1.0s lane-change delay. Camera shake remains TODO.
     */
    applyScooterRiderHit(stunSeconds, laneDelaySeconds) {
        const fps = 60;
        this.stunFramesRemaining = max(this.stunFramesRemaining, floor(stunSeconds * fps));
        this.laneDelayFramesRemaining = max(this.laneDelayFramesRemaining, floor(laneDelaySeconds * fps));
        this.targetLaneIndex = this.currentLaneIndex;
        this.laneVelocityX = 0;
        // TODO: Camera shake hook point.
    }

    /**
     * Homeless crowd-control:
     * - Hit from L1 homeless -> snap to L3 edge, then bounce to L3 center
     * - Hit from L4 homeless -> snap to L2 edge, then bounce to L2 center
     */
    applyHomelessForcedLaneSwitch(sourceLane) {
        let targetLaneIndex = this.targetLaneIndex;
        if (sourceLane === 1) targetLaneIndex = 2;      // L3 (0-based index)
        else if (sourceLane === 4) targetLaneIndex = 1; // L2
        else {
            // Fallback: toward center side lane.
            targetLaneIndex = (this.currentLaneIndex <= 1) ? 2 : 1;
        }
        this.targetLaneIndex = targetLaneIndex;

        const lane2Center = this.runLaneCenters[1];
        const lane3Center = this.runLaneCenters[2];
        const centerDividerX = (lane2Center + lane3Center) / 2;
        const targetCenterX = this.runLaneCenters[targetLaneIndex];

        // Place player at target-lane edge near the center divider.
        let edgeX = centerDividerX;
        if (targetLaneIndex === 2) edgeX -= 8; // L3 left edge bias
        if (targetLaneIndex === 1) edgeX += 8; // L2 right edge bias

        this.x = constrain(edgeX, this.minX, this.maxX);

        // Elastic feel: strong initial velocity from edge toward lane center.
        const toCenterDir = targetCenterX >= this.x ? 1 : -1;
        this.laneVelocityX = toCenterDir * 30;

        // Small lock so player input doesn't cancel the bounce animation immediately.
        this.laneDelayFramesRemaining = max(this.laneDelayFramesRemaining, floor(0.32 * 60));
        this.leftHeld = false;
        this.rightHeld = false;
    }

    applyEmptyScooterBuff(speedBoostSeconds, invincibleSeconds, speedMultiplier) {
        const fps = 60;
        this.speedBoostFramesRemaining = max(this.speedBoostFramesRemaining, floor(speedBoostSeconds * fps));
        this.invincibleFramesRemaining = max(this.invincibleFramesRemaining, floor(invincibleSeconds * fps));
        this.activeSpeedMultiplier = speedMultiplier || 1.2;
    }

    hasEmptyScooterBuffActive() {
        return this.speedBoostFramesRemaining > 0 || this.invincibleFramesRemaining > 0;
    }

    cancelEmptyScooterBuff() {
        this.speedBoostFramesRemaining = 0;
        this.invincibleFramesRemaining = 0;
        this.activeSpeedMultiplier = 1;
        if (this.baseRunScrollSpeed !== null) {
            GLOBAL_CONFIG.scrollSpeed = this.baseRunScrollSpeed;
        }
        this.wasSpeedBoostActive = false;
    }

    applyCoffeeBuff(healAmount, overflowEffect, hpLockDurationSec) {
        const prevHealth = this.health;
        this.health = min(this.maxHealth, this.health + (healAmount || 0));
        this.coffeeCupCount++;

        const hasOverflow = (prevHealth + (healAmount || 0)) > this.maxHealth;
        if (hasOverflow && overflowEffect === "hpLock") {
            const fps = 60;
            this.hpLockFramesRemaining = max(this.hpLockFramesRemaining, floor((hpLockDurationSec || 3.0) * fps));
            this.hpLockValue = this.health;
        }
    }

    applyPuddleTrap(escapePressRequired, slowMultiplier) {
        this.puddleTrapActive = true;
        this.puddleEscapePressCount = 0;
        this.puddleEscapePressRequired = max(1, floor(escapePressRequired || 3));
        this.puddleSlowMultiplier = constrain(Number(slowMultiplier || 0.72), 0.4, 0.95);
    }

    handlePuddleEscapePress() {
        if (!this.puddleTrapActive) return false;
        this.puddleEscapePressCount++;
        if (this.puddleEscapePressCount >= this.puddleEscapePressRequired) {
            this.puddleTrapActive = false;
            this.puddleEscapePressCount = 0;
            this.puddleEscapePressRequired = 3;
            this.puddleSlowMultiplier = 0.72;
            if (this.baseRunScrollSpeed !== null) {
                GLOBAL_CONFIG.scrollSpeed = this.baseRunScrollSpeed;
            }
        }
        return true;
    }

    isInvincibleActive() {
        return this.invincibleFramesRemaining > 0 || this.hpLockFramesRemaining > 0;
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
