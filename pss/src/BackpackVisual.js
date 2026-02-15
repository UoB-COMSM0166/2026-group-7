// Park Street Survivor - Backpack Visual
// Responsibilities: Drag-and-drop inventory UI, slot management, tooltips, and item-swap dialogs.

class BackpackVisual {

    // ─── INITIALISATION ──────────────────────────────────────────────────────

    constructor(inventorySystem, roomScene) {
        this.inventory = inventorySystem;
        this.room      = roomScene;

        // Emoji lookup for item icons
        // ── TO ADD / CHANGE AN ITEM ICON: edit the matching entry below ──────
        this.itemEmojis = {
            "UoB Student ID":      "🪪",
            "Laptop Computer":     "💻",
            "Soft Gummy Vitamins": "🍬",
            "Tangle Coffee":       "☕",
            "Headphones":          "🎧",
            "Rain Boots":          "🥾"
        };

        // ── BACKPACK SLOT PANEL (top of screen) ───────────────────────────────
        // ← adjust topBarY to move the panel up/down
        this.topBarX     = width / 2;
        this.topBarY     = 145;     // ← panel centre Y (near top)
        this.topBarW     = 420;     // ← width: side margins ≈ bottom margin
        this.topBarH     = 260;     // ← height: title + label + slots all inside with breathing room
        this.topSlots    = [null, null, null];
        this.slotSize    = 100;
        this.slotSpacing = 18;

        // ── BACKPACK IMAGE (left side of desk) ────────────────────────────────
        // The rendered image is also the drag-drop target zone.
        // ← adjust X / Y to reposition; W / H are set automatically from image ratio.
        this.backpackX = 436;    // ← centre X of the backpack image
        this.backpackY = 520;    // ← centre Y of the backpack image
        this.backpackW = 748;    // ← display width (calibrated from dev mode)

        // Height is derived from the image's natural aspect ratio so the image is not distorted.
        if (assets.backpackImg && assets.backpackImg.width > 0) {
            this.backpackH = this.backpackW * (assets.backpackImg.height / assets.backpackImg.width);
        } else {
            this.backpackH = this.backpackW * 1.2; // fallback ratio until image loads
        }

        this.backpackHighlight = false;

        // ── ITEM ZONE (right side of desk, freely draggable area) ────────────
        // Items are scattered and freely moveable anywhere inside this rectangle.
        // Dropping outside snaps the item back to where it was.
        // ← adjust any of these four values to resize / reposition the zone
        this.itemZone = {
            left:   719,   // ← left edge  X  (calibrated from dev mode)
            right:  1850,  // ← right edge X
            top:    418,   // ← top edge   Y
            bottom: 897    // ← bottom edge Y
        };

        // ── DESK ZONE (visual reference for the physical desk surface) ────────
        // Used only for orientation — does not affect gameplay.
        // ← adjust these values to match where the desk appears in table.png
        this.deskZone = {
            left:   61,
            right:  1851,
            top:    417,
            bottom: 898
        };

        // Items scattered on the desk surface
        this.scatteredItems = [];
        this.initScatteredItems();

        // Drag state (normal gameplay)
        this.draggedItem  = null;
        this.dragSource   = null;
        this.dragIndex    = -1;
        this.dragStartX   = 0;   // original X before drag (for snap-back)
        this.dragStartY   = 0;   // original Y before drag (for snap-back)

        // Hover state
        this.hoveredItem = -1;
        this.hoveredSlot = -1;

        // Replace-item confirmation dialog state
        this.showReplaceDialog = false;
        this.replaceNewItem    = null;
        this.replaceSlotIndex  = -1;

        // Temporary status message
        this.messageText  = "";
        this.messageTimer = 0;

        // Shimmer animation counter for slot decoration
        this.shimmer = 0;

        // ── DEV DRAG STATE ────────────────────────────────────────────────────
        // Tracks interactive manipulation of debug zones and backpack in dev mode.
        this.devDrag = {
            active:   false,
            target:   null,    // 'itemZone' | 'deskZone' | 'backpack'
            handle:   null,    // 'move' | 'nw' | 'ne' | 'sw' | 'se'
            startMX:  0,
            startMY:  0,
            startVal: null     // snapshot of the value being edited
        };
    }

    /**
     * Populates the desk with items available for the current day.
     * Items already in the backpack slots are excluded.
     * ── TO CHANGE STARTING POSITIONS: edit the positions[] array below ───────
     */
    initScatteredItems() {
        this.scatteredItems = [];
        let availableItems = this.getAvailableItemsForDay(currentDayID);
        let z = this.itemZone;

        // ← positions are spaced so that no two items' interaction radii overlap.
        // Student ID (radius 100) → upper-left; Computer (radius 150) → right-centre;
        // emoji items (radius 60) fill the remaining area.
        let positions = [
            { x: z.left + 130, y: z.top  + 100, rot:  -5 },   // 0 Student ID
            { x: z.left + 600, y: z.top  + 200, rot:   3 },   // 1 Computer
            { x: z.left + 200, y: z.top  + 340, rot: -10 },   // 2 emoji
            { x: z.left + 400, y: z.top  + 100, rot:   7 },   // 3 emoji
            { x: z.left + 310, y: z.top  + 360, rot:   4 },   // 4 emoji
            { x: z.left + 450, y: z.top  + 390, rot:  -6 }    // 5 emoji
        ];

        availableItems.forEach((item, i) => {
            if (this.topSlots.includes(item.name)) return;
            let pos = positions[i] || { x: z.left + 200, y: z.top + 200, rot: 0 };
            this.scatteredItems.push({ item: item, x: pos.x, y: pos.y, rotation: pos.rot });
        });
    }

    /**
     * Returns the list of inventory items unlocked on or before the given day.
     */
    getAvailableItemsForDay(day) {
        let items     = [];
        let studentID = this.inventory.items.find(i => i.name === "UoB Student ID");
        let computer  = this.inventory.items.find(i => i.name === "Laptop Computer");
        if (studentID) items.push(studentID);
        if (computer)  items.push(computer);
        if (day >= 2) { let gummy      = this.inventory.items.find(i => i.name === "Soft Gummy Vitamins"); if (gummy)      items.push(gummy);      }
        if (day >= 3) { let coffee     = this.inventory.items.find(i => i.name === "Tangle Coffee");       if (coffee)     items.push(coffee);     }
        if (day >= 4) { let headphones = this.inventory.items.find(i => i.name === "Headphones");          if (headphones) items.push(headphones); }
        if (day >= 5) { let boots      = this.inventory.items.find(i => i.name === "Rain Boots");          if (boots)      items.push(boots);      }
        return items;
    }

    // ─── RENDERING ───────────────────────────────────────────────────────────

    /**
     * Main display entry point — renders all layers in draw order.
     */
    display() {
        this.shimmer = (this.shimmer + 1) % 360;
        push();
        this.drawRoomBackground();
        this.drawBackpack();
        this.drawScatteredItems();
        this.drawTopBar();
        if (this.draggedItem)        this.drawDraggedItem();
        if (this.showReplaceDialog)  this.drawReplaceDialog();
        if (this.messageTimer > 0) {
            this.drawMessage();
            this.messageTimer--;
        }
        this.drawInstructions();
        // Dev overlays are drawn last so they are always on top
        if (developerMode) this.drawDevOverlays();
        pop();
    }

    /**
     * Draws the table background image (or a fallback color if not loaded).
     */
    drawRoomBackground() {
        push();
        imageMode(CORNER);
        if (assets.inventoryBg) {
            image(assets.inventoryBg, 0, 0, width, height);
        } else {
            background(45, 35, 25);
        }
        pop();
    }

    /**
     * Renders the backpack slot panel at the top of the screen.
     * Slots use a dark/light purple color scheme only — no yellow borders.
     * A label line above the slots explains the one-NPC-item rule.
     */
    drawTopBar() {
        push();
        let cx = this.topBarX;
        let cy = this.topBarY;
        let bw = this.topBarW;
        let bh = this.topBarH;
        let pulse = sin(radians(this.shimmer)) * 0.5 + 0.5;  // 0–1 pulsing value

        // ── Panel body ────────────────────────────────────────────────────────
        rectMode(CENTER);
        fill(22, 10, 48, 235);
        stroke(160, 90, 255, 220);
        strokeWeight(2.5);
        rect(cx, cy, bw, bh, 16);

        // ── Thin inner rim ────────────────────────────────────────────────────
        noFill();
        stroke(200, 140, 255, 35 + pulse * 25);
        strokeWeight(1);
        rect(cx, cy, bw - 10, bh - 10, 12);

        // ── Title — inside panel, matches Settings screen style ──────────────
        textAlign(CENTER, CENTER);
        noStroke();
        textFont(fonts.title);
        textSize(28);
        fill(255, 215, 0);
        text("BACKPACK", cx, cy - 78);

        // ── Rule label — body font, yellow, larger ────────────────────────────
        textFont(fonts.body);
        textSize(22);
        fill(255, 215, 0);
        text("Only ONE friend's gift allowed per run", cx, cy - 42);

        // ── Divider line below label ──────────────────────────────────────────
        stroke(150, 80, 230, 80 + pulse * 30);
        strokeWeight(1);
        line(cx - bw / 2 + 30, cy - 20, cx + bw / 2 - 30, cy - 20);

        // ── Slots ─────────────────────────────────────────────────────────────
        let startX = cx - (3 * this.slotSize + 2 * this.slotSpacing) / 2;
        for (let i = 0; i < 3; i++) {
            let sx        = startX + i * (this.slotSize + this.slotSpacing) + this.slotSize / 2;
            let sy        = cy + 45;  // 11px gap below divider, 35px padding at bottom
            let isHovered = (this.hoveredSlot === i);
            let filled    = !!this.topSlots[i];

            // Soft outer glow when hovered
            if (isHovered) {
                noFill();
                stroke(170, 90, 255, 50 + pulse * 30);
                strokeWeight(12);
                rect(sx, sy, this.slotSize, this.slotSize, 14);
                stroke(170, 90, 255, 80 + pulse * 40);
                strokeWeight(5);
                rect(sx, sy, this.slotSize, this.slotSize, 14);
            }

            // Slot background
            rectMode(CENTER);
            fill(filled ? color(42, 12, 75, 230) : color(15, 6, 32, 210));
            stroke(filled
                ? (isHovered ? color(190, 110, 255, 255) : color(130, 65, 210, 220))
                : color(90, 45, 155, 160));
            strokeWeight(filled ? (isHovered ? 2.5 : 2) : 1.5);
            if (!filled) drawingContext.setLineDash([6, 5]);
            rect(sx, sy, this.slotSize, this.slotSize, 14);
            drawingContext.setLineDash([]);

            // Filled: subtle inner rim
            if (filled) {
                noFill();
                stroke(180, 110, 255, 40 + pulse * 20);
                strokeWeight(1);
                rect(sx, sy, this.slotSize - 8, this.slotSize - 8, 11);
            }

            // Content
            if (filled) {
                let itemName = this.topSlots[i];
                let itemImg  = this._getItemImage(itemName);
                if (itemImg) {
                    this._drawImageAspect(itemImg, sx, sy, this.slotSize - 14, this.slotSize - 14);
                } else {
                    let emoji = this.itemEmojis[itemName] || "📦";
                    textSize(46);
                    noStroke();
                    fill(255);
                    textAlign(CENTER, CENTER);
                    text(emoji, sx, sy - 1);
                }
                if (isHovered && !this.draggedItem) {
                    let item = this.findItemByName(itemName);
                    if (item) this.drawSlotTooltip(item, sx, sy);
                }
            } else {
                // Empty placeholder symbol
                textSize(28);
                fill(110, 55, 180, 90 + pulse * 30);
                noStroke();
                textAlign(CENTER, CENTER);
                text("◇", sx, sy + 1);
            }
        }
        pop();
    }

    /**
     * Returns the preloaded image asset for an inventory item that has one,
     * or null if the item uses an emoji fallback.
     * @param {string} itemName
     */
    _getItemImage(itemName) {
        if (itemName === "UoB Student ID"  && assets.studentCardImg) return assets.studentCardImg;
        if (itemName === "Laptop Computer" && assets.computerImg)    return assets.computerImg;
        return null;
    }

    /**
     * Draws an image centred at (cx, cy) scaled to fit within maxW × maxH
     * while preserving the original aspect ratio.
     */
    _drawImageAspect(img, cx, cy, maxW, maxH) {
        let scale = min(maxW / img.width, maxH / img.height);
        imageMode(CENTER);
        image(img, cx, cy, img.width * scale, img.height * scale);
    }

    /**
     * Returns the interaction radius used for overlap detection.
     * These are intentionally smaller than the visual footprint so items
     * can be placed close but still visually distinct.
     * @param {string} itemName
     */
    _getItemRadius(itemName) {
        if (itemName === "Laptop Computer") return 150;
        if (itemName === "UoB Student ID")  return 100;
        return 60; // emoji-based items
    }

    /**
     * Returns true if placing itemName centred at (x, y) would overlap with
     * any existing scattered item (other than the one at excludeIndex).
     * @param {number}  x
     * @param {number}  y
     * @param {string}  itemName
     * @param {number}  excludeIndex  index to skip (the item being dragged), or -1
     */
    _wouldOverlap(x, y, itemName, excludeIndex) {
        let r1 = this._getItemRadius(itemName);
        for (let i = 0; i < this.scatteredItems.length; i++) {
            if (i === excludeIndex) continue;
            let other = this.scatteredItems[i];
            let r2    = this._getItemRadius(other.item.name);
            if (dist(x, y, other.x, other.y) < r1 + r2) return true;
        }
        return false;
    }

    /**
     * Renders the backpack image on the left side of the desk.
     * No selection highlight is shown (removed per design decision).
     */
    drawBackpack() {
        push();
        imageMode(CENTER);
        noTint();
        if (assets.backpackImg) {
            image(assets.backpackImg, this.backpackX, this.backpackY, this.backpackW, this.backpackH);
        } else {
            // Fallback drawn silhouette
            translate(this.backpackX, this.backpackY);
            rectMode(CENTER);
            fill(80, 50, 30);
            stroke(60, 40, 20);
            strokeWeight(3);
            rect(0, 30, this.backpackW * 0.5, this.backpackH * 0.5, 15);
            textSize(100);
            textAlign(CENTER, CENTER);
            text("🎒", 0, 10);
        }
        pop();
    }

    /**
     * Renders all desk items as rotated emoji icons with hover highlights and tooltips.
     * The item currently being dragged from the desk is skipped here
     * (it is drawn at the cursor position by drawDraggedItem instead).
     */
    drawScatteredItems() {
        this.scatteredItems.forEach((scattered, i) => {
            // Skip the item actively being dragged — drawDraggedItem handles it
            if (this.dragSource === 'desk' && this.dragIndex === i) return;

            push();
            translate(scattered.x, scattered.y);
            rotate(radians(scattered.rotation));
            let isHovered = (this.hoveredItem === i);
            if (isHovered) {
                fill(200, 150, 255, 90);
                noStroke();
                ellipse(0, 0, 115, 115);
            }
            let itemImg = this._getItemImage(scattered.item.name);
            if (itemImg) {
                let maxSize = (scattered.item.name === "Laptop Computer") ? 800 : 400;
                this._drawImageAspect(itemImg, 0, 0, maxSize, maxSize);
            } else {
                let emoji = this.itemEmojis[scattered.item.name] || "📦";
                textSize(60);
                textAlign(CENTER, CENTER);
                text(emoji, 0, 0);
            }
            pop();

            if (isHovered && !this.draggedItem) {
                this.drawTooltip(scattered.item, mouseX, mouseY);
            }
        });
    }

    /**
     * Renders the item currently being dragged at the cursor position.
     */
    drawDraggedItem() {
        if (!this.draggedItem) return;
        push();
        let itemImg = this._getItemImage(this.draggedItem.name);
        if (itemImg) {
            tint(255, 220);
            let dragMax = (this.draggedItem.name === "Laptop Computer") ? 400 : 200;
            this._drawImageAspect(itemImg, mouseX, mouseY, dragMax, dragMax);
            noTint();
        } else {
            let emoji = this.itemEmojis[this.draggedItem.name] || "📦";
            textSize(72);
            textAlign(CENTER, CENTER);
            fill(255, 255, 255, 220);
            text(emoji, mouseX, mouseY);
        }
        pop();
    }

    /**
     * Renders a tooltip card near the cursor for a desk item.
     */
    drawTooltip(item, mx, my) {
        push();
        let title = item.name;
        let desc  = item.description || "";

        textSize(16);
        let w  = max(textWidth(title), textWidth(desc), 180) + 30;
        let h  = desc ? 85 : 60;
        let tx = constrain(mx + 20, 10, width - w - 10);
        let ty = constrain(my - h / 2, 10, height - h - 10);

        rectMode(CORNER);
        fill(22, 10, 48, 240);
        stroke(255, 215, 0);
        strokeWeight(2);
        rect(tx, ty, w, h, 6);

        noStroke();
        fill(255, 215, 0);
        textAlign(LEFT, TOP);
        textSize(16);
        text(title, tx + 15, ty + 12);

        if (desc) {
            fill(200, 160, 255);
            textSize(13);
            text(desc, tx + 15, ty + 38);
        }

        fill(140, 100, 200);
        textSize(11);
        text("Drag to backpack", tx + 15, ty + h - 20);
        pop();
    }

    /**
     * Renders a tooltip card below a backpack slot for an equipped item.
     */
    drawSlotTooltip(item, slotX, slotY) {
        push();
        let title = item.name;
        let desc  = item.description || "";

        textSize(16);
        let w  = max(textWidth(title), textWidth(desc), 180) + 30;
        let h  = desc ? 85 : 60;
        let tx = constrain(slotX - w / 2, 10, width - w - 10);
        let ty = slotY + this.slotSize / 2 + 12;

        rectMode(CORNER);
        fill(22, 10, 48, 240);
        stroke(255, 215, 0);
        strokeWeight(2);
        rect(tx, ty, w, h, 6);

        noStroke();
        fill(255, 215, 0);
        textAlign(LEFT, TOP);
        textSize(16);
        text(title, tx + 15, ty + 12);

        if (desc) {
            fill(200, 160, 255);
            textSize(13);
            text(desc, tx + 15, ty + 38);
        }

        fill(140, 100, 200);
        textSize(11);
        text("Drag back to desk", tx + 15, ty + h - 20);
        pop();
    }

    /**
     * Renders the backpack-full confirmation dialog.
     */
    drawReplaceDialog() {
        push();
        fill(0, 0, 0, 200);
        rectMode(CORNER);
        rect(0, 0, width, height);

        let boxW = 500, boxH = 250;
        let boxX = width / 2, boxY = height / 2;
        rectMode(CENTER);
        fill(22, 10, 48);
        stroke(255, 215, 0);
        strokeWeight(4);
        rect(boxX, boxY, boxW, boxH, 14);

        textAlign(CENTER, CENTER);
        noStroke();
        fill(255, 215, 0);
        textSize(22);
        text("⚠️ BACKPACK FULL", boxX, boxY - 75);

        fill(255);
        textSize(16);
        text("书包只能装三个物品,",        boxX, boxY - 35);
        text("还要装学生卡和电脑!",        boxX, boxY - 10);
        text("Replace existing NPC item?", boxX, boxY + 20);

        let btnY = boxY + 75, btnW = 90, btnH = 40;
        let yesHover = (mouseX > boxX - 60 - btnW / 2 && mouseX < boxX - 60 + btnW / 2 &&
                        mouseY > btnY - btnH / 2 && mouseY < btnY + btnH / 2);
        fill(yesHover ? color(120, 255, 120) : color(60, 180, 60));
        rect(boxX - 60, btnY, btnW, btnH, 8);
        fill(0); textSize(18); text("YES", boxX - 60, btnY);

        let noHover = (mouseX > boxX + 60 - btnW / 2 && mouseX < boxX + 60 + btnW / 2 &&
                       mouseY > btnY - btnH / 2 && mouseY < btnY + btnH / 2);
        fill(noHover ? color(255, 120, 120) : color(180, 60, 60));
        rect(boxX + 60, btnY, btnW, btnH, 8);
        fill(0); text("NO", boxX + 60, btnY);
        pop();
    }

    /**
     * Renders a temporary status message banner below the slot panel.
     */
    drawMessage() {
        push();
        rectMode(CENTER);
        fill(22, 10, 48, 230);
        stroke(255, 215, 0);
        strokeWeight(2);
        rect(width / 2, this.topBarY + this.topBarH / 2 + 44, 760, 56, 10);
        fill(255, 215, 0);
        textAlign(CENTER, CENTER);
        textSize(17);
        noStroke();
        text(this.messageText, width / 2, this.topBarY + this.topBarH / 2 + 44);
        pop();
    }

    /**
     * Renders the static instruction line at the very bottom of the screen.
     */
    drawInstructions() {
        push();
        fill(180, 130, 255, 160);
        textAlign(CENTER, BOTTOM);
        textSize(15);
        noStroke();
        text("Drag items between backpack and desk  |  Hover for info  |  [ESC] to close",
             width / 2, height - 8);
        pop();
    }

    // ─── DEV OVERLAYS ────────────────────────────────────────────────────────

    /**
     * Draws interactive debug boxes for the desk zone, item zone, and backpack.
     * Only active when developerMode = true.
     *
     * Controls:
     *   - Drag centre handle (yellow square) → move the entire box / backpack
     *   - Drag corner handle (coloured square) → resize from that corner
     *   - Release → logs the final values to the browser console
     */
    drawDevOverlays() {
        push();
        // Desk zone — blue
        this.drawDevZoneBox(this.deskZone,  'deskZone',  [60, 160, 255]);
        // Item zone — red
        this.drawDevZoneBox(this.itemZone,  'itemZone',  [255, 80,  80]);
        // Backpack — cyan
        this.drawDevBackpackBox();
        pop();
    }

    /**
     * Draws a labelled, handle-equipped rectangle for a zone in dev mode.
     */
    drawDevZoneBox(zone, name, col) {
        let x = zone.left,   y  = zone.top;
        let w = zone.right  - zone.left;
        let h = zone.bottom - zone.top;
        let cx = x + w / 2,  cy = y + h / 2;
        let r = col[0], g = col[1], b = col[2];

        push();
        rectMode(CORNER);
        noFill();
        stroke(r, g, b, 200);
        strokeWeight(2);
        drawingContext.setLineDash([8, 6]);
        rect(x, y, w, h, 4);
        drawingContext.setLineDash([]);

        // Label
        fill(r, g, b, 220);
        noStroke();
        textAlign(LEFT, TOP);
        textSize(13);
        text(`[DEV] ${name}  left:${round(zone.left)}  right:${round(zone.right)}  top:${round(zone.top)}  bottom:${round(zone.bottom)}`,
             x + 8, y + 6);

        // Handles: centre = move, corners = resize
        this.drawDevHandle(cx, cy, [255, 230, 0]);   // yellow = move
        this.drawDevHandle(x,     y,     col);
        this.drawDevHandle(x + w, y,     col);
        this.drawDevHandle(x,     y + h, col);
        this.drawDevHandle(x + w, y + h, col);
        pop();
    }

    /**
     * Draws a labelled, handle-equipped box around the backpack image in dev mode.
     */
    drawDevBackpackBox() {
        let bx = this.backpackX, by = this.backpackY;
        let hw = this.backpackW / 2, hh = this.backpackH / 2;

        push();
        rectMode(CENTER);
        noFill();
        stroke(0, 230, 200, 200);
        strokeWeight(2);
        drawingContext.setLineDash([8, 6]);
        rect(bx, by, this.backpackW, this.backpackH, 4);
        drawingContext.setLineDash([]);

        // Label
        fill(0, 230, 200, 220);
        noStroke();
        textAlign(CENTER, BOTTOM);
        textSize(13);
        text(`[DEV] backpack  x:${round(bx)}  y:${round(by)}  w:${round(this.backpackW)}  h:${round(this.backpackH)}`,
             bx, by - hh - 4);

        // Centre = move, corners = resize
        this.drawDevHandle(bx,      by,      [255, 230, 0]);
        this.drawDevHandle(bx - hw, by - hh, [0, 230, 200]);
        this.drawDevHandle(bx + hw, by - hh, [0, 230, 200]);
        this.drawDevHandle(bx - hw, by + hh, [0, 230, 200]);
        this.drawDevHandle(bx + hw, by + hh, [0, 230, 200]);
        pop();
    }

    /**
     * Draws a single square handle at (x, y) with the given [r,g,b] color.
     */
    drawDevHandle(x, y, col) {
        push();
        rectMode(CENTER);
        fill(col[0], col[1], col[2], 210);
        stroke(255, 255, 255, 200);
        strokeWeight(1.5);
        rect(x, y, 16, 16, 3);
        pop();
    }

    /**
     * Logs the current dev values for a target to the browser console.
     */
    logDevState(target) {
        if (target === 'itemZone') {
            let z = this.itemZone;
            console.log(`[DEV] itemZone  → left:${round(z.left)}  right:${round(z.right)}  top:${round(z.top)}  bottom:${round(z.bottom)}`);
        } else if (target === 'deskZone') {
            let z = this.deskZone;
            console.log(`[DEV] deskZone  → left:${round(z.left)}  right:${round(z.right)}  top:${round(z.top)}  bottom:${round(z.bottom)}`);
        } else if (target === 'backpack') {
            console.log(`[DEV] backpack  → x:${round(this.backpackX)}  y:${round(this.backpackY)}  w:${round(this.backpackW)}  h:${round(this.backpackH)}`);
        }
    }

    /**
     * Returns a hit descriptor { target, handle } if a dev handle is under (mx, my),
     * or null if nothing is hit.
     */
    getDevHit(mx, my) {
        const HS = 12; // half-size of handle hit area

        // Zone handles (itemZone and deskZone)
        let zones = [
            { name: 'itemZone', zone: this.itemZone },
            { name: 'deskZone', zone: this.deskZone }
        ];
        for (let { name, zone } of zones) {
            let x  = zone.left,  y  = zone.top;
            let w  = zone.right  - zone.left;
            let h  = zone.bottom - zone.top;
            let cx = x + w / 2,  cy = y + h / 2;

            if (abs(mx - cx)     < HS && abs(my - cy)     < HS) return { target: name, handle: 'move' };
            if (abs(mx - x)      < HS && abs(my - y)      < HS) return { target: name, handle: 'nw'   };
            if (abs(mx - (x+w))  < HS && abs(my - y)      < HS) return { target: name, handle: 'ne'   };
            if (abs(mx - x)      < HS && abs(my - (y+h))  < HS) return { target: name, handle: 'sw'   };
            if (abs(mx - (x+w))  < HS && abs(my - (y+h))  < HS) return { target: name, handle: 'se'   };
        }

        // Backpack handles
        let bx = this.backpackX, by = this.backpackY;
        let hw = this.backpackW / 2, hh = this.backpackH / 2;
        if (abs(mx - bx)       < HS && abs(my - by)       < HS) return { target: 'backpack', handle: 'move' };
        if (abs(mx - (bx-hw))  < HS && abs(my - (by-hh))  < HS) return { target: 'backpack', handle: 'nw'   };
        if (abs(mx - (bx+hw))  < HS && abs(my - (by-hh))  < HS) return { target: 'backpack', handle: 'ne'   };
        if (abs(mx - (bx-hw))  < HS && abs(my - (by+hh))  < HS) return { target: 'backpack', handle: 'sw'   };
        if (abs(mx - (bx+hw))  < HS && abs(my - (by+hh))  < HS) return { target: 'backpack', handle: 'se'   };

        return null;
    }

    /**
     * Applies the accumulated mouse delta to the currently active dev drag target.
     */
    applyDevDrag(dx, dy) {
        let t  = this.devDrag.target;
        let h  = this.devDrag.handle;
        let sv = this.devDrag.startVal;

        if (t === 'itemZone' || t === 'deskZone') {
            let zone = (t === 'itemZone') ? this.itemZone : this.deskZone;
            if (h === 'move') {
                zone.left   = sv.left   + dx;
                zone.right  = sv.right  + dx;
                zone.top    = sv.top    + dy;
                zone.bottom = sv.bottom + dy;
            } else if (h === 'nw') { zone.left  = sv.left   + dx; zone.top    = sv.top    + dy; }
              else if (h === 'ne') { zone.right = sv.right  + dx; zone.top    = sv.top    + dy; }
              else if (h === 'sw') { zone.left  = sv.left   + dx; zone.bottom = sv.bottom + dy; }
              else if (h === 'se') { zone.right = sv.right  + dx; zone.bottom = sv.bottom + dy; }

        } else if (t === 'backpack') {
            if (h === 'move') {
                this.backpackX = sv.x + dx;
                this.backpackY = sv.y + dy;
            } else {
                // Resize: opposite corner stays fixed, dragged corner follows mouse.
                let hw = sv.w / 2, hh = sv.h / 2;
                // Fixed corner position
                let fixX = (h === 'nw' || h === 'sw') ? sv.x + hw : sv.x - hw;
                let fixY = (h === 'nw' || h === 'ne') ? sv.y + hh : sv.y - hh;
                // Dragged corner current position
                let dragX = (h === 'nw' || h === 'sw') ? sv.x - hw + dx : sv.x + hw + dx;
                let dragY = (h === 'nw' || h === 'ne') ? sv.y - hh + dy : sv.y + hh + dy;

                this.backpackX = (fixX + dragX) / 2;
                this.backpackY = (fixY + dragY) / 2;
                this.backpackW = max(60, abs(fixX - dragX));
                this.backpackH = max(60, abs(fixY - dragY));
            }
        }
    }

    // ─── INPUT HANDLING ──────────────────────────────────────────────────────

    /**
     * Updates hover state for backpack, desk items, and slots on every mouse move.
     */
    handleMouseMoved(mx, my) {
        this.backpackHighlight = (
            mx > this.backpackX - this.backpackW / 2 && mx < this.backpackX + this.backpackW / 2 &&
            my > this.backpackY - this.backpackH / 2 && my < this.backpackY + this.backpackH / 2
        );

        // Check desk items (skip the item currently being dragged)
        this.hoveredItem = -1;
        for (let i = 0; i < this.scatteredItems.length; i++) {
            if (this.dragSource === 'desk' && this.dragIndex === i) continue;
            let s = this.scatteredItems[i];
            if (dist(mx, my, s.x, s.y) < 50) { this.hoveredItem = i; break; }
        }

        // Check backpack slots
        this.hoveredSlot = -1;
        let startX = this.topBarX - (3 * this.slotSize + 2 * this.slotSpacing) / 2;
        for (let i = 0; i < 3; i++) {
            let x = startX + i * (this.slotSize + this.slotSpacing) + this.slotSize / 2;
            let y = this.topBarY + 45;
            if (dist(mx, my, x, y) < this.slotSize / 2) { this.hoveredSlot = i; break; }
        }
    }

    /**
     * Initiates a drag from a slot or desk item on mouse press.
     * In dev mode, checks for dev handles first before normal game interaction.
     */
    handleMousePressed(mx, my) {
        // ── Dev mode: check for dev handles first ─────────────────────────────
        if (developerMode && !this.showReplaceDialog) {
            let hit = this.getDevHit(mx, my);
            if (hit) {
                this.devDrag.active  = true;
                this.devDrag.target  = hit.target;
                this.devDrag.handle  = hit.handle;
                this.devDrag.startMX = mx;
                this.devDrag.startMY = my;

                // Snapshot current values for delta-based dragging
                if (hit.target === 'itemZone') {
                    this.devDrag.startVal = { ...this.itemZone };
                } else if (hit.target === 'deskZone') {
                    this.devDrag.startVal = { ...this.deskZone };
                } else if (hit.target === 'backpack') {
                    this.devDrag.startVal = { x: this.backpackX, y: this.backpackY,
                                              w: this.backpackW,  h: this.backpackH };
                }
                return;  // Don't process normal game mouse logic
            }
        }

        // ── Normal gameplay mouse handling ────────────────────────────────────
        if (this.showReplaceDialog) {
            let boxX = width / 2, boxY = height / 2;
            let btnY = boxY + 75, btnW = 90, btnH = 40;
            if (mx > boxX - 60 - btnW / 2 && mx < boxX - 60 + btnW / 2 &&
                my > btnY - btnH / 2       && my < btnY + btnH / 2) {
                this.executeReplace(); return;
            }
            if (mx > boxX + 60 - btnW / 2 && mx < boxX + 60 + btnW / 2 &&
                my > btnY - btnH / 2       && my < btnY + btnH / 2) {
                this.showReplaceDialog = false;
                this.replaceNewItem    = null;
                return;
            }
            return;
        }

        // Drag from backpack slot
        let startX = this.topBarX - (3 * this.slotSize + 2 * this.slotSpacing) / 2;
        for (let i = 0; i < 3; i++) {
            let x = startX + i * (this.slotSize + this.slotSpacing) + this.slotSize / 2;
            let y = this.topBarY + 45;
            if (dist(mx, my, x, y) < this.slotSize / 2 && this.topSlots[i]) {
                let item = this.findItemByName(this.topSlots[i]);
                if (item) {
                    this.draggedItem = item;
                    this.dragSource  = 'slot';
                    this.dragIndex   = i;
                    return;
                }
            }
        }

        // Drag from desk — record original position for potential snap-back
        for (let i = this.scatteredItems.length - 1; i >= 0; i--) {
            let s = this.scatteredItems[i];
            if (dist(mx, my, s.x, s.y) < 50) {
                this.draggedItem = s.item;
                this.dragSource  = 'desk';
                this.dragIndex   = i;
                this.dragStartX  = s.x;
                this.dragStartY  = s.y;
                return;
            }
        }
    }

    /**
     * Forwards drag coordinates; in dev mode applies active dev drag if present.
     */
    handleMouseDragged(mx, my) {
        if (developerMode && this.devDrag.active) {
            let dx = mx - this.devDrag.startMX;
            let dy = my - this.devDrag.startMY;
            this.applyDevDrag(dx, dy);
            return;
        }
        this.handleMouseMoved(mx, my);
    }

    /**
     * Resolves the drag on mouse release.
     *
     * Desk items:
     *   - Drop on backpack  → pack item
     *   - Drop on slot      → slot item
     *   - Drop inside zone  → update item position (free reposition)
     *   - Drop outside zone → snap back to dragStartX / dragStartY
     *
     * Slot items:
     *   - Drop on another slot → swap
     *   - Drop inside zone     → return to desk
     *   - Drop outside zone    → stays in slot
     */
    handleMouseReleased(mx, my) {
        // ── Finalize dev drag ─────────────────────────────────────────────────
        if (developerMode && this.devDrag.active) {
            this.logDevState(this.devDrag.target);
            this.devDrag.active = false;
            this.devDrag.target = null;
            this.devDrag.handle = null;
            return;
        }

        if (!this.draggedItem) return;
        let item = this.draggedItem;
        let z    = this.itemZone;
        let inItemZone = (mx > z.left && mx < z.right && my > z.top && my < z.bottom);

        if (this.dragSource === 'desk') {
            if (this.backpackHighlight) {
                this.tryAddToBackpack(item);
            } else if (this.hoveredSlot !== -1) {
                this.tryAddToSlot(item, this.hoveredSlot);
            } else if (inItemZone) {
                // Only reposition if the target spot does not overlap another item
                if (this._wouldOverlap(mx, my, item.name, this.dragIndex)) {
                    this.showMessage("Can't place here — items would overlap!");
                    // scatteredItems[dragIndex] keeps dragStartX/Y → snap-back
                } else {
                    this.scatteredItems[this.dragIndex].x        = mx;
                    this.scatteredItems[this.dragIndex].y        = my;
                    this.scatteredItems[this.dragIndex].rotation = random(-12, 12);
                }
            }
            // Dropped outside zone → scatteredItems[dragIndex] retains dragStartX/Y → snap-back

        } else if (this.dragSource === 'slot') {
            if (this.hoveredSlot !== -1) {
                this.tryAddToSlot(item, this.hoveredSlot);
            } else if (inItemZone) {
                // Find a non-overlapping spot near the drop point
                if (!this._wouldOverlap(mx, my, item.name, -1)) {
                    this.topSlots[this.dragIndex] = null;
                    this.addToDeskAtPosition(item, mx, my);
                    this.showMessage("✓ " + item.name + " returned to desk");
                } else {
                    // Try nearby offsets until a clear spot is found
                    let placed = false;
                    let r = this._getItemRadius(item.name) * 2 + 20;
                    for (let angle = 0; angle < 360 && !placed; angle += 30) {
                        let tx = mx + r * cos(radians(angle));
                        let ty = my + r * sin(radians(angle));
                        let z2 = this.itemZone;
                        if (tx > z2.left && tx < z2.right && ty > z2.top && ty < z2.bottom) {
                            if (!this._wouldOverlap(tx, ty, item.name, -1)) {
                                this.topSlots[this.dragIndex] = null;
                                this.addToDeskAtPosition(item, tx, ty);
                                this.showMessage("✓ " + item.name + " returned to desk");
                                placed = true;
                            }
                        }
                    }
                    if (!placed) this.showMessage("No free space — drag the item first!");
                }
            }
            // Outside zone → stays in slot (snap-back)
        }

        this.draggedItem = null;
        this.dragSource  = null;
        this.dragIndex   = -1;
    }

    // ─── ITEM LOGIC ──────────────────────────────────────────────────────────

    /**
     * Attempts to add an item to the backpack via the drop target.
     */
    tryAddToBackpack(item) {
        let hasStudentID = this.topSlots.includes("UoB Student ID");
        let hasComputer  = this.topSlots.includes("Laptop Computer");
        let npcCount     = this.topSlots.filter(id => id && !id.includes("Student") && !id.includes("Computer")).length;

        if (item.name === "UoB Student ID" || item.name === "Laptop Computer") {
            let emptySlot = this.topSlots.indexOf(null);
            if (emptySlot !== -1) {
                this.topSlots[emptySlot] = item.name;
                this.removeFromDesk(item.name);
                this.showMessage("✓ " + item.name + " packed!");
            }
        } else {
            if (!hasStudentID || !hasComputer) {
                this.showMessage("❌ Pack Student ID and Laptop first!");
            } else if (npcCount >= 1) {
                let existingIndex = this.topSlots.findIndex(id => id && !id.includes("Student") && !id.includes("Computer"));
                this.showReplaceDialog = true;
                this.replaceNewItem    = item;
                this.replaceSlotIndex  = existingIndex;
            } else {
                let emptySlot = this.topSlots.indexOf(null);
                if (emptySlot !== -1) {
                    this.topSlots[emptySlot] = item.name;
                    this.removeFromDesk(item.name);
                    this.showMessage("✓ " + item.name + " packed!");
                }
            }
        }
    }

    /**
     * Places an item into a specific slot, swapping the occupant back to the desk if needed.
     */
    tryAddToSlot(item, slotIndex) {
        if (this.topSlots[slotIndex]) {
            let oldItemName = this.topSlots[slotIndex];
            this.topSlots[slotIndex] = item.name;
            if (this.dragSource === 'desk') {
                this.removeFromDesk(item.name);
                this.addToDesk(this.findItemByName(oldItemName));
            } else if (this.dragSource === 'slot') {
                this.topSlots[this.dragIndex] = null;
                this.addToDesk(this.findItemByName(oldItemName));
            }
        } else {
            this.topSlots[slotIndex] = item.name;
            if (this.dragSource === 'desk') {
                this.removeFromDesk(item.name);
            } else if (this.dragSource === 'slot') {
                this.topSlots[this.dragIndex] = null;
            }
        }
    }

    /**
     * Confirms the item replacement after the user clicks YES in the dialog.
     */
    executeReplace() {
        if (!this.replaceNewItem) return;
        let oldItemName = this.topSlots[this.replaceSlotIndex];
        this.topSlots[this.replaceSlotIndex] = this.replaceNewItem.name;
        this.removeFromDesk(this.replaceNewItem.name);
        this.addToDesk(this.findItemByName(oldItemName));
        this.showMessage("✓ Item replaced!");
        this.showReplaceDialog = false;
        this.replaceNewItem    = null;
    }

    // ─── DESK ITEM HELPERS ───────────────────────────────────────────────────

    removeFromDesk(itemName) {
        this.scatteredItems = this.scatteredItems.filter(s => s.item.name !== itemName);
    }

    addToDesk(item) {
        if (!item) return;
        let z = this.itemZone;
        this.scatteredItems.push({
            item:     item,
            x:        random(z.left + 60, z.right  - 60),
            y:        random(z.top  + 60, z.bottom - 60),
            rotation: random(-15, 15)
        });
    }

    addToDeskAtPosition(item, x, y) {
        if (!item) return;
        let z = this.itemZone;
        this.scatteredItems.push({
            item:     item,
            x:        constrain(x, z.left + 50, z.right  - 50),
            y:        constrain(y, z.top  + 50, z.bottom - 50),
            rotation: random(-15, 15)
        });
    }

    // ─── UTILITIES ───────────────────────────────────────────────────────────

    findItemByName(name) {
        return this.inventory.items.find(item => item.name === name);
    }

    showMessage(text) {
        this.messageText  = text;
        this.messageTimer = 120;
    }

    /**
     * Returns true if both required items (Student ID and Laptop) are packed in a slot.
     */
    hasRequiredItems() {
        let hasID     = this.topSlots.includes("UoB Student ID");
        let hasLaptop = this.topSlots.includes("Laptop Computer");
        return hasID && hasLaptop;
    }

    /**
     * Returns a human-readable list of which required items are still missing from the slots.
     */
    getMissingRequiredItems() {
        let missing = [];
        if (!this.topSlots.includes("UoB Student ID"))  missing.push("Student ID");
        if (!this.topSlots.includes("Laptop Computer")) missing.push("Laptop");
        return missing;
    }
}
