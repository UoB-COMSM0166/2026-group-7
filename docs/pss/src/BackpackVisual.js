// Park Street Survivor - Backpack Visual
// Responsibilities: Drag-and-drop inventory UI, slot management, tooltips, and item-swap dialogs.

class BackpackVisual {

    constructor(inventorySystem, roomScene) {
        this.inventory = inventorySystem;
        this.room = roomScene;

        // ── BACKPACK SLOT PANEL (top of screen) ───────────────────────────────
        // ← adjust topBarY to move the panel up/down
        this.topBarX = width / 2;
        this.topBarY = 145;     // ← panel centre Y (near top)
        this.topBarW = 420;     // ← width: side margins ≈ bottom margin
        this.topBarH = 260;     // ← height: title + label + slots all inside with breathing room
        // two essential one(computer + student card) + at most one npc utility
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
            gameState.setState(STATE_ROOM);
            if (typeof loop === 'function') loop();
        });
    }

    /** Resets packed slots and re-scatters desk items for a new day. */
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

    /** Clears active dialogue and locks so they don't persist across re-entries. */
    onClose() {
        this._packingDoneDialogueLock = false;
        this.kbFocusIndex             = -1;
        this._replaceDialogFocus      = 0;
        this.dialogueBox.reset();
    }

    /** Exports slot occupancy for save/restore (desk items are reconstructed from slots). */
    exportState() {
        return {
            topSlots: Array.isArray(this.topSlots) ? this.topSlots.slice() : [null, null, null],
            day1IntroStep: this._day1IntroStep,
            day2GummyHintDone: this._day2GummyHintDone,
            packingDoneMsgDone: this._packingDoneMsgDone,
            packedNpcItem: this._packedNpcItem,
            npcSlotHintShown: this._npcSlotHintShown
        };
    }

    importState(state) {
        if (!state || !Array.isArray(state.topSlots)) return;
        this.topSlots = state.topSlots.slice(0, 3);
        while (this.topSlots.length < 3) this.topSlots.push(null);
        this._day1IntroStep = Number.isFinite(Number(state.day1IntroStep)) ? Number(state.day1IntroStep) : this._day1IntroStep;
        this._day2GummyHintDone = !!state.day2GummyHintDone;
        this._packingDoneMsgDone = !!state.packingDoneMsgDone;
        this._packedNpcItem = state.packedNpcItem || null;
        this._npcSlotHintShown = !!state.npcSlotHintShown;
        this._packingDoneDialogueLock = false;
        this.dialogueBox.reset();
        this.initScatteredItems();
    }

    /** Populates the desk with day-appropriate items, excluding those already slotted. */
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

    /** Returns inventory items unlocked on or before the given day. */
    // as the story line + weather change
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

    /** Returns the item name first introduced on the given day, or null for Day 1. */
    _getNewItemName(day) {
        if (day === 2) return "Soft Gummy Vitamins";
        if (day === 3) return "Tangle";
        if (day === 4) return "Headphones";
        if (day === 5) return "Rain Boots";
        return null;
    }

    /**
     * Animates a ghost item sliding toward the backpack to hint at dragging.
     * Alternates between Student ID and Laptop while both are unpacked; dismisses once both are packed.
     * Only active on Day 1.
     */
    drawDragTutorial() {
        if (!this.showDragTutorial) return;

        if (this.hasRequiredItems()) {
            this.showDragTutorial = false;
            return;
        }

        if (this.draggedItem) return;

        let needsID     = !this.topSlots.includes("UoB Student ID");
        let needsLaptop = !this.topSlots.includes("Laptop Computer");

        // Restart on change so the next ghost begins a clean animation rather than mid-slide.
        if (needsID !== this._tutNeedsID || needsLaptop !== this._tutNeedsLaptop) {
            this.tutorialAnimT   = 0;
            this._tutNeedsID     = needsID;
            this._tutNeedsLaptop = needsLaptop;
        }

        const CYCLE = 130;
        const MOVE  = 90;
        const TOTAL = (needsID && needsLaptop) ? CYCLE * 2 : CYCLE;

        this.tutorialAnimT = (this.tutorialAnimT + 1) % TOTAL;

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

        let alpha;
        if      (t < 0.12) alpha = map(t, 0,    0.12, 0,   210);
        else if (t < 0.75) alpha = 210;
        else               alpha = map(t, 0.75, 1.0,  210, 0);

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

    display() {
        this.shimmer = (this.shimmer + 1) % 360;

        // Bubble pop-in: reset on new hover target; keyboard focus is fallback hover source.
        const _activeItem = this.hoveredItem >= 0 ? this.hoveredItem : this.kbFocusIndex;
        const _hk = _activeItem >= 0 ? 'd' + _activeItem :
                    this.hoveredSlot >= 0 ? 's' + this.hoveredSlot : null;
        if (_hk !== this._prevHoverKey) { this.bubbleAnimT = 0; this._prevHoverKey = _hk; }
        if (_hk !== null && this.bubbleAnimT < 1) this.bubbleAnimT = Math.min(1, this.bubbleAnimT + 0.055);

        if (currentDayID === 1 && this._day1IntroStep === 0) {
            this._day1IntroStep = 1;
            this.dialogueBox.persistent = true;
            this.dialogueBox.trigger(
                "Every day I need to bring my Student ID and Laptop — they're essential! Drag them into my backpack to get ready.",
                null, "IRIS"
            );
        }

        if (currentDayID === 2 && !this._day2GummyHintDone) {
            this._day2GummyHintDone = true;
            this.dialogueBox.persistent = true;
            this.dialogueBox.trigger(
                "Wiola's gummies are here too... maybe I should bring some!",
                null, "IRIS"
            );
        }

        if (currentDayID >= 3 && !this._npcSlotHintShown) {
            this._npcSlotHintShown = true;
            this.dialogueBox.persistent = true;
            this.dialogueBox.trigger(
                "Tap the pause button to open the Help page and see what each item does — then decide what to bring!",
                null, "IRIS"
            );
        }

        if (currentDayID >= 3) {
            this._packedNpcItem = this._getPackedNpcItem();
        }

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
        // Mouse hover takes priority for tooltip; keyboard focus is fallback
        const _tooltipIdx = (this.hoveredItem >= 0 && !this.draggedItem) ? this.hoveredItem
                          : (this.kbFocusIndex >= 0 && !this.draggedItem) ? this.kbFocusIndex : -1;
        if (_tooltipIdx >= 0) {
            let s = this.scatteredItems[_tooltipIdx];
            if (s && !(this.dragSource === 'desk' && this.dragIndex === _tooltipIdx)) {
                this.drawTooltip(s.item, s.x, s.y);
            }
        }
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
        if (developerMode) this.drawDevOverlays();
        this.dialogueBox.display();

        pop();
    }

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

    drawTopBar() {
        push();
        let cx = this.topBarX;
        let cy = this.topBarY;
        let bw = this.topBarW;
        let bh = this.topBarH;
        let pulse = sin(radians(this.shimmer)) * 0.5 + 0.5;  // 0–1 pulsing value

        rectMode(CENTER);
        fill(22, 10, 48, 235);
        stroke(160, 90, 255, 220);
        strokeWeight(2.5);
        rect(cx, cy, bw, bh, 16);

        noFill();
        stroke(200, 140, 255, 35 + pulse * 25);
        strokeWeight(1);
        rect(cx, cy, bw - 10, bh - 10, 12);

        textAlign(CENTER, CENTER);
        noStroke();
        textFont(fonts.title);
        textSize(28);
        fill(255, 215, 0);
        text("BACKPACK", cx, cy - 78);

        textFont(fonts.body);
        textSize(22);
        fill(255, 215, 0);
        text("ONE friend's gift allowed per run", cx, cy - 42);

        stroke(150, 80, 230, 80 + pulse * 30);
        strokeWeight(1);
        line(cx - bw / 2 + 30, cy - 20, cx + bw / 2 - 30, cy - 20);

        let startX = cx - (3 * this.slotSize + 2 * this.slotSpacing) / 2;
        for (let i = 0; i < 3; i++) {
            let sx = startX + i * (this.slotSize + this.slotSpacing) + this.slotSize / 2;
            let sy = cy + 45;  // 11px gap below divider, 35px padding at bottom
            let isHovered = (this.hoveredSlot === i);
            let filled = !!this.topSlots[i];

            if (isHovered) {
                noFill();
                stroke(170, 90, 255, 50 + pulse * 30);
                strokeWeight(12);
                rect(sx, sy, this.slotSize, this.slotSize, 14);
                stroke(170, 90, 255, 80 + pulse * 40);
                strokeWeight(5);
                rect(sx, sy, this.slotSize, this.slotSize, 14);
            }

            rectMode(CENTER);
            fill(filled ? color(42, 12, 75, 230) : color(15, 6, 32, 210));
            stroke(filled
                ? (isHovered ? color(190, 110, 255, 255) : color(130, 65, 210, 220))
                : color(90, 45, 155, 160));
            strokeWeight(filled ? (isHovered ? 2.5 : 2) : 1.5);
            if (!filled) drawingContext.setLineDash([6, 5]);
            rect(sx, sy, this.slotSize, this.slotSize, 14);
            drawingContext.setLineDash([]);

            if (filled) {
                noFill();
                stroke(180, 110, 255, 40 + pulse * 20);
                strokeWeight(1);
                rect(sx, sy, this.slotSize - 8, this.slotSize - 8, 11);
            }

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
                textSize(28);
                fill(110, 55, 180, 90 + pulse * 30);
                noStroke();
                textAlign(CENTER, CENTER);
                text("◇", sx, sy + 1);
            }
        }
        pop();
    }

    _getItemImage(itemName) {
        if (itemName === "UoB Student ID" && assets.studentCardImg) return assets.studentCardImg;
        if (itemName === "Laptop Computer" && assets.computerImg) return assets.computerImg;
        if (itemName === "Soft Gummy Vitamins" && assets.vitaminImg) return assets.vitaminImg;
        if (itemName === "Tangle" && assets.tangleImg) return assets.tangleImg;
        if (itemName === "Headphones" && assets.headphoneImg) return assets.headphoneImg;
        if (itemName === "Rain Boots" && assets.rainbootImg) return assets.rainbootImg;
        return null;
    }

    _drawImageAspect(img, cx, cy, maxW, maxH) {
        let scale = min(maxW / img.width, maxH / img.height);
        imageMode(CENTER);
        image(img, cx, cy, img.width * scale, img.height * scale);
    }

    /** Returns the collision radius for overlap detection; smaller than visual footprint intentionally. */
    _getItemRadius(itemName) {
        if (itemName === "Laptop Computer") return 150;
        if (itemName === "UoB Student ID") return 100;
        return 60; // emoji-based items
    }

    /** Returns true if (mx, my) is within the backpack slot panel area. */
    _isNearTopBar(mx, my) {
        let hw = this.topBarW / 2 + 60;
        let hh = this.topBarH / 2 + 30;
        return (mx > this.topBarX - hw && mx < this.topBarX + hw &&
            my > this.topBarY - hh && my < this.topBarY + hh);
    }

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

    drawScatteredItems() {
        this.scatteredItems.forEach((scattered, i) => {
            if (this.dragSource === 'desk' && this.dragIndex === i) return;

            push();
            translate(scattered.x, scattered.y);
            rotate(radians(scattered.rotation));
            if (this.kbFocusIndex === i && !this.draggedItem) {
                let breathe = 1.0 + sin(frameCount * 0.09) * 0.14;
                scale(breathe);
            } else if (scattered.item.name === this._getNewItemName(currentDayID)) {
                let breathe = 1.0 + sin(frameCount * 0.06) * 0.10;
                scale(breathe);
            }
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

        });
    }

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
     * Renders a speech-bubble tooltip at (tx, ty).
     * flipH mirrors horizontally (tail at bottom-right); rotate180 rotates 180° (used for Laptop).
     * S is the square render size, determined by drawTooltip based on text length.
     */
    _drawTooltipBox(tx, ty, title, desc, S, flipH = false, rotate180 = false, cXAdjust = 0, cYAdjust = 0) {
        // Only show the character's inner thought (first part, before \n)
        const descShow = desc ? desc.split('\n')[0] : '';

        const t        = Math.min(this.bubbleAnimT, 1);
        const eased    = 1 - Math.pow(1 - t, 3);   // ease-out cubic
        const frameIdx = Math.min(6, Math.floor(t * 7));
        const frameX   = frameIdx * 740;

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
                translate(S / 2, S / 2);
                scale(-1, -1);
                translate(-S / 2, -S / 2);
            } else if (flipH) {
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

        // Text region in local coords (after anchor transforms); offsets derived from 740px sprite.
        const cX = (rotate180 ? Math.round(S *  68 / 740)
                 : flipH     ? Math.round(S *  80 / 740)
                 :              Math.round(S * 168 / 740)) + cXAdjust;
        const cY = (rotate180 ? Math.round(S * 140 / 740)
                 :              Math.round(S * 170 / 740)) + cYAdjust;
        const cW = flipH     ? Math.round(S * 450 / 740)
                 :              Math.round(S * 504 / 740);

        const titleSize = 52;
        const descSize  = 42;

        if (this.bubbleAnimT >= 1) {
            noStroke();
            textFont(fonts.body);
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

        // Conservative char-width estimates for the game font at fixed sizes 52/42.
        const REF_CW   = Math.round(500 * 504 / 740);
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
        // cXAdjust: fine-tune text centre within each variant's cloud region.
        // cYAdjust: rotated laptop cloud needs extra downward shift.
        const cXAdjust = item.name === "UoB Student ID"  ? 0
                       : item.name === "Laptop Computer" ? -Math.round(S * 14 / 740)
                       : Math.round(S * 16 / 740);
        const cYAdjust = rotate180 ? Math.round(S * 104 / 740) : 0;
        this._drawTooltipBox(tx, ty, item.name, item.description || "", S, flipH, rotate180, cXAdjust, cYAdjust);
    }

    drawSlotTooltip(item, slotX, slotY) {
        const S = 500;
        const tx = constrain(slotX - Math.round(S * 0.15), 10, width - S - 10);
        const ty = constrain(slotY + this.slotSize / 2 + 10, 10, height - S - 10);
        this._drawTooltipBox(tx, ty, item.name, item.description || "", true);
    }

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

        push();
        translate(boxX - 80, btnY);
        if (yesHover) scale(1.08);
        imageMode(CENTER);
        if (assets && assets.btnImg) image(assets.btnImg, 0, 0, btnW * 2, btnH * 2);
        else { fill(60, 180, 60); rectMode(CENTER); rect(0, 0, btnW, btnH, 8); }
        noStroke(); fill(255, 215, 0); textSize(20); textAlign(CENTER, CENTER);
        text("YES", 0, -4);
        pop();

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

    /** Draws a pulsing ring and label around the back button to guide the player. */
    _drawBackButtonArrow() {
        let pulse = (sin(frameCount * 0.08) + 1) * 0.5;
        let bx = this.backButton.x, by = this.backButton.y;
        push();
        noFill();
        stroke(255, 215, 0, 140 + pulse * 115);
        strokeWeight(3 + pulse * 1.5);
        ellipseMode(CENTER);
        circle(bx, by, 90 + pulse * 12);
        noStroke();
        fill(255, 215, 0, 160 + pulse * 95);
        let fB = (typeof fonts !== 'undefined') ? (fonts.body || fonts.title) : null;
        if (fB) textFont(fB);
        textSize(17);
        textAlign(CENTER, TOP);
        text("CLOSE BAG", bx, by + 48);
        pop();
    }

    /** Draws interactive debug overlays (drag centre to move, corners to resize, release to log). */
    drawDevOverlays() {
        push();
        this.drawDevZoneBox(this.deskZone, 'deskZone', [60, 160, 255]);
        this.drawDevZoneBox(this.itemZone, 'itemZone', [255, 80, 80]);
        this.drawDevBackpackBox();
        this.drawDevItemHandles();
        pop();
    }

    drawDevItemHandles() {
        push();
        for (let [name, pos] of Object.entries(this.itemFixedPositions)) {
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

        fill(r, g, b, 220);
        noStroke();
        textAlign(LEFT, TOP);
        textSize(13);
        text(`[DEV] ${name}  left:${round(zone.left)}  right:${round(zone.right)}  top:${round(zone.top)}  bottom:${round(zone.bottom)}`,
            x + 8, y + 6);

        this.drawDevHandle(cx, cy, [255, 230, 0]);
        this.drawDevHandle(x, y, col);
        this.drawDevHandle(x + w, y, col);
        this.drawDevHandle(x, y + h, col);
        this.drawDevHandle(x + w, y + h, col);
        pop();
    }

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

        fill(0, 230, 200, 220);
        noStroke();
        textAlign(CENTER, BOTTOM);
        textSize(13);
        text(`[DEV] backpack  x:${round(bx)}  y:${round(by)}  w:${round(this.backpackW)}  h:${round(this.backpackH)}`,
            bx, by - hh - 4);

        this.drawDevHandle(bx, by, [255, 230, 0]);
        this.drawDevHandle(bx - hw, by - hh, [0, 230, 200]);
        this.drawDevHandle(bx + hw, by - hh, [0, 230, 200]);
        this.drawDevHandle(bx - hw, by + hh, [0, 230, 200]);
        this.drawDevHandle(bx + hw, by + hh, [0, 230, 200]);
        pop();
    }

    drawDevHandle(x, y, col) {
        push();
        rectMode(CENTER);
        fill(col[0], col[1], col[2], 210);
        stroke(255, 255, 255, 200);
        strokeWeight(1.5);
        rect(x, y, 16, 16, 3);
        pop();
    }

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

    /** Returns a hit descriptor { target, handle } for the dev handle under (mx, my), or null. */
    getDevHit(mx, my) {
        const HS = 12;

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

        for (let [name, pos] of Object.entries(this.itemFixedPositions)) {
            if (abs(mx - pos.x) < HS && abs(my - pos.y) < HS) {
                return { target: 'itemPos', handle: name };
            }
        }

        // Pink size handles are offset +28,+28 from the crosshair
        for (let [name, pos] of Object.entries(this.itemFixedPositions)) {
            let sh = { x: pos.x + 28, y: pos.y + 28 };
            if (abs(mx - sh.x) < HS && abs(my - sh.y) < HS) {
                return { target: 'itemSize', handle: name };
            }
        }

        let bx = this.backpackX, by = this.backpackY;
        let hw = this.backpackW / 2, hh = this.backpackH / 2;
        if (abs(mx - bx) < HS && abs(my - by) < HS) return { target: 'backpack', handle: 'move' };
        if (abs(mx - (bx - hw)) < HS && abs(my - (by - hh)) < HS) return { target: 'backpack', handle: 'nw' };
        if (abs(mx - (bx + hw)) < HS && abs(my - (by - hh)) < HS) return { target: 'backpack', handle: 'ne' };
        if (abs(mx - (bx - hw)) < HS && abs(my - (by + hh)) < HS) return { target: 'backpack', handle: 'sw' };
        if (abs(mx - (bx + hw)) < HS && abs(my - (by + hh)) < HS) return { target: 'backpack', handle: 'se' };

        return null;
    }

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
            let pos = this.itemFixedPositions[h];
            if (pos) {
                pos.x = sv.x + dx;
                pos.y = sv.y + dy;
                let sc = this.scatteredItems.find(s => s.item.name === h);
                if (sc) { sc.x = pos.x; sc.y = pos.y; }
            }

        } else if (t === 'itemSize') {
            let pos = this.itemFixedPositions[h];
            if (pos) {
                pos.size = max(0.1, min(5.0, sv.size + dx / 120));
            }

        } else if (t === 'backpack') {
            if (h === 'move') {
                this.backpackX = sv.x + dx;
                this.backpackY = sv.y + dy;
            } else {
                let hw = sv.w / 2, hh = sv.h / 2;
                let fixX = (h === 'nw' || h === 'sw') ? sv.x + hw : sv.x - hw;
                let fixY = (h === 'nw' || h === 'ne') ? sv.y + hh : sv.y - hh;
                let dragX = (h === 'nw' || h === 'sw') ? sv.x - hw + dx : sv.x + hw + dx;
                let dragY = (h === 'nw' || h === 'ne') ? sv.y - hh + dy : sv.y + hh + dy;

                this.backpackX = (fixX + dragX) / 2;
                this.backpackY = (fixY + dragY) / 2;
                this.backpackW = max(60, abs(fixX - dragX));
                this.backpackH = max(60, abs(fixY - dragY));
            }
        }
    }

    /**
     * Keyboard control: A/LEFT selects previous item, D/RIGHT selects next,
     * ENTER/SPACE packs the focused item. ESC is handled by sketch.js.
     */
    handleKeyPress(keyCode) {
        const isConfirm = keyCode === 13 || keyCode === 32;  // ENTER or SPACE
        const isLeft    = keyCode === LEFT_ARROW || keyCode === 65;
        const isRight   = keyCode === RIGHT_ARROW || keyCode === 68;

        if (this._packingDoneDialogueLock && isConfirm) {
            this._packingDoneDialogueLock = false;
            this.dialogueBox.persistent  = false;
            this.dialogueBox.active      = false;
            return;
        }

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

    handleMouseMoved(mx, my) {
        this.backpackHighlight = (
            mx > this.backpackX - this.backpackW / 2 && mx < this.backpackX + this.backpackW / 2 &&
            my > this.backpackY - this.backpackH / 2 && my < this.backpackY + this.backpackH / 2
        );

        this.hoveredItem = -1;
        for (let i = 0; i < this.scatteredItems.length; i++) {
            if (this.dragSource === 'desk' && this.dragIndex === i) continue;
            let s = this.scatteredItems[i];
            if (dist(mx, my, s.x, s.y) < 100) { this.hoveredItem = i; break; }
        }
        if (this.hoveredItem >= 0) this.kbFocusIndex = -1;

        this.hoveredSlot = -1;
        let startX = this.topBarX - (3 * this.slotSize + 2 * this.slotSpacing) / 2;
        for (let i = 0; i < 3; i++) {
            let x = startX + i * (this.slotSize + this.slotSpacing) + this.slotSize / 2;
            let y = this.topBarY + 45;
            if (dist(mx, my, x, y) < this.slotSize / 2) { this.hoveredSlot = i; break; }
        }
    }

    /** Initiates drag from a slot or desk item; in dev mode checks handles first. */
    handleMousePressed(mx, my) {
        if (this._packingDoneDialogueLock) {
            this._packingDoneDialogueLock = false;
            this.dialogueBox.persistent = false;
            this.dialogueBox.active = false;
            if (this.backButton.checkMouse(mx, my)) {
                this.backButton.handleClick();
            }
            return;
        }
        if (this.dialogueBox && this.dialogueBox.active && this.dialogueBox.persistent) {
            this.dialogueBox.persistent = false;
            this.dialogueBox.active = false;
            if (this._day1IntroStep === 1) {
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
        if (this.backButton.checkMouse(mx, my)) {
            this.backButton.handleClick();
            return;
        }
        if (developerMode && !this.showReplaceDialog) {
            let hit = this.getDevHit(mx, my);
            if (hit) {
                this.devDrag.active = true;
                this.devDrag.target = hit.target;
                this.devDrag.handle = hit.handle;
                this.devDrag.startMX = mx;
                this.devDrag.startMY = my;

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
                return;
            }
        }

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
                if (typeof pauseIndex !== 'undefined') pauseIndex = -1;
                return;
            }
            return;
        }

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

        for (let i = this.scatteredItems.length - 1; i >= 0; i--) {
            let s = this.scatteredItems[i];
            if (dist(mx, my, s.x, s.y) < 100) {
                // Block greyed-out NPC items (only one NPC item allowed, Day 3+)
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
     * Resolves drag: desk items auto-pack into backpack or slot, or snap back.
     * Slot items swap with hovered slot or return to desk when released outside the panel.
     */
    handleMouseReleased(mx, my) {
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
                this.tryAddToBackpack(item);
            } else if (this.hoveredSlot !== -1) {
                this.tryAddToSlot(item, this.hoveredSlot);
            }
            // Anywhere else → item snaps back via fixed x/y in scatteredItems

        } else if (this.dragSource === 'slot') {
            if (this._isNearTopBar(mx, my)) {
                if (this.hoveredSlot !== -1 && this.hoveredSlot !== this.dragIndex) {
                    this.tryAddToSlot(item, this.hoveredSlot);
                }
            } else {
                this.topSlots[this.dragIndex] = null;
                this.addToDesk(item);
                // Required items: return partner to desk too (they are always packed together)
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

    tryAddToBackpack(item) {
        let isRequired = (item.name === "UoB Student ID" || item.name === "Laptop Computer");
        let npcCount = this.topSlots.filter(id => id && id !== "UoB Student ID" && id !== "Laptop Computer").length;

        if (isRequired) {
            if (!this.topSlots.includes(item.name)) {
                let slot = this.topSlots.indexOf(null);
                if (slot !== -1) {
                    this.topSlots[slot] = item.name;
                    this.removeFromDesk(item.name);
                }
            }
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

    /** Places an item into a specific slot, swapping any occupant back to the desk. */
    tryAddToSlot(item, slotIndex) {
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

    removeFromDesk(itemName) {
        this.scatteredItems = this.scatteredItems.filter(s => s.item.name !== itemName);
    }

    addToDesk(item) {
        if (!item) return;
        let pos = this.itemFixedPositions[item.name] ||
            { x: this.itemZone.left + 200, y: this.itemZone.top + 200, rot: 0 };
        this.scatteredItems.push({ item: item, x: pos.x, y: pos.y, rotation: pos.rot });
    }

    addToDeskAtPosition(item, _x, _y) {
        this.addToDesk(item);
    }

    findItemByName(name) {
        return this.inventory.items.find(item => item.name === name);
    }

    showMessage(text) {
        this.messageText = text;
        this.messageTimer = 120;
    }

    /** Returns true if the item is a friend's gift (not one of the two required items). */
    _isNpcItem(name) {
        return name && name !== "UoB Student ID" && name !== "Laptop Computer";
    }

    _getPackedNpcItem() {
        return this.topSlots.find(n => this._isNpcItem(n)) || null;
    }

    hasRequiredItems() {
        let hasID = this.topSlots.includes("UoB Student ID");
        let hasLaptop = this.topSlots.includes("Laptop Computer");
        return hasID && hasLaptop;
    }

    getMissingRequiredItems() {
        let missing = [];
        if (!this.topSlots.includes("UoB Student ID")) missing.push("Student ID");
        if (!this.topSlots.includes("Laptop Computer")) missing.push("Laptop");
        return missing;
    }
}
