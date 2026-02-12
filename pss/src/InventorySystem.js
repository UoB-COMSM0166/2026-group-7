// Inventory & Item Persistence
// Responsibilities: Management of item acquisition logic and the visual backpack interface.

class InventorySystem {
    /**
     * CONSTRUCTOR: DATA & UI INITIALIZATION
     * Establishes core storage parameters and UI visibility flags.
     */
    constructor() {
        // Core storage for items collected during the Day Run
        // Note: Item definitions (types/effects) are provided by the Level Designer
        this.items = [];
        this.maxSlots = 5;
        
        // UI Visuals: Flat design aesthetic (no glow)
        this.isVisible = false;
    }

    /**
     * LOGIC: ITEM ACQUISITION
     * Interface triggered by the ObstacleManager upon successful collision with a "pickup" entity.
     * Handles capacity checks and array insertion.
     */
    addItem(itemData) {
        // Capacity check: Ensure the inventory has not exceeded the maximum allocated slots
        if (this.items.length < this.maxSlots) {
            this.items.push(itemData);
            console.log(`[Inventory] Item Added: ${itemData.name}`);
            return true;
        }
        
        // Overflow management: Prevents acquisition when slots are exhausted
        console.log("[Inventory] Backpack full.");
        return false;
    }

    /**
     * RENDERING: BACKPACK OVERLAY
     * Primary rendering loop for the inventory screen.
     * Execution logic: Called when GameState is set to the inventory/backpack view.
     */
    display() {
        push();
        // Visual Layer: Dark translucent overlay for scene depth
        fill(0, 0, 0, 220);
        rectMode(CORNER);
        rect(0, 0, width, height);

        // Header Section: Centralized title display
        textAlign(CENTER, CENTER);
        fill(255, 215, 0); // Gold-accented theme for high-value UI elements
        textSize(60);
        textStyle(BOLD);
        text("BACKPACK", width / 2, 150);

        // Grid System: Renders the interactive item slots
        this.drawSlots();
        
        // Navigation Prompt: User instruction for state transition
        fill(200);
        textSize(20);
        text("Press 'B' to Return to Room", width / 2, height - 100);
        pop();
    }

    /**
     * GEOMETRY: SLOT GRID CALCULATION
     * Calculates dynamic positioning for the slot array and handles individual slot rendering.
     */
    drawSlots() {
        let slotSize = 120;
        let spacing = 20;
        let startX = width / 2 - (this.maxSlots * (slotSize + spacing)) / 2;
        
        // Iterate through designated slot count to draw UI containers
        for (let i = 0; i < this.maxSlots; i++) {
            let x = startX + i * (slotSize + spacing);
            let y = height / 2;

            // Render Slot Background: Flat styling consistent with the game's aesthetic
            stroke(255, 215, 0);
            strokeWeight(2);
            fill(30);
            rectMode(CENTER);
            rect(x, y, slotSize, slotSize, 10);

            // Asset Mapping: Render item labels/sprites if the slot index is populated
            if (this.items[i]) {
                noStroke();
                fill(255);
                textAlign(CENTER, CENTER);
                textSize(14);
                // Placeholder for sprite rendering; currently utilizes name labels
                text(this.items[i].name, x, y);
            }
        }
    }

    /**
     * INPUT HANDLING: UI INTERACTION
     * Processes input events specifically for item usage or inventory toggling.
     */
    handleKeyPress(keyCode) {
        // Implementation Hook: Reserved for Gameplay Designer to define item-specific effects
    }
}