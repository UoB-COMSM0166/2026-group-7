// [Role: Core Systems Developer]
// Project: Park Street Survivor - Main Application Controller
// Responsibilities: Global state management, hardware input routing, and game loop synchronization.

// Global System Instances
let gameState, mainMenu, roomScene, inventory, env, player, obstacleManager;
let currentUnlockedDay = 1; 
let currentDayID = 1;
let assets = {
    menuBg: null,      
    keys: {},        
    selectClouds: [],
    selectBg: {  
        unlock: null,
        lock: null
    },
    previews: []
}; 
let fonts = {}; 
let bgm, sfxSelect, sfxClick;

// Audio Engine Configuration
let masterVolumeBGM = 0.25;
let masterVolumeSFX = 0.7;

// GLOBAL TRANSITION CONTROLLER: 0.3s Fade-in/Fade-out Engine
let globalFade = {
    alpha: 0,
    speed: 255 / (0.3 * 60), 
    isFading: false,
    dir: 1, 
    callback: null 
};

const ITEM_WIKI = [
    { name: 'HOT COFFEE', desc: 'INSTANT ENERGY +20', unlockDay: 1, icon: '☕', type: 'BUFF' },
    { name: 'DASH DRINK', desc: 'SPEED BOOST FOR 3S', unlockDay: 3, icon: '⚡', type: 'BUFF' },
    { name: 'YELLOW BUS', desc: 'DANGER: INSTANT FAIL', unlockDay: 1, icon: '🚌', type: 'HAZARD' },
    { name: 'STRAY TRASH', desc: 'TRIPS PLAYER: SLOW DOWN', unlockDay: 2, icon: '🗑️', type: 'HAZARD' }
];

let isLoaded = false;
let loadProgress = 0;
const totalAssets = 24;

/**
 * ASSET PRELOADING
 * Synchronous loading of high-priority assets to ensure availability before setup().
 */
function preload() {
    // Visual Assets: Backgrounds and Sprites
    assets.menuBg = loadImage('assets/cbg.png');

    assets.selectBg.unlock = loadImage('assets/select_background/day_unlock.jpg');
    assets.selectBg.lock = loadImage('assets/select_background/day_lock.jpg');

    for (let i = 1; i <= 5; i++) {
        assets.selectClouds.push(loadImage(`assets/select_cloud/Cloud-${i}.png`));
    }
    
    // Typography: Font mapping for specific UI roles
    fonts.title = loadFont('assets/fonts/PressStart2P-Regular.ttf'); 
    fonts.time = loadFont('assets/fonts/VT323-Regular.ttf');        
    fonts.body = loadFont('assets/fonts/DotGothic16-Regular.ttf');  

    // Audio Assets: Music and Sound Effects
    soundFormats('mp3', 'wav');
    bgm = loadSound('assets/audio/music/MainTheme.mp3');
    sfxSelect = loadSound('assets/audio/effects/Select.wav');
    sfxClick = loadSound('assets/audio/effects/Click.wav');

    // Help Assets: Control Keys
    if (!assets.keys) assets.keys = {};

    assets.keys.w = loadImage('assets/control_keys/W.png');
    assets.keys.a = loadImage('assets/control_keys/A.png');
    assets.keys.s = loadImage('assets/control_keys/S.png');
    assets.keys.d = loadImage('assets/control_keys/D.png');

    assets.keys.up    = loadImage('assets/control_keys/ARROWUP.png');
    assets.keys.down  = loadImage('assets/control_keys/ARROWDOWN.png');
    assets.keys.left  = loadImage('assets/control_keys/ARROWLEFT.png');
    assets.keys.right = loadImage('assets/control_keys/ARROWRIGHT.png');

    assets.keys.enter = loadImage('assets/control_keys/ENTER.png');
    assets.keys.space = loadImage('assets/control_keys/SPACE.png');
    assets.keys.e     = loadImage('assets/control_keys/E.png');
    assets.keys.p     = loadImage('assets/control_keys/P.png');

}

/**
 * ENGINE INITIALISATION
 * Bootstraps the p5.js canvas and instantiates all core system modules.
 */
function setup() {
    let cvs = createCanvas(GLOBAL_CONFIG.resolutionW, GLOBAL_CONFIG.resolutionH);
    cvs.parent('canvas-container'); 
    noSmooth(); // Preserves pixel-art clarity across all rendering layers

    // Module Instantiation: Building the game hierarchy
    gameState = new GameState();
    mainMenu = new MainMenu();
    roomScene = new RoomScene();
    inventory = new InventorySystem();
    env = new Environment();
    player = new Player();
    obstacleManager = new ObstacleManager();

    // Default font configuration
    textFont(fonts.body);

    // Initial State: Set to Splash to allow for required browser audio-context interaction
    gameState.currentState = STATE_LOADING;
    
}

/**
 * GLOBAL SFX WRAPPER
 * Standardized interface for playing sound effects with master volume scaling.
 */
function playSFX(sound) {
    if (sound) {
        sound.setVolume(masterVolumeSFX);
        sound.play();
    }
}

/**
 * GLOBAL TRANSITION TRIGGER
 * Initiates a fade sequence and executes the callback at the blackout point.
 */
function triggerTransition(onBlackout) {
    if (globalFade.isFading) return;
    globalFade.isFading = true;
    globalFade.dir = 1;
    globalFade.alpha = 0;
    globalFade.callback = onBlackout;
}

/**
 * GLOBAL TRANSITION RENDERER
 * Final rendering layer to ensure the fade overlay covers all game elements.
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
        globalFade.alpha = 0;
        globalFade.isFading = false;
        globalFade.callback = null;
    }
    push();
    noStroke();
    fill(0, globalFade.alpha);
    rect(0, 0, width, height);
    pop();
}

/**
 * MAIN EXECUTION LOOP
 * High-level scene router that manages draw calls based on the Finite State Machine.
 */
let pauseIndex = 0;
const PAUSE_OPTIONS = ["RESUME", "QUIT TO MENU"];

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
                if (mainMenu) mainMenu.display();
                break;

            case STATE_ROOM:
                if (roomScene) roomScene.display();
                if (player) {
                    player.update(); 
                    player.display();
                }
                drawPauseButton();
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
 * [Role: UI/UX + Core Systems]
 * UI COMPONENT: INTERACTION PROMPTS
 * Displays pulsing instructional text to trigger browser audio context.
 */
function drawInteractionPrompts() {
    push();
    textAlign(CENTER, CENTER);
    
    // 1. PRIMARY PROMPT: CLICK TO START
    // Logic: Use sine wave for smooth alpha pulsing (60fps baseline)
    textFont(fonts.body);
    let pulse = sin(frameCount * 0.1) * 50; 
    fill(255, 180 + pulse); // Alpha ranges between 130-230
    textSize(50);
    text("CLICK TO START", width / 2, height - 280);
    
    // 2. SECONDARY INFO: AUDIO STATUS
    // Logic: Static, slightly dimmed text for technical instruction
    fill(255, 120); 
    textSize(30);
    text("AUDIO CONTEXT WILL INITIALIZE ON INTERACTION", width / 2, height - 190);
}

/**
 * UPDATED SPLASH SCREEN LOGIC
 */
function drawSplashScreen() {
    push();
    imageMode(CORNER); 
    
    if (assets.menuBg) {
        image(assets.menuBg, 0, 0, width, height); 
    } else {
        background(20); 
    }
    
    rectMode(CORNER);
    fill(0, 0, 0, 160);
    rect(0, 0, width, height);
    
    drawLogoPlaceholder(width / 2, 320);
    drawInteractionPrompts();
    pop(); 
}

/**
 * [Role: UI/UX + Core Systems]
 * LOGIC: DYNAMIC LOGO PLACEHOLDER
 * Serves as a visual bridge until the 800x400 asset is integrated.
 */
function drawLogoPlaceholder(x, y) {
    push();
    rectMode(CENTER);
    
    // LAYER 1: Boundary Box (Specs: 800x400)
    // Helps developer verify the spacing in the 1920x1080 canvas
    noFill();
    stroke(255, 100); 
    strokeWeight(1);
    rect(x, y, 800, 400); 
    
    // LAYER 2: Branding Text (Font: Press Start 2P)
    textAlign(CENTER, CENTER);
    textFont(fonts.title);
    
    // Gold tint for "PARK STREET"
    fill(255, 215, 0); 
    textSize(75);
    text("PARK STREET", x, y - 40);
    
    // Pure white for "SURVIVOR"
    fill(255);
    textSize(45);
    text("SURVIVOR", x, y + 60);
    
    // LAYER 3: Developer Note
    textFont(fonts.body);
    textSize(18);
    fill(150);
    text("[ ASSET PENDING: 800 x 400 TITLE LOGO ]", x, y + 150);
    pop();
}

/**
 * GAMEPLAY LOGIC SYNCHRONISATION
 * Coordinates the update and display calls for the physics-based running scene.
 */
function runGameLoop() {
    if (env) { env.update(GLOBAL_CONFIG.scrollSpeed); env.display(); }
    if (obstacleManager) { obstacleManager.update(GLOBAL_CONFIG.scrollSpeed, player); obstacleManager.display(); }
    if (player) { player.update(); player.display(); }
}

/**
 * HARDWARE INPUT ROUTING: KEYBOARD
 * Directs keyboard events to the appropriate system module based on current GameState.
 */
function keyPressed() {
    if (globalFade.isFading) return;
    let state = gameState.currentState;

    // Logic: Global Pause Trigger
    if (key === 'p' || key === 'P' || keyCode === ESCAPE) {
        if (state !== STATE_MENU && state !== STATE_LEVEL_SELECT && state !== STATE_SETTINGS && state !== STATE_HELP && state !== STATE_SPLASH) {
            playSFX(sfxClick);
            togglePause();
            pauseIndex = 0; 
            return; 
        }
    }

    // Logic: Pause Menu Navigation
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

    // Module Delegation: Route inputs to active scenes
    if (state === STATE_MENU || state === STATE_LEVEL_SELECT || state === STATE_SETTINGS || state === STATE_HELP) {
        if (mainMenu) mainMenu.handleKeyPress(key, keyCode);
    } 
    else if (state === STATE_ROOM) {
        if (roomScene) roomScene.handleKeyPress(keyCode);
    }
    else if (state === STATE_FAIL || state === STATE_WIN) {
        if (keyCode === ENTER || keyCode === 13) {
            playSFX(sfxClick);
            setupRun(currentDayID);
        }
    }
}

/**
 * STATE RESOLUTION: PAUSE INTERFACE
 * Handles the logic for resuming gameplay or returning to the main menu.
 */
function handlePauseSelection() {
    if (PAUSE_OPTIONS[pauseIndex] === "RESUME") {
        togglePause();
    } else if (PAUSE_OPTIONS[pauseIndex] === "QUIT TO MENU") {
        triggerTransition(() => {
            gameState.setState(STATE_MENU);
            mainMenu.menuState = STATE_MENU;
        });
    }
}

/**
 * HARDWARE INPUT ROUTING: MOUSE
 * Manages click-based interactions, including the Splash screen audio unlock.
 */
function mousePressed() {
    if (globalFade.isFading) return;
    let state = gameState.currentState;

    // Logic: Audio Context Unlock (Browser Security Policy requirement)
    if (state === STATE_SPLASH) {
        if (getAudioContext().state !== 'running') {
            getAudioContext().resume();
        }

        playSFX(sfxClick);
        if (bgm && !bgm.isPlaying()) {
            bgm.setVolume(masterVolumeBGM);
            bgm.loop();
        }

        triggerTransition(() => {
        gameState.setState(STATE_MENU);
        });

        return;
    }

    // Menu and In-game UI interaction routing
    if (state === STATE_MENU || state === STATE_LEVEL_SELECT || state === STATE_SETTINGS || state === STATE_HELP) {
        if (mainMenu) mainMenu.handleClick(mouseX, mouseY);
    }
    else if (state === STATE_ROOM || state === STATE_DAY_RUN) {
        // Logic: Virtual Pause Button Detection
        if (dist(mouseX, mouseY, width - 60, 50) < 25) {
            playSFX(sfxClick);
            togglePause();
            pauseIndex = 0;
        }
    }
}

/**
 * MOUSE RELEASE ROUTER
 * Notifies active modules of button release events for UI components like sliders.
 */
function mouseReleased() {
    if (mainMenu) mainMenu.handleRelease();
}

/**
 * UTILITY: PAUSE TOGGLE
 * Efficiently swaps between the active scene and the pause overlay.
 */
function togglePause() {
    if (gameState.currentState === STATE_PAUSED) {
        gameState.setState(gameState.previousState);
    } else {
        gameState.setState(STATE_PAUSED);
    }
}

/**
 * SESSION MANAGER: LEVEL BOOTSTRAP
 * Resets the environment, player stats, and state machine to prepare for a specific Day.
 */
function setupRun(dayID) {
    currentDayID = dayID;
    player.applyLevelStats(dayID);
    player.x = 500; 
    player.y = height / 2; 
    roomScene.reset();
    obstacleManager = new ObstacleManager(); // Clear previous level hazards
    gameState.setState(STATE_ROOM);
}

/**
 * UI RENDERING: SESSION RESULTS
 * Displays final results (Success/Failure) and provides navigation feedback.
 */
function drawEndScreen() {
    if (assets.menuBg) image(assets.menuBg, 0, 0, width, height);
    else background(20); 

    textAlign(CENTER, CENTER);
    let state = gameState.currentState;
    
    textFont(fonts.title);
    if (state === STATE_WIN) {
        fill(100, 255, 100); textSize(80); text("SUCCESS", width/2, height/2 - 50);
    } else {
        fill(255, 50, 50); textSize(80); text("FAILED", width/2, height/2 - 50);
    }

    textFont(fonts.body);
    fill(255); textSize(24); 
    let displayMessage = (gameState.failReason === "HIT_BUS") ? "You were hit by a speeding bus." :
                         (gameState.failReason === "EXHAUSTED") ? "You ran out of energy." :
                         (gameState.failReason === "LATE") ? "You are fired!" : "Game Over.";
    text(displayMessage, width / 2, height / 2 + 20);
    textSize(18); text("Press ENTER to return to Room", width/2, height/2 + 100);
}

/**
 * UI RENDERING: INTERACTIVE HUD ELEMENTS
 * Draws the global pause button accessible during gameplay.
 */
function drawPauseButton() {
    push();
    let bx = width - 60; let by = 50;
    noFill(); stroke(255, 150); strokeWeight(2); ellipse(bx, by, 40, 40);
    fill(255, 150); noStroke(); rectMode(CENTER);
    rect(bx - 5, by, 4, 15); rect(bx + 5, by, 4, 15);
    pop();
}

/**
 * UI RENDERING: PAUSE INTERFACE
 * Renders the selection menu when the game is in a suspended state.
 */
function renderPauseOverlay() {
    push();
    fill(0, 0, 0, 150); 
    rectMode(CORNER); 
    rect(0, 0, width, height);
    
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
 * BRANDED LOADING SCREEN
 * Features: Terminal-style text, animated keycaps, and a minimalist progress line.
 */
/**
 * BRANDED LOADING SCREEN: PIXEL DOT VARIANT
 */
function drawLoadingScreen() {
    background(10, 10, 15);
    let cx = width / 2;
    let cy = height / 2;

    if (assets.keys && assets.keys.enter) {
        let sheet = assets.keys.enter;
        let animFrame = floor(frameCount / 15) % 3;
        imageMode(CENTER);
        tint(255, 215, 0, sin(frameCount * 0.1) * 40 + 200);
        image(sheet, cx, cy - 60, 120, 80, animFrame * (sheet.width / 3), 0, sheet.width / 3, sheet.height);
        noTint();
    }

    textAlign(CENTER, CENTER);
    textFont(fonts.title);
    fill(255, 215, 0);
    textSize(22);
    text("SYSTEM INITIALIZING" + ((floor(frameCount / 20) % 2 === 0) ? "_" : " "), cx, cy + 40);

    let dots = 10, dSize = 12, dGap = 8;
    let totalW = (dSize + dGap) * dots - dGap;
    
    let loadingFrames = 120; 
    let progress = min(frameCount / loadingFrames, 1.0); 
    let litDots = floor(progress * dots);

    rectMode(CENTER);
    for (let i = 0; i < dots; i++) {
        let px = cx - totalW / 2 + i * (dSize + dGap) + dSize / 2;
        fill(i < litDots ? [255, 215, 0] : 40);
        rect(px, cy + 90, dSize, dSize);
    }

    if (progress >= 1.0) {
        if (frameCount % 30 === 0) {
            gameState.currentState = STATE_SPLASH;
        }
    }
}