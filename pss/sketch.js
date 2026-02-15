// Park Street Survivor - Main Application Controller
// Responsibilities: Global state management, hardware input routing, and game loop orchestration.

// ─── GLOBAL SYSTEM INSTANCES ─────────────────────────────────────────────────
let gameState, mainMenu, roomScene, inventory, env, player, obstacleManager;
let backpackUI;

// ─── GAME PROGRESS STATE ─────────────────────────────────────────────────────
let currentUnlockedDay = 1;
let currentDayID = 1;

// ─── ASSET REGISTRY ──────────────────────────────────────────────────────────
let assets = {
    menuBg: null,
    otherBg: null,
    keys: {},
    selectClouds: [],
    selectBg: {
        unlock: null,
        lock: null
    },
    previews: [],
    playerAnim: {
        north: [],
        south: [],
        west:  [],
        east:  []
    }
};
let fonts = {};
let bgm, sfxSelect, sfxClick;

// ─── AUDIO VOLUME CONTROLS ───────────────────────────────────────────────────
let masterVolumeBGM = 0.25;
let masterVolumeSFX = 0.7;

// ─── GLOBAL FADE TRANSITION CONTROLLER ───────────────────────────────────────
// Drives a 0.3s fade-in / fade-out overlay across all scene transitions.
let globalFade = {
    alpha: 0,
    speed: 255 / (0.3 * 60),
    isFading: false,
    dir: 1,
    callback: null
};

// ─── PAUSE MENU STATE ─────────────────────────────────────────────────────────
let pauseIndex = 0;
const PAUSE_OPTIONS = ["RESUME", "HELP", "QUIT TO MENU"];
let pauseFromState = null;

// ─── SPLASH LOGO ANIMATION STATE ─────────────────────────────────────────────
let titleDrop = { y: -200, vy: 0, landed: false, shake: 0 };

// ─── ITEM ENCYCLOPEDIA ───────────────────────────────────────────────────────
const ITEM_WIKI = [
    // BUFFS (Help Page 2)
    { name: 'COFFEE',      desc: 'INSTANT ENERGY +20', unlockDay: 1, imgKey: 'coffee',                      type: 'BUFF'   },
    { name: 'MOTORCYCLE',  desc: 'INSTANT ENERGY +20', unlockDay: 1, imgKey: 'motorcycle',                  type: 'BUFF'   },
    { name: 'HOT COFFEE',  desc: 'INSTANT ENERGY +20', unlockDay: 2, imgKey: 'coffee',                      type: 'BUFF'   },
    { name: 'HOT COFFEE',  desc: 'INSTANT ENERGY +20', unlockDay: 3, imgKey: 'coffee',                      type: 'BUFF'   },
    { name: 'HOT COFFEE',  desc: 'INSTANT ENERGY +20', unlockDay: 4, imgKey: 'coffee',                      type: 'BUFF'   },
    { name: 'HOT COFFEE',  desc: 'INSTANT ENERGY +20', unlockDay: 5, imgKey: 'coffee',                      type: 'BUFF'   },

    // HAZARDS (Help Page 3)
    { name: 'HEAVY TRAFFIC',  desc: 'DANGER: INSTANT FAIL',         unlockDay: 1, imgKey: ['ambulance', 'bus'],       type: 'HAZARD' },
    { name: 'LIGHT TRAFFIC',  desc: 'SPACE OBSTACLE: BLOCKS PATH.', unlockDay: 1, imgKey: ['car_brown', 'car_red'],   type: 'HAZARD' },
    { name: 'HOMELESS',       desc: 'TRIPS PLAYER: SLOW DOWN',      unlockDay: 1, imgKey: 'homeless',                type: 'HAZARD' },
    { name: 'PROMOTER',       desc: 'TRIPS PLAYER: SLOW DOWN',      unlockDay: 1, imgKey: 'promoter',                type: 'HAZARD' },
    { name: 'SCOOTER RIDER',  desc: 'TRIPS PLAYER: SLOW DOWN',      unlockDay: 1, imgKey: 'scooter_rider',           type: 'HAZARD' },
    { name: 'PADDLE',         desc: 'TRIPS PLAYER: SLOW DOWN',      unlockDay: 4, imgKey: 'scooter_rider',           type: 'HAZARD' }
];

// ─── ASSET LOADING TRACKER ───────────────────────────────────────────────────
let isLoaded = false;
let loadProgress = 0;
let smoothProgress = 0;
let assetsLoadedCount = 0;
const totalAssetsToLoad = 29;


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1: ASSET LOADING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Increments the loaded-asset counter and updates the progress ratio.
 */
function itemLoaded() {
    assetsLoadedCount++;
    loadProgress = assetsLoadedCount / totalAssetsToLoad;
}

/**
 * p5.js lifecycle hook: loads all assets before setup() runs.
 * Each callback calls itemLoaded() to track real-time progress.
 */
function preload() {
    // Visual assets
    assets.menuBg      = loadImage('assets/cbg.png', itemLoaded);
    assets.otherBg     = loadImage('assets/other_bg.png', itemLoaded);
    assets.roomBg      = loadImage('assets/room.png', itemLoaded);
    assets.inventoryBg    = loadImage('assets/inventory/table.png',        itemLoaded);
    assets.backpackImg    = loadImage('assets/inventory/backpack.png',      itemLoaded);
    assets.studentCardImg = loadImage('assets/inventory/student_card.png',  itemLoaded);
    assets.computerImg    = loadImage('assets/inventory/computer.png',      itemLoaded);

    assets.selectBg.unlock = loadImage('assets/select_background/day_unlock.jpg', itemLoaded);
    assets.selectBg.lock   = loadImage('assets/select_background/day_lock.jpg', itemLoaded);

    for (let i = 1; i <= 5; i++) {
        assets.selectClouds.push(loadImage(`assets/select_cloud/Cloud-${i}.png`, itemLoaded));
    }

    // Typography
    fonts.title = loadFont('assets/fonts/PressStart2P-Regular.ttf', itemLoaded);
    fonts.time  = loadFont('assets/fonts/VT323-Regular.ttf', itemLoaded);
    fonts.body  = loadFont('assets/fonts/DotGothic16-Regular.ttf', itemLoaded);
    fonts.logo  = loadFont('assets/fonts/title_1.otf', itemLoaded);

    // Audio
    soundFormats('mp3', 'wav');
    bgm       = loadSound('assets/audio/music/MainTheme.mp3', itemLoaded);
    sfxSelect = loadSound('assets/audio/effects/Select.wav', itemLoaded);
    sfxClick  = loadSound('assets/audio/effects/Click.wav', itemLoaded);

    // Control key sprites
    assets.keys.w     = loadImage('assets/control_keys/W.png', itemLoaded);
    assets.keys.a     = loadImage('assets/control_keys/A.png', itemLoaded);
    assets.keys.s     = loadImage('assets/control_keys/S.png', itemLoaded);
    assets.keys.d     = loadImage('assets/control_keys/D.png', itemLoaded);
    assets.keys.up    = loadImage('assets/control_keys/ARROWUP.png', itemLoaded);
    assets.keys.down  = loadImage('assets/control_keys/ARROWDOWN.png', itemLoaded);
    assets.keys.left  = loadImage('assets/control_keys/ARROWLEFT.png', itemLoaded);
    assets.keys.right = loadImage('assets/control_keys/ARROWRIGHT.png', itemLoaded);
    assets.keys.enter = loadImage('assets/control_keys/ENTER.png', itemLoaded);
    assets.keys.space = loadImage('assets/control_keys/SPACE.png', itemLoaded);
    assets.keys.e     = loadImage('assets/control_keys/E.png', itemLoaded);
    assets.keys.p     = loadImage('assets/control_keys/P.png', itemLoaded);

    // Logo frames
    assets.logoImgs = [
        loadImage('assets/logo/logo_1.png', itemLoaded),
        loadImage('assets/logo/logo_2.png', itemLoaded),
        loadImage('assets/logo/logo_3.png', itemLoaded),
        loadImage('assets/logo/logo_4.png', itemLoaded),
        loadImage('assets/logo/logo_5.png', itemLoaded)
    ];

    assets.uobLogo = loadImage('assets/logo/uob_logo.png', itemLoaded);

    // Entity preview sprites (no progress tracking — non-critical)
    if (!assets.previews) assets.previews = {};
    assets.previews['player']        = loadImage('assets/characters/wiki/Iris.png');
    assets.previews['npc_1']         = loadImage('assets/characters/wiki/Wiola.png');
    assets.previews['ambulance']     = loadImage('assets/obstacles/ambulance.png');
    assets.previews['bus']           = loadImage('assets/obstacles/bus.png');
    assets.previews['car_brown']     = loadImage('assets/obstacles/car_brown.png');
    assets.previews['car_red']       = loadImage('assets/obstacles/car_red.png');
    assets.previews['homeless']      = loadImage('assets/obstacles/homeless.png');
    assets.previews['promoter']      = loadImage('assets/obstacles/promoter.png');
    assets.previews['scooter_rider'] = loadImage('assets/obstacles/scooter_rider.png');
    assets.previews['coffee']        = loadImage('assets/power_up/coffee.png');
    assets.previews['motorcycle']    = loadImage('assets/power_up/motorcycle.png');

    // Player directional animation spritesheets
    assets.playerAnim = {};
    const dirs = ['north', 'south', 'west', 'east'];
    dirs.forEach(d => {
        assets.playerAnim[d] = { walk: [], idle: null };
        assets.playerAnim[d].idle = loadImage(`assets/characters/spritesheet/${d}.png`);
        loadImage(`assets/characters/spritesheet/spritesheet_${d}.png`, (img) => {
            let fw = img.width / 5;
            let fh = img.height;
            for (let i = 0; i < 5; i++) {
                assets.playerAnim[d].walk.push(img.get(i * fw, 0, fw, fh));
            }
        });
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

    gameState       = new GameState();
    mainMenu        = new MainMenu();
    roomScene       = new RoomScene();
    inventory       = new InventorySystem();
    env             = new Environment();
    player          = new Player();
    obstacleManager = new ObstacleManager();
    backpackUI      = new BackpackVisual(inventory, roomScene);

    textFont(fonts.body);
    gameState.currentState = STATE_LOADING;

    if (developerMode) devApplyStartupSkip();
}

/**
 * p5.js lifecycle hook: main render loop — routes to the active scene each frame.
 */
function draw() {
    background(30);

    try {
        switch (gameState.currentState) {
            case STATE_LOADING:
                drawLoadingScreen();
                break;

            case STATE_SPLASH:
                drawSplashScreen();
                break;

            case STATE_MENU:
            case STATE_LEVEL_SELECT:
            case STATE_SETTINGS:
            case STATE_HELP:
                if (mainMenu) {
                    mainMenu.menuState = gameState.currentState;
                    mainMenu.display();
                }
                break;

            case STATE_ROOM:
                if (roomScene) roomScene.display();
                if (player) {
                    player.update();
                    player.display();
                }
                drawPauseButton();
                break;

            case STATE_INVENTORY:
                if (backpackUI) backpackUI.display();
                break;

            case STATE_DAY_RUN:
                runGameLoop();
                drawPauseButton();
                break;

            case STATE_PAUSED:
                if (gameState.previousState === STATE_ROOM) {
                    if (roomScene) roomScene.display();
                    if (player) player.display();
                } else if (gameState.previousState === STATE_DAY_RUN) {
                    if (env) env.display();
                    if (obstacleManager) obstacleManager.display();
                    if (player) player.display();
                }
                renderPauseOverlay();
                break;

            case STATE_FAIL:
            case STATE_WIN:
                drawEndScreen();
                break;
        }
    } catch (e) {
        console.error("[Core Systems] Runtime Exception:", e);
    }

    renderGlobalFade();
}

/**
 * Updates all game-world systems for a single frame during the run state.
 */
function runGameLoop() {
    if (env)             { env.update(GLOBAL_CONFIG.scrollSpeed); env.display(); }
    if (obstacleManager) { obstacleManager.update(GLOBAL_CONFIG.scrollSpeed, player); obstacleManager.display(); }
    if (player)          { player.update(); player.display(); }
}


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3: AUDIO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Plays a sound effect at the global SFX volume level.
 */
function playSFX(sound) {
    if (sound) {
        sound.setVolume(masterVolumeSFX);
        sound.play();
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
    globalFade.dir      = 1;
    globalFade.alpha    = 0;
    globalFade.callback = onBlackout;
}

/**
 * Renders the full-screen fade overlay each frame.
 * Advances the alpha, fires the midpoint callback, and resets state on completion.
 */
function renderGlobalFade() {
    if (!globalFade.isFading && globalFade.alpha <= 0) return;

    globalFade.alpha += globalFade.speed * globalFade.dir;

    if (globalFade.dir === 1 && globalFade.alpha >= 255) {
        globalFade.alpha = 255;
        if (globalFade.callback) globalFade.callback();
        globalFade.dir = -1;
    }
    if (globalFade.dir === -1 && globalFade.alpha <= 0) {
        globalFade.alpha    = 0;
        globalFade.isFading = false;
        globalFade.callback = null;
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
    if (globalFade.isFading) return;
    let state = gameState.currentState;

    // Toggle developer mode
    if (key === '0') devToggle();

    // Pause / unpause — available in most gameplay states
    if (key === 'p' || key === 'P' || keyCode === ESCAPE) {
        if (state !== STATE_MENU && state !== STATE_LEVEL_SELECT &&
            state !== STATE_SETTINGS && state !== STATE_HELP &&
            state !== STATE_SPLASH && state !== STATE_INVENTORY) {
            playSFX(sfxClick);
            togglePause();
            // If we just resumed (left STATE_PAUSED), clear the pause-origin tracker
            if (gameState.currentState !== STATE_PAUSED) {
                pauseFromState = null;
            }
            pauseIndex = 0;
            return;
        }
    }

    // Pause menu navigation
    if (state === STATE_PAUSED) {
        if (keyCode === UP_ARROW || keyCode === 87 || keyCode === DOWN_ARROW || keyCode === 83) {
            playSFX(sfxSelect);
            if (keyCode === UP_ARROW || keyCode === 87) {
                pauseIndex = (pauseIndex - 1 + PAUSE_OPTIONS.length) % PAUSE_OPTIONS.length;
            } else {
                pauseIndex = (pauseIndex + 1) % PAUSE_OPTIONS.length;
            }
        } else if (keyCode === ENTER || keyCode === 13) {
            playSFX(sfxClick);
            handlePauseSelection();
        }
        return;
    }

    // Menu navigation
    if (state === STATE_MENU || state === STATE_LEVEL_SELECT ||
        state === STATE_SETTINGS || state === STATE_HELP) {
        if (mainMenu) mainMenu.handleKeyPress(key, keyCode);
    }
    // Room navigation + inventory toggle
    else if (state === STATE_ROOM) {
        if (roomScene) roomScene.handleKeyPress(keyCode);
        if (keyCode === 69) gameState.currentState = STATE_INVENTORY;
    }
    // Retry from end screen
    else if (state === STATE_FAIL || state === STATE_WIN) {
        if (keyCode === ENTER || keyCode === 13) {
            playSFX(sfxClick);
            setupRun(currentDayID);
        }
    }

    // Close inventory with ESC
    if (gameState.currentState === STATE_INVENTORY && keyCode === ESCAPE) {
        gameState.currentState = STATE_ROOM;
        return false;
    }
}

/**
 * Executes the selected option in the pause menu.
 */
function handlePauseSelection() {
    if (PAUSE_OPTIONS[pauseIndex] === "RESUME") {
        togglePause();
        pauseFromState = null;
    } else if (PAUSE_OPTIONS[pauseIndex] === "HELP") {
        pauseFromState         = gameState.previousState;
        playSFX(sfxClick);
        gameState.currentState = STATE_HELP;
        mainMenu.menuState     = STATE_HELP;
        mainMenu.helpPage      = 0;
    } else if (PAUSE_OPTIONS[pauseIndex] === "QUIT TO MENU") {
        triggerTransition(() => {
            gameState.setState(STATE_MENU);
            mainMenu.menuState = STATE_MENU;
            pauseFromState     = null;
        });
    }
}

/**
 * Dispatches mouse press events; also unlocks the Web Audio context on first click.
 */
function mousePressed() {
    if (globalFade.isFading) return;
    let state = gameState.currentState;

    // Splash screen: unlock audio and transition to main menu
    if (state === STATE_SPLASH) {
        if (getAudioContext().state !== 'running') getAudioContext().resume();
        playSFX(sfxClick);
        if (bgm && !bgm.isPlaying()) {
            bgm.setVolume(masterVolumeBGM);
            bgm.loop();
        }
        triggerTransition(() => gameState.setState(STATE_MENU));
        return;
    }

    if (state === STATE_MENU || state === STATE_LEVEL_SELECT ||
        state === STATE_SETTINGS || state === STATE_HELP) {
        if (mainMenu) mainMenu.handleClick(mouseX, mouseY);
    } else if (state === STATE_ROOM || state === STATE_DAY_RUN) {
        // Pause button hit-test
        if (dist(mouseX, mouseY, width - 60, 50) < 25) {
            playSFX(sfxClick);
            togglePause();
            pauseIndex = 0;
        }
    }

    if (gameState.currentState === STATE_INVENTORY) {
        if (backpackUI) backpackUI.handleMousePressed(mouseX, mouseY);
    }
}

/**
 * Dispatches mouse release events to the active UI systems.
 */
function mouseReleased() {
    if (mainMenu) mainMenu.handleRelease();
    if (gameState.currentState === STATE_INVENTORY) {
        if (backpackUI) backpackUI.handleMouseReleased(mouseX, mouseY);
    }
}

/**
 * Dispatches mouse drag events to the active UI systems.
 */
function mouseDragged() {
    if (gameState.currentState === STATE_INVENTORY) {
        if (backpackUI) backpackUI.handleMouseDragged(mouseX, mouseY);
    }
}

/**
 * Dispatches mouse move events to the active UI systems.
 */
function mouseMoved() {
    if (gameState.currentState === STATE_INVENTORY) {
        if (backpackUI) backpackUI.handleMouseMoved(mouseX, mouseY);
    }
}


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6: STATE MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Toggles between the paused state and the previous active state.
 */
function togglePause() {
    if (gameState.currentState === STATE_PAUSED) gameState.setState(gameState.previousState);
    else gameState.setState(STATE_PAUSED);
}

/**
 * Initialises and starts a new run for the given day ID.
 */
function setupRun(dayID) {
    currentDayID = dayID;
    player.applyLevelStats(dayID);
    player.x = 500;
    player.y = height / 2;
    roomScene.reset();
    obstacleManager = new ObstacleManager();
    gameState.setState(STATE_ROOM);
}


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 7: UI RENDERING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Renders the loading bar and UoB logo while assets stream in.
 * Transitions to STATE_SPLASH once the bar reaches 100%.
 */
function drawLoadingScreen() {
    background(10, 10, 15);
    let cx = width / 2;
    let cy = height / 2;

    if (assets.uobLogo) {
        push();
        imageMode(CENTER);
        let wave       = sin(frameCount * 0.05);
        let imgScale   = 1.0 + wave * 0.05;
        let alphaValue = 180 + wave * 75;
        tint(255, alphaValue);
        image(assets.uobLogo, cx, cy - 80, 120 * imgScale, 120 * imgScale);
        pop();
    }

    // Smooth the raw load ratio for a cleaner animation
    if (smoothProgress < loadProgress) {
        smoothProgress += 0.010;
    }
    smoothProgress = constrain(smoothProgress, 0, 1.0);

    drawLoadingProgressBar(cx, cy + 80, smoothProgress);

    if (smoothProgress >= 1.0) {
        setTimeout(() => {
            if (gameState.currentState === STATE_LOADING) {
                gameState.setState(STATE_SPLASH);
            }
        }, 150);
    }
}

/**
 * Draws a segmented pixel-art progress bar at the given position.
 * @param {number} x        Centre X of the bar.
 * @param {number} y        Centre Y of the bar.
 * @param {number} progress Normalised fill ratio [0, 1].
 */
function drawLoadingProgressBar(x, y, progress) {
    let totalSegments = 10;
    let gap    = 8;
    let blockW = 24;
    let blockH = 16;
    let totalW = (blockW * totalSegments) + (gap * (totalSegments - 1));

    push();
    textAlign(CENTER, TOP);
    textFont(fonts.time);
    textSize(18);
    fill(255, 216, 0, 180);
    text("[ " + floor(progress * 100) + "% COMPLETE ]", x, y + 25);

    rectMode(CORNER);
    for (let i = 0; i < totalSegments; i++) {
        let bx        = (x - totalW / 2) + i * (blockW + gap);
        let by        = y - blockH / 2;
        let threshold = (i + 1) / totalSegments;

        if (progress >= threshold) {
            // Filled segment
            fill(255, 216, 0, 230);
            noStroke();
            rect(bx, by, blockW, blockH);
            // Pixel highlight strip
            fill(255, 255, 255, 100);
            rect(bx, by, blockW, 2);
        } else {
            // Empty segment
            fill(255, 216, 0, 30);
            noStroke();
            rect(bx, by, blockW, blockH);
            stroke(255, 216, 0, 50);
            strokeWeight(1);
            noFill();
            rect(bx, by, blockW, blockH);
        }
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
    pop();
}

/**
 * Renders the animated game logo with a physics-based drop-in and cloud layers.
 * @param {number} x Target centre X.
 * @param {number} y Target centre Y.
 */
function drawLogoPlaceholder(x, y) {
    let isSplash = (gameState.currentState === STATE_SPLASH);
    let t        = frameCount * 0.02;
    let targetY  = isSplash ? (y + 160) : (y + 10);

    // Drop-in physics
    if (!titleDrop.landed) {
        titleDrop.vy += 1.2;
        titleDrop.y  += titleDrop.vy;
        if (titleDrop.y >= y + 160) {
            titleDrop.y      = y + 160;
            titleDrop.landed = true;
            titleDrop.shake  = 6;
        }
    } else {
        titleDrop.y = lerp(titleDrop.y, targetY, 0.15);
    }
    titleDrop.shake *= 0.7;

    // Full-screen logo background
    if (isSplash && assets.logoImgs && assets.logoImgs[4]) {
        push();
        imageMode(CENTER);
        image(assets.logoImgs[4], width / 2, height / 2, width * 1.02, height * 1.02);
        pop();
    }

    // Rear cloud layer
    if (isSplash && assets.selectClouds) {
        push();
        imageMode(CENTER);
        tint(255, 255, 255, 200);
        image(assets.selectClouds[1], width * 0.1,  height * 0.9  + cos(t) * 10,  800, 480);
        image(assets.selectClouds[2], width * 0.1,  height * 0.2  + sin(t) * 10,  700, 420);
        image(assets.selectClouds[4], width * 1.0,  height * 0.09 + sin(t) * 10,  700, 420);
        pop();
    }

    // "PARK STREET" title
    push();
    translate(x + random(-titleDrop.shake, titleDrop.shake), titleDrop.y);
    drawSplitTitle("PARK STREET", 300, -130, 25);
    pop();

    // Mid cloud layer (between title lines)
    if (isSplash && assets.selectClouds) {
        push();
        imageMode(CENTER);
        noTint();
        image(assets.selectClouds[0], x - 240, y + 250 + sin(t * 1.2) * 8, 500, 300);
        pop();
    }

    // "SURVIVOR" subtitle
    push();
    translate(x + random(-titleDrop.shake, titleDrop.shake), titleDrop.y);
    drawSplitTitle("SURVIVOR", 200, 80, 20);
    pop();

    // Front cloud layer
    if (isSplash && assets.selectClouds) {
        push();
        imageMode(CENTER);
        noTint();
        image(assets.selectClouds[2], width * 0.88, y + 230 + sin(t) * 10, 600, 360);
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
    pop();
}

/**
 * Renders the circular pause button in the top-right corner of the screen.
 */
function drawPauseButton() {
    push();
    let bx = width - 60;
    let by = 50;
    noFill();
    stroke(255, 150);
    strokeWeight(2);
    ellipse(bx, by, 40, 40);
    fill(255, 150);
    noStroke();
    rectMode(CENTER);
    rect(bx - 5, by, 4, 15);
    rect(bx + 5, by, 4, 15);
    pop();
}

/**
 * Renders the pause menu overlay with background, title, and selectable options.
 */
function renderPauseOverlay() {
    push();
    if (assets.otherBg) {
        imageMode(CORNER);
        image(assets.otherBg, 0, 0, width, height);
        rect(0, 0, width, height);
    } else {
        fill(0, 0, 0, 200);
        rect(0, 0, width, height);
    }

    textAlign(CENTER, CENTER);
    textFont(fonts.title);
    fill(255);
    textSize(60);
    text("PAUSED", width / 2, height / 2 - 100);

    textFont(fonts.body);
    for (let i = 0; i < PAUSE_OPTIONS.length; i++) {
        let isSelected = (i === pauseIndex);
        fill(isSelected ? 255 : 150);
        textSize(isSelected ? 32 : 28);
        text(isSelected ? `> ${PAUSE_OPTIONS[i]} <` : PAUSE_OPTIONS[i], width / 2, height / 2 + 20 + i * 60);
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

    textFont(fonts.body);
    fill(255);
    textSize(24);
    let msg = (gameState.failReason === "HIT_BUS")   ? "You were hit by a speeding bus." :
              (gameState.failReason === "EXHAUSTED") ? "You ran out of energy."          :
              (gameState.failReason === "LATE")      ? "You are fired!"                  : "Game Over.";
    text(msg, width / 2, height / 2 + 20);
    textSize(18);
    text("Press ENTER to return to Room", width / 2, height / 2 + 100);
}


