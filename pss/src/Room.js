// Starting Bedroom Scene
// Responsibilities: Implementation of spatial anchors, proximity detection, and scene transition triggers.

class RoomScene {
    /**
     * CONSTRUCTOR: SPATIAL INITIALIZATION
     * Defines the coordinate system for interactive boundaries and environmental assets.
     */
    constructor() {
        // [Spatial Anchors]
        // Primary exit point positioned at the top-center to align with forward progression.
        this.doorX = width / 2;
        this.doorY = 50;
        this.doorW = 200;
        this.doorH = 30;

        // Interaction Logic Flag: Determines UI prompt visibility and transition eligibility.
        this.isPlayerNearDoor = false;
    }

    /**
     * SESSION RESET: CONTEXT INITIALIZATION
     * Executed upon player reentry to the room to clear previous interaction states.
     */
    reset() {
        console.log("[RoomScene] Context Reset: Bedroom state synchronized.");
        this.isPlayerNearDoor = false;
    }

    /**
     * MAIN RENDERING LOOP: SCENE VIEWPORT
     * Primary execution block responsible for environmental rendering and proximity logic.
     */
    display() {
        // 1. Foundation: High-contrast background for clear entity visibility.
        background(45, 35, 25);

        // 2. Proximity Detection: Evaluates spatial relationship between player and triggers.
        this.checkInteraction();

        // 3. Environmental Rendering: Delegates geometry drawing to the sub-renderer.
        this.drawEnvironment();
    }

    /**
     * GEOMETRY: ENVIRONMENTAL ASSET LAYOUT
     * Manages the rendering of static scenery and interactive UI prompts.
     */
    drawEnvironment() {
        push();
        rectMode(CENTER);
        noStroke();

        // --- LAYER A: THE BED (Spawn Reference) ---
        // Visual representation of the narrative starting point.
        fill(70, 70, 140);
        rect(300, height / 2, 160, 280, 10); // Main Frame
        fill(240);
        rect(300, height / 2 - 100, 140, 60, 5); // Pillow (Flat Aesthetic)

        // --- LAYER B: THE DESK (Interactivity Placeholder) ---
        // Defined as a future hook for narrative exploration.
        fill(90, 55, 30);
        rect(width - 300, height / 2, 140, 220, 5); // Desk Surface
        fill(20);
        rect(width - 300, height / 2, 110, 80); // Terminal Placeholder

        // --- LAYER C: THE EXIT PORTAL (State Trigger) ---
        // Dynamic styling: Highlight is applied when interaction criteria are met.
        if (this.isPlayerNearDoor) {
            stroke(255, 215, 0); // Gold-standard highlight for active triggers
            strokeWeight(5);
        } else {
            fill(20);
            noStroke();
        }
        rect(this.doorX, this.doorY, this.doorW, this.doorH);

        // --- LAYER D: UI/UX INTERACTION PROMPT ---
        // Context-sensitive instruction for the player.
        if (this.isPlayerNearDoor) {
            noStroke();
            fill(255, 215, 0);
            textAlign(CENTER);
            textSize(28);
            textStyle(BOLD);
            text("PRESS ENTER TO LEAVE", width / 2, 130);
        }
        pop();
    }

    /**
     * LOGIC: PROXIMITY SENSING
     * Calculates the Euclidean distance between the player entity and the door anchor.
     */
    checkInteraction() {
        if (typeof player !== 'undefined') {
            let distance = dist(player.x, player.y, this.doorX, this.doorY);

            // Interaction Threshold: Set to 150 pixels for responsive triggering.
            this.isPlayerNearDoor = (distance < 150);
        }
    }

    /**
     * INPUT HANDLING: STATE TRANSITION
     * Manages the hand-off between the Room scene and the Day Run parkour engine.
     */
    handleKeyPress(keyCode) {
        // Transition Logic: Validates proximity before switching global state.
        if (this.isPlayerNearDoor && (keyCode === ENTER || keyCode === 13)) {
            console.log("[RoomScene] State Transition: Initializing Day Run.");

            // Entity Positioning: Realigns player for the running phase layout.
            player.x = width / 2;
            player.y = height - 200;

            // Initialize the level controller for the current day
            if (levelController) levelController.initializeLevel(currentDayID);

            // FSM Update: Commits the state change to the global manager.
            gameState.setState(STATE_DAY_RUN);
        }
    }
}