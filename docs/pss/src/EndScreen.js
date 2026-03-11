// Park Street Survivor - End Screen System
// Responsibilities: Fail screens (3 variants) and Success screen with overlay UI.

// ─── SHARED CONSTANTS ───────────────────────────────────────────────────────
const END_SCREEN_BOX_W_RATIO = 0.55;   // Box width  = 55% of canvas
const END_SCREEN_BOX_H_RATIO = 0.70;   // Box height = 70% of canvas
const END_OVERLAY_ALPHA      = 160;     // Black overlay transparency

// ─────────────────────────────────────────────────────────────────────────────
// BASE CLASS: EndScreenBase
// Shared rendering logic for both fail and success overlays.
// ─────────────────────────────────────────────────────────────────────────────
class EndScreenBase {
    constructor() {
        this.selectedIndex = -1; // No option selected by default
        this.options = [];
        this.isActive = false;
        this.stateStep = "MAIN";
    }

    activate() {
        this.selectedIndex = -1;
        this.isActive = true;

        this.stateStep = "MAIN"; 
        if (this.mainOptions) {
            this.options = this.mainOptions; 
        }
    }

    // ─── SHARED RENDERERS ──────────────────────────────────────────────────

    /** Draws the semi-transparent black overlay across the full canvas. */
    drawOverlay() {
        push();
        noStroke();
        fill(0, 0, 0, END_OVERLAY_ALPHA);
        rect(0, 0, width, height);
        pop();
    }

    /** Draws the central box with the given background image. */
    drawBox(bgImage) {
        let boxW = width  * END_SCREEN_BOX_W_RATIO;
        let boxH = height * END_SCREEN_BOX_H_RATIO;
        let boxX = (width  - boxW) / 2;
        let boxY = (height - boxH) / 2;

        push();
        // Box shadow
        fill(0, 0, 0, 80);
        noStroke();
        rect(boxX + 6, boxY + 6, boxW, boxH, 16);

        // Box border
        stroke(255, 215, 0);
        strokeWeight(3);
        fill(30, 20, 40);
        rect(boxX, boxY, boxW, boxH, 16);

        // Background image inside box (clipped)
        if (bgImage) {
            imageMode(CORNER);
            drawingContext.save();
            drawingContext.beginPath();
            drawingContext.roundRect(boxX, boxY, boxW, boxH, 16);
            drawingContext.clip();
            image(bgImage, boxX, boxY, boxW, boxH);
            // Darken the background image slightly for readability
            noStroke();
            fill(0, 0, 0, 100);
            rect(boxX, boxY, boxW, boxH);
            drawingContext.restore();
        }
        pop();

        return { x: boxX, y: boxY, w: boxW, h: boxH };
    }

    /** Draws a progress bar showing how far the player ran. */
    drawProgressBar(cx, y, barW) {
        let total = DAYS_CONFIG[currentDayID] ? DAYS_CONFIG[currentDayID].totalDistance : 1;
        let dist  = player ? player.distanceRun : 0;
        let pct   = constrain(dist / total, 0, 1);

        push();
        // Label
        textAlign(CENTER, CENTER);
        textFont(fonts.body);
        textSize(18);
        fill(200);
        text("PROGRESS", cx, y - 18);

        // Track
        let barH = 20;
        let barX = cx - barW / 2;
        noStroke();
        fill(50, 50, 60);
        rect(barX, y, barW, barH, 6);

        // Fill
        fill(50, 150, 255);
        rect(barX + 2, y + 2, (barW - 4) * pct, barH - 4, 4);

        // Percentage text
        textSize(14);
        fill(255);
        text(Math.floor(pct * 100) + "%", cx, y + barH + 14);
        pop();
    }

    /** Draws navigation buttons horizontally, using shared devMenu sizing vars. */
    drawButtons(cx, y) {
        let isModeSelect = (this.stateStep === "MODE_SELECT");
        let bW = typeof devMenuBtnW !== 'undefined' ? devMenuBtnW : 260;
        let bH = typeof devMenuBtnH !== 'undefined' ? devMenuBtnH : 90;
        // MODE_SELECT labels ("BACK TO ROOM") are longer so use a smaller text size
        let ts = isModeSelect ? 38 : (typeof devMenuTextSize !== 'undefined' ? devMenuTextSize : 55);
        let optW = bW;
        let optH = bH;
        let spacing = isModeSelect ? 320 : 300;

        let totalW = (this.options.length - 1) * spacing;
        let startX = cx - totalW / 2;

        push();
        textAlign(CENTER, CENTER);
        for (let i = 0; i < this.options.length; i++) {
            let isSelected = (i === this.selectedIndex);
            let btnX = startX + i * spacing;

            push();
            translate(btnX, y);

            if (isSelected) scale(1.15);

            imageMode(CENTER);
            if (assets.btnImg) {
                image(assets.btnImg, 0, 0, optW, optH);
            }

            textFont(fonts.body);
            textSize(ts);
            stroke(0, 0, 0, 180);
            strokeWeight(5);
            fill(255, 215, 0);
            text(this.options[i], 0, -10);
            noStroke();
            fill(255, 215, 0);
            text(this.options[i], 0, -10);

            pop();
        }
        pop();
    }

    /** Draws exit-confirm prompt box + text above the YES/CANCEL buttons. */
    drawExitConfirmText(cx, y) {
        let f = fonts.jersey20 || fonts.body;
        let boxW = 720, boxH = 200;
        push();
        rectMode(CENTER);
        fill(14, 8, 38, 240);
        stroke(200, 80, 80, 200);
        strokeWeight(3);
        rect(cx, y - 90, boxW, boxH, 16);

        textAlign(CENTER, CENTER);
        textFont(fonts.title); textSize(38);
        stroke(0, 0, 0, 180); strokeWeight(5); fill(255, 100, 100);
        text("EXIT TO MAIN MENU?", cx, y - 138);
        noStroke(); fill(255, 100, 100);
        text("EXIT TO MAIN MENU?", cx, y - 138);
        textFont(f); textSize(24); noStroke(); fill(255, 210, 80);
        text("Warning: unsaved progress may be lost.", cx, y - 82);
        textSize(20); fill(180, 180, 220);
        text("Tip: click the back arrow (top-left) to return without exiting.", cx, y - 48);
        pop();
    }

    /** Draws the back arrow in the top-left corner, during MODE_SELECT and EXIT_CONFIRM. */
    drawBackButton() {
        if (this.stateStep !== "MODE_SELECT" && this.stateStep !== "EXIT_CONFIRM") return;
        if (!assets.backImg) return;
        
        let bx = 70, by = 65; 
        let isHover = dist(mouseX, mouseY, bx, by) < 40;
        
        push();
        translate(bx, by);
        if (isHover) scale(1.15);
        imageMode(CENTER);
        image(assets.backImg, 0, 0, 120, 120); 
        pop();
    }

    // ─── INPUT ──────────────────────────────────────────────────────────────

    /** Forward keyboard input: Left/Right to navigate, Enter to select, ESC to go back. */
    handleKeyPress(keyCode) {
        if (keyCode === LEFT_ARROW || keyCode === 65) {
            this.selectedIndex = (this.selectedIndex - 1 + this.options.length) % this.options.length;
            if (typeof playSFX === 'function') playSFX(sfxSelect);
        } else if (keyCode === RIGHT_ARROW || keyCode === 68) {
            this.selectedIndex = (this.selectedIndex + 1) % this.options.length;
            if (typeof playSFX === 'function') playSFX(sfxSelect);
        } else if (keyCode === ENTER || keyCode === 13) {
            if (this.selectedIndex >= 0) {
                if (typeof playSFX === 'function') playSFX(sfxClick);
                this.executeSelection();
            }
        } else if (keyCode === ESCAPE || keyCode === 8) {
            // Allow returning to the main button options from the sub-menu or exit confirm
            if (this.stateStep === "MODE_SELECT" || this.stateStep === "EXIT_CONFIRM") {
                this.stateStep = "MAIN";
                this.options = this.mainOptions;
                this.selectedIndex = -1;
                if (typeof playSFX === 'function') playSFX(sfxSelect);
            }
        }
    }

    /** Forward mouse click to horizontally laid out buttons. */
    handleClick(mx, my) {
        if ((this.stateStep === "MODE_SELECT" || this.stateStep === "EXIT_CONFIRM") && assets.backImg) {
            let bx = 70, by = 65;
            if (dist(mx, my, bx, by) < 40) {
                if (typeof playSFX === 'function') playSFX(sfxClick);
                this.stateStep = "MAIN";
                this.options = this.mainOptions;
                this.selectedIndex = -1;
                return;
            }
        }

        let cx = width / 2;
        let isModeSelect = (this.stateStep === "MODE_SELECT");
        let optW = typeof devMenuBtnW !== 'undefined' ? devMenuBtnW : 260;
        let optH = typeof devMenuBtnH !== 'undefined' ? devMenuBtnH : 90;
        let spacing = isModeSelect ? 320 : 300;
        let totalW = (this.options.length - 1) * spacing;
        let startX = cx - totalW / 2;
        let btnY = this._getButtonStartY();

        for (let i = 0; i < this.options.length; i++) {
            let btnX = startX + i * spacing;
            if (mx > btnX - optW / 2 && mx < btnX + optW / 2 &&
                my > btnY - optH / 2 && my < btnY + optH / 2) {
                this.selectedIndex = i;
                if (typeof playSFX === 'function') playSFX(sfxClick);
                this.executeSelection();
                return;
            }
        }
    }

    /** Forward mouse move: highlights button, clears if mouse leaves all buttons. */
    handleMouseMove(mx, my) {
        let cx = width / 2;
        let isModeSelect = (this.stateStep === "MODE_SELECT");
        let optW = typeof devMenuBtnW !== 'undefined' ? devMenuBtnW : 260;
        let optH = typeof devMenuBtnH !== 'undefined' ? devMenuBtnH : 90;
        let spacing = isModeSelect ? 320 : 300;
        let totalW = (this.options.length - 1) * spacing;
        let startX = cx - totalW / 2;
        let btnY = this._getButtonStartY();
        
        let isHoveringAny = false;

        for (let i = 0; i < this.options.length; i++) {
            let btnX = startX + i * spacing;
            // Horizontal hitbox check
            if (mx > btnX - optW / 2 && mx < btnX + optW / 2 &&
                my > btnY - optH / 2 && my < btnY + optH / 2) {
                
                if (this.selectedIndex !== i) {
                    this.selectedIndex = i;
                    if (typeof playSFX === 'function') playSFX(sfxSelect);
                }
                isHoveringAny = true;
                break;
            }
        }

        // Reset to normal state if mouse is not over any button
        if (!isHoveringAny) {
            this.selectedIndex = -1; 
        }
    }

    /** Override in subclass to return the Y position where buttons start. */
    _getButtonStartY() { return height / 2 + 80; }

    /** Override in subclass to handle the selected option. */
    executeSelection() {}
}


// ─────────────────────────────────────────────────────────────────────────────
// FAIL SCREEN (Base for all 3 fail variants)
// Background: frozen gameplay + black overlay + box with other_bg.png
// ─────────────────────────────────────────────────────────────────────────────
class FailScreen extends EndScreenBase {
    constructor(failType) {
        super();
        this.failType = failType; // "HIT_BUS", "EXHAUSTED", "LATE"

        // Define primary and secondary menu options
        this.mainOptions = ["NEW GAME", "EXIT"];
        this.modeOptions = ["BACK TO ROOM", "START RUN"];
        this.options = this.mainOptions;
    }

    display() {
        const endlessMode = (typeof isEndlessRunMode === "function") && isEndlessRunMode();
        if (endlessMode) {
            this.mainOptions = ["RETRY", "EXIT"];
            if (this.stateStep === "MAIN") this.options = this.mainOptions;
        } else {
            this.mainOptions = ["NEW GAME", "EXIT"];
            if (this.stateStep === "MAIN") this.options = this.mainOptions;
        }

        this.drawOverlay();
        let box = this.drawBox(assets.bbg);
        let cx  = box.x + box.w / 2;

        if (this.stateStep === "MAIN") {
        push();
        textAlign(CENTER, CENTER);
        textFont(fonts.title);
        textSize(72);
        fill(255, 50, 50);
        text("FAIL", cx, box.y + box.h * 0.20);
        pop();

        push();
        textAlign(CENTER, CENTER);
        textFont(fonts.body);
        textSize(22);
        fill(200);
        if (endlessMode) {
            const survivalSec = player ? floor(player.playTimeFrames / 60) : 0;
            const hits = player ? player.carHitCount : 0;
            text("Survival Time: " + this._formatDuration(survivalSec), cx, box.y + box.h * 0.35);
            text("You outperformed 99% of players!", cx, box.y + box.h * 0.43);
            text("Collisions: " + hits, cx, box.y + box.h * 0.51);
        } else {
            // Moved towards the center (from 0.35 to 0.38)
            text(this._getReasonText(), cx, box.y + box.h * 0.38);
        }
        pop();

        if (!endlessMode) {
            // Moved towards the center (from 0.48 to 0.55)
            this.drawProgressBar(cx, box.y + box.h * 0.55, box.w * 0.6);
        }
        }
        if (this.stateStep === "EXIT_CONFIRM") {
            this.drawExitConfirmText(cx, this._getButtonStartY());
        }
        this.drawButtons(cx, this._getButtonStartY());

        this.drawBackButton();
    }

    _getButtonStartY() {
        let boxH = height * END_SCREEN_BOX_H_RATIO;
        let boxY = (height - boxH) / 2;

        if (this.stateStep === "MODE_SELECT" || this.stateStep === "EXIT_CONFIRM") {
            return boxY + boxH * 0.7;
        }

        // Moved down significantly to make room for the larger buttons and centered UI
        return boxY + boxH * 0.85;
    }
    _getReasonText() {
        switch (this.failType) {
            case "HIT_BUS":   return "You were hit by a speeding bus.";
            case "EXHAUSTED": return "You ran out of energy.";
            case "LATE":      return "You didn't make it in time!";
            default:          return "Game Over.";
        }
    }

    _formatDuration(totalSec) {
        const sec = Math.max(0, Math.floor(totalSec || 0));
        const mm = Math.floor(sec / 60);
        const ss = sec % 60;
        const h = Math.floor(mm / 60);
        const m = mm % 60;
        if (h > 0) {
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
        }
        return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
    }

    executeSelection() {
        let option = this.options[this.selectedIndex];
        const endlessMode = (typeof isEndlessRunMode === "function") && isEndlessRunMode();

        if (this.stateStep === "MAIN") {
            if (option === "RETRY" && endlessMode) {
                triggerTransition(() => {
                    setupRunDirectly(currentDayID, currentRunMode);
                });
            } else if (option === "NEW GAME") {
                // Show the BACK TO ROOM / START RUN sub-menu
                this.stateStep = "MODE_SELECT";
                this.options = this.modeOptions;
                this.selectedIndex = -1;
            } else if (option === "EXIT") {
                if (endlessMode) {
                    // Endless mode: exit directly to menu without confirmation
                    triggerTransition(() => { gameState.resetFlags(); gameState.setState(STATE_MENU); });
                } else {
                    this.stateStep = "EXIT_CONFIRM";
                    this.options = ["YES, EXIT", "CANCEL"];
                    this.selectedIndex = -1;
                }
            }
        } else if (this.stateStep === "EXIT_CONFIRM") {
            if (option === "YES, EXIT") {
                triggerTransition(() => { gameState.resetFlags(); gameState.setState(STATE_MENU); });
            } else if (option === "CANCEL") {
                this.stateStep = "MAIN"; this.options = this.mainOptions; this.selectedIndex = -1;
            }
        } else if (this.stateStep === "MODE_SELECT") {
            if (option === "BACK TO ROOM") {
                triggerTransition(() => {
                    gameState.resetFlags();
                    setupRun(currentDayID, { playRoomClock: false });
                });
            } else if (option === "START RUN") {
                triggerTransition(() => {
                    setupRunDirectly(currentDayID, currentRunMode);
                });
            }
        }
    }
}


// ─────────────────────────────────────────────────────────────────────────────
// SUCCESS SCREEN
// Background: library.jpg + black overlay + box with other_bg.png
// ─────────────────────────────────────────────────────────────────────────────
class SuccessScreen extends EndScreenBase {
    constructor() {
        super();
        // Define primary and secondary menu options
        this.mainOptions = ["CONTINUE", "RESTART", "EXIT"];
        this.modeOptions = ["BACK TO ROOM", "START RUN"];
        this.options = this.mainOptions;
    }

    display() {
        let libBg = (assets.csLibraryBg || assets.libraryBg);
        if (libBg) {
            imageMode(CORNER);
            image(libBg, 0, 0, width, height);
        } else {
            background(20);
        }

        this.drawOverlay();
        let box = this.drawBox(assets.bbg);
        let cx  = box.x + box.w / 2;

        if (this.stateStep === "MAIN") {
        push();
        textAlign(CENTER, CENTER);
        textFont(fonts.title);
        textSize(64);
        fill(100, 255, 100);
        text("SUCCESS", cx, box.y + box.h * 0.20);
        pop();

        push();
        textAlign(CENTER, CENTER);
        textFont(fonts.body);
        textSize(20);
        fill(255, 230, 150);
        let hits = player ? player.carHitCount : 0;
        let msg = hits === 0 ? "Incredible! You made it without getting hit once!" 
                             : "Congrats! You got hit by cars " + hits + " time" + (hits > 1 ? "s" : "") + " and still made it!";
        // Moved towards the center (from 0.30 to 0.38)
        text(msg, cx, box.y + box.h * 0.38);
        pop();

        if (assets.irisSuccess && assets.irisSuccess.length > 0) {
            const smoothSequence = [
                0, 0,
                1, 
                2, 
                3, 3,
                4, 4,
                3, 3,
                2, 
                1
            ]; 
    
        let playSpeed = 5; 
        let totalTicks = smoothSequence.length * playSpeed;
        let sequenceIdx = floor((frameCount % totalTicks) / playSpeed);
    
        let displayIdx = smoothSequence[sequenceIdx];

        let imgH = box.h * 0.45;
        let imgW = imgH * (assets.irisSuccess[0].width / assets.irisSuccess[0].height);
    
        push();
        imageMode(CENTER);
        translate(cx, box.y + box.h * 0.60);
        image(assets.irisSuccess[displayIdx], 0, 0, imgW, imgH);
        pop();
        }
        }
        if (this.stateStep === "EXIT_CONFIRM") {
            this.drawExitConfirmText(cx, this._getButtonStartY());
        }
        this.drawButtons(cx, this._getButtonStartY());

        this.drawBackButton();
    }

    _getButtonStartY() {
        let boxH = height * END_SCREEN_BOX_H_RATIO;
        let boxY = (height - boxH) / 2;

        if (this.stateStep === "MODE_SELECT" || this.stateStep === "EXIT_CONFIRM") {
            return boxY + boxH * 0.7;
        }

        // Moved down to match FailScreen
        return boxY + boxH * 0.85;
    }

    executeSelection() {
        let option = this.options[this.selectedIndex];
        
        if (this.stateStep === "MAIN") {
            if (option === "CONTINUE") {
                triggerTransition(() => {
                    gameState.resetFlags();
                    if (currentDayID === 5) {
                        // All five days complete — roll credits
                        if (typeof resetCredits === 'function') resetCredits();
                        gameState.setState(STATE_CREDITS);
                    } else {
                        currentUnlockedDay = Math.max(currentUnlockedDay, currentDayID + 1);
                        gameState.setState(STATE_LEVEL_SELECT);
                        if (mainMenu && mainMenu.timeWheel) {
                            let nextDay = currentDayID + 1;
                            mainMenu.timeWheel.selectedDay = nextDay;
                            mainMenu.timeWheel.targetIndex  = nextDay - 1;
                            mainMenu.timeWheel.currentIndex = nextDay - 1;
                            mainMenu.timeWheel.triggerEntrance();
                        }
                    }
                });
            } else if (option === "RESTART") {
                // Show the BACK TO ROOM / START RUN sub-menu
                this.stateStep = "MODE_SELECT";
                this.options = this.modeOptions;
                this.selectedIndex = -1;
            } else if (option === "EXIT") {
                this.stateStep = "EXIT_CONFIRM";
                this.options = ["YES, EXIT", "CANCEL"];
                this.selectedIndex = -1;
            }
        } else if (this.stateStep === "EXIT_CONFIRM") {
            if (option === "YES, EXIT") {
                triggerTransition(() => { gameState.resetFlags(); gameState.setState(STATE_MENU); });
            } else if (option === "CANCEL") {
                this.stateStep = "MAIN"; this.options = this.mainOptions; this.selectedIndex = -1;
            }
        } else if (this.stateStep === "MODE_SELECT") {
            if (option === "BACK TO ROOM") {
                triggerTransition(() => {
                    gameState.resetFlags();
                    setupRun(currentDayID, { playRoomClock: false });
                });
            } else if (option === "START RUN") {
                triggerTransition(() => {
                    setupRunDirectly(currentDayID, currentRunMode);
                });
            }
        }
    }
}


// ─────────────────────────────────────────────────────────────────────────────
// END SCREEN MANAGER
// Routes to the correct fail variant or success screen.
// ─────────────────────────────────────────────────────────────────────────────
class EndScreenManager {
    constructor() {
        // Three fail screen instances (same layout, different fail types)
        this.failScreens = {
            "HIT_BUS":   new FailScreen("HIT_BUS"),
            "EXHAUSTED": new FailScreen("EXHAUSTED"),
            "LATE":      new FailScreen("LATE")
        };
        this.successScreen = new SuccessScreen();
        this._activeScreen = null;
    }

    /** Called when entering STATE_FAIL. Sets up the correct fail variant. */
    activateFail(reason) {
        let screen = this.failScreens[reason] || this.failScreens["EXHAUSTED"];
        screen.failType = reason; // ensure reason is current
        screen.activate();
        this._activeScreen = screen;

        // New fail-audio rule:
        // stop current BGM, then play day-specific fail audio.
        if (typeof playFailEndAudio === 'function') {
            playFailEndAudio();
        }
    }

    /** Called when entering STATE_WIN. */
    activateSuccess() {
        this.successScreen.activate();
        this._activeScreen = this.successScreen;

        if (typeof playWinEndAudio === 'function') {
            playWinEndAudio();
        }
    }

    /** Main display dispatcher. */
    display() {
        if (this._activeScreen) {
            this._activeScreen.display();
        }
    }

    /** Forward keyboard input to the active screen. */
    handleKeyPress(keyCode) {
        if (this._activeScreen) {
            this._activeScreen.handleKeyPress(keyCode);
        }
    }

    /** Forward mouse click to the active screen. */
    handleClick(mx, my) {
        if (this._activeScreen) {
            this._activeScreen.handleClick(mx, my);
        }
    }

    /** Forward mouse move for hover highlighting. */
    handleMouseMove(mx, my) {
        if (this._activeScreen) {
            this._activeScreen.handleMouseMove(mx, my);
        }
    }
}
