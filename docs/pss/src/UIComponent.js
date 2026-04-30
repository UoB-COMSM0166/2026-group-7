// Reusable UI Components
// Responsibility: UIButton with Vector Icon support and smooth Lerp scaling.

class UIButton {
    constructor(x, y, w, h, label, onClick, fontKey = 'body', labelSize = null, style = null) {
        this.x = x; this.y = y;
        this.w = w; this.h = h;
        this.label = label;
        this.onClick = onClick;
        this.fontKey = fontKey;
        this.labelSize = labelSize;
        this.style = style || {};

        this.currentScale = 1.0;
        this.targetScale = 1.0;
        this.isFocused = false;
    }

    update() {
        this.targetScale = this.isFocused ? 1.15 : 1.0;
        this.currentScale = lerp(this.currentScale, this.targetScale, 0.15);
    }

    display() {
        push();
        translate(this.x, this.y);
        scale(this.currentScale);  // lerp scale handles the zoom effect

        const labelFont = (typeof fonts !== 'undefined' && fonts[this.fontKey])
            ? fonts[this.fontKey]
            : ((typeof fonts !== 'undefined') ? fonts.body : null);

        imageMode(CENTER);
        rectMode(CENTER);
        textAlign(CENTER, CENTER);
        if (labelFont) textFont(labelFont);

        if (this.label === "BACK_ARROW") {
            // Back arrow — back.png, 2× render size, no tint
            if (assets.backImg) {
                image(assets.backImg, 0, 0, this.w * 2, this.h * 2);
            }
        } else {
            const useCustomSize = !!this.style.forceSize;
            let bW = useCustomSize
                ? this.w
                : ((typeof devMenuBtnW !== 'undefined') ? devMenuBtnW : (assets.btnImg ? assets.btnImg.width  : this.w));
            let bH = useCustomSize
                ? this.h
                : ((typeof devMenuBtnH !== 'undefined') ? devMenuBtnH : (assets.btnImg ? assets.btnImg.height : this.h));
            let ts = (this.labelSize !== null)
                ? this.labelSize
                : ((typeof devMenuTextSize !== 'undefined') ? devMenuTextSize : 24);
            const labelOffsetY = (typeof this.style.labelOffsetY === 'number') ? this.style.labelOffsetY : -10;
            const useDepthLayer = !!this.style.useDepthLayer;
            const blackShadow = this.style.shadowBlackOffset || { x: 1.5, y: 1.5 };
            const purpleShadow = this.style.shadowPurpleOffset || { x: 1, y: 1 };
            const hoverLift = this.style.hoverLiftOffset || { x: -0.5, y: -0.5 };
            const activePress = this.style.activePressOffset || { x: 1, y: 1 };
            const isActive = useDepthLayer && this.isFocused && typeof mouseIsPressed !== 'undefined' && mouseIsPressed;
            const frontOffset = isActive
                ? activePress
                : (this.isFocused ? hoverLift : { x: 0, y: 0 });
            // Store dims for corner-drag hit detection (world space, unscaled)
            this._bW = bW;
            this._bH = bH;
            const btnImage = (this.style.imageKey && assets[this.style.imageKey])
                ? assets[this.style.imageKey]
                : assets.btnImg;
            if (btnImage) {
                if (useDepthLayer) {
                    // Back-to-front depth stack: black rear shadow, purple mid shadow, then button face.
                    push();
                    tint(0, 0, 0, 200);
                    image(btnImage, blackShadow.x, blackShadow.y, bW, bH);
                    noTint();
                    pop();

                    push();
                    tint(83, 52, 131, 230);
                    image(btnImage, purpleShadow.x, purpleShadow.y, bW, bH);
                    noTint();
                    pop();
                }

                const drawX = frontOffset.x;
                const drawY = frontOffset.y;
                if (this.style.shape === 'roundedRect') {
                    const ctx = drawingContext;
                    const r = this.style.radius || 15;
                    if (ctx && typeof ctx.save === 'function' && typeof ctx.clip === 'function') {
                        try {
                            ctx.save();
                            ctx.beginPath();
                            if (typeof ctx.roundRect === 'function') {
                                ctx.roundRect(drawX - bW / 2, drawY - bH / 2, bW, bH, r);
                            } else {
                                ctx.rect(drawX - bW / 2, drawY - bH / 2, bW, bH);
                            }
                            ctx.clip();
                            image(btnImage, drawX, drawY, bW, bH);
                            ctx.restore();
                        } catch (e) {
                            if (ctx && typeof ctx.restore === 'function') ctx.restore();
                            image(btnImage, drawX, drawY, bW, bH);
                        }
                    } else {
                        image(btnImage, drawX, drawY, bW, bH);
                    }
                } else {
                    image(btnImage, drawX, drawY, bW, bH);
                }
            }

            if (this.style.outlineWeight && this.style.outlineWeight > 0) {
                noFill();
                stroke(this.style.outlineColor || 0);
                strokeWeight(this.style.outlineWeight);
                if (this.style.shape === 'roundedRect') {
                    rect(frontOffset.x, frontOffset.y, bW, bH, this.style.radius || 15);
                } else {
                    rect(frontOffset.x, frontOffset.y, bW, bH);
                }
            }

            if (!this.style.noLabel) {
                if (labelFont) textFont(labelFont);
                textSize(ts);
                textAlign(CENTER, CENTER);
                const useLabelStroke = !this.style.noLabelStroke;
                if (useLabelStroke) {
                    stroke(0, 0, 0, 180);
                    strokeWeight(5);
                } else {
                    noStroke();
                }
                fill(255, 215, 0);
                text(this.label, frontOffset.x, frontOffset.y + labelOffsetY);
                noStroke();
                fill(255, 215, 0);
                text(this.label, frontOffset.x, frontOffset.y + labelOffsetY);
            }
        }
        pop();

        // Dev-mode resize handles drawn in world space (outside push/scale)
        if (developerMode && this._bW && this.label !== "BACK_ARROW") {
            this._drawResizeHandles();
        }
    }

    /** Draw 4 corner handles + outline in world space. */
    _drawResizeHandles() {
        let hw = this._bW / 2, hh = this._bH / 2;
        push();
        // dashed-style outline
        noFill();
        stroke(80, 140, 255, 180);
        strokeWeight(1.5);
        rectMode(CORNER);
        rect(this.x - hw, this.y - hh, this._bW, this._bH);
        // four corner squares
        let corners = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
        for (let [sx, sy] of corners) {
            let cx = this.x + sx * hw;
            let cy = this.y + sy * hh;
            let active = devResizeState &&
                         devResizeState.signX === sx &&
                         devResizeState.signY === sy;
            stroke(active ? 255 : 80, active ? 120 : 140, active ? 0 : 255);
            strokeWeight(2);
            fill(active ? 255 : 255, active ? 200 : 255, active ? 0 : 80, 230);
            rectMode(CENTER);
            rect(cx, cy, 18, 18, 3);
        }
        pop();
    }

    /** Returns { signX, signY } if (mx,my) is near a corner handle, else null. */
    checkResizeCorner(mx, my) {
        if (!this._bW) return null;
        let hw = this._bW / 2, hh = this._bH / 2;
        let corners = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
        for (let [sx, sy] of corners) {
            let cx = this.x + sx * hw;
            let cy = this.y + sy * hh;
            if (abs(mx - cx) < 14 && abs(my - cy) < 14) {
                return { signX: sx, signY: sy };
            }
        }
        return null;
    }

    checkMouse(mx, my) {
        if (this.label === "BACK_ARROW") {
            // The back arrow is rendered at 2x size, so match its hitbox to the
            // visible sprite instead of the smaller default button bounds.
            const hw = this.w;
            const hh = this.h;
            return (mx > this.x - hw && mx < this.x + hw &&
                    my > this.y - hh && my < this.y + hh);
        }

        if (this.style.hitboxOverride) {
            const hb = this.style.hitboxOverride;
            const ox = hb.offsetX || 0;
            const oy = hb.offsetY || 0;
            const w = hb.w || this._bW || this.w;
            const h = hb.h || this._bH || this.h;
            const hw = w / 2;
            const hh = h / 2;
            const cx = this.x + ox;
            const cy = this.y + oy;
            return (mx > cx - hw && mx < cx + hw &&
                    my > cy - hh && my < cy + hh);
        }

        // Use actual rendered button dimensions for hit detection
        let hw = this._bW ? this._bW / 2 : ((typeof devMenuBtnW !== 'undefined') ? devMenuBtnW / 2 : this.w * 0.65);
        let hh = this._bH ? this._bH / 2 : ((typeof devMenuBtnH !== 'undefined') ? devMenuBtnH / 2 : this.h * 0.65);
        return (mx > this.x - hw && mx < this.x + hw &&
                my > this.y - hh && my < this.y + hh);
    }

    handleClick() {
        if (this.onClick) {
            this.onClick();
        }
    }
}

/** Persona 5-style skewed sidebar + cloud preview with staggered drop-in entrance animation. */
class TimeWheel {
    constructor(config) {
        this.config = config;
        this.selectedDay = 1;
        this.totalDays = 5;

        this.targetIndex = 0;
        this.currentIndex = 0;

        this.anchorX = width * 0.15;
        this.verticalSpacing = 185;
        this.dayNames = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

        this.bgAlpha = 0;
        this.isEntering = true;
        this.entryTimer = 0;

        this._drops = [];
        let delays = [0, 4, 10, 6, 2];
        for (let i = 0; i < this.totalDays; i++) {
            this._drops.push({
                y: -400 - random(100),
                vy: 0,
                landed: false,
                delay: delays[i],
                rotation: random(-25, 25)
            });
        }

        this._cloudDrop = {
            y: -800,
            vy: 0,
            landed: false,
            delay: 8,
            rotation: random(-15, 15)
        };

        this._cloudScale = 1.0;
        // Cloud stays gray during breathe phase before colorizing on unlock
        this._isBreathing = false;
        this._breatheTimer = 0;
    }

    triggerEntrance() {
        this.isEntering = true;
        this.entryTimer = 0;
        this.bgAlpha = 0;

        let delays = [0, 4, 10, 6, 2];
        for (let i = 0; i < this.totalDays; i++) {
            this._drops[i] = {
                y: -400 - random(100),
                vy: 0,
                landed: false,
                delay: delays[i],
                rotation: random(-25, 25)
            };
        }

        this._cloudDrop = {
            y: -800,
            vy: 0,
            landed: false,
            delay: 8,
            rotation: random(-15, 15)
        };
        this._cloudScale = 1.0;
        this._isBreathing = false;
        this._breatheTimer = 0;
    }

    display() {
        this.currentIndex = lerp(this.currentIndex, this.targetIndex, 0.12);

        this.drawDynamicBackground();

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

            if (this._drops.every(d => d.landed) && this._cloudDrop.landed && this.entryTimer > 20) {
                if (!this._isBreathing) {
                    this._isBreathing = true;
                    this._breatheTimer = 35;
                } else {
                    this._breatheTimer--;
                    if (this._breatheTimer <= 0) {
                        this.isEntering = false;
                        this._isBreathing = false;
                    }
                }
            }
        }

        push();
        translate(shakeX, shakeY);

        this.renderCloudPreview(width * 0.65, height * 0.5);

        push();
        translate(this.anchorX, height * 0.52);
        for (let i = 0; i < this.totalDays; i++) {
            this.drawNavNode(i);
        }
        pop();

        this.drawSelectionArrows();

        pop();
    }

    drawSelectionArrows() {
        if (!assets.backImg || this.isEntering) return;

        let arrowX   = width - 90;
        let centerY  = height / 2;
        let arrowSz  = 60;
        let arrowGap = 90;

        let canGoUp  = this.selectedDay > 1;
        let upHover  = canGoUp && dist(mouseX, mouseY, arrowX, centerY - arrowGap) < 35;
        push();
        translate(arrowX, centerY - arrowGap);
        rotate(HALF_PI);
        if (!canGoUp) tint(255, 60);
        if (upHover)  scale(1.25);
        imageMode(CENTER);
        image(assets.backImg, 0, 0, arrowSz, arrowSz);
        noTint();
        pop();

        push();
        textFont(fonts.title);
        textSize(20);
        textAlign(CENTER, CENTER);
        stroke(0, 0, 0, 150); strokeWeight(3); fill(255, 215, 0);
        text("DAY " + this.selectedDay, arrowX, centerY);
        noStroke(); fill(255, 215, 0);
        text("DAY " + this.selectedDay, arrowX, centerY);
        pop();

        let canGoDown  = this.selectedDay < this.totalDays;
        let downHover  = canGoDown && dist(mouseX, mouseY, arrowX, centerY + arrowGap) < 35;
        push();
        translate(arrowX, centerY + arrowGap);
        rotate(-HALF_PI);
        if (!canGoDown) tint(255, 60);
        if (downHover)  scale(1.25);
        imageMode(CENTER);
        image(assets.backImg, 0, 0, arrowSz, arrowSz);
        noTint();
        pop();
    }

    // AI-assisted: staggered gravity drop-in with exponential rotation decay (×0.88/frame).
    _updateDropPhysics() {
        const cardGravity = 6.0;  // sped up vs cloud for snappier sidebar feel
        const cloudGravity = 4.5; // original first-version value, kept for feel

        for (let i = 0; i < this.totalDays; i++) {
            let drop = this._drops[i];
            if (drop.landed) continue;

            if (this.entryTimer < drop.delay) continue;

            let diff = i - this.currentIndex;
            let targetY = diff * this.verticalSpacing;

            drop.vy += cardGravity;
            drop.y += drop.vy;
            drop.rotation *= 0.88;

            if (drop.y >= targetY) {
                drop.y = targetY;
                drop.vy = 0;
                drop.landed = true;
                drop.rotation = 0;
            }
        }

        let cloud = this._cloudDrop;
        if (!cloud.landed) {
            if (this.entryTimer >= cloud.delay) {
                cloud.vy += cloudGravity;
                cloud.y += cloud.vy;
                cloud.rotation *= 0.88;

                if (cloud.y >= 0) {
                    cloud.y = 0;
                    cloud.vy = 0;
                    cloud.landed = true;
                    cloud.rotation = 0;
                }
            }
        }
    }

    // bgAlpha lerps 0→255 when dayVisuallyUnlocked flips true, fading in the colorful background.
    drawDynamicBackground() {
        let isLocked = (this.selectedDay > currentUnlockedDay) && !DEBUG_UNLOCK_ALL;
        // Every newly-unlocked day stays visually locked until the player clicks once
        if (!developerMode && !DEBUG_UNLOCK_ALL &&
            typeof tutorialHints !== 'undefined' &&
            !tutorialHints.dayVisuallyUnlocked[this.selectedDay]) {

            isLocked = true;
        }

        let targetAlpha = isLocked ? 0 : 255;
        this.bgAlpha = lerp(this.bgAlpha, targetAlpha, 0.07);

        imageMode(CORNER);
        if (assets.selectBg.lock)   image(assets.selectBg.lock,   0, 0, width, height);
        if (assets.selectBg.unlock) {
            push();
            tint(255, this.bgAlpha);
            image(assets.selectBg.unlock, 0, 0, width, height);
            pop();
        }

        // Darken overlay
        noStroke();
        fill(0, 0, 0, 100);
        rect(0, 0, width, height);
    }

    renderCloudPreview(x, y) {
        let dayID = this.selectedDay;
        let isLocked = (dayID > currentUnlockedDay) && !DEBUG_UNLOCK_ALL;
        let cloudImg = assets.selectClouds[0];  // Always use Cloud-1

        if (!cloudImg) return;

        push();
        translate(x, y);

        if (!this.isEntering || this._cloudDrop.landed) {
            let floatY = sin(frameCount * 0.04) * 15;
            let floatX = cos(frameCount * 0.03) * 10;
            translate(floatX, floatY);
        }

        let cloudY = 0;
        if (this.isEntering && !this._cloudDrop.landed) {
            cloudY = this._cloudDrop.y;
            rotate(radians(this._cloudDrop.rotation));
        }

        translate(0, cloudY);

        let cloudW = 700, cloudH = 450;
        let isCloudHover = (mouseX > x - cloudW / 2 && mouseX < x + cloudW / 2 &&
            mouseY > y - cloudH / 2 && mouseY < y + cloudH / 2);

        let visuallyLocked = isLocked ||
            (!developerMode && !DEBUG_UNLOCK_ALL &&
             typeof tutorialHints !== 'undefined' &&
             !tutorialHints.dayVisuallyUnlocked[dayID]);


        let targetScale;
        if (this._isBreathing) {
            // breatheTimer 35→25: static gray pause; 25→0: scale-up pop signals unlock
            targetScale = (this._breatheTimer > 25) ? 1.0 : 1.15;
        } else {
            targetScale = (isCloudHover && !visuallyLocked && !this.isEntering) ? 1.08 : 1.0;
        }
        this._cloudScale = lerp(this._cloudScale, targetScale, 0.1);
        scale(this._cloudScale);

        imageMode(CENTER);

        if (visuallyLocked) {
            drawingContext.filter = 'grayscale(100%) brightness(0.6)';
        }

        if (!visuallyLocked) {
            drawingContext.shadowBlur = 40;
            drawingContext.shadowColor = 'rgba(255, 105, 180, 0.6)';
        }

        image(cloudImg, 0, 0, cloudW, cloudH);

        drawingContext.shadowBlur = 0;
        drawingContext.filter = 'none';

        // Warning icon only after colorization, so it doesn't show during the gray breathe phase.
        if (!visuallyLocked && dayID === this.selectedDay &&
            typeof assets !== 'undefined' && assets.warningImg) {
            let warnX = cloudW / 2 - 80;
            let warnY = -cloudH / 2 + 55;
            drawWarningIcon(warnX, warnY, 100);
        }

        this.drawMissionTitle(dayID);

        pop();
    }

    drawNavNode(i) {
        let diff = i - this.currentIndex;
        let distFromCenter = abs(diff);

        let x = distFromCenter * 40;
        let y = diff * this.verticalSpacing;

        if (this.isEntering && !this._drops[i].landed) {
            y = this._drops[i].y;
        }

        push();
        translate(x, y);
        rotate(radians(-12));

        if (this.isEntering && !this._drops[i].landed) {
            rotate(radians(this._drops[i].rotation));
        }

        let isSelected = (i === this.selectedDay - 1);
        let dayID = i + 1;
        let isLocked = (dayID > currentUnlockedDay) && !DEBUG_UNLOCK_ALL;

        let alpha = map(distFromCenter, 0, 2, 255, 50);
        let s = map(distFromCenter, 0, 1, 1.2, 0.8);
        scale(constrain(s, 0.5, 1.5));

        noStroke();
        if (isLocked) {
            fill(30, 30, 45, alpha * 0.7);
        } else {
            fill(isSelected ? [255, 20, 147, alpha] : [70, 20, 90, alpha * 0.6]);
        }

        beginShape();
        vertex(-140, -40); vertex(160, -55);
        vertex(140, 40); vertex(-160, 55);
        endShape(CLOSE);

        textAlign(LEFT, CENTER);
        textFont(fonts.title);
        textSize(48);  // Fixed size for all
        fill(isSelected ? color(255, 215, 0, alpha) : color(255, alpha));  // Gold when selected
        text((i + 1).toString().padStart(2, '0'), -120, 5);

        textFont(fonts.body);
        textSize(22);  // Fixed size for all
        fill(isSelected ? color(255, 215, 0, alpha) : color(255, 215, 0, alpha * 0.8));  // Slightly dimmed when not selected
        text(this.dayNames[i], -20, 10);

        if (isLocked) {
            fill(180, 60, 60, alpha);
            textSize(14);
            text("LOCKED", -20, -20);
        }

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

    drawMissionTitle(dayID) {
        push();
        translate(-220, 80);  // Left-center, slightly lower than before
        rotate(radians(-5));
        textFont(fonts.title);
        textAlign(LEFT, CENTER);

        strokeWeight(8);
        stroke(0, 0, 0, 180);
        fill(255);
        textSize(70);
        text("DAY", 0, 0);

        noStroke();
        fill(255);
        text("DAY", 0, 0);

        strokeWeight(8);
        stroke(0, 0, 0, 180);
        fill(255, 105, 180);
        text(dayID.toString().padStart(2, '0'), 200, 0);  // Increased spacing from 170 to 200

        noStroke();
        fill(255, 105, 180);
        text(dayID.toString().padStart(2, '0'), 200, 0);

        pop();
    }

    handleInput(keyCode) {
        if (this.isEntering) return;

        if ((keyCode === UP_ARROW || keyCode === 87) && this.selectedDay > 1) {
            let newDay = this.selectedDay - 1;
            if (typeof tutorialHints !== 'undefined' && !tutorialHints.dayVisuallyUnlocked[newDay]) {
                this.bgAlpha = 0;
            }
            this.selectedDay--;
            this.targetIndex--;
            if (typeof playSFX === 'function') playSFX(sfxSelect);
        } else if ((keyCode === DOWN_ARROW || keyCode === 83) && this.selectedDay < this.totalDays) {
            let newDay = this.selectedDay + 1;
            if (typeof tutorialHints !== 'undefined' && !tutorialHints.dayVisuallyUnlocked[newDay]) {
                this.bgAlpha = 0;
            }
            this.selectedDay++;
            this.targetIndex++;
            if (typeof playSFX === 'function') playSFX(sfxSelect);
        }
    }
}



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

        textFont(fonts.body);
        textSize(32);
        textAlign(CENTER, CENTER);
        stroke(0, 0, 0, 200);
        strokeWeight(5);
        fill(255, 215, 0);
        text(this.label, this.x, this.y - 65);
        noStroke();
        fill(255, 215, 0);
        text(this.label, this.x, this.y - 65);

        let leftX   = this.x - this.w / 2;
        let rightX  = this.x + this.w / 2;
        let sliderX = map(this.value, this.minVal, this.maxVal, leftX, rightX);
        const pointerX = (typeof uiMouseX === 'function') ? uiMouseX() : mouseX;
        const pointerY = (typeof uiMouseY === 'function') ? uiMouseY() : mouseY;
        const isHoveringKnob = dist(pointerX, pointerY, sliderX, this.y) < 30;

        stroke(255, 255, 255, 60);
        strokeWeight(10);
        line(leftX, this.y, rightX, this.y);

        stroke(160, 90, 255, 220);
        strokeWeight(10);
        line(leftX, this.y, sliderX, this.y);

        push();
        translate(sliderX, this.y);
        if (this.isDragging) scale(1.3);
        else if (isHoveringKnob) scale(1.15);
        noStroke();
        fill(255, 215, 0);
        rect(0, 0, this.knobSize, this.knobSize + 10, 5);
        pop();

        textFont(fonts.time);
        textAlign(CENTER, CENTER);
        stroke(0, 0, 0, 160);
        strokeWeight(3);
        fill(255, 215, 0);
        textSize(30);
        text(floor(this.value * 100) + "%", sliderX, this.y + 50);
        noStroke();
        fill(255, 215, 0);
        text(floor(this.value * 100) + "%", sliderX, this.y + 50);
        pop();

        this.update();
    }

    update() {
        if (this.isDragging) {
            const pointerX = (typeof _pointerLogicalX === 'number') ? _pointerLogicalX : mouseX;
            this._setValueFromMouse(pointerX);
            if (typeof BGM !== 'undefined') BGM.syncVolume();
        }
    }

    _setValueFromMouse(mx) {
        let mousePos = constrain(mx, this.x - this.w / 2, this.x + this.w / 2);
        this.value = map(mousePos, this.x - this.w / 2, this.x + this.w / 2, this.minVal, this.maxVal);
    }

    handlePress(mx, my) {
        const leftX = this.x - this.w / 2;
        const rightX = this.x + this.w / 2;
        let sliderX = map(this.value, this.minVal, this.maxVal, this.x - this.w / 2, this.x + this.w / 2);
        const onKnob = dist(mx, my, sliderX, this.y) < 30;
        const onTrack = mx >= leftX - 20 && mx <= rightX + 20 && abs(my - this.y) < 26;

        if (onKnob || onTrack) {
            this.isDragging = true;
            this._setValueFromMouse(mx);
        }
    }

    handleRelease() {
        this.isDragging = false;
    }
}
