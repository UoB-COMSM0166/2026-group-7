// Park Street Survivor - Room Scene
// Responsibilities: Bedroom walkable-area definition, collision resolution, interaction detection, and rendering.

class RoomScene {

    constructor() {
        // next to the bed bcz Iris just wake up
        this.playerSpawnX = 940;
        this.playerSpawnY = 580;

        this.walkableArea = {
            minX: 925,
            maxX: 1155,
            minY: 470,
            maxY: 720
        };

        this.carpetArea = {
            minX: 940,
            maxX: 970,
            minY: 715,
            maxY: 770
        };

        this.deskX = 1085;
        this.deskY = 430;
        // After testing + immersive feeling(a bit boring feeling from walking to the desk and door)
        this.deskThreshold = 80;
        this.deskBoxW = 115;
        this.deskBoxH = 50;

        this.doorX = 955;
        this.doorY = 760;
        this.doorThreshold = 80;
        this.doorBoxW = 60;
        this.doorBoxH = 45;

        this.isPlayerNearDesk = false;
        this.isPlayerNearDoor = false;

        this.doorBlockTimer = 0;
        this.doorBlockMessage = "";

        this.dialogueBox = new DialogueBox();

        // Cached once on first render to avoid per-frame division.
        this._otherBgScale = null;
        this._roomBgScale = null;
        this._roomTopY = null; // derived from roomBg scale, also cached
        this._cachedBedroomImg = null; // tracks which bedroom image the scale was computed for

        this._uiIntroLastStep = -1;
        this._backpackIdleTimer = 0;
        this._backpackIdleTriggered = false;
        this._doorIdleTimer = 0;
        this._doorIdleTriggered = false;

        this.backButton = new UIButton(70, 65, 60, 60, "BACK_ARROW", () => {
            gameState.setState(STATE_LEVEL_SELECT);
            if (mainMenu) {
                mainMenu.menuState = STATE_LEVEL_SELECT;
                mainMenu.timeWheel.bgAlpha = 0;
                mainMenu.timeWheel.triggerEntrance();
            }
            if (typeof loop === 'function') loop();
        });
    }

    reset() {
        if (typeof player !== 'undefined') {
            player.x = this.playerSpawnX;
            player.y = this.playerSpawnY;
        }
        this.isPlayerNearDesk = false;
        this.isPlayerNearDoor = false;
        this.doorBlockTimer = 0;
        this.doorBlockMessage = "";
        this.dialogueBox.reset();
        this._uiIntroLastStep = -1;
        this._backpackIdleTimer = 0;
        this._backpackIdleTriggered = false;
        this._doorIdleTimer = 0;
        this._doorIdleTriggered = false;
        // Force background image cache to refresh so the correct day's bedroom
        // is always shown on the first frame after entering the room.
        this._roomBgScale = null;
        this._cachedBedroomImg = null;
        this._roomTopY = null;
    }

    /** Returns true if the given point falls within any walkable zone. */
    isWalkable(x, y) {
        let inMainArea = (
            x >= this.walkableArea.minX && x <= this.walkableArea.maxX &&
            y >= this.walkableArea.minY && y <= this.walkableArea.maxY
        );
        let inCarpetArea = (
            x >= this.carpetArea.minX && x <= this.carpetArea.maxX &&
            y >= this.carpetArea.minY && y <= this.carpetArea.maxY
        );
        return inMainArea || inCarpetArea;
    }

    // player wont get stuck next to the wall(boundary) but sliding a bit to let the player realise that is the boundary
    /** Tries full move → X-only → Y-only → no move, in that order. */
    getValidPosition(newX, newY, oldX, oldY) {
        if (this.isWalkable(newX, newY)) return { x: newX, y: newY };
        if (this.isWalkable(newX, oldY)) return { x: newX, y: oldY };
        if (this.isWalkable(oldX, newY)) return { x: oldX, y: newY };
        return { x: oldX, y: oldY };
    }

    checkInteraction() {
        if (typeof player !== 'undefined') {
            // Use squared distance to avoid sqrt() — compare threshold² instead
            let deskThreshSq = this.deskThreshold * this.deskThreshold;
            let doorThreshSq = this.doorThreshold * this.doorThreshold;
            let dx, dy;

            dx = player.x - this.deskX; dy = player.y - this.deskY;
            this.isPlayerNearDesk = (dx * dx + dy * dy < deskThreshSq);

            dx = player.x - this.doorX; dy = player.y - this.doorY;
            this.isPlayerNearDoor = (dx * dx + dy * dy < doorThreshSq);
        }
    }

    handleKeyPress(keyCode) {
        const isConfirmKey = keyCode === 69 || keyCode === ENTER || keyCode === 13;
        const isSpaceKey   = keyCode === 32;

        // Dismiss persistent blocking dialogue before processing any interaction
        if ((isConfirmKey || isSpaceKey) && this.dialogueBox.active && this.dialogueBox.persistent) {
            // UI intro: advance the step instead of just dismissing, so the next dialogue appears
            if (typeof tutorialHints !== 'undefined' && tutorialHints.roomPhase === 'UI_INTRO') {
                if (typeof playSFX === 'function') playSFX(sfxClick);
                if (tutorialHints.uiIntroStep === 0) {
                    tutorialHints.uiIntroStep = 1;
                    this.dialogueBox.persistent = false;
                    this.dialogueBox.active = false;
                } else {
                    tutorialHints.uiTutorialDone   = true;
                    tutorialHints.uiIntroStep      = 0;
                    tutorialHints.roomPhase        = 'DESK';
                    tutorialHints.moveTutorialDone = true;
                    this.dialogueBox.persistent    = false;
                    this.dialogueBox.active        = false;
                    this._uiIntroLastStep          = -1;
                }
                return;
            }
            this.dialogueBox.persistent = false;
            this.dialogueBox.active = false;
            return;
        }

        if (this.isPlayerNearDesk && isConfirmKey) {
            if (typeof newBadges !== 'undefined') newBadges.delete('new_item');
            if (typeof backpackUI !== 'undefined' && backpackUI) {
                backpackUI.initScatteredItems();
            }
            // Advance tutorial hint: desk visited → now prompt to close backpack once items are packed
            if (typeof tutorialHints !== 'undefined' && tutorialHints.roomPhase === 'DESK') {
                tutorialHints.roomPhase = 'CLOSE_BP';
            }
            gameState.setState(STATE_INVENTORY);
            if (typeof playSFX !== 'undefined' && typeof sfxClick !== 'undefined') {
                playSFX(sfxClick);
            }
        }

        if (this.isPlayerNearDoor && isConfirmKey) {
            // Tutorial gate: door is locked until the backpack phase is fully done
            if (typeof tutorialHints !== 'undefined' &&
                tutorialHints.roomPhase !== 'DOOR' &&
                tutorialHints.roomPhase !== 'DONE') {
                this.dialogueBox.persistent = true;
                this.dialogueBox.trigger("I should get ready first — I still need to sort out my bag!", null, "IRIS");
                return;
            }
            if (typeof backpackUI !== 'undefined' && backpackUI && !backpackUI.hasRequiredItems()) {
                let missing = backpackUI.getMissingRequiredItems();
                this.dialogueBox.persistent = true;
                this.dialogueBox.trigger("I can't leave without my " + missing.join(" and ") + "! I need to pack them first.", null, "IRIS");
                return;
            }
            if (typeof player !== 'undefined') {
                player.x = GLOBAL_CONFIG.lanes.lane1;
                player.y = PLAYER_RUN_FOOT_Y;  // Player foot anchor for day run
                if (typeof player.syncUtilityItemFromBackpack === "function") {
                    player.syncUtilityItemFromBackpack();
                }
            }
            if (typeof startRoomExitRunSequence === 'function') {
                startRoomExitRunSequence();
            } else {
                gameState.setState(STATE_DAY_RUN);
            }
            if (typeof playSFX !== 'undefined' && typeof sfxClick !== 'undefined') {
                playSFX(sfxClick);
            }
        }
    }

    triggerDialog(text) {
        this.dialogueBox.trigger(text);
    }


    display() {
        push();

        if (assets && assets.otherBg) {
            if (this._otherBgScale === null) {
                this._otherBgScale = max(width / assets.otherBg.width, height / assets.otherBg.height);
            }
            let s = this._otherBgScale;
            imageMode(CENTER);
            image(assets.otherBg, width / 2, height / 2, assets.otherBg.width * s, assets.otherBg.height * s);
        } else {
            background(80, 60, 100);
        }

        // Dark overlay — alpha matches all other otherBg screens (see SHARED_BG_OVERLAY_ALPHA)
        noStroke();
        fill(0, 0, 0, SHARED_BG_OVERLAY_ALPHA);
        rectMode(CORNER);
        rect(0, 0, width, height);
        imageMode(CORNER);

        const _bedroomImg = (() => {
            if (!assets) return null;
            const d = (typeof currentDayID === 'number') ? currentDayID : 1;
            if (d <= 2) return assets.csBedroomSunny  || assets.roomBg;
            if (d === 3) return assets.csBedroomOvercast || assets.roomBg;
            return assets.csBedroomRain || assets.roomBg;
        })();
        if (_bedroomImg) {
            if (this._roomBgScale === null || this._cachedBedroomImg !== _bedroomImg) {
                this._cachedBedroomImg = _bedroomImg;
                this._roomBgScale = min(width / _bedroomImg.width, height / _bedroomImg.height) * 0.8;
                this._roomTopY = height / 2 - (_bedroomImg.height * this._roomBgScale) / 2 + 100;
            }
            let s = this._roomBgScale;
            imageMode(CENTER);
            image(_bedroomImg, width / 2, height / 2, _bedroomImg.width * s, _bedroomImg.height * s);
        }

        // Room UI is hidden during cutscenes — the room background doubles as cutscene backdrop.
        let _inCutscene = (typeof gameState !== 'undefined' &&
                           typeof STATE_CUTSCENE !== 'undefined' &&
                           gameState.currentState === STATE_CUTSCENE);

        if (!_inCutscene) {
            this.checkInteraction();

            // Idle timers only count while the player is actively in the room
            // (not while paused, in a cutscene, or in any other overlay state).
            let _inRoom = (typeof gameState !== 'undefined' &&
                           typeof STATE_ROOM !== 'undefined' &&
                           gameState.currentState === STATE_ROOM);

            // Backpack idle timer: if player hasn't opened backpack within 10 s on DESK phase
            if (_inRoom && typeof tutorialHints !== 'undefined' && tutorialHints.roomPhase === 'DESK') {
                if (!this._backpackIdleTriggered) {
                    this._backpackIdleTimer++;
                    // Providing the player enough time to understand the mechanics but also notice the player after a period to make sure the player would not waste too much time figuring what to do the next
                    if (this._backpackIdleTimer >= 600) {
                        this._backpackIdleTriggered = true;
                        this.dialogueBox.persistent = true;
                        this.dialogueBox.trigger("Wait — I'm going to be late! I need to sort out my bag first...", null, "IRIS");
                    }
                }
            } else if (!_inRoom || (typeof tutorialHints !== 'undefined' && tutorialHints.roomPhase !== 'DESK')) {
                this._backpackIdleTimer = 0;
                this._backpackIdleTriggered = false;
            }

            // Door idle timer: prompt Iris if player hasn't left within 10 s of reaching DOOR phase
            if (_inRoom && typeof tutorialHints !== 'undefined' && tutorialHints.roomPhase === 'DOOR') {
                if (!this._doorIdleTriggered) {
                    this._doorIdleTimer++;
                    if (this._doorIdleTimer >= 600) {
                        this._doorIdleTriggered = true;
                        this.dialogueBox.persistent = true;
                        this.dialogueBox.trigger("Come on, we're going to be late! Head to the door and press [E] to leave!", null, "IRIS");
                    }
                }
            } else if (!_inRoom || (typeof tutorialHints !== 'undefined' && tutorialHints.roomPhase !== 'DOOR')) {
                this._doorIdleTimer = 0;
                this._doorIdleTriggered = false;
            }

            this.drawInteractionIndicators();
            this.drawTutorialHints();

            this.backButton.isFocused = this.backButton.checkMouse(mouseX, mouseY);
            this.backButton.update();
            this.backButton.display();
        }

        this.drawRoomDevTools();

        pop();
    }

    /** Returns true if the click was consumed. */
    handleMousePressed(mx, my) {
        if (typeof tutorialHints !== 'undefined' &&
            tutorialHints.roomPhase === 'UI_INTRO') {
            // Let pause-button clicks pass through
            if (dist(mx, my, width - 65, 65) >= 80) {
                if (typeof playSFX === 'function') playSFX(sfxClick);
                if (tutorialHints.uiIntroStep === 0) {
                    tutorialHints.uiIntroStep = 1;
                } else {
                    tutorialHints.uiTutorialDone = true;
                    tutorialHints.uiIntroStep    = 0;
                    tutorialHints.roomPhase      = 'DESK';
                    tutorialHints.moveTutorialDone = true;
                    this.dialogueBox.persistent = false;
                    this.dialogueBox.active = false;
                    this._uiIntroLastStep = -1;
                }
                return true;
            }
        }

        if (this.dialogueBox.active && this.dialogueBox.persistent) {
            this.dialogueBox.persistent = false;
            this.dialogueBox.active = false;
            return true;
        }

        if (this.backButton.checkMouse(mx, my)) {
            this.backButton.handleClick();
            return true;
        }
        return false;
    }

    /**
     * Yellow outline box always visible when tutorial phase matches; prompt+key only on proximity.
     */
    drawInteractionIndicators() {
        let phase = (typeof tutorialHints !== 'undefined') ? tutorialHints.roomPhase : 'DONE';

        let showDeskBox = this.isPlayerNearDesk || (phase === 'DESK');
        // Door is only interactive once the tutorial reaches the DOOR or DONE phase
        let doorUnlocked = (phase === 'DOOR' || phase === 'DONE');
        let showDoorBox = doorUnlocked && (this.isPlayerNearDoor || (phase === 'DOOR'));
        if (!showDeskBox && !showDoorBox) return;

        push();

        let roomTopY = (this._roomTopY !== null) ? this._roomTopY : 100;
        let pulse = (sin(frameCount * 0.1) + 1) * 0.5;

        // Drawn regardless of proximity so the tutorial goal is always visible.
        let boxTarget;
        if (phase === 'DOOR') {
            boxTarget = { x: this.doorX, y: this.doorY, w: this.doorBoxW, h: this.doorBoxH };
        } else if (showDeskBox) {
            boxTarget = { x: this.deskX, y: this.deskY, w: this.deskBoxW, h: this.deskBoxH };
        } else {
            boxTarget = { x: this.doorX, y: this.doorY, w: this.doorBoxW, h: this.doorBoxH };
        }
        noFill();
        stroke(255, 216, 0, 150 + pulse * 105);
        strokeWeight(2);
        rectMode(CENTER);
        rect(boxTarget.x, boxTarget.y, boxTarget.w, boxTarget.h, 8);

        // New-item badge on the desk corner when a new item arrived this day
        if (typeof newBadges !== 'undefined' && newBadges.has('new_item') &&
            boxTarget.x === this.deskX) {
            if (typeof _drawBadge === 'function') {
                _drawBadge(boxTarget.x + boxTarget.w / 2, boxTarget.y - boxTarget.h / 2, 52);
            }
        }

        // Door takes priority over desk so the correct prompt always shows.
        let promptLabel = null;
        if (doorUnlocked && this.isPlayerNearDoor) {
            promptLabel = "LEAVE ROOM";
        } else if (this.isPlayerNearDesk) {
            promptLabel = "CHECK DESK";
        }

        if (promptLabel) {
            // Styled prompt bar — same style as difficulty select screen
            const promptText = `[E] / [ENTER]  TO ${promptLabel}`;
            const promptW = 520, promptH = 52, promptY = roomTopY;
            rectMode(CENTER);
            fill(101, 63, 191, 204);
            stroke('#E2CAF8'); strokeWeight(3);
            rect(width / 2, promptY, promptW, promptH, 15);
            noStroke();
            textAlign(CENTER, CENTER);
            textFont(fonts.body || fonts.title);
            textSize(24);
            stroke(0, 0, 0, 180); strokeWeight(4);
            fill(220, 185, 255);
            text(promptText, width / 2, promptY);
            noStroke();

            // Show E icon and ENTER icon side by side above the text
            let iconY  = roomTopY - 60;
            let iconH  = 40;
            let gap    = 14;
            let frame  = floor(frameCount / 15) % 3;
            let tintA  = 200 + pulse * 55;
            imageMode(CENTER);
            tint(255, tintA);

            if (assets.keys && assets.keys.e) {
                let sh = assets.keys.e;
                let sw = sh.width / 3;
                let iw = iconH * (sw / sh.height);
                image(sh, width / 2 - iw / 2 - gap, iconY, iw, iconH, frame * sw, 0, sw, sh.height);
            }
            if (assets.keys && assets.keys.enter) {
                let sh = assets.keys.enter;
                let sw = sh.width / 3;
                let iw = iconH * (sw / sh.height);
                image(sh, width / 2 + iw / 2 + gap, iconY, iw, iconH, frame * sw, 0, sw, sh.height);
            }
            noTint();
        }

        pop();
    }

    drawTutorialHints() {
        if (typeof tutorialHints === 'undefined') return;
        let phase = tutorialHints.roomPhase;

        if (phase === 'UI_INTRO') {
            this.drawUIIntroTutorial();
            return;
        }

        // On Day 1 the move guide is always visible (persists through all phases)
        if (typeof currentDayID !== 'undefined' && currentDayID === 1) {
            this.drawMoveTutorial();
        }

        if (!assets.warningImg) return;
        if (phase !== 'DESK' && phase !== 'DOOR') return;

        // Same pulse as the yellow box in drawInteractionIndicators()
        let pulse   = (sin(frameCount * 0.1) + 1) * 0.5;
        let breathe = 0.85 + pulse * 0.15;
        let size    = 72;
        let img     = assets.warningImg;
        let renderW = size * (img.width / img.height) * breathe;
        let renderH = size * breathe;

        push();
        imageMode(CENTER);
        if (phase === 'DESK') {
            image(img, this.deskX + 55, this.deskY - 45, renderW, renderH);
        } else {
            image(img, this.doorX + 35, this.doorY - 55, renderW, renderH);
        }
        pop();
    }

    /** Phase chain: UI_INTRO → MOVE → DESK → CLOSE_BP → DOOR → DONE. Movement blocked externally. */
    drawUIIntroTutorial() {
        if (typeof tutorialHints === 'undefined') return;

        let step = tutorialHints.uiIntroStep;

        // Trigger the dialogue box whenever the step changes
        if (this._uiIntroLastStep !== step) {
            this._uiIntroLastStep = step;
            const MSGS = [
                "There's a PAUSE button in the top-right corner. Click it — or press [P] on your keyboard — anytime during gameplay.",
                "From the pause menu: HELP (controls guide), SETTINGS (volume), STORY (journal), EXIT (main menu). Click anywhere to continue!"
            ];
            this.dialogueBox.persistent = true;
            this.dialogueBox.trigger(MSGS[step]);
        }

    }

    drawMoveTutorial() {
        const DESIGN_W = 1920;
        const DESIGN_H = 1080;
        const s = min(width / DESIGN_W, height / DESIGN_H);

        const panelW = 310 * s;
        const panelH = 480 * s;
        const panelX = 462.5 * s;  // centre of the gap between background left (0) and room left wall (925)
        const panelY = height / 2;

        let pulse    = (sin(frameCount * 0.08) + 1) * 0.5;
        let keyAlpha = 180 + pulse * 75;

        push();
        rectMode(CENTER);

        // Panel shadow
        noStroke();
        fill(0, 0, 0, 80);
        rect(panelX + 4 * s, panelY + 6 * s, panelW, panelH, 18 * s);

        // Panel background
        fill(18, 8, 42, 220);
        rect(panelX, panelY, panelW, panelH, 18 * s);

        // Gold outer border
        noFill();
        stroke(255, 200, 60, 180);
        strokeWeight(2.5);
        rect(panelX, panelY, panelW, panelH, 18 * s);

        stroke(255, 200, 60, 60);
        strokeWeight(1);
        rect(panelX, panelY, panelW - 14 * s, panelH - 14 * s, 13 * s);

        let targetH = 58 * s;

        let drawKey = (sheet, x, y) => {
            if (!sheet) return;
            let sw      = sheet.width / 3;
            let sh      = sheet.height;
            let renderH = targetH;
            let renderW = (sw / sh) * renderH;
            imageMode(CENTER);
            tint(255, keyAlpha);
            let frame = floor(frameCount / 20) % 3;
            image(sheet, x, y, renderW, renderH, frame * sw, 0, sw, sh);
            noTint();
        };

        let refSheet   = assets.keys.w;
        let keyRenderW = refSheet ? (refSheet.width / 3 / refSheet.height) * targetH : targetH * 1.1;
        let colGap = keyRenderW + 10 * s;
        let rowOff = targetH + 10 * s;

        let titleY = panelY - panelH / 2 + 30 * s;
        textAlign(CENTER, CENTER);
        textFont(fonts.body);
        textSize(24 * s);
        stroke(0, 0, 0, 160); strokeWeight(3);
        fill(255, 220, 80, keyAlpha);
        text("MOVE TO NAVIGATE", panelX, titleY);
        noStroke();
        fill(255, 220, 80, keyAlpha);
        text("MOVE TO NAVIGATE", panelX, titleY);

        let wasdCY = panelY - 100 * s;
        let topRowY = wasdCY - rowOff / 2;
        let botRowY = wasdCY + rowOff / 2;
        drawKey(assets.keys.w, panelX,            topRowY);
        drawKey(assets.keys.a, panelX - colGap,   botRowY);
        drawKey(assets.keys.s, panelX,            botRowY);
        drawKey(assets.keys.d, panelX + colGap,   botRowY);

        let orY = panelY + 10 * s;
        textSize(24 * s);
        stroke(0, 0, 0, 120); strokeWeight(2);
        fill(180, 160, 220, keyAlpha * 0.8);
        text("OR", panelX, orY);
        noStroke();
        fill(180, 160, 220, keyAlpha * 0.8);
        text("OR", panelX, orY);

        let arrCY = panelY + 115 * s;
        let arrTopY = arrCY - rowOff / 2;
        let arrBotY = arrCY + rowOff / 2;
        drawKey(assets.keys.up,    panelX,            arrTopY);
        drawKey(assets.keys.left,  panelX - colGap,   arrBotY);
        drawKey(assets.keys.down,  panelX,            arrBotY);
        drawKey(assets.keys.right, panelX + colGap,   arrBotY);

        pop();
    }

    /** Called from sketch.js AFTER player.display() so it renders on top. */
    displayOverlay() {
        this.dialogueBox.display();
    }

    drawRoomDevTools() {
        if (!developerMode) return;

        push();
        // Crosshair cursor
        stroke(255, 0, 0, 150);
        line(mouseX, 0, mouseX, height);
        line(0, mouseY, width, mouseY);

        noStroke();
        fill(255, 255, 0);
        textFont(fonts.body);
        textSize(18);
        text(`X: ${floor(mouseX)}, Y: ${floor(mouseY)}`, mouseX + 10, mouseY - 10);

        noFill();
        stroke(0, 255, 0);
        strokeWeight(2);
        rectMode(CORNERS);
        rect(this.walkableArea.minX, this.walkableArea.minY, this.walkableArea.maxX, this.walkableArea.maxY);
        rect(this.carpetArea.minX, this.carpetArea.minY, this.carpetArea.maxX, this.carpetArea.maxY);
        pop();
    }

    drawDebugBoundaries() {
        push();

        stroke(0, 255, 0, 150); strokeWeight(2); noFill(); rectMode(CORNERS);
        rect(this.walkableArea.minX, this.walkableArea.minY, this.walkableArea.maxX, this.walkableArea.maxY);
        fill(0, 255, 0); noStroke(); textSize(12);
        text("MAIN AREA", (this.walkableArea.minX + this.walkableArea.maxX) / 2, this.walkableArea.minY - 10);

        stroke(0, 200, 255, 150); strokeWeight(2); noFill();
        rect(this.carpetArea.minX, this.carpetArea.minY, this.carpetArea.maxX, this.carpetArea.maxY);
        fill(0, 200, 255); noStroke();
        text("CARPET", (this.carpetArea.minX + this.carpetArea.maxX) / 2, (this.carpetArea.minY + this.carpetArea.maxY) / 2);

        fill(255, 0, 255);
        circle(this.playerSpawnX, this.playerSpawnY, 12);
        text("SPAWN", this.playerSpawnX + 15, this.playerSpawnY);

        stroke(255, 215, 0, 150); strokeWeight(2); noFill(); rectMode(CENTER);
        rect(this.deskX, this.deskY, this.deskBoxW, this.deskBoxH);
        stroke(100, 200, 255, 150);
        rect(this.doorX, this.doorY, this.doorBoxW, this.doorBoxH);

        pop();
    }
}
