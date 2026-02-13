// Reusable UI Components
// Responsibility: UIButton with Vector Icon support and smooth Lerp scaling.

class UIButton {
    constructor(x, y, w, h, label, onClick) {
        this.x = x; this.y = y;
        this.w = w; this.h = h;
        this.label = label;
        this.onClick = onClick;
        
        // Animation State: Current and Target scale for smooth feedback
        this.currentScale = 1.0;
        this.targetScale = 1.0;
        this.isFocused = false; 
    }

    /**
     * LOGIC: ANIMATION UPDATE
     * Smoothly interpolates scale based on focus state.
     */
    update() {
        this.targetScale = this.isFocused ? 1.15 : 1.0;
        this.currentScale = lerp(this.currentScale, this.targetScale, 0.15);
    }

    /**
     * RENDERING: VISUAL OUTPUT
     * Handles both text-based labels and special vector icons like "BACK_ARROW".
     */
    display() {
        push();
        translate(this.x, this.y); 
        scale(this.currentScale);
        
        rectMode(CENTER);
        textAlign(CENTER, CENTER);
        textFont(fonts.body); 

        // 1. Visual Style: Focus vs Default
        if (this.isFocused) {
            fill(255, 215, 0); // Gold
            stroke(255);
            strokeWeight(4);
        } else {
            fill(0, 0, 0, 180); 
            stroke(255, 215, 0);
            strokeWeight(2);
        }

        // Draw the button body
        rect(0, 0, this.w, this.h, 10);

        // 2. Content Layer: Render Icon or Text
        noStroke();
        fill(this.isFocused ? 0 : 255);

        if (this.label === "BACK_ARROW") {
            // [Vector Graphics] Draw a clean back arrow icon
            stroke(this.isFocused ? 0 : 255);
            strokeWeight(3);
            noFill();
            // Arrow shaft
            line(-12, 0, 12, 0);
            // Arrow head (Pointed left)
            line(-12, 0, -4, -8);
            line(-12, 0, -4, 8);
        } else {
            // Standard Text Rendering
            textSize(24);
            text(this.label, 0, 0);
        }
        pop();
    }

    /**
     * INPUT: BOUNDS DETECTION
     * Essential for mouse-to-index synchronization in MainMenu.
     */
    checkMouse(mx, my) {
        return (mx > this.x - this.w / 2 && mx < this.x + this.w / 2 &&
                my > this.y - this.h / 2 && my < this.y + this.h / 2);
    }

    handleClick() {
        if (this.onClick) {
            this.onClick();
        }
    }
}

/**
 * CLASS: TimeWheel
 * Architecture: Asymmetric sidebar navigation (Persona 5 style) with cloud preview panel.
 * Enhanced with staggered drop-in animation on entrance.
 * 
 * Layout Components:
 *   - Left: Skewed vertical sidebar with day cards
 *   - Right: Cloud-masked preview window
 *   - Animation: No-bounce gravity drop with screen shake
 */
class TimeWheel {
    constructor(config) {
        this.config = config;
        this.selectedDay = 1;
        this.totalDays = 5;
        
        // Motion system for sidebar scrolling
        this.targetIndex = 0;
        this.currentIndex = 0;
        
        // Layout parameters
        this.anchorX = width * 0.15;
        this.verticalSpacing = 160;
        this.dayNames = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
        
        // Background blend state
        this.bgAlpha = 0;

        // Drop-in animation state
        this.isEntering = true;
        this.entryTimer = 0;

        // Per-card physics with staggered delays
        this._drops = [];
        let delays = [0, 4, 10, 6, 2];
        for (let i = 0; i < this.totalDays; i++) {
            this._drops.push({
                y:       -600 - random(200),
                vy:      0,
                landed:  false,
                delay:   delays[i],
                rotation: random(-25, 25)
            });
        }

        // Cloud drop physics (single cloud, synced with selected day)
        this._cloudDrop = {
            y:       -800,
            vy:      0,
            landed:  false,
            delay:   8,
            rotation: random(-15, 15)
        };
    }

    /**
     * PUBLIC INTERFACE: ENTRANCE TRIGGER
     * Resets physics state and initiates drop animation.
     */
    triggerEntrance() {
        this.isEntering = true;
        this.entryTimer = 0;
        this.bgAlpha    = 0;

        let delays = [0, 4, 10, 6, 2];
        for (let i = 0; i < this.totalDays; i++) {
            this._drops[i] = {
                y:       -600 - random(200),
                vy:      0,
                landed:  false,
                delay:   delays[i],
                rotation: random(-25, 25)
            };
        }

        this._cloudDrop = {
            y:       -800,
            vy:      0,
            landed:  false,
            delay:   8,
            rotation: random(-15, 15)
        };
    }

    /**
     * MAIN RENDERING PIPELINE
     */
    display() {
        this.currentIndex = lerp(this.currentIndex, this.targetIndex, 0.12);

        this.drawDynamicBackground();

        // Screen shake on first impact
        let shakeX = 0, shakeY = 0;
        if (this.isEntering) {
            this.entryTimer++;
            this._updateDropPhysics();

            let anyLanded = this._drops.some(d => d.landed);
            if (anyLanded) {
                let shakeFrames = this.entryTimer - 15;
                if (shakeFrames >= 0 && shakeFrames < 8) {
                    let intensity = map(shakeFrames, 0, 8, 5, 0);
                    shakeX = random(-intensity, intensity);
                    shakeY = random(-intensity, intensity);
                }
            }

            if (this._drops.every(d => d.landed) && this.entryTimer > 35) {
                this.isEntering = false;
            }
        }

        push();
        translate(shakeX, shakeY);

        this.renderCloudPreview(width * 0.65, height * 0.5);

        // Sidebar navigation
        push();
        translate(this.anchorX, height * 0.45);
        for (let i = 0; i < this.totalDays; i++) {
            this.drawNavNode(i);
        }
        pop();

        pop();
    }

    /**
     * PHYSICS ENGINE: DROP SIMULATION
     * No-bounce gravity with instant ground lock.
     * Applies to both sidebar cards and cloud preview.
     */
    _updateDropPhysics() {
        const gravity = 2.8;

        // Sidebar cards
        for (let i = 0; i < this.totalDays; i++) {
            let drop = this._drops[i];
            if (drop.landed) continue;

            if (this.entryTimer < drop.delay) continue;

            let diff = i - this.currentIndex;
            let targetY = diff * this.verticalSpacing;

            drop.vy += gravity;
            drop.y  += drop.vy;
            drop.rotation *= 0.88;

            if (drop.y >= targetY) {
                drop.y        = targetY;
                drop.vy       = 0;
                drop.landed   = true;
                drop.rotation = 0;
            }
        }

        // Cloud preview
        let cloud = this._cloudDrop;
        if (!cloud.landed) {
            if (this.entryTimer >= cloud.delay) {
                let targetY = 0;

                cloud.vy += gravity;
                cloud.y  += cloud.vy;
                cloud.rotation *= 0.88;

                if (cloud.y >= targetY) {
                    cloud.y        = targetY;
                    cloud.vy       = 0;
                    cloud.landed   = true;
                    cloud.rotation = 0;
                }
            }
        }
    }

    /**
     * RENDERER: DUAL-STATE BACKGROUND
     * Blends lock/unlock backgrounds based on selection.
     */
    drawDynamicBackground() {
        let isLocked = (this.selectedDay > currentUnlockedDay) && !DEBUG_UNLOCK_ALL;
        let targetAlpha = isLocked ? 0 : 255;
        this.bgAlpha = lerp(this.bgAlpha, targetAlpha, 0.08);

        imageMode(CORNER);
        
        if (assets.selectBg.lock) {
            image(assets.selectBg.lock, 0, 0, width, height);
        }

        if (assets.selectBg.unlock) {
            push();
            tint(255, this.bgAlpha);
            image(assets.selectBg.unlock, 0, 0, width, height);
            pop();
        }

        fill(0, 0, 0, 100);
        rect(0, 0, width, height);
    }

    /**
     * RENDERER: CLOUD PREVIEW PANEL
     * Direct cloud image display (no masking) with drop animation.
     * Uses Cloud-1.png for all days, grayscale filter for locked states.
     */
    renderCloudPreview(x, y) {
        let dayID = this.selectedDay;
        let isLocked = (dayID > currentUnlockedDay) && !DEBUG_UNLOCK_ALL;
        let cloudImg = assets.selectClouds[0];  // Always use Cloud-1

        if (!cloudImg) return;

        push();
        translate(x, y);
        
        // Floating animation (only when settled)
        if (!this.isEntering || this._cloudDrop.landed) {
            let floatY = sin(frameCount * 0.04) * 15;
            let floatX = cos(frameCount * 0.03) * 10;
            translate(floatX, floatY);
        }

        // Drop animation override
        let cloudY = 0;
        if (this.isEntering && !this._cloudDrop.landed) {
            cloudY = this._cloudDrop.y;
            rotate(radians(this._cloudDrop.rotation));
        }

        translate(0, cloudY);

        imageMode(CENTER);

        // Grayscale filter for locked days
        if (isLocked) {
            drawingContext.filter = 'grayscale(100%) brightness(0.6)';
        }

        // Pink dreamcore glow for unlocked
        if (!isLocked) {
            drawingContext.shadowBlur = 40;
            drawingContext.shadowColor = 'rgba(255, 105, 180, 0.6)';
        }

        image(cloudImg, 0, 0, 700, 450);

        drawingContext.shadowBlur = 0;
        drawingContext.filter = 'none';

        // Mission title positioned at cloud's left-center-lower area
        this.drawMissionTitle(dayID);
        
        pop();
    }

    /**
     * COMPONENT: SIDEBAR NAVIGATION NODE
     * P5-style skewed card with drop animation override.
     */
    drawNavNode(i) {
        let diff = i - this.currentIndex;
        let distFromCenter = abs(diff);
        
        let x = distFromCenter * 40;
        let y = diff * this.verticalSpacing;

        // Override Y during drop animation
        if (this.isEntering && !this._drops[i].landed) {
            y = this._drops[i].y;
        }

        push();
        translate(x, y);
        rotate(radians(-12));

        // Apply rotation during fall
        if (this.isEntering && !this._drops[i].landed) {
            rotate(radians(this._drops[i].rotation));
        }

        let isSelected = (i === this.selectedDay - 1);
        let isLocked = (i + 1 > currentUnlockedDay) && !DEBUG_UNLOCK_ALL;
        let alpha = map(distFromCenter, 0, 2, 255, 50);
        let s = map(distFromCenter, 0, 1, 1.2, 0.8);
        scale(constrain(s, 0.5, 1.5));

        // Card body
        noStroke();
        if (isLocked) {
            fill(30, 30, 45, alpha * 0.7);
        } else {
            fill(isSelected ? [255, 20, 147, alpha] : [70, 20, 90, alpha * 0.6]);
        }
        
        // P5 skewed trapezoid
        beginShape();
        vertex(-140, -40); vertex(160, -55);
        vertex(140, 40); vertex(-160, 55);
        endShape(CLOSE);

        // Day number - consistent size, selection indicated by color intensity
        textAlign(LEFT, CENTER);
        textFont(fonts.title);
        textSize(48);  // Fixed size for all
        fill(isSelected ? color(255, 215, 0, alpha) : color(255, alpha));  // Gold when selected
        text((i + 1).toString().padStart(2, '0'), -120, 5);

        // Weekday - gold color, consistent size
        textFont(fonts.body);
        textSize(22);  // Fixed size for all
        fill(isSelected ? color(255, 215, 0, alpha) : color(255, 215, 0, alpha * 0.8));  // Slightly dimmed when not selected
        text(this.dayNames[i], -20, 10);
        
        if (isLocked) {
            fill(180, 60, 60, alpha);
            textSize(14);
            text("LOCKED", -20, -20);
        }

        // Impact wave on landing
        if (this.isEntering && this._drops[i].landed) {
            let framesSinceLand = this.entryTimer - 12;
            if (framesSinceLand >= 0 && framesSinceLand < 10) {
                let progress = framesSinceLand / 10;
                noFill();
                strokeWeight(5 - progress * 4);
                stroke(255, 215, 0, (1 - progress) * 200);
                let waveSize = 80 + progress * 200;
                ellipse(0, 0, waveSize, waveSize * 0.6);
            }
        }

        pop();
    }

    /**
     * UI COMPONENT: MISSION TITLE OVERLAY
     * Positioned at cloud's left-center area, adjusted to avoid cloud pattern overlap.
     */
    drawMissionTitle(dayID) {
        push();
        translate(-220, 80);  // Left-center, slightly lower than before
        rotate(radians(-5));
        textFont(fonts.title);
        textAlign(LEFT, CENTER);
        
        // White stroke outline for readability
        strokeWeight(8);
        stroke(0, 0, 0, 180);
        fill(255);
        textSize(70);
        text("DAY", 0, 0);
        
        noStroke();
        fill(255);
        text("DAY", 0, 0);
        
        // Pink number with extra spacing
        strokeWeight(8);
        stroke(0, 0, 0, 180);
        fill(255, 105, 180);
        text(dayID.toString().padStart(2, '0'), 200, 0);  // Increased spacing from 170 to 200
        
        noStroke();
        fill(255, 105, 180);
        text(dayID.toString().padStart(2, '0'), 200, 0);
        
        pop();
    }

    /**
     * INPUT HANDLER: VERTICAL NAVIGATION
     * W/S or UP/DOWN arrows control selection.
     */
    handleInput(keyCode) {
        if (this.isEntering) return;

        if ((keyCode === UP_ARROW || keyCode === 87) && this.selectedDay > 1) {
            this.selectedDay--;
            this.targetIndex--;
            if (typeof playSFX === 'function') playSFX(sfxSelect);
        } else if ((keyCode === DOWN_ARROW || keyCode === 83) && this.selectedDay < this.totalDays) {
            this.selectedDay++;
            this.targetIndex++;
            if (typeof playSFX === 'function') playSFX(sfxSelect);
        }
    }
}


// [Role: UI/UX + Core Systems]
/**
 * UI SLIDER COMPONENT
 * Purpose: Handles global volume adjustment with a visual bar.
 */
class UISlider {
    constructor(x, y, w, minVal, maxVal, currentVal, label) {
        this.x = x; this.y = y;
        this.w = w;
        this.minVal = minVal;
        this.maxVal = maxVal;
        this.value = currentVal;
        this.label = label;
        
        this.knobSize = 24;
        this.isDragging = false;
    }

    display() {
        push();
        rectMode(CENTER);
        textAlign(LEFT, CENTER);
        
        textFont(fonts.body);
        fill(255);
        textSize(24);
        text(this.label, this.x - this.w / 2, this.y - 40);

        stroke(255, 100);
        strokeWeight(6);
        line(this.x - this.w / 2, this.y, this.x + this.w / 2, this.y);

        let sliderX = map(this.value, this.minVal, this.maxVal, this.x - this.w / 2, this.x + this.w / 2);

        noStroke();
        fill(this.isDragging ? color(255, 150, 200) : 255); 
        rect(sliderX, this.y, this.knobSize, this.knobSize + 10, 5);
        
        textFont(fonts.time);
        textAlign(CENTER, CENTER);
        fill(255, 200);
        textSize(20);
        text(floor(this.value * 100) + "%", sliderX, this.y + 35);
        pop();

        this.update();
    }

    update() {
        if (this.isDragging) {
            let mousePos = constrain(mouseX, this.x - this.w / 2, this.x + this.w / 2);
            this.value = map(mousePos, this.x - this.w / 2, this.x + this.w / 2, this.minVal, this.maxVal);
            
            if (typeof bgm !== 'undefined' && bgm) {
                bgm.setVolume(this.value);
            }
        }
    }

    handlePress(mx, my) {
        let sliderX = map(this.value, this.minVal, this.maxVal, this.x - this.w / 2, this.x + this.w / 2);
        if (dist(mx, my, sliderX, this.y) < 30) {
            this.isDragging = true;
        }
    }

    handleRelease() {
        this.isDragging = false;
    }
}