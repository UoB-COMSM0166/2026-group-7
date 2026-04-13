// Park Street Survivor - Backpack Visual
// Responsibilities: Drag-and-drop inventory UI, slot management, tooltips, and item-swap dialogs.

class BackpackVisual {

    // ─── INITIALISATION ──────────────────────────────────────────────────────

    constructor(inventorySystem, roomScene) {
        this.inventory = inventorySystem;
        this.room = roomScene;

        // ── BACKPACK SLOT PANEL (top of screen) ───────────────────────────────
        // ← adjust topBarY to move the panel up/down
        this.topBarX = width / 2;
        this.topBarY = 145;     // ← panel centre Y (near top)
        this.topBarW = 420;     // ← width: side margins ≈ bottom margin
        this.topBarH = 260;     // ← height: title + label + slots all inside with breathing room
        this.topSlots = [null, null, null];
        this.slotSize = 100;
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
            left: 719,   // ← left edge  X  (calibrated from dev mode)
            right: 1850,  // ← right edge X
            top: 418,   // ← top edge   Y
            bottom: 897    // ← bottom edge Y
        };

        // ── DESK ZONE (visual reference for the physical desk surface) ────────
        // Used only for orientation — does not affect gameplay.
        // ← adjust these values to match where the desk appears in table.png
        this.deskZone = {
            left: 61,
            right: 1851,
            top: 417,
            bottom: 898
        };

        // ── FIXED ITEM POSITIONS (absolute canvas coordinates) ───────────────
        // Each item on the desk always snaps back to its fixed position.
        // ← In developer mode, drag the gold crosshair handles to reposition.
        //   The console will log the new coordinates on release.
        // ← To set positions for a specific day, run the game on that day with
        //   developerMode = true, adjust, then copy the logged values here.
        // size = render scale multiplier (1.0 = default base size).
        // ← In developer mode drag the pink handle to resize, then copy logged values here.
        this.itemFixedPositions = {
            "UoB Student ID": { x: 1209, y: 748, rot: -5, size: 1.335 },
            "Laptop Computer": { x: 1413, y: 460, rot: 3, size: 1.169 },
            "Soft Gummy Vitamins": { x: 915, y: 767, rot: -10, size: 1.483 },
            "Tangle": { x: 1488, y: 731, rot: 7, size: 1.161 },
            "Headphones": { x: 1042, y: 516, rot: 4, size: 1.679 },
            "Rain Boots": { x: 1716, y: 733, rot: -6, size: 1.876 }
        };

        // Items scattered on the desk surface
        this.scatteredItems = [];
        this.initScatteredItems();

        // Drag state (normal gameplay)
        this.draggedItem = null;
        this.dragSource = null;
        this.dragIndex = -1;
        this.dragStartX = 0;   // original X before drag (for snap-back)
        this.dragStartY = 0;   // original Y before drag (for snap-back)

        // Hover state
        this.hoveredItem = -1;
        this.hoveredSlot = -1;

        // Replace-item confirmation dialog state
        this.showReplaceDialog = false;
        this.replaceNewItem = null;
        this.replaceSlotIndex = -1;

        // Temporary status message
        this.messageText = "";
        this.messageTimer = 0;

        // Shimmer animation counter for slot decoration
        this.shimmer = 0;

        // Bubble tooltip pop-in animation (0 → 1, freezes at 1)
        this.bubbleAnimT   = 0;
        this._prevHoverKey = null;

        // Tutorial drag animation (Day 1 only)
        this.showDragTutorial = false;
        this.tutorialAnimT    = 0;
        // Track which required items were unpacked last frame so we can
        // detect a state change and reset the timer cleanly (prevents ghost flash).
        this._tutNeedsID     = true;
        this._tutNeedsLaptop = true;

        // In-backpack dialogue box (Iris messages)
        this.dialogueBox = new DialogueBox();
        // Day 1 narrative state
        // _day1IntroStep: 0=pending, 1=showing intro, 2=showing hover-hint, 3=done
        this._day1IntroStep           = 0;
        this._day2GummyHintDone       = false;   // Day 2: "try Wiola's gummies" hint shown
        this._packingDoneMsgDone      = false;   // "all packed, let's go" message
        this._packingDoneDialogueLock = false;   // lock dialogue until back button clicked
        this._packedNpcItem           = null;    // Day 3+: name of NPC item in a slot, or null
        this._npcSlotHintShown        = false;   // Day 3+: one-NPC-item hint shown

        // ── DEV DRAG STATE ────────────────────────────────────────────────────
        // Tracks interactive manipulation of debug zones and backpack in dev mode.
        this.devDrag = {
            active: false,
            target: null,    // 'itemZone' | 'deskZone' | 'backpack'
            handle: null,    // 'move' | 'nw' | 'ne' | 'sw' | 'se'
            startMX: 0,
            startMY: 0,
            startVal: null     // snapshot of the value being edited
        };

        // Keyboard navigation state
        this.kbFocusIndex     = -1;  // index into scatteredItems (-1 = no keyboard focus)
        this._replaceDialogFocus = 0; // 0 = YES button focused, 1 = NO button focused

        // Back arrow button — returns to room and advances tutorial phase
        this.backButton = new UIButton(70, 65, 60, 60, "BACK_ARROW", () => {
            if (typeof tutorialHints !== 'undefined' && tutorialHints.roomPhase === 'CLOSE_BP') {
                if (this.hasRequiredItems()) {
                    tutorialHints.roomPhase = (currentDayID === 1) ? 'DOOR' : 'DONE';
                } else {
                    // Required items not yet packed — keep desk hint active
                    tutorialHints.roomPhase = 'DESK';
                }
            }
            gameState.currentState = STATE_ROOM;
        });
    }

    /**
     * Resets the backpack to a clean state for a new day:
     * clears all packed slots and puts every day-appropriate item back on the desk.
     * Call this from setupRun() / setupRunDirectly() when starting any new level.
     */
    resetForNewDay() {
        this.topSlots = [null, null, null];
        this.draggedItem         = null;
        this.dragSource          = null;
        this.dragIndex           = -1;
        this.kbFocusIndex        = -1;
        this._replaceDialogFocus = 0;
        this.showReplaceDialog   = false;
        this.replaceNewItem    = null;
        this.replaceSlotIndex  = -1;
        this.messageText       = "";
        this.messageTimer      = 0;
        this.showDragTutorial  = (currentDayID === 1);
        this.tutorialAnimT     = 0;
        this._tutNeedsID       = true;
        this._tutNeedsLaptop   = true;
        this._day1IntroStep           = 0;
        this._day2GummyHintDone       = false;
        this._packingDoneMsgDone      = false;
        this._packingDoneDialogueLock = false;
        this._packedNpcItem           = null;
        this._npcSlotHintShown        = false;
        this.dialogueBox.reset();
        this.initScatteredItems();
    }

    /**
     * Called when the backpack is closed externally (e.g. ESC key).
     * Clears any active dialogue and the packing-done lock so they don't
     * persist and reappear on the next entry.
     */
    onClose() {
        this._packingDoneDialogueLock = false;
        this.kbFocusIndex             = -1;
        this._replaceDialogFocus      = 0;
        this.dialogueBox.reset();
    }

    /**
     * Populates the desk with items available for the current day.
     * Items already in the backpack slots are excluded.
     * ── TO CHANGE STARTING POSITIONS: edit the positions[] array below ───────
     */
    initScatteredItems() {
        this.scatteredItems = [];
        let availableItems = this.getAvailableItemsForDay(currentDayID);

        availableItems.forEach(item => {
            if (this.topSlots.includes(item.name)) return;
            // Each item always starts at its fixed position
            let pos = this.itemFixedPositions[item.name] ||
                { x: this.itemZone.left + 200, y: this.itemZone.top + 200, rot: 0 };
            this.scatteredItems.push({ item: item, x: pos.x, y: pos.y, rotation: pos.rot });
        });
    }

    /**
     * Returns the list of inventory items unlocked on or before the given day.
     */
    getAvailableItemsForDay(day) {
        let items = [];
        let studentID = this.inventory.items.find(i => i.name === "UoB Student ID");
        let computer = this.inventory.items.find(i => i.name === "Laptop Computer");
        if (studentID) items.push(studentID);
        if (computer) items.push(computer);
        if (day >= 2) { let gummy = this.inventory.items.find(i => i.name === "Soft Gummy Vitamins"); if (gummy) items.push(gummy); }
        if (day >= 3) { let coffee = this.inventory.items.find(i => i.name === "Tangle"); if (coffee) items.push(coffee); }
        if (day >= 4) { let headphones = this.inventory.items.find(i => i.name === "Headphones"); if (headphones) items.push(headphones); }
        if (day >= 5) { let boots = this.inventory.items.find(i => i.name === "Rain Boots"); if (boots) items.push(boots); }
        return items;
    }

    /**
     * Returns the name of the item first introduced on the given day, or null for Day 1.
     */
    _getNewItemName(day) {
        if (day === 2) return "Soft Gummy Vitamins";
        if (day === 3) return "Tangle";
        if (day === 4) return "Headphones";
        if (day === 5) return "Rain Boots";
        return null;
    }

    // ─── RENDERING ───────────────────────────────────────────────────────────

    /**
     * Ghost-drag tutorial: shows which required items still need to be packed.
     * When both are missing, the ghost alternates between Student ID and Laptop.
     * When only one is missing, that item's ghost plays on a loop.
     * Automatically dismisses once both required items are in the backpack.
     * Only active on Day 1.
     */
    drawDragTutorial() {
        if (!this.showDragTutorial) return;

        // Auto-dismiss as soon as both required items are packed
        if (this.hasRequiredItems()) {
            this.showDragTutorial = false;
            return;
        }

        // Pause the animation (and hide the ghost) while the player is dragging
        if (this.draggedItem) return;

        let needsID     = !this.topSlots.includes("UoB Student ID");
        let needsLaptop = !this.topSlots.includes("Laptop Computer");

        // If the set of unpacked items changed (e.g. student card was just packed),
        // restart the timer from 0 so the next ghost begins a clean slide animation
        // instead of teleporting to whatever position the old counter left off at.
        if (needsID !== this._tutNeedsID || needsLaptop !== this._tutNeedsLaptop) {
            this.tutorialAnimT   = 0;
            this._tutNeedsID     = needsID;
            this._tutNeedsLaptop = needsLaptop;
        }

        const CYCLE = 130; // frames per single-item loop
        const MOVE  = 90;  // frames spent in motion (rest = pause at end)
        // Use double cycle only when both items are still unpacked
        const TOTAL = (needsID && needsLaptop) ? CYCLE * 2 : CYCLE;

        this.tutorialAnimT = (this.tutorialAnimT + 1) % TOTAL;

        // Determine which ghost to render this frame
        let itemName, itemImg;
        if (needsID && needsLaptop) {
            let cyclePhase = floor(this.tutorialAnimT / CYCLE);
            itemName = (cyclePhase === 0) ? "UoB Student ID" : "Laptop Computer";
            itemImg  = (cyclePhase === 0) ? assets.studentCardImg : assets.computerImg;
        } else if (needsID) {
            itemName = "UoB Student ID";
            itemImg  = assets.studentCardImg;
        } else {
            itemName = "Laptop Computer";
            itemImg  = assets.computerImg;
        }

        if (!itemImg) return;
        let posData = this.itemFixedPositions[itemName];
        if (!posData) return;

        let frameInCycle = this.tutorialAnimT % CYCLE;
        let t     = constrain(frameInCycle / MOVE, 0, 1);
        let eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        let gx = lerp(posData.x, this.backpackX, eased);
        let gy = lerp(posData.y, this.backpackY, eased);

        // Alpha: fade in → full → fade out
        let alpha;
        if      (t < 0.12) alpha = map(t, 0,    0.12, 0,   210);
        else if (t < 0.75) alpha = 210;
        else               alpha = map(t, 0.75, 1.0,  210, 0);

        // Render at natural image aspect ratio so ghost matches the real item
        let baseSize = (itemName === "Laptop Computer") ? 300 : 180;
        let ghostH   = baseSize * (posData.size || 1.0) * 0.65;
        let ghostW   = ghostH * (itemImg.width / itemImg.height);

        push();
        imageMode(CENTER);
        tint(255, alpha);
        image(itemImg, gx, gy, ghostW, ghostH);
        noTint();
        pop();
    }

    /**
     * Main display entry point — renders all layers in draw order.
     */
    display() {
        this.shimmer = (this.shimmer + 1) % 360;

        // Bubble pop-in: reset on new hover target, advance while hovering.
        // Keyboard focus is treated as a hover source when no mouse hover is active.
        const _activeItem = this.hoveredItem >= 0 ? this.hoveredItem : this.kbFocusIndex;
        const _hk = _activeItem >= 0 ? 'd' + _activeItem :
                    this.hoveredSlot >= 0 ? 's' + this.hoveredSlot : null;
        if (_hk !== this._prevHoverKey) { this.bubbleAnimT = 0; this._prevHoverKey = _hk; }
        if (_hk !== null && this.bubbleAnimT < 1) this.bubbleAnimT = Math.min(1, this.bubbleAnimT + 0.055);

        // ── Day 1 intro dialogue (step 0 → trigger intro) ────────────────────
        if (currentDayID === 1 && this._day1IntroStep === 0) {
            this._day1IntroStep = 1;
            this.dialogueBox.persistent = true;
            this.dialogueBox.trigger(
                "Every day I need to bring my Student ID and Laptop — they're essential! Drag them into my backpack to get ready.",
                null, "IRIS"
            );
        }

        // ── Day 2: suggest trying Wiola's gummies as soon as backpack opens ─────
        if (currentDayID === 2 && !this._day2GummyHintDone) {
            this._day2GummyHintDone = true;
            this.dialogueBox.persistent = true;
            this.dialogueBox.trigger(
                "Wiola's gummies are here too... maybe I should bring some!",
                null, "IRIS"
            );
        }

        // ── Day 3+: show one-item hint as soon as backpack opens ─────────────
        if (currentDayID >= 3 && !this._npcSlotHintShown) {
            this._npcSlotHintShown = true;
            this.dialogueBox.persistent = true;
            this.dialogueBox.trigger(
                "Tap the pause button to open the Help page and see what each item does — then decide what to bring!",
                null, "IRIS"
            );
        }

        // Track packed NPC item for other uses
        if (currentDayID >= 3) {
            this._packedNpcItem = this._getPackedNpcItem();
        }

        // ── Once required items are packed, prompt to leave ───────────────────
        // Day 2: waits until the gummy hint has been shown and dismissed.
        // Day 3+: waits until the NPC slot hint has been shown (only fires after packing an NPC item).
        if (this.hasRequiredItems() && !this._packingDoneMsgDone && !this.dialogueBox.active) {
            let readyForDone;
            if (currentDayID === 1)      readyForDone = true;
            else if (currentDayID === 2) readyForDone = this._day2GummyHintDone;
            else                         readyForDone = this._npcSlotHintShown;
            if (readyForDone) {
                this._packingDoneMsgDone      = true;
                this._packingDoneDialogueLock = true;
                if (currentDayID === 1) {
                    this.dialogueBox.persistent = true;
                    this.dialogueBox.trigger(
                        "Great, I've got everything I need! Time to head out — press the arrow in the top-left to close my bag.",
                        null, "IRIS"
                    );
                }
            }
        }

        push();
        this.drawRoomBackground();
        this.drawBackpack();
        this.drawScatteredItems();
        this.drawDragTutorial();
        this.drawTopBar();
        if (this.draggedItem) this.drawDraggedItem();
        if (this.messageTimer > 0) {
            this.drawMessage();
            this.messageTimer--;
        }
        this.drawInstructions();
        // Desk item tooltip — mouse hover takes priority; keyboard focus is fallback
        const _tooltipIdx = (this.hoveredItem >= 0 && !this.draggedItem) ? this.hoveredItem
                          : (this.kbFocusIndex >= 0 && !this.draggedItem) ? this.kbFocusIndex : -1;
        if (_tooltipIdx >= 0) {
            let s = this.scatteredItems[_tooltipIdx];
            if (s && !(this.dragSource === 'desk' && this.dragIndex === _tooltipIdx)) {
                this.drawTooltip(s.item, s.x, s.y);
            }
        }
        // Back arrow button (top-left): breathes when required items are packed
        this.backButton.isFocused = this.backButton.checkMouse(mouseX, mouseY);
        this.backButton.update();
        if (this.hasRequiredItems()) {
            let breathe = 1.0 + sin(frameCount * 0.06) * 0.12; // 0.88 → 1.12 pulse
            push();
            translate(this.backButton.x, this.backButton.y);
            scale(breathe);
            translate(-this.backButton.x, -this.backButton.y);
            this.backButton.display();
            pop();
        } else {
            this.backButton.display();
        }
        // Dev overlays are drawn last so they are always on top
        if (developerMode) this.drawDevOverlays();

        // Dialogue box rendered on top of everything
        this.dialogueBox.display();

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
        text("ONE friend's gift allowed per run", cx, cy - 42);

        // ── Divider line below label ──────────────────────────────────────────
        stroke(150, 80, 230, 80 + pulse * 30);
        strokeWeight(1);
        line(cx - bw / 2 + 30, cy - 20, cx + bw / 2 - 30, cy - 20);

        // ── Slots ─────────────────────────────────────────────────────────────
        let startX = cx - (3 * this.slotSize + 2 * this.slotSpacing) / 2;
        for (let i = 0; i < 3; i++) {
            let sx = startX + i * (this.slotSize + this.slotSpacing) + this.slotSize / 2;
            let sy = cy + 45;  // 11px gap below divider, 35px padding at bottom
            let isHovered = (this.hoveredSlot === i);
            let filled = !!this.topSlots[i];

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
                let itemImg = this._getItemImage(itemName);
                if (itemImg) {
                    imageMode(CENTER);
                    image(itemImg, sx, sy, this.slotSize - 10, this.slotSize - 10);
                } else {
                    fill(80, 40, 120);
                    noStroke();
                    rectMode(CENTER);
                    rect(sx, sy, this.slotSize - 20, this.slotSize - 20, 6);
                    fill(255);
                    textSize(11);
                    textAlign(CENTER, CENTER);
                    text(itemName.split(" ")[0].substring(0, 6).toUpperCase(), sx, sy);
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
        // Slot items do not show description tooltips
        pop();
    }

    /**
     * Returns the preloaded image asset for an inventory item that has one,
     * or null if the item uses an emoji fallback.
     * @param {string} itemName
     */
    _getItemImage(itemName) {
        if (itemName === "UoB Student ID" && assets.studentCardImg) return assets.studentCardImg;
        if (itemName === "Laptop Computer" && assets.computerImg) return assets.computerImg;
        if (itemName === "Soft Gummy Vitamins" && assets.vitaminImg) return assets.vitaminImg;
        if (itemName === "Tangle" && assets.tangleImg) return assets.tangleImg;
        if (itemName === "Headphones" && assets.headphoneImg) return assets.headphoneImg;
        if (itemName === "Rain Boots" && assets.rainbootImg) return assets.rainbootImg;
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
        if (itemName === "UoB Student ID") return 100;
        return 60; // emoji-based items
    }

    /**
     * Returns true if the mouse point is inside (or near) the backpack slot panel.
     * Used to determine whether a slot-item drag should stay in the panel or
     * be returned to the desk.
     */
    _isNearTopBar(mx, my) {
        let hw = this.topBarW / 2 + 60;
        let hh = this.topBarH / 2 + 30;
        return (mx > this.topBarX - hw && mx < this.topBarX + hw &&
            my > this.topBarY - hh && my < this.topBarY + hh);
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
            let r2 = this._getItemRadius(other.item.name);
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
            // Keyboard focus: breathe the item (takes priority over new-item breathe)
            if (this.kbFocusIndex === i && !this.draggedItem) {
                let breathe = 1.0 + sin(frameCount * 0.09) * 0.14;
                scale(breathe);
            // Breathe if this item is newly unlocked on the current day
            } else if (scattered.item.name === this._getNewItemName(currentDayID)) {
                let breathe = 1.0 + sin(frameCount * 0.06) * 0.10;
                scale(breathe);
            }
            // Grey out NPC items when another NPC item is already packed (Day 3+)
            let greyedOut = currentDayID >= 3 &&
                            this._isNpcItem(scattered.item.name) &&
                            this._packedNpcItem !== null &&
                            scattered.item.name !== this._packedNpcItem;

            let itemImg = this._getItemImage(scattered.item.name);
            if (itemImg) {
                let baseSize = (scattered.item.name === "Laptop Computer") ? 300 : 180;
                let posData = this.itemFixedPositions[scattered.item.name];
                let maxSize = baseSize * (posData ? (posData.size || 1.0) : 1.0);
                if (greyedOut) tint(80, 80, 80, 160);
                this._drawImageAspect(itemImg, 0, 0, maxSize, maxSize);
                if (greyedOut) noTint();
            } else {
                fill(greyedOut ? color(40, 40, 40) : color(80, 40, 120));
                noStroke();
                rectMode(CENTER);
                rect(0, 0, 80, 80, 8);
                fill(greyedOut ? 120 : 255);
                textSize(12);
                textAlign(CENTER, CENTER);
                text(scattered.item.name.split(" ")[0].substring(0, 6).toUpperCase(), 0, 0);
            }
            pop();

            // Tooltip is drawn later in display() to ensure it renders above all items
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
            let baseSize = (this.draggedItem.name === "Laptop Computer") ? 150 : 90;
            let posData = this.itemFixedPositions[this.draggedItem.name];
            let dragMax = baseSize * (posData ? (posData.size || 1.0) : 1.0);
            this._drawImageAspect(itemImg, mouseX, mouseY, dragMax, dragMax);
            noTint();
        } else {
            fill(80, 40, 120, 200);
            noStroke();
            rectMode(CENTER);
            rect(mouseX, mouseY, 80, 80, 8);
            fill(255, 255, 255, 220);
            textSize(12);
            textAlign(CENTER, CENTER);
            text(this.draggedItem.name.split(" ")[0].substring(0, 6).toUpperCase(), mouseX, mouseY);
        }
        pop();
    }

    /**
     * Renders a tooltip card to the right of a desk item.
     * @param {object} item - inventory item
     * @param {number} itemX - world x of the item centre
     * @param {number} itemY - world y of the item centre
     */
    // flipH: mirror horizontally (tail bottom-right, cloud upper-left).
    // rotate180: rotate 180° (tail top-right, cloud lower-left) — used for Laptop Computer.
    // S is the square render size, calculated by drawTooltip based on description length.
    _drawTooltipBox(tx, ty, title, desc, S, flipH = false, rotate180 = false, cXAdjust = 0, cYAdjust = 0) {
        // Only show the character's inner thought (first part, before \n)
        const descShow = desc ? desc.split('\n')[0] : '';

        const t        = Math.min(this.bubbleAnimT, 1);
        const eased    = 1 - Math.pow(1 - t, 3);   // ease-out cubic
        const frameIdx = Math.min(6, Math.floor(t * 7));
        const frameX   = frameIdx * 740;

        // Scale from tail corner
        push();
        if (rotate180) {
            translate(tx + S, ty);      // anchor at top-right (tail after 180° rotation)
            scale(eased);
            translate(-S, 0);
        } else if (flipH) {
            translate(tx + S, ty + S);  // anchor at bottom-right (tail after h-flip)
            scale(eased);
            translate(-S, -S);
        } else {
            translate(tx, ty + S);      // anchor at bottom-left (tail)
            scale(eased);
            translate(0, -S);
        }

        if (typeof assets !== 'undefined' && assets.bubbleBox) {
            push();
            if (rotate180) {
                // Rotate 180° around centre: tail moves to top-right, cloud to bottom-left
                translate(S / 2, S / 2);
                scale(-1, -1);
                translate(-S / 2, -S / 2);
            } else if (flipH) {
                // Mirror around vertical centre axis
                translate(S / 2, 0);
                scale(-1, 1);
                translate(-S / 2, 0);
            }
            imageMode(CORNER);
            image(assets.bubbleBox, 0, 0, S, S, frameX, 0, 740, 740);
            pop();
        } else {
            rectMode(CORNER);
            fill(22, 10, 48, 250);
            stroke(255, 215, 0);
            strokeWeight(3);
            rect(0, 0, S, S, 12);
        }

        // Text region layout (in local coords, after anchor transforms):
        // Normal:    cloud x 241-703, y ~170-670 of 740px sprite → cX=168/740*S, cY=170/740*S
        // flipH:     cloud mirrored  → cX=42/740*S
        // rotate180: cloud at bottom-left (180° of normal) → cX=(740-672)/740*S, cY=(740-670)/740*S
        const cX = (rotate180 ? Math.round(S *  68 / 740)
                 : flipH     ? Math.round(S *  80 / 740)
                 :              Math.round(S * 168 / 740)) + cXAdjust;
        const cY = (rotate180 ? Math.round(S * 140 / 740)
                 :              Math.round(S * 170 / 740)) + cYAdjust;
        const cW = flipH     ? Math.round(S * 450 / 740)
                 :              Math.round(S * 504 / 740);

        // Fixed font sizes — do not scale with S
        const titleSize = 52;
        const descSize  = 42;

        // Text only appears once the animation is fully complete
        if (this.bubbleAnimT >= 1) {
            noStroke();
            textFont(fonts.body);
            // textAlign(CENTER) centers text *within* the bounding box [cX, cX+cW]
            // — x must be the left edge (cX), not the centre (cX + cW/2)
            textAlign(CENTER, TOP);
            fill(255, 215, 0);
            textSize(titleSize);
            text(title, cX, cY, cW, titleSize * 1.6);

            if (descShow) {
                fill(200, 160, 255);
                textSize(descSize);
                const descY = cY + titleSize * 1.2;
                text(descShow, cX, descY, cW, S - descY - Math.round(S * 0.06));
            }
        }
        pop();
    }

    drawTooltip(item, itemX, itemY) {
        const descShow = (item.description || "").split('\n')[0];

        // Font sizes are fixed (52/42) so text height doesn't scale with S.
        // At any S: overhead (cY + bottomPad) ≈ S*0.33 → usable = S*0.67 → S ≥ textH/0.67
        // Use conservative char-width estimates matching the actual game font.
        const REF_CW   = Math.round(500 * 504 / 740);     // ≈340px reference cloud width
        const titleCPL = Math.max(1, Math.floor(REF_CW / 22)); // ~22px/char at size 52
        const descCPL  = Math.max(1, Math.floor(REF_CW / 18)); // ~18px/char at size 42
        const titleLines = Math.ceil(item.name.length / titleCPL);
        const descLines  = descShow ? Math.ceil(descShow.length / descCPL) : 0;
        const textH = titleLines * Math.round(52 * 1.5)   // title line height
                    + descLines  * Math.round(42 * 1.4);   // desc line height
        // Per-item minimum S to ensure cloud is large enough
        const sFloor = { "UoB Student ID": 520, "Rain Boots": 540, "Headphones": 520 }[item.name] || 460;
        const S = Math.max(sFloor, Math.min(700, Math.ceil((textH / 0.67) / 20) * 20));

        const flipH     = item.name === "Rain Boots";
        const rotate180 = item.name === "Laptop Computer";

        // Laptop: cloud extends bottom-left from the item → box sits to left and below
        let tx, ty;
        if (rotate180) {
            tx = constrain(itemX - S - 80, 10, width  - S - 10);
            ty = constrain(itemY + 100,    10, height - S - 10);
        } else if (flipH) {
            tx = constrain(itemX - S - 40, 10, width  - S - 10);
            ty = constrain(itemY - S - 20, 10, height - S - 10);
        } else {
            tx = constrain(itemX + 40,     10, width  - S - 10);
            ty = constrain(itemY - S - 20, 10, height - S - 10);
        }
        // cXAdjust: shift text right to better centre within cloud (skip for Student ID — already aligned)
        // cYAdjust: laptop cloud is rotated so text needs extra downward shift to land inside it
        const cXAdjust = item.name === "UoB Student ID"  ? 0
                       : item.name === "Laptop Computer" ? -Math.round(S * 14 / 740)
                       : Math.round(S * 16 / 740);
        const cYAdjust = rotate180 ? Math.round(S * 104 / 740) : 0;
        this._drawTooltipBox(tx, ty, item.name, item.description || "", S, flipH, rotate180, cXAdjust, cYAdjust);
    }

    /**
     * Renders a tooltip card below a backpack slot (bubble flipped — tail points up).
     */
    drawSlotTooltip(item, slotX, slotY) {
        const S = 500;
        const tx = constrain(slotX - Math.round(S * 0.15), 10, width - S - 10);
        const ty = constrain(slotY + this.slotSize / 2 + 10, 10, height - S - 10);
        this._drawTooltipBox(tx, ty, item.name, item.description || "", true);
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
        text("BACKPACK FULL", boxX, boxY - 75);

        fill(255);
        textSize(16);
        text("Only 1 NPC item allowed at a time.", boxX, boxY - 20);
        text("Replace the current NPC item?", boxX, boxY + 10);

        let btnY = boxY + 75, btnW = 120, btnH = 50;
        let yesHover = (mouseX > boxX - 80 - btnW / 2 && mouseX < boxX - 80 + btnW / 2 &&
            mouseY > btnY - btnH / 2 && mouseY < btnY + btnH / 2) || this._replaceDialogFocus === 0;
        let noHover = (mouseX > boxX + 80 - btnW / 2 && mouseX < boxX + 80 + btnW / 2 &&
            mouseY > btnY - btnH / 2 && mouseY < btnY + btnH / 2) || this._replaceDialogFocus === 1;

        // YES button
        push();
        translate(boxX - 80, btnY);
        if (yesHover) scale(1.08);
        imageMode(CENTER);
        if (assets && assets.btnImg) image(assets.btnImg, 0, 0, btnW * 2, btnH * 2);
        else { fill(60, 180, 60); rectMode(CENTER); rect(0, 0, btnW, btnH, 8); }
        noStroke(); fill(255, 215, 0); textSize(20); textAlign(CENTER, CENTER);
        text("YES", 0, -4);
        pop();

        // NO button
        push();
        translate(boxX + 80, btnY);
        if (noHover) scale(1.08);
        imageMode(CENTER);
        if (assets && assets.btnImg) image(assets.btnImg, 0, 0, btnW * 2, btnH * 2);
        else { fill(180, 60, 60); rectMode(CENTER); rect(0, 0, btnW, btnH, 8); }
        noStroke(); fill(255, 215, 0); textSize(20); textAlign(CENTER, CENTER);
        text("NO", 0, -4);
        pop();
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
        rect(width / 2, this.topBarY + this.topBarH / 2 + 44, 460, 52, 10);
        fill(255, 215, 0);
        textAlign(CENTER, CENTER);
        textFont(fonts.body);
        textSize(26);
        noStroke();
        text(this.messageText, width / 2, this.topBarY + this.topBarH / 2 + 44);
        pop();
    }

    /**
     * Renders the static instruction line at the very bottom of the screen.
     */
    drawInstructions() {
        push();
        const _bpLabel = "Drag items  \u00b7  Hover for info  \u00b7  [A / D] select  \u00b7  [ENTER] pack";
        rectMode(CENTER);
        fill(101, 63, 191, 204);
        stroke('#E2CAF8'); strokeWeight(3);
        rect(width / 2, height - 36, 860, 52, 15);
        noStroke();
        textFont(fonts.jersey20 || fonts.body); textSize(26);
        textAlign(CENTER, CENTER);
        stroke(0, 0, 0, 180); strokeWeight(3);
        fill(220, 185, 255);
        text(_bpLabel, width / 2, height - 36);
        noStroke();
        fill(220, 185, 255);
        text(_bpLabel, width / 2, height - 36);
        pop();
    }

    /**
     * Draws a pulsing gold ring + label around the back button to guide
     * the player to close the backpack after packing required items.
     */
    _drawBackButtonArrow() {
        let pulse = (sin(frameCount * 0.08) + 1) * 0.5;
        let bx = this.backButton.x, by = this.backButton.y;
        push();
        // Pulsing ring around the back button
        noFill();
        stroke(255, 215, 0, 140 + pulse * 115);
        strokeWeight(3 + pulse * 1.5);
        ellipseMode(CENTER);
        circle(bx, by, 90 + pulse * 12);
        // "CLOSE BAG" label below
        noStroke();
        fill(255, 215, 0, 160 + pulse * 95);
        let fB = (typeof fonts !== 'undefined') ? (fonts.body || fonts.title) : null;
        if (fB) textFont(fB);
        textSize(17);
        textAlign(CENTER, TOP);
        text("CLOSE BAG", bx, by + 48);
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
        this.drawDevZoneBox(this.deskZone, 'deskZone', [60, 160, 255]);
        // Item zone — red
        this.drawDevZoneBox(this.itemZone, 'itemZone', [255, 80, 80]);
        // Backpack — cyan
        this.drawDevBackpackBox();
        // Item fixed positions — gold crosshairs (drag to reposition)
        this.drawDevItemHandles();
        pop();
    }

    /**
     * Draws a draggable gold crosshair for each item's fixed position.
     * Drag to move; release logs the new coordinates to the console.
     */
    drawDevItemHandles() {
        push();
        for (let [name, pos] of Object.entries(this.itemFixedPositions)) {
            // Gold crosshair — drag to reposition
            stroke(255, 200, 0, 200);
            strokeWeight(1);
            line(pos.x - 24, pos.y, pos.x + 24, pos.y);
            line(pos.x, pos.y - 24, pos.x, pos.y + 24);
            this.drawDevHandle(pos.x, pos.y, [255, 200, 0]);
            noStroke();
            fill(255, 200, 0, 220);
            textAlign(LEFT, BOTTOM);
            textSize(12);
            text(`[DEV] "${name}"  x:${round(pos.x)}  y:${round(pos.y)}`, pos.x + 12, pos.y - 2);

            // Pink resize handle — drag left/right to shrink/grow
            let sh = { x: pos.x + 28, y: pos.y + 28 };
            this.drawDevHandle(sh.x, sh.y, [255, 80, 200]);
            noStroke();
            fill(255, 80, 200, 220);
            textAlign(LEFT, TOP);
            textSize(11);
            text(`size:${(pos.size || 1.0).toFixed(2)}  <-drag->`, sh.x + 10, sh.y - 6);
        }
        pop();
    }

    /**
     * Draws a labelled, handle-equipped rectangle for a zone in dev mode.
     */
    drawDevZoneBox(zone, name, col) {
        let x = zone.left, y = zone.top;
        let w = zone.right - zone.left;
        let h = zone.bottom - zone.top;
        let cx = x + w / 2, cy = y + h / 2;
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
        this.drawDevHandle(x, y, col);
        this.drawDevHandle(x + w, y, col);
        this.drawDevHandle(x, y + h, col);
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
        this.drawDevHandle(bx, by, [255, 230, 0]);
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
        } else if (target === 'itemPos') {
            let name = this.devDrag.handle;
            let pos = this.itemFixedPositions[name];
            console.log(`[DEV] itemPos "${name}"  → x:${round(pos.x)}  y:${round(pos.y)}`);
        } else if (target === 'itemSize') {
            let name = this.devDrag.handle;
            let pos = this.itemFixedPositions[name];
            console.log(`[DEV] itemSize "${name}"  → size:${pos.size.toFixed(3)}`);
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
            let x = zone.left, y = zone.top;
            let w = zone.right - zone.left;
            let h = zone.bottom - zone.top;
            let cx = x + w / 2, cy = y + h / 2;

            if (abs(mx - cx) < HS && abs(my - cy) < HS) return { target: name, handle: 'move' };
            if (abs(mx - x) < HS && abs(my - y) < HS) return { target: name, handle: 'nw' };
            if (abs(mx - (x + w)) < HS && abs(my - y) < HS) return { target: name, handle: 'ne' };
            if (abs(mx - x) < HS && abs(my - (y + h)) < HS) return { target: name, handle: 'sw' };
            if (abs(mx - (x + w)) < HS && abs(my - (y + h)) < HS) return { target: name, handle: 'se' };
        }

        // Item fixed-position handles (gold crosshairs)
        for (let [name, pos] of Object.entries(this.itemFixedPositions)) {
            if (abs(mx - pos.x) < HS && abs(my - pos.y) < HS) {
                return { target: 'itemPos', handle: name };
            }
        }

        // Item size handles (pink squares — offset +28,+28 from crosshair)
        for (let [name, pos] of Object.entries(this.itemFixedPositions)) {
            let sh = { x: pos.x + 28, y: pos.y + 28 };
            if (abs(mx - sh.x) < HS && abs(my - sh.y) < HS) {
                return { target: 'itemSize', handle: name };
            }
        }

        // Backpack handles
        let bx = this.backpackX, by = this.backpackY;
        let hw = this.backpackW / 2, hh = this.backpackH / 2;
        if (abs(mx - bx) < HS && abs(my - by) < HS) return { target: 'backpack', handle: 'move' };
        if (abs(mx - (bx - hw)) < HS && abs(my - (by - hh)) < HS) return { target: 'backpack', handle: 'nw' };
        if (abs(mx - (bx + hw)) < HS && abs(my - (by - hh)) < HS) return { target: 'backpack', handle: 'ne' };
        if (abs(mx - (bx - hw)) < HS && abs(my - (by + hh)) < HS) return { target: 'backpack', handle: 'sw' };
        if (abs(mx - (bx + hw)) < HS && abs(my - (by + hh)) < HS) return { target: 'backpack', handle: 'se' };

        return null;
    }

    /**
     * Applies the accumulated mouse delta to the currently active dev drag target.
     */
    applyDevDrag(dx, dy) {
        let t = this.devDrag.target;
        let h = this.devDrag.handle;
        let sv = this.devDrag.startVal;

        if (t === 'itemZone' || t === 'deskZone') {
            let zone = (t === 'itemZone') ? this.itemZone : this.deskZone;
            if (h === 'move') {
                zone.left = sv.left + dx;
                zone.right = sv.right + dx;
                zone.top = sv.top + dy;
                zone.bottom = sv.bottom + dy;
            } else if (h === 'nw') { zone.left = sv.left + dx; zone.top = sv.top + dy; }
            else if (h === 'ne') { zone.right = sv.right + dx; zone.top = sv.top + dy; }
            else if (h === 'sw') { zone.left = sv.left + dx; zone.bottom = sv.bottom + dy; }
            else if (h === 'se') { zone.right = sv.right + dx; zone.bottom = sv.bottom + dy; }

        } else if (t === 'itemPos') {
            // h is the item name; move the fixed position and live-update desk display
            let pos = this.itemFixedPositions[h];
            if (pos) {
                pos.x = sv.x + dx;
                pos.y = sv.y + dy;
                let sc = this.scatteredItems.find(s => s.item.name === h);
                if (sc) { sc.x = pos.x; sc.y = pos.y; }
            }

        } else if (t === 'itemSize') {
            // h is the item name; drag right = bigger, drag left = smaller
            let pos = this.itemFixedPositions[h];
            if (pos) {
                pos.size = max(0.1, min(5.0, sv.size + dx / 120));
            }

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
     * Keyboard control for the backpack.
     * A / LEFT_ARROW  — select previous desk item
     * D / RIGHT_ARROW — select next desk item
     * ENTER / SPACE   — pack the currently focused desk item into the backpack
     * ESC             — handled by sketch.js (closes backpack)
     */
    handleKeyPress(keyCode) {
        const isConfirm = keyCode === 13 || keyCode === 32;  // ENTER or SPACE
        const isLeft    = keyCode === LEFT_ARROW || keyCode === 65;
        const isRight   = keyCode === RIGHT_ARROW || keyCode === 68;

        // Dismiss packing-done lock
        if (this._packingDoneDialogueLock && isConfirm) {
            this._packingDoneDialogueLock = false;
            this.dialogueBox.persistent  = false;
            this.dialogueBox.active      = false;
            return;
        }

        // Dismiss persistent dialogue — mirror the mouse click logic exactly
        if (this.dialogueBox && this.dialogueBox.active && this.dialogueBox.persistent) {
            if (isConfirm) {
                this.dialogueBox.persistent = false;
                this.dialogueBox.active     = false;
                if (this._day1IntroStep === 1) {
                    this._day1IntroStep = 2;
                    this.dialogueBox.persistent = true;
                    this.dialogueBox.trigger("Tip: hover over any item to see its description!", null, "IRIS");
                } else if (this._day1IntroStep === 2) {
                    this._day1IntroStep = 3;
                }
            }
            return;
        }

        // Replace dialog — LEFT/RIGHT toggle YES/NO, ENTER confirms
        if (this.showReplaceDialog) {
            if (isLeft)  this._replaceDialogFocus = 0;
            if (isRight) this._replaceDialogFocus = 1;
            if (isConfirm) {
                if (this._replaceDialogFocus === 0) {
                    this.executeReplace();
                } else {
                    this.showReplaceDialog = false;
                    this.replaceNewItem    = null;
                    this._replaceDialogFocus = 0;
                }
            }
            return;
        }

        const n = this.scatteredItems.length;
        if (n === 0) return;

        if (isLeft) {
            this.kbFocusIndex = (this.kbFocusIndex <= 0) ? n - 1 : this.kbFocusIndex - 1;
        } else if (isRight) {
            this.kbFocusIndex = (this.kbFocusIndex < 0 || this.kbFocusIndex >= n - 1) ? 0 : this.kbFocusIndex + 1;
        } else if (isConfirm && this.kbFocusIndex >= 0) {
            let s = this.scatteredItems[this.kbFocusIndex];
            if (s) {
                this.tryAddToBackpack(s.item);
                // Clamp focus index after item list may have shrunk
                const newN = this.scatteredItems.length;
                if (newN === 0) {
                    this.kbFocusIndex = -1;
                } else {
                    this.kbFocusIndex = Math.min(this.kbFocusIndex, newN - 1);
                }
            }
        }
    }

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
            if (dist(mx, my, s.x, s.y) < 100) { this.hoveredItem = i; break; }
        }
        // Mouse and keyboard are mutually exclusive — mouse hover clears keyboard focus
        if (this.hoveredItem >= 0) this.kbFocusIndex = -1;

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
        // Packing-done dialogue is locked — any click dismisses it
        if (this._packingDoneDialogueLock) {
            this._packingDoneDialogueLock = false;
            this.dialogueBox.persistent = false;
            this.dialogueBox.active = false;
            if (this.backButton.checkMouse(mx, my)) {
                this.backButton.handleClick();
            }
            return;
        }
        // Dismiss persistent dialogue on click; chain hover-hint on Day 1
        if (this.dialogueBox && this.dialogueBox.active && this.dialogueBox.persistent) {
            this.dialogueBox.persistent = false;
            this.dialogueBox.active = false;
            if (this._day1IntroStep === 1) {
                // Show hover-hint as the follow-up to the intro message
                this._day1IntroStep = 2;
                this.dialogueBox.persistent = true;
                this.dialogueBox.trigger(
                    "Tip: hover over any item to see its description!",
                    null, "IRIS"
                );
            } else if (this._day1IntroStep === 2) {
                this._day1IntroStep = 3;
            }
            return;
        }
        // Back arrow click
        if (this.backButton.checkMouse(mx, my)) {
            this.backButton.handleClick();
            return;
        }
        // ── Dev mode: check for dev handles first ─────────────────────────────
        if (developerMode && !this.showReplaceDialog) {
            let hit = this.getDevHit(mx, my);
            if (hit) {
                this.devDrag.active = true;
                this.devDrag.target = hit.target;
                this.devDrag.handle = hit.handle;
                this.devDrag.startMX = mx;
                this.devDrag.startMY = my;

                // Snapshot current values for delta-based dragging
                if (hit.target === 'itemZone') {
                    this.devDrag.startVal = { ...this.itemZone };
                } else if (hit.target === 'deskZone') {
                    this.devDrag.startVal = { ...this.deskZone };
                } else if (hit.target === 'backpack') {
                    this.devDrag.startVal = {
                        x: this.backpackX, y: this.backpackY,
                        w: this.backpackW, h: this.backpackH
                    };
                } else if (hit.target === 'itemPos') {
                    let pos = this.itemFixedPositions[hit.handle];
                    this.devDrag.startVal = { x: pos.x, y: pos.y };
                } else if (hit.target === 'itemSize') {
                    let pos = this.itemFixedPositions[hit.handle];
                    this.devDrag.startVal = { size: pos.size || 1.0 };
                }
                return;  // Don't process normal game mouse logic
            }
        }

        // ── Normal gameplay mouse handling ────────────────────────────────────
        if (this.showReplaceDialog) {
            let boxX = width / 2, boxY = height / 2;
            let btnY = boxY + 75, btnW = 120, btnH = 50;
            if (mx > boxX - 80 - btnW / 2 && mx < boxX - 80 + btnW / 2 &&
                my > btnY - btnH / 2 && my < btnY + btnH / 2) {
                this.executeReplace(); return;
            }
            if (mx > boxX + 80 - btnW / 2 && mx < boxX + 80 + btnW / 2 &&
                my > btnY - btnH / 2 && my < btnY + btnH / 2) {
                this.showReplaceDialog = false;
                this.replaceNewItem = null;
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
                    this.dragSource = 'slot';
                    this.dragIndex = i;
                    return;
                }
            }
        }

        // Drag from desk — record original position for potential snap-back
        for (let i = this.scatteredItems.length - 1; i >= 0; i--) {
            let s = this.scatteredItems[i];
            if (dist(mx, my, s.x, s.y) < 100) {
                // Block picking up greyed-out NPC items (Day 3+)
                if (currentDayID >= 3 && this._isNpcItem(s.item.name) &&
                        this._packedNpcItem !== null && s.item.name !== this._packedNpcItem) {
                    return;
                }
                this.draggedItem = s.item;
                this.dragSource = 'desk';
                this.dragIndex = i;
                this.dragStartX = s.x;
                this.dragStartY = s.y;
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
     *   - Drop on backpack image → auto-pack into an empty slot
     *   - Drop on a slot         → place directly into that slot
     *   - Anywhere else          → snap back to fixed desk position (no free reposition)
     *
     * Slot items:
     *   - Released inside top-bar area → swap if hovering another slot, else stay in original slot
     *   - Released outside top-bar     → remove from slot and snap to fixed desk position
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

        if (this.dragSource === 'desk') {
            if (this.backpackHighlight) {
                // Drop on backpack image → auto-pack
                this.tryAddToBackpack(item);
            } else if (this.hoveredSlot !== -1) {
                // Drop directly on a slot
                this.tryAddToSlot(item, this.hoveredSlot);
            }
            // Anywhere else → scatteredItems[dragIndex] keeps its fixed x/y → visual snap-back

        } else if (this.dragSource === 'slot') {
            if (this._isNearTopBar(mx, my)) {
                // In backpack panel area: swap if hovering a different slot, else snap back to original
                if (this.hoveredSlot !== -1 && this.hoveredSlot !== this.dragIndex) {
                    this.tryAddToSlot(item, this.hoveredSlot);
                }
                // hoveredSlot === dragIndex or -1 → item stays in original slot (no change needed)
            } else {
                // Released near desk → remove from slot and snap to fixed desk position
                this.topSlots[this.dragIndex] = null;
                this.addToDesk(item);
                // Binding: if a required item is dragged out, return its partner too
                let isRequired = (item.name === "UoB Student ID" || item.name === "Laptop Computer");
                if (isRequired) {
                    let partner = (item.name === "UoB Student ID") ? "Laptop Computer" : "UoB Student ID";
                    let partnerSlot = this.topSlots.indexOf(partner);
                    if (partnerSlot !== -1) {
                        this.topSlots[partnerSlot] = null;
                        this.addToDesk(this.findItemByName(partner));
                    }
                    this.showMessage("Student ID & Laptop returned to desk");
                } else {
                    this.showMessage(item.name + " returned to desk");
                }
            }
        }

        this.draggedItem = null;
        this.dragSource = null;
        this.dragIndex = -1;
    }

    // ─── ITEM LOGIC ──────────────────────────────────────────────────────────

    /**
     * Attempts to add an item to the backpack via the drop target.
     */
    tryAddToBackpack(item) {
        let isRequired = (item.name === "UoB Student ID" || item.name === "Laptop Computer");
        let npcCount = this.topSlots.filter(id => id && id !== "UoB Student ID" && id !== "Laptop Computer").length;

        if (isRequired) {
            // Pack the dragged item if not already in a slot
            if (!this.topSlots.includes(item.name)) {
                let slot = this.topSlots.indexOf(null);
                if (slot !== -1) {
                    this.topSlots[slot] = item.name;
                    this.removeFromDesk(item.name);
                }
            }
            // Binding: auto-pack the partner required item if it's still on the desk
            let partner = (item.name === "UoB Student ID") ? "Laptop Computer" : "UoB Student ID";
            let partnerOnDesk = this.scatteredItems.some(s => s.item.name === partner);
            if (partnerOnDesk && !this.topSlots.includes(partner)) {
                let slot = this.topSlots.indexOf(null);
                if (slot !== -1) {
                    this.topSlots[slot] = partner;
                    this.removeFromDesk(partner);
                }
            }
            this.showMessage("Student ID & Laptop packed!");
        } else if (npcCount >= 1) {
            // Already have a friend's gift — block and notify via dialogue
            this.dialogueBox.persistent = true;
            this.dialogueBox.trigger(
                "There's no more room in my bag! I can only bring one friend's gift to school.",
                null, "IRIS"
            );
        } else {
            let emptySlot = this.topSlots.indexOf(null);
            if (emptySlot !== -1) {
                this.topSlots[emptySlot] = item.name;
                this.removeFromDesk(item.name);
                this.showMessage(item.name + " packed!");
            }
        }
    }

    /**
     * Places an item into a specific slot, swapping the occupant back to the desk if needed.
     */
    tryAddToSlot(item, slotIndex) {
        // Guard: prevent a second NPC item from being added to an empty slot
        if (!this.topSlots[slotIndex]) {
            let isNPC = item.name !== "UoB Student ID" && item.name !== "Laptop Computer";
            let npcCount = this.topSlots.filter(id => id && id !== "UoB Student ID" && id !== "Laptop Computer").length;
            if (isNPC && npcCount >= 1) {
                this.dialogueBox.persistent = true;
                this.dialogueBox.trigger(
                    "There's no more room in my bag! I can only bring one friend's gift to school.",
                    null, "IRIS"
                );
                return;
            }
        }
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
        // Binding: if a required item was just slotted, auto-pack its partner too
        let isRequired = (item.name === "UoB Student ID" || item.name === "Laptop Computer");
        if (isRequired) {
            let partner = (item.name === "UoB Student ID") ? "Laptop Computer" : "UoB Student ID";
            let partnerOnDesk = this.scatteredItems.some(s => s.item.name === partner);
            if (partnerOnDesk && !this.topSlots.includes(partner)) {
                let slot = this.topSlots.indexOf(null);
                if (slot !== -1) {
                    this.topSlots[slot] = partner;
                    this.removeFromDesk(partner);
                }
            }
            this.showMessage("Student ID & Laptop packed!");
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
        this.showMessage("Item replaced!");
        this.showReplaceDialog = false;
        this.replaceNewItem = null;
    }

    // ─── DESK ITEM HELPERS ───────────────────────────────────────────────────

    removeFromDesk(itemName) {
        this.scatteredItems = this.scatteredItems.filter(s => s.item.name !== itemName);
    }

    addToDesk(item) {
        if (!item) return;
        // Always snap to the item's designated fixed position
        let pos = this.itemFixedPositions[item.name] ||
            { x: this.itemZone.left + 200, y: this.itemZone.top + 200, rot: 0 };
        this.scatteredItems.push({ item: item, x: pos.x, y: pos.y, rotation: pos.rot });
    }

    addToDeskAtPosition(item, _x, _y) {
        // Ignore drop coordinates — always snap to fixed position
        this.addToDesk(item);
    }

    // ─── UTILITIES ───────────────────────────────────────────────────────────

    findItemByName(name) {
        return this.inventory.items.find(item => item.name === name);
    }

    showMessage(text) {
        this.messageText = text;
        this.messageTimer = 120;
    }

    /**
     * Returns true if this item name is a friend/NPC gift (not one of the two required items).
     */
    _isNpcItem(name) {
        return name && name !== "UoB Student ID" && name !== "Laptop Computer";
    }

    /**
     * Returns the name of the first NPC item currently in a slot, or null.
     */
    _getPackedNpcItem() {
        return this.topSlots.find(n => this._isNpcItem(n)) || null;
    }

    /**
     * Returns true if both required items (Student ID and Laptop) are packed in a slot.
     */
    hasRequiredItems() {
        let hasID = this.topSlots.includes("UoB Student ID");
        let hasLaptop = this.topSlots.includes("Laptop Computer");
        return hasID && hasLaptop;
    }

    /**
     * Returns a human-readable list of which required items are still missing from the slots.
     */
    getMissingRequiredItems() {
        let missing = [];
        if (!this.topSlots.includes("UoB Student ID")) missing.push("Student ID");
        if (!this.topSlots.includes("Laptop Computer")) missing.push("Laptop");
        return missing;
    }
}
