// Precision 2-2-2 Road System
// Responsibilities: Implementation of exact layout coordinates and smooth scrolling.

class Environment {
    /**
     * CONSTRUCTOR: INITIALIZATION
     * Establishes the spatial layout, coordinate boundaries, and the visual color palette.
     */
    constructor() {
        // Normalized scroll position to prevent floating-point jitter
        this.scrollPos = 0;
        
        // [STRICT LAYOUT CONFIGURATION]
        // Symmetry: 500 (Scenery) | 200 (Sidewalk) | 260 (Lane) | 260 (Lane) | 200 (Sidewalk) | 500 (Scenery)
        this.layout = {
            sceneryW: 500,
            sidewalkW: 200,
            laneW: 260,
            roadStart: 700, // Calculated as 500 + 200
            roadEnd: 1220   // Calculated as 700 + (260 * 2)
        };

        // Flat Visual Palette (No Glow for consistent pixel aesthetic)
        this.colors = {
            scenery: color(40, 70, 40),    // Deep Grass Green
            sidewalk: color(160, 160, 165), // Concrete Grey
            road: color(45, 45, 50),       // Asphalt Dark Grey
            marking: color(255)            // Pure White
        };
    }

    /**
     * LOGIC: MOVEMENT CALCULATION
     * Synchronizes the background scroll position with the global game speed and manages the dash loop.
     */
    update(speed) {
        this.scrollPos += speed;
        
        // Loop the position based on dash + gap length (60 + 60 = 120) to maintain continuity
        if (this.scrollPos > 120) {
            this.scrollPos -= 120;
        }
    }

    /**
     * RENDERING: WORLD DISPLAY
     * Primary render pass that draws the scenery, sidewalks, and the asphalt road layer.
     */
    display() {
        noStroke();
        rectMode(CORNER);

        // 1. LAYER: SCENERY (The outer "2" zones - 500px each)
        fill(this.colors.scenery);
        rect(0, 0, this.layout.sceneryW, height); 
        rect(1420, 0, this.layout.sceneryW, height);

        // 2. LAYER: SIDEWALKS (The middle "2" zones - 200px each)
        fill(this.colors.sidewalk);
        rect(500, 0, this.layout.sidewalkW, height); 
        rect(1220, 0, this.layout.sidewalkW, height);

        // 3. LAYER: ROAD (The inner "2" zones - 260px lanes, 520px total)
        fill(this.colors.road);
        rect(this.layout.roadStart, 0, this.layout.laneW * 2, height);

        // 4. LAYER: CENTER LINE DIVIDER
        this.drawCenterLine();
    }

    /**
     * GEOMETRY: CENTER LINE RENDERING
     * Calculates and draws the animated road markings exactly at the canvas center (X=960).
     */
    drawCenterLine() {
        push();
        stroke(this.colors.marking);
        strokeWeight(6); 
        
        let centerX = 960; // Exact center of the 1920px canvas configuration
        let segment = 120; // Represents Dash (60) + Gap (60)

        // Iterate through the Y-axis using the scroll offset to create motion
        for (let y = this.scrollPos - segment; y < height; y += segment) {
            line(centerX, y, centerX, y + 60);
        }
        pop();
    }
}