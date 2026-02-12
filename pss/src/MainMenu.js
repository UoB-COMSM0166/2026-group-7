// Main Menu (Flattened Logic Version)
// Optimized for: Pixel-art independent keys, combo animations, and minimalist locked states.

class MainMenu {
    constructor() {
        this.menuState = "HOME"; 
        this.helpPage = 0; // 0: CONTROLS, 1: BUFFS, 2: HAZARDS
        this.currentIndex = 0; 
        
        this.timeWheel = new TimeWheel(DAYS_CONFIG);
        this.buttons = [];
        this.setupButtons();

        this.backButton = new UIButton(80, 60, 60, 60, "BACK_ARROW", () => this.handleBackAction());
        this.bgmSlider = new UISlider(width / 2, height / 2 - 40, 400, 0, 1, masterVolumeBGM, "BGM VOLUME");
        this.sfxSlider = new UISlider(width / 2, height / 2 + 80, 400, 0, 1, masterVolumeSFX, "SFX VOLUME");
    }

    handleBackAction() {
        if (globalFade.isFading) return; 
        playSFX(sfxClick); 
        triggerTransition(() => {
            this.menuState = "HOME";
            this.helpPage = 0; 
        }); 
    }

    setupButtons() {
        let centerY = height - 250; 
        let spacing = 320; 
        this.buttons.push(new UIButton(width/2 - spacing, centerY, 256, 96, "START", () => {
            triggerTransition(() => { this.menuState = "SELECT"; });
        }));
        this.buttons.push(new UIButton(width/2, centerY, 256, 96, "HELP", () => {
            triggerTransition(() => { this.menuState = "HELP"; });
        }));
        this.buttons.push(new UIButton(width/2 + spacing, centerY, 256, 96, "SETTINGS", () => {
            triggerTransition(() => { this.menuState = "SETTINGS"; });
        }));
    }

    display() {
        if (assets.menuBg) image(assets.menuBg, 0, 0, width, height);
        else background(20); 

        switch(this.menuState) {
            case "HOME":     this.drawHomeScreen(); break;
            case "SELECT":   this.drawSelectScreen(); break;
            case "SETTINGS": this.drawSettingsScreen(); break;
            case "HELP":     this.drawHelpScreen(); break;
        }

        if (this.menuState !== "HOME") {
            this.backButton.isFocused = this.backButton.checkMouse(mouseX, mouseY);
            this.backButton.update();
            this.backButton.display();
        }
    }

    drawHomeScreen() {
        drawLogoPlaceholder(width/2, 320);
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
     * FULLY EXPANDED HELP SCREEN
     * Features: Combo animations for WASD/Arrows, Sprite Sheet playback, and Clean Locked states.
     */
    drawHelpScreen() {
        push();
        fill(10, 10, 15, 245); 
        rectMode(CORNER);
        rect(0, 0, width, height);

        // 1. HEADER
        textAlign(CENTER, CENTER);
        textFont(fonts.title);
        fill(255, 215, 0);
        textSize(40);
        let titles = ["SYSTEM COMMANDS", "INTEL: BENEFICIAL", "INTEL: HAZARDS"];
        text(titles[this.helpPage], width / 2, 100);

        // 2. GRID CONFIG
        let sx = width / 2 - 470, sy = 240, cw = 460, ch = 140, gap = 20;

        // --- PAGE 0: ANIMATED CONTROLS (COMBO MODE) ---
        if (this.helpPage === 0) {
            let controls = [
                { id: 'move_combo', a: "MOVEMENT", d: "WASD or Arrows to navigate." },
                { id: 'enter',      a: "NEXT PAGE", d: "Cycle through system intel." },
                { id: 'space',      a: "PARKOUR",  d: "Interact during the run." },
                { id: 'e',          a: "INTERACT", d: "Talk to NPCs or use items." },
                { id: 'p',          a: "PAUSE",    d: "Freeze time & system menu." }
            ];
            
            controls.forEach((c, i) => {
                let x = sx + (i % 2) * (cw + gap);
                let y = sy + floor(i / 2) * (ch + gap);
                let isHover = (mouseX > x && mouseX < x + cw && mouseY > y && mouseY < y + ch);

                // Card Base
                noStroke(); 
                fill(isHover ? 255 : 240);
                rect(x, y, cw, ch, 12);

                // --- SPRITE ANIMATION LOGIC ---
                if (c.id === 'move_combo') {
                    // Combo Sequence: W -> UP -> A -> LEFT -> S -> DOWN -> D -> RIGHT
                    let sequence = ['w', 'up', 'a', 'left', 's', 'down', 'd', 'right']; 
                    let currentIdx = floor(frameCount / 25) % sequence.length; 
                    let activeKey = sequence[currentIdx];
                    let sheet = assets.keys[activeKey];

                    if (sheet) {
                        let animFrame = floor(frameCount / 10) % 3; // Pixel animation (Press/Release)
                        let sw = sheet.width / 3;
                        let sh = sheet.height;
                        image(sheet, x + 25, y + 35, 100, 70, animFrame * sw, 0, sw, sh);
                        
                        // Small text indicator
                        textAlign(CENTER, CENTER); fill(100); textFont(fonts.body); textSize(12);
                        text(activeKey.toUpperCase(), x + 75, y + 115);
                    }
                } else {
                    // Regular functional keys (ENTER, SPACE, etc.)
                    let sheet = assets.keys[c.id];
                    if (sheet) {
                        let animFrame = floor(frameCount / 15) % 3;
                        let sw = sheet.width / 3, sh = sheet.height;
                        image(sheet, x + 25, y + 35, 100, 70, animFrame * sw, 0, sw, sh);
                    }
                }

                // Text Info
                textAlign(LEFT, TOP);
                textFont(fonts.title); fill(20); textSize(20); text(c.a, x + 145, y + 35);
                textFont(fonts.body); fill(80); textSize(16);
                text(c.d, x + 145, y + 70, cw - 165);

                if (isHover) {
                    stroke(255, 215, 0); strokeWeight(3); noFill();
                    rect(x, y, cw, ch, 12);
                }
            });
        } 
        // --- PAGE 1 & 2: MINIMALIST LOCKED WIKI ---
        else {
            let type = (this.helpPage === 1) ? 'BUFF' : 'HAZARD';
            let items = ITEM_WIKI.filter(item => item.type === type);
            
            items.forEach((item, i) => {
                let x = sx + (i % 2) * (cw + gap);
                let y = sy + floor(i / 2) * (ch + gap);
                let isUnlocked = item.unlockDay <= currentDayID;

                if (isUnlocked) {
                    noStroke(); fill(240); rect(x, y, cw, ch, 12);
                    textAlign(CENTER, CENTER); fill(30); textSize(50); 
                    text(item.icon, x + 75, y + ch / 2);
                    textAlign(LEFT, TOP); textFont(fonts.title); fill(20); textSize(18); 
                    text(item.name, x + 145, y + 40);
                    textFont(fonts.body); fill(80); textSize(16); 
                    text(item.desc, x + 145, y + 75, cw - 165);
                } else {
                    // Minimalist Locked State: Just the "LOCKED" status
                    fill(30); noStroke(); rect(x, y, cw, ch, 12);
                    textAlign(CENTER, CENTER); textFont(fonts.title);
                    let pulse = sin(frameCount * 0.1) * 30 + 80; 
                    fill(pulse); 
                    textSize(18); 
                    text(`LOCKED // DAY ${item.unlockDay}`, x + cw/2, y + ch/2);
                }
            });
        }

        // FOOTER (Hinting at ESC since it's not in the grid)
        textAlign(CENTER, CENTER);
        textFont(fonts.body);
        let footerPulse = sin(frameCount * 0.1) * 100 + 155;
        fill(255, 215, 0, footerPulse);
        const hint = (this.helpPage === 0) ? "NEXT PAGE [D] >" : (this.helpPage === 2) ? "< PREV PAGE [A]" : "< [A]  NAVIGATE  [D] >";
        text(hint, width / 2, height - 120);
        fill(150); textSize(18);
        text("SYSTEM CONNECTED  |  PRESS [ESC] TO DISCONNECT", width / 2, height - 80);
        pop();
    }

    drawSelectScreen() {
        this.timeWheel.display();
        push(); textFont(fonts.body); textAlign(CENTER, CENTER); fill(255, 150); 
        textSize(20); text("PRESS ENTER TO START  /  ESC TO BACK", width / 2, height - 80); pop();
    }

    drawSettingsScreen() {
        push(); textAlign(CENTER, CENTER); textFont(fonts.title); fill(255, 215, 0); 
        textSize(50); text("SETTINGS", width / 2, height / 2 - 180);
        this.bgmSlider.display(); this.sfxSlider.display();
        masterVolumeBGM = this.bgmSlider.value; masterVolumeSFX = this.sfxSlider.value;
        if (bgm) bgm.setVolume(masterVolumeBGM);
        textFont(fonts.body); fill(150); textSize(20); text("PRESS ESC TO BACK", width / 2, height - 80); pop();
    }

    handleKeyPress(key, keyCode) {
        if (globalFade.isFading) return; 

        if (this.menuState === "HELP") {
            if ((keyCode === RIGHT_ARROW || keyCode === 68) && this.helpPage < 2) { playSFX(sfxSelect); this.helpPage++; }
            else if ((keyCode === LEFT_ARROW || keyCode === 65) && this.helpPage > 0) { playSFX(sfxSelect); this.helpPage--; }
        }

        if (this.menuState === "HOME") {
            if (keyCode === LEFT_ARROW || keyCode === 65 || keyCode === RIGHT_ARROW || keyCode === 68) {
                playSFX(sfxSelect);
                if (keyCode === LEFT_ARROW || keyCode === 65) this.currentIndex = (this.currentIndex - 1 + 3) % 3;
                else this.currentIndex = (this.currentIndex + 1) % 3;
            } else if (keyCode === ENTER || keyCode === 13) {
                playSFX(sfxClick); this.buttons[this.currentIndex].handleClick(); 
            }
        } else if (keyCode === ESCAPE) {
            this.handleBackAction();
        }

        if (this.menuState === "SELECT") {
            this.timeWheel.handleInput(keyCode);
            if (keyCode === ENTER || keyCode === 13) setupRun(this.timeWheel.selectedDay);
        }
    }

    handleClick(mx, my) {
        if (globalFade.isFading) return; 
        if (this.menuState === "HOME") {
            for (let btn of this.buttons) if (btn.checkMouse(mx, my)) btn.handleClick();
        } else {
            if (this.backButton.checkMouse(mx, my)) this.backButton.handleClick();
            if (this.menuState === "SETTINGS") { this.bgmSlider.handlePress(mx, my); this.sfxSlider.handlePress(mx, my); }
        }
    }

    handleRelease() { if (this.menuState === "SETTINGS") { this.bgmSlider.handleRelease(); this.sfxSlider.handleRelease(); } }
}