// Park Street Survivor - Inventory System
// Responsibilities: Item storage management and the basic backpack overlay UI.

class InventorySystem {

    // ─── INITIALISATION ──────────────────────────────────────────────────────

    /**
     * Establishes core storage parameters and default item list.
     * Item definitions and effects are authored by the Level Designer.
     */
    constructor() {
        this.items = [
            { name: "UoB Student ID",      description: "必需品"           },
            { name: "Laptop Computer",     description: "必需品"           },
            { name: "Soft Gummy Vitamins", description: "补充体力"          },
            { name: "Tangle Coffee",       description: "识别幻想咖啡"       },
            { name: "Headphones",          description: "忽略2个promoter"  },
            { name: "Rain Boots",          description: "抵消三次水坑"       }
        ];
        this.maxSlots  = 5;
        this.isVisible = false;
    }

    // ─── ITEM MANAGEMENT ─────────────────────────────────────────────────────

    /**
     * Adds an item to the inventory if capacity allows.
     * Called by ObstacleManager on a successful pickup collision.
     * @returns {boolean} True if the item was added; false if the inventory is full.
     */
    addItem(itemData) {
        if (this.items.length < this.maxSlots) {
            this.items.push(itemData);
            console.log(`[Inventory] Item Added: ${itemData.name}`);
            return true;
        }
        console.log("[Inventory] Backpack full.");
        return false;
    }

    // ─── RENDERING ───────────────────────────────────────────────────────────

    /**
     * Renders the full-screen backpack overlay.
     * Called when GameState is set to STATE_INVENTORY.
     */
    display() {
        push();
        // Dark translucent background
        fill(0, 0, 0, 220);
        rectMode(CORNER);
        rect(0, 0, width, height);

        // Title
        textAlign(CENTER, CENTER);
        fill(255, 215, 0);
        textSize(60);
        textStyle(BOLD);
        text("BACKPACK", width / 2, 150);

        this.drawSlots();

        // Exit prompt
        fill(200);
        textSize(20);
        text("Press 'B' to Return to Room", width / 2, height - 100);
        pop();
    }

    /**
     * Calculates slot positions and renders each slot container with its item label.
     */
    drawSlots() {
        let slotSize = 120;
        let spacing  = 20;
        let startX   = width / 2 - (this.maxSlots * (slotSize + spacing)) / 2;

        for (let i = 0; i < this.maxSlots; i++) {
            let x = startX + i * (slotSize + spacing);
            let y = height / 2;

            stroke(255, 215, 0);
            strokeWeight(2);
            fill(30);
            rectMode(CENTER);
            rect(x, y, slotSize, slotSize, 10);

            if (this.items[i]) {
                noStroke();
                fill(255);
                textAlign(CENTER, CENTER);
                textSize(14);
                text(this.items[i].name, x, y);
            }
        }
    }

    // ─── INPUT HANDLING ──────────────────────────────────────────────────────

    /**
     * Reserved for item-use interactions (to be implemented by the Gameplay Designer).
     */
    handleKeyPress(keyCode) {
        // Hook: define item-specific effects here
    }
}
