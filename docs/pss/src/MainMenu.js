// Park Street Survivor - Main Menu
// Responsibilities: All menu screen rendering, level selection, settings, and help pages.

class MainMenu {

    // ─── INITIALISATION ──────────────────────────────────────────────────────

    constructor() {
        this.menuState    = STATE_MENU;
        this.helpPage     = 0; // 0: Controls, 1: Character Wiki, 2: Buffs, 3: Hazards
        this.currentIndex = -1;  // no default selection
        this._kbFocused   = false; // true = keyboard last moved the selection

        this.timeWheel = new TimeWheel(DAYS_CONFIG);
        this.buttons = [];
        this.setupButtons();

        this.backButton = new UIButton(70, 65, 60, 60, "BACK_ARROW", () => this.handleBackAction());
        this.bgmSlider = new UISlider(width / 2 - 43, height / 2 - 80, 480, 0, 1, masterVolumeBGM, "MUSIC VOLUME");
        this.sfxSlider = new UISlider(width / 2 - 43, height / 2 + 100, 480, 0, 1, masterVolumeSFX, "SOUND EFFECTS");

        // Difficulty selector state (kept for save-system compatibility)
        this.difficultyIndex = gameDifficulty;  // 0=EASY, 1=NORMAL, 2=HARD
        this.diffToastText = "";
        this.diffToastTimer = 0;

        // ── Difficulty select / confirm / load-game screen state ──────────
        this.diffSelectIndex   = 1;   // 0=Easy, 1=Normal, 2=Difficult (keyboard focus)
        this.selectedDifficulty = -1; // confirmed selection before showing confirm screen
        this.diffInfoShown     = -1;  // which ! info panel is open (-1 = none)
        this.diffConfirmBtnIndex = 0; // 0=CONFIRM, 1=BACK (keyboard focus on confirm screen)
        this.loadGameIndex     = 0;   // 0=New Game, 1=Continue (keyboard focus on load screen)
        this.endlessPlayerIdDraft = "";
        this.endlessIdFieldFocused = false;

        // Mute state tracking for settings menu
        this.isBGMMuted = false;
        this.isSFXMuted = false;
        this.preMuteBGMVolume = masterVolumeBGM;
        this.preMuteSFXVolume = masterVolumeSFX;

        // ── PERFORMANCE: Cache help-page data to avoid per-frame allocation ──
        this._helpControls = [
            { id: 'move_combo', a: "MOVEMENT", d: "WASD or Arrows to navigate." },
            { id: 'enter', a: "NEXT PAGE", d: "Cycle through system intel." },
            { id: 'space', a: "PARKOUR", d: "Interact during the run." },
            { id: 'e', a: "INTERACT", d: "Interact with objects." },
            { id: 'p', a: "PAUSE", d: "Freeze time & system menu." }
        ];
        // Character index for the wiki sub-navigation (page 1)
        this._helpCharIndex = 0;

        // ── Detailed character wiki data (one entry per NPC) ─────────────────
        this._helpCharDetails = [
            {
                name: "WIOLA",
                unlockDay: 1,
                portraitKey: "portraitWiola",
                mbti: "ENFJ",
                mbtiLabel: "The Protagonist",
                description: "Caring, enthusiastic, idealistic, organised, responsible. Loves reading books in her free time, but only reads crime novels. She is a bit of a mastermind and could crack any code within seconds. Her dream job is a cybercrime investigator — deleting your search history won't give you anonymity. Her only flaw is losing her temper when her friends don't look out for themselves. Sometimes called the \"Mama\" of the group.",
                signature: "Black americano  ·  H&B supplements  ·  Yubi-key",
                story: "Wiola and Iris worked together in Woodes Café during their undergraduate years. Apart from studying the same subject, they also survived long shifts and endured an annoying boss. They even briefly lived together when transitioning to new accommodations. Over the years they came truly close, like sisters, and even spent the Chinese New Year together. However, during their master's degree, Wiola had to move abroad for personal reasons. She would briefly visit Bristol for a few weeks, during which they had a lot of catching up to do."
            },
            {
                name: "LAYLA",
                unlockDay: 2,
                portraitKey: "portraitLayla",
                mbti: "ESFP",
                mbtiLabel: "The Entertainer",
                description: "Playful, enthusiastic, friendly, spontaneous. Has a vast social circle due to her continuous pursuit of new hobbies and interests. She likes to exercise and thrives on vitality — but besides staying active, she also loves puzzle solving and inventing new ideas. So don't challenge her to poker, basketball or pool if you're not ready to lose. Currently completing an internship at \"Frontier Developments\". She stays up-to-date on trends, making her the perfect plus-one for any social event.",
                signature: "Gucci sunglasses  ·  Fitness tracker  ·  Tamagotchi",
                story: "Layla and Iris met during their second undergraduate year when they both attended a \"language café\" aiming to explore new cultures in such a diverse city. They instantly connected and discovered a shared love of spontaneity, often spending evenings playing card games and cooking multicultural dishes. During this time, Iris also introduced Raymond and Layla so they could travel around Spain and Poland together."
            },
            {
                name: "RAYMOND",
                unlockDay: 3,
                portraitKey: "portraitRaymond",
                mbti: "INTJ",
                mbtiLabel: "The Architect",
                description: "Independent, strategic, logical, good sense of humour. Has a passion for travelling and exploring new cities — avoids tourist traps and prefers authentic local customs. Likes to debate abstract ideas while also joking around with friends, keeping a balance between intellect and humour. She enjoys bouldering, gaming and eating Pho. If you share a common inside joke with her, you know you're buddies.",
                signature: "Carabiner  ·  Nintendo 3DS  ·  Yakinori coupon",
                story: "Raymond and Iris go way back to middle school. They went to the same International department school in China and grew up together during their teenage years. Having each other's side through first heartbreaks and exam seasons inevitably made them best friends. They've stayed together ever since and chose to come to the UK together to study. During their undergraduate years, both went on a quest to make new friends — becoming especially close to Wiola and Charlotte."
            },
            {
                name: "LYDIA",
                unlockDay: 4,
                portraitKey: "portraitLydia",
                mbti: "INFP",
                mbtiLabel: "The Mediator",
                description: "Friendly, Outgoing, Philanthropist. Loves to integrate with the community and aid in organisational events. In combination with her tech skills, she has a passion for managing big institutions and ethics in her future. On a personal note, she enjoys creating music, soundtracks and background music- that is also one of her current side hustles. She creates new tracks in her studio into the late hours of the night. All of her music profits she dedicates to buying pop-mark figurines. She collects them obsessively and changes her key rings on a daily basis to impress with her vast collection.",
                signature: "Guitar picks  ·  AirPods  ·  Chanel perfume",
                story: "Iris and Lydia met very coincidentally, on one of the breezy summer evenings. Iris was going for a walk around Brandon Hill and spotted that Lydia was frantically retracing her steps after losing something. After helping her find her lost Airpod, the two continued their walk together. After chatting and getting to know each other, Iris discovered Lydia’s musical talent and immediately wanted to discover more. During next year’s summer, Iris and Lydia created their own “Festival Music Network”  that was presented during Bristol Harbourside Festival."
            },
            {
                name: "CHARLOTTE",
                unlockDay: 5,
                portraitKey: "portraitCharlotte",
                mbti: "ENTP",
                mbtiLabel: "The Visionary",
                description: "Inventive, strategic, versatile, enjoys new ideas and challenges. Extremely energy efficient - will only dedicate time and energy to things she considers valuable or fun. One of those things is her study, where she only completes tasks to the highest degree of perfection. She is also intelligent, hence reinforced by her winning first place in the International Mathematics Olympiad. She has a circle of close friends, whom she cares for deeply and spends a lot of time with. She is also a proud member of the wlw community. Aside from this, she is a huge foodie and cat lover.",
                signature: "Milk tea boba  ·  Swiss army knife  ·  Kitty hair",
                story: "Charlotte is Iris’s best friend and ex-roommate. They lived together for two years and share the same birthday — the same day and month, just two years apart. Charlotte is older than Iris and tends to take on the role of an older sister. She is mature and gives great advice, which Iris never takes for granted. They’re most likely to be spotted in Gails drinking a coffee and matcha, before gaming for the rest of the evening. Iris looks up to Charlotte, which makes their relationship very special; these two would jump into flames for each other."
            }
        ];
        // Pre-filter ITEM_WIKI once — avoids Array.filter() on every draw frame
        this._helpBuffs = ITEM_WIKI.filter(item => item.type === 'BUFF');
        this._helpHazards = ITEM_WIKI.filter(item => item.type === 'HAZARD');
    }

    /**
     * Registers the three main-menu buttons (START, HELP, SETTINGS) and their transitions.
     */
    setupButtons() {
        const spacing = 560;
        const bottomY = height - 170;
        const buttonScale = 0.7; // 30% smaller than original uploaded button sizes

        const startW = round(530 * buttonScale);
        const startH = round(250 * buttonScale);
        const helpW = round(530 * buttonScale);
        const helpH = round(250 * buttonScale);
        const helpActiveH = round(150 * buttonScale);
        const helpHitOffsetY = (helpH - helpActiveH) / 2;

        const baseBtnStyle = {
            forceSize: true,
            labelOffsetY: 0,
            noLabel: true,
            noLabelStroke: true,
            useDepthLayer: true,
            shadowBlackOffset: { x: 1.5, y: 1.5 },
            shadowPurpleOffset: { x: 1, y: 1 },
            hoverLiftOffset: { x: -0.5, y: -0.5 },
            activePressOffset: { x: 1, y: 1 }
        };

        const startBtnStyle = {
            ...baseBtnStyle,
            imageKey: 'buttonStartImg',
            hitboxOverride: { w: startW, h: helpActiveH, offsetY: helpHitOffsetY }
        };
        const helpBtnStyle = {
            ...baseBtnStyle,
            imageKey: 'buttonHelpImg',
            // button_help has a decorative top frame. Only the bottom strip is interactive.
            hitboxOverride: { w: helpW, h: helpActiveH, offsetY: helpHitOffsetY }
        };
        const settingBtnStyle = {
            ...baseBtnStyle,
            imageKey: 'buttonSettingImg',
            hitboxOverride: { w: startW, h: helpActiveH, offsetY: helpHitOffsetY }
        };

        this.buttons.push(new UIButton(width / 2 - spacing, bottomY - startH / 2, startW, startH, "START", () => {
            // Go to difficulty selection screen
            triggerTransition(() => {
                this.diffSelectIndex    = 1;   // default highlight on NORMAL
                this.diffInfoShown      = -1;
                this.selectedDifficulty = -1;
                gameState.setState(STATE_DIFF_SELECT);
            });
        }, 'title', 35, startBtnStyle));

        this.buttons.push(new UIButton(width / 2, bottomY - helpH / 2, helpW, helpH, "HELP", () => {
            triggerTransition(() => {
                this.menuState = STATE_HELP;
                gameState.currentState = STATE_HELP;
            });
        }, 'title', 35, helpBtnStyle));

        this.buttons.push(new UIButton(width / 2 + spacing, bottomY - startH / 2, startW, startH, "SETTINGS", () => {
            triggerTransition(() => {
                this.diffToastTimer = 0;   // clear any stale difficulty toast
                this.menuState = STATE_SETTINGS;
                gameState.currentState = STATE_SETTINGS;
            });
        }, 'title', 35, settingBtnStyle));
    }

    // ─── DISPLAY ─────────────────────────────────────────────────────────────

    /**
     * Main display entry point — selects background and delegates to the active sub-screen.
     */
    display() {
        imageMode(CORNER);
        if (this.menuState === STATE_LEVEL_SELECT) {
            // Level select uses its own background drawn by TimeWheel
        } else if (this.menuState === STATE_SETTINGS || this.menuState === STATE_HELP ||
                   this.menuState === STATE_DIFF_SELECT || this.menuState === STATE_DIFF_CONFIRM ||
                   this.menuState === STATE_LOAD_GAME) {
            // Background drawn inside each sub-screen via drawOtherBgWithOverlay()
        } else {
            if (assets.menuBg) image(assets.menuBg, 0, 0, width, height);
            else background(20);
        }

        switch (this.menuState) {
            case STATE_MENU:         this.drawHomeScreen();       break;
            case STATE_LEVEL_SELECT: this.drawSelectScreen();     break;
            case STATE_SETTINGS:     this.drawSettingsScreen();   break;
            case STATE_HELP:         this.drawHelpScreen();       break;
            case STATE_DIFF_SELECT:  this.drawDiffSelectScreen(); break;
            case STATE_DIFF_CONFIRM: this.drawDiffConfirmScreen();break;
            case STATE_LOAD_GAME:    this.drawLoadGameScreen();   break;
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
        // Splash→menu entering animation state (globals set by sketch.js)
        let isEntering = (typeof _menuFromSplash !== 'undefined') && _menuFromSplash;
        let t    = isEntering ? (typeof _menuEnterT !== 'undefined' ? _menuEnterT : 1) : 1;
        let easy = t * t * (3 - 2 * t); // smoothstep

        // Logo — drawLogoPlaceholder handles both splash-entering and static-menu cases
        if (typeof drawLogoPlaceholder === 'function') {
            drawLogoPlaceholder(width / 2, 320);
        }

        // Buttons fade in during transition, then stay fully opaque
        let anyHover = false;
        push();
        drawingContext.globalAlpha = easy;
        for (let i = 0; i < this.buttons.length; i++) {
            // Don't register hover/click while the enter animation is still running
            if (!isEntering && !globalFade.isFading && this.buttons[i].checkMouse(mouseX, mouseY)) {
                this.currentIndex = i;
                anyHover = true;
                this._kbFocused = false;  // mouse took over
            }
            this.buttons[i].isFocused = (!isEntering && this.currentIndex >= 0 && this.currentIndex === i);
            this.buttons[i].update();
            this.buttons[i].display();
        }
        drawingContext.globalAlpha = 1;
        pop();

        if (!anyHover && !this._kbFocused) {
            this.currentIndex = -1;
        }
    }

    /**
     * Renders the level-select screen via the TimeWheel component.
     */
    drawSelectScreen() {
        this.timeWheel.display();
        push();
        let pulse = (sin(frameCount * 0.07) + 1) * 0.5;
        let alpha = 180 + pulse * 75;
        // Text
        textFont(fonts.body);
        textAlign(CENTER, CENTER);
        textSize(26);
        stroke(0, 0, 0, 160);
        strokeWeight(5);
        fill(255, 215, 0, alpha);
        text("CLICK OR PRESS [ENTER] TO START  ·  [ESC] TO BACK", width / 2, height - 58);
        noStroke();
        fill(255, 215, 0, alpha);
        text("CLICK OR PRESS [ENTER] TO START  ·  [ESC] TO BACK", width / 2, height - 58);
        pop();
    }

    /**
     * Renders the settings screen with BGM and SFX volume sliders.
     */
    drawSettingsScreen() {
        drawOtherBgWithOverlay();

        push();
        textAlign(CENTER, CENTER);
        textFont(fonts.title);
        textSize(64);
        stroke(0, 0, 0, 200);
        strokeWeight(6);
        fill(255, 215, 0);
        text("SETTINGS", width / 2, height / 2 - 310);
        noStroke();
        fill(255, 215, 0);
        text("SETTINGS", width / 2, height / 2 - 310);

        // ── Volume sliders ───────────────────────────────────────────────────
        this.bgmSlider.display();
        this.sfxSlider.display();

        // Mute toggle icons with hover zoom effect
        let iconSz = 52;
        let iconXOffset = 300;
        let iconHitR = 32;

        // Music mute toggle icon
        let bgmIconX = this.bgmSlider.x + iconXOffset;
        let bgmIconY = this.bgmSlider.y;
        let bgmHover = dist(mouseX, mouseY, bgmIconX, bgmIconY) < iconHitR;
        push();
        translate(bgmIconX, bgmIconY);
        if (bgmHover) scale(1.3);
        let bgmIcon = this.isBGMMuted ? assets.musicOff : assets.musicOn;
        if (bgmIcon) { imageMode(CENTER); image(bgmIcon, 0, 0, iconSz, iconSz); }
        pop();

        // Sound effects mute toggle icon
        let sfxIconX = this.sfxSlider.x + iconXOffset;
        let sfxIconY = this.sfxSlider.y;
        let sfxHover = dist(mouseX, mouseY, sfxIconX, sfxIconY) < iconHitR;
        push();
        translate(sfxIconX, sfxIconY);
        if (sfxHover) scale(1.3);
        let sfxIcon = this.isSFXMuted ? assets.musicOff : assets.musicOn;
        if (sfxIcon) { imageMode(CENTER); image(sfxIcon, 0, 0, iconSz, iconSz); }
        pop();

        masterVolumeBGM = this.bgmSlider.value;
        masterVolumeSFX = this.sfxSlider.value;
        if (typeof BGM !== 'undefined') BGM.syncVolume();

        // ── Hint ────────────────────────────────────────────────────────────
        rectMode(CENTER);
        fill(15, 8, 42, 210);
        stroke(200, 160, 255, 200); strokeWeight(1.5);
        rect(width / 2, height - 72, 820, 56, 28);
        noStroke();
        textFont(fonts.body);
        textSize(24);
        textAlign(CENTER, CENTER);
        stroke(0, 0, 0, 180); strokeWeight(3);
        fill(220, 185, 255);
        text("Press TOP-LEFT BACK button or [ESC] to return to previous screen", width / 2, height - 72);
        noStroke();
        fill(220, 185, 255);
        text("Press TOP-LEFT BACK button or [ESC] to return to previous screen", width / 2, height - 72);
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
        drawingContext.save();
        drawingContext.letterSpacing = "1.5px";
        drawOtherBgWithOverlay();
        const helpBodyFont = fonts.jersey20 || fonts.body;

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
            // Use pre-cached array (no per-frame allocation)
            let controls = this._helpControls;

            // Pre-compute animation indices once per frame (shared across all cards)
            let moveSeqIdx = floor(frameCount / 25) & 7; // & 7 == % 8, sequence has 8 entries
            let animFrame3 = floor(frameCount / 10) % 3;
            let animFrame15 = floor(frameCount / 15) % 3;

            controls.forEach((c, i) => {
                let x = sx + (i % 2) * (cw + gap);
                let y = sy + floor(i / 2) * (ch + gap);
                let isHover = (mouseX > x && mouseX < x + cw && mouseY > y && mouseY < y + ch);

                noStroke();
                fill(isHover ? 255 : 240);
                rect(x, y, cw, ch, 12);

                if (c.id === 'move_combo') {
                    // Cycle through all 8 directional keys — use pre-computed index
                    const _seq = ['w', 'up', 'a', 'left', 's', 'down', 'd', 'right'];
                    let activeKey = _seq[moveSeqIdx];
                    let sheet = assets.keys[activeKey];

                    if (sheet) {
                        let sw = sheet.width / 3;
                        let sh = sheet.height;
                        image(sheet, x + 25, y + 35, 100, 70, animFrame3 * sw, 0, sw, sh);
                        textAlign(CENTER, CENTER);
                        fill(100);
                        textFont(helpBodyFont);
                        textSize(12);
                        text(activeKey.toUpperCase(), x + 75, y + 115);
                    }
                } else {
                    // Regular functional keys (ENTER, SPACE, E, P) — use pre-computed index
                    let sheet = assets.keys[c.id];
                    if (sheet) {
                        let sw = sheet.width / 3, sh = sheet.height;
                        image(sheet, x + 25, y + 35, 100, 70, animFrame15 * sw, 0, sw, sh);
                    }
                }

                textAlign(LEFT, TOP);
                textFont(fonts.title); fill(20); textSize(20); text(c.a, x + 145, y + 35);
                textFont(helpBodyFont); fill(80); textSize(24); text(c.d, x + 145, y + 70, cw - 165);
            });
        }
        // PAGE 1: Character wiki — one character per sub-page
        else if (this.helpPage === 1) {
            const char      = this._helpCharDetails[this._helpCharIndex];
            const n         = this._helpCharDetails.length;
            const isUnlocked = true;

            // ── Left portrait panel ────────────────────────────────────────
            const lx = 90, ly = 155, lw = 510, lh = 710;
            push();
            rectMode(CORNER);
            fill(15, 8, 35, 220);
            stroke(180, 148, 72); strokeWeight(2);
            rect(lx, ly, lw, lh, 16);

            if (isUnlocked) {
                let portrait = assets[char.portraitKey];
                if (portrait) {
                    imageMode(CORNER);
                    noStroke(); noTint();
                    let maxW = lw - 16, maxH = lh - 16;
                    let sc = min(maxW / portrait.width, maxH / portrait.height);
                    let pw = portrait.width * sc, ph = portrait.height * sc;
                    image(portrait, lx + (lw - pw) / 2, ly + (lh - ph) / 2, pw, ph);
                }
            } else {
                // Locked portrait placeholder
                textAlign(CENTER, CENTER);
                textFont(fonts.title); fill(255, 215, 0); noStroke(); textSize(28);
                text("???", lx + lw / 2, ly + lh / 2 - 30);
                textFont(helpBodyFont); fill(200, 185, 120); textSize(20);
                text(`Unlocks on Day ${char.unlockDay}`, lx + lw / 2, ly + lh / 2 + 20);
            }
            pop();

            // ── Right info panel ───────────────────────────────────────────
            const rx = 640, ry = 155, rw = 1190, rh = 710;
            const pad = 36;
            const tx  = rx + pad, tw = rw - pad * 2;

            push();
            rectMode(CORNER);
            fill(15, 8, 35, 210);
            stroke(180, 148, 72); strokeWeight(2);
            rect(rx, ry, rw, rh, 16);

            if (isUnlocked) {
                noStroke();

                // ── Character name ─────────────────────────────────────────
                textFont(fonts.title);
                textSize(52); textAlign(LEFT, TOP);
                fill(255, 215, 0);
                text(char.name, tx, ry + 26);

                // ── Day badge ──────────────────────────────────────────────
                const badgeX = rx + rw - pad - 116;
                const badgeY = ry + 34;
                fill(40, 28, 72); stroke(180, 148, 72); strokeWeight(1.5);
                rectMode(CORNER); rect(badgeX, badgeY, 116, 34, 8);
                noStroke(); fill(200, 175, 100);
                textFont(helpBodyFont); textSize(22); textAlign(CENTER, CENTER);
                text(`DAY ${char.unlockDay}`, badgeX + 58, badgeY + 17);

                // ── MBTI badge ─────────────────────────────────────────────
                const mbtiY = ry + 92;
                fill(58, 32, 100); stroke(160, 120, 210); strokeWeight(1.5);
                rectMode(CORNER); rect(tx, mbtiY, 160, 38, 10);
                noStroke(); fill(200, 165, 245);
                textFont(fonts.title); textSize(18); textAlign(LEFT, CENTER);
                text(char.mbti, tx + 12, mbtiY + 19);
                noStroke(); fill(170, 145, 210);
                textFont(helpBodyFont); textSize(26); textAlign(LEFT, CENTER);
                text(`— ${char.mbtiLabel}`, tx + 186, mbtiY + 19);

                // ── Separator ──────────────────────────────────────────────
                stroke(180, 148, 72, 70); strokeWeight(1);
                line(tx, ry + 148, rx + rw - pad, ry + 148);

                // ── Description ────────────────────────────────────────────
                noStroke();
                fill(140, 118, 90); textFont(helpBodyFont); textSize(26);
                textAlign(LEFT, TOP);
                text("ABOUT", tx, ry + 162);

                fill(220, 210, 195); textSize(30);
                text(char.description, tx, ry + 186, tw, 175);

                // ── Separator ──────────────────────────────────────────────
                stroke(180, 148, 72, 70); strokeWeight(1);
                line(tx, ry + 375, rx + rw - pad, ry + 375);

                // ── Signature items ────────────────────────────────────────
                noStroke();
                fill(140, 118, 90); textFont(helpBodyFont); textSize(26);
                textAlign(LEFT, TOP);
                text("SIGNATURE ITEMS", tx, ry + 389);

                fill(255, 210, 90); textSize(30);
                text(char.signature, tx, ry + 413);

                // ── Separator ──────────────────────────────────────────────
                stroke(180, 148, 72, 70); strokeWeight(1);
                line(tx, ry + 453, rx + rw - pad, ry + 453);

                // ── Story ──────────────────────────────────────────────────
                noStroke();
                fill(140, 118, 90); textFont(helpBodyFont); textSize(26);
                textAlign(LEFT, TOP);
                text("STORY", tx, ry + 467);

                fill(205, 193, 178); textSize(30);
                text(char.story, tx, ry + 491, tw, 200);

            } else {
                // Locked — solid gold, no animation
                textAlign(CENTER, CENTER);
                noStroke();
                textFont(fonts.title); fill(255, 215, 0); textSize(30);
                text("LOCKED", rx + rw / 2, ry + rh / 2 - 30);
                textFont(helpBodyFont); fill(200, 185, 120); textSize(22);
                text(`Meet this character on Day ${char.unlockDay}`, rx + rw / 2, ry + rh / 2 + 20);
            }
            pop();

            // ── Character sub-navigation (arrows + counter) ────────────────
            const charNavY = 900;
            const charNavLX = width / 2 - 120;
            const charNavRX = width / 2 + 120;

            textAlign(CENTER, CENTER);
            textFont(helpBodyFont); textSize(24);
            stroke(0, 0, 0, 160); strokeWeight(3); fill(255, 215, 0);
            text(`${this._helpCharIndex + 1}  /  ${n}`, width / 2, charNavY);
            noStroke(); fill(255, 215, 0);
            text(`${this._helpCharIndex + 1}  /  ${n}`, width / 2, charNavY);

            if (assets.backImg) {
                if (this._helpCharIndex > 0) {
                    let lhov = dist(mouseX, mouseY, charNavLX, charNavY) < 28;
                    push(); translate(charNavLX, charNavY);
                    if (lhov) scale(1.25);
                    imageMode(CENTER); tint(lhov ? 255 : 170);
                    image(assets.backImg, 0, 0, 38, 38);
                    noTint(); pop();
                }
                if (this._helpCharIndex < n - 1) {
                    let rhov = dist(mouseX, mouseY, charNavRX, charNavY) < 28;
                    push(); translate(charNavRX, charNavY);
                    scale(-1, 1);
                    if (rhov) scale(1.25, 1.25);
                    imageMode(CENTER); tint(rhov ? 255 : 170);
                    image(assets.backImg, 0, 0, 38, 38);
                    noTint(); pop();
                }
            }
        }
        // PAGE 2 & 3: Item encyclopedia (Buffs or Hazards)
        else {
            // Use pre-filtered cached arrays — no per-frame Array.filter()
            let items = (this.helpPage === 2) ? this._helpBuffs : this._helpHazards;
            let pulse = sin(frameCount * 0.1) * 30 + 80; // calculate once for all locked cards
            let animIdx30 = floor(frameCount / 30); // base index for animated multi-sprite items

            items.forEach((item, i) => {
                let x = sx + (i % 2) * (cw + gap);
                let y = sy + floor(i / 2) * (ch + gap);
                let isUnlocked = item.unlockDay <= currentUnlockedDay;

                if (isUnlocked) {
                    noStroke(); fill(240); rect(x, y, cw, ch, 12);

                    if (item.imgKey) {
                        let hazardImg;
                        if (Array.isArray(item.imgKey)) {
                            // Cycle through multiple sprites using pre-computed base index
                            hazardImg = assets.previews[item.imgKey[animIdx30 % item.imgKey.length]];
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
                    textFont(helpBodyFont); fill(80); textSize(26); text(item.desc, x + 145, y + 75, cw - 165);
                } else {
                    // Locked state: dark card — use pre-computed pulse value
                    fill(30); noStroke(); rect(x, y, cw, ch, 12);
                    textAlign(CENTER, CENTER);
                    textFont(fonts.title);
                    fill(pulse); textSize(18);
                    text(`LOCKED // DAY ${item.unlockDay}`, x + cw / 2, y + ch / 2);
                }
            });
        }

        noStroke();

        // Footer: left/right arrow buttons for page navigation
        let arrowY = height - 100;
        let arrowSz = 56;
        let arrowLeftX = width / 2 - 200;
        let arrowRightX = width / 2 + 200;

        if (assets.backImg) {
            // Left arrow (only if not first page)
            if (this.helpPage > 0) {
                let leftHover = dist(mouseX, mouseY, arrowLeftX, arrowY) < 35;
                push();
                translate(arrowLeftX, arrowY);
                if (leftHover) scale(1.25);
                imageMode(CENTER);
                image(assets.backImg, 0, 0, arrowSz, arrowSz);
                pop();
            }

            // Right arrow (only if not last page)
            if (this.helpPage < 3) {
                let rightHover = dist(mouseX, mouseY, arrowRightX, arrowY) < 35;
                push();
                translate(arrowRightX, arrowY);
                scale(-1, 1);
                if (rightHover) scale(1.25);
                imageMode(CENTER);
                image(assets.backImg, 0, 0, arrowSz, arrowSz);
                pop();

                // New-content badge at top-right of right arrow
                if (typeof newBadges !== 'undefined' && newBadges.has("help.pages")) {
                    if (typeof _drawBadge === 'function') _drawBadge(arrowRightX + 20, arrowY - 20, 44);
                }
            }
        }

        // Page indicator
        textAlign(CENTER, CENTER);
        textFont(helpBodyFont);
        textSize(22);
        stroke(0, 0, 0, 160); strokeWeight(3); fill(255, 215, 0);
        text((this.helpPage + 1) + " / 4", width / 2, arrowY);
        noStroke(); fill(255, 215, 0);
        text((this.helpPage + 1) + " / 4", width / 2, arrowY);

        fill(150); textSize(18);
        text("PRESS [ESC] TO BACK", width / 2, height - 55);
        drawingContext.restore();
        pop();
    }

    // ─── INPUT HANDLERS ──────────────────────────────────────────────────────

    /**
     * Records that the player has visited a help page.
     * Once all 4 pages have been seen the "help.pages" new-content badge is cleared.
     */
    _markHelpPageVisited(pageIndex) {
        if (typeof helpPagesVisited === 'undefined' || typeof newBadges === 'undefined') return;
        helpPagesVisited.add(pageIndex);
        if (helpPagesVisited.size >= 4) {
            newBadges.delete("help.pages");
            newBadges.delete("pause.HELP");
        }
    }

    /**
     * Routes keyboard input to the correct sub-system based on the active menu state.
     */
    handleKeyPress(_key, keyCode) {
        if (globalFade.isFading) return;

        if (this.menuState === STATE_HELP) {
            const n = this._helpCharDetails.length;
            if (keyCode === RIGHT_ARROW || keyCode === 68) {
                if (this.helpPage === 1 && this._helpCharIndex < n - 1) {
                    // Navigate to next character within the wiki page
                    playSFX(sfxSelect); this._helpCharIndex++;
                } else if (this.helpPage < 3) {
                    // Move to next help page (reset char index when entering wiki)
                    playSFX(sfxSelect); this.helpPage++;
                    if (this.helpPage === 1) this._helpCharIndex = 0;
                    this._markHelpPageVisited(this.helpPage);
                }
            } else if (keyCode === LEFT_ARROW || keyCode === 65) {
                if (this.helpPage === 1 && this._helpCharIndex > 0) {
                    // Navigate to previous character within the wiki page
                    playSFX(sfxSelect); this._helpCharIndex--;
                } else if (this.helpPage > 0) {
                    // Move to previous help page
                    playSFX(sfxSelect); this.helpPage--;
                    if (this.helpPage === 1) this._helpCharIndex = n - 1;
                }
            }
        }

        if (this.menuState === STATE_MENU) {
            if (keyCode === LEFT_ARROW || keyCode === 65 || keyCode === RIGHT_ARROW || keyCode === 68) {
                playSFX(sfxSelect);
                this._kbFocused = true;
                if (this.currentIndex < 0) {
                    this.currentIndex = 0;  // start from first on first keypress
                } else if (keyCode === LEFT_ARROW || keyCode === 65) {
                    this.currentIndex = (this.currentIndex - 1 + 3) % 3;
                } else {
                    this.currentIndex = (this.currentIndex + 1) % 3;
                }
            } else if ((keyCode === ENTER || keyCode === 13) && this.currentIndex >= 0) {
                playSFX(sfxClick);
                this.buttons[this.currentIndex].handleClick();
            }
        } else if (this.menuState === STATE_SETTINGS) {
            if (keyCode === ESCAPE) {
                this.handleBackAction();
            }
        } else if (this.menuState === STATE_DIFF_SELECT) {
            if (keyCode === UP_ARROW || keyCode === 87) {
                this.diffSelectIndex = max(0, this.diffSelectIndex - 1);
                playSFX(sfxSelect);
            } else if (keyCode === DOWN_ARROW || keyCode === 83) {
                this.diffSelectIndex = min(2, this.diffSelectIndex + 1);
                playSFX(sfxSelect);
            } else if (keyCode === ENTER || keyCode === 13) {
                playSFX(sfxClick);
                this.selectedDifficulty  = this.diffSelectIndex;
                this.diffConfirmBtnIndex = 0;
                this._prepareDiffConfirmState();
                triggerTransition(() => { gameState.setState(STATE_DIFF_CONFIRM); });
            } else if (keyCode === ESCAPE) {
                this.handleBackAction();
            }
        } else if (this.menuState === STATE_DIFF_CONFIRM) {
            if (this._handleDiffConfirmTextInput(key, keyCode)) {
                return;
            }
            if (keyCode === ENTER || keyCode === 13) {
                playSFX(sfxClick);
                this._confirmSelectedDifficulty();
            } else if (keyCode === ESCAPE) {
                this.handleBackAction();
            }
        } else if (this.menuState === STATE_LOAD_GAME) {
            const hasSave = typeof SaveSystem !== 'undefined' && SaveSystem.hasSave();
            const numOpts = hasSave ? 2 : 1;
            if ((keyCode === UP_ARROW || keyCode === 87 ||
                 keyCode === DOWN_ARROW || keyCode === 83) && numOpts > 1) {
                this.loadGameIndex = (this.loadGameIndex + 1) % numOpts;
                playSFX(sfxSelect);
            } else if (keyCode === ENTER || keyCode === 13) {
                playSFX(sfxClick);
                this._executeLoadGame(this.loadGameIndex);
            } else if (keyCode === ESCAPE) {
                this.handleBackAction();
            }
        } else if (keyCode === ESCAPE) {
            this.handleBackAction();
        }

        if (this.menuState === STATE_LEVEL_SELECT) {
            this.timeWheel.handleInput(keyCode);

            if (keyCode === ENTER || keyCode === 13) {
                let selectedDay = this.timeWheel.selectedDay;
                if (DEBUG_UNLOCK_ALL || selectedDay <= currentUnlockedDay) {
                    if (typeof tutorialHints !== 'undefined') {
                        tutorialHints.levelSelectShownForDay = selectedDay;
                    }
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
            // Help page arrow clicks
            if (this.menuState === STATE_HELP) {
                let arrowY = height - 100;
                let arrowLeftX = width / 2 - 200;
                let arrowRightX = width / 2 + 200;
                if (this.helpPage > 0 && dist(mx, my, arrowLeftX, arrowY) < 35) {
                    playSFX(sfxSelect); this.helpPage--;
                    if (this.helpPage === 1) this._helpCharIndex = this._helpCharDetails.length - 1;
                    return;
                }
                if (this.helpPage < 3 && dist(mx, my, arrowRightX, arrowY) < 35) {
                    playSFX(sfxSelect); this.helpPage++;
                    if (this.helpPage === 1) this._helpCharIndex = 0;
                    this._markHelpPageVisited(this.helpPage);
                    return;
                }

                // Character sub-navigation arrows (only on wiki page)
                if (this.helpPage === 1) {
                    const charNavY  = 900;
                    const charNavLX = width / 2 - 120;
                    const charNavRX = width / 2 + 120;
                    const n = this._helpCharDetails.length;
                    if (this._helpCharIndex > 0 && dist(mx, my, charNavLX, charNavY) < 28) {
                        playSFX(sfxSelect); this._helpCharIndex--;
                        return;
                    }
                    if (this._helpCharIndex < n - 1 && dist(mx, my, charNavRX, charNavY) < 28) {
                        playSFX(sfxSelect); this._helpCharIndex++;
                        return;
                    }
                }
            }
            if (this.menuState === STATE_SETTINGS) {
                this.bgmSlider.handlePress(mx, my);
                this.sfxSlider.handlePress(mx, my);

                let iconXOffset = 300;
                let hitR = 28;

                // Check Music mute toggle click
                if (dist(mx, my, this.bgmSlider.x + iconXOffset, this.bgmSlider.y) < hitR) {
                    this.toggleBGMMute();
                }
                // Check Sound Effects mute toggle click
                if (dist(mx, my, this.sfxSlider.x + iconXOffset, this.sfxSlider.y) < hitR) {
                    this.toggleSFXMute();
                }
            }

            // ── Difficulty select screen ─────────────────────────────────────
            if (this.menuState === STATE_DIFF_SELECT) {
                const rowYs = [355, 510, 665];
                const rowW  = 1060, rowH = 115;
                const rowCX = width / 2;

                for (let i = 0; i < 3; i++) {
                    const rowY = rowYs[i];
                    if (mx > rowCX - rowW / 2 && mx < rowCX + rowW / 2 &&
                        my > rowY - rowH / 2 && my < rowY + rowH / 2) {
                        playSFX(sfxClick);
                        this.diffSelectIndex     = i;
                        this.selectedDifficulty  = i;
                        this.diffConfirmBtnIndex = 0;
                        this._prepareDiffConfirmState();
                        triggerTransition(() => { gameState.setState(STATE_DIFF_CONFIRM); });
                        return;
                    }
                }
                return;
            }

            // ── Difficulty confirm screen ────────────────────────────────────
            if (this.menuState === STATE_DIFF_CONFIRM) {
                const W = width, H = height, cx = W / 2;
                const d = this.selectedDifficulty >= 0 ? this.selectedDifficulty : 1;
                if (d !== 1) {
                    const field = this._getEndlessIdFieldRect();
                    this.endlessIdFieldFocused =
                        mx > field.x && mx < field.x + field.w &&
                        my > field.y && my < field.y + field.h;
                } else {
                    this.endlessIdFieldFocused = false;
                }
                const btnW = 420, btnH = 90;
                const btnY = H * 0.72;
                if (mx > cx - btnW / 2 && mx < cx + btnW / 2 &&
                    my > btnY - btnH / 2 && my < btnY + btnH / 2) {
                    playSFX(sfxClick);
                    this.diffConfirmBtnIndex = 0;
                    this._confirmSelectedDifficulty();
                    return;
                }
                return;
            }

            // ── Load game screen ─────────────────────────────────────────────
            if (this.menuState === STATE_LOAD_GAME) {
                const W = width, H = height, cx = W / 2;
                const btnW = 900, btnH = 140;
                const btn1Y = H * 0.42;
                const btn2Y = H * 0.66;
                const hasSave = typeof SaveSystem !== 'undefined' && SaveSystem.hasSave();
                if (mx > cx - btnW / 2 && mx < cx + btnW / 2 &&
                    my > btn1Y - btnH / 2 && my < btn1Y + btnH / 2) {
                    playSFX(sfxClick);
                    this._executeLoadGame(0);
                    return;
                }
                if (hasSave && mx > cx - btnW / 2 && mx < cx + btnW / 2 &&
                    my > btn2Y - btnH / 2 && my < btn2Y + btnH / 2) {
                    playSFX(sfxClick);
                    this._executeLoadGame(1);
                    return;
                }
                return;
            }
            // Level select: click on cloud to start the selected day, or arrows to change day
            if (this.menuState === STATE_LEVEL_SELECT) {
                // Right-side up/down arrows
                let arrowX = width - 90;
                let centerY = height / 2;
                let arrowGap = 90;
                if (!this.timeWheel.isEntering) {
                    if (this.timeWheel.selectedDay > 1 &&
                        dist(mx, my, arrowX, centerY - arrowGap) < 35) {
                        let newDay = this.timeWheel.selectedDay - 1;
                        if (typeof tutorialHints !== 'undefined' && !tutorialHints.dayVisuallyUnlocked[newDay]) {
                            this.timeWheel.bgAlpha = 0;
                        }
                        this.timeWheel.selectedDay--;
                        this.timeWheel.targetIndex--;
                        playSFX(sfxSelect);
                        return;
                    }
                    if (this.timeWheel.selectedDay < 5 &&
                        dist(mx, my, arrowX, centerY + arrowGap) < 35) {
                        let newDay = this.timeWheel.selectedDay + 1;
                        if (typeof tutorialHints !== 'undefined' && !tutorialHints.dayVisuallyUnlocked[newDay]) {
                            this.timeWheel.bgAlpha = 0;
                        }
                        this.timeWheel.selectedDay++;
                        this.timeWheel.targetIndex++;
                        playSFX(sfxSelect);
                        return;
                    }
                }
                // Cloud click to start
                let cloudX = width * 0.65, cloudY = height * 0.5;
                let cloudW = 700, cloudH = 450;
                if (mx > cloudX - cloudW / 2 && mx < cloudX + cloudW / 2 &&
                    my > cloudY - cloudH / 2 && my < cloudY + cloudH / 2) {
                    let selectedDay = this.timeWheel.selectedDay;
                    if (DEBUG_UNLOCK_ALL || selectedDay <= currentUnlockedDay) {
                        if (typeof tutorialHints !== 'undefined') {
                            tutorialHints.levelSelectShownForDay = selectedDay;
                        }
                        playSFX(sfxClick);
                        triggerTransition(() => { setupRun(selectedDay); });
                    }
                }
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
            // Return directly to pause overlay (no fade — there's no matching fade-in on the other side).
            const _prevState = pauseFromState;
            pauseFromState = null;
            gameState.setState(STATE_PAUSED);
            gameState.previousState = _prevState;
            this.helpPage = 0;
        } else if (this.menuState === STATE_DIFF_SELECT) {
            triggerTransition(() => {
                this.menuState = STATE_MENU;
                gameState.currentState = STATE_MENU;
            });
        } else if (this.menuState === STATE_DIFF_CONFIRM) {
            triggerTransition(() => {
                gameState.setState(STATE_DIFF_SELECT);
            });
        } else if (this.menuState === STATE_LOAD_GAME) {
            triggerTransition(() => {
                gameState.setState(STATE_DIFF_CONFIRM);
            });
        } else {
            triggerTransition(() => {
                this.menuState = STATE_MENU;
                gameState.currentState = STATE_MENU;
                this.helpPage = 0;
            });
        }
    }

    /**
     * Toggles the BGM mute state and updates the slider value accordingly.
     */
    toggleBGMMute() {
        this.isBGMMuted = !this.isBGMMuted;
        if (this.isBGMMuted) {
            this.preMuteBGMVolume = this.bgmSlider.value;
            this.bgmSlider.value = 0;
        } else {
            this.bgmSlider.value = this.preMuteBGMVolume || 0.25;
        }
        playSFX(sfxClick);
    }

    /**
     * Toggles the SFX mute state and updates the slider value accordingly.
     */
    toggleSFXMute() {
        this.isSFXMuted = !this.isSFXMuted;
        if (this.isSFXMuted) {
            this.preMuteSFXVolume = this.sfxSlider.value;
            this.sfxSlider.value = 0;
        } else {
            this.sfxSlider.value = this.preMuteSFXVolume || 0.7;
        }
        playSFX(sfxClick);
    }

    // ─── DIFFICULTY SELECT SCREEN ─────────────────────────────────────────────

    /**
     * Renders the three-option difficulty selection screen.
     * Each row shows a difficulty with a ! button for details.
     * Keyboard: ↑↓ to move, Enter to confirm, ESC to go back.
     */
    drawDiffSelectScreen() {
        drawOtherBgWithOverlay();

        const W = width, H = height, cx = W / 2;
        const diffBodyFont = fonts.jersey20 || fonts.body;

        const diffData = [
            {
                name: "CASUAL",
                tagline: "Endless mode  \u00b7  Day 1 pattern  \u00b7  Timer challenge",
                recommended: false
            },
            {
                name: "NORMAL",
                tagline: "Story mode  \u00b7  5 Days  \u00b7  Progressive difficulty",
                recommended: true
            },
            {
                name: "HARD",
                tagline: "Endless mode  \u00b7  Day 5 pattern  \u00b7  High pressure",
                recommended: false
            }
        ];

        const rowYs = [355, 510, 665];   // title-to-content gap largest; reduced row-to-row gap
        const rowW  = 1060, rowH = 115;  // narrower & shorter, fully centred
        const rowCX = cx;

        push();

        // Title
        textAlign(CENTER, CENTER);
        textFont(fonts.title);
        textSize(64);
        stroke(0, 0, 0, 200); strokeWeight(6);
        fill(255, 215, 0);
        text("SELECT DIFFICULTY", cx, 145);
        noStroke(); fill(255, 215, 0);
        text("SELECT DIFFICULTY", cx, 145);

        for (let i = 0; i < 3; i++) {
            const d       = diffData[i];
            const rowY    = rowYs[i];
            const isKbSel = this.diffSelectIndex === i;
            const rowHov  = mouseX > rowCX - rowW / 2 && mouseX < rowCX + rowW / 2 &&
                            mouseY > rowY - rowH / 2   && mouseY < rowY + rowH / 2;

            if (rowHov && !globalFade.isFading) this.diffSelectIndex = i;

            const active = isKbSel || rowHov;

            // Row background
            rectMode(CENTER);
            fill(active ? color(75, 45, 135, 225) : color(15, 8, 40, 210));
            stroke(active ? color(255, 215, 0, 255) : color(100, 80, 150, 160));
            strokeWeight(active ? 2.5 : 1.5);
            rect(rowCX, rowY, rowW, rowH, 14);
            noStroke();

            // Difficulty name — centred
            textAlign(CENTER, CENTER);
            textFont(fonts.title);
            textSize(active ? 44 : 40);
            fill(active ? color(255, 215, 0) : color(195, 180, 145));
            text(d.name, rowCX, rowY - 16);

            // RECOMMENDED badge (Normal only)
            if (d.recommended) {
                const badgeW = 215, badgeH = 30;
                const badgeX = rowCX + 185;
                const badgeY = rowY - 32;
                rectMode(CORNER);
                fill(70, 45, 130); stroke(255, 215, 0, 200); strokeWeight(1.5);
                rect(badgeX, badgeY, badgeW, badgeH, 8);
                noStroke();
                textFont(diffBodyFont); textSize(18); textAlign(CENTER, CENTER);
                fill(255, 215, 0);
                text("RECOMMENDED", badgeX + badgeW / 2, badgeY + badgeH / 2);
            }

            // Tagline — centred
            textAlign(CENTER, CENTER);
            textFont(diffBodyFont);
            textSize(25);
            fill(active ? color(225, 210, 185) : color(155, 143, 120));
            text(d.tagline, rowCX, rowY + 22);
        }

        // Prominent prompt bar at bottom
        const promptY = H - 72;
        const promptText = "UP/DOWN to select  \u00b7  [ENTER] to confirm  \u00b7  [ESC] to go back";
        const promptW = W / 2, promptH = 56;
        const promptTextY = promptY;
        rectMode(CENTER);
        fill(101, 63, 191, 204); // #653FBF at 80% opacity (20% transparent)
        stroke('#E2CAF8'); strokeWeight(3);
        rect(cx, promptY, promptW, promptH, 15);
        noStroke();
        textAlign(CENTER, CENTER);
        textFont(diffBodyFont);
        textSize(28);
        stroke(0, 0, 0, 180); strokeWeight(4);
        fill(220, 185, 255);
        text(promptText, cx, promptTextY);

        pop();
    }

    // ─── DIFFICULTY CONFIRM SCREEN ────────────────────────────────────────────

    /**
     * Renders the confirmation screen for the selected difficulty.
     * All three modes are playable:
     * - Casual/Hard: endless timer challenge
     * - Normal: story mode with save/load flow
     */
    drawDiffConfirmScreen() {
        drawOtherBgWithOverlay();

        const W = width, H = height, cx = W / 2;
        const d = this.selectedDifficulty >= 0 ? this.selectedDifficulty : 1;
        const diffNames = ["CASUAL", "NORMAL", "HARD"];
        const diffBodyFont = fonts.jersey20 || fonts.body;
        const endlessId = this._sanitizeEndlessPlayerId(this.endlessPlayerIdDraft);
        const endlessIdValid = endlessId.length > 0;

        push();

        // Title
        textAlign(CENTER, CENTER);
        textFont(fonts.title);
        textSize(64);
        stroke(0, 0, 0, 200); strokeWeight(6);
        fill(255, 215, 0);
        text(diffNames[d] + " MODE", cx, 115);
        noStroke(); fill(255, 215, 0);
        text(diffNames[d] + " MODE", cx, 115);

        // Divider
        stroke(180, 148, 72, 100); strokeWeight(1.5);
        line(cx - 420, 168, cx + 420, 168);
        noStroke();

        const isEndlessMode = d !== 1;
        const cardW = 940;
        const cardH = isEndlessMode ? 190 : 240;
        const cardY = isEndlessMode ? 470 : 430;
        rectMode(CENTER);
        fill(10, 6, 30, 195);
        stroke(180, 148, 72, 120); strokeWeight(1.5);
        rect(cx, cardY, cardW, cardH, 14);
        noStroke();

        if (d === 1) {
            textFont(diffBodyFont);
            textSize(36);
            fill(235, 225, 200);
            textAlign(CENTER, CENTER);
            text("Story-driven parkour across 5 days.", cx, cardY - 56);
            text("Difficulty increases as you progress through each day.", cx, cardY + 8);
            textSize(31);
            fill(255, 215, 0);
            text("Recommended for first-time players!", cx, cardY + 72);
        }

        if (isEndlessMode) {
            const inputPanelW = 980;
            const inputPanelH = 190;
            const inputPanelY = 255;
            rectMode(CENTER);
            fill(10, 6, 30, 205);
            stroke(180, 148, 72, 130);
            strokeWeight(1.5);
            rect(cx, inputPanelY, inputPanelW, inputPanelH, 14);
            noStroke();

            const field = this._getEndlessIdFieldRect();
            const focused = this.endlessIdFieldFocused;
            const displayValue = endlessId || "";

            textAlign(CENTER, CENTER);
            textFont(diffBodyFont);
            textSize(34);
            fill(255, 215, 0);
            text("PLAYER ID", cx, inputPanelY - 62);

            rectMode(CORNER);
            fill(focused ? color(32, 20, 74, 235) : color(16, 10, 44, 220));
            stroke(focused ? color(255, 215, 0) : color(130, 110, 180, 180));
            strokeWeight(focused ? 2.5 : 1.5);
            rect(field.x, field.y, field.w, field.h, 10);
            noStroke();

            textAlign(LEFT, CENTER);
            textFont(diffBodyFont);
            textSize(34);
            fill(displayValue ? color(255, 245, 220) : color(145, 135, 165));
            let caret = "";
            if (focused && frameCount % 60 < 30) caret = "|";
            text(displayValue || `TYPE 1-16 LETTERS / NUMBERS${caret}`, field.x + 18, field.y + field.h / 2 + 1);

            textAlign(CENTER, CENTER);
            textFont(diffBodyFont);
            textSize(24);
            fill(endlessIdValid ? color(180, 255, 180) : color(255, 180, 180));
            text(
                endlessIdValid ? "Leaderboard name ready." : "Player ID is required for endless leaderboard.",
                cx,
                inputPanelY + 66
            );

            textFont(diffBodyFont);
            textAlign(CENTER, CENTER);
            textSize(38);
            fill(235, 225, 200);
            if (d === 0) {
                text("Endless timer challenge with Day 1 pacing.", cx, cardY - 44);
                text("No distance victory. Survive as long as possible.", cx, cardY + 2);
                textSize(30);
                fill(255, 215, 0);
                text("Settlement shows survival time and hit count.", cx, cardY + 46);
            } else {
                text("Endless timer challenge with Day 5 intensity.", cx, cardY - 44);
                text("No distance victory. Higher pressure obstacle flow.", cx, cardY + 2);
                textSize(30);
                fill(255, 215, 0);
                text("Settlement shows survival time and hit count.", cx, cardY + 46);
            }
        }

        // Single CONFIRM button centered
        const btnW = 420, btnH = 90, btnY = isEndlessMode ? 790 : H * 0.72;
        const cHov = !globalFade.isFading &&
                        abs(mouseX - cx) < btnW / 2 + 10 &&
                        abs(mouseY - btnY) < btnH / 2 + 10;
        if (cHov) this.diffConfirmBtnIndex = 0;
        const confirmEnabled = (d === 1) || endlessIdValid;

        rectMode(CENTER);
        fill(confirmEnabled
            ? (cHov ? color(75, 50, 135, 230) : color(20, 12, 50, 210))
            : color(45, 40, 58, 190));
        stroke(confirmEnabled
            ? (cHov ? color(255, 215, 0) : color(120, 100, 170))
            : color(95, 88, 108));
        strokeWeight(2);
        rect(cx, btnY, btnW, btnH, 12);
        noStroke();
        textAlign(CENTER, CENTER);
        textFont(fonts.title);
        textSize(36);
        fill(confirmEnabled
            ? (cHov ? color(255, 215, 0) : color(200, 185, 150))
            : color(150, 145, 150));
        text("CONFIRM", cx, btnY);

        rectMode(CENTER);
        fill(15, 8, 42, 210);
        stroke(200, 160, 255, 200); strokeWeight(1.5);
        rect(cx, H - 72, 680, 56, 28);
        noStroke();
        textFont(diffBodyFont);
        textSize(28);
        textAlign(CENTER, CENTER);
        stroke(0, 0, 0, 180); strokeWeight(3);
        fill(220, 185, 255);
        text("[ENTER] to confirm  \u00b7  [ESC] to go back", cx, H - 72);
        noStroke();
        fill(220, 185, 255);
        text("[ENTER] to confirm  \u00b7  [ESC] to go back", cx, H - 72);

        pop();
    }

    // ─── LOAD GAME SCREEN ─────────────────────────────────────────────────────

    /**
     * Renders the simple new-game / continue screen shown after confirming Normal mode.
     * Shows NEW GAME always, and CONTINUE only when a save exists.
     * Keyboard: ↑↓ to select, Enter to confirm, ESC to go back.
     */
    drawLoadGameScreen() {
        drawOtherBgWithOverlay();

        const save    = typeof SaveSystem !== 'undefined' ? SaveSystem.load() : null;
        const hasSave = save !== null;
        const W = width, H = height, cx = W / 2;

        push();

        // Title
        textAlign(CENTER, CENTER);
        textFont(fonts.title);
        textSize(64);
        stroke(0, 0, 0, 200); strokeWeight(6);
        fill(255, 215, 0);
        text("START GAME", cx, 115);
        noStroke(); fill(255, 215, 0);
        text("START GAME", cx, 115);

        // Divider
        stroke(180, 148, 72, 100); strokeWeight(1.5);
        line(cx - 420, 168, cx + 420, 168);
        noStroke();

        const btnW = 900, btnH = 145;
        const btn1Y = H * 0.41;
        const btn2Y = H * 0.65;

        // Mouse hover
        if (!globalFade.isFading) {
            if (abs(mouseX - cx) < btnW / 2 && abs(mouseY - btn1Y) < btnH / 2)
                this.loadGameIndex = 0;
            if (hasSave && abs(mouseX - cx) < btnW / 2 && abs(mouseY - btn2Y) < btnH / 2)
                this.loadGameIndex = 1;
        }

        // Clamp index if no save
        if (!hasSave) this.loadGameIndex = 0;

        // ── NEW GAME button ──────────────────────────────────────────────────
        const ng = this.loadGameIndex === 0;
        rectMode(CENTER);
        fill(ng ? color(75, 50, 135, 230) : color(15, 8, 42, 210));
        stroke(ng ? color(255, 215, 0) : color(100, 80, 155, 180));
        strokeWeight(2.5);
        rect(cx, btn1Y, btnW, btnH, 16);
        noStroke();
        textAlign(CENTER, CENTER);
        textFont(fonts.title);
        textSize(44);
        fill(ng ? color(255, 215, 0) : color(200, 185, 150));
        text("NEW GAME", cx, btn1Y);

        // ── CONTINUE button (only when save exists) ──────────────────────────
        if (hasSave) {
            const ct = this.loadGameIndex === 1;
            rectMode(CENTER);
            fill(ct ? color(75, 50, 135, 230) : color(15, 8, 42, 210));
            stroke(ct ? color(255, 215, 0) : color(100, 80, 155, 180));
            strokeWeight(2.5);
            rect(cx, btn2Y, btnW, btnH, 16);
            noStroke();

            textAlign(CENTER, CENTER);
            textFont(fonts.title);
            textSize(38);
            fill(ct ? color(255, 215, 0) : color(200, 185, 150));
            text("CONTINUE", cx, btn2Y - 24);

            textFont(fonts.body);
            textSize(26);
            fill(ct ? color(255, 230, 150) : color(165, 150, 120));
            const saveInfo = "Day " + save.currentDayID +
                             "  \u00b7  Last saved: " +
                             (typeof SaveSystem !== 'undefined' ? SaveSystem.formatTime(save.savedAt) : "");
            text(saveInfo, cx, btn2Y + 24);
        }

        // Keyboard hint
        const hint = hasSave
            ? "UP/DOWN to select  \u00b7  [ENTER] to confirm  \u00b7  [ESC] to go back"
            : "[ENTER] to start  \u00b7  [ESC] to go back";
        const hintW = hasSave ? 820 : 520;
        rectMode(CENTER);
        fill(15, 8, 42, 210);
        stroke(200, 160, 255, 200); strokeWeight(1.5);
        rect(cx, H - 72, hintW, 56, 28);
        noStroke();
        textFont(fonts.body);
        textSize(28);
        textAlign(CENTER, CENTER);
        stroke(0, 0, 0, 180); strokeWeight(3);
        fill(220, 185, 255);
        text(hint, cx, H - 72);
        noStroke();
        fill(220, 185, 255);
        text(hint, cx, H - 72);

        pop();
    }

    // ─── LOAD GAME EXECUTOR ───────────────────────────────────────────────────

    /**
     * Executes the selected load-game action.
     * index 0 = New Game, index 1 = Continue from save.
     */
    _executeLoadGame(index) {
        if (index === 1) {
            // CONTINUE — restore save
            if (typeof SaveSystem !== 'undefined' && SaveSystem.hasSave()) {
                triggerTransition(() => SaveSystem.applyAndResume());
            } else {
                this._executeLoadGame(0);  // fall back to new game
            }
            return;
        }

        // NEW GAME — clear save, start from Day 1
        if (typeof SaveSystem !== 'undefined') SaveSystem.clear();
        if (typeof _playerChoices !== 'undefined') _playerChoices = {};
        triggerTransition(() => {
            gameState.resetFlags();
            if (typeof currentDayID !== 'undefined')       currentDayID = 1;
            if (typeof currentUnlockedDay !== 'undefined') currentUnlockedDay = 1;

            if (typeof _prologueSeen !== 'undefined' && !_prologueSeen &&
                typeof startCutsceneFromNode === 'function') {
                _prologueSeen = true;
                // Stop menu BGM, hold black for 0.7s silence → crash SFX → 1.3s → news broadcast
                if (typeof BGM !== 'undefined' && BGM && typeof BGM.stop === 'function') BGM.stop();
                globalFade.holdUntilMs = performance.now() + 2200;
                setTimeout(() => {
                    if (typeof playSFX === 'function' && typeof sfxHitBigCar !== 'undefined' && sfxHitBigCar) {
                        playSFX(sfxHitBigCar);
                    }
                }, 700);
                globalFade.holdDoneCallback = () => {
                    startCutsceneFromNode('prologue_01', () => {
                        if (typeof sfxAmbulance !== 'undefined' && sfxAmbulance &&
                            typeof sfxAmbulance.isPlaying === 'function' && sfxAmbulance.isPlaying()) {
                            sfxAmbulance.stop();
                        }
                        triggerTransition(() => {
                            this.timeWheel.bgAlpha = 0;
                            this.timeWheel.triggerEntrance();
                            gameState.setState(STATE_LEVEL_SELECT);
                        });
                    });
                };
            } else {
                this.timeWheel.bgAlpha = 0;
                this.timeWheel.triggerEntrance();
                gameState.setState(STATE_LEVEL_SELECT);
            }
        });
    }

    _confirmSelectedDifficulty() {
        const d = this.selectedDifficulty >= 0 ? this.selectedDifficulty : 1;
        gameDifficulty = d;
        if (d === 1) {
            triggerTransition(() => {
                this.loadGameIndex = 0;
                gameState.setState(STATE_LOAD_GAME);
            });
            return;
        }

        const day = (d === 0) ? 1 : 5;
        const mode = (d === 0) ? RUN_MODE_ENDLESS_EASY : RUN_MODE_ENDLESS_HARD;
        if (typeof leaderboardManager !== "undefined" && leaderboardManager) {
            const cleanId = this._sanitizeEndlessPlayerId(this.endlessPlayerIdDraft);
            if (!cleanId) return;
            const hasPlayerId = leaderboardManager.setPlayerId(cleanId);
            if (!hasPlayerId) return;
        }
        triggerTransition(() => {
            gameState.resetFlags();
            setupRunDirectly(day, mode, true);
        });
    }

    _prepareDiffConfirmState() {
        const d = this.selectedDifficulty >= 0 ? this.selectedDifficulty : 1;
        if (d === 1) {
            this.endlessPlayerIdDraft = "";
            this.endlessIdFieldFocused = false;
            return;
        }

        const currentId = (typeof leaderboardManager !== "undefined" && leaderboardManager)
            ? (leaderboardManager.currentPlayerId || "")
            : "";
        this.endlessPlayerIdDraft = currentId;
        this.endlessIdFieldFocused = true;
    }

    _sanitizeEndlessPlayerId(value) {
        if (typeof leaderboardManager !== "undefined" && leaderboardManager &&
            typeof leaderboardManager.sanitizePlayerId === "function") {
            return leaderboardManager.sanitizePlayerId(value);
        }
        return String(value || "")
            .toUpperCase()
            .replace(/[^A-Z0-9_-]/g, "")
            .slice(0, 16)
            .trim();
    }

    _handleDiffConfirmTextInput(keyValue, keyCode) {
        const d = this.selectedDifficulty >= 0 ? this.selectedDifficulty : 1;
        if (this.menuState !== STATE_DIFF_CONFIRM || d === 1) return false;

        if (keyCode === BACKSPACE) {
            this.endlessPlayerIdDraft = this.endlessPlayerIdDraft.slice(0, -1);
            return true;
        }

        if (keyCode === DELETE) {
            this.endlessPlayerIdDraft = "";
            return true;
        }

        if (keyCode === TAB) {
            this.endlessIdFieldFocused = true;
            return true;
        }

        if (!this.endlessIdFieldFocused) return false;

        if (typeof keyValue === "string" && keyValue.length === 1) {
            const next = this._sanitizeEndlessPlayerId(this.endlessPlayerIdDraft + keyValue);
            if (next !== this._sanitizeEndlessPlayerId(this.endlessPlayerIdDraft) || /[a-z0-9_-]/i.test(keyValue)) {
                this.endlessPlayerIdDraft = next;
                return true;
            }
        }

        return false;
    }

    _getEndlessIdFieldRect() {
        const cx = width / 2;
        return {
            x: cx - 330,
            y: 228,
            w: 660,
            h: 62
        };
    }
}
