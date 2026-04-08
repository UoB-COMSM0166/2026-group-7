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

        // ── First-time navigation hint (dialogue box, no portrait, no name) ───
        this._navHintBox = new DialogueBox();
        this._navHintBox.persistent = false;
        this._navHintBox.timerMax = 360; // auto-dismiss after 6 s (60 fps)
        this._navHintShown = false; // true once triggered this session

        // ── Settings sliders (centred on screen, evenly spaced) ──────────────
        const sx = width / 2, sw = 480;
        this.bgmSlider        = new UISlider(sx, height / 2 - 185, sw, 0,   1,   masterVolumeBGM,  "MUSIC VOLUME");
        this.sfxSlider        = new UISlider(sx, height / 2,       sw, 0,   1,   masterVolumeSFX,  "SOUND EFFECTS");
        this.brightnessSlider = new UISlider(sx, height / 2 + 185, sw, 0.4, 1.6, masterBrightness, "BRIGHTNESS");

        // ── Settings: display mode selector hit rects (computed in draw) ─────
        // Stored so handleClick can reference them without recomputing.
        this._displayModeRects = null;

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
            { id: 'space_e', a: "INTERACT", d: "Space to parkour · E to interact." },
            { id: 'p', a: "PAUSE", d: "Freeze time & system menu." },
            { id: 'f', a: "FULLSCREEN", d: "Toggle fullscreen mode." },
            { id: 'backspace', a: "BACK", d: "Return to previous screen." }
        ];
        // Character index for the wiki sub-navigation (page 1)
        this._helpCharIndex = -1;

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
            case STATE_DIFF_SELECT:  this.drawDiffSelectScreen();  break;
            case STATE_DIFF_CONFIRM: this.drawDiffConfirmScreen(); break;
            case STATE_LOAD_GAME:    this.drawLoadGameScreen();    break;
        }

        if (this.menuState !== STATE_MENU) {
            this._maybeShowNavHint();

            // While hint is active, give the back button a breathing scale animation
            this.backButton.isFocused = this._navHintBox.isActive()
                ? true
                : this.backButton.checkMouse(mouseX, mouseY);
            this.backButton.update();
            this.backButton.display();

            // Nav hint dialogue — rendered last so it sits on top of everything
            if (this._navHintBox.isActive()) this._navHintBox.display();
        }
    }

    /**
     * Shows a one-time navigation hint the first time any sub-screen is opened.
     * Reads / writes 'pss_nav_hint_seen_v1' in localStorage.
     */
    _maybeShowNavHint() {
        if (this._navHintShown) return;
        if (localStorage.getItem('pss_nav_hint_seen_v1')) return;
        this._navHintShown = true;
        const _ht = "Tap the arrow button in the top-left corner to go back — or press [Backspace] on your keyboard.";
        const _kw = ["top-left", "[Backspace]"];
        const _hl = [];
        for (const kw of _kw) {
            let idx = _ht.indexOf(kw);
            while (idx !== -1) { _hl.push({ start: idx, end: idx + kw.length }); idx = _ht.indexOf(kw, idx + 1); }
        }
        this._navHintBox.trigger(_ht, null, "", null, _hl);
        this._navHintBox.skipToEnd();
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
        this._drawPromptPill(width / 2, height - 72, 420, "[ENTER] to start");
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
        text("SETTINGS", width / 2, height / 2 - 385);
        noStroke();
        fill(255, 215, 0);
        text("SETTINGS", width / 2, height / 2 - 385);

        // ── Sliders ──────────────────────────────────────────────────────────
        this.bgmSlider.display();
        this.sfxSlider.display();
        this.brightnessSlider.display();

        // Mute toggle icons (BGM + SFX only — brightness has no mute)
        let iconSz = 52, iconXOffset = 300, iconHitR = 32;

        let bgmIconX = this.bgmSlider.x + iconXOffset, bgmIconY = this.bgmSlider.y;
        let bgmHover = dist(mouseX, mouseY, bgmIconX, bgmIconY) < iconHitR;
        push();
        translate(bgmIconX, bgmIconY);
        if (bgmHover) scale(1.3);
        let bgmIcon = this.isBGMMuted ? assets.musicOff : assets.musicOn;
        if (bgmIcon) { imageMode(CENTER); image(bgmIcon, 0, 0, iconSz, iconSz); }
        pop();

        let sfxIconX = this.sfxSlider.x + iconXOffset, sfxIconY = this.sfxSlider.y;
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

        // Apply CSS brightness in real time as slider moves
        masterBrightness = this.brightnessSlider.value;
        if (typeof applyBrightnessFilter === 'function') applyBrightnessFilter(masterBrightness);

        // ── DISPLAY MODE selector ────────────────────────────────────────────
        const dmY   = height / 2 + 358;
        const boxW  = 260, boxH = 64, boxGap = 24;
        const lx    = width / 2 - boxGap / 2 - boxW; // left box centre-x
        const rx    = width / 2 + boxGap / 2 + boxW; // right box centre-x
        const isFS  = typeof _isFullscreen !== 'undefined' && _isFullscreen;

        // Store rects for click detection
        this._displayModeRects = { lx, rx, dmY, boxW, boxH };

        push();
        textAlign(CENTER, CENTER);

        // Section label
        textFont(fonts.body);
        textSize(28);
        noStroke();
        fill(255, 215, 0);
        text("DISPLAY MODE", width / 2, dmY - 52);

        rectMode(CENTER);
        // FULLSCREEN box
        const fsHover = dist(mouseX, mouseY, lx, dmY) < max(boxW, boxH) / 2;
        stroke(isFS ? color(255, 215, 0) : color(180, 150, 255, 160));
        strokeWeight(isFS ? 3 : 1.5);
        fill(isFS ? color(255, 215, 0, 40) : color(255, 255, 255, fsHover ? 25 : 10));
        rect(lx, dmY, boxW, boxH, 10);
        noStroke();
        fill(isFS ? color(255, 215, 0) : color(200, 180, 255));
        textFont(fonts.body);
        textSize(24);
        text("FULLSCREEN", lx, dmY);

        // WINDOWED box
        const nmHover = dist(mouseX, mouseY, rx, dmY) < max(boxW, boxH) / 2;
        stroke(!isFS ? color(255, 215, 0) : color(180, 150, 255, 160));
        strokeWeight(!isFS ? 3 : 1.5);
        fill(!isFS ? color(255, 215, 0, 40) : color(255, 255, 255, nmHover ? 25 : 10));
        rect(rx, dmY, boxW, boxH, 10);
        noStroke();
        fill(!isFS ? color(255, 215, 0) : color(200, 180, 255));
        text("WINDOWED", rx, dmY);

        pop();

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
        let titles = ["SYSTEM COMMANDS", "CHARACTER WIKI", "INTEL: BENEFICIAL", "INTEL: HAZARDS", "INTEL: HAZARDS II"];
        // Suppress the big title when the user is reading an individual character file
        if (!(this.helpPage === 1 && this._helpCharIndex >= 0)) {
            text(titles[this.helpPage], width / 2, 100);
        }

        // Card grid layout config — 2 columns, max 6 items per page (3 rows)
        // ch=195 gives enough vertical space for two-line descriptions at textSize 20
        let cw = 500, ch = 195, gap = 22;
        let sx = width / 2 - (cw + gap / 2);

        // PAGE 0: Animated control key cards
        if (this.helpPage === 0) {
            // Use pre-cached array (no per-frame allocation)
            let controls = this._helpControls;

            // Centre the card grid vertically between title bottom (≈130) and footer top (height-100)
            const rows0 = ceil(controls.length / 2);
            const gridH0 = rows0 * ch + (rows0 - 1) * gap;
            let sy = floor((130 + (height - 100) - gridH0) / 2);

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
                        let imgY0 = y + floor((ch - 70) / 2);
                        image(sheet, x + 22, imgY0, 100, 70, animFrame3 * sw, 0, sw, sh);
                        textAlign(CENTER, CENTER);
                        fill(100);
                        textFont(helpBodyFont);
                        textSize(14);
                        text(activeKey.toUpperCase(), x + 72, imgY0 + 80);
                    }
                } else if (c.id === 'space_e') {
                    // Alternate between SPACE and E every ~45 frames
                    let seIdx = floor(frameCount / 45) % 2;
                    let sheet = seIdx === 0 ? assets.keys.space : assets.keys.e;
                    if (sheet) {
                        let sw = sheet.width / 3, sh = sheet.height;
                        image(sheet, x + 22, y + floor((ch - 70) / 2), 100, 70, animFrame15 * sw, 0, sw, sh);
                    }
                } else if (c.id === 'backspace') {
                    // Alternate between BACKSPACE and BACKSPACEALTERNATIVE every ~45 frames
                    let bsAltIdx = floor(frameCount / 45) % 2;
                    let sheet = bsAltIdx === 0 ? assets.keys.backspace : assets.keys.backspaceAlt;
                    if (sheet) {
                        let sw = sheet.width / 3, sh = sheet.height;
                        image(sheet, x + 22, y + floor((ch - 70) / 2), 100, 70, animFrame15 * sw, 0, sw, sh);
                    }
                } else {
                    // Regular functional keys (ENTER, SPACE, E, P, F) — use pre-computed index
                    let sheet = assets.keys[c.id];
                    if (sheet) {
                        let sw = sheet.width / 3, sh = sheet.height;
                        image(sheet, x + 22, y + floor((ch - 70) / 2), 100, 70, animFrame15 * sw, 0, sw, sh);
                    }
                }

                textAlign(LEFT, TOP);
                textFont(fonts.title); fill(20); textSize(22); text(c.a, x + 145, y + 38);
                textFont(helpBodyFont); fill(80); textSize(27); text(c.d, x + 145, y + 95, cw - 165);
            });
        }
        // PAGE 1: Character wiki — directory or individual file view
        else if (this.helpPage === 1) {
            const n = this._helpCharDetails.length;

            if (this._helpCharIndex < 0) {
                // ── DIRECTORY VIEW: clickable portrait grid ─────────────────
                const dcw = 215, dch = 360, dgap = 22;
                const dsx = width / 2 - (n * dcw + (n - 1) * dgap) / 2;
                // Vertically centre cards between title (y≈130) and footer (y≈height-100)
                const dsy = floor((130 + (height - 100) - dch) / 2);

                for (let i = 0; i < n; i++) {
                    const cd = this._helpCharDetails[i];
                    const cx = dsx + i * (dcw + dgap);
                    const hov = mouseX > cx && mouseX < cx + dcw && mouseY > dsy && mouseY < dsy + dch;

                    push();
                    rectMode(CORNER);
                    fill(15, 8, 35, 220);
                    stroke(hov ? 255 : 180, hov ? 215 : 148, hov ? 0 : 72);
                    strokeWeight(hov ? 3 : 1.5);
                    rect(cx, dsy, dcw, dch, 14);

                    let portrait = assets[cd.portraitKey];
                    if (portrait) {
                        imageMode(CORNER); noStroke(); noTint();
                        let maxW = dcw - 8, maxH = dch - 66;
                        let sc = min(maxW / portrait.width, maxH / portrait.height);
                        let pw = portrait.width * sc, ph = portrait.height * sc;
                        // Centre portrait horizontally and vertically within the area above the name strip
                        let portX = cx + floor((dcw - pw) / 2);
                        let portY = dsy + floor((dch - 58 - ph) / 2);
                        image(portrait, portX, portY, pw, ph);
                    }

                    // Name strip at bottom of card
                    noStroke();
                    fill(hov ? color(60, 40, 10, 230) : color(10, 5, 25, 220));
                    rect(cx + 1.5, dsy + dch - 58, dcw - 3, 56, 0, 0, 12, 12);
                    textAlign(CENTER, CENTER);
                    textFont(fonts.title);
                    fill(hov ? color(255, 215, 0) : color(220, 200, 150));
                    textSize(22);
                    text(cd.name, cx + dcw / 2, dsy + dch - 30);
                    pop();
                }

                // Click-hint
                noStroke();
                textAlign(CENTER, CENTER);
                textFont(helpBodyFont);
                fill(160, 145, 120);
                textSize(24);
                text("Select a character to open their file", width / 2, dsy + dch + 44);

            } else {
                // ── DETAIL VIEW: full character file (no big header title) ──
                const char = this._helpCharDetails[this._helpCharIndex];

                // Panels centred horizontally using width/2
                // Total occupied: lw + panelGap + rw = 510 + 40 + 1190 = 1740
                const lw = 510, rw = 1190, panelGap = 40;
                const lx = floor(width / 2 - (lw + panelGap + rw) / 2);
                const ly = 120, ry = 120;
                // Stop panels above the navigation arrows so they never overlap
                const lh = min(800, height - 100 - 40 - ly);
                const rh = lh;
                const rx = lx + lw + panelGap;

                // Left portrait panel
                push();
                rectMode(CORNER);
                fill(15, 8, 35, 220);
                stroke(180, 148, 72); strokeWeight(2);
                rect(lx, ly, lw, lh, 16);

                let portrait = assets[char.portraitKey];
                if (portrait) {
                    imageMode(CORNER); noStroke(); noTint();
                    let maxW = lw - 16, maxH = lh - 16;
                    let sc = min(maxW / portrait.width, maxH / portrait.height);
                    let pw = portrait.width * sc, ph = portrait.height * sc;
                    image(portrait, lx + (lw - pw) / 2, ly + (lh - ph) / 2, pw, ph);
                }
                pop();

                // Right info panel
                const pad = 36;
                const tx  = rx + pad, tw = rw - pad * 2;

                push();
                rectMode(CORNER);
                fill(15, 8, 35, 210);
                stroke(180, 148, 72); strokeWeight(2);
                rect(rx, ry, rw, rh, 16);
                noStroke();
                // Clip all subsequent text/content to within the panel border
                drawingContext.save();
                drawingContext.beginPath();
                drawingContext.rect(rx + 2, ry + 2, rw - 4, rh - 4);
                drawingContext.clip();

                // Character name
                textFont(fonts.title);
                textSize(56); textAlign(LEFT, TOP);
                fill(255, 215, 0);
                text(char.name, tx, ry + 26);

                // Day badge
                const badgeX = rx + rw - pad - 116;
                const badgeY = ry + 34;
                fill(40, 28, 72); stroke(180, 148, 72); strokeWeight(1.5);
                rectMode(CORNER); rect(badgeX, badgeY, 116, 34, 8);
                noStroke(); fill(200, 175, 100);
                textFont(helpBodyFont); textSize(24); textAlign(CENTER, CENTER);
                text(`DAY ${char.unlockDay}`, badgeX + 58, badgeY + 17);

                // MBTI badge
                const mbtiY = ry + 88;
                fill(58, 32, 100); stroke(160, 120, 210); strokeWeight(1.5);
                rectMode(CORNER); rect(tx, mbtiY, 160, 38, 10);
                noStroke(); fill(200, 165, 245);
                textFont(fonts.title); textSize(18); textAlign(LEFT, CENTER);
                text(char.mbti, tx + 12, mbtiY + 19);
                noStroke(); fill(170, 145, 210);
                textFont(helpBodyFont); textSize(30); textAlign(LEFT, CENTER);
                text(`— ${char.mbtiLabel}`, tx + 186, mbtiY + 19);

                // Separator
                stroke(180, 148, 72, 70); strokeWeight(1);
                line(tx, ry + 136, rx + rw - pad, ry + 136);

                // ABOUT
                noStroke();
                fill(140, 118, 90); textFont(helpBodyFont); textSize(26);
                textAlign(LEFT, TOP);
                text("ABOUT", tx, ry + 152);
                fill(220, 210, 195); textSize(27);
                text(char.description, tx, ry + 184, tw, 224);

                // Separator
                stroke(180, 148, 72, 70); strokeWeight(1);
                line(tx, ry + 420, rx + rw - pad, ry + 420);

                // SIGNATURE ITEMS
                noStroke();
                fill(140, 118, 90); textFont(helpBodyFont); textSize(26);
                textAlign(LEFT, TOP);
                text("SIGNATURE ITEMS", tx, ry + 436);
                fill(255, 210, 90); textSize(28);
                text(char.signature, tx, ry + 468);

                // Separator
                stroke(180, 148, 72, 70); strokeWeight(1);
                line(tx, ry + 506, rx + rw - pad, ry + 506);

                // STORY
                noStroke();
                fill(140, 118, 90); textFont(helpBodyFont); textSize(26);
                textAlign(LEFT, TOP);
                text("STORY", tx, ry + 522);
                fill(205, 193, 178); textSize(27);
                text(char.story, tx, ry + 554, tw, 234);

                drawingContext.restore();
                pop();
            }
        }
        // PAGES 2, 3, 4: Item encyclopedia (Buffs / Hazards split across two pages)
        else {
            // Use pre-filtered cached arrays — no per-frame Array.filter()
            let items;
            if (this.helpPage === 2) {
                items = this._helpBuffs;
            } else if (this.helpPage === 3) {
                items = this._helpHazards.slice(0, 4);
            } else {
                items = this._helpHazards.slice(4);
            }
            let pulse = sin(frameCount * 0.1) * 30 + 80; // calculate once for all locked cards
            let animIdx30 = floor(frameCount / 30); // base index for animated multi-sprite items

            // Centre grid vertically between title bottom (≈130) and footer top (height-100)
            const rows = ceil(items.length / 2);
            const gridH = rows * ch + (rows - 1) * gap;
            let sy = floor((130 + (height - 100) - gridH) / 2);

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
                            // Proportional scale to fit within a 110×110 preview area
                            let imgScale = min(110 / hazardImg.width, 110 / hazardImg.height);
                            image(hazardImg, x + 72, y + ch / 2, hazardImg.width * imgScale, hazardImg.height * imgScale);
                        }
                    }

                    // Name + desc — text area starts after image column (≈145px)
                    let tx = x + 150, tw = cw - 160;
                    textAlign(LEFT, TOP);
                    // textSize 16 + width bound prevents long names (e.g. SCOOTER / MOTORCYCLE) from overflowing
                    textFont(fonts.title); fill(20); textSize(16); text(item.name, tx, y + 26, tw, 30);
                    textFont(helpBodyFont); fill(60); textSize(23);
                    text(item.desc, tx, y + 70, tw, ch - 78);
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
            if (this.helpPage < 4) {
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
        textSize(24);
        stroke(0, 0, 0, 160); strokeWeight(3); fill(255, 215, 0);
        text((this.helpPage + 1) + " / 5", width / 2, arrowY);
        noStroke(); fill(255, 215, 0);
        text((this.helpPage + 1) + " / 5", width / 2, arrowY);

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
        if (helpPagesVisited.size >= 5) {
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
            if (keyCode === RIGHT_ARROW || keyCode === 68) {
                if (this.helpPage < 4) {
                    playSFX(sfxSelect); this.helpPage++;
                    if (this.helpPage === 1) this._helpCharIndex = -1;
                    this._markHelpPageVisited(this.helpPage);
                }
            } else if (keyCode === LEFT_ARROW || keyCode === 65) {
                if (this.helpPage === 1 && this._helpCharIndex >= 0) {
                    // From character detail, go back to directory
                    playSFX(sfxSelect); this._helpCharIndex = -1;
                } else if (this.helpPage > 0) {
                    playSFX(sfxSelect); this.helpPage--;
                    if (this.helpPage === 1) this._helpCharIndex = -1;
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
            if (keyCode === BACKSPACE) {
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
            } else if (keyCode === BACKSPACE) {
                this.handleBackAction();
            }
        } else if (this.menuState === STATE_DIFF_CONFIRM) {
            if (this._handleDiffConfirmTextInput(key, keyCode)) {
                return;
            }
            if (keyCode === ENTER || keyCode === 13) {
                playSFX(sfxClick);
                this._confirmSelectedDifficulty();
            } else if (keyCode === BACKSPACE) {
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
            } else if (keyCode === BACKSPACE) {
                this.handleBackAction();
            }
        } else if (keyCode === BACKSPACE) {
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

        // Dismiss nav hint on any click — transparent, click still processes normally
        if (this._navHintBox && this._navHintBox.isActive()) {
            this._navHintBox.active = false;
            localStorage.setItem('pss_nav_hint_seen_v1', '1');
        }

        if (this.menuState === STATE_MENU) {
            for (let btn of this.buttons) if (btn.checkMouse(mx, my)) btn.handleClick();
        } else {
            if (this.backButton.checkMouse(mx, my)) this.backButton.handleClick();
            // Help page arrow clicks
            if (this.menuState === STATE_HELP) {
                let arrowY = height - 100;
                let arrowLeftX = width / 2 - 200;
                let arrowRightX = width / 2 + 200;
                // Left arrow: back to directory when reading a character file
                if (dist(mx, my, arrowLeftX, arrowY) < 35) {
                    if (this.helpPage === 1 && this._helpCharIndex >= 0) {
                        playSFX(sfxSelect); this._helpCharIndex = -1; return;
                    } else if (this.helpPage > 0) {
                        playSFX(sfxSelect); this.helpPage--;
                        if (this.helpPage === 1) this._helpCharIndex = -1;
                        return;
                    }
                }
                // Right arrow
                if (this.helpPage < 4 && dist(mx, my, arrowRightX, arrowY) < 35) {
                    playSFX(sfxSelect); this.helpPage++;
                    if (this.helpPage === 1) this._helpCharIndex = -1;
                    this._markHelpPageVisited(this.helpPage);
                    return;
                }

                // Character directory card clicks
                if (this.helpPage === 1 && this._helpCharIndex < 0) {
                    const n = this._helpCharDetails.length;
                    const dcw = 215, dch = 360, dgap = 22;
                    const dsx = width / 2 - (n * dcw + (n - 1) * dgap) / 2;
                    const dsy = floor((130 + (height - 100) - dch) / 2);
                    for (let i = 0; i < n; i++) {
                        const cx = dsx + i * (dcw + dgap);
                        if (mx > cx && mx < cx + dcw && my > dsy && my < dsy + dch) {
                            playSFX(sfxSelect); this._helpCharIndex = i; return;
                        }
                    }
                }
            }
            if (this.menuState === STATE_SETTINGS) {
                this.bgmSlider.handlePress(mx, my);
                this.sfxSlider.handlePress(mx, my);
                this.brightnessSlider.handlePress(mx, my);

                let iconXOffset = 300, hitR = 28;
                if (dist(mx, my, this.bgmSlider.x + iconXOffset, this.bgmSlider.y) < hitR) this.toggleBGMMute();
                if (dist(mx, my, this.sfxSlider.x + iconXOffset, this.sfxSlider.y) < hitR) this.toggleSFXMute();
                // Display mode selector
                if (this._displayModeRects) {
                    const { lx, rx, dmY, boxW, boxH } = this._displayModeRects;
                    const isFS = typeof _isFullscreen !== 'undefined' && _isFullscreen;
                    if (abs(mx - lx) < boxW / 2 && abs(my - dmY) < boxH / 2) {
                        // FULLSCREEN
                        if (!isFS && typeof toggleFullscreen === 'function') toggleFullscreen();
                    } else if (abs(mx - rx) < boxW / 2 && abs(my - dmY) < boxH / 2) {
                        // WINDOWED
                        if (isFS) document.exitFullscreen();
                    }
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
            this.brightnessSlider.handleRelease();
            // Persist brightness whenever the user lets go of the slider
            if (typeof SaveSystem !== 'undefined') SaveSystem.saveBrightness(this.brightnessSlider.value);
        }
    }

    /**
     * Renders a standardised prompt pill (purple, DiffSelect style) centred at (cx, y).
     * w = pill width; text = label string.
     */
    _drawPromptPill(cx, y, w, label) {
        const bodyFont = fonts.jersey20 || fonts.body;
        push();
        rectMode(CENTER);
        fill(101, 63, 191, 204);
        stroke('#E2CAF8'); strokeWeight(3);
        rect(cx, y, w, 56, 15);
        noStroke();
        textFont(bodyFont); textSize(28);
        textAlign(CENTER, CENTER);
        stroke(0, 0, 0, 180); strokeWeight(3);
        fill(220, 185, 255);
        text(label, cx, y);
        noStroke();
        fill(220, 185, 255);
        text(label, cx, y);
        pop();
    }

    /**
     * Navigates back to the previous screen.
     * If accessed from the pause menu, returns to the pause overlay instead of the main menu.
     */
    handleBackAction() {
        if (globalFade.isFading) return;
        playSFX(sfxClick);

        // When reading a character file, back arrow returns to the directory (not main menu)
        if (this.menuState === STATE_HELP && this._helpCharIndex >= 0) {
            this._helpCharIndex = -1;
            return;
        }

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

        this._drawPromptPill(cx, H - 72, W / 2, "UP/DOWN to select  \u00b7  [ENTER] to confirm");

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

        this._drawPromptPill(cx, H - 72, 500, "[ENTER] to confirm");

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

        if (hasSave) {
            this._drawPromptPill(cx, H - 72, 680, "UP/DOWN to select  \u00b7  [ENTER] to confirm");
        } else {
            this._drawPromptPill(cx, H - 72, 380, "[ENTER] to start");
        }

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
        // Reset nav hint so new players see it again on their first sub-screen visit
        localStorage.removeItem('pss_nav_hint_seen_v1');
        this._navHintShown = false;
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
