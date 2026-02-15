// Park Street Survivor - Main Menu
// Responsibilities: All menu screen rendering, level selection, settings, and help pages.

class MainMenu {

    // ─── INITIALISATION ──────────────────────────────────────────────────────

    constructor() {
        this.menuState    = STATE_MENU;
        this.helpPage     = 0; // 0: Controls, 1: Character Wiki, 2: Buffs, 3: Hazards
        this.currentIndex = 0;

        this.timeWheel = new TimeWheel(DAYS_CONFIG);
        this.buttons   = [];
        this.setupButtons();

        this.backButton = new UIButton(80, 60, 60, 60, "BACK_ARROW", () => this.handleBackAction());
        this.bgmSlider  = new UISlider(width / 2, height / 2 - 40,  400, 0, 1, masterVolumeBGM, "BGM VOLUME");
        this.sfxSlider  = new UISlider(width / 2, height / 2 + 80, 400, 0, 1, masterVolumeSFX, "SFX VOLUME");
    }

    /**
     * Registers the three main-menu buttons (START, HELP, SETTINGS) and their transitions.
     */
    setupButtons() {
        let centerY = height - 250;
        let spacing = 320;
        this.buttons.push(new UIButton(width / 2 - spacing, centerY, 256, 96, "START", () => {
            triggerTransition(() => {
                this.menuState = STATE_LEVEL_SELECT;
                gameState.currentState = STATE_LEVEL_SELECT;
                this.timeWheel.bgAlpha = 0;
                this.timeWheel.triggerEntrance();
            });
        }));
        this.buttons.push(new UIButton(width / 2, centerY, 256, 96, "HELP", () => {
            triggerTransition(() => {
                this.menuState = STATE_HELP;
                gameState.currentState = STATE_HELP;
            });
        }));
        this.buttons.push(new UIButton(width / 2 + spacing, centerY, 256, 96, "SETTINGS", () => {
            triggerTransition(() => {
                this.menuState = STATE_SETTINGS;
                gameState.currentState = STATE_SETTINGS;
            });
        }));
    }

    // ─── DISPLAY ─────────────────────────────────────────────────────────────

    /**
     * Main display entry point — selects background and delegates to the active sub-screen.
     */
    display() {
        imageMode(CORNER);
        if (this.menuState === STATE_LEVEL_SELECT) {
            // Level select uses its own background drawn by TimeWheel
        } else if (this.menuState === STATE_SETTINGS || this.menuState === STATE_HELP) {
            if (assets && assets.otherBg) image(assets.otherBg, 0, 0, width, height);
            else background(20);
        } else {
            if (assets.menuBg) image(assets.menuBg, 0, 0, width, height);
            else background(20);
        }

        switch (this.menuState) {
            case STATE_MENU:         this.drawHomeScreen();     break;
            case STATE_LEVEL_SELECT: this.drawSelectScreen();   break;
            case STATE_SETTINGS:     this.drawSettingsScreen(); break;
            case STATE_HELP:         this.drawHelpScreen();     break;
        }

        if (this.menuState !== STATE_MENU) {
            this.backButton.isFocused = this.backButton.checkMouse(mouseX, mouseY);
            this.backButton.update();
            this.backButton.display();
        }
    }

    // ─── SCREEN RENDERERS ────────────────────────────────────────────────────

    /**
     * Renders the home screen: logo and the three main action buttons.
     */
    drawHomeScreen() {
        drawLogoPlaceholder(width / 2, 320);

        for (let i = 0; i < this.buttons.length; i++) {
            if (!globalFade.isFading && this.buttons[i].checkMouse(mouseX, mouseY)) {
                this.currentIndex = i;
            }
            this.buttons[i].isFocused = (this.currentIndex === i);
            this.buttons[i].update();
            this.buttons[i].display();
        }
    }

    /**
     * Renders the level-select screen via the TimeWheel component.
     */
    drawSelectScreen() {
        this.timeWheel.display();
        push();
        textFont(fonts.body);
        textAlign(CENTER, CENTER);
        fill(255, 150);
        textSize(20);
        text("PRESS ENTER TO START  /  ESC TO BACK", width / 2, height - 80);
        pop();
    }

    /**
     * Renders the settings screen with BGM and SFX volume sliders.
     */
    drawSettingsScreen() {
        if (assets.otherBg) {
            imageMode(CENTER);
            let scale = max(width / assets.otherBg.width, height / assets.otherBg.height);
            image(assets.otherBg, width / 2, height / 2, assets.otherBg.width * scale, assets.otherBg.height * scale);
        } else {
            background(20);
        }
        imageMode(CORNER);

        push();
        textAlign(CENTER, CENTER);
        textFont(fonts.title);
        fill(255, 215, 0);
        textSize(50);
        text("SETTINGS", width / 2, height / 2 - 180);

        this.bgmSlider.display();
        this.sfxSlider.display();
        masterVolumeBGM = this.bgmSlider.value;
        masterVolumeSFX = this.sfxSlider.value;
        if (bgm) bgm.setVolume(masterVolumeBGM);

        textFont(fonts.body);
        fill(150);
        textSize(20);
        text("PRESS ESC TO BACK", width / 2, height - 80);
        pop();
    }

    /**
     * Renders the four-page help screen:
     *   Page 0 — animated control key cards
     *   Page 1 — character wiki with unlock states
     *   Page 2 — buff item encyclopedia
     *   Page 3 — hazard item encyclopedia
     */
    drawHelpScreen() {
        push();

        // Background
        if (assets.otherBg) {
            imageMode(CENTER);
            let scale = max(width / assets.otherBg.width, height / assets.otherBg.height);
            image(assets.otherBg, width / 2, height / 2, assets.otherBg.width * scale, assets.otherBg.height * scale);
        } else {
            background(20);
        }
        imageMode(CORNER);

        // Header
        textAlign(CENTER, CENTER);
        textFont(fonts.title);
        fill(255, 215, 0);
        textSize(40);
        let titles = ["SYSTEM COMMANDS", "CHARACTER WIKI", "INTEL: BENEFICIAL", "INTEL: HAZARDS"];
        text(titles[this.helpPage], width / 2, 100);

        // Card grid layout config
        let sx = width / 2 - 470, sy = 240, cw = 460, ch = 140, gap = 20;

        // PAGE 0: Animated control key cards
        if (this.helpPage === 0) {
            let controls = [
                { id: 'move_combo', a: "MOVEMENT", d: "WASD or Arrows to navigate." },
                { id: 'enter',      a: "NEXT PAGE", d: "Cycle through system intel." },
                { id: 'space',      a: "PARKOUR",   d: "Interact during the run."    },
                { id: 'e',          a: "INTERACT",  d: "Talk to NPCs or use items."  },
                { id: 'p',          a: "PAUSE",     d: "Freeze time & system menu."  }
            ];

            controls.forEach((c, i) => {
                let x       = sx + (i % 2) * (cw + gap);
                let y       = sy + floor(i / 2) * (ch + gap);
                let isHover = (mouseX > x && mouseX < x + cw && mouseY > y && mouseY < y + ch);

                noStroke();
                fill(isHover ? 255 : 240);
                rect(x, y, cw, ch, 12);

                if (c.id === 'move_combo') {
                    // Cycle through all 8 directional keys in sequence
                    let sequence   = ['w', 'up', 'a', 'left', 's', 'down', 'd', 'right'];
                    let currentIdx = floor(frameCount / 25) % sequence.length;
                    let activeKey  = sequence[currentIdx];
                    let sheet      = assets.keys[activeKey];

                    if (sheet) {
                        let animFrame = floor(frameCount / 10) % 3;
                        let sw = sheet.width / 3;
                        let sh = sheet.height;
                        image(sheet, x + 25, y + 35, 100, 70, animFrame * sw, 0, sw, sh);
                        textAlign(CENTER, CENTER);
                        fill(100);
                        textFont(fonts.body);
                        textSize(12);
                        text(activeKey.toUpperCase(), x + 75, y + 115);
                    }
                } else {
                    // Regular functional keys (ENTER, SPACE, E, P)
                    let sheet = assets.keys[c.id];
                    if (sheet) {
                        let animFrame = floor(frameCount / 15) % 3;
                        let sw = sheet.width / 3, sh = sheet.height;
                        image(sheet, x + 25, y + 35, 100, 70, animFrame * sw, 0, sw, sh);
                    }
                }

                textAlign(LEFT, TOP);
                textFont(fonts.title); fill(20); textSize(20); text(c.a, x + 145, y + 35);
                textFont(fonts.body);  fill(80); textSize(16); text(c.d, x + 145, y + 70, cw - 165);
            });
        }
        // PAGE 1: Character wiki with per-day unlock states
        else if (this.helpPage === 1) {
            let characters = [
                { name: "IRIS",      desc: "UoB student rushing to class.", imgKey: "player",       unlockDay: 1 },
                { name: "WIOLA",     desc: "Day 1 NPC.",                    imgKey: "npc_1",        unlockDay: 1 },
                { name: "LAYLA",     desc: "Day 2 NPC.",                    imgKey: "bus_driver",   unlockDay: 2 },
                { name: "YUKI",      desc: "Day 3 NPC.",                    imgKey: "npc_promoter", unlockDay: 3 },
                { name: "RAYMOND",   desc: "Day 4 NPC.",                    imgKey: "npc_promoter", unlockDay: 4 },
                { name: "CHARLOTTE", desc: "Day 5 NPC.",                    imgKey: "npc_promoter", unlockDay: 5 }
            ];

            characters.forEach((char, i) => {
                let x          = sx + (i % 2) * (cw + gap);
                let y          = sy + floor(i / 2) * (ch + gap);
                let isUnlocked = char.unlockDay <= currentUnlockedDay;

                if (isUnlocked) {
                    noStroke(); fill(240); rect(x, y, cw, ch, 12);

                    let charImg = assets.previews[char.imgKey];
                    if (charImg) {
                        imageMode(CENTER);
                        image(charImg, x + 75, y + ch / 2, 100, 100);
                    }

                    textAlign(LEFT, TOP);
                    textFont(fonts.title); fill(20); textSize(18); text(char.name, x + 145, y + 35);
                    textFont(fonts.body);  fill(80); textSize(16); text(char.desc, x + 145, y + 70, cw - 165);
                } else {
                    // Locked state: dark card with a pulsing "LOCKED // DAY N" label
                    fill(30); noStroke(); rect(x, y, cw, ch, 12);
                    textAlign(CENTER, CENTER);
                    textFont(fonts.title);
                    let pulse = sin(frameCount * 0.1) * 30 + 80;
                    fill(pulse); textSize(18);
                    text(`LOCKED // DAY ${char.unlockDay}`, x + cw / 2, y + ch / 2);
                }
            });
        }
        // PAGE 2 & 3: Item encyclopedia (Buffs or Hazards)
        else {
            let type  = (this.helpPage === 2) ? 'BUFF' : 'HAZARD';
            let items = ITEM_WIKI.filter(item => item.type === type);

            items.forEach((item, i) => {
                let x          = sx + (i % 2) * (cw + gap);
                let y          = sy + floor(i / 2) * (ch + gap);
                let isUnlocked = item.unlockDay <= currentUnlockedDay;

                if (isUnlocked) {
                    noStroke(); fill(240); rect(x, y, cw, ch, 12);

                    if (item.imgKey) {
                        let hazardImg;
                        if (Array.isArray(item.imgKey)) {
                            // Cycle through multiple sprites for animated items
                            let animIdx = floor(frameCount / 30) % item.imgKey.length;
                            hazardImg   = assets.previews[item.imgKey[animIdx]];
                        } else {
                            hazardImg = assets.previews[item.imgKey];
                        }

                        if (hazardImg) {
                            imageMode(CENTER);
                            // Proportional scale to fit within a 100×100 preview area
                            let scale = min(100 / hazardImg.width, 100 / hazardImg.height);
                            image(hazardImg, x + 75, y + ch / 2, hazardImg.width * scale, hazardImg.height * scale);
                        }
                    }

                    textAlign(LEFT, TOP);
                    textFont(fonts.title); fill(20); textSize(18); text(item.name, x + 145, y + 40);
                    textFont(fonts.body);  fill(80); textSize(16); text(item.desc, x + 145, y + 75, cw - 165);
                } else {
                    // Locked state: dark card with a pulsing label
                    fill(30); noStroke(); rect(x, y, cw, ch, 12);
                    textAlign(CENTER, CENTER);
                    textFont(fonts.title);
                    let pulse = sin(frameCount * 0.1) * 30 + 80;
                    fill(pulse); textSize(18);
                    text(`LOCKED // DAY ${item.unlockDay}`, x + cw / 2, y + ch / 2);
                }
            });
        }

        noStroke();

        // Footer: page navigation hint
        textAlign(CENTER, CENTER);
        textFont(fonts.body);
        let footerPulse = sin(frameCount * 0.1) * 100 + 155;
        fill(255, 215, 0, footerPulse);
        const hint = (this.helpPage === 0) ? "NEXT PAGE [D] >" :
                     (this.helpPage === 3) ? "< PREV PAGE [A]" : "< [A]  NAVIGATE  [D] >";
        text(hint, width / 2, height - 120);
        fill(150); textSize(18);
        text("PRESS [ESC] TO BACK", width / 2, height - 80);
        pop();
    }

    // ─── INPUT HANDLERS ──────────────────────────────────────────────────────

    /**
     * Routes keyboard input to the correct sub-system based on the active menu state.
     */
    handleKeyPress(key, keyCode) {
        if (globalFade.isFading) return;

        if (this.menuState === STATE_HELP) {
            if ((keyCode === RIGHT_ARROW || keyCode === 68) && this.helpPage < 3) {
                playSFX(sfxSelect); this.helpPage++;
            } else if ((keyCode === LEFT_ARROW || keyCode === 65) && this.helpPage > 0) {
                playSFX(sfxSelect); this.helpPage--;
            }
        }

        if (this.menuState === STATE_MENU) {
            if (keyCode === LEFT_ARROW || keyCode === 65 || keyCode === RIGHT_ARROW || keyCode === 68) {
                playSFX(sfxSelect);
                if (keyCode === LEFT_ARROW || keyCode === 65) {
                    this.currentIndex = (this.currentIndex - 1 + 3) % 3;
                } else {
                    this.currentIndex = (this.currentIndex + 1) % 3;
                }
            } else if (keyCode === ENTER || keyCode === 13) {
                playSFX(sfxClick);
                this.buttons[this.currentIndex].handleClick();
            }
        } else if (keyCode === ESCAPE) {
            this.handleBackAction();
        }

        if (this.menuState === STATE_LEVEL_SELECT) {
            this.timeWheel.handleInput(keyCode);

            if (keyCode === ENTER || keyCode === 13) {
                let selectedDay = this.timeWheel.selectedDay;
                if (DEBUG_UNLOCK_ALL || selectedDay <= currentUnlockedDay) {
                    playSFX(sfxClick);
                    triggerTransition(() => { setupRun(selectedDay); });
                }
            }
        }
    }

    /**
     * Routes mouse click events to the relevant button or slider.
     */
    handleClick(mx, my) {
        if (globalFade.isFading) return;
        if (this.menuState === STATE_MENU) {
            for (let btn of this.buttons) if (btn.checkMouse(mx, my)) btn.handleClick();
        } else {
            if (this.backButton.checkMouse(mx, my)) this.backButton.handleClick();
            if (this.menuState === STATE_SETTINGS) {
                this.bgmSlider.handlePress(mx, my);
                this.sfxSlider.handlePress(mx, my);
            }
        }
    }

    /**
     * Releases any active slider drag on mouse up.
     */
    handleRelease() {
        if (this.menuState === STATE_SETTINGS) {
            this.bgmSlider.handleRelease();
            this.sfxSlider.handleRelease();
        }
    }

    /**
     * Navigates back to the previous screen.
     * If accessed from the pause menu, returns to the pause overlay instead of the main menu.
     */
    handleBackAction() {
        if (globalFade.isFading) return;
        playSFX(sfxClick);

        if (typeof pauseFromState !== 'undefined' && pauseFromState !== null) {
            // Return to pause overlay and restore the correct resume target.
            // setState(PAUSED) would overwrite previousState with STATE_HELP,
            // so we manually restore it to the actual gameplay state we came from.
            gameState.setState(STATE_PAUSED);
            gameState.previousState = pauseFromState;
            this.helpPage = 0;
        } else {
            triggerTransition(() => {
                this.menuState         = STATE_MENU;
                gameState.currentState = STATE_MENU;
                this.helpPage          = 0;
            });
        }
    }
}
