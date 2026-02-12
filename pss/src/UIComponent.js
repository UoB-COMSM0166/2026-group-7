// Reusable UI Components
// Responsibility: Interactive elements for menus and selection screens.

class UIButton {
    constructor(x, y, w, h, label, onClick) {
        this.x = x; this.y = y;
        this.w = w; this.h = h;
        this.label = label;
        this.onClick = onClick;
        
        // NEW: Animation & Focus state (Fixes the 'update is not a function' error)
        this.currentScale = 1.0;
        this.targetScale = 1.0;
        this.isFocused = false; 
    }

    /**
     * LOGIC: ANIMATION UPDATE
     * Smoothly interpolates scale based on focus state.
     */
    update() {
        // Linear Interpolation for smooth scaling
        this.targetScale = this.isFocused ? 1.15 : 1.0;
        this.currentScale = lerp(this.currentScale, this.targetScale, 0.15);
    }

    display() {
        push();
        translate(this.x, this.y); // Move to button center
        scale(this.currentScale);
        
        rectMode(CENTER);
        textAlign(CENTER, CENTER);
        textFont(fonts.body); 

        // Visual feedback based on focus/hover state
        if (this.isFocused) {
            fill(255, 215, 0); // Gold highlight
            stroke(255);
            strokeWeight(4);
            cursor(HAND);
        } else {
            fill(0, 0, 0, 180); 
            stroke(255, 215, 0);
            strokeWeight(2);
            // cursor(ARROW); // Avoid flickering in loop
        }

        // Draw the button body (centered at 0,0 due to translate)
        rect(0, 0, this.w, this.h, 10);

        // Text rendering
        noStroke();
        fill(this.isFocused ? 0 : 255);
        textSize(24);
        text(this.label, 0, 0);
        pop();
    }

    /**
     * INPUT: BOUNDS CHECK
     * Used by MainMenu to sync mouse position with selection index.
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

class TimeWheel {
    constructor(config) {
        this.config = config;
        this.selectedDay = 1;
        this.totalDays = Object.keys(config).length;
        this.targetIndex = 0;
        this.currentIndex = 0;
        
        // Arc layout parameters
        this.radius = 1200;      
        this.angleSpacing = 0.25; 
        this.dayNames = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
    }

    display() {
        // Smooth interpolation for rotation
        this.currentIndex = lerp(this.currentIndex, this.targetIndex, 0.12);
        
        let cx = width / 2;
        let cy = height * 1.5; 

        // Render background guide arc
        this.drawBackgroundArc(cx, cy);

        // Render day items along the arc
        for (let i = 0; i < this.totalDays; i++) {
            let diff = i - this.currentIndex;
            let angle = diff * this.angleSpacing;

            // Calculate item position on circle circumference
            let x = cx + sin(angle) * this.radius;
            let y = cy - cos(angle) * this.radius;

            // Visual dynamic scaling and transparency
            let distFromCenter = Math.abs(diff);
            let scaleFactor = map(distFromCenter, 0, 1.2, 1.5, 0.6); 
            let alpha = map(distFromCenter, 0, 1.5, 255, 0);         
            
            if (alpha > 0) {
                this.drawTextItem(x, y, i + 1, angle, scaleFactor, alpha);
            }
        }
    }

    drawBackgroundArc(cx, cy) {
        push();
        noFill();
        stroke(255, 30); 
        strokeWeight(1);
        ellipse(cx, cy, this.radius * 2, this.radius * 2);
        pop();
    }

    drawTextItem(x, y, dayID, angle, s, a) {
        push();
        translate(x, y);
        rotate(angle); 
        scale(constrain(s, 0.5, 2.0));
        textAlign(CENTER, CENTER);

        let isSelected = (dayID === this.selectedDay);
        
        // Render Weekday Name - Using DotGothic16
        textFont(fonts.body);
        fill(isSelected ? 255 : 180, a);
        textSize(40);
        text(this.dayNames[dayID - 1], 0, 0);

        // Render Day ID Label - Using VT323
        if (isSelected) {
            textFont(fonts.time);
            fill(255, 215, 0, a); 
            textSize(24);
            text(`DAY ${dayID}`, 0, -55);
        }
        
        pop();
    }

    handleInput(keyCode) {
        // Navigation input mapping
        if ((keyCode === LEFT_ARROW || keyCode === 65) && this.selectedDay > 1) {
            this.selectedDay--;
            this.targetIndex--;
        } else if ((keyCode === RIGHT_ARROW || keyCode === 68) && this.selectedDay < this.totalDays) {
            this.selectedDay++;
            this.targetIndex++;
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
        
        this.knobSize = 24; // Larger knob for "cute" feel
        this.isDragging = false;
    }

    display() {
        push();
        rectMode(CENTER);
        textAlign(LEFT, CENTER);
        
        // Label rendering - Using DotGothic16
        textFont(fonts.body);
        fill(255);
        textSize(24);
        text(this.label, this.x - this.w / 2, this.y - 40);

        // Track (The bar)
        stroke(255, 100);
        strokeWeight(6);
        line(this.x - this.w / 2, this.y, this.x + this.w / 2, this.y);

        // Knob position calculation
        let sliderX = map(this.value, this.minVal, this.maxVal, this.x - this.w / 2, this.x + this.w / 2);

        // Knob rendering - Pink/Gold mix for cute vibe
        noStroke();
        fill(this.isDragging ? color(255, 150, 200) : 255); 
        rect(sliderX, this.y, this.knobSize, this.knobSize + 10, 5);
        
        // Value percentage - Using VT323
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
            
            // Apply volume if bgm exists
            if (typeof bgm !== 'undefined' && bgm) {
                bgm.setVolume(this.value);
            }
        }
    }

    handlePress(mx, my) {
        let sliderX = map(this.value, this.minVal, this.maxVal, this.x - this.w / 2, this.x + this.w / 2);
        // Interaction area detection
        if (dist(mx, my, sliderX, this.y) < 30) {
            this.isDragging = true;
        }
    }

    handleRelease() {
        this.isDragging = false;
    }
}