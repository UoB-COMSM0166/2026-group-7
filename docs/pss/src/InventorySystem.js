class InventorySystem {

    constructor() {
        this.items = [
            { name: "UoB Student ID",      description: "I literally can't get into anything without this." },
            { name: "Laptop Computer",     description: "Everything's on here. Can't show up without it."  },
            { name: "Soft Gummy Vitamins", description: "The gummies from Wiola seem to be increasing my health.\nPress E — restores health to full." },
            { name: "Tangle",              description: "Tangle will help me focus.\nPress E once to arm — then auto-blocks every Fantasy Coffee." },
            { name: "Headphones",          description: "Promoters won't distract me if I'm not listening.\nPress E to arm — skips the next Promoter." },
            { name: "Rain Boots",          description: "Best way to get through the rain and puddles.\nPress E to arm — sidesteps the next puddle trap." }
        ];
        this.maxSlots  = 5;
        this.isVisible = false;
    }

    /** @returns {boolean} true if added, false if full. */
    addItem(itemData) {
        if (this.items.length < this.maxSlots) {
            this.items.push(itemData);
            return true;
        }
        return false;
    }

    display() {
        push();
        fill(0, 0, 0, 220);
        rectMode(CORNER);
        rect(0, 0, width, height);

        textAlign(CENTER, CENTER);
        fill(255, 215, 0);
        textSize(60);
        textStyle(BOLD);
        text("BACKPACK", width / 2, 150);

        this.drawSlots();

        fill(200);
        textSize(20);
        text("Press 'B' to Return to Room", width / 2, height - 100);
        pop();
    }

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

    handleKeyPress(keyCode) {
    }
}
