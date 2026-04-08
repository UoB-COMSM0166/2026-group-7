// Park Street Survivor - Main Application Controller
// Responsibilities: Global state management, hardware input routing, and game loop orchestration.

// ─── GLOBAL SYSTEM INSTANCES ─────────────────────────────────────────────────
let gameState, mainMenu, roomScene, inventory, env, player, obstacleManager, levelController;
let backpackUI;
let endScreenManager;
let leaderboardManager;
let testingPanel;
let feedbackLayer;
let tutorialDialogue;   // global dialogue box for tutorial page explanations
let tutorialSkipButton;
let __sfxFrame = -1;
let __sfxCounts = Object.create(null);
let tutorialSlidePlayback = {
    active: false,
    frameStart: 0,
    currentIndex: 0
};
let tutorialSkipTransition = {
    active: false,
    phase: 'idle',
    phaseStartFrame: 0,
    phaseDurationFrames: 90
};

// ─── ITEM TUTORIAL STATE ──────────────────────────────────────────────────────
// First-use contextual hint for each NPC utility item during STATE_DAY_RUN.
let _itemTutorial = { active: false, item: null, frame: 0 };
let _itemTutorialDB = null; // dedicated DialogueBox instance

// ─── TUTORIAL INTRO DIALOGUES ─────────────────────────────────────────────────
// Shown at the start of STATE_TUTORIAL_SLIDES, before the interactive phase.
const TUTORIAL_INTRO_LINES = [
    "Welcome to the tutorial! If you have already seen this, click SKIP in the top-right corner.",
    "There are four lanes in the runner: the two middle lanes are road lanes, the two beside them are pavements, and the outermost areas are street scenery — you cannot enter the street scenery.",
    "Power-ups and obstacles on the pavement only spawn on the pavement.",
    "Coffee and scooters/motorcycles are helpful. Everything else is a hazard. Hover over each item to read its description and explore — then click SKIP in the top-right corner when you are done!"
];
let _tutorialIntroIndex = -1; // -1 = interactive phase, >=0 = current intro line index
let _tutorialIntroBox = null; // DialogueBox instance, lazy-created on first use

function _startTutorialIntro() {
    _tutorialIntroIndex = 0;
    if (!_tutorialIntroBox) {
        _tutorialIntroBox = new DialogueBox();
        _tutorialIntroBox.persistent = true;
    }
    _tutorialIntroBox.reset();
    _tutorialIntroBox.persistent = true;
    _tutorialIntroBox.trigger(TUTORIAL_INTRO_LINES[0], null, "");
}

function _advanceTutorialIntro() {
    if (_tutorialIntroIndex < 0 || !_tutorialIntroBox) return;
    if (!_tutorialIntroBox.isFinishedTyping()) {
        _tutorialIntroBox.skipToEnd();
        return;
    }
    _tutorialIntroIndex++;
    if (_tutorialIntroIndex >= TUTORIAL_INTRO_LINES.length) {
        _tutorialIntroIndex = -1; // done — switch to interactive phase
    } else {
        _tutorialIntroBox.reset();
        _tutorialIntroBox.persistent = true;
        _tutorialIntroBox.trigger(TUTORIAL_INTRO_LINES[_tutorialIntroIndex], null, "");
    }
}

const TUTORIAL_ASSET_FILES = {
    background: 'assets/tutorial/tutorial_background.webp',
    oObstacle: {
        ambulance: 'assets/tutorial/o_obstacle/o_ambulance.png',
        bus: 'assets/tutorial/o_obstacle/o_bus.png',
        car: 'assets/tutorial/o_obstacle/o_car_brown.png',
        homeless: 'assets/tutorial/o_obstacle/o_homeless.png',
        illusion_coffee: 'assets/tutorial/o_obstacle/o_illusion_coffee.png',
        kebab: 'assets/tutorial/o_obstacle/o_kebab_right.png',
        promoter: 'assets/tutorial/o_obstacle/o_promoter.png',
        puddle: 'assets/tutorial/o_obstacle/o_puddle.png',
        pixel_scoop: 'assets/tutorial/o_obstacle/o_scoop_left.png',
        scooter_rider: 'assets/tutorial/o_obstacle/o_scooter_rider.png'
    },
    tObstacle: {
        ambulance: 'assets/tutorial/t_obstacle/t_ambulance.png',
        bus: 'assets/tutorial/t_obstacle/t_bus.png',
        car: 'assets/tutorial/t_obstacle/t_car.png',
        homeless: 'assets/tutorial/t_obstacle/t_homeless.png',
        illusion_coffee: 'assets/tutorial/t_obstacle/t_illusion_coffee.png',
        kebab: 'assets/tutorial/t_obstacle/t_kebab.png',
        pixel_scoop: 'assets/tutorial/t_obstacle/t_pixel_scoop.png',
        promoter: 'assets/tutorial/t_obstacle/t_promoter.png',
        puddle: 'assets/tutorial/t_obstacle/t_puddle.png',
        scooter_rider: 'assets/tutorial/t_obstacle/t_scooter_rider.png'
    },
    oPowerup: {
        coffee: 'assets/tutorial/o_powerup/o_coffee.png',
        motorcycle: 'assets/tutorial/o_powerup/o_motorcycle.png',
        scooter: 'assets/tutorial/o_powerup/o_scooter.png'
    },
    tPowerup: {
        coffee: 'assets/tutorial/t_powerup/t_coffee.png',
        motorcycle: 'assets/tutorial/t_powerup/t_motorcycle.png',
        scooter: 'assets/tutorial/t_powerup/t_scooter.png'
    }
};

const TUTORIAL_TEXT_BY_ID = {
    coffee: 'I need this all the time! It recover my energy and keeps me rushing forward.',
    ambulance: 'If I get hit by this, I probably won\'t survive.',
    bus: 'If I get hit by this, I probably won\'t survive.',
    car: 'Not as intimidating as the big truck, but it looks very fast.',
    scooter_rider: 'A rule breaker on the road. They change lanes when you least expect it. Stay alert.',
    scooter: 'My favorite! Riding one makes it feel like you can speed past everything.',
    motorcycle: 'My favorite! Riding one makes it feel like you can speed past everything.',
    pixel_scoop: 'It looks cute, but if I bump into the food stall, the stall owner will definitely yell at me.',
    kebab: 'It looks cute, but if I bump into the food stall, the stall owner will definitely yell at me.',
    homeless: 'They always say strange things. If I bump into them while rushing, I might get pushed to the other side of the street.',
    promoter: 'If I run into them, they\'ll force me to read their flyer. Maybe I should try pressing the space bar quickly.',
    puddle: 'If I step into it on a rainy day, my movement speed will drop. Maybe I should try pressing the space bar quickly.',
    illusion_coffee: 'nothing really happens except that it makes me annoyed.',
    hud_energy: 'This is your energy bar.',
    hud_inventory: 'This is the inventory you bring. Press E to use it.'
};

const TUTORIAL_LAYOUT = [
    { id: 'coffee', group: 'powerup', obstacleType: 'COFFEE', preferredLane: 1, y: 240, z: 1 },
    { id: 'illusion_coffee', group: 'obstacle', obstacleType: 'FANTASY_COFFEE', preferredLane: 1, y: 430, z: 2 },
    { id: 'homeless', group: 'obstacle', obstacleType: 'HOMELESS', preferredLane: 1, y: 610, z: 3 },
    { id: 'pixel_scoop', group: 'obstacle', obstacleType: 'SMALL_BUSINESS', preferredLane: 1, y: 940, z: 4 },

    { id: 'ambulance', group: 'obstacle', obstacleType: 'LARGE_CAR', preferredLane: 2, y: 260, z: 5 },
    { id: 'car', group: 'obstacle', obstacleType: 'SMALL_CAR', preferredLane: 2, y: 520, z: 6 },
    { id: 'motorcycle', group: 'powerup', obstacleType: 'EMPTY_SCOOTER', preferredLane: 2, y: 810, z: 7 },

    { id: 'bus', group: 'obstacle', obstacleType: 'LARGE_CAR', preferredLane: 3, y: 260, z: 8 },
    { id: 'puddle', group: 'obstacle', obstacleType: 'PUDDLE', preferredLane: 3, y: 520, z: 9 },
    { id: 'scooter', group: 'powerup', obstacleType: 'EMPTY_SCOOTER', preferredLane: 3, y: 810, z: 10 },

    { id: 'promoter', group: 'obstacle', obstacleType: 'PROMOTER', preferredLane: 4, y: 280, z: 11 },
    { id: 'scooter_rider', group: 'obstacle', obstacleType: 'SCOOTER_RIDER', preferredLane: 4, y: 540, z: 12 },
    { id: 'kebab', group: 'obstacle', obstacleType: 'SMALL_BUSINESS', preferredLane: 4, y: 830, z: 13 }
];

const TUTORIAL_SCENE_SCALE = 0.72;
const TUTORIAL_HUD_Y_OFFSET = 34;

// ─── GAME PROGRESS STATE ─────────────────────────────────────────────────────
let currentUnlockedDay = 1;
let currentDayID = 1;

// ─── ASSET REGISTRY ──────────────────────────────────────────────────────────
let assets = {
    menuBg: null,
    otherBg: null,
    warningImg: null,
    warningBox: null,
    bbg: null,
    libraryBg: null,
    csNewsBg: null,   // assets/background/bg_news.webp  — prologue cutscene bg
    csLibraryBg: null, // assets/dialogue/library.webp — NPC cutscene + success screen bg
    csBusBg: null,             // assets/background/bg_bus/bg_bus.webp
    csPhoneImg: null,          // assets/background/bg_bus/phone.png
    csOperatingTheatreBg: null,// assets/background/bg_operating_theatre.webp
    csHospitalBg: null,        // assets/background/hospital.webp
    csBalloonFestivalBg: null, // assets/background/bg_ballon_festival.png
    csBalloonHotAirBg: null,   // assets/background/bg_hot_air_ballon.webp
    csNewsHospitalBg: null,    // assets/background/news_hospital.webp
    csFloatStreetBg: null,     // assets/background/bg_float/bg_float_street.webp
    csFloatIrisBg: null,       // assets/background/bg_float/bg_float_iris.webp
    csHappyEndBg: null,        // assets/background/bg_happy_end.webp
    csBedroomSunny: null,      // assets/bedroom/bg_bedroom_sunny.webp
    csBedroomOvercast: null,   // assets/bedroom/bg_bedroom_overcast.webp
    csBedroomRain: null,       // assets/bedroom/bg_bedroom_rain.webp
    dialogBox: null,  // assets/obstacles/dialog_box.png — homeless speech bubble
    dialogueBox: null,      // assets/dialogue/dialog_box.png — main dialogue bar
    dialogueFrameBox: null, // assets/dialogue/frame_box.png — portrait frame
    dialogueNameBox: null,  // assets/dialogue/name_box.png — speaker name tag
    noticeBox: null,        // assets/dialogue/notice_box.png — menu button background
    bubbleBox: null,        // assets/dialogue/bubble_box.png — backpack item description bubble
    irisSuccess: [],
    celebrateSheet: null,
    storyShape: null,
    storyCloud: null,
    button1Img: null,
    keys: {},
    selectClouds: [],
    selectBg: {
        unlock: null,
        lock: null
    },
    runBackgrounds: {
        sunny: [],
        lightRain: [],
        heavyRain: []
    },
    destinationBackgrounds: {
        sunny: null,
        lightRain: null,
        heavyRain: null
    },
    obstacleSprites: {},
    previews: [],
    tutorialSlides: [],
    tutorialInteractive: {
        background: null,
        oObstacle: {},
        tObstacle: {},
        oPowerup: {},
        tPowerup: {}
    },
    playerAnim: {
        north: [],
        south: [],
        west: [],
        east: []
    }
};
let fonts = {};
let sfxSelect, sfxClick, sfxDialogue, sfxItemNotification;
let sfxHitNpc, sfxHitBigCar, sfxHitSmallCar, sfxHitFantasyCoffee, sfxPuddleNoBoots, sfxSmallBusiness;
let sfxPickupCoffee, sfxPickupScooter, sfxPuddleBoots, sfxPaperCrumple, sfxScooterBrake;
let sfxDoorOpen, sfxAmbulance, sfxHeartbeat, sfxGameWin, sfxRoomClock;
let sfxHeartbeatShort, sfxHeartbeatClimax;

let failEndAudioTimer = null;

// ─── AUDIO VOLUME CONTROLS ───────────────────────────────────────────────────
let masterVolumeBGM = 0.25;
let masterVolumeSFX = 0.7;

// ─── BRIGHTNESS ──────────────────────────────────────────────────────────────
// CSS filter: brightness() multiplier. 1.0 = normal, <1 darker, >1 brighter.
let masterBrightness = 1.0;
let _isFullscreen    = false; // synced via fullscreenchange listener

// ─── DIFFICULTY SETTING ──────────────────────────────────────────────────────
// 0 = CASUAL (endless day 1), 1 = NORMAL (story), 2 = HARD (endless day 5)
let gameDifficulty = 1;
const DIFFICULTY_LABELS = ["CASUAL", "NORMAL", "HARD"];
const RUN_MODE_STORY = "STORY";
const RUN_MODE_ENDLESS_EASY = "ENDLESS_EASY";
const RUN_MODE_ENDLESS_HARD = "ENDLESS_HARD";
let currentRunMode = RUN_MODE_STORY;

function isStoryRunMode() {
    return currentRunMode === RUN_MODE_STORY;
}

function isEndlessRunMode() {
    return currentRunMode === RUN_MODE_ENDLESS_EASY || currentRunMode === RUN_MODE_ENDLESS_HARD;
}

function shouldShowDay1RoomExitTutorial() {
    const tutorialAssetsReady = !!(
        assets && assets.tutorialInteractive && assets.tutorialInteractive.background
    );
    return currentRunMode === RUN_MODE_STORY &&
        currentDayID === 1 &&
        tutorialAssetsReady;
}

// ─── WIN-CUTSCENE GUARD ───────────────────────────────────────────────────────
// Prevents checkSettlementPoint() from triggering the NPC cutscene more than once.
let _winCutscenePending = false;
let runSuccessTransition = {
    active: false,
    played: false,
    alpha: 0,
    phase: 'idle',
    holdFrames: 0,
    fadeInSpeed: 255 / (0.9 * 60),
    fadeOutSpeed: 255 / (0.6 * 60),
    revealFrames: 42,
    onComplete: null
};

// ─── GLOBAL BACKGROUND WITH OVERLAY ──────────────────────────────────────────
/**
 * Shared dark-overlay alpha for every screen that renders otherBg.
 * Change this ONE value to adjust the darkness uniformly across
 * settings, help, pause, story, and the room wallpaper.
 */
const SHARED_BG_OVERLAY_ALPHA = 100;

/**
 * Draws the standard otherBg background with a unified dark overlay.
 * Uses cover-scale (imageMode CENTER, max-scale) so the image fills the
 * canvas without stretching — identical to the room scene wallpaper.
 * Used in settings, help, pause, and story screens for consistent look.
 */
function drawOtherBgWithOverlay() {
    push();
    if (assets && assets.otherBg) {
        let s = max(width / assets.otherBg.width, height / assets.otherBg.height);
        imageMode(CENTER);
        image(assets.otherBg, width / 2, height / 2, assets.otherBg.width * s, assets.otherBg.height * s);
    } else {
        background(20);
    }
    noStroke();
    fill(0, 0, 0, SHARED_BG_OVERLAY_ALPHA);
    rectMode(CORNER);
    rect(0, 0, width, height);
    imageMode(CORNER);
    pop();
}

// ─── TUTORIAL WARNING ICON ────────────────────────────────────────────────────
/**
 * Draws a pulsing warning icon at (x, y) with a breathing scale animation.
 * @param {number} x      Center X
 * @param {number} y      Center Y
 * @param {number} size   Base diameter in pixels
 */
function drawWarningIcon(x, y, size) {
    if (!assets.warningImg) return;

    let originalW = assets.warningImg.width;
    let originalH = assets.warningImg.height;
    let aspectRatio = originalW / originalH;

    let breathe = 0.85 + sin(frameCount * 0.08) * 0.15;
    let renderH = size * breathe;
    let renderW = (size * aspectRatio) * breathe;

    push();
    imageMode(CENTER);
    image(assets.warningImg, x, y, renderW, renderH);
    pop();
}

// ─── GLOBAL FADE TRANSITION CONTROLLER ───────────────────────────────────────
// Drives a 0.3s fade-in / fade-out overlay across all scene transitions.
let globalFade = {
    alpha: 0,
    speed: 255 / (0.3 * 60),
    isFading: false,
    dir: 1,
    callback: null,

    // Special-case hold support (used only for library entry transition)
    holdUntilMs: 0,
    holdDoneCallback: null
};

// ─── PAUSE MENU STATE ─────────────────────────────────────────────────────────
let pauseIndex = -1;  // -1 = no selection (nothing highlighted by default)
let pauseFromState = null;

// Pause options vary by context (room vs day-run)
function getPauseOptions() {
    if (gameState && gameState.previousState === STATE_DAY_RUN) {
        return ["RESTART", "SETTINGS", "STORY", "HELP", "EXIT"];
    }
    return ["SETTINGS", "STORY", "HELP", "EXIT"];
}

// Restart sub-menu state
let showRestartChoice = false;
let restartChoiceIndex = 0;
const RESTART_OPTIONS = ["BACK TO ROOM", "RESTART RUN"];

// Endless-mode restart confirmation dialog
let showRestartConfirm = false;
let restartConfirmIndex = -1;
const RESTART_CONFIRM_OPTIONS = ["YES, RESTART", "CANCEL"];

// Exit-to-main-menu confirmation dialog
let showExitConfirm = false;
let exitConfirmIndex = -1;
const EXIT_CONFIRM_OPTIONS = ["YES, EXIT", "CANCEL"];

// Pause button breathing scale (smooth lerp)
let pauseBtnScale = 1.0;

// ─── NEW-CONTENT BADGE SYSTEM ─────────────────────────────────────────────────
// A Set of string keys marks UI elements with unseen / new content.
// Keys: "pause_btn" | "pause.SETTINGS" | "pause.STORY" | "pause.HELP" | "help.pages"
const newBadges = new Set();
let helpPagesVisited = new Set();   // page indices 0-3 visited in current help session

/** Initialize all first-play badges. Call once when starting a new game on Day 1. */
function initNewGameBadges() {
    newBadges.clear();
    newBadges.add("pause_btn");
    newBadges.add("pause.SETTINGS");
    newBadges.add("pause.STORY");
    newBadges.add("pause.HELP");
    helpPagesVisited.clear();
}

/** Call after completing a level — new story content is unlocked. */
function addPostLevelBadges() {
    newBadges.add("pause_btn");
    newBadges.add("pause.STORY");
}

/** Draws the game's warning/exclamation asset as a new-content badge at (x, y). */
function _drawBadge(x, y, size) {
    size = size || 36;
    drawWarningIcon(x, y, size);
}

// Story recap state
let showStoryRecap = false;
let storyRecapDay = 1;
let storyScrollOffset = 0;  // scroll offset within current day's text
// Vertical scrollbar drag state for story recap
let _storyScrollbar = { x: 0, y: 0, w: 8, h: 0, thumbY: 0, thumbH: 0, maxScroll: 0 };
let _storyScrollDragging = false;
let _storyScrollDragStartY = 0;
let _storyScrollDragStartOffset = 0;

// Save-choice screen state (STATE_SAVE_CHOICE)
let _saveChoiceIndex = 0;  // 0 = CONTINUE, 1 = NEW GAME
// True once the player has pressed START at least once this page load.
// Prevents repeated save-load prompts when returning to menu mid-session.
let _sessionStarted = false;

// ─── STORY RECAP CONTENT ──────────────────────────────────────────────────────

/**
 * Strips <h>…</h> highlight tags from dialogue node content strings.
 */
function _stripDialogueTags(text) {
    return text.replace(/<\/?h>/g, '');
}

/**
 * Counts how many visual lines a string occupies at the current font/size,
 * given an available pixel width. Must be called inside draw() with font set.
 */
function _countWrappedLines(str, availW) {
    let words = str.split(' ');
    let lines = 1;
    let cur = '';
    for (let w of words) {
        let test = cur ? cur + ' ' + w : w;
        if (textWidth(test) > availW && cur !== '') {
            lines++;
            cur = w;
        } else {
            cur = test;
        }
    }
    return lines;
}

/**
 * Iteratively walks a DIALOGUE_DATA node chain from startNodeId.
 * At branch nodes, follows the player's recorded choice (_nodeChoices[nodeId])
 * or defaults to the first option with a next_id.
 * Returns an array of typed entries:
 *   { type: 'speaker', name }  — speaker header (shown once per speaker run)
 *   { type: 'dialogue', text } — a line of spoken text
 *   { type: 'blank' }          — empty separator
 */
function _traverseDialogueChain(startNodeId) {
    const entries = [];
    let lastSpeaker = null;
    const visited = new Set();
    let nodeId = startNodeId;

    while (nodeId && !visited.has(nodeId)) {
        visited.add(nodeId);
        const node = (typeof DIALOGUE_DATA !== 'undefined') ? DIALOGUE_DATA[nodeId] : null;
        if (!node) break;

        const speaker = node.speaker || null;
        const contents = node.content || [];

        // Speaker header — only when speaker changes
        if (speaker && speaker !== lastSpeaker) {
            entries.push({ type: 'speaker', name: speaker });
            lastSpeaker = speaker;
        }

        // Content lines (strip <h> tags)
        for (const c of contents) {
            const text = _stripDialogueTags(c).trim();
            if (text) entries.push({ type: 'dialogue', text });
        }

        // Branch node — follow recorded choice or first available next_id
        if (node.options && node.options.length > 0) {
            const chosenNextId = (typeof _nodeChoices !== 'undefined') ? _nodeChoices[nodeId] : null;
            let followId = chosenNextId;
            if (!followId) {
                for (const opt of node.options) {
                    if (opt.next_id) { followId = opt.next_id; break; }
                }
            }
            nodeId = followId || null;
            continue;
        }

        // Linear node — advance to next
        nodeId = node.next_id || null;
    }

    return entries;
}

/**
 * Builds a structured story recap for a given day by traversing DIALOGUE_DATA.
 * Returns { title, entries[] } where entries are typed objects for the renderer.
 * Day 0 = Prologue (no player choices).  Days 1-5 = room monologue + NPC scene.
 */
function buildRecapEntries(day) {
    const dayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    if (day === 0) {
        let prologueEntries = _traverseDialogueChain('prologue_01');
        for (let _b = 0; _b < 10; _b++) prologueEntries.push({ type: 'blank' });
        return { title: 'Prologue', entries: prologueEntries };
    }

    const title = `Day ${day} \u2014 ${dayNames[day] || ''}`;
    let entries = [];

    // Room monologue
    const roomStart = (typeof DIALOGUE_DATA !== 'undefined' && DIALOGUE_DATA.day_room_start)
        ? DIALOGUE_DATA.day_room_start[day] : null;
    if (roomStart) {
        entries = entries.concat(_traverseDialogueChain(roomStart));
    }

    // Blank separator between room and NPC scene
    if (entries.length > 0) entries.push({ type: 'blank' });

    // NPC conversation
    const npcStart = (typeof DIALOGUE_DATA !== 'undefined' && DIALOGUE_DATA.day_npc_start)
        ? DIALOGUE_DATA.day_npc_start[day] : null;
    if (npcStart) {
        entries = entries.concat(_traverseDialogueChain(npcStart));
    }

    // Trailing blanks so cloud overlay doesn't obscure the last lines
    for (let _b = 0; _b < 10; _b++) entries.push({ type: 'blank' });

    return { title, entries };
}

/**
 * Legacy recap (kept for reference / fallback).
 * Returns the story recap for a given day.
 * Branches narrative based on _playerChoices where meaningful.
 * Each return value: { title, lines[] }
 */
function getStoryRecap(day) {
    // Helper: get recorded choice for a day+line
    const ch = (lineIdx) =>
        (typeof _playerChoices !== 'undefined' && _playerChoices[day + '_' + lineIdx])
            ? _playerChoices[day + '_' + lineIdx].choiceIdx
            : null;

    // ── Prologue (day 0) — the news broadcast before everything began ──
    if (day === 0) {
        return {
            title: "Prologue",
            lines: [
                "NEWSREADER: Breaking news.",
                "NEWSREADER: A car crash near Blackfriars Underpass.",
                "NEWSREADER: A woman, late 20s, struck by a car at 18:00.",
                "NEWSREADER: Emergency services rushed her to hospital.",
                "NEWSREADER: She is in critical condition.",
                "NEWSREADER: Circumstances of the crash remain unclear.",
                "NEWSREADER: Witnesses say she may have acted intentionally.",
            ]
        };
    }

    if (day === 1) {
        const greeted = ch(1);   // 0 = "Wiola… Hi", 1 = "Hey girl"
        const thanked = ch(9);   // 0 = "you've always got my back", 1 = "You're a life saver"
        return {
            title: "Day 1 — Monday",
            lines: [
                "Iris woke at 8:00, feeling oddly rested.",
                "The sunny morning — too good to waste.",
                "",
                "On Park Street, she ran into Wiola.",
                "WIOLA: Heyy Iris! Long time no see!",
                greeted === 1
                    ? "IRIS: Hey girl, it's been ages!"
                    : "IRIS: Wiola... hi, it's so nice to see you.",
                "",
                "WIOLA: Have you prepared for today's lecture?",
                "WIOLA: Just sit with me — I'll talk you through it.",
                "",
                thanked === 1
                    ? "IRIS: You're a life saver!"
                    : "IRIS: Thanks — you've always got my back.",
                "",
                "Wiola had vitamin gummies — orange flavour.",
                "Iris's favourite. She accepted them gratefully.",
                "",
                "For a Monday morning, things felt almost okay."
            ]
        };
    }

    if (day === 2) {
        const chicken = ch(12);  // 0 = "no regrets", 1 = "fried chicken is my life"
        return {
            title: "Day 2 — Tuesday",
            lines: [
                "Another bright day. Another steep hill.",
                "LAYLA: You alright? You look like you ran a marathon!",
                "",
                "IRIS: Ha, money's tight — no bus fare.",
                "IRIS: Besides, it's good for my health.",
                "",
                "Layla teased her about Ji's Chicken.",
                chicken === 1
                    ? "IRIS: Fried chicken is my life!"
                    : "IRIS: I eat fried chicken with no regrets!",
                "",
                "Layla gave Iris a purple tangle toy.",
                "LAYLA: I remember you mentioning your ADHD.",
                "Iris was genuinely touched.",
                "",
                "They headed into uni together, smiling."
            ]
        };
    }

    if (day === 3) {
        const travel = ch(5);  // 0 = "I admire how you balance…", 1 = "Next time let's go together"
        return {
            title: "Day 3 — Wednesday",
            lines: [
                "The alarm barely registered. Body aching.",
                "Gloomy weather. She hoped it wouldn't rain.",
                "",
                "Raymond was waiting near the top of the hill.",
                "IRIS: Hi Ray, so glad to see you.",
                "RAYMOND: I've been travelling, catching up.",
                travel === 1
                    ? "IRIS: Next time let's go together!"
                    : "IRIS: I admire how you balance it all.",
                "",
                "Then Iris swayed. Nearly blacked out.",
                "RAYMOND: IRIS OMG, WAKE UP!",
                "IRIS: Just dizzy. The hill always gets me.",
                "",
                "Raymond stayed by her side all the way.",
                "He gave her headphones from his travels.",
                "RAYMOND: Let's go before you faint again.",
                "Iris smiled — grateful he was there."
            ]
        };
    }

    if (day === 4) {
        const help = ch(4);   // 0 = "give me a sec", 1 = "DON'T TOUCH ME"
        const confide = ch(13);  // 0 = confide, 1 = push away

        return {
            title: "Day 4 — Thursday",
            lines: [
                "Legs trembling. Pouring rain.",
                "",
                "Lydia found her sitting on the wet ground.",
                "LYDIA: IRIS! Hey, what are you doing? It's wet!",
                help === 1
                    ? "IRIS: STOP! DON'T TOUCH ME!"
                    : "IRIS: Ughh… yeah, give me a sec.",
                "",
                "Then everything went black.",
                "LYDIA: You almost DIED, Iris. What happened?!",
                "",
                confide === 1
                    ? "IRIS: Go away! You won't understand!"
                    : "IRIS: I've been having these episodes...",
                confide === 1
                    ? "LYDIA: I'm just trying to be a good friend."
                    : "LYDIA: Let's go to the GP on the weekend.",
                "",
                "Iris followed Lydia inside. Silently grateful."
            ]
        };
    }

    if (day === 5) {
        const voices = ch(3);   // 0 = continue listening, 1 = snap out
        const who = ch(21);  // 0 = keep listening to voices, 1 = listen to Charlotte
        const ending = ch(36);  // 0 = "No… I can't keep running", 1 = "Okayy…"

        return {
            title: "Day 5 — Friday",
            lines: [
                "Something felt different today.",
                "IRIS: UUUUUGGGHHHH......",
                "She woke gasping. The dream again.",
                "",
                voices === 1
                    ? "She shook her head. The voices faded."
                    : "She let the voices wash over her.",
                "",
                "Charlotte was waving. Balloons filled the sky.",
                "Iris could barely hear her. Everything felt slow.",
                "",
                who === 1
                    ? "IRIS: Charlotte... (she turned to face her)"
                    : "Unknown voices pulled at her. Hard to look away.",
                "CHARLOTTE: We're all going clubbing. SZPITAL.",
                "CHARLOTTE: No arguments.",
                "",
                ending === 0
                    ? "IRIS: No… I can't keep running from my problems."
                    : "IRIS: Okayy… I don't know if I'll have the strength.",
                "",
                ending === 0
                    ? "She faced what came next. No more running."
                    : "Rain on her face — washing something away."
            ]
        };
    }

    return { title: `Day ${day}`, lines: ['No recap available.'] };
}

// ─── TUTORIAL HINT SYSTEM ─────────────────────────────────────────────────────
/**
 * Tracks which tutorial hints are active.
 *   dayVisuallyUnlocked    — object {dayID: bool}; each day starts gray until player clicks once.
 *                            on that click the background turns color and the warning disappears,
 *                            but the game does NOT start yet (a second click is required).
 *   levelSelectShownForDay — last day whose cloud was clicked to ENTER the game;
 *                            hint icon shows on days above this value.
 *   dayVisuallyUnlocked    — object {dayID: bool}; each day starts gray until player clicks once.
 *   levelSelectShownForDay — last day whose cloud was clicked to ENTER the game.
 *   roomPhase              — 'DESK' | 'CLOSE_BP' | 'DOOR' | 'DONE'
 */

let tutorialHints = {
    dayVisuallyUnlocked: {},   // { 1: true/false, 2: true/false, … } per-day first-click unlock
    levelSelectShownForDay: 0,
    roomPhase: 'DESK',
    moveTutorialDone: false,   // true once the player has dismissed the WASD/arrow-key hint
    uiTutorialDone: false,     // true once the pause/help/settings/story intro is complete
    uiIntroStep: 0             // current step within UI intro (0 = pause, 1 = help, 2 = settings, 3 = story)
};

// ─── SPLASH LOGO ANIMATION STATE ─────────────────────────────────────────────
let titleDrop = { y: -200, vy: 0, landed: false, shake: 0 };

// ─── ITEM ENCYCLOPEDIA ───────────────────────────────────────────────────────
const ITEM_WIKI = [
    // BUFFS (Help Page 2) — max 6, in-run pickups then backpack utility items by unlock day
    { name: 'COFFEE', desc: 'PICK UP: HEAL +33 HP — OVERFLOW: 3s INVINCIBLE', unlockDay: 1, imgKey: 'coffee', type: 'BUFF' },
    { name: 'SCOOTER / MOTORCYCLE', desc: 'PICK UP: 5s SPEED BOOST + 7s INVINCIBLE', unlockDay: 1, imgKey: ['motorcycle', 'empty_scooter'], type: 'BUFF' },
    { name: 'SOFT GUMMY VITAMINS', desc: 'BACKPACK: PRESS [E] — RESTORES HEALTH TO FULL', unlockDay: 2, imgKey: 'gummy_vitamins', type: 'BUFF' },
    { name: 'TANGLE', desc: 'BACKPACK: PRESS [E] ONCE — AUTO-BLOCKS FANTASY COFFEE (3 USES)', unlockDay: 3, imgKey: 'tangle', type: 'BUFF' },
    { name: 'HEADPHONES', desc: 'BACKPACK: PRESS [E] ONCE — AUTO-SKIPS PROMOTER (5 USES)', unlockDay: 4, imgKey: 'headphones', type: 'BUFF' },
    { name: 'RAIN BOOTS', desc: 'BACKPACK: PRESS [E] ONCE — AUTO-SIDESTEPS PUDDLE (3 USES)', unlockDay: 5, imgKey: 'rain_boots', type: 'BUFF' },

    // HAZARDS — 8 items across 2 help pages (4 per page, in order)
    // Page 3 (first 4)
    { name: 'HEAVY TRAFFIC', desc: 'AMBULANCE / BUS — INSTANT KILL — AVOID AT ALL COSTS', unlockDay: 1, imgKey: ['ambulance', 'bus'], type: 'HAZARD' },
    { name: 'LIGHT TRAFFIC', desc: 'SMALL CARS — BLOCKS ROAD — PRESS [SPACE] TO JUMP OVER', unlockDay: 1, imgKey: ['car_brown', 'car_red'], type: 'HAZARD' },
    { name: 'PROMOTER', desc: 'LEAFLET COVERS SCREEN — PRESS [SPACE] x5 TO CLEAR — HEADPHONES SKIP', unlockDay: 1, imgKey: 'promoter', type: 'HAZARD' },
    { name: 'SMALL BUSINESS', desc: 'ICE CREAM / KEBAB STALL — 10 DMG ON COLLISION', unlockDay: 1, imgKey: ['icecream', 'kebab'], type: 'HAZARD' },
    // Page 4 (last 4)
    { name: 'HOMELESS', desc: '10 DMG + FORCES LANE CHANGE ON COLLISION', unlockDay: 1, imgKey: 'homeless', type: 'HAZARD' },
    { name: 'SCOOTER RIDER', desc: '0.5s STUN + 1s LANE CHANGE DELAY ON COLLISION', unlockDay: 1, imgKey: 'scooter_rider', type: 'HAZARD' },
    { name: 'PUDDLE', desc: '20 DMG + SLOWS MOVEMENT — PRESS [SPACE] x3 TO ESCAPE — RAIN BOOTS COUNTER', unlockDay: 4, imgKey: 'puddle', type: 'HAZARD' },
    { name: 'FANTASY COFFEE', desc: 'DISGUISES AS COFFEE — RUNS AWAY WHEN APPROACHED — TANGLE AUTO-BLOCKS (5 USES)', unlockDay: 2, imgKey: 'coffee', type: 'HAZARD' },
];

// ─── ASSET LOADING TRACKER ───────────────────────────────────────────────────
let isLoaded = false;
let loadProgress = 0;
let smoothProgress = 0;
let assetsLoadedCount = 0;
let totalAssetsToLoad = 0;
let loadingPhase = "boot";
let levelLoadState = {
    active: false,
    dayID: 0,
    progress: 0,
    readyFrames: 0,
    startedFrame: 0,
    minVisibleFrames: 120,
    checks: [],
    onReady: null
};

const RUNTIME_SPRITE_FALLBACKS = {
    "assets/power_up/scooter_empty.png": "assets/power_up/powerup_scooter.png"
};

function getThemeKeyForDay(dayID) {
    const backgroundThemeByDay = {
        1: "sunny",
        2: "sunny",
        3: "lightRain",
        4: "lightRain",
        5: "heavyRain"
    };
    return backgroundThemeByDay[dayID] || "sunny";
}

function resolveSpritePath(spritePath) {
    return RUNTIME_SPRITE_FALLBACKS[spritePath] || spritePath;
}

function collectObstacleSpritePathsForType(obstacleType, dayID) {
    const cfg = OBSTACLE_CONFIG && OBSTACLE_CONFIG[obstacleType];
    if (!cfg) return [];

    const paths = new Set();
    const addPath = (value) => {
        if (typeof value === "string" && value.trim()) {
            paths.add(resolveSpritePath(value.trim()));
        }
    };
    const addVariant = (variant) => {
        if (!variant || typeof variant !== "object") return;
        addPath(variant.sprite);
        if (variant.spriteBySide && typeof variant.spriteBySide === "object") {
            Object.values(variant.spriteBySide).forEach(addPath);
        }
    };

    addPath(cfg.sprite);
    addPath(cfg.disguiseSprite);
    addPath(cfg.runSpriteSheet);
    addPath(cfg.paperBallSprite);
    if (Array.isArray(cfg.leafletSprites)) cfg.leafletSprites.forEach(addPath);
    if (cfg.leafletSpritesByDay && Array.isArray(cfg.leafletSpritesByDay[dayID])) {
        cfg.leafletSpritesByDay[dayID].forEach(addPath);
    }
    if (Array.isArray(cfg.variants)) cfg.variants.forEach(addVariant);

    return [...paths];
}

function collectAllGameplaySpritePaths() {
    const paths = new Set();
    const dayKeys = Object.keys(DIFFICULTY_PROGRESSION || {}).map(Number).filter(Number.isFinite);
    for (const dayID of dayKeys) {
        const config = DIFFICULTY_PROGRESSION[dayID];
        const obstacleTypes = Array.isArray(config && config.availableObstacles) ? config.availableObstacles : [];
        for (const obstacleType of obstacleTypes) {
            collectObstacleSpritePathsForType(obstacleType, dayID).forEach(path => paths.add(path));
        }
    }
    return [...paths];
}

function isImageReady(img) {
    return !!(img && Number(img.width) > 0 && Number(img.height) > 0);
}

function getPreloadedSprite(spritePath) {
    const resolvedPath = resolveSpritePath(spritePath);
    if (assets && assets.obstacleSprites && assets.obstacleSprites[resolvedPath]) {
        return assets.obstacleSprites[resolvedPath];
    }
    if (assets && assets.previews) {
        const fileNameKey = resolvedPath.split('/').pop().replace('.png', '').toLowerCase();
        return assets.previews[fileNameKey] || null;
    }
    return null;
}

function buildDayRunAssetChecks(dayID) {
    const checks = [];
    const pushCheck = (label, ok, detail = "") => checks.push({ label, ok: !!ok, detail });
    const themeKey = getThemeKeyForDay(dayID);
    const runTiles = (assets && assets.runBackgrounds && Array.isArray(assets.runBackgrounds[themeKey]))
        ? assets.runBackgrounds[themeKey]
        : [];

    pushCheck(`Day ${dayID} backgrounds`, runTiles.length >= 3 && runTiles.every(isImageReady), themeKey);
    pushCheck(`Day ${dayID} destination`, isImageReady(assets && assets.destinationBackgrounds && assets.destinationBackgrounds[themeKey]), themeKey);
    pushCheck("Distance flag", isImageReady(assets && assets.distanceFlagImg));
    pushCheck("Player idle north", isImageReady(assets && assets.playerAnim && assets.playerAnim.north && assets.playerAnim.north.idle));
    pushCheck(
        "Player run north",
        !!(assets && assets.playerAnim && assets.playerAnim.north &&
            Array.isArray(assets.playerAnim.north.walk) &&
            assets.playerAnim.north.walk.length > 0 &&
            assets.playerAnim.north.walk.every(isImageReady))
    );

    const obstacleTypes = Array.isArray(DIFFICULTY_PROGRESSION?.[dayID]?.availableObstacles)
        ? DIFFICULTY_PROGRESSION[dayID].availableObstacles
        : [];
    for (const obstacleType of obstacleTypes) {
        const spritePaths = collectObstacleSpritePathsForType(obstacleType, dayID);
        for (const spritePath of spritePaths) {
            const sprite = getPreloadedSprite(spritePath);
            pushCheck(`${obstacleType}: ${spritePath.split('/').pop()}`, isImageReady(sprite), spritePath);
        }
    }
    return checks;
}

function beginGameplayLoading(dayID, onReady) {
    const checks = buildDayRunAssetChecks(dayID);
    const allReady = checks.every(c => c.ok);

    // All assets already loaded — skip the loading screen entirely.
    if (allReady) {
        if (typeof onReady === "function") onReady();
        return;
    }

    // Some assets not yet ready — show the level loading screen until they are.
    loadingPhase = "level";
    levelLoadState.active = true;
    levelLoadState.dayID = dayID;
    levelLoadState.progress = 0;
    levelLoadState.readyFrames = 0;
    levelLoadState.startedFrame = typeof frameCount === "number" ? frameCount : 0;
    levelLoadState.checks = checks;
    levelLoadState.onReady = typeof onReady === "function" ? onReady : null;
    gameState.setState(STATE_LOADING);
}

function updateGameplayLoadingState() {
    if (!levelLoadState.active) return;

    const checks = buildDayRunAssetChecks(levelLoadState.dayID);
    levelLoadState.checks = checks;
    const passedCount = checks.filter(check => check.ok).length;
    const totalCount = Math.max(1, checks.length);
    levelLoadState.progress = passedCount / totalCount;

    if (passedCount === totalCount) {
        levelLoadState.readyFrames++;
    } else {
        levelLoadState.readyFrames = 0;
    }

    const visibleEnough = (typeof frameCount === "number" ? frameCount : 0) - levelLoadState.startedFrame >= levelLoadState.minVisibleFrames;
    if (levelLoadState.readyFrames >= 2 && visibleEnough) {
        const onReady = levelLoadState.onReady;
        levelLoadState.active = false;
        levelLoadState.checks = [];
        levelLoadState.onReady = null;
        levelLoadState.progress = 0;
        levelLoadState.readyFrames = 0;
        levelLoadState.startedFrame = 0;
        loadingPhase = "idle";
        if (onReady) onReady();
    }
}


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1: ASSET LOADING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Increments the loaded-asset counter and updates the progress ratio.
 */
/**
 * Loads all non-critical BGM tracks in the background after setup() runs.
 * None of these block the initial loading screen.
 * BGMManager's isLoaded guard ensures silence (not a crash) if a track is
 * needed before its download completes, and the callback retries playback.
 */
function _loadDeferredBGM() {
    const tracks = [
        ['TimeRoom',        'assets/audio/music/TimeRoom.mp3'],
        ['Level12',         'assets/audio/music/Level12.mp3'],
        ['Level34',         'assets/audio/music/Level34.mp3'],
        ['Level5',          'assets/audio/music/Level5.mp3'],
        ['FinalDay',        'assets/audio/music/FinalDay.mp3'],
        ['BalloonFestival', 'assets/audio/music/BalloonFestival.mp3'],
        ['EndL',            'assets/audio/music/LifeEnding.mp3'],
        ['EndL_inst',       'assets/audio/music/LifeEnding_instrument.mp3'],
        ['EndD',            'assets/audio/music/DeathEnding.mp3'],
    ];
    tracks.forEach(function ([key, path]) {
        bgms[key] = loadSound(path, function () {
            // If this track should be playing right now (e.g. player is already
            // in a run), trigger playback — BGM.play() is a no-op if already playing.
            if (typeof BGM !== 'undefined' && typeof gameState !== 'undefined') {
                if (BGM.routeKey(gameState.currentState) === key) {
                    BGM.play(key);
                }
            }
        });
    });
}

function itemLoaded() {
    assetsLoadedCount++;
    loadProgress = assetsLoadedCount / totalAssetsToLoad;

    // Hand raw progress to the rAF loop in index.html.
    // The rAF loop handles both the smooth animation and the fade-out,
    // so the overlay only disappears once smoothProgress actually reaches 100%.
    if (typeof window._hlSetProgress === 'function') {
        window._hlSetProgress(loadProgress);
    }
}

/**
 * p5.js lifecycle hook: loads all assets before setup() runs.
 * Each callback calls itemLoaded() to track real-time progress.
 */
function preload() {
    // Dynamic asset counter wrappers — totalAssetsToLoad self-counts, no hardcoded total needed.
    function li(path) { totalAssetsToLoad++; return loadImage(path, itemLoaded); }
    function ls(path) { totalAssetsToLoad++; return loadSound(path, itemLoaded); }
    function lf(path) { totalAssetsToLoad++; return loadFont(path, itemLoaded); }

    // Visual assets
    assets.menuBg = li('assets/background/cbg.webp');
    assets.otherBg = li('assets/background/other_bg.png');
    assets.roomBg = li('assets/background/room.png');
    assets.csHospitalBg = li('assets/background/hospital.webp');
    assets.inventoryBg = li('assets/inventory/table.webp');
    assets.backpackImg = li('assets/inventory/backpack.png');
    assets.studentCardImg = li('assets/inventory/student_card.png');
    assets.computerImg = li('assets/inventory/computer.png');
    assets.vitaminImg = li('assets/inventory/vitamin.png');
    assets.tangleImg = li('assets/inventory/tangle.png');
    assets.headphoneImg = li('assets/inventory/headphone.png');
    assets.rainbootImg = li('assets/inventory/rainboot.png');
    assets.distanceFlagImg = li('assets/HUD/distance_flag.png');

    assets.bbg = li('assets/background/bbg.png');
    assets.libraryBg = li('assets/background/library.jpg');
    assets.csNewsBg = li('assets/background/bg_news.webp');
    assets.csLibraryBg = li('assets/dialogue/library.webp');
    assets.csBusBg = li('assets/background/bg_bus/bg_bus.webp');
    assets.csPhoneImg = li('assets/background/bg_bus/phone.png');
    assets.csOperatingTheatreBg = li('assets/background/bg_operating_theatre.webp');
    assets.csBalloonFestivalBg = li('assets/background/bg_ballon_festival.png');
    assets.csBalloonHotAirBg = li('assets/background/bg_hot_air_ballon.webp');
    assets.csNewsHospitalBg = li('assets/background/news_hospital.webp');
    assets.csFloatStreetBg = li('assets/background/bg_float/bg_float_street.webp');
    assets.csFloatIrisBg = li('assets/background/bg_float/bg_float_iris.webp');
    assets.csHappyEndBg = li('assets/background/bg_happy_end.webp');
    assets.csBedroomSunny = li('assets/bedroom/bg_bedroom_sunny.webp');
    assets.csBedroomOvercast = li('assets/bedroom/bg_bedroom_overcast.webp');
    assets.csBedroomRain = li('assets/bedroom/bg_bedroom_rain.webp');
    assets.dialogBox = li('assets/obstacles/dialog_box.png');
    assets.dialogueBox = li('assets/dialogue/dialog_box.png');
    assets.dialogueFrameBox = li('assets/dialogue/frame_box.png');
    assets.dialogueNameBox = li('assets/dialogue/name_box.png');
    assets.noticeBox = li('assets/dialogue/notice_box.png');
    assets.bubbleBox = li('assets/dialogue/bubble_box.png');

    loadImage('assets/end_screen/spritesheet_celebrate.png', (img) => {
        let fW = img.width / 5;
        let fH = img.height;
        for (let i = 0; i < 5; i++) {
            assets.irisSuccess.push(img.get(i * fW, 0, fW, fH));
        }
    });

    assets.storyShape = li('assets/story/frame_shape.png');
    assets.storyCloud = li('assets/story/frame_cloud.png');

    assets.tutorialInteractive.background = li(TUTORIAL_ASSET_FILES.background);
    for (const [key, filePath] of Object.entries(TUTORIAL_ASSET_FILES.oObstacle)) {
        assets.tutorialInteractive.oObstacle[key] = li(filePath);
    }
    for (const [key, filePath] of Object.entries(TUTORIAL_ASSET_FILES.tObstacle)) {
        assets.tutorialInteractive.tObstacle[key] = li(filePath);
    }
    for (const [key, filePath] of Object.entries(TUTORIAL_ASSET_FILES.oPowerup)) {
        assets.tutorialInteractive.oPowerup[key] = li(filePath);
    }
    for (const [key, filePath] of Object.entries(TUTORIAL_ASSET_FILES.tPowerup)) {
        assets.tutorialInteractive.tPowerup[key] = li(filePath);
    }

    assets.selectBg.unlock = li('assets/select_background/day_unlock.jpg');
    assets.selectBg.lock = li('assets/select_background/day_lock.jpg');

    assets.runBackgrounds.sunny = [
        li('assets/background/bg_sunny/bg_sunny_A.webp'),
        li('assets/background/bg_sunny/bg_sunny_B.webp'),
        li('assets/background/bg_sunny/bg_sunny_C.webp')
    ];
    assets.destinationBackgrounds.sunny = li('assets/background/bg_sunny/bg_sunny_destination.webp');

    assets.runBackgrounds.lightRain = [
        li('assets/background/bg_light_rain/bg_light_rain_A.webp'),
        li('assets/background/bg_light_rain/bg_light_rain_B.webp'),
        li('assets/background/bg_light_rain/bg_light_rain_C.webp')
    ];
    assets.destinationBackgrounds.lightRain = li('assets/background/bg_light_rain/bg_light_rain_destination.webp');

    assets.runBackgrounds.heavyRain = [
        li('assets/background/bg_heavy_rain/bg_heavy_rain_A.webp'),
        li('assets/background/bg_heavy_rain/bg_heavy_rain_B.webp'),
        li('assets/background/bg_heavy_rain/bg_heavy_rain_C.webp')
    ];
    assets.destinationBackgrounds.heavyRain = li('assets/background/bg_heavy_rain/bg_heavy_rain_destination.webp');

    for (let i = 1; i <= 5; i++) {
        assets.selectClouds.push(li(`assets/select_cloud/Cloud-${i}.png`));
    }

    // Typography
    fonts.title = lf('assets/fonts/PressStart2P-Regular.ttf');
    fonts.time = lf('assets/fonts/Jersey20-Regular.ttf');
    fonts.body = lf('assets/fonts/Jersey20-Regular.ttf');
    fonts.dialogueBlue = lf('assets/fonts/Blue Screen Personal Use.ttf');
    fonts.jersey20 = lf('assets/fonts/Jersey20-Regular.ttf');
    fonts.logo = lf('assets/fonts/title_1.otf');

    // Audio
    soundFormats('mp3', 'wav');
    // Only load menu-critical BGM in preload() to cut ~45 MB from initial download.
    // All other tracks are loaded in background via _loadDeferredBGM() in setup().
    bgms.Main    = ls('assets/audio/music/MainTheme.mp3');  // STATE_MENU — needed immediately
    bgms.Library = ls('assets/audio/music/Library.mp3');    // 669 KB — keep here (tiny)

    sfxSelect = ls('assets/audio/effects/Select.mp3');
    sfxClick = ls('assets/audio/effects/Click.mp3');
    sfxDialogue = ls('assets/audio/effects/Dialogue.mp3');
    sfxHitBigCar = ls('assets/audio/effects/HitBigCar.mp3');
    sfxHitSmallCar = ls('assets/audio/effects/HitSmallCar.mp3');
    sfxPickupCoffee = ls('assets/audio/effects/CoffeeDrink.mp3');
    sfxPickupScooter = ls('assets/audio/effects/ScooterPick.mp3');
    sfxScooterBrake = ls('assets/audio/effects/ScooterBrake.mp3');
    sfxHitNpc = ls('assets/audio/effects/HitNPC.mp3');
    sfxPuddleBoots = ls('assets/audio/effects/PuddleWithShoe.mp3');
    sfxPuddleNoBoots = ls('assets/audio/effects/HitPuddle.mp3');
    sfxHitFantasyCoffee = ls('assets/audio/effects/HitFantasyCoffee.mp3');
    sfxSmallBusiness = ls('assets/audio/effects/HitSmallBusiness.mp3');
    sfxPaperCrumple = ls('assets/audio/effects/HitPoster.mp3');
    sfxDoorOpen = ls('assets/audio/effects/LibraryDoorOpen.mp3');
    sfxRoomClock = ls('assets/audio/effects/RoomClock.mp3');
    sfxItemNotification = ls('assets/audio/effects/ItemPop.mp3');
    sfxAmbulance = ls('assets/audio/effects/GameOverAmbulance.mp3');
    sfxHeartbeat = ls('assets/audio/effects/GameOverHeartbeat.mp3');
    sfxHeartbeatShort = ls('assets/audio/effects/Heartbeat_Jump.mp3');
    sfxHeartbeatClimax = ls('assets/audio/effects/Heartbeat_flat.mp3');
    sfxGameWin = ls('assets/audio/effects/GameWin.mp3');

    // Control key sprites
    assets.keys.w = li('assets/control_keys/W.png');
    assets.keys.a = li('assets/control_keys/A.png');
    assets.keys.s = li('assets/control_keys/S.png');
    assets.keys.d = li('assets/control_keys/D.png');
    assets.keys.up = li('assets/control_keys/ARROWUP.png');
    assets.keys.down = li('assets/control_keys/ARROWDOWN.png');
    assets.keys.left = li('assets/control_keys/ARROWLEFT.png');
    assets.keys.right = li('assets/control_keys/ARROWRIGHT.png');
    assets.keys.enter = li('assets/control_keys/ENTER.png');
    assets.keys.space = li('assets/control_keys/SPACE.png');
    assets.keys.e = li('assets/control_keys/E.png');
    assets.keys.p = li('assets/control_keys/P.png');
    assets.keys.f = li('assets/control_keys/F.png');
    assets.keys.backspace    = li('assets/control_keys/BACKSPACE.png');
    assets.keys.backspaceAlt = li('assets/control_keys/BACKSPACEALTERNATIVE.png');

    // Logo frames
    assets.logoImgs = [
        li('assets/logo/logo_1.png'),
        li('assets/logo/logo_2.png'),
        li('assets/logo/logo_3.png'),
        li('assets/logo/logo_4.png'),
        li('assets/logo/logo_5.png')
    ];

    assets.uobLogo = li('assets/logo/uob_logo.png');
    assets.irisRunSheet = li('assets/characters/sprite_frames/sprite_sheets/spritesheet_east.png');
    assets.warningImg = li('assets/buttons/warning.png');
    assets.warningBox = li('assets/buttons/warning_box.png');
    assets.btnImg = li('assets/buttons/button.png');
    assets.button1Img = li('assets/buttons/button_1.png');
    assets.buttonStartImg = li('assets/buttons/button_start.png');
    assets.buttonHelpImg = li('assets/buttons/button_help.png');
    assets.buttonSettingImg = li('assets/buttons/button_setting.png');
    assets.buttonSkipImg = li('assets/buttons/button_skip.png');
    assets.backImg = li('assets/buttons/back.png');
    assets.pauseImg = li('assets/buttons/pause.png');
    assets.musicOn = li('assets/buttons/music_on.png');
    assets.musicOff = li('assets/buttons/music_off.png');


    // Preload all gameplay-critical obstacle and pickup sprites up front.
    for (const spritePath of collectAllGameplaySpritePaths()) {
        assets.obstacleSprites[spritePath] = loadImage(spritePath);
    }

    // Entity preview sprites reuse the preloaded gameplay assets where possible.
    if (!assets.previews) assets.previews = {};
    assets.previews['player'] = loadImage('assets/characters/wiki/Iris.png');
    assets.previews['npc_1'] = loadImage('assets/characters/wiki/Wiola.png');
    assets.previews['ambulance'] = assets.obstacleSprites['assets/obstacles/obstacle_ambulance.png'];
    assets.previews['bus'] = assets.obstacleSprites['assets/obstacles/obstacle_bus.png'];
    assets.previews['car_brown'] = assets.obstacleSprites['assets/obstacles/obstacle_car_brown.png'];
    assets.previews['car_red'] = assets.obstacleSprites['assets/obstacles/obstacle_car_red.png'];
    assets.previews['homeless'] = assets.obstacleSprites['assets/obstacles/obstacle_homeless.png'];
    assets.previews['promoter'] = assets.obstacleSprites['assets/obstacles/obstacle_promoter.png'];
    assets.previews['scooter_rider'] = assets.obstacleSprites['assets/obstacles/obstacle_scooter.png'];
    assets.previews['coffee'] = assets.obstacleSprites['assets/power_up/powerup_coffee.png'];
    assets.previews['motorcycle'] = assets.obstacleSprites['assets/power_up/powerup_motorcycle.png'];
    assets.previews['empty_scooter'] = assets.obstacleSprites['assets/power_up/powerup_scooter.png'];
    assets.previews['powerup_scooter'] = assets.previews['empty_scooter'];
    // Hazard previews for help screen
    assets.previews['puddle'] = assets.obstacleSprites['assets/obstacles/obstacle_puddle.png'];
    assets.previews['icecream'] = assets.obstacleSprites['assets/obstacles/obstacle_scoop_left.png'];
    assets.previews['kebab'] = assets.obstacleSprites['assets/obstacles/obstacle_kebab_left.png'];
    // Inventory item previews for help screen (backpack utility items)
    assets.previews['gummy_vitamins'] = assets.vitaminImg;
    assets.previews['tangle'] = assets.tangleImg;
    assets.previews['headphones'] = assets.headphoneImg;
    assets.previews['rain_boots'] = assets.rainbootImg;

    const portraitPath = 'assets/characters/portrait/';

    assets.portraitPlayerNormal = li(portraitPath + 'portrait_iris.png');
    assets.portraitWiola = li(portraitPath + 'portrait_wiola.png');
    assets.portraitLayla = li(portraitPath + 'portrait_layla.png');
    assets.portraitRaymond = li(portraitPath + 'portrait_raymond.png');
    assets.portraitLydia = li(portraitPath + 'portrait_lydia.png');
    assets.portraitCharlotte = li(portraitPath + 'portrait_charlotte.png');

    // Player directional frame animation (uses authored frame PNGs directly)
    assets.playerAnim = {};
    const dirs = ['north', 'south', 'west', 'east'];
    const frameFilesByDir = {
        north: ['frame_1.png', 'frame_2.png', 'frame_3.png', 'frame_4.png', 'frame_5.png'],
        south: ['frame_1.png', 'frame_2.png', 'frame_3.png', 'frame_4.png', 'frame_5.png'],
        west: ['frame_001.png', 'frame_002.png', 'frame_003.png', 'frame_004.png', 'frame_005.png'],
        east: ['frame_001.png', 'frame_002.png', 'frame_003.png', 'frame_004.png', 'frame_005.png']
    };

    dirs.forEach(d => {
        assets.playerAnim[d] = { walk: [], idle: null };

        if (d === 'north') {
            // Back-running animation uses the dedicated run spritesheet.
            loadImage('assets/characters/sprite_frames/sprite_sheets/spritesheet_run.png', (img) => {
                const fw = img.height;
                const fh = img.height;
                const totalFrames = max(1, floor(img.width / fw));
                for (let i = 0; i < totalFrames; i++) {
                    assets.playerAnim[d].walk.push(img.get(i * fw, 0, fw, fh));
                }
            });
        } else {
            frameFilesByDir[d].forEach((fileName) => {
                const path = `assets/characters/sprite_frames/${d}/${fileName}`;
                const frameImg = loadImage(path);
                assets.playerAnim[d].walk.push(frameImg);
            });
        }

        // Keep dedicated idle if present; fallback to first run frame.
        assets.playerAnim[d].idle = loadImage(
            `assets/characters/spritesheet/${d}.png`,
            () => { },
            () => { assets.playerAnim[d].idle = assets.playerAnim[d].walk[0]; }
        );
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2: ENGINE LIFECYCLE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * p5.js lifecycle hook: initialises the canvas and all system modules.
 */
function setup() {
    let cvs = createCanvas(GLOBAL_CONFIG.resolutionW, GLOBAL_CONFIG.resolutionH);
    cvs.parent('canvas-container');
    noSmooth();

    gameState = new GameState();
    mainMenu = new MainMenu();
    roomScene = new RoomScene();
    inventory = new InventorySystem();
    env = new Environment();
    player = new Player();
    obstacleManager = new ObstacleManager();
    backpackUI = new BackpackVisual(inventory, roomScene);
    levelController = new LevelController();
    endScreenManager = new EndScreenManager();
    leaderboardManager = new LeaderboardManager();
    testingPanel = new TestingPanel();
    feedbackLayer = new FeedbackLayer();
    tutorialDialogue = new DialogueBox();
    tutorialDialogue.timerMax = 300;   // 5 s — long enough to read tutorial page explanations
    tutorialSkipButton = new UIButton(
        1739,
        54,
        110,
        110,
        "SKIP",
        () => {
            if (typeof playSFX === "function") playSFX(sfxClick);
            beginTutorialSkipTransition();
        },
        "title",
        28,
        {
            forceSize: true,
            imageKey: "buttonSkipImg",
            noLabel: true
        }
    );

    textFont(fonts.jersey20 || fonts.body);

    // Restore saved brightness and apply CSS filter immediately.
    const savedBrightness = SaveSystem.loadBrightness();
    if (savedBrightness !== null) {
        masterBrightness = savedBrightness;
        if (mainMenu && mainMenu.brightnessSlider) mainMenu.brightnessSlider.value = masterBrightness;
    }
    applyBrightnessFilter(masterBrightness);

    // Remove white background from back.png so it renders with transparency on dark screens.
    if (assets.backImg) {
        assets.backImg.loadPixels();
        const px = assets.backImg.pixels;
        for (let i = 0; i < px.length; i += 4) {
            if (px[i] > 220 && px[i + 1] > 220 && px[i + 2] > 220) {
                px[i + 3] = 0;
            }
        }
        assets.backImg.updatePixels();
    }

    // Boot-phase loading is handled entirely by the HTML overlay.
    // All assets are guaranteed loaded by the time setup() runs (preload is complete).
    gameState.setState(STATE_WARNING);

    // Kick off background BGM downloads — they run in parallel and don't block anything.
    _loadDeferredBGM();

    if (developerMode) devApplyStartupSkip();

    //debugHookBGMCalls();
}

/**
 * p5.js lifecycle hook: main render loop — routes to the active scene each frame.
 */
function draw() {
    background(0);

    try {
        switch (gameState.currentState) {
            case STATE_LOADING:
                drawLoadingScreen();
                break;

            case STATE_CUTSCENE:
                drawCutsceneScreen();
                break;

            case STATE_WARNING:
                drawWarningScreen();
                break;

            case STATE_CREDITS:
                drawCreditsScreen();
                break;

            case STATE_SPLASH:
                drawSplashScreen();
                break;

            case STATE_MENU:
            case STATE_LEVEL_SELECT:
            case STATE_SETTINGS:
            case STATE_HELP:
            case STATE_DIFF_SELECT:
            case STATE_DIFF_CONFIRM:
            case STATE_LOAD_GAME:
                // Advance the splash→menu title enter animation (STATE_MENU only)
                if (gameState.currentState === STATE_MENU && _menuFromSplash) {
                    _menuEnterT = min(1, _menuEnterT + 1 / 35); // ~35 frames ≈ 0.6 s
                    if (_menuEnterT >= 1) _menuFromSplash = false;
                }

                if (mainMenu) {
                    mainMenu.menuState = gameState.currentState;
                    // Auto-colorize once the entrance animation finishes — keeps visible gray period
                    if (gameState.currentState === STATE_LEVEL_SELECT &&
                        typeof tutorialHints !== 'undefined' && mainMenu.timeWheel &&
                        !mainMenu.timeWheel.isEntering) {
                        let sel = mainMenu.timeWheel.selectedDay;
                        if (sel <= currentUnlockedDay) {
                            tutorialHints.dayVisuallyUnlocked[sel] = true;
                        }
                    }
                    mainMenu.display();
                }
                // Show tutorial page explanation overlay on SETTINGS and HELP pages
                if (tutorialDialogue) tutorialDialogue.display();
                break;

            case STATE_ROOM:
                if (roomScene) roomScene.display();
                if (player) {
                    // Block movement while the UI intro tutorial is showing
                    if (typeof tutorialHints === 'undefined' || tutorialHints.roomPhase !== 'UI_INTRO') {
                        player.update();
                    }
                    player.display();
                }
                // Dialogue box drawn last so it appears above player and tutorial panels
                if (roomScene) roomScene.displayOverlay();
                drawPauseButton();
                break;

            case STATE_INVENTORY:
                if (backpackUI) backpackUI.display();
                drawPauseButton();
                break;

            case STATE_DAY_RUN:
                runGameLoop();
                drawPauseButton();
                break;

            case STATE_TUTORIAL_SLIDES:
                drawTutorialSlidesScreen();
                break;

            case STATE_PAUSED:
                if (gameState.previousState === STATE_ROOM) {
                    if (roomScene) roomScene.display();
                    if (player) player.display();
                    // Don't show the UI_INTRO dialogue while the pause menu is open
                    // (that dialogue is introducing the pause button — no need inside the menu itself)
                    let _inUIIntro = typeof tutorialHints !== 'undefined' && tutorialHints.roomPhase === 'UI_INTRO';
                    if (roomScene && !_inUIIntro) roomScene.displayOverlay();
                } else if (gameState.previousState === STATE_DAY_RUN) {
                    if (env) env.display();
                    if (obstacleManager) obstacleManager.display();
                    if (player) player.display();
                    if (obstacleManager && typeof obstacleManager.renderPromoterEffects === 'function') {
                        obstacleManager.renderPromoterEffects();
                    }
                }
                renderPauseOverlay();
                // Show tutorial dialogue on top of pause overlay (e.g. STORY explanation)
                if (tutorialDialogue) tutorialDialogue.display();
                break;

            case STATE_FAIL:
                // Draw frozen gameplay behind the overlay.
                // If env is null (e.g. jumped here via dev shortcut), render a static
                // fallback so the screen is never just a blank dark rectangle.
                if (env) {
                    env.display();
                    if (obstacleManager) obstacleManager.display();
                    if (player) player.display();
                } else {
                    // Fallback: fill with the shared other-screen background
                    if (assets.otherBg) {
                        let s = max(width / assets.otherBg.width, height / assets.otherBg.height);
                        imageMode(CENTER);
                        image(assets.otherBg, width / 2, height / 2,
                            assets.otherBg.width * s, assets.otherBg.height * s);
                    }
                }
                if (endScreenManager) {
                    if (!endScreenManager._activeScreen) {
                        endScreenManager.activateFail(gameState.failReason || "EXHAUSTED");
                    }
                    endScreenManager.display();
                }
                break;

            case STATE_WIN:
                if (endScreenManager) {
                    if (!endScreenManager._activeScreen) {
                        // Unlock next day immediately so its warning icon appears on level select
                        if (currentDayID < 5) {
                            currentUnlockedDay = Math.max(currentUnlockedDay, currentDayID + 1);
                        }
                        endScreenManager.activateSuccess();
                        addPostLevelBadges();
                    }
                    endScreenManager.display();
                }

                break;

            case STATE_SAVE_CHOICE:
                drawSaveChoiceScreen();
                break;
        }
    } catch (e) {
        console.error("[Core Systems] Runtime Exception:", e);
    }

    if (feedbackLayer) {
        feedbackLayer.update();
        feedbackLayer.display();
    }

    // Auto-save tick (fires every 3 s during active gameplay states)
    if (typeof SaveSystem !== 'undefined') SaveSystem.tick();

    renderGlobalFade();

    // TestingPanel always draws on top of everything (dev overlay)
    if (testingPanel) testingPanel.draw();
}

// ─── ITEM TUTORIAL HELPERS ───────────────────────────────────────────────────

const _ITEM_TUTORIAL_TEXT = {
    "Soft Gummy Vitamins": "I'm losing steam... Wiola's gummies are right here. I should use one before it gets worse. Press E.",
    "Tangle": "Is that real coffee or the illusion one? I genuinely can't tell. I need the Tangle to help me focus — I can't afford to get confused right now. Press E to arm it.",
    "Headphones": "There's a promoter coming. Once they shove a flyer in my face I won't be able to see a thing. Headphones in, now. Press E to arm them.",
    "Rain Boots": "There's a puddle right there. I am not letting that drag my pace down today. Press E to arm the boots."
};

function _checkItemTutorialTriggers() {
    if (!player || !player.carriedUtilityItem) return;
    if (_itemTutorial.active) return;
    const item = player.carriedUtilityItem;
    let seen = false;
    try { seen = localStorage.getItem('pss_itemTutSeen_' + item) === '1'; } catch (e) {}
    if (seen) return;

    // Obstacle must be within the bottom half of the screen (near Iris) to trigger.
    const nearThresholdTop = PLAYER_RUN_FOOT_Y - height * 0.5;

    let triggered = false;
    if (item === "Soft Gummy Vitamins") {
        triggered = player.health <= player.maxHealth * 0.5;
    } else if (item === "Tangle") {
        triggered = !!(obstacleManager && obstacleManager.obstacles.some(
            o => o && o.type === "FANTASY_COFFEE" && o.y > nearThresholdTop && o.y <= PLAYER_RUN_FOOT_Y));
    } else if (item === "Headphones") {
        triggered = !!(obstacleManager && obstacleManager.obstacles.some(
            o => o && o.type === "PROMOTER" && o.y > nearThresholdTop && o.y <= PLAYER_RUN_FOOT_Y));
    } else if (item === "Rain Boots") {
        triggered = !!(obstacleManager && obstacleManager.obstacles.some(
            o => o && o.type === "PUDDLE" && o.y > nearThresholdTop && o.y <= PLAYER_RUN_FOOT_Y));
    }
    if (triggered) {
        _itemTutorial.active = true;
        _itemTutorial.item = item;
        _itemTutorial.frame = frameCount;
    }
}

function _drawItemTutorialOverlay() {
    if (!_itemTutorial.active) return;

    if (!_itemTutorialDB) {
        _itemTutorialDB = new DialogueBox();
        _itemTutorialDB.persistent = true;
    }

    // Semi-transparent full-screen mask
    push();
    noStroke();
    fill(0, 0, 0, 160);
    rectMode(CORNER);
    rect(0, 0, width, height);
    pop();

    // ── Backpack icon (natural pulse from drawBackpackIcon) ──────────────────
    if (player) {
        player.drawBackpackIcon(30, 21);
    }

    // ── Item-specific: re-render relevant element above mask (no glow) ──────
    if (_itemTutorial.item === "Soft Gummy Vitamins" && player) {
        player.drawHealthBar(210, 111);
    } else if (obstacleManager) {
        const typeMap = {
            "Tangle":     "FANTASY_COFFEE",
            "Headphones": "PROMOTER",
            "Rain Boots": "PUDDLE"
        };
        const obsType = typeMap[_itemTutorial.item];
        if (obsType) {
            const nearTop = PLAYER_RUN_FOOT_Y - height * 0.5;
            const closest = obstacleManager.obstacles
                .filter(o => o && o.type === obsType && o.y > nearTop && o.y <= PLAYER_RUN_FOOT_Y)
                .reduce((best, o) => (!best || o.y > best.y ? o : best), null);
            if (closest) {
                push();
                imageMode(CENTER);
                const img = typeof obstacleManager.getSpriteImage === 'function'
                    ? obstacleManager.getSpriteImage(closest.spritePath) : null;
                if (img) image(img, closest.x, closest.y, closest.width, closest.height);
                pop();
            }
        }
    }

    // ── Iris inner-monologue dialogue box ────────────────────────────────────
    const lineText = _ITEM_TUTORIAL_TEXT[_itemTutorial.item];
    if (lineText && _itemTutorialDB) {
        if (!_itemTutorialDB.active) {
            const portrait = (typeof assets !== 'undefined' && assets.portraitPlayerNormal)
                ? assets.portraitPlayerNormal : null;
            _itemTutorialDB.trigger(lineText, portrait, "Iris");
        }
        _itemTutorialDB.display();
    }
}

/**
 * Updates all game-world systems for a single frame during the run state.
 */
function runGameLoop() {
    const levelPhase = levelController ? levelController.getLevelPhase() : "RUNNING";
    const freezeGameplay = (_itemTutorial.active) ||
        (feedbackLayer && typeof feedbackLayer.isHitStopActive === "function"
            ? feedbackLayer.isHitStopActive()
            : false);

    if (!freezeGameplay) {
        if (levelController) { levelController.update(); }
        if (env) { env.update(GLOBAL_CONFIG.scrollSpeed); }
        if (obstacleManager) { obstacleManager.update(GLOBAL_CONFIG.scrollSpeed, player, levelPhase); }
        if (player) { player.update(); }
        _checkItemTutorialTriggers();
    }

    const currentLevelPhase = levelController ? levelController.getLevelPhase() : levelPhase;
    if (!runSuccessTransition.played &&
        currentLevelPhase === "VICTORY_TRANSITION" &&
        levelController &&
        !levelController.failSettlementPending) {
        beginRunSuccessTransition();
    }

    let cameraOffset = { x: 0, y: 0 };
    if (feedbackLayer && typeof feedbackLayer.getCameraOffset === "function") {
        cameraOffset = feedbackLayer.getCameraOffset();
    }

    push();
    translate(cameraOffset.x, cameraOffset.y);
    if (env) env.display();
    if (obstacleManager) obstacleManager.display();
    if (player) player.display();
    if (obstacleManager && typeof obstacleManager.renderPromoterEffects === 'function') {
        obstacleManager.renderPromoterEffects();
    }
    pop();

    if (levelController) { levelController.display(); }
    _drawItemTutorialOverlay();
    updateRunSuccessTransition();
    renderRunSuccessTransitionOverlay();
    if (runSuccessTransition.active &&
        env &&
        typeof env.drawVictoryMadeText === 'function' &&
        levelController) {
        const overlayPhase = levelController.getLevelPhase();
        if (overlayPhase === "VICTORY_TRANSITION") {
            const preRoll = Math.max(0, Number(levelController.victoryPreRollDistance) || 0);
            const destinationProgress = (env.scrollPos - levelController.victoryStartScrollPos) - preRoll;
            if (destinationProgress >= 0) {
                env.drawVictoryMadeText(destinationProgress, true);
            }
        } else if (overlayPhase === "VICTORY_ZONE") {
            env.drawVictoryMadeText(0, false);
        }
    }

    // Settlement reached in story mode -> black screen + door SFX (2s) -> library cutscene.
    if (!freezeGameplay && levelController) {
        const settlementResult = levelController.checkSettlementPoint();
        if (settlementResult === "WIN") {
            if (!_winCutscenePending) {
                _winCutscenePending = true;
                let day = currentDayID;
                console.log(`[runGameLoop] Settlement -> library entry transition -> NPC cutscene Day ${day}`);

                triggerLibraryEntryTransition(() => {
                    if (typeof DIALOGUE_DATA !== 'undefined' && DIALOGUE_DATA.day_npc_start && DIALOGUE_DATA.day_npc_start[day]) {
                        // Day 5 endings lead directly to credits (no WIN end-screen)
                        const _onCsComplete = (day === 5)
                            ? () => { triggerTransition(() => { if (typeof resetCredits === 'function') resetCredits(); gameState.setState(STATE_CREDITS); }); }
                            : () => { triggerTransition(() => gameState.setState(STATE_WIN)); };
                        startCutsceneFromNode(DIALOGUE_DATA.day_npc_start[day], _onCsComplete);
                    } else {
                        startCutscene('library', CS_DAY_NPC[day], () => {
                            triggerTransition(() => gameState.setState(STATE_WIN));
                        });
                    }
                });
            }
        }
    }
}


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3: AUDIO
// ─────────────────────────────────────────────────────────────────────────────

// ─── SFX ANTI-SPAM / ANTI-LAYER ─────────────────────────────────────────────
const _sfxCooldownUntil = Object.create(null);  // {id: timestamp}

/**
 * Plays a sound effect with global volume + anti-spam protection.
 */
function playSFX(sound, opt = {}) {
    try {

        // 1. basic check
        if (!sound || typeof sound.isLoaded !== 'function' || !sound.isLoaded()) {
            return;
        }

        // 2. Ensure ID and attribute
        const id = opt.id || sound._url || 'SFX';
        const isUI = !!opt.ui || sound === sfxSelect || sound === sfxClick;

        // Inside the `playSFX(){try}, add the following before the cooldown check:
        if (__sfxFrame !== frameCount) {
            // Clear at the beginning of each frame
            __sfxFrame = frameCount;
            __sfxCounts = Object.create(null);
        }

        __sfxCounts[id] = (__sfxCounts[id] || 0) + 1;

        // 3. cooldownMs logic
        const cooldownMs = (typeof opt.cooldownMs === 'number') ? opt.cooldownMs : (isUI ? 80 : 150);
        const now = performance.now();
        if (now < (_sfxCooldownUntil[id] || 0)) return;
        _sfxCooldownUntil[id] = now + cooldownMs;

        // 4. Mono/overlay logic processing
        const monophonic = (typeof opt.monophonic === 'boolean') ? opt.monophonic : (!isUI);

        if (monophonic && typeof sound.isPlaying === 'function' && sound.isPlaying()) {
            // Optimization: Use jump(0) to reduce the overhead of reconnecting nodes.
            try {
                sound.jump(0);
            } catch (jumpErr) {
                sound.stop();
                sound.play();
            }
        } else {
            // 5. Adjust volume and play. opt.volumeScale (0–1) scales master SFX volume.
            const masterVol = (typeof masterVolumeSFX === 'number') ? masterVolumeSFX : 0.5;
            const scale = (typeof opt.volumeScale === 'number') ? constrain(opt.volumeScale, 0, 1) : 1;
            sound.setVolume(masterVol * scale);
            sound.play();
        }

    } catch (e) {
        // Capture all potential errors to prevent audio issues from crashing the game logic.
        console.warn('[SFX] playSFX internal error:', e);
    }
    if (frameCount % 30 === 0) {
        let topId = null, topN = 0;
        for (const k in __sfxCounts) {
            if (__sfxCounts[k] > topN) { topN = __sfxCounts[k]; topId = k; }
        }
        if (topN > 3) console.warn("[AUDIO] top playSFX calls:", topId, topN, __sfxCounts);
    }
}


/**
 * Resolves a string SFX key (used in dialogue node `sfx` fields) to the actual p5.SoundFile object.
 */
function _resolveSFX(key) {
    const map = {
        'car_crash': sfxHitBigCar,
        'alarm_buzz': sfxRoomClock,
        'heartbeat_short': sfxHeartbeatShort,
        'heartbeat_climax': sfxHeartbeatClimax,
    };
    return map[key] || null;
}

/**
 * Resolves a string key and starts the sound looping (used in dialogue node `loop_sfx` fields).
 * Stops any currently looping dialogue SFX first (replacement semantics).
 */
function _resolveAndLoopSFX(key) {
    const map = {
        'ambulance': sfxAmbulance,
        'heartbeat_short': sfxHeartbeatShort,
        'heartbeat_climax': sfxHeartbeatClimax,
    };
    // Stop all loopable dialogue SFX before starting a new one
    for (const sfx of Object.values(map)) {
        if (sfx) {
            try { if (typeof sfx.isPlaying === 'function' && sfx.isPlaying()) sfx.stop(); } catch (e) { }
        }
    }
    const sfx = map[key];
    if (sfx && typeof sfx.isLoaded === 'function' && sfx.isLoaded()) {
        const vol = typeof masterVolumeSFX === 'number' ? masterVolumeSFX : 0.5;
        sfx.setVolume(vol);
        sfx.loop();
    }
}

/**
 * Stops a named looping SFX (used in dialogue node `stop_sfx` fields).
 */
function _stopSFX(key) {
    const map = {
        'ambulance': sfxAmbulance,
        'heartbeat_short': sfxHeartbeatShort,
        'heartbeat_climax': sfxHeartbeatClimax,
    };
    const sfx = map[key];
    if (sfx) {
        try {
            if (typeof sfx.isPlaying === 'function' && sfx.isPlaying()) sfx.stop();
        } catch (e) {
            console.warn('[AUDIO] _stopSFX failed:', key, e);
        }
    }
}

/**
 * Starts a named BGM track during a node-based cutscene (dialogue node `music` field).
 * Keys: "death" → bgms.EndD, "life_inst" → bgms.EndL_inst
 */
function _playDialogueMusicTrack(key) {
    let track = null;
    if (key === 'death') track = bgms.EndD;
    if (key === 'life_inst') track = bgms.EndL_inst;
    if (!track) return;

    try {
        Object.keys(bgms).forEach(k => {
            const s = bgms[k];
            if (s && typeof s.isPlaying === 'function' && s.isPlaying()) {
                s.stop();
            }
        });
    } catch (e) { }

    try {
        const vol = typeof masterVolumeBGM === 'number' ? masterVolumeBGM : 0.25;

        track.stop();
        track.setVolume(0);

        setTimeout(() => {
            try {
                track.setVolume(vol);
                track.play();
            } catch (e2) {
                console.warn('[AUDIO] delayed _playDialogueMusicTrack failed:', key, e2);
            }
        }, 30);
    } catch (e) {
        console.warn('[AUDIO] _playDialogueMusicTrack failed:', key, e);
    }
}

/**
 * Stops all dialogue SFX and BGM (used before starting a new ending music track).
 */
function _stopAllDialogueAudio() {
    const sfxList = [sfxHeartbeatShort, sfxHeartbeatClimax, sfxAmbulance];
    for (const s of sfxList) {
        if (!s) continue;
        try { if (typeof s.isPlaying === 'function' && s.isPlaying()) s.stop(); } catch (e) { }
    }
    try {
        if (typeof BGM !== 'undefined' && BGM && typeof BGM.stop === 'function') BGM.stop();
    } catch (e) { }
}

/**
 * Stops pending/playing fail end audio.
 */
function stopFailEndAudio() {
    if (failEndAudioTimer) {
        clearTimeout(failEndAudioTimer);
        failEndAudioTimer = null;
    }

    const failAudioList = [sfxAmbulance, sfxHeartbeat];

    for (const s of failAudioList) {
        if (!s) continue;
        try {
            if (typeof s.isPlaying === 'function' && s.isPlaying()) {
                s.stop();
            }
        } catch (e) {
            console.warn('[AUDIO] stopFailEndAudio failed:', e);
        }
    }
}

/**
 * On FAIL: stop current BGM immediately, wait ~2s, then play fail audio once.
 * Day 1-4 -> ambulance
 * Day 5   -> heartbeat
 */
function playFailEndAudio() {
    const day = (typeof currentDayID === 'number') ? currentDayID : 1;
    const failSound = (day === 5) ? sfxHeartbeat : sfxAmbulance;

    if (!failSound) return;

    // Cancel any pending fail-audio trigger first
    if (failEndAudioTimer) {
        clearTimeout(failEndAudioTimer);
        failEndAudioTimer = null;
    }

    // Stop current BGM immediately
    try {
        if (typeof BGM !== 'undefined' && BGM && typeof BGM.stop === 'function') {
            BGM.stop();
        }
    } catch (e) {
        console.warn('[AUDIO] Failed to stop BGM on fail:', e);
    }

    // Schedule fail audio after a short silent buffer
    failEndAudioTimer = setTimeout(() => {
        failEndAudioTimer = null;

        try {
            const vol = (typeof masterVolumeSFX === 'number') ? masterVolumeSFX : 0.5;

            failSound.stop();   // ensure clean restart
            failSound.setVolume(vol);
            failSound.play();
        } catch (e) {
            console.warn('[AUDIO] playFailEndAudio failed:', e);
        }
    }, 1200);
}

/**
 * On WIN (Day 1-4): stop current BGM, then play win audio once.
 * Day 5 uses its own ending BGM, so do nothing there.
 */
function playWinEndAudio() {
    const day = (typeof currentDayID === 'number') ? currentDayID : 1;

    // Day 5 should keep its own ending BGM logic
    if (day >= 5) return;
    if (!sfxGameWin) return;

    try {
        if (typeof BGM !== 'undefined' && BGM && typeof BGM.stop === 'function') {
            BGM.stop();
        }
    } catch (e) {
        console.warn('[AUDIO] Failed to stop BGM on win:', e);
    }

    try {
        const vol = (typeof masterVolumeBGM === 'number') ? masterVolumeBGM : 0.25;

        sfxGameWin.stop();
        sfxGameWin.setVolume(vol);
        sfxGameWin.play();
    } catch (e) {
        console.warn('[AUDIO] playWinEndAudio failed:', e);
    }
}

/**
 * Stops win end audio if it is still playing.
 */
function stopWinEndAudio() {
    if (!sfxGameWin) return;

    try {
        if (typeof sfxGameWin.isPlaying === 'function' && sfxGameWin.isPlaying()) {
            sfxGameWin.stop();
        }
    } catch (e) {
        console.warn('[AUDIO] stopWinEndAudio failed:', e);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4: TRANSITIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Starts a fade-to-black transition. Calls onBlackout at peak opacity,
 * then fades back in. Ignored if a transition is already running.
 */
function triggerTransition(onBlackout) {
    if (globalFade.isFading) return;
    globalFade.isFading = true;
    globalFade.dir = 1;
    globalFade.alpha = 0;
    globalFade.callback = onBlackout;
}

function resetRunSuccessTransition(preservePlayed = false) {
    runSuccessTransition.active = false;
    runSuccessTransition.played = preservePlayed ? runSuccessTransition.played : false;
    runSuccessTransition.alpha = 0;
    runSuccessTransition.phase = 'idle';
    runSuccessTransition.holdFrames = 0;
    runSuccessTransition.onComplete = null;
}

function getVictoryPlayerCenterX() {
    const lane2 = Number(GLOBAL_CONFIG && GLOBAL_CONFIG.lanes && GLOBAL_CONFIG.lanes.lane2);
    const lane3 = Number(GLOBAL_CONFIG && GLOBAL_CONFIG.lanes && GLOBAL_CONFIG.lanes.lane3);
    if (Number.isFinite(lane2) && Number.isFinite(lane3)) {
        return (lane2 + lane3) * 0.5;
    }
    return width * 0.5;
}

function movePlayerToVictoryRevealPosition() {
    if (!player) return;
    player.x = getVictoryPlayerCenterX();
    if (typeof player.forceForwardRunPose === 'function') {
        player.forceForwardRunPose();
    }
}

function beginRunSuccessTransition(onComplete) {
    if (runSuccessTransition.active || globalFade.isFading) return;
    runSuccessTransition.active = true;
    runSuccessTransition.played = true;
    runSuccessTransition.alpha = 0;
    runSuccessTransition.phase = 'fade_in';
    runSuccessTransition.holdFrames = 0;
    runSuccessTransition.onComplete = onComplete || null;
}

function updateRunSuccessTransition() {
    if (!runSuccessTransition.active) return;

    if (runSuccessTransition.phase === 'fade_in') {
        runSuccessTransition.alpha = min(255, runSuccessTransition.alpha + runSuccessTransition.fadeInSpeed);
        if (runSuccessTransition.alpha >= 255) {
            movePlayerToVictoryRevealPosition();
            runSuccessTransition.phase = 'black_hold';
            runSuccessTransition.holdFrames = 60;
        }
        return;
    }

    if (runSuccessTransition.phase === 'black_hold') {
        runSuccessTransition.alpha = 255;
        runSuccessTransition.holdFrames--;
        if (runSuccessTransition.holdFrames <= 0) {
            runSuccessTransition.phase = 'fade_out';
        }
        return;
    }

    if (runSuccessTransition.phase === 'fade_out') {
        runSuccessTransition.alpha = max(0, runSuccessTransition.alpha - runSuccessTransition.fadeOutSpeed);
        if (runSuccessTransition.alpha <= 0) {
            runSuccessTransition.phase = 'reveal_hold';
            runSuccessTransition.holdFrames = runSuccessTransition.revealFrames;
        }
        return;
    }

    if (runSuccessTransition.phase === 'reveal_hold') {
        runSuccessTransition.alpha = 0;
        runSuccessTransition.holdFrames--;
        if (runSuccessTransition.holdFrames <= 0) {
            const done = runSuccessTransition.onComplete;
            resetRunSuccessTransition(true);
            if (typeof done === 'function') done();
        }
    }
}

function renderRunSuccessTransitionOverlay() {
    if (!runSuccessTransition.active || runSuccessTransition.alpha <= 0) return;
    push();
    noStroke();
    fill(0, runSuccessTransition.alpha);
    rect(0, 0, width, height);
    pop();
}

/**
 * Special transition used only when entering the library after DayRun.
 * Fade to black -> immediately play door SFX -> hold black for 2s -> switch to library -> fade in.
 */
function triggerLibraryEntryTransition(onAfterBlackout) {
    if (globalFade.isFading) return;

    // Reset special hold fields first
    globalFade.holdUntilMs = 0;
    globalFade.holdDoneCallback = null;

    triggerTransition(() => {
        // At full black, stop current BGM first
        if (typeof BGM !== 'undefined' && BGM && typeof BGM.stop === 'function') {
            BGM.stop();
        }

        // Then play the door SFX immediately (Day 5 uses heartbeat instead — no door sound)
        if (currentDayID !== 5 && typeof playSFX === 'function' && sfxDoorOpen) {
            playSFX(sfxDoorOpen, {
                id: 'door_open_library',
                cooldownMs: 300,
                monophonic: true
            });
        }

        // Hold black for 2 seconds
        globalFade.holdUntilMs = performance.now() + 2000;

        // After the black hold finishes, continue into the library cutscene
        globalFade.holdDoneCallback = () => {
            if (typeof onAfterBlackout === 'function') {
                onAfterBlackout();
            }
        };
    });
}

/**
 * Special transition used only when entering the library after DayRun.
 * Fade to black -> play door SFX while holding black for 2s -> enter library cutscene.
 */
function renderGlobalFade() {
    if (!globalFade.isFading && globalFade.alpha <= 0) return;

    const now = performance.now();

    // Fade in to black
    if (globalFade.dir === 1) {
        globalFade.alpha += globalFade.speed;

        if (globalFade.alpha >= 255) {
            globalFade.alpha = 255;

            if (globalFade.callback) {
                try {
                    const cb = globalFade.callback;
                    globalFade.callback = null; // ensure callback only runs once
                    cb();
                } catch (e) {
                    console.error('[Transition] callback crashed:', e);
                }
            }

            // Only special transitions will configure a black-screen hold.
            if (globalFade.holdUntilMs && now < globalFade.holdUntilMs) {
                globalFade.dir = 0; // hold on black
            } else {
                globalFade.dir = -1; // normal fade out
            }
        }
    }
    // Hold on full black
    else if (globalFade.dir === 0) {
        globalFade.alpha = 255;

        if (!globalFade.holdUntilMs || now >= globalFade.holdUntilMs) {
            if (globalFade.holdDoneCallback) {
                try {
                    const cb = globalFade.holdDoneCallback;
                    globalFade.holdDoneCallback = null;
                    cb();
                } catch (e) {
                    console.error('[Transition] holdDoneCallback crashed:', e);
                }
            }

            globalFade.holdUntilMs = 0;
            globalFade.dir = -1;
        }
    }
    // Fade out from black
    else if (globalFade.dir === -1) {
        globalFade.alpha -= globalFade.speed;

        if (globalFade.alpha <= 0) {
            globalFade.alpha = 0;
            globalFade.isFading = false;
            globalFade.callback = null;
            globalFade.holdUntilMs = 0;
            globalFade.holdDoneCallback = null;
            // Restore speed if a scene fade set a reset value
            if (globalFade._resetSpeed !== undefined) {
                globalFade.speed = globalFade._resetSpeed;
                globalFade._resetSpeed = undefined;
            }
        }
    }

    push();
    noStroke();
    fill(0, globalFade.alpha);
    rect(0, 0, width, height);
    pop();
}


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5: INPUT HANDLING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Dispatches keyboard events to the appropriate scene or system handler.
 */
function keyPressed() {
    // Testing panel hotkey is always available, even during transitions/end screens.
    if ((keyCode === 113 || keyCode === 192 || key === 'F2' || key === '`' || key === '~') && testingPanel) {
        testingPanel.toggle();
        return false;
    }

    if (globalFade.isFading) return;
    let state = gameState.currentState;

    // Cutscene: Enter/Space advances dialogue (routed through csClick so cinematic ending is handled identically to mouse)
    if (state === STATE_CUTSCENE) {
        if (keyCode === ENTER || keyCode === 13 || key === ' ') csClick(mouseX, mouseY);
        return;
    }

    // Save-choice screen navigation
    if (state === STATE_SAVE_CHOICE) {
        if (keyCode === UP_ARROW || keyCode === 87 || keyCode === DOWN_ARROW || keyCode === 83) {
            _saveChoiceIndex = (_saveChoiceIndex + 1) % 2;
            if (typeof playSFX === 'function') playSFX(sfxSelect);
        } else if (key === 'e' || key === 'E') {
            _onSaveChoiceExecute(0);
        } else if (keyCode === ENTER || keyCode === 13) {
            _onSaveChoiceExecute(_saveChoiceIndex);
        }
        return;
    }

    // Credits screen: any key skips scroll/pause → poem, or exits poem → menu
    if (state === STATE_CREDITS) {
        if (_creditPhase === 'poem' && _creditPoemAlpha >= 255) {
            if (_day5Ending === 'stay') {
                _day5Ending = null;
                triggerTransition(() => startCutscene('library', CS_DAY5_STAY, () => {
                    triggerTransition(() => { gameState.resetFlags(); gameState.setState(STATE_MENU); });
                }));
            } else {
                triggerTransition(() => { gameState.resetFlags(); gameState.setState(STATE_MENU); });
            }
        } else if (_creditPhase !== 'poem') {
            _creditPhase = 'poem'; _creditPoemAlpha = 0;
        }
        return;
    }

    // Fullscreen toggle — F key, available in all states
    if (key === 'f' || key === 'F') { toggleFullscreen(); return; }

    // Toggle developer mode
    if (key === '0') devToggle();

    // Toggle TestingPanel with backtick (`) or F2
    if (key === '`' || keyCode === 113) {
        if (testingPanel) testingPanel.toggle();
        return;
    }

    // If TestingPanel is open, route all keys to it and block everything else
    if (testingPanel && testingPanel.isVisible()) {
        if (testingPanel.handleKeyPressed(key, keyCode)) return false;
    }

    // Lock all input while the level-select entrance animation plays
    if (state === STATE_LEVEL_SELECT &&
        mainMenu && mainMenu.timeWheel && mainMenu.timeWheel.isEntering) return;

    // Dev shortcuts: 8 = instant WIN, 9 = instant FAIL
    if (developerMode) {
        if (key === '8') { devGoToWin(); return; }
        if (key === '9') { devGoToFail("EXHAUSTED"); return; }
    }



    // Pause / unpause — available in most gameplay states
    if (key === 'p' || key === 'P') {
        if (state !== STATE_MENU && state !== STATE_LEVEL_SELECT &&
            state !== STATE_SETTINGS && state !== STATE_HELP &&
            state !== STATE_SPLASH &&
            state !== STATE_WARNING &&
            state !== STATE_CREDITS &&
            state !== STATE_CUTSCENE &&
            state !== STATE_DIFF_SELECT && state !== STATE_DIFF_CONFIRM && state !== STATE_LOAD_GAME) {
            playSFX(sfxClick);
            playSFX(sfxClick);
            togglePause();
            pauseIndex = -1;
            showRestartChoice = false;
            showRestartConfirm = false;
            showStoryRecap = false;
            showExitConfirm = false;
            return;
        }
    }

    // Pause menu navigation
    if (state === STATE_PAUSED) {
        if (showStoryRecap) {
            // story recap arrow keys / ESC — storyScrollOffset is now pixel-based
            let _step = (_storyScrollbar._scrollStep || 36);
            if (keyCode === UP_ARROW || keyCode === 87) {
                if (storyScrollOffset <= 0 && storyRecapDay > 0) {
                    storyRecapDay--;
                    storyScrollOffset = 999999; // clamped to real maxScroll by render
                } else {
                    storyScrollOffset = max(0, storyScrollOffset - _step);
                }
                if (typeof playSFX === 'function') playSFX(sfxSelect);
            } else if (keyCode === DOWN_ARROW || keyCode === 83) {
                let maxScroll = _storyScrollbar.maxScroll || 0;
                if (storyScrollOffset >= maxScroll && storyRecapDay + 1 <= 5) {
                    storyRecapDay++;
                    storyScrollOffset = 0;
                } else {
                    storyScrollOffset = min(maxScroll, storyScrollOffset + _step);
                }
                if (typeof playSFX === 'function') playSFX(sfxSelect);
            } else if (keyCode === BACKSPACE) {
                showStoryRecap = false;
                pauseIndex = -1;
            }
            return;
        } else if (showRestartConfirm) {
            if (keyCode === UP_ARROW || keyCode === 87 || keyCode === DOWN_ARROW || keyCode === 83) {
                if (typeof playSFX === 'function') playSFX(sfxSelect);
                restartConfirmIndex = (restartConfirmIndex < 0) ? 0 : (restartConfirmIndex + 1) % RESTART_CONFIRM_OPTIONS.length;
            } else if ((keyCode === ENTER || keyCode === 13) && restartConfirmIndex >= 0) {
                if (typeof playSFX === 'function') playSFX(sfxClick);
                handleRestartConfirm();
            } else if (keyCode === BACKSPACE) {
                showRestartConfirm = false;
                restartConfirmIndex = -1;
            }
            return;
        } else if (showExitConfirm) {
            if (keyCode === UP_ARROW || keyCode === 87 || keyCode === DOWN_ARROW || keyCode === 83) {
                if (typeof playSFX === 'function') playSFX(sfxSelect);
                exitConfirmIndex = (exitConfirmIndex < 0) ? 0 : (exitConfirmIndex + 1) % EXIT_CONFIRM_OPTIONS.length;
            } else if ((keyCode === ENTER || keyCode === 13) && exitConfirmIndex >= 0) {
                if (typeof playSFX === 'function') playSFX(sfxClick);
                handleExitConfirm();
            } else if (keyCode === BACKSPACE) {
                showExitConfirm = false;
                exitConfirmIndex = -1;
            }
            return;
        } else if (showRestartChoice) {
            if (keyCode === UP_ARROW || keyCode === 87 || keyCode === DOWN_ARROW || keyCode === 83) {
                if (typeof playSFX === 'function') playSFX(sfxSelect);
                restartChoiceIndex = (restartChoiceIndex < 0) ? 0 : (restartChoiceIndex + 1) % RESTART_OPTIONS.length;
            } else if ((keyCode === ENTER || keyCode === 13) && restartChoiceIndex >= 0) {
                if (typeof playSFX === 'function') playSFX(sfxClick);
                handleRestartChoice();
            } else if (keyCode === BACKSPACE) {
                showRestartChoice = false;
                pauseIndex = -1;
            }
            return;
        } else {
            let options = getPauseOptions();
            if (keyCode === UP_ARROW || keyCode === 87 || keyCode === DOWN_ARROW || keyCode === 83) {
                if (typeof playSFX === 'function') playSFX(sfxSelect);
                if (pauseIndex < 0) {
                    pauseIndex = (keyCode === UP_ARROW || keyCode === 87) ? options.length - 1 : 0;
                } else if (keyCode === UP_ARROW || keyCode === 87) {
                    pauseIndex = (pauseIndex - 1 + options.length) % options.length;
                } else {
                    pauseIndex = (pauseIndex + 1) % options.length;
                }
            } else if ((keyCode === ENTER || keyCode === 13) && pauseIndex >= 0) {
                playSFX(sfxClick);
                handlePauseSelection();
            } else if (keyCode === BACKSPACE) {
                togglePause();
                pauseFromState = null;
                showStoryRecap = false;
            }
        }
        return;
    }

    // Item tutorial: E press activates item + dismisses tutorial
    if (_itemTutorial.active && (key === 'e' || key === 'E' || keyCode === 69)) {
        if (player && typeof player.activateUtilityItem === 'function') {
            player.activateUtilityItem();
        }
        try { localStorage.setItem('pss_itemTutSeen_' + _itemTutorial.item, '1'); } catch (e) {}
        _itemTutorial.active = false;
        _itemTutorial.item = null;
        if (_itemTutorialDB) _itemTutorialDB.reset();
        return false;
    }

    // Utility item activation: E key
    if (state === STATE_DAY_RUN && (key === 'e' || key === 'E' || keyCode === 69)) {
        if (player && typeof player.activateUtilityItem === "function") {
            if (player.activateUtilityItem()) return false;
        }
    }

    // Promoter leaflet interaction: SPACE is consumed by obstacle system while active.
    if (state === STATE_DAY_RUN && player &&
        typeof player.handlePuddleEscapePress === 'function' &&
        (keyCode === 32 || key === ' ')) {
        if (player.handlePuddleEscapePress()) return false;
    }

    // Promoter leaflet interaction: SPACE is consumed by obstacle system while active.
    if (state === STATE_DAY_RUN && obstacleManager &&
        typeof obstacleManager.handlePromoterSpacePress === 'function' &&
        (keyCode === 32 || key === ' ')) {
        if (obstacleManager.handlePromoterSpacePress(player)) return false;
    }

    if (state === STATE_TUTORIAL_SLIDES) {
        if ((keyCode === ENTER || keyCode === 13 || keyCode === 32 || key === ' ') &&
            _tutorialIntroIndex >= 0) {
            _advanceTutorialIntro();
        }
        return false;
    }

    // Menu navigation
    if (state === STATE_MENU || state === STATE_LEVEL_SELECT ||
        state === STATE_SETTINGS || state === STATE_HELP ||
        state === STATE_DIFF_SELECT || state === STATE_DIFF_CONFIRM || state === STATE_LOAD_GAME) {
        if (mainMenu) mainMenu.handleKeyPress(key, keyCode);
    }
    // Room navigation + inventory toggle (E key handled inside roomScene — desk-proximity gated)
    else if (state === STATE_ROOM) {
        if (roomScene) roomScene.handleKeyPress(keyCode);
    }
    // Retry from end screen
    else if (state === STATE_FAIL || state === STATE_WIN) {
        if (endScreenManager) endScreenManager.handleKeyPress(keyCode);
        else if (keyCode === ENTER || keyCode === 13) {
            playSFX(sfxClick);
            setupRun(currentDayID);
        }
    }

    // Inventory keyboard navigation (A/D to select, ENTER to pack, ESC handled below)
    // P key passes through to the pause toggle above; F key already returned earlier.
    if (gameState.currentState === STATE_INVENTORY && keyCode !== BACKSPACE && key !== 'p' && key !== 'P') {
        if (backpackUI) backpackUI.handleKeyPress(keyCode);
        return false;
    }

    // Close inventory with Backspace
    if (gameState.currentState === STATE_INVENTORY && keyCode === BACKSPACE) {
        if (backpackUI) backpackUI.onClose();
        if (tutorialHints.roomPhase === 'CLOSE_BP') {
            if (backpackUI && backpackUI.hasRequiredItems()) {
                tutorialHints.roomPhase = (currentDayID === 1) ? 'DOOR' : 'DONE';
            } else {
                // Required items not yet packed — keep desk hint active
                tutorialHints.roomPhase = 'DESK';
            }
        }
        gameState.currentState = STATE_ROOM;
        return false;
    }
}

/**
 * Executes the selected option in the pause menu.
 */
function handlePauseSelection() {
    let options = getPauseOptions();
    let selected = options[pauseIndex];

    if (selected === "RESUME") {
        togglePause();
        pauseFromState = null;
    } else if (selected === "STORY") {
        newBadges.delete("pause.STORY");
        showStoryRecap = true;
        storyRecapDay = 0;   // open at Prologue (day 0); Days 1-5 follow
        storyScrollOffset = 0;
    } else if (selected === "SETTINGS") {
        newBadges.delete("pause.SETTINGS");
        pauseFromState = gameState.previousState;
        if (typeof playSFX === 'function') playSFX(sfxClick);
        mainMenu.diffToastTimer = 0;
        gameState.currentState = STATE_SETTINGS;
        mainMenu.menuState = STATE_SETTINGS;
    } else if (selected === "HELP") {
        helpPagesVisited.clear();
        helpPagesVisited.add(0);  // page 0 is shown on open
        if (helpPagesVisited.size < 4) newBadges.add("help.pages");
        pauseFromState = gameState.previousState;
        if (typeof playSFX === 'function') playSFX(sfxClick);
        gameState.currentState = STATE_HELP;
        mainMenu.menuState = STATE_HELP;
        mainMenu.helpPage = 0;
    } else if (selected === "EXPLORE ON MY OWN") {
        // Tutorial first-pause: player skips guidance, mark done and resume
        if (typeof tutorialHints !== 'undefined') {
            tutorialHints.uiTutorialDone = true;
            tutorialHints.uiIntroStep = 0;
            tutorialHints.roomPhase = tutorialHints.moveTutorialDone ? 'DESK' : 'MOVE';
        }
        togglePause();
        pauseFromState = null;
    } else if (selected === "RESTART") {
        if (isEndlessRunMode()) {
            showRestartConfirm = true;
            restartConfirmIndex = -1;
        } else {
            showRestartChoice = true;
            restartChoiceIndex = -1;
        }
    } else if (selected === "EXIT") {
        showExitConfirm = true;
        exitConfirmIndex = -1;
    }
}

function handleExitConfirm() {
    if (EXIT_CONFIRM_OPTIONS[exitConfirmIndex] === "YES, EXIT") {
        triggerTransition(() => {
            gameState.setState(STATE_MENU);
            mainMenu.menuState = STATE_MENU;
            pauseFromState = null;
            showRestartChoice = false;
            showRestartConfirm = false;
            showStoryRecap = false;
            showExitConfirm = false;
        });
    } else if (EXIT_CONFIRM_OPTIONS[exitConfirmIndex] === "CANCEL") {
        showExitConfirm = false;
        exitConfirmIndex = -1;
    }
}

function handleRestartConfirm() {
    if (RESTART_CONFIRM_OPTIONS[restartConfirmIndex] === "YES, RESTART") {
        triggerTransition(() => {
            showRestartConfirm = false;

            player.applyLevelStats(currentDayID);
            if (typeof player.restoreUtilityItemFromRunSnapshot === "function") {
                player.restoreUtilityItemFromRunSnapshot();
            }

            player.x = GLOBAL_CONFIG.lanes.lane1;
            player.y = PLAYER_RUN_FOOT_Y;

            obstacleManager = new ObstacleManager();
            levelController.initializeLevel(currentDayID);

            if (endScreenManager) endScreenManager._activeScreen = null;
            beginGameplayLoading(currentDayID, () => {
                gameState.setState(STATE_DAY_RUN);
            });

            pauseFromState = null;
        });
    } else if (RESTART_CONFIRM_OPTIONS[restartConfirmIndex] === "CANCEL") {
        showRestartConfirm = false;
        restartConfirmIndex = -1;
    }
}

function handleRestartChoice() {
    if (RESTART_OPTIONS[restartChoiceIndex] === "BACK TO ROOM") {
        triggerTransition(() => {
            showRestartChoice = false;
            gameState.resetFlags();
            setupRun(currentDayID, { playRoomClock: false });
            pauseFromState = null;
        });
    } else if (RESTART_OPTIONS[restartChoiceIndex] === "RESTART RUN") {
        triggerTransition(() => {
            showRestartChoice = false;

            player.applyLevelStats(currentDayID);
            if (typeof player.restoreUtilityItemFromRunSnapshot === "function") {
                player.restoreUtilityItemFromRunSnapshot();
            }

            player.x = GLOBAL_CONFIG.lanes.lane1;
            player.y = PLAYER_RUN_FOOT_Y;

            obstacleManager = new ObstacleManager();
            levelController.initializeLevel(currentDayID);

            if (endScreenManager) endScreenManager._activeScreen = null;
            beginGameplayLoading(currentDayID, () => {
                gameState.setState(STATE_DAY_RUN);
            });

            pauseFromState = null;
        });
    }
}

/**
 * Dispatches mouse press events; also unlocks the Web Audio context on first click.
 */
function mousePressed() {

    if (frameCount % 60 === 0) {
        const ctx = (typeof getAudioContext === 'function') ? getAudioContext() : null;
        if (ctx && ctx.state !== 'running') {
            ctx.resume().catch(e => console.warn('[SFX] Context resume failed', e));
        }
    }

    if (globalFade.isFading || !gameState) return;

    // Dev corner-drag: intercept before everything else
    if (developerMode && gameState.currentState === STATE_MENU && mainMenu) {
        for (let btn of mainMenu.buttons) {
            let corner = btn.checkResizeCorner(mouseX, mouseY);
            if (corner) {
                devResizeState = {
                    startMX: mouseX, startMY: mouseY,
                    startW: devMenuBtnW, startH: devMenuBtnH,
                    signX: corner.signX, signY: corner.signY
                };
                return false;
            }
        }
    }

    // TestingPanel intercepts all clicks when visible
    if (testingPanel && testingPanel.isVisible()) {
        if (testingPanel.handleMousePressed(mouseX, mouseY)) return false;
    }

    // Lock all input while the level-select entrance animation plays
    if (gameState.currentState === STATE_LEVEL_SELECT &&
        mainMenu && mainMenu.timeWheel && mainMenu.timeWheel.isEntering) return;

    let state = gameState.currentState;

    // Cutscene: click advances or selects choice
    if (state === STATE_CUTSCENE) {
        csClick(mouseX, mouseY);
        return;
    }

    // Save-choice screen: click selects option
    if (state === STATE_SAVE_CHOICE) {
        _saveChoiceHitTest(mouseX, mouseY, true);
        return;
    }

    // Credits screen: click skips scroll/pause → poem, or exits poem → menu
    if (state === STATE_CREDITS) {
        if (_creditPhase === 'scroll' || _creditPhase === 'pause') {
            console.log("[Credits] Scrolling... interaction locked.");
            return;
        }

        if (_creditPhase === 'poem' && _creditPoemAlpha >= 255) {
            if (_day5Ending === 'stay') {
                _day5Ending = null;
                triggerTransition(() => startCutscene('library', CS_DAY5_STAY, () => {
                    triggerTransition(() => { gameState.resetFlags(); gameState.setState(STATE_MENU); });
                }));
            } else {
                triggerTransition(() => { gameState.resetFlags(); gameState.setState(STATE_MENU); });
            }
        }
        return;
    }

    // Splash screen: unlock audio and start the animated title transition to main menu
    if (state === STATE_SPLASH) {
        if (getAudioContext().state !== 'running') getAudioContext().resume();
        playSFX(sfxClick);

        // Capture splash title Y so the entering animation can lerp from it
        _splashEnterCY = (typeof titleDrop !== 'undefined') ? titleDrop.y : 480;
        _menuEnterT = 0;
        _menuFromSplash = true;
        gameState.setState(STATE_MENU);
        return;
    }

    if (state === STATE_PAUSED) {
        // Back arrow (top-left) — resume
        if (assets.backImg && dist(mouseX, mouseY, 70, 65) < 40) {
            if (typeof playSFX === 'function') playSFX(sfxClick);
            if (showStoryRecap) {
                showStoryRecap = false;
                pauseIndex = -1;
            } else if (showRestartConfirm) {
                showRestartConfirm = false;
                restartConfirmIndex = -1;
            } else if (showExitConfirm) {
                showExitConfirm = false;
                exitConfirmIndex = -1;
            } else if (showRestartChoice) {
                showRestartChoice = false;
                pauseIndex = -1;
            } else {
                togglePause();
            }
            return;
        }
        if (showRestartConfirm && restartConfirmIndex >= 0) {
            if (typeof playSFX === 'function') playSFX(sfxClick);
            handleRestartConfirm();
            return;
        } else if (showExitConfirm && exitConfirmIndex >= 0) {
            if (typeof playSFX === 'function') playSFX(sfxClick);
            handleExitConfirm();
            return;
        } else if (showRestartChoice && restartChoiceIndex >= 0) {
            if (typeof playSFX === 'function') playSFX(sfxClick);
            handleRestartChoice();
        } else if (showStoryRecap) {
            // Vertical scrollbar thumb drag
            if (_storyScrollbar.maxScroll > 0) {
                let sb = _storyScrollbar;
                if (mouseX >= sb.x - sb.w && mouseX <= sb.x + sb.w &&
                    mouseY >= sb.thumbY && mouseY <= sb.thumbY + sb.thumbH) {
                    _storyScrollDragging = true;
                    _storyScrollDragStartY = mouseY;
                    _storyScrollDragStartOffset = storyScrollOffset;
                    return false;
                }
                // Click on scrollbar track (outside thumb) — jump to position
                if (mouseX >= sb.x - sb.w && mouseX <= sb.x + sb.w &&
                    mouseY >= sb.y && mouseY <= sb.y + sb.h) {
                    let ratio = (mouseY - sb.y) / sb.h;
                    storyScrollOffset = constrain(round(ratio * sb.maxScroll), 0, sb.maxScroll);
                    return false;
                }
            }
            // Right-side up/down arrow clicks
            let arrowX = width - 90;
            let centerY = height / 2;
            let arrowGap = 90;
            if (storyRecapDay > 0 && dist(mouseX, mouseY, arrowX, centerY - arrowGap) < 35) {
                storyRecapDay--;
                storyScrollOffset = 0;
                if (typeof playSFX === 'function') playSFX(sfxSelect);
                return;
            }
            if (storyRecapDay < 5 && dist(mouseX, mouseY, arrowX, centerY + arrowGap) < 35) {
                storyRecapDay++;
                storyScrollOffset = 0;
                if (typeof playSFX === 'function') playSFX(sfxSelect);
                return;
            }
            // story recap sidebar clicks (items 0=Prologue, 1-5=Days)
            let sidebarX = width * 0.16;
            let sidebarBaseY = height * 0.45;
            for (let i = 0; i < 6; i++) {
                let diff = i - storyRecapDay;
                let cardY = sidebarBaseY + diff * 130;
                if (mouseX > sidebarX - 120 && mouseX < sidebarX + 120 &&
                    mouseY > cardY - 40 && mouseY < cardY + 40) {
                    storyRecapDay = i;
                    storyScrollOffset = 0;
                    if (typeof playSFX === 'function') playSFX(sfxSelect);
                    return;
                }
            }
        } else if (pauseIndex >= 0) {
            if (typeof playSFX === 'function') playSFX(sfxClick);
            handlePauseSelection();
        }
        return;
    }

    if (state === STATE_MENU || state === STATE_LEVEL_SELECT ||
        state === STATE_SETTINGS || state === STATE_HELP ||
        state === STATE_DIFF_SELECT || state === STATE_DIFF_CONFIRM || state === STATE_LOAD_GAME) {
        if (mainMenu) mainMenu.handleClick(mouseX, mouseY);
    } else if (state === STATE_TUTORIAL_SLIDES) {
        if (tutorialSkipTransition && tutorialSkipTransition.active) {
            return false;
        }
        if (tutorialSkipButton && tutorialSkipButton.checkMouse(mouseX, mouseY)) {
            tutorialSkipButton.handleClick();
            return false;
        }
        // Advance intro dialogue on click
        if (_tutorialIntroIndex >= 0) {
            _advanceTutorialIntro();
        }
        return false;
    } else if (state === STATE_FAIL || state === STATE_WIN) {
        if (endScreenManager) endScreenManager.handleClick(mouseX, mouseY);
    } else if (state === STATE_ROOM || state === STATE_DAY_RUN) {
        if (state === STATE_ROOM && roomScene && roomScene.handleMousePressed(mouseX, mouseY)) {
            return false;
        }
        // Pause button hit-test
        if (dist(mouseX, mouseY, width - 95, 65) < 80) {
            playSFX(sfxClick);
            togglePause();
            pauseIndex = -1;
            showRestartChoice = false;
            showRestartConfirm = false;
            showStoryRecap = false;
        }
    }

    if (gameState.currentState === STATE_INVENTORY) {
        // Pause button overlaid on backpack screen
        if (dist(mouseX, mouseY, width - 65, 65) < 80) {
            if (typeof playSFX === 'function') playSFX(sfxClick);
            togglePause();
            pauseIndex = -1;
            showRestartChoice = false;
            showRestartConfirm = false;
            showStoryRecap = false;
            return;
        }
        if (backpackUI) backpackUI.handleMousePressed(mouseX, mouseY);
    }
}

/**
 * Dispatches mouse release events to the active UI systems.
 */
function mouseReleased() {
    if (!gameState) return;
    if (devResizeState) { devResizeState = null; return; }
    if (_storyScrollDragging) { _storyScrollDragging = false; return; }
    if (mainMenu) mainMenu.handleRelease();
    if (gameState.currentState === STATE_INVENTORY) {
        if (backpackUI) backpackUI.handleMouseReleased(mouseX, mouseY);
    }
}

/**
 * Dispatches mouse drag events to the active UI systems.
 */
function mouseDragged() {
    if (!gameState) return;
    // Dev corner-drag resize
    if (devResizeState) {
        let dx = mouseX - devResizeState.startMX;
        let dy = mouseY - devResizeState.startMY;
        devMenuBtnW = Math.max(40, Math.round(devResizeState.startW + 2 * devResizeState.signX * dx));
        devMenuBtnH = Math.max(10, Math.round(devResizeState.startH + 2 * devResizeState.signY * dy));
        return;
    }
    // Story recap vertical scrollbar drag
    if (_storyScrollDragging && gameState.currentState === STATE_PAUSED && showStoryRecap) {
        let sb = _storyScrollbar;
        if (sb.h > 0 && sb.maxScroll > 0) {
            let trackUsable = sb.h - sb.thumbH;
            if (trackUsable > 0) {
                let dy = mouseY - _storyScrollDragStartY;
                let delta = dy / trackUsable * sb.maxScroll;
                storyScrollOffset = constrain(round(_storyScrollDragStartOffset + delta), 0, sb.maxScroll);
            }
        }
        return false;
    }
    if (gameState.currentState === STATE_INVENTORY) {
        if (backpackUI) backpackUI.handleMouseDragged(mouseX, mouseY);
    }
}

/**
 * Dispatches mouse move events to the active UI systems.
 */
function mouseMoved() {
    if (!gameState) return;
    if (gameState.currentState === STATE_CUTSCENE) {
        csMoveHover(mouseX, mouseY);
    }
    if (gameState.currentState === STATE_SAVE_CHOICE) {
        _saveChoiceHitTest(mouseX, mouseY, false);
    }
    if (gameState.currentState === STATE_FAIL || gameState.currentState === STATE_WIN) {
        if (endScreenManager) endScreenManager.handleMouseMove(mouseX, mouseY);
    }
    if (gameState.currentState === STATE_TUTORIAL_SLIDES && tutorialSkipButton) {
        tutorialSkipButton.isFocused = tutorialSkipButton.checkMouse(mouseX, mouseY);
    }
    if (gameState.currentState === STATE_INVENTORY) {
        if (backpackUI) backpackUI.handleMouseMoved(mouseX, mouseY);
    }
}


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6: STATE MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Requests or exits browser fullscreen on the canvas-container element.
 * The canvas stays at 1920×1080 internally; CSS scales it to fill the screen.
 * Keyboard shortcut: F. Also callable from the Settings screen button.
 */
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.warn('PSS: fullscreen request failed —', err.message);
        });
    } else {
        document.exitFullscreen();
    }
}

// Keep _isFullscreen in sync so the Settings button label stays accurate.
document.addEventListener('fullscreenchange', () => {
    _isFullscreen = !!document.fullscreenElement;
});

/**
 * Applies a CSS brightness filter to the entire page (html element).
 * val = 1.0 → normal, < 1.0 → darker, > 1.0 → brighter.
 * Range 0.4–1.6 gives a usable range without blowing out highlights.
 */
function applyBrightnessFilter(val) {
    document.documentElement.style.filter = `brightness(${val})`;
}

/**
 * Toggles between the paused state and the previous active state.
 */
function togglePause() {
    if (gameState.currentState === STATE_PAUSED) {
        gameState.setState(gameState.previousState);
    } else {
        gameState.setState(STATE_PAUSED);
    }
}

function startRoomExitRunSequence() {
    if (shouldShowDay1RoomExitTutorial()) {
        tutorialSkipTransition.active = false;
        tutorialSkipTransition.phase = 'idle';
        tutorialSkipTransition.phaseStartFrame = 0;
        tutorialSlidePlayback.active = true;
        tutorialSlidePlayback.frameStart = frameCount;
        tutorialSlidePlayback.currentIndex = 0;
        _startTutorialIntro();
        gameState.setState(STATE_TUTORIAL_SLIDES);
        return;
    }
    beginGameplayLoading(currentDayID, () => {
        gameState.setState(STATE_DAY_RUN);
    });
}

function finishTutorialSlides() {
    tutorialSkipTransition.active = false;
    tutorialSkipTransition.phase = 'idle';
    tutorialSkipTransition.phaseStartFrame = 0;
    tutorialSlidePlayback.active = false;
    tutorialSlidePlayback.frameStart = 0;
    tutorialSlidePlayback.currentIndex = 0;
    beginGameplayLoading(currentDayID, () => {
        gameState.setState(STATE_DAY_RUN);
    });
}

function beginTutorialSkipTransition() {
    if (!tutorialSlidePlayback.active) return;
    if (tutorialSkipTransition.active) return;
    tutorialSkipTransition.active = true;
    tutorialSkipTransition.phase = 'ready';
    tutorialSkipTransition.phaseStartFrame = frameCount;
    tutorialSkipTransition.phaseDurationFrames = 90;
}

/**
 * Initialises the room-entry flow for the given day.
 * By default this plays the room clock SFX, but callers can disable it
 * for "back to room" paths via options.playRoomClock = false.
 */
function setupRun(dayID, options = {}) {
    const playRoomClock = options.playRoomClock !== false;
    currentDayID = dayID;
    currentRunMode = RUN_MODE_STORY;
    _winCutscenePending = false;  // reset so the NPC cutscene can fire this run
    resetRunSuccessTransition();

    // Unlock all characters/story up to this day (supports testing panel access)
    currentUnlockedDay = Math.max(currentUnlockedDay, dayID);

    player.applyLevelStats(dayID);
    player.x = GLOBAL_CONFIG.lanes.lane1;
    player.y = PLAYER_RUN_FOOT_Y;
    roomScene.reset();
    obstacleManager = new ObstacleManager();
    levelController.initializeLevel(dayID);

    if (typeof tutorialHints !== 'undefined') {
        if (dayID === 1 && !tutorialHints.uiTutorialDone) {
            tutorialHints.roomPhase = 'UI_INTRO';
            tutorialHints.uiIntroStep = 0;
            initNewGameBadges();
        } else if (dayID === 1 && !tutorialHints.moveTutorialDone) {
            tutorialHints.roomPhase = 'MOVE';
        } else {
            tutorialHints.roomPhase = 'DESK';
        }
    }
    if (backpackUI) backpackUI.resetForNewDay();
    clearItemToast();
    if (endScreenManager) endScreenManager._activeScreen = null;
    if (gameState && typeof gameState.clearRunUtilityItemSnapshot === "function") {
        gameState.clearRunUtilityItemSnapshot();
    }

    // Play room-entry clock only for true day-start / resume paths.
    // "Back to room" flows should pass { playRoomClock: false }.
    // Day 4+ replaces the alarm with heartbeat_short (played via dialogue nodes).
    // Day 3: alarm is faint — Iris is fatigued and barely hears it.
    if (playRoomClock && dayID <= 3 && typeof playSFX === 'function' && sfxRoomClock) {
        playSFX(sfxRoomClock, { volumeScale: dayID === 3 ? 0.35 : 1 });
    }

    // Hold the black screen for 1.5 s (alarm rings) then show room/cutscene.
    // Only possible when called from inside a triggerTransition callback (dir===1).
    const _inBlackout = globalFade.isFading && globalFade.dir === 1;

    // Room cutscene — only on first visit per day per session
    const _hasNodeRoom = typeof DIALOGUE_DATA !== 'undefined' &&
        DIALOGUE_DATA.day_room_start &&
        DIALOGUE_DATA.day_room_start[dayID];
    const _hasLegacyRoom = typeof CS_DAY_ROOM !== 'undefined' && CS_DAY_ROOM[dayID];
    if ((_hasNodeRoom || _hasLegacyRoom) && !_roomCutsceneSeen[dayID]) {
        _roomCutsceneSeen[dayID] = true;
        if (player) { player.x = 940; player.y = 550; }
        const _afterRoom = () => {
            if (dayID > 1 && typeof tutorialHints !== 'undefined') {
                tutorialHints.roomPhase = 'DESK';
            }
            // Show new-item badge on the desk when a new item is introduced this day
            if (dayID >= 2) newBadges.add('new_item');
            gameState.setState(STATE_ROOM);
        };
        const _launchCutscene = () => {
            if (_hasNodeRoom) {
                startCutsceneFromNode(DIALOGUE_DATA.day_room_start[dayID], _afterRoom);
            } else {
                startCutscene('room', CS_DAY_ROOM[dayID], _afterRoom);
            }
        };
        if (_inBlackout) {
            globalFade.holdUntilMs = performance.now() + 1500;
            globalFade.holdDoneCallback = _launchCutscene;
        } else {
            _launchCutscene();
        }
    } else {
        if (player) { player.x = 940; player.y = 550; }
        if (_inBlackout) {
            globalFade.holdUntilMs = performance.now() + 1500;
            globalFade.holdDoneCallback = () => { gameState.setState(STATE_ROOM); };
        } else {
            gameState.setState(STATE_ROOM);
        }
    }
}

function setupRunDirectly(dayID, runMode = RUN_MODE_STORY, showTutorialSlides = false) {
    currentDayID = dayID;
    currentRunMode = runMode;
    _winCutscenePending = false;
    resetRunSuccessTransition();

    player.applyLevelStats(dayID);

    // Restore the selected utility item for direct restart paths
    if (typeof player.restoreUtilityItemFromRunSnapshot === "function") {
        player.restoreUtilityItemFromRunSnapshot();
    }

    // Set position at lane 1 matching standard run spawn
    player.x = GLOBAL_CONFIG.lanes.lane1;
    player.y = PLAYER_RUN_FOOT_Y;

    obstacleManager = new ObstacleManager();
    levelController.initializeLevel(dayID);

    if (typeof tutorialHints !== 'undefined') tutorialHints.roomPhase = 'DONE';
    if (backpackUI) backpackUI.resetForNewDay();
    if (typeof player.syncUtilityItemFromBackpack === 'function') player.syncUtilityItemFromBackpack();
    // Reset any in-flight item tutorial so every run starts clean
    _itemTutorial.active = false;
    _itemTutorial.item = null;
    _itemTutorial.frame = 0;
    if (_itemTutorialDB) _itemTutorialDB.reset();
    clearItemToast();
    if (endScreenManager) endScreenManager._activeScreen = null;
    // Stop prologue ambient audio if still playing when run starts
    if (typeof sfxAmbulance !== 'undefined' && sfxAmbulance &&
        typeof sfxAmbulance.isPlaying === 'function' && sfxAmbulance.isPlaying()) {
        sfxAmbulance.stop();
    }

    if (showTutorialSlides && assets && assets.tutorialInteractive && assets.tutorialInteractive.background) {
        tutorialSkipTransition.active = false;
        tutorialSkipTransition.phase = 'idle';
        tutorialSkipTransition.phaseStartFrame = 0;
        tutorialSlidePlayback.active = true;
        tutorialSlidePlayback.frameStart = frameCount;
        tutorialSlidePlayback.currentIndex = 0;
        _startTutorialIntro();
        gameState.setState(STATE_TUTORIAL_SLIDES);
    } else {
        beginGameplayLoading(dayID, () => {
            gameState.setState(STATE_DAY_RUN);
        });
    }
}


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 7: UI RENDERING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Renders the loading bar and UoB logo while assets stream in.
 * Transitions to STATE_SPLASH once the bar reaches 100%.
 */
function drawLoadingScreen() {
    // Boot-phase loading is handled entirely by the HTML overlay — nothing to render here.
    // This function is only reached during the level loading phase (Day-specific assets).
    if (loadingPhase !== "level" || !levelLoadState.active) return;

    background(10, 10, 15);
    let cx = width / 2;
    let cy = height / 2;

    if (assets.uobLogo) {
        push();
        imageMode(CENTER);
        let wave = sin(frameCount * 0.05);
        let imgScale = 1.0 + wave * 0.05;
        let alphaValue = 180 + wave * 75;
        tint(255, alphaValue);
        image(assets.uobLogo, cx, cy - 80, 120 * imgScale, 120 * imgScale);
        pop();
    }

    updateGameplayLoadingState();
    const visualProgress = constrain(levelLoadState.progress, 0, 1);
    drawLoadingProgressBar(cx, cy + 80, visualProgress);

    push();
    textAlign(CENTER, CENTER);
    textFont(fonts.jersey20 || fonts.body);
    fill(255, 235, 200);
    textSize(34);
    text(`Preparing Day ${levelLoadState.dayID}`, cx, cy + 150);
    textSize(20);
    const failedChecks = levelLoadState.checks.filter(check => !check.ok);
    if (failedChecks.length === 0) {
        text("Verifying backgrounds, player sprites, and obstacle textures...", cx, cy + 188);
    } else {
        text("Waiting for required level assets before entering gameplay", cx, cy + 188);
        textAlign(LEFT, TOP);
        const leftX = cx - 360;
        let lineY = cy + 228;
        for (const check of failedChecks.slice(0, 6)) {
            text(`- ${check.label}`, leftX, lineY);
            lineY += 26;
        }
    }
    pop();
}

function drawTutorialSlidesScreen() {
    if (!tutorialSlidePlayback.active || !assets?.tutorialInteractive?.background) {
        finishTutorialSlides();
        return;
    }
    background(0);

    const bg = assets.tutorialInteractive.background;
    if (bg) {
        const scale = Math.max(width / bg.width, height / bg.height);
        imageMode(CENTER);
        image(bg, width / 2, height / 2, bg.width * scale, bg.height * scale);
        imageMode(CORNER);
    }

    if (tutorialSkipTransition && tutorialSkipTransition.active) {
        drawTutorialSkipTransitionFrame();
        return;
    }

    // ── Intro dialogue phase ────────────────────────────────────────────────
    if (_tutorialIntroIndex >= 0 && _tutorialIntroBox) {
        _tutorialIntroBox.display();
        if (tutorialSkipButton) {
            const topRightPadding = 16;
            tutorialSkipButton.x = width - (tutorialSkipButton.w / 2) - topRightPadding;
            tutorialSkipButton.y = (tutorialSkipButton.h / 2) + topRightPadding;
            tutorialSkipButton.isFocused = tutorialSkipButton.checkMouse(mouseX, mouseY);
            tutorialSkipButton.update();
            tutorialSkipButton.display();
        }
        return;
    }

    const scaleUnit = Math.min(width / 1920, height / 1080);
    const tutorialItems = buildTutorialInteractiveItems(scaleUnit);
    const hudHotspots = drawTutorialHudBars(scaleUnit);

    const hoverCandidates = [];
    for (const item of tutorialItems) {
        hoverCandidates.push({
            id: item.id,
            x: item.x - item.w / 2,
            y: item.y - item.h / 2,
            w: item.w,
            h: item.h,
            cx: item.x,
            cy: item.y,
            z: 10 + item.z
        });
    }
    hoverCandidates.push({
        id: 'hud_inventory',
        ...hudHotspots.inventory,
        cx: hudHotspots.inventory.x + hudHotspots.inventory.w / 2,
        cy: hudHotspots.inventory.y + hudHotspots.inventory.h / 2,
        z: 200
    });
    hoverCandidates.push({
        id: 'hud_energy',
        ...hudHotspots.energy,
        cx: hudHotspots.energy.x + hudHotspots.energy.w / 2,
        cy: hudHotspots.energy.y + hudHotspots.energy.h / 2,
        z: 210
    });

    const hovered = pickTutorialHoverTarget(hoverCandidates);

    for (const item of tutorialItems) {
        drawTutorialItem(item, hovered && hovered.id === item.id, scaleUnit);
    }

    if (hovered && TUTORIAL_TEXT_BY_ID[hovered.id]) {
        drawTutorialInstructionBubble(TUTORIAL_TEXT_BY_ID[hovered.id], scaleUnit, hovered);
    }

    drawTutorialBottomBar(scaleUnit);

    tutorialSlidePlayback.currentIndex = hovered ? 1 : 0;

    if (tutorialSkipButton && !(tutorialSkipTransition && tutorialSkipTransition.active)) {
        const topRightPadding = 16;
        tutorialSkipButton.x = width - (tutorialSkipButton.w / 2) - topRightPadding;
        tutorialSkipButton.y = (tutorialSkipButton.h / 2) + topRightPadding;
        tutorialSkipButton.isFocused = tutorialSkipButton.checkMouse(mouseX, mouseY);
        tutorialSkipButton.update();
        tutorialSkipButton.display();
    }
}

function drawTutorialSkipTransitionFrame() {
    const phase = tutorialSkipTransition.phase;
    const elapsedFrames = Math.max(0, frameCount - tutorialSkipTransition.phaseStartFrame);
    const phaseDuration = Math.max(1, tutorialSkipTransition.phaseDurationFrames || 90);

    push();
    fill(0, 0, 0, 150);
    noStroke();
    rect(0, 0, width, height);

    textAlign(CENTER, CENTER);
    textFont(fonts.jersey20 || fonts.body);
    textStyle(BOLD);
    const label = phase === 'ready' ? 'READY?' : 'GOOOOO!';
    const baseSize = Math.min(width, height) * 0.13;

    fill(0, 0, 0, 160);
    textSize(baseSize);
    text(label, width / 2 + 6, height / 2 + 6);

    fill('#FFFFFF');
    stroke('#FF6B6B');
    strokeWeight(Math.max(3, baseSize * 0.06));
    text(label, width / 2, height / 2);
    pop();

    if (elapsedFrames >= phaseDuration) {
        if (phase === 'ready') {
            tutorialSkipTransition.phase = 'go';
            tutorialSkipTransition.phaseStartFrame = frameCount;
        } else {
            finishTutorialSlides();
        }
    }
}

function drawTutorialBottomBar(scaleUnit) {
    const uiScale = Math.max(0.35, Number(TUTORIAL_SCENE_SCALE || 1)) * scaleUnit;
    const barW = 360 * uiScale;
    const barH = 62 * uiScale;
    const barX = width / 2 - barW / 2;
    const barY = height - barH - (22 * uiScale);

    push();
    noStroke();
    fill(0, 0, 0, 120);
    rect(barX + (5 * uiScale), barY + (5 * uiScale), barW, barH, 18 * uiScale);
    fill('#FF6B6B');
    stroke('#FFFFFF');
    strokeWeight(4 * uiScale);
    rect(barX, barY, barW, barH, 18 * uiScale);
    noStroke();
    fill('#FFFFFF');
    textAlign(CENTER, CENTER);
    textFont(fonts.jersey20 || fonts.body);
    textSize(38 * uiScale);
    text('Tutorial', width / 2, barY + barH / 2);
    pop();
}

function getTutorialAllowedLanesByType(obstacleType) {
    const cfg = OBSTACLE_CONFIG && OBSTACLE_CONFIG[obstacleType];
    if (!cfg || !Array.isArray(cfg.allowedLanes) || cfg.allowedLanes.length === 0) {
        return [1, 2, 3, 4];
    }
    return cfg.allowedLanes.map(v => Number(v)).filter(v => v >= 1 && v <= 4);
}

function resolveTutorialLane(preferredLane, allowedLanes) {
    if (allowedLanes.includes(preferredLane)) return preferredLane;
    return allowedLanes[0] || preferredLane || 1;
}

function buildTutorialInteractiveItems(scaleUnit) {
    const result = [];
    const sceneScale = Math.max(0.35, Number(TUTORIAL_SCENE_SCALE || 1));
    const laneX = (GLOBAL_CONFIG && GLOBAL_CONFIG.lanes) ? GLOBAL_CONFIG.lanes : {
        lane1: width * 0.3125,
        lane2: width * 0.4323,
        lane3: width * 0.5677,
        lane4: width * 0.6875
    };

    for (const entry of TUTORIAL_LAYOUT) {
        const sourceMap = entry.group === 'obstacle'
            ? assets?.tutorialInteractive?.oObstacle
            : assets?.tutorialInteractive?.oPowerup;
        const hoverMap = entry.group === 'obstacle'
            ? assets?.tutorialInteractive?.tObstacle
            : assets?.tutorialInteractive?.tPowerup;

        const baseImg = sourceMap ? sourceMap[entry.id] : null;
        const hoverImg = hoverMap ? hoverMap[entry.id] : null;
        if (!baseImg) continue;

        const allowedLanes = getTutorialAllowedLanesByType(entry.obstacleType);
        const lane = resolveTutorialLane(entry.preferredLane, allowedLanes);
        const x = laneX[`lane${lane}`] || (width / 2);
        const y = entry.y * scaleUnit;
        const w = baseImg.width * scaleUnit * sceneScale;
        const h = baseImg.height * scaleUnit * sceneScale;

        result.push({
            id: entry.id,
            group: entry.group,
            x,
            y,
            w,
            h,
            z: entry.z,
            baseImg,
            hoverImg
        });
    }

    result.sort((a, b) => a.z - b.z);
    return result;
}

function drawTutorialItem(item, isHovered, scaleUnit) {
    const sceneScale = Math.max(0.35, Number(TUTORIAL_SCENE_SCALE || 1));
    const useHover = isHovered && !!item.hoverImg;
    const img = useHover ? item.hoverImg : item.baseImg;
    if (!img) return;

    let drawW = item.w;
    let drawH = item.h;

    if (useHover) {
        const hoverBox = item.group === 'obstacle' ? 500 : 200;
        const targetW = hoverBox * scaleUnit * sceneScale;
        const targetH = hoverBox * scaleUnit * sceneScale;
        const ratio = Math.min(targetW / img.width, targetH / img.height);
        const hoverW = img.width * ratio;
        const hoverH = img.height * ratio;
        drawW = Math.max(item.w, hoverW);
        drawH = Math.max(item.h, hoverH);

        if (item.group === 'powerup') {
            const baseRatio = Math.max(item.w / img.width, item.h / img.height);
            const resolvedRatio = Math.max(ratio, baseRatio);
            let powerupRatio = resolvedRatio;
            if (item.id === 'coffee') {
                powerupRatio = Math.max(powerupRatio, resolvedRatio * 1.2);
            }
            drawW = img.width * powerupRatio;
            drawH = img.height * powerupRatio;
        }
    }

    push();
    imageMode(CENTER);
    image(img, item.x, item.y, drawW, drawH);
    imageMode(CORNER);
    pop();
}

function drawTutorialHudBars(scaleUnit) {
    const hudScale = Math.max(0.35, Number(TUTORIAL_SCENE_SCALE || 1)) * scaleUnit;
    const yOffset = TUTORIAL_HUD_Y_OFFSET * hudScale;
    const inventoryRect = {
        x: 30 * hudScale,
        y: (21 * hudScale) + yOffset,
        w: 160 * hudScale,
        h: 160 * hudScale
    };
    const chargeCircle = {
        x: 146 * hudScale,
        y: (7 * hudScale) + yOffset,
        d: 73 * hudScale
    };
    const energyRect = {
        x: 210 * hudScale,
        y: (111 * hudScale) + yOffset,
        w: 410 * hudScale,
        h: 70 * hudScale
    };

    const cardR = 34 * hudScale;
    const strokeW = 7 * hudScale;

    push();
    noStroke();
    fill(0, 0, 0, 80);
    rect(inventoryRect.x + 7 * hudScale, inventoryRect.y + 7 * hudScale, inventoryRect.w, inventoryRect.h, cardR);
    fill('#F5F0FF');
    stroke('#9B8FB8');
    strokeWeight(strokeW);
    rect(inventoryRect.x, inventoryRect.y, inventoryRect.w, inventoryRect.h, cardR);
    if (assets.backpackImg) {
        imageMode(CENTER);
        image(
            assets.backpackImg,
            inventoryRect.x + inventoryRect.w / 2,
            inventoryRect.y + inventoryRect.h / 2,
            120 * hudScale,
            120 * hudScale
        );
        imageMode(CORNER);
    }
    pop();


    push();
    noStroke();
    fill(0, 0, 0, 80);
    rect(energyRect.x + 7 * hudScale, energyRect.y + 7 * hudScale, energyRect.w, energyRect.h, 40 * hudScale);
    fill('#F5F0FF');
    stroke('#9B8FB8');
    strokeWeight(strokeW);
    rect(energyRect.x, energyRect.y, energyRect.w, energyRect.h, 40 * hudScale);
    noStroke();
    fill('#FF5AA8');
    rect(
        energyRect.x + 6 * hudScale,
        energyRect.y + 6 * hudScale,
        (energyRect.w - 12 * hudScale) * 0.62,
        energyRect.h - 12 * hudScale,
        32 * hudScale
    );
    textAlign(LEFT, TOP);
    textFont(fonts.jersey20 || fonts.body);
    textSize(48 * hudScale);
    fill(255);
    text('ENERGY', 230 * hudScale, (21 * hudScale) + yOffset);
    pop();

    return {
        inventory: inventoryRect,
        energy: energyRect
    };
}

function pickTutorialHoverTarget(candidates) {
    let winner = null;
    for (const target of candidates) {
        if (
            mouseX >= target.x &&
            mouseX <= target.x + target.w &&
            mouseY >= target.y &&
            mouseY <= target.y + target.h
        ) {
            if (!winner || target.z > winner.z) {
                winner = target;
            }
        }
    }
    return winner;
}

function wrapTutorialText(text, maxWidth) {
    const words = String(text || '').trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return [];

    const lines = [words[0]];
    for (let i = 1; i < words.length; i++) {
        const candidate = `${lines[lines.length - 1]} ${words[i]}`;
        if (textWidth(candidate) <= maxWidth) {
            lines[lines.length - 1] = candidate;
        } else {
            lines.push(words[i]);
        }
    }
    return lines;
}

function drawTutorialInstructionBubble(textContent, scaleUnit, anchorTarget) {
    const anchorX = anchorTarget ? (anchorTarget.cx || (anchorTarget.x + anchorTarget.w / 2)) : width * 0.5;
    const anchorY = anchorTarget ? (anchorTarget.cy || (anchorTarget.y + anchorTarget.h / 2)) : height * 0.5;
    const anchorW = anchorTarget ? (anchorTarget.w || 0) : 0;
    const anchorH = anchorTarget ? (anchorTarget.h || 0) : 0;
    const maxTextWidth = Math.max(400 * scaleUnit, width * 0.30);
    const padX = 38 * scaleUnit;
    const padY = 32 * scaleUnit;
    const radius = 40 * scaleUnit;
    const strokeW = 7 * scaleUnit;
    const lineH = 42 * scaleUnit;

    push();
    textFont(fonts.jersey20 || fonts.body);
    textSize(42 * scaleUnit);
    textAlign(LEFT, TOP);

    const lines = wrapTutorialText(textContent, maxTextWidth);
    let lineMax = 0;
    for (const line of lines) {
        lineMax = Math.max(lineMax, textWidth(line));
    }

    const boxW = lineMax + padX * 2;
    const boxH = lines.length * lineH + padY * 2;

    const gap = 22 * scaleUnit;
    let bubbleX = anchorX + (anchorW / 2) + gap;
    let bubbleY = anchorY - (boxH / 2);

    if (bubbleX + boxW > width - gap) {
        bubbleX = anchorX - (anchorW / 2) - gap - boxW;
    }
    bubbleX = constrain(bubbleX, gap, width - boxW - gap);
    bubbleY = constrain(bubbleY, gap, height - boxH - gap);

    fill('#FF6B6B');
    stroke('#FFFFFF');
    strokeWeight(strokeW);
    rect(bubbleX, bubbleY, boxW, boxH, radius);

    noStroke();
    fill('#FFFFFF');
    for (let i = 0; i < lines.length; i++) {
        text(lines[i], bubbleX + padX, bubbleY + padY + i * lineH);
    }
    pop();
}

// ─── WARNING / SPLASH TRANSITION ─────────────────────────────────────────────
let _splashFadeAlpha = 0;   // black overlay fading out on splash entry [0..255]
let _warnFrame = 0;         // counts up each draw call while in STATE_WARNING
let _menuEnterT = 1;    // 0→1: splash-to-menu enter animation progress
let _menuFromSplash = false; // true while the splash→menu title animation is running
let _splashEnterCY = 480;  // titleDrop.y captured at the moment of entering menu from splash
const _WARN_FADE_IN = 90;  // frames for fade-in  (~1.5 s)
const _WARN_HOLD = 240; // frames to hold at full opacity  (~9 s)
const _WARN_FADE_OUT = 90;  // frames for fade-out (~1.5 s)
const _WARN_TOTAL = _WARN_FADE_IN + _WARN_HOLD + _WARN_FADE_OUT; // 600 ≈ 10 s

/**
 * Full-screen mental-health content warning.
 * Auto-advances to STATE_SPLASH after ~10 seconds; no player interaction needed.
 */
function drawWarningScreen() {
    _warnFrame++;

    // Compute master opacity [0..255]
    let alpha;
    if (_warnFrame <= _WARN_FADE_IN) {
        alpha = map(_warnFrame, 0, _WARN_FADE_IN, 0, 255);
    } else if (_warnFrame <= _WARN_FADE_IN + _WARN_HOLD) {
        alpha = 255;
    } else {
        alpha = map(_warnFrame, _WARN_FADE_IN + _WARN_HOLD, _WARN_TOTAL, 255, 0);
    }
    alpha = constrain(alpha, 0, 255);

    // Advance to splash once animation completes
    if (_warnFrame > _WARN_TOTAL) {
        _warnFrame = 0;
        _splashFadeAlpha = 255;
        titleDrop.y = -200; titleDrop.vy = 0; titleDrop.landed = false; titleDrop.shake = 0;
        gameState.setState(STATE_SPLASH);
        return;
    }

    let s = min(width / 1920, height / 1080);
    let cx = width / 2;
    let cy = height / 2;

    // ── Background: pure black — content fades in and out over it ────────────
    push();
    colorMode(RGB, 255);
    background(0);

    // ── Warning box panel (1200x800, text area is bottom 1200x655) ──────────
    let panelW = 1200 * s;
    let panelH = 800 * s;
    let panelX = cx;
    // Shift up so the page area (bottom 655 px of the image) is centred,
    // leaving the cat (top 145 px) sitting above the visual centre.
    let panelY = cy - 72.5 * s;

    if (assets.warningBox) {
        imageMode(CENTER);
        tint(255, alpha);
        image(assets.warningBox, panelX, panelY, panelW, panelH);
        noTint();
    } else {
        // Fallback panel if warning_box.png is unavailable.
        fill(14, 14, 22, alpha * 0.95);
        stroke(200, 170, 100, alpha);
        strokeWeight(2.5 * s);
        rectMode(CENTER);
        rect(panelX, panelY, panelW, panelH, 22 * s);
        noStroke();
    }

    let textAreaTop = panelY - panelH / 2 + 145 * s;
    let textAreaBottom = panelY + panelH / 2;
    let textAreaH = textAreaBottom - textAreaTop;

    // ── Title ─────────────────────────────────────────────────────────────────
    let titleY = textAreaTop + 48 * s;
    textFont(fonts.title || fonts.body);
    textSize(44 * s);
    textAlign(CENTER, CENTER);
    fill(220, 190, 110, alpha);
    text("A Quiet Note to You", panelX, titleY);

    // Divider line
    stroke(200, 170, 100, alpha * 0.45);
    strokeWeight(1.5 * s);
    let divY = titleY + 36 * s;
    line(panelX - panelW / 2 + 60 * s, divY, panelX + panelW / 2 - 60 * s, divY);
    noStroke();

    // ── Body text (centred, warm) ──────────────────────────────────────────────
    textFont(fonts.jersey20 || fonts.body);
    textAlign(CENTER, TOP);
    let bodyLines = [
        { txt: "Please note: This experience explores stress, burnout,", size: 40, col: [230, 220, 205] },
        { txt: "and the psychological impact of self-doubt.", size: 40, col: [230, 220, 205] },
        { txt: "", size: 40, col: [230, 220, 205] },

        { txt: "If you find these themes distressing, we encourage you", size: 40, col: [230, 220, 205] },
        { txt: "to prioritise your well-being while playing.", size: 40, col: [230, 220, 205] },
        { txt: "Support is available if the climb feels too steep.", size: 40, col: [230, 220, 205] },
        { txt: "", size: 35, col: [230, 220, 205] },

        { txt: "— Resources for Support —", size: 35, col: [210, 185, 120] },
        { txt: "Bristol Nightline | 01179 266 266 (Nightly, Term-time)", size: 35, col: [210, 185, 120] },
        { txt: "Samaritans | 116 123 (Free, 24/7 Support)", size: 35, col: [210, 185, 120] },
        { txt: "Shout Crisis | Text 'SHOUT' to 85258", size: 35, col: [210, 185, 120] },
    ];

    let ty = divY + 20 * s;
    for (let i = 0; i < bodyLines.length; i++) {
        let entry = bodyLines[i];
        // Compute cumulative y by summing previous line heights
        let prevH = 0;
        for (let j = 0; j < i; j++) {
            prevH += (bodyLines[j].size + 10) * s;
        }
        textSize(entry.size * s);
        fill(entry.col[0], entry.col[1], entry.col[2], alpha);
        let y = ty + prevH;
        if (y > textAreaBottom - 30 * s) break;
        text(entry.txt, panelX, y);
    }

    // ── Footer ────────────────────────────────────────────────────────────────
    textFont(fonts.jersey20 || fonts.body);
    textSize(21 * s);
    textAlign(CENTER, CENTER);
    fill(160, 150, 130, alpha * 0.65);
    text("This screen will continue automatically.", panelX, textAreaTop + textAreaH - 24 * s);

    pop();
}

// ─── CREDITS SCREEN ───────────────────────────────────────────────────────────
let _creditPhase = 'scroll'; // 'scroll' | 'pause' | 'poem'
let _creditScrollY = 0;
let _creditPauseF = 0;
let _creditPoemAlpha = 0;

const _CREDIT_SCROLL_SPEED = 2.8; // design-space px per frame

// Raw credit data — sizes in 1920×1080 design-space pixels
const _CREDIT_DATA = [
    { type: 'space', h: 140 },
    { type: 'header', h: 96, text: '\u2014 PARK STREET SURVIVOR \u2014' },
    { type: 'sub', h: 60, text: 'A University of Bristol Group Project' },
    { type: 'space', h: 80 },
    { type: 'divider', h: 44 },
    { type: 'space', h: 64 },

    // ── Team ──────────────────────────────────────────────────────────────────
    { type: 'section', h: 70, text: 'THE TEAM' },
    { type: 'space', h: 52 },

    { type: 'name', h: 62, text: 'Charlotte Yu' },
    { type: 'role', h: 44, text: 'Core Mechanism & Systems Architect  \xb7  Script Designer' },
    { type: 'desc', h: 36, text: 'System Integration  \xb7  State Machine Logic  \xb7  Physics Pipeline' },
    { type: 'space', h: 50 },

    { type: 'name', h: 62, text: 'Kangrui Wang' },
    { type: 'role', h: 44, text: 'Level Designer  \xb7  Script Designer' },
    { type: 'desc', h: 36, text: 'Level Geometry  \xb7  Environmental Storytelling  \xb7  Obstacle Choreography' },
    { type: 'space', h: 50 },

    { type: 'name', h: 62, text: 'Layla Pei' },
    { type: 'role', h: 44, text: 'UI/UX & Audio Designer  \xb7  Script Designer' },
    { type: 'desc', h: 36, text: 'Interface Ergonomics  \xb7  Interaction Flows  \xb7  Soundscape Design' },
    { type: 'space', h: 50 },

    { type: 'name', h: 62, text: 'Lucca Zhou' },
    { type: 'role', h: 44, text: 'Aesthetic Designer  \xb7  Script Designer' },
    { type: 'desc', h: 36, text: 'Visual Style Guide  \xb7  Pixel Asset Creation  \xb7  Colour Palette' },
    { type: 'space', h: 84 },

    { type: 'divider', h: 44 },
    { type: 'space', h: 64 },

    // ── Sounds & Music ────────────────────────────────────────────────────────
    { type: 'section', h: 70, text: 'SOUNDS & MUSIC' },
    { type: 'space', h: 52 },

    { type: 'label', h: 48, text: '-- Background Music --' },
    { type: 'space', h: 32 },

    { type: 'sub', h: 40, text: 'Main Menu  \xb7  Help  \xb7  Settings' },
    { type: 'desc', h: 34, text: 'Seth_Makes_Sounds  \xb7  Chill Background Music' },
    { type: 'space', h: 26 },

    { type: 'sub', h: 40, text: 'Time Wheel  \xb7  Room' },
    { type: 'desc', h: 34, text: 'akirawakira  \xb7  Nostalgic Childhood \u2013 Grand Piano' },
    { type: 'space', h: 26 },

    { type: 'sub', h: 40, text: 'Levels 1 & 2' },
    { type: 'desc', h: 34, text: '\u30b3\u30ca\u30df\u77e9\u5f62\u6ce2\u5fc3\u697d\u90e8  \xb7  Ropewalking, Jump on the Jewel' },
    { type: 'space', h: 26 },

    { type: 'sub', h: 40, text: 'Levels 3 & 4' },
    { type: 'desc', h: 34, text: 'HOW  \xb7  Unreachable (Remix)' },
    { type: 'space', h: 26 },

    { type: 'sub', h: 40, text: 'Level 5' },
    { type: 'desc', h: 34, text: 'Mark Allen  \xb7  Cartridge Synth Layers' },
    { type: 'space', h: 26 },

    { type: 'sub', h: 40, text: 'Library Cutscene' },
    { type: 'desc', h: 34, text: 'ERH  \xb7  slow atmosphere 4' },
    { type: 'space', h: 26 },

    { type: 'sub', h: 40, text: 'Balloon Festival' },
    { type: 'desc', h: 34, text: 'Rhythm Doctor OST  \xb7  Helping Hands (ft. David Fu, Kaisha)' },
    { type: 'space', h: 26 },

    { type: 'sub', h: 40, text: 'Ending \u2014 Life' },
    { type: 'desc', h: 34, text: '\u98ce\u7075-foxi  \xb7  All The Times' },
    { type: 'space', h: 26 },

    { type: 'sub', h: 40, text: 'Ending \u2014 Death' },
    { type: 'desc', h: 34, text: '\u5411\u665a\u4e36  \xb7  Call of Silence (Cover Piano)' },
    { type: 'space', h: 52 },

    { type: 'label', h: 48, text: '-- Sound Effects --' },
    { type: 'space', h: 32 },

    { type: 'sub', h: 40, text: 'Dialogue Typing' },
    { type: 'desc', h: 34, text: 'D.S.G.  \xb7  Mechanical Keyboard' },
    { type: 'space', h: 22 },

    { type: 'sub', h: 40, text: 'Alarm Clock' },
    { type: 'desc', h: 34, text: 'ZyryTsounds  \xb7  alarm clock short' },
    { type: 'space', h: 22 },

    { type: 'sub', h: 40, text: 'Victory Jingle' },
    { type: 'desc', h: 34, text: '\u524d\u6ca2\u79c0\u6069, \u798e\u6e05\u5b8f  \xb7  SANDINISTA (\u30a8\u30f3\u30c7\u30a3\u30f3\u30b0)' },
    { type: 'space', h: 22 },

    { type: 'sub', h: 40, text: 'Ambulance Siren' },
    { type: 'desc', h: 34, text: 'stereobrother  \xb7  Ambulance siren' },
    { type: 'space', h: 22 },

    { type: 'sub', h: 40, text: 'Heartbeat Monitor' },
    { type: 'desc', h: 34, text: 'univ_lyon3  \xb7  PERRICHON_Lise Electrocardiogram' },
    { type: 'space', h: 22 },

    { type: 'sub', h: 40, text: 'Library Door' },
    { type: 'desc', h: 34, text: 'Slanesh  \xb7  porte-open-close' },
    { type: 'space', h: 22 },

    { type: 'sub', h: 40, text: 'Item Popup' },
    { type: 'desc', h: 34, text: 'MLaudio  \xb7  magic_game_win_success' },
    { type: 'space', h: 22 },

    { type: 'sub', h: 40, text: 'Coffee Drink' },
    { type: 'desc', h: 34, text: 'dersuperanton  \xb7  Drinking and swallow' },
    { type: 'space', h: 22 },

    { type: 'sub', h: 40, text: 'Scooter Pickup & Wind' },
    { type: 'desc', h: 34, text: 'Jade Leamcharaskul  \xb7  8-16bit Sound assets  \xb7  Anton  \xb7  wind1' },
    { type: 'space', h: 22 },

    { type: 'sub', h: 40, text: 'Hit \u2014 Small Business' },
    { type: 'desc', h: 34, text: 'jorickhoofd  \xb7  The difference between whispering and screaming' },
    { type: 'space', h: 22 },

    { type: 'sub', h: 40, text: 'Hit \u2014 Large Car' },
    { type: 'desc', h: 34, text: 'PNMCarrieRailfan  \xb7  Car Crash Elements Mix 01' },
    { type: 'space', h: 22 },

    { type: 'sub', h: 40, text: 'Hit \u2014 Small Car' },
    { type: 'desc', h: 34, text: 'avakas  \xb7  Man hit by car' },
    { type: 'space', h: 22 },

    { type: 'sub', h: 40, text: 'Hit \u2014 NPC' },
    { type: 'desc', h: 34, text: 'Christopherderp  \xb7  Hurt 2-(Male)' },
    { type: 'space', h: 22 },

    { type: 'sub', h: 40, text: 'Hit \u2014 Poster' },
    { type: 'desc', h: 34, text: 'tosha73  \xb7  Crumpling paper 002' },
    { type: 'space', h: 22 },

    { type: 'sub', h: 40, text: 'Hit \u2014 Fantasy Coffee' },
    { type: 'desc', h: 34, text: 'JohnsonBrandEditing  \xb7  Cartoon Laugh' },
    { type: 'space', h: 22 },

    { type: 'sub', h: 40, text: 'Hit \u2014 Puddle' },
    { type: 'desc', h: 34, text: 'Sadiquecat  \xb7  WD-40 in bucket  \xb7  InspectorJ  \xb7  Footsteps, Puddles' },
    { type: 'space', h: 22 },

    { type: 'sub', h: 40, text: 'Scooter Brake' },
    { type: 'desc', h: 34, text: 'Juandamb  \xb7  Brake' },
    { type: 'space', h: 22 },

    { type: 'sub', h: 40, text: 'Rain \u2014 Heavy & Light' },
    { type: 'desc', h: 34, text: 'titi2  \xb7  heavy_rain_210511_0081  \xb7  Q.K.  \xb7  Rain_01' },
    { type: 'space', h: 80 },

    { type: 'divider', h: 44 },
    { type: 'space', h: 64 },

    // ── Visual Design ─────────────────────────────────────────────────────────
    { type: 'section', h: 70, text: 'VISUAL DESIGN' },
    { type: 'space', h: 46 },

    { type: 'label', h: 48, text: 'Pixel Art & Palettes' },
    { type: 'desc', h: 36, text: 'Lucca Zhou  &  Group 7' },
    { type: 'space', h: 30 },

    { type: 'label', h: 48, text: 'Typography' },
    { type: 'desc', h: 36, text: 'jersey20  (Google Fonts, Open Licence)' },
    { type: 'space', h: 84 },

    { type: 'divider', h: 44 },
    { type: 'space', h: 64 },

    // ── Special Thanks ────────────────────────────────────────────────────────
    { type: 'section', h: 70, text: 'SPECIAL THANKS' },
    { type: 'space', h: 46 },

    { type: 'desc', h: 36, text: 'University of Bristol  \xb7  Faculty of Engineering' },
    { type: 'desc', h: 36, text: 'MSc Computer Science  \xb7  Group 7  \xb7  2025 / 2026' },
    { type: 'space', h: 30 },
    { type: 'desc', h: 36, text: 'Agile Development  \xb7  Jira  \xb7  GitHub' },
    { type: 'space', h: 180 },
];

/** Resets all credits state; call this before transitioning to STATE_CREDITS. */
function resetCredits() {
    _creditPhase = 'scroll';
    _creditScrollY = height;   // block enters from bottom of screen
    _creditPauseF = 0;
    _creditPoemAlpha = 0;
    BGM.play('EndL');
}

/** Main credits draw dispatcher. */
function drawCreditsScreen() {
    push();
    background(0);

    let s = min(width / 1920, height / 1080);
    let cx = width / 2;

    if (_creditPhase === 'scroll') {
        _creditScrollY -= _CREDIT_SCROLL_SPEED * s;

        let totalH = 0;
        for (let d of _CREDIT_DATA) totalH += d.h * s;

        let cumH = 0;
        let _bigMode = false;
        for (let i = 0; i < _CREDIT_DATA.length; i++) {
            let d = _CREDIT_DATA[i];
            if (d.type === 'section' && d.text === 'SOUNDS & MUSIC') _bigMode = true;
            let lineH = d.h * s;
            let lineY = _creditScrollY + cumH;
            if (lineY + lineH > 0 && lineY < height) {
                _renderCreditLine(d, cx, lineY + lineH / 2, s, _bigMode);
            }
            cumH += lineH;
        }
        _drawCreditsFade();

        if (_creditScrollY + totalH < 0) {
            _creditPhase = 'pause';
            _creditPauseF = 0;
        }

    } else if (_creditPhase === 'pause') {
        _creditPauseF++;
        if (_creditPauseF >= 10) {           // ~0.25s black pause before poem
            _creditPhase = 'poem';
            _creditPoemAlpha = 0;
        }

    } else if (_creditPhase === 'poem') {
        _drawCreditsPoem(s, cx);
    }

    pop();
}

/** Renders a single line entry based on its type. bigMode enlarges sub/desc/label/role. */
function _renderCreditLine(d, cx, midY, s, bigMode) {
    const bm = bigMode ? 1.4 : 1.0;
    push();
    textAlign(CENTER, CENTER);
    noStroke();

    switch (d.type) {
        case 'header':
            textFont(fonts.title || fonts.body);
            textSize(64 * s);
            fill(220, 190, 110);
            text(d.text, cx, midY);
            break;
        case 'sub':
            textFont(fonts.body);
            textSize(28 * bm * s);
            fill(165, 150, 115);
            text(d.text, cx, midY);
            break;
        case 'section':
            textFont(fonts.body);
            textSize(36 * s);
            fill(200, 170, 100);
            text(d.text, cx, midY);
            break;
        case 'name':
            textFont(fonts.title || fonts.body);
            textSize(44 * s);
            fill(245, 235, 215);
            text(d.text, cx, midY);
            break;
        case 'role':
            textFont(fonts.body);
            textSize(26 * bm * s);
            fill(165, 195, 220);
            text(d.text, cx, midY);
            break;
        case 'desc':
            textFont(fonts.body);
            textSize(22 * bm * s);
            fill(155, 148, 135);
            text(d.text, cx, midY);
            break;
        case 'label':
            textFont(fonts.body);
            textSize(30 * bm * s);
            fill(195, 180, 140);
            text(d.text, cx, midY);
            break;
        case 'divider':
            stroke(200, 170, 100, 90);
            strokeWeight(1.5 * s);
            line(cx - 440 * s, midY, cx + 440 * s, midY);
            break;
        // 'space': nothing to render
    }
    pop();
}

/** Top & bottom gradient veil so text fades in/out at screen edges. */
function _drawCreditsFade() {
    noStroke();
    let steps = 14;
    let fadeH = 110;
    for (let i = 0; i < steps; i++) {
        let t = i / (steps - 1);
        let y0 = (i / steps) * fadeH;
        let yH = fadeH / steps + 1;
        fill(0, 0, 0, lerp(230, 0, t));
        rect(0, y0, width, yH);
        fill(0, 0, 0, lerp(0, 230, t));
        rect(0, height - fadeH + y0, width, yH);
    }
}

/** Poem epilogue: fades in centred, waits for player to dismiss. */
function _drawCreditsPoem(s, cx) {
    _creditPoemAlpha = min(255, _creditPoemAlpha + 6);
    let alpha = _creditPoemAlpha;
    let cy = height / 2;

    push();
    textAlign(CENTER, CENTER);
    noStroke();
    textFont(fonts.body);

    let poem = [
        { text: '"Hope is the thing with feathers --', ts: 42 * s, col: [240, 228, 200] },
        { text: 'That perches in the soul \u2014', ts: 42 * s, col: [240, 228, 200] },
        { text: 'And sings the tune without the words \u2014', ts: 42 * s, col: [240, 228, 200] },
        { text: 'And never stops -- at all."', ts: 42 * s, col: [240, 228, 200] },
        { text: '', ts: 24 * s, col: [0, 0, 0] },
        { text: '\u2014 Emily Dickinson (1830\u20131886)', ts: 30 * s, col: [175, 160, 125] },
        { text: '', ts: 24 * s, col: [0, 0, 0] },
        { text: '', ts: 20 * s, col: [0, 0, 0] },
        { text: 'THANK YOU FOR SURVIVING THE SLOPE.', ts: 38 * s, col: [215, 185, 105] },
    ];

    let lineH = 58 * s;
    let startY = cy - (poem.length * lineH) / 2 + lineH / 2;

    for (let i = 0; i < poem.length; i++) {
        let p = poem[i];
        textSize(p.ts);
        fill(p.col[0], p.col[1], p.col[2], alpha);
        text(p.text, cx, startY + i * lineH);
    }

    // Dismiss hint — only appears once fully faded in
    if (alpha >= 252) {
        textSize(22 * s);
        fill(105, 100, 92, 170);
        text('Press any key to return to the main menu', cx, height - 48 * s);
    }

    pop();
}

/**
 * Draws a segmented pixel-art progress bar at the given position.
 * @param {number} x        Centre X of the bar.
 * @param {number} y        Centre Y of the bar.
 * @param {number} progress Normalised fill ratio [0, 1].
 */
function drawLoadingProgressBar(x, y, progress) {
    const barW = 1000;
    const barH = 24;
    const segments = 25;
    const gap = 6;
    const blockW = (barW - gap * (segments - 1)) / segments;
    const barLeft = x - barW / 2;

    push();
    rectMode(CORNER);

    // Draw segments
    for (let i = 0; i < segments; i++) {
        const bx = barLeft + i * (blockW + gap);
        const by = y - barH / 2;
        const threshold = (i + 1) / segments;

        if (progress >= threshold) {
            fill(255, 216, 0, 230);
            noStroke();
            rect(bx, by, blockW, barH);
            fill(255, 255, 255, 80);
            rect(bx, by, blockW, 3);
        } else {
            fill(255, 216, 0, 25);
            noStroke();
            rect(bx, by, blockW, barH);
            stroke(255, 216, 0, 45);
            strokeWeight(1);
            noFill();
            rect(bx, by, blockW, barH);
        }
    }

    // Percentage number to the right of the bar
    textAlign(LEFT, CENTER);
    textFont(fonts.jersey20 || fonts.time);
    textSize(28);
    fill(255, 216, 0, 200);
    noStroke();
    text(floor(progress * 100) + '%', x + barW / 2 + 18, y);

    // Iris running along the leading edge
    const sheet = assets.irisRunSheet;
    if (sheet && sheet.width > 0) {
        const frameW = 256;
        const frameH = 256;
        const displayH = 80;
        const displayW = 80;
        const frameIdx = floor(frameCount / 6) % 5;
        const irisX = barLeft + progress * barW;
        const irisY = y - barH / 2 - displayH + 8;
        imageMode(CORNER);
        image(sheet, irisX - displayW / 2, irisY, displayW, displayH,
              frameIdx * frameW, 0, frameW, frameH);
    }

    pop();
}

/**
 * Renders the splash screen: background, darkening overlay, logo, and prompts.
 */
function drawSplashScreen() {
    push();
    imageMode(CORNER);
    if (assets.menuBg) image(assets.menuBg, 0, 0, width, height);
    else background(20);

    rectMode(CORNER);
    fill(0, 0, 0, 160);
    rect(0, 0, width, height);

    drawLogoPlaceholder(width / 2, 320);
    drawInteractionPrompts();

    // Fade-in overlay: covers splash with a receding black veil on entry
    if (_splashFadeAlpha > 0) {
        noStroke();
        fill(0, 0, 0, _splashFadeAlpha);
        rect(0, 0, width, height);
        _splashFadeAlpha = max(0, _splashFadeAlpha - 4); // ~64 frames = ~1 s
    }

    pop();
}

/**
 * Renders the animated game logo with a physics-based drop-in and cloud layers.
 * @param {number} x Target centre X.
 * @param {number} y Target centre Y.
 */
function drawLogoPlaceholder(x, y) {
    let isSplash = (gameState.currentState === STATE_SPLASH);
    let isEntering = !isSplash && _menuFromSplash;
    // t: 0 = fully splash, 1 = fully menu
    let t = isSplash ? 0 : (isEntering ? _menuEnterT : 1);
    let easy = t * t * (3 - 2 * t); // smoothstep

    // ── Title params: lerp from splash sizes/offsets to menu sizes/offsets ────
    let psSz = lerp(300, 210, easy);
    let surSz = lerp(200, 190, easy);
    let psYOff = lerp(-130, -70, easy);
    let surYOff = lerp(80, 100, easy);
    let psSW = lerp(25, 10, easy);
    let surSW = lerp(20, 10, easy);

    // Alpha for splash-exclusive elements: full at splash, fades out on entry
    let splashA = constrain((1 - easy) * 255, 0, 255);
    let showSplashExtras = isSplash || isEntering;

    // ── Title reference centre Y ───────────────────────────────────────────────
    let cy;
    let tAnim = frameCount * 0.02;
    if (isSplash) {
        // Physics-based drop-in (original behaviour)
        let targetY = y + 160;
        if (_splashFadeAlpha > 0) {
            titleDrop.shake *= 0.7;
        } else if (!titleDrop.landed) {
            titleDrop.vy += 2.0;
            titleDrop.y += titleDrop.vy;
            if (titleDrop.y >= y + 160) {
                titleDrop.y = y + 160;
                titleDrop.landed = true;
                titleDrop.shake = 6;
            }
            titleDrop.shake *= 0.7;
        } else {
            titleDrop.y = lerp(titleDrop.y, targetY, 0.15);
            titleDrop.shake *= 0.7;
        }
        cy = titleDrop.y;
    } else if (isEntering) {
        // Lerp from captured splash position to the menu centre (height * 0.33)
        cy = lerp(_splashEnterCY, height * 0.33, easy);
        titleDrop.shake = 0;
    } else {
        cy = height * 0.33;
        titleDrop.shake = 0;
    }

    let shakeX = (isSplash && titleDrop.shake >= 0.5)
        ? random(-titleDrop.shake, titleDrop.shake) : 0;

    // ── Splash-exclusive: full-screen logo background ─────────────────────────
    if (showSplashExtras && assets.logoImgs && assets.logoImgs[4]) {
        push();
        imageMode(CENTER);
        tint(255, splashA);
        image(assets.logoImgs[4], width / 2, height / 2, width * 1.02, height * 1.02);
        noTint();
        pop();
    }

    // ── Rear cloud layer ──────────────────────────────────────────────────────
    if (showSplashExtras && assets.selectClouds) {
        push();
        imageMode(CENTER);
        tint(255, min(splashA, 200));
        image(assets.selectClouds[1], width * 0.1, height * 0.9 + cos(tAnim) * 10, 800, 480);
        image(assets.selectClouds[2], width * 0.1, height * 0.2 + sin(tAnim) * 10, 700, 420);
        image(assets.selectClouds[4], width * 1.0, height * 0.09 + sin(tAnim) * 10, 700, 420);
        noTint();
        pop();
    }

    // ── PARK STREET ───────────────────────────────────────────────────────────
    push();
    translate(x + shakeX, cy);
    drawSplitTitle("PARK STREET", psSz, psYOff, psSW);
    pop();

    // ── Mid cloud layer ───────────────────────────────────────────────────────
    if (showSplashExtras && assets.selectClouds) {
        push();
        imageMode(CENTER);
        tint(255, splashA);
        image(assets.selectClouds[0], x - 240, y + 250 + sin(tAnim * 1.2) * 8, 500, 300);
        noTint();
        pop();
    }

    // ── SURVIVOR ──────────────────────────────────────────────────────────────
    push();
    translate(x + shakeX, cy);
    drawSplitTitle("SURVIVOR", surSz, surYOff, surSW);
    pop();

    // ── Front cloud layer ─────────────────────────────────────────────────────
    if (showSplashExtras && assets.selectClouds) {
        push();
        imageMode(CENTER);
        tint(255, splashA);
        image(assets.selectClouds[2], width * 0.88, y + 230 + sin(tAnim) * 10, 600, 360);
        noTint();
        pop();
    }
}

/**
 * Renders a single title string with a gold fill, purple stroke, and drop shadow.
 * @param {string} txt     Text to render.
 * @param {number} size    Font size.
 * @param {number} yOff    Y offset from current translation origin.
 * @param {number} sWeight Stroke weight.
 */
function drawSplitTitle(txt, size, yOff, sWeight) {
    textAlign(CENTER, CENTER);
    textFont(fonts.logo);
    textSize(size);
    drawingContext.lineJoin = 'round';
    // Drop shadow
    noStroke();
    fill(40, 15, 60, 150);
    text(txt, 7, yOff + 7);
    // Main text with purple outline
    strokeWeight(sWeight);
    stroke(110, 60, 150);
    fill(255, 216, 0);
    text(txt, 0, yOff);
}

/**
 * Renders the "CLICK TO START" pulse prompt and the audio warning on the splash screen.
 */
function drawInteractionPrompts() {
    push();
    textAlign(CENTER, CENTER);
    textFont(fonts.time);
    let pulse = sin(frameCount * 0.1) * 50;
    fill(255, 180 + pulse);
    textSize(60);
    text("CLICK TO START", width / 2, height - 280);

    fill(255, 255);
    textSize(40);
    text("PLEASE USE HEADPHONES & LOWER VOLUME. AUDIO INITIALIZES ON CLICK.", width / 2, height - 190);

    // Fullscreen hint
    fill(255, 255);
    textSize(40);
    text("Press [F] to toggle fullscreen", width / 2, height - 130);
    pop();
}

/**
 * Renders the circular pause button in the top-right corner of the screen.
 */
function drawPauseButton() {
    push();
    let bx = width - 65;
    let by = 65;
    let isHover = dist(mouseX, mouseY, bx, by) < 80;

    if (assets.pauseImg) {
        push();
        translate(bx, by);
        if (isHover) scale(1.15);
        imageMode(CENTER);
        image(assets.pauseImg, 0, 0,);
        pop();
    } else {
        push();
        translate(bx, by);
        if (isHover) scale(1.15);
        noFill();
        stroke(255, 150);
        strokeWeight(3);
        ellipse(0, 0, 80, 80);
        fill(255, 150);
        noStroke();
        rectMode(CENTER);
        rect(-10, 0, 8, 28);
        rect(10, 0, 8, 28);
        pop();
    }

    // New-content badge at top-right of the pause icon
    if (newBadges.has("pause_btn")) {
        _drawBadge(bx + 26, by - 26, 56);
    }

    pop();
}

/**
 * Renders the pause menu overlay with background, title, and selectable options.
 */
function renderPauseOverlay() {
    // Clear pause_btn badge only when all sub-badges are gone
    if (!newBadges.has("pause.SETTINGS") && !newBadges.has("pause.STORY") && !newBadges.has("pause.HELP")) {
        newBadges.delete("pause_btn");
    }

    push();
    drawOtherBgWithOverlay();

    // Back arrow (top-left) — click to resume
    if (assets.backImg) {
        let bx = 70, by = 65;
        let isBackHover = dist(mouseX, mouseY, bx, by) < 40;
        push();
        translate(bx, by);
        if (isBackHover) scale(1.15);
        imageMode(CENTER);
        image(assets.backImg, 0, 0, 120, 120);
        pop();
    }

    if (showStoryRecap) {
        renderStoryRecap();
    } else if (showRestartConfirm) {
        // ── Endless-mode restart confirmation box ─────────────────────────────
        let btnW = (assets.btnImg ? assets.btnImg.width : 240) * 1.2;
        let btnH = (assets.btnImg ? assets.btnImg.height : 60) * 1.2;
        let spacing = 380;

        let boxW = 860;
        let boxH = 400;
        let boxX = width / 2 - boxW / 2;
        let boxY = height / 2 - boxH / 2;

        push();
        rectMode(CORNER);
        fill(14, 8, 38, 240);
        stroke(80, 180, 255, 200);
        strokeWeight(3);
        rect(boxX, boxY, boxW, boxH, 18);
        noStroke();
        pop();

        let cx = width / 2;
        let titleY = boxY + 64;
        let hintY = titleY + 76;
        let btnsY = boxY + boxH - 100;

        textAlign(CENTER, CENTER);
        textFont(fonts.title); textSize(42);
        stroke(0, 0, 0, 180); strokeWeight(5); fill(255, 215, 0);
        text("RESTART RUN?", cx, titleY);
        noStroke(); fill(255, 215, 0);
        text("RESTART RUN?", cx, titleY);

        textFont(fonts.jersey20 || fonts.body); textSize(28); noStroke();
        fill(180, 180, 220);
        text("Your current run progress will be lost.", cx, hintY);

        let anyRCHover = false;
        let totalBtnW = (RESTART_CONFIRM_OPTIONS.length - 1) * spacing + btnW;
        let btnStartX = cx - totalBtnW / 2 + btnW / 2;
        for (let i = 0; i < RESTART_CONFIRM_OPTIONS.length; i++) {
            let ox = btnStartX + i * spacing;
            let isHover = (mouseX > ox - btnW / 2 && mouseX < ox + btnW / 2 &&
                mouseY > btnsY - btnH / 2 && mouseY < btnsY + btnH / 2);
            if (isHover) { restartConfirmIndex = i; anyRCHover = true; }
            let isSelected = (i === restartConfirmIndex) && restartConfirmIndex >= 0;

            push();
            translate(ox, btnsY);
            if (isSelected) scale(1.15);
            imageMode(CENTER);
            if (assets.btnImg) image(assets.btnImg, 0, 0, btnW, btnH);
            textFont(fonts.jersey20 || fonts.body); textSize(34); textAlign(CENTER, CENTER);
            let btnColor = (RESTART_CONFIRM_OPTIONS[i] === "YES, RESTART") ? color(255, 100, 100) : color(255, 215, 0);
            stroke(0, 0, 0, 180); strokeWeight(5); fill(btnColor);
            text(RESTART_CONFIRM_OPTIONS[i], 0, -6);
            noStroke(); fill(btnColor);
            text(RESTART_CONFIRM_OPTIONS[i], 0, -6);
            pop();
        }
        if (!anyRCHover && !keyIsPressed) restartConfirmIndex = -1;
    } else if (showExitConfirm) {
        // ── Centred confirmation box ──────────────────────────────────────────
        let btnW = (assets.btnImg ? assets.btnImg.width : 240) * 1.2;
        let btnH = (assets.btnImg ? assets.btnImg.height : 60) * 1.2;
        let spacing = 380;

        let boxW = 860;
        let boxH = 460;
        let boxX = width / 2 - boxW / 2;
        let boxY = height / 2 - boxH / 2;

        // Container panel
        push();
        rectMode(CORNER);
        fill(14, 8, 38, 240);
        stroke(200, 80, 80, 200);
        strokeWeight(3);
        rect(boxX, boxY, boxW, boxH, 18);
        noStroke();
        pop();

        let cx = width / 2;
        let titleY = boxY + 64;
        let warnY = titleY + 82;
        let hintY = warnY + 60;
        let btnsY = boxY + boxH - 100;

        textAlign(CENTER, CENTER);
        textFont(fonts.title); textSize(42);
        stroke(0, 0, 0, 180); strokeWeight(5); fill(255, 100, 100);
        text("EXIT TO MAIN MENU?", cx, titleY);
        noStroke(); fill(255, 100, 100);
        text("EXIT TO MAIN MENU?", cx, titleY);

        textFont(fonts.jersey20 || fonts.body); textSize(34); noStroke();
        fill(255, 210, 80);
        text("Warning: unsaved progress may be lost.", cx, warnY);
        textSize(28); fill(180, 180, 220);
        text("Tip: click the back arrow (top-left) to return without exiting.", cx, hintY);

        let anyExitHover = false;
        let totalBtnW = (EXIT_CONFIRM_OPTIONS.length - 1) * spacing + btnW;
        let btnStartX = cx - totalBtnW / 2 + btnW / 2;
        for (let i = 0; i < EXIT_CONFIRM_OPTIONS.length; i++) {
            let ox = btnStartX + i * spacing;
            let isHover = (mouseX > ox - btnW / 2 && mouseX < ox + btnW / 2 &&
                mouseY > btnsY - btnH / 2 && mouseY < btnsY + btnH / 2);
            if (isHover) { exitConfirmIndex = i; anyExitHover = true; }
            let isSelected = (i === exitConfirmIndex) && exitConfirmIndex >= 0;

            push();
            translate(ox, btnsY);
            if (isSelected) scale(1.15);
            imageMode(CENTER);
            if (assets.btnImg) image(assets.btnImg, 0, 0, btnW, btnH);
            textFont(fonts.jersey20 || fonts.body); textSize(34); textAlign(CENTER, CENTER);
            let btnColor = (EXIT_CONFIRM_OPTIONS[i] === "YES, EXIT") ? color(255, 100, 100) : color(255, 215, 0);
            stroke(0, 0, 0, 180); strokeWeight(5); fill(btnColor);
            text(EXIT_CONFIRM_OPTIONS[i], 0, -6);
            noStroke(); fill(btnColor);
            text(EXIT_CONFIRM_OPTIONS[i], 0, -6);
            pop();
        }
        if (!anyExitHover && !keyIsPressed) exitConfirmIndex = -1;
    } else if (showRestartChoice) {
        let btnW = (assets.btnImg ? assets.btnImg.width : 240) * 1.5;
        let btnH = (assets.btnImg ? assets.btnImg.height : 60) * 1.5;
        let spacing = 145;
        let totalH = (RESTART_OPTIONS.length - 1) * spacing;
        let startY = (height / 2) - (totalH / 2) + 20;
        let titleY = startY - btnH / 2 - 110;

        textAlign(CENTER, CENTER);
        textFont(fonts.title);
        textSize(48);
        stroke(0, 0, 0, 180); strokeWeight(6); fill(255, 215, 0);
        text("RESTART?", width / 2, titleY);
        noStroke(); fill(255, 215, 0);
        text("RESTART?", width / 2, titleY);

        let anyRestartHover = false;
        for (let i = 0; i < RESTART_OPTIONS.length; i++) {
            let ox = width / 2;
            let oy = startY + i * spacing;
            let isHover = (mouseX > ox - btnW / 2 && mouseX < ox + btnW / 2 &&
                mouseY > oy - btnH / 2 && mouseY < oy + btnH / 2);
            if (isHover) { restartChoiceIndex = i; anyRestartHover = true; }
            let isSelected = (i === restartChoiceIndex) && restartChoiceIndex >= 0;

            push();
            translate(ox, oy);
            if (isSelected) scale(1.15);
            imageMode(CENTER);
            if (assets.btnImg) image(assets.btnImg, 0, 0, btnW, btnH);
            textFont(fonts.jersey20 || fonts.body); textSize(36); textAlign(CENTER, CENTER);
            stroke(0, 0, 0, 180); strokeWeight(5); fill(255, 215, 0);
            text(RESTART_OPTIONS[i], 0, -6);
            noStroke(); fill(255, 215, 0);
            text(RESTART_OPTIONS[i], 0, -6);
            pop();
        }
        if (!anyRestartHover && !keyIsPressed) restartChoiceIndex = -1;
    } else {
        let options = getPauseOptions();
        let btnW = (assets.btnImg ? assets.btnImg.width : 240) * 1.5;
        let btnH = (assets.btnImg ? assets.btnImg.height : 60) * 1.5;
        let spacing = 145;
        let totalH = (options.length - 1) * spacing;
        let startY = (height / 2) - (totalH / 2) + 30;

        let titleY = startY - btnH / 2 - 110;

        textAlign(CENTER, CENTER);
        textFont(fonts.title);
        textSize(60);
        stroke(0, 0, 0, 180); strokeWeight(6); fill(255, 215, 0);
        text("PAUSED", width / 2, titleY);
        noStroke(); fill(255, 215, 0);
        text("PAUSED", width / 2, titleY);

        let anyPauseHover = false;
        for (let i = 0; i < options.length; i++) {
            let ox = width / 2;
            let oy = startY + i * spacing;
            let isHover = (mouseX > ox - btnW / 2 && mouseX < ox + btnW / 2 &&
                mouseY > oy - btnH / 2 && mouseY < oy + btnH / 2);
            if (isHover) { pauseIndex = i; anyPauseHover = true; }
            let isSelected = (i === pauseIndex) && pauseIndex >= 0;

            push();
            translate(ox, oy);
            if (isSelected) scale(1.15);
            imageMode(CENTER);
            if (assets.btnImg) image(assets.btnImg, 0, 0, btnW, btnH);
            textFont(fonts.jersey20 || fonts.body); textSize(42); textAlign(CENTER, CENTER);
            stroke(0, 0, 0, 180); strokeWeight(5); fill(255, 215, 0);
            text(options[i], 0, -6);
            noStroke(); fill(255, 215, 0);
            text(options[i], 0, -6);
            pop();

            // New-content badge at the top-right corner of the button
            if (newBadges.has("pause." + options[i])) {
                _drawBadge(ox + btnW / 2 - 18, oy - btnH / 2 + 18, 64);
            }
        }
        if (!anyPauseHover && !keyIsPressed) pauseIndex = -1;
    }
    pop();
}

/**
 * Renders the win or fail end screen with a contextual message and retry prompt.
 */
function drawEndScreen() {
    if (assets.menuBg) image(assets.menuBg, 0, 0, width, height);
    else background(20);

    textAlign(CENTER, CENTER);
    textFont(fonts.title);
    if (gameState.currentState === STATE_WIN) {
        fill(100, 255, 100);
        textSize(80);
        text("SUCCESS", width / 2, height / 2 - 50);
    } else {
        fill(255, 50, 50);
        textSize(80);
        text("FAILED", width / 2, height / 2 - 50);
    }
    pop();
}

/**
 * Renders the story recap sub-page inside the pause overlay.
 *
 * Layer order (bottom → top):
 *   L1  other_bg + overlay      — drawn by renderPauseOverlay() before this call
 *   L2a Left sidebar (day cards)
 *   L2b frame_shape.png         — full-canvas decorative background panel
 *   L3  Story CONTENT text      — clipped to textArea, sandwiched before cloud
 *   L4  frame_cloud.png         — full-canvas decorative overlay (covers content edges)
 *   L5  Title text              — always on top of everything
 *   L5  Up/Down arrows          — always on top, fully clickable
 */
function renderStoryRecap() {
    // chapter 0 = Prologue, chapters 1-5 = Days 1-5
    let chapterNums = ["P", "01", "02", "03", "04", "05"];
    let chapterLabels = ["PROLOGUE", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

    // Unlock logic: Prologue always visible; Day N needs Day N complete (currentUnlockedDay >= N+1)
    let debugAll = (typeof DEBUG_UNLOCK_ALL !== 'undefined' && DEBUG_UNLOCK_ALL);
    let isUnlocked;
    if (storyRecapDay === 0) {
        isUnlocked = (currentUnlockedDay >= 1) || debugAll;
    } else {
        isUnlocked = (storyRecapDay < currentUnlockedDay) || debugAll;
    }
    let recap = buildRecapEntries(storyRecapDay);

    // ── L2a: Left sidebar — skewed chapter cards (Prologue + Days 1-5) ──
    let sidebarX = width * 0.16;
    let sidebarBaseY = height * 0.45;
    let cardSpacing = 130;

    push();
    translate(sidebarX, sidebarBaseY);
    for (let i = 0; i < 6; i++) {
        let diff = i - storyRecapDay;
        let distFromCenter = abs(diff);
        let cardY = diff * cardSpacing;
        let cardX = distFromCenter * 30;

        // Prologue (i=0) always unlocked; Day i unlocked when currentUnlockedDay >= i+1 → i < currentUnlockedDay
        let itemUnlocked = (i === 0)
            ? ((currentUnlockedDay >= 1) || debugAll)
            : ((i < currentUnlockedDay) || debugAll);
        let isSelected = (i === storyRecapDay);
        let alpha = map(distFromCenter, 0, 2, 255, 50);
        let s = map(distFromCenter, 0, 1, 1.15, 0.8);

        push();
        translate(cardX, cardY);
        rotate(radians(-12));
        scale(constrain(s, 0.5, 1.4));

        noStroke();
        fill(itemUnlocked
            ? (isSelected ? [255, 20, 147, alpha] : [70, 20, 90, alpha * 0.6])
            : [30, 30, 45, alpha * 0.7]);

        beginShape();
        vertex(-110, -32); vertex(130, -44);
        vertex(110, 32); vertex(-130, 44);
        endShape(CLOSE);

        textAlign(LEFT, CENTER);
        textFont(fonts.title); textSize(i === 0 ? 28 : 40);
        fill(isSelected ? color(255, 215, 0, alpha) : color(255, alpha));
        text(chapterNums[i], -90, 4);

        textFont(fonts.body); textSize(i === 0 ? 14 : 18);
        if (itemUnlocked) {
            fill(isSelected ? color(255, 215, 0, alpha) : color(255, 215, 0, alpha * 0.8));
            text(chapterLabels[i], -10, 8);
        } else {
            fill(180, 60, 60, alpha); textSize(14);
            text("LOCKED", -10, 8);
        }

        pop();
    }
    pop();

    // ── L2b: frame_shape.png ──
    if (assets.storyShape) {
        push();
        imageMode(CENTER);
        image(assets.storyShape,
            storyDebugData.shape.x, storyDebugData.shape.y,
            storyDebugData.shape.w, storyDebugData.shape.h);
        drawingContext.filter = 'none';
        pop();
    }

    // ── L3: Story CONTENT lines — clipped to textArea, sandwiched before cloud ──
    let textX = storyDebugData.textArea.x;
    let textY = storyDebugData.textArea.y;
    let textW = storyDebugData.textArea.w;
    let textH = storyDebugData.textArea.h;

    if (recap && isUnlocked) {
        // ── Row-height constants ──────────────────────────────────────────────
        let speakerRowH = 34;   // height of a speaker-name row (px)
        let speakerGapH = 18;   // gap injected before each speaker block (except first)
        let dialogRowH = 34;   // height per visual line of dialogue text (px)
        let blankH = 20;   // height of a blank separator
        let scrollStep = 36;   // pixels scrolled per key-press (stored for key handler)
        let lineLeft = textX - textW / 2 + 16;
        let dialogueIndent = lineLeft + 20;
        let dialogAvailW = textW - 50;   // matches text(…, textW - 50) wrapping width
        let contentTop = textY - textH / 2 + 20;

        let entries = recap.entries || [];

        // ── Pass 1: compute cumulative pixel Y offsets for every entry ────────
        // Must be done inside draw() so textWidth() works correctly.
        let cumY = new Array(entries.length);
        let totalH = 0;
        for (let j = 0; j < entries.length; j++) {
            let entry = entries[j];
            if (!entry || entry.type === 'blank') {
                cumY[j] = totalH;
                totalH += blankH;
            } else if (entry.type === 'speaker') {
                if (j > 0) totalH += speakerGapH;   // breathing room before new speaker
                cumY[j] = totalH;
                totalH += speakerRowH;
            } else {
                // dialogue — measure actual wrapped line count
                textFont(fonts.body); textSize(28); textStyle(NORMAL);
                let nLines = _countWrappedLines(entry.text, dialogAvailW);
                cumY[j] = totalH;
                totalH += nLines * dialogRowH;
            }
        }
        let maxScroll = max(0, totalH - textH + 16);
        storyScrollOffset = constrain(storyScrollOffset, 0, maxScroll);

        // Store for key handlers
        _storyScrollbar.maxScroll = maxScroll;
        _storyScrollbar._scrollStep = scrollStep;

        // ── Pass 2: render visible entries (clipped) ──────────────────────────
        push();
        drawingContext.save();
        drawingContext.beginPath();
        drawingContext.rect(textX - textW / 2, textY - textH / 2, textW, textH);
        drawingContext.clip();

        let clipTop = textY - textH / 2;
        let clipBot = textY + textH / 2;

        for (let j = 0; j < entries.length; j++) {
            let ly = contentTop + cumY[j] - storyScrollOffset;
            // Skip entirely out-of-view entries
            if (ly > clipBot + dialogRowH * 3) continue;
            if (ly < clipTop - speakerRowH * 2) continue;

            let entry = entries[j];
            if (!entry || entry.type === 'blank') continue;

            // Fade near top/bottom edges
            let edgeFade = 255;
            let topEdge = clipTop + 32;
            let botEdge = clipBot - 32;
            if (ly < topEdge) edgeFade = map(ly, clipTop, topEdge, 0, 255);
            if (ly > botEdge) edgeFade = map(ly, botEdge, clipBot, 255, 0);
            edgeFade = constrain(edgeFade, 0, 255);

            if (entry.type === 'speaker') {
                textFont(fonts.body); textSize(26); textStyle(BOLD);
                textAlign(LEFT, CENTER);
                stroke(0, 0, 0, edgeFade * 0.5); strokeWeight(2);
                fill(255, 215, 0, edgeFade);
                text(entry.name, lineLeft, ly + speakerRowH / 2);
                textStyle(NORMAL);
            } else if (entry.type === 'dialogue') {
                textFont(fonts.body); textSize(28); textStyle(NORMAL);
                textAlign(LEFT, TOP);
                noStroke();
                fill(255, 240, 220, edgeFade);
                text(entry.text, dialogueIndent, ly, dialogAvailW);
            }
        }

        drawingContext.restore();
        pop();

        // ── Vertical scrollbar (outside clip, always visible) ─────────────────
        let sbTrackX = textX + textW / 2 + 16;
        let sbTrackTop = textY - textH / 2;
        let sbTrackH = textH;
        let sbW = 10;

        _storyScrollbar.x = sbTrackX;
        _storyScrollbar.y = sbTrackTop;
        _storyScrollbar.w = sbW;
        _storyScrollbar.h = sbTrackH;

        if (maxScroll > 0) {
            let thumbH = max(36, sbTrackH * (textH / (totalH + 16)));
            let thumbY = sbTrackTop + (storyScrollOffset / maxScroll) * (sbTrackH - thumbH);
            _storyScrollbar.thumbY = thumbY;
            _storyScrollbar.thumbH = thumbH;

            push();
            noStroke();
            fill(255, 255, 255, 35);
            rect(sbTrackX - sbW / 2, sbTrackTop, sbW, sbTrackH, sbW / 2);
            fill(_storyScrollDragging ? color(255, 215, 0, 230) : color(255, 215, 0, 160));
            rect(sbTrackX - sbW / 2, thumbY, sbW, thumbH, sbW / 2);
            pop();
        }
        // ── Scroll hint — pinned to the very bottom of the canvas ─────────────
        push();
        const _recapLabel = "UP / DOWN to scroll  \u00b7  Drag the bar on the right";
        rectMode(CENTER);
        fill(101, 63, 191, 204);
        stroke('#E2CAF8'); strokeWeight(3);
        rect(width / 2, height - 36, 660, 52, 15);
        noStroke();
        textFont(fonts.jersey20 || fonts.body); textSize(26);
        textAlign(CENTER, CENTER);
        stroke(0, 0, 0, 180); strokeWeight(3);
        fill(220, 185, 255);
        text(_recapLabel, width / 2, height - 36);
        noStroke(); fill(220, 185, 255);
        text(_recapLabel, width / 2, height - 36);
        pop();
        // Unused: recap.lines no longer referenced below
    } else {
        push();

        textAlign(CENTER, CENTER);
        textFont(fonts.title);

        textSize(45);
        stroke(0, 0, 0, 180);
        strokeWeight(6);
        fill(255, 215, 0);
        text("LOCKED", textX, textY);

        noStroke();
        fill(255, 215, 0);
        text("LOCKED", textX, textY);

        textFont(fonts.body);
        textSize(20);
        fill(200);
        let _unlockDayHint = (storyRecapDay === 0)
            ? "COMPLETE DAY 1 TO UNLOCK"
            : "COMPLETE DAY " + storyRecapDay + " TO UNLOCK";
        text(_unlockDayHint, textX, textY + 40);
        pop();
    }

    // ── L4: frame_cloud.png — sits on top of content, under title ──
    if (assets.storyCloud) {
        push();
        imageMode(CENTER);
        tint(255, storyDebugData.cloud.alpha);
        image(assets.storyCloud,
            storyDebugData.cloud.x, storyDebugData.cloud.y,
            storyDebugData.cloud.w, storyDebugData.cloud.h);
        noTint();
        pop();
    }

    // ── L5: Title — drawn ABOVE the cloud ──
    if (recap && isUnlocked) {
        push();
        textFont(fonts.title); textSize(35); textAlign(CENTER, CENTER);
        stroke(0, 0, 0, 200); strokeWeight(6); fill(255, 105, 180);
        text(recap.title, storyDebugData.titleArea.x, storyDebugData.titleArea.y);
        noStroke(); fill(255, 105, 180);
        text(recap.title, storyDebugData.titleArea.x, storyDebugData.titleArea.y);
        pop();
    }

    // ── L5: Up/Down arrows + day indicator — identical to level-select arrows ──
    let arrowX = width - 90;
    let centerY = height / 2;
    let arrowSz = 60;
    let arrowGap = 90;

    if (assets.backImg) {
        // Up arrow (previous chapter — Prologue is 0)
        let canGoUp = storyRecapDay > 0;
        let upHover = canGoUp && dist(mouseX, mouseY, arrowX, centerY - arrowGap) < 35;
        push();
        translate(arrowX, centerY - arrowGap);
        rotate(HALF_PI);
        if (!canGoUp) tint(255, 60);
        if (upHover) scale(1.25);
        imageMode(CENTER);
        image(assets.backImg, 0, 0, arrowSz, arrowSz);
        noTint();
        pop();

        // Chapter indicator between arrows
        let chapterLabel = storyRecapDay === 0 ? "PROLOGUE" : "DAY " + storyRecapDay;
        push();
        textFont(fonts.title); textSize(storyRecapDay === 0 ? 14 : 20); textAlign(CENTER, CENTER);
        stroke(0, 0, 0, 150); strokeWeight(3); fill(255, 215, 0);
        text(chapterLabel, arrowX, centerY);
        noStroke(); fill(255, 215, 0);
        text(chapterLabel, arrowX, centerY);
        pop();

        // Down arrow (next chapter)
        let canGoDown = storyRecapDay < 5;
        let downHover = canGoDown && dist(mouseX, mouseY, arrowX, centerY + arrowGap) < 35;

        push();
        translate(arrowX, centerY + arrowGap);
        rotate(-HALF_PI);
        if (!canGoDown) tint(255, 60);
        if (downHover) scale(1.25);
        imageMode(CENTER);
        image(assets.backImg, 0, 0, arrowSz, arrowSz);
        noTint();
        pop();
    }

    // ── DEV MODE: bounding boxes + controls hint ──
    if (showStoryDebugControls) {
        drawStoryDebugOverlay();
    }
}

/**
 * Draws bounding-box overlays for each story layer during dev adjust mode.
 * Layers: [1] Shape  [2] Cloud  [3] TextArea  [4] TitleArea
 */
function drawStoryDebugOverlay() {
    push();
    let layers = [
        { key: 'shape', label: 'SHAPE', color: [255, 80, 80] },
        { key: 'cloud', label: 'CLOUD', color: [80, 200, 255] },
        { key: 'textArea', label: 'CONTENT', color: [80, 255, 80] },
        { key: 'titleArea', label: 'TITLE', color: [255, 200, 0] }
    ];

    for (let l = 0; l < layers.length; l++) {
        let layerIdx = l + 1;
        let d = storyDebugData[layers[l].key];
        let col = layers[l].color;
        let active = (layerIdx === storyDebugActiveLayer);

        stroke(col[0], col[1], col[2], active ? 255 : 100);
        strokeWeight(active ? 3 : 1);
        noFill();
        rectMode(CENTER);
        rect(d.x, d.y, d.w, d.h);

        noStroke();
        fill(col[0], col[1], col[2], active ? 230 : 130);
        textFont(fonts.body); textSize(15); textAlign(LEFT, BOTTOM);
        text(`[${layerIdx}] ${layers[l].label}: (${d.x}, ${d.y})  ${d.w}×${d.h}`,
            d.x - d.w / 2 + 4, d.y - d.h / 2 - 4);
    }

    // Controls hint bar
    fill(0, 0, 0, 170);
    noStroke(); rectMode(CORNER);
    rect(0, height - 50, width, 50);
    fill(255, 255, 0, 220);
    textFont(fonts.body); textSize(17); textAlign(CENTER, CENTER);
    text("DEV  [1] Shape  [2] Cloud  [3] Content  [4] Title  |  Arrows: Move  |  Shift+Arrows: Resize  |  P: print",
        width / 2, height - 25);
    pop();
}

/**
 * Prints current storyDebugData to the browser console.
 */
function printStoryDebugData() {
    console.log("[DEV] Current storyDebugData:");
    console.log(JSON.stringify(storyDebugData, null, 2));

}

function drawSaveChoiceScreen() {
    drawOtherBgWithOverlay();

    const save = SaveSystem.load();
    const W = width, H = height;
    const cx = W / 2;
    const s = min(W / 1920, H / 1080);

    push();

    // ── Title ────────────────────────────────────────────────────────────────
    let fT = (typeof fonts !== 'undefined') ? (fonts.title || fonts.body) : null;
    let fB = (typeof fonts !== 'undefined') ? fonts.body : null;
    if (fT) textFont(fT);
    textAlign(CENTER, CENTER);
    textSize(72 * s);
    fill(255, 220, 80);
    noStroke();
    text('CONTINUE ADVENTURE?', cx, H * 0.22);

    // ── Save info card ────────────────────────────────────────────────────────
    if (fB) textFont(fB);
    const cardW = 680 * s, cardH = 160 * s;
    const cardX = cx - cardW / 2, cardY = H * 0.33;
    fill(30, 20, 60, 220);
    stroke(180, 140, 80); strokeWeight(2 * s);
    rectMode(CORNER);
    rect(cardX, cardY, cardW, cardH, 14 * s);
    noStroke();

    if (save) {
        textSize(30 * s);
        fill(200, 180, 140);
        text('LAST SAVED  ' + SaveSystem.formatTime(save.savedAt), cx, cardY + cardH * 0.32);
        textSize(36 * s);
        fill(255);
        text('DAY ' + save.currentDayID + '   |   UP TO DAY ' + save.currentUnlockedDay + ' UNLOCKED', cx, cardY + cardH * 0.72);
    } else {
        textSize(30 * s);
        fill(180, 160, 120);
        text('No save data found', cx, cardY + cardH * 0.55);
    }

    // ── Option buttons (assets.btnImg, 2× integer scale: 240×60 → 480×120) ──
    const btnW = 480 * s;   // 240 native × 2
    const btnH = 120 * s;   // 60  native × 2
    const optLabels = ['[E]  CONTINUE', '[ENTER]  NEW GAME'];
    const optY = [H * 0.615, H * 0.760];

    if (fT) textFont(fT);
    for (let i = 0; i < 2; i++) {
        const bx = cx - btnW / 2;
        const by = optY[i] - btnH / 2;
        const isHover = _saveChoiceIndex === i;

        // Draw button image (tint dims unselected option)
        imageMode(CORNER);
        if (assets.btnImg) {
            if (isHover) { tint(255); } else { tint(180, 180, 180, 200); }
            image(assets.btnImg, bx, by, btnW, btnH);
            noTint();
        }

        // Text — style matches UIComponent (gold + black outline, slightly above centre)
        const textY = optY[i] - 8 * s;
        textSize(24 * s);
        textAlign(CENTER, CENTER);
        stroke(0, 0, 0, 180);
        strokeWeight(5 * s);
        fill(isHover ? color(255, 215, 0) : color(200, 185, 150));
        text(optLabels[i], cx, textY);
        noStroke();
        fill(isHover ? color(255, 215, 0) : color(200, 185, 150));
        text(optLabels[i], cx, textY);
    }

    // ── Hint ─────────────────────────────────────────────────────────────────
    if (fB) textFont(fB);
    textSize(22 * s);
    fill(160, 140, 110, 200);
    noStroke();
    textAlign(CENTER, CENTER);
    text('↑ ↓  to navigate  ·  E = continue  ·  ENTER = new game', cx, H * 0.88);

    pop();
}

/**
 * Hit-test for save-choice screen buttons.
 * click=true → execute on hit; click=false → update hover index only.
 */
function _saveChoiceHitTest(mx, my, click) {
    const W = width, H = height;
    const cx = W / 2;
    const s = min(W / 1920, H / 1080);
    const btnW = 480 * s;
    const btnH = 120 * s;
    const optY = [H * 0.615, H * 0.760];

    for (let i = 0; i < 2; i++) {
        const bx = cx - btnW / 2;
        const by = optY[i] - btnH / 2;
        if (mx >= bx && mx <= bx + btnW && my >= by && my <= by + btnH) {
            if (click) {
                _onSaveChoiceExecute(i);
            } else {
                _saveChoiceIndex = i;
            }
            return;
        }
    }
}

/**
 * Executes the save-choice action for option index i (0=Continue, 1=New Game).
 */
function _onSaveChoiceExecute(i) {
    if (typeof playSFX === 'function') playSFX(sfxClick);
    if (i === 0) {
        // CONTINUE — restore save
        if (typeof SaveSystem !== 'undefined' && SaveSystem.hasSave()) {
            triggerTransition(() => SaveSystem.applyAndResume());
        } else {
            // No save — fall back to new game
            _onSaveChoiceExecute(1);
        }
    } else {
        // NEW GAME — clear save, start from Day 1
        if (typeof SaveSystem !== 'undefined') SaveSystem.clear();
        if (typeof _playerChoices !== 'undefined') _playerChoices = {};
        if (typeof _nodeChoices !== 'undefined') _nodeChoices = {};
        triggerTransition(() => {
            gameState.resetFlags();
            currentDayID = 1;
            currentUnlockedDay = 1;
            if (typeof _prologueSeen !== 'undefined' && !_prologueSeen &&
                typeof startCutsceneFromNode === 'function') {
                _prologueSeen = true;
                // Stop menu BGM, hold black for 0.7s silence → crash SFX → 1.3s → news broadcast
                if (typeof BGM !== 'undefined' && BGM && typeof BGM.stop === 'function') BGM.stop();
                globalFade.holdUntilMs = performance.now() + 2200;
                setTimeout(() => {
                    if (typeof playSFX === 'function' && sfxHitBigCar) playSFX(sfxHitBigCar);
                }, 700);
                globalFade.holdDoneCallback = () => {
                    startCutsceneFromNode('prologue_01', () => {
                        // Stop ambient ambulance that played during the news broadcast
                        if (typeof sfxAmbulance !== 'undefined' && sfxAmbulance &&
                            typeof sfxAmbulance.isPlaying === 'function' && sfxAmbulance.isPlaying()) {
                            sfxAmbulance.stop();
                        }
                        triggerTransition(() => {
                            if (mainMenu) {
                                mainMenu.menuState = STATE_LEVEL_SELECT;
                                mainMenu.timeWheel.bgAlpha = 0;
                                mainMenu.timeWheel.triggerEntrance();
                            }
                            gameState.setState(STATE_LEVEL_SELECT);
                        });
                    });
                };
            } else {
                if (mainMenu) {
                    mainMenu.menuState = STATE_LEVEL_SELECT;
                    mainMenu.timeWheel.bgAlpha = 0;
                    mainMenu.timeWheel.triggerEntrance();
                }
                gameState.setState(STATE_LEVEL_SELECT);
            }
        });
    }
}
