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

        // Background Images
        this.defaultBg = null;      // Default running background
        this.destinationBg = null;  // Victory zone background

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

        // Victory Zone Colors (Different visual appearance)
        this.victoryColors = {
            scenery: color(100, 120, 80),   // Lighter greenish
            sidewalk: color(200, 200, 200), // Lighter grey
            road: color(80, 80, 100),       // Darker blue-ish asphalt
            marking: color(255, 200, 0)     // Gold markings
        };
    }

    /**
     * ASSET LOADING: BACKGROUND IMAGES
     * Loads the default running background and victory destination background.
     */
    loadBackgrounds() {
        // These should be preloaded in sketch.js preload()
        // For now, we'll use fallback rendering if images aren't available
        console.log("[Environment] Background assets ready for rendering");
    }

    /**
     * LOGIC: MOVEMENT CALCULATION
     * Synchronizes the background scroll position with the global game speed.
     * Loops every 1080 pixels (one full background height) for seamless scrolling.
     */
    update(speed) {
        // Always update scroll position
        this.scrollPos += speed;

        // Loop the position based on background height (1080px) to maintain seamless continuity
        const bgHeight = 1080;
        const levelPhase = levelController ? levelController.getLevelPhase() : "RUNNING";

        // Only loop the scrollPos if we're still in RUNNING phase
        if (levelPhase === "RUNNING" && this.scrollPos > bgHeight) {
            this.scrollPos -= bgHeight;
        }
    }

    /**
     * RENDERING: WORLD DISPLAY
     * Primary render pass that draws background images based on level phase.
     * - RUNNING: Display default background with scrolling
     * - VICTORY_TRANSITION: Transition from default to victory background
     * - VICTORY_ZONE: Display static victory background
     */
    display() {
        // Get current level phase
        const levelPhase = levelController ? levelController.getLevelPhase() : "RUNNING";
        const defaultBg = this.defaultBg;
        const destinationBg = this.destinationBg;

        imageMode(CORNER);

        if (levelPhase === "RUNNING") {
            // RUNNING: Display scrolling default background
            if (defaultBg) {
                const bgHeight = 1080;
                const scrollY = this.scrollPos % bgHeight;

                // Seamless scrolling with two tiles
                image(defaultBg, 0, scrollY);
                image(defaultBg, 0, scrollY - bgHeight);
            }
        }
        else if (levelPhase === "VICTORY_TRANSITION") {
            // VICTORY_TRANSITION: Default continues scrolling, victory enters from top

            const bgHeight = 1080;
            const scrollY = this.scrollPos % bgHeight;

            if (defaultBg) {
                // Continue scrolling the default background normally
                image(defaultBg, 0, scrollY);
                image(defaultBg, 0, scrollY - bgHeight);
            }

            if (destinationBg) {
                // Victory background enters based on how much we've scrolled since victory
                const scrolledSinceVictory = this.scrollPos - levelController.victoryStartScrollPos;

                if (scrolledSinceVictory >= 0) {
                    // Victory background position: enters from bottom as we scroll
                    const victoryEntryY = scrolledSinceVictory - bgHeight;

                    // Only display single tile
                    image(destinationBg, 0, victoryEntryY);
                }
            }
        }
        else if (levelPhase === "VICTORY_ZONE") {
            // VICTORY_ZONE: Display static victory background at frozen position
            if (destinationBg) {
                // Use the Y position recorded when entering VICTORY_ZONE
                const bgHeight = 1080;
                const victoryY = levelController.victoryZoneStartY;

                // Display with potential tile for seamless appearance
                image(destinationBg, 0, victoryY);
                // Draw second tile if needed for full coverage
                if (victoryY < 0) {
                    image(destinationBg, 0, victoryY + bgHeight);
                }
            }
        }
        else {
            // FALLBACK: Render colored rectangles if images aren't loaded
            console.warn("[Environment] Background images not loaded, using fallback colors");
            noStroke();
            rectMode(CORNER);

            const colors = (levelPhase === "RUNNING") ? this.colors : this.victoryColors;

            // 1. LAYER: SCENERY (The outer "2" zones - 500px each)
            fill(colors.scenery);
            rect(0, 0, this.layout.sceneryW, height);
            rect(1420, 0, this.layout.sceneryW, height);

            // 2. LAYER: SIDEWALKS (The middle "2" zones - 200px each)
            fill(colors.sidewalk);
            rect(500, 0, this.layout.sidewalkW, height);
            rect(1220, 0, this.layout.sidewalkW, height);

            // 3. LAYER: ROAD (The inner "2" zones - 260px lanes, 520px total)
            fill(colors.road);
            rect(this.layout.roadStart, 0, this.layout.laneW * 2, height);

            // 4. LAYER: CENTER LINE DIVIDER
            this.drawCenterLine(colors);
        }
    }

    /**
     * GEOMETRY: CENTER LINE RENDERING
     * Calculates and draws the animated road markings exactly at the canvas center (X=960).
     */
    drawCenterLine(colors = this.colors) {
        push();
        stroke(colors.marking);
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