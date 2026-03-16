// Park Street Survivor - Developer Tools (merged from DevTools.js)
// Responsibilities: All debug flags, testing utilities, and obstacle tuning panel.
// HOW TO USE: Set the flags below, then reload the page.
//             Press '0' in-game to toggle developerMode at runtime.
//             Press ` or F2 to open the TestingPanel overlay.

// ─── UI TUNING VARS (live-editable from TestingPanel / corner-drag) ──────────
/** Render width for all main-menu buttons (uniform). */
let devMenuBtnW = 260;
/** Render height for all main-menu buttons (uniform). */
let devMenuBtnH = 90;
/** Text size drawn on main-menu buttons. */
let devMenuTextSize = 55;
/** Active corner-drag state for main-menu button resize. null = not dragging. */
let devResizeState = null;

// ─── DEBUG FLAGS ─────────────────────────────────────────────────────────────

/**
 * Master developer overlay switch.
 * true  → skips loading/splash, shows collision boxes and dev HUD.
 * false → normal game flow.
 */
let developerMode = false;

/**
 * Bypass day-lock checks in the level-select screen.
 * true  → all days are always selectable regardless of progress.
 * false → only unlocked days are selectable.
 */
const DEBUG_UNLOCK_ALL = developerMode;  // auto-unlocks all days when dev mode is on

/**
 * Which scene to jump to immediately on startup (only active when developerMode = true).
 * Options: STATE_ROOM | STATE_DAY_RUN | STATE_MENU | STATE_LEVEL_SELECT
 */
const DEBUG_START_STATE = STATE_DAY_RUN;

/**
 * Player starting position used by setupRoomTestMode().
 */
const DEBUG_PLAYER_X = 940;
const DEBUG_PLAYER_Y = 550;

/**
 * Day ID to load when jumping directly into a run (DEBUG_START_STATE = STATE_DAY_RUN).
 */
const DEBUG_DAY_ID = 1;

// ─── STORY RECAP ─────────────────────────────────────────────────────
/**
 * Developer flag to show the story recap screen.
 */
const DEBUG_STORY_RECAP = false;

/**
 * Developer data for the story recap screen.
 * All x/y values are CENTER coordinates (imageMode CENTER).
 * Adjust using arrow keys (move) + SHIFT+arrow keys (resize) in dev mode.
 */
let storyDebugData = {
    shape: {
        x: 925,    // center X of frame_shape panel
        y: 520,    // center Y
        w: 1620,   // width
        h: 1050,   // height
        alpha: 255
    },
    cloud: {
        x: 895,    // center X of decorative frame_cloud overlay
        y: 545,    // center Y (on top of shape + content)
        w: 1660,   // width
        h: 1065,   // height
        alpha: 255
    },
    textArea: {
        x: 1125,   // center X of clipped story CONTENT region (lines only)
        y: 530,    // center Y
        w: 735,    // width
        h: 490     // height
    },
    titleArea: {
        x: 1125,   // center X of story title (drawn above cloud)
        y: 250,    // center Y — sits above the content, on top of all layers
        w: 700,    // width (for debug box display)
        h: 60      // height (for debug box display)
    }
};

/**
 * Developer flag to show on-screen controls for adjusting the story recap layout in real-time.
 */
let showStoryDebugControls = false;

/**
 * Currently selected layer in story debug mode.
 * 1 = shape (frame_shape), 2 = cloud (frame_cloud), 3 = textArea
 */
let storyDebugActiveLayer = 1;

/**
 * Enters the story recap debug mode, allowing real-time adjustments of the recap layout.
 */
function devGoToStoryRecap() {
    console.log("[DEV] Entering STORY RECAP debug mode");
    gameState.currentState = STATE_PAUSED;
    gameState.previousState = STATE_MENU; // 设置一个安全的 previousState
    showStoryRecap = true;
    storyRecapDay = 1;
    storyScrollOffset = 0;
    pauseIndex = -1;
    showStoryDebugControls = true;
    currentUnlockedDay = 5;  // unlock all days so arrows are navigable in dev mode

    console.log("[DEV] Story Debug Controls activated");
    console.log("[DEV] Press 'C' to toggle control panel");
    console.log("[DEV] Use arrow keys + SHIFT to adjust selected layer");
    console.log("[DEV] Press '1' for Shape, '2' for Cloud, '3' for Text Area");
}

// ─── RUNTIME TOGGLE ──────────────────────────────────────────────────────────

/**
 * Flips developerMode on/off at runtime and logs the new state.
 * Bound to the '0' key inside keyPressed() in sketch.js.
 */
function devToggle() {
    developerMode = !developerMode;
    console.log(`[DEV] Developer Mode: ${developerMode ? "ON" : "OFF"}`);
    if (developerMode) {
        console.log("[DEV] Available commands: setupRoomTestMode(), setupRunTestMode()");
    }
}


// ─── SCENE JUMP UTILITIES ────────────────────────────────────────────────────

/**
 * Drops the game directly into the Room scene for layout and interaction testing.
 * @param {number} dayOverride Optional day ID override.
 * Call from the browser console: setupRoomTestMode() or setupRoomTestMode(4)
 */
function setupRoomTestMode(dayOverride) {
    const dayID = Number.isFinite(Number(dayOverride)) ? Number(dayOverride) : DEBUG_DAY_ID;
    console.log(`[DEV] Entering ROOM directly (Day ${dayID})`);
    currentDayID = dayID;
    if (player) player.applyLevelStats(dayID);
    gameState.currentState = STATE_ROOM;
    if (player) {
        player.x = DEBUG_PLAYER_X;
        player.y = DEBUG_PLAYER_Y;
    }
    if (roomScene) roomScene.reset();
    if (backpackUI) backpackUI.resetForNewDay();
}

/**
 * Drops the game directly into the Day Run scene for obstacle/gameplay testing.
 * @param {number} dayOverride Optional day ID override.
 * Call from the browser console: setupRunTestMode() or setupRunTestMode(4)
 */
function setupRunTestMode(dayOverride) {
    const dayID = Number.isFinite(Number(dayOverride)) ? Number(dayOverride) : DEBUG_DAY_ID;
    console.log(`[DEV] Entering DAY_RUN directly (Day ${dayID})`);
    currentDayID = dayID;
    if (player) player.applyLevelStats(dayID);
    if (player) {
        player.x = GLOBAL_CONFIG.lanes.lane1;
        player.y = PLAYER_RUN_FOOT_Y;
    }
    if (obstacleManager) obstacleManager = new ObstacleManager();
    if (levelController) levelController.initializeLevel(dayID);
    gameState.setState(STATE_DAY_RUN);
}

/**
 * Jumps directly to the Win screen for UI/flow testing.
 * Call from the browser console: devGoToWin()
 */
function devGoToWin() {
    console.log("[DEV] Forcing WIN state");
    gameState.setState(STATE_WIN);
}

/**
 * Jumps directly to the Fail screen with a given reason.
 * @param {string} reason "HIT_BUS" | "EXHAUSTED" | "LATE"
 * Call from the browser console: devGoToFail("HIT_BUS")
 */
function devGoToFail(reason = "HIT_BUS") {
    console.log(`[DEV] Forcing FAIL state (${reason})`);
    gameState.failReason = reason;
    gameState.setState(STATE_FAIL);
}

/**
 * Unlocks all days by setting currentUnlockedDay to the maximum.
 * Call from the browser console: devUnlockAllDays()
 */
function devUnlockAllDays() {
    currentUnlockedDay = Object.keys(DAYS_CONFIG).length;
    console.log(`[DEV] All days unlocked (currentUnlockedDay = ${currentUnlockedDay})`);
}

/**
 * Resets player health to full during a run.
 * Call from the browser console: devRefillHealth()
 */
function devRefillHealth() {
    if (player) {
        player.health = player.maxHealth;
        console.log("[DEV] Player health refilled");
    }
}


// ─── STARTUP SKIP ────────────────────────────────────────────────────────────

/**
 * Called at the end of setup() when developerMode is true.
 * Skips loading/splash and jumps to the configured start state.
 */
function devApplyStartupSkip() {
    console.log(`[DEV] Startup skip → ${DEBUG_START_STATE}`);
    gameState.currentState = DEBUG_START_STATE;

    if (DEBUG_STORY_RECAP) {
        setTimeout(() => {
            devGoToStoryRecap();
        }, 100);
        return;
    }

    if (DEBUG_START_STATE === STATE_ROOM) {
        setupRoomTestMode(DEBUG_DAY_ID);
    } else if (DEBUG_START_STATE === STATE_DAY_RUN) {
        setupRunTestMode();
    } else if (DEBUG_START_STATE === STATE_INVENTORY) {
        console.log("[DEV] Opening Inventory screen directly");
    }

}

// ─────────────────────────────────────────────────────────────────────────────
// Obstacle Debug Panel
// Responsibilities: Runtime tuning UI for per-day obstacle enablement and level parameters.

class TestingPanel {
    constructor() {
        this.visible = false;
        this.selectedDay = 1;
        this.hasOpened = false;

        this.editTarget = null;
        this.inputBuffer = "";
        this.sliderDragging = null;  // { key, trackX, trackW, min, maxVal }

        this.rowHitboxes = [];
        this.obstacleHeaderHitboxes = [];
        this.dayButtons = [];
        this.devButtons = [];
        this.sectionHeaderHitboxes = [];
        this.dayParamHitboxes = [];
        this.homelessParamHitboxes = [];
        this.modeButtons = [];
        this.modeSequenceHitbox = null;
        this.modeConfigHitboxes = [];
        this.buffControlHitboxes = [];
        this.uiTunerHitboxes = [];
        this.selectedModeId = 1;
        this.uiTunerHitboxes = [];
        this.uiTunerDefs = [
            { key: "devMenuBtnW", label: "Btn Width" },
            { key: "devMenuBtnH", label: "Btn Height" },
            { key: "devMenuTextSize", label: "Text Size" }
        ];

        const preferredObstacleOrder = [
            "LARGE_CAR",
            "SMALL_CAR",
            "SCOOTER_RIDER",
            "HOMELESS",
            "PROMOTER",
            "SMALL_BUSINESS",
            "FANTASY_COFFEE",
            "COFFEE",
            "EMPTY_SCOOTER"
        ];
        this.obstacleOrder = preferredObstacleOrder.filter(k => !!OBSTACLE_CONFIG[k]);
        for (const key of Object.keys(OBSTACLE_CONFIG)) {
            if (!this.obstacleOrder.includes(key)) this.obstacleOrder.push(key);
        }
        this.dayOrder = Object.keys(DIFFICULTY_PROGRESSION).map(Number).sort((a, b) => a - b);
        this.baseDayMap = this.buildBaseDayMap();

        this.dayParamDefs = [
            { key: "description", label: "Description", valueType: "text" },
            { key: "totalDistance", label: "Length(totalDistance)", valueType: "int", min: 1 },
            { key: "realTimeLimit", label: "realTimeLimit", valueType: "int", min: 1 },
            { key: "baseScrollSpeed", label: "baseScrollSpeed", valueType: "number", min: 0 },
            { key: "basePlayerSpeed", label: "basePlayerSpeed", valueType: "number", min: 0 },
            { key: "healthDecay", label: "healthDecay", valueType: "number", min: 0 },
            { key: "type", label: "type", valueType: "text" }
        ];
        this.homelessParamDefs = [
            { key: "bubbleOffsetX", label: "bubbleOffsetX", valueType: "number" },
            { key: "bubbleTextSize", label: "bubbleTextSize", valueType: "number", min: 10 }
        ];
        this.modeFieldDefs = [
            { key: "patternPool", label: "patternPool", valueType: "text" },
            { key: "speedMultiplier", label: "speedMultiplier", valueType: "number", min: 0.1 },
            { key: "obTypeMinGapSec", label: "obTypeMinGapSec (JSON)", valueType: "json" },
            { key: "obWeights", label: "obWeights (JSON)", valueType: "json" }
        ];
        this.buffControlDefs = [
            { key: "avgRespawnSec", label: "avgBuffRespawnSec", valueType: "number", min: 0.2 },
            { key: "respawnJitter", label: "buffRespawnJitter(0-1)", valueType: "number", min: 0, max: 1 },
            { key: "buffWeights", label: "buffWeights (JSON)", valueType: "json" }
        ];
        this.sectionExpanded = {
            daySelector: false,
            modeSequence: false,
            modeIndex: false,
            modeConfig: false,
            buffControl: false,
            devActions: false
        };

        this.initializeDifficultyDebugFields();
        this.initializeHomelessDebugFields();
        this.syncSelectedModeForDay();
    }

    buildBaseDayMap() {
        const map = {};
        for (const obstacleType of this.obstacleOrder) map[obstacleType] = [];

        for (const [dayKey, cfg] of Object.entries(DIFFICULTY_PROGRESSION)) {
            const day = Number(dayKey);
            const available = cfg.availableObstacles || [];
            for (const obstacleType of available) {
                if (map[obstacleType]) map[obstacleType].push(day);
            }
        }
        return map;
    }

    initializeDifficultyDebugFields() {
        for (const dayKey of Object.keys(DIFFICULTY_PROGRESSION)) {
            const cfg = DIFFICULTY_PROGRESSION[dayKey];
            if (!Array.isArray(cfg.availableObstacles)) cfg.availableObstacles = [];
            if (!cfg.obstacleWeights) cfg.obstacleWeights = {};

            for (const obstacleType of this.obstacleOrder) {
                if (cfg.obstacleWeights[obstacleType] === undefined) {
                    cfg.obstacleWeights[obstacleType] = 1.0;
                }
            }
            this.ensureModeCycleConfigForDay(Number(dayKey));
        }
    }

    initializeHomelessDebugFields() {
        if (!OBSTACLE_CONFIG.HOMELESS) return;
        if (OBSTACLE_CONFIG.HOMELESS.bubbleOffsetX === undefined) OBSTACLE_CONFIG.HOMELESS.bubbleOffsetX = 0;
        if (OBSTACLE_CONFIG.HOMELESS.bubbleTextSize === undefined) OBSTACLE_CONFIG.HOMELESS.bubbleTextSize = 18;
    }

    toggle() {
        this.visible = !this.visible;
        if (this.visible) {
            if (!this.hasOpened) {
                this.selectedDay = currentDayID || this.selectedDay || 1;
                this.hasOpened = true;
            }
            this.cancelEditing();
            this.syncSelectedModeForDay();
        }
    }

    isVisible() {
        return this.visible;
    }

    isSectionExpanded(sectionKey) {
        return !!this.sectionExpanded[sectionKey];
    }

    toggleSectionExpanded(sectionKey) {
        if (sectionKey === "daySelector" || sectionKey === "devActions") return;
        this.sectionExpanded[sectionKey] = !this.isSectionExpanded(sectionKey);
    }

    getCurrentDifficultyConfig() {
        return DIFFICULTY_PROGRESSION[this.selectedDay] || null;
    }

    getCurrentDayConfig() {
        return DAYS_CONFIG[this.selectedDay] || null;
    }

    createDefaultModeConfigForDay(dayID, modeId = 1) {
        const dcfg = DIFFICULTY_PROGRESSION[dayID] || {};
        const available = Array.isArray(dcfg.availableObstacles) ? dcfg.availableObstacles : [];
        const obWeights = {};
        for (const type of available) {
            const cfg = OBSTACLE_CONFIG[type];
            if (cfg && cfg.type !== "BUFF") obWeights[type] = 1;
        }
        const preset = (typeof MODE_PRESETS !== "undefined" && MODE_PRESETS && MODE_PRESETS[modeId]) ? MODE_PRESETS[modeId] : null;
        return {
            patternPool: String((preset && preset.patternPool) || "easy"),
            speedMultiplier: Math.max(0.1, Number((preset && preset.speedMultiplier) || 1.0)),
            obTypeMinGapSec: {},
            obWeights: obWeights
        };
    }

    ensureModeCycleConfigForDay(dayID) {
        const cfg = DIFFICULTY_PROGRESSION[dayID];
        if (!cfg) return;
        if (!cfg.difficultyModeCycleConfig && cfg.modeCycleConfig) {
            cfg.difficultyModeCycleConfig = cfg.modeCycleConfig;
        }
        if (!cfg.difficultyModeCycleConfig || typeof cfg.difficultyModeCycleConfig !== "object") {
            cfg.difficultyModeCycleConfig = { windowSec: 5, modePattern: [1], modes: { 1: this.createDefaultModeConfigForDay(dayID, 1) } };
        }

        const modeCfg = cfg.difficultyModeCycleConfig;
        modeCfg.windowSec = Math.max(1, Number(modeCfg.windowSec || 5));
        if (!Array.isArray(modeCfg.modePattern) || modeCfg.modePattern.length === 0) modeCfg.modePattern = [1];
        modeCfg.modePattern = modeCfg.modePattern
            .map(v => Number(v))
            .filter(v => Number.isFinite(v) && v >= 1 && v <= 10)
            .map(v => Math.round(v));
        if (modeCfg.modePattern.length === 0) modeCfg.modePattern = [1];
        if (!modeCfg.modes || typeof modeCfg.modes !== "object") modeCfg.modes = {};

        for (const modeId of modeCfg.modePattern) {
            if (!modeCfg.modes[modeId]) modeCfg.modes[modeId] = this.createDefaultModeConfigForDay(dayID, modeId);
        }

        const ids = Object.keys(modeCfg.modes);
        let migratedBuffAvgPerWindow = null;
        for (const id of ids) {
            const m = modeCfg.modes[id];
            const numericId = Number(id);
            const def = this.createDefaultModeConfigForDay(dayID, numericId);
            if (!m || typeof m !== "object") {
                modeCfg.modes[id] = def;
                continue;
            }
            if (m.avgbuffPerWindow === undefined && m.buffPerWindowMean !== undefined) {
                m.avgbuffPerWindow = m.buffPerWindowMean;
            }
            if (m.avgobPerWindow === undefined && m.obPerWindowMean !== undefined) {
                m.avgobPerWindow = m.obPerWindowMean;
            }
            const legacyAvg = Number(m.avgbuffPerWindow ?? m.buffPerWindowMean);
            if (migratedBuffAvgPerWindow === null && Number.isFinite(legacyAvg) && legacyAvg > 0) {
                migratedBuffAvgPerWindow = legacyAvg;
            }
            const validPatternPools = ["easy", "normal", "hard"];
            const rawPatternPool = String(m.patternPool || "").trim();
            m.patternPool = validPatternPools.includes(rawPatternPool) ? rawPatternPool : def.patternPool;
            const rawSpeedMultiplier = Number(m.speedMultiplier);
            m.speedMultiplier = Number.isFinite(rawSpeedMultiplier) ? Math.max(0.1, rawSpeedMultiplier) : def.speedMultiplier;
            if (!m.obTypeMinGapSec || typeof m.obTypeMinGapSec !== "object") m.obTypeMinGapSec = {};
            if (!m.obWeights || typeof m.obWeights !== "object") m.obWeights = {};
            delete m.avgbuffPerWindow;
            delete m.buffPerWindowMean;
            delete m.buffGlobalMinGapSec;
            delete m.buffTypeMinGapSec;
            delete m.obPerWindowMean;
            delete m.avgobPerWindow;
            delete m.minOnScreenOb;
            delete m.maxOnScreenOb;
        }

        const buffCfg = this.getCurrentBuffControlConfigByDay(dayID);
        if (buffCfg && migratedBuffAvgPerWindow !== null) {
            buffCfg.avgRespawnSec = Math.max(0.2, 5 / migratedBuffAvgPerWindow);
        }
    }

    getCurrentModeCycleConfig() {
        this.ensureModeCycleConfigForDay(this.selectedDay);
        const cfg = this.getCurrentDifficultyConfig();
        return cfg ? (cfg.difficultyModeCycleConfig || cfg.modeCycleConfig || null) : null;
    }

    getCurrentBuffControlConfigByDay(dayID) {
        const cfg = DAYS_CONFIG[dayID];
        if (!cfg) return null;
        if (!cfg.buffControlConfig || typeof cfg.buffControlConfig !== "object") {
            cfg.buffControlConfig = {
                avgRespawnSec: 6.0,
                respawnJitter: 0.25,
                buffWeights: { COFFEE: 1.0, EMPTY_SCOOTER: 0.7 }
            };
        }
        const b = cfg.buffControlConfig;
        b.avgRespawnSec = Math.max(0.2, Number(b.avgRespawnSec || 6.0));
        b.respawnJitter = Math.max(0, Math.min(1, Number(b.respawnJitter || 0)));
        if (!b.buffWeights || typeof b.buffWeights !== "object") {
            b.buffWeights = { COFFEE: 1.0, EMPTY_SCOOTER: 0.7 };
        }
        return b;
    }

    getCurrentBuffControlConfig() {
        return this.getCurrentBuffControlConfigByDay(this.selectedDay);
    }

    getCurrentModeConfig() {
        const cycle = this.getCurrentModeCycleConfig();
        if (!cycle || !cycle.modes) return null;
        return cycle.modes[this.selectedModeId] || null;
    }

    getModeDisplayLabel(modeId) {
        const numericId = Number(modeId || 1);
        const cycle = this.getCurrentModeCycleConfig();
        if (cycle && cycle.modeDisplayMap && cycle.modeDisplayMap[numericId] !== undefined) {
            return String(cycle.modeDisplayMap[numericId]);
        }
        return `Mode ${numericId}`;
    }

    getModeIdsForSelectedDay() {
        const cycle = this.getCurrentModeCycleConfig();
        if (!cycle || !cycle.modes) return [];
        return Object.keys(cycle.modes)
            .map(v => Number(v))
            .filter(v => Number.isFinite(v) && v >= 1 && v <= 10)
            .sort((a, b) => a - b);
    }

    syncSelectedModeForDay() {
        this.ensureModeCycleConfigForDay(this.selectedDay);
        const cycle = this.getCurrentModeCycleConfig();
        if (!cycle) {
            this.selectedModeId = 1;
            return;
        }
        const ids = this.getModeIdsForSelectedDay();
        if (ids.includes(this.selectedModeId)) return;
        this.selectedModeId = Number(cycle.modePattern[0] || ids[0] || 1);
    }

    ensureModeEntry(modeId) {
        const cycle = this.getCurrentModeCycleConfig();
        if (!cycle || !cycle.modes) return;
        const id = Math.max(1, Math.min(10, Math.round(Number(modeId || 1))));
        if (!cycle.modes[id]) cycle.modes[id] = this.createDefaultModeConfigForDay(this.selectedDay, id);
    }

    parseModeSequenceInput(rawText) {
        const textVal = String(rawText || "").trim();
        if (!textVal) return null;

        if (/^\d+$/.test(textVal)) {
            const out = [];
            let i = 0;
            while (i < textVal.length) {
                if (textVal[i] === "1" && textVal[i + 1] === "0") {
                    out.push(10);
                    i += 2;
                    continue;
                }
                const d = Number(textVal[i]);
                if (Number.isFinite(d) && d >= 1 && d <= 9) out.push(d);
                i += 1;
            }
            return out.length > 0 ? out : null;
        }

        const tokens = textVal.replaceAll("，", ",").split(/[^0-9]+/).filter(Boolean);
        const nums = tokens
            .map(v => Number(v))
            .filter(v => Number.isFinite(v))
            .map(v => Math.round(v))
            .filter(v => v >= 1 && v <= 10);
        if (nums.length > 0) return nums;
        return null;
    }

    stringifyCompactValue(value) {
        if (value === null || value === undefined) return "";
        if (typeof value === "object") return JSON.stringify(value);
        return String(value);
    }

    isObstacleEnabled(obstacleType) {
        const cfg = this.getCurrentDifficultyConfig();
        if (!cfg) return false;
        return (cfg.availableObstacles || []).includes(obstacleType);
    }

    toggleObstacle(obstacleType) {
        const cfg = this.getCurrentDifficultyConfig();
        if (!cfg) return;

        const available = cfg.availableObstacles || [];
        const idx = available.indexOf(obstacleType);
        if (idx >= 0) {
            available.splice(idx, 1);
            if (this.isEditingWeight(obstacleType)) this.cancelEditing();
        } else {
            available.push(obstacleType);
            available.sort((a, b) => this.obstacleOrder.indexOf(a) - this.obstacleOrder.indexOf(b));
        }

        this.applyLiveConfigIfActiveDay();
    }

    disableAllObstaclesForSelectedDay() {
        const cfg = this.getCurrentDifficultyConfig();
        if (!cfg) return;
        cfg.availableObstacles = [];
        if (this.editTarget && this.editTarget.kind === "weight") this.cancelEditing();
        this.applyLiveConfigIfActiveDay();
    }

    isEditingWeight(obstacleType) {
        return this.editTarget && this.editTarget.kind === "weight" && this.editTarget.obstacleType === obstacleType;
    }

    isEditingDayParam(paramKey) {
        return this.editTarget && this.editTarget.kind === "dayParam" && this.editTarget.paramKey === paramKey;
    }

    isEditingHomelessParam(paramKey) {
        return this.editTarget && this.editTarget.kind === "homelessParam" && this.editTarget.paramKey === paramKey;
    }

    isEditingModeSequence() {
        return this.editTarget && this.editTarget.kind === "modeSequence";
    }

    isEditingModeField(fieldKey) {
        return this.editTarget &&
            this.editTarget.kind === "modeField" &&
            this.editTarget.modeId === this.selectedModeId &&
            this.editTarget.fieldKey === fieldKey;
    }

    isEditingBuffControl(fieldKey) {
        return this.editTarget &&
            this.editTarget.kind === "buffControlField" &&
            this.editTarget.fieldKey === fieldKey;
    }

    isEditingUITuner(key) {
        return this.editTarget && this.editTarget.kind === "uiTuner" && this.editTarget.key === key;
    }

    beginUITunerEdit(key) {
        const map = { devMenuBtnW, devMenuBtnH, devMenuTextSize };
        this.editTarget = { kind: "uiTuner", key };
        this.inputBuffer = String(map[key] ?? 0);
    }

    beginWeightEdit(obstacleType) {
        const cfg = this.getCurrentDifficultyConfig();
        if (!cfg || !this.isObstacleEnabled(obstacleType)) return;
        const w = cfg.obstacleWeights[obstacleType];
        this.editTarget = { kind: "weight", obstacleType };
        this.inputBuffer = Number.isFinite(Number(w)) ? String(w) : "1";
    }

    beginDayParamEdit(paramKey) {
        const cfg = this.getCurrentDayConfig();
        if (!cfg) return;
        this.editTarget = { kind: "dayParam", paramKey };
        this.inputBuffer = String(cfg[paramKey] ?? "");
    }

    beginHomelessParamEdit(paramKey) {
        const cfg = OBSTACLE_CONFIG.HOMELESS;
        if (!cfg) return;
        this.editTarget = { kind: "homelessParam", paramKey };
        this.inputBuffer = String(cfg[paramKey] ?? "");
    }

    beginModeSequenceEdit() {
        const cycle = this.getCurrentModeCycleConfig();
        if (!cycle) return;
        this.editTarget = { kind: "modeSequence" };
        this.inputBuffer = (cycle.modePattern || []).join(",");
    }

    beginModeFieldEdit(modeId, fieldKey) {
        const cycle = this.getCurrentModeCycleConfig();
        if (!cycle || !cycle.modes || !cycle.modes[modeId]) return;
        this.editTarget = { kind: "modeField", modeId, fieldKey };
        this.inputBuffer = this.stringifyCompactValue(cycle.modes[modeId][fieldKey]);
    }

    beginBuffControlFieldEdit(fieldKey) {
        const cfg = this.getCurrentBuffControlConfig();
        if (!cfg) return;
        this.editTarget = { kind: "buffControlField", fieldKey };
        this.inputBuffer = this.stringifyCompactValue(cfg[fieldKey]);
    }

    cancelEditing() {
        this.editTarget = null;
        this.inputBuffer = "";
    }

    commitEdit() {
        if (!this.editTarget) return;

        if (this.editTarget.kind === "weight") {
            const cfg = this.getCurrentDifficultyConfig();
            if (cfg) {
                const parsed = parseFloat(this.inputBuffer);
                cfg.obstacleWeights[this.editTarget.obstacleType] = Number.isFinite(parsed) && parsed > 0 ? parsed : 1.0;
            }
        }

        if (this.editTarget.kind === "dayParam") {
            const cfg = this.getCurrentDayConfig();
            const def = this.dayParamDefs.find(d => d.key === this.editTarget.paramKey);
            if (cfg && def) {
                if (def.valueType === "text") {
                    const textVal = String(this.inputBuffer || "").trim();
                    cfg[def.key] = textVal.length > 0 ? textVal : String(cfg[def.key] ?? "");
                } else {
                    let num = parseFloat(this.inputBuffer);
                    if (!Number.isFinite(num)) num = Number(cfg[def.key] ?? 0);
                    if (def.valueType === "int") num = Math.round(num);
                    if (typeof def.min === "number") num = Math.max(def.min, num);
                    cfg[def.key] = num;
                }
                this.applyLiveConfigIfActiveDay();
            }
        }

        if (this.editTarget.kind === "homelessParam") {
            const cfg = OBSTACLE_CONFIG.HOMELESS;
            const def = this.homelessParamDefs.find(d => d.key === this.editTarget.paramKey);
            if (cfg && def) {
                let num = parseFloat(this.inputBuffer);
                if (!Number.isFinite(num)) num = Number(cfg[def.key] ?? 0);
                if (typeof def.min === "number") num = Math.max(def.min, num);
                cfg[def.key] = num;
            }
        }

        if (this.editTarget.kind === "modeSequence") {
            const cycle = this.getCurrentModeCycleConfig();
            if (cycle) {
                const parsed = this.parseModeSequenceInput(this.inputBuffer);
                if (parsed && parsed.length > 0) {
                    cycle.modePattern = parsed;
                    for (const modeId of parsed) {
                        if (!cycle.modes[modeId]) cycle.modes[modeId] = this.createDefaultModeConfigForDay(this.selectedDay, modeId);
                    }
                    if (!cycle.modes[this.selectedModeId]) this.selectedModeId = parsed[0];
                    this.applyLiveConfigIfActiveDay();
                }
            }
        }

        if (this.editTarget.kind === "modeField") {
            const cycle = this.getCurrentModeCycleConfig();
            const def = this.modeFieldDefs.find(d => d.key === this.editTarget.fieldKey);
            const modeId = this.editTarget.modeId;
            if (cycle && def && cycle.modes && cycle.modes[modeId]) {
                const modeCfg = cycle.modes[modeId];
                if (def.valueType === "json") {
                    try {
                        const parsedJson = JSON.parse(this.inputBuffer);
                        if (parsedJson && typeof parsedJson === "object" && !Array.isArray(parsedJson)) {
                            modeCfg[def.key] = parsedJson;
                        }
                    } catch (err) {
                        // Ignore invalid JSON and keep old value.
                    }
                } else if (def.valueType === "text") {
                    const textVal = String(this.inputBuffer || "").trim();
                    if (def.key === "patternPool") {
                        const normalized = textVal.toLowerCase();
                        if (["easy", "normal", "hard"].includes(normalized)) {
                            modeCfg[def.key] = normalized;
                        }
                    } else if (textVal.length > 0) {
                        modeCfg[def.key] = textVal;
                    }
                } else {
                    let num = parseFloat(this.inputBuffer);
                    if (!Number.isFinite(num)) num = Number(modeCfg[def.key] ?? 0);
                    if (def.valueType === "int") num = Math.round(num);
                    if (typeof def.min === "number") num = Math.max(def.min, num);
                    modeCfg[def.key] = num;
                }
                this.applyLiveConfigIfActiveDay();
            }
        }

        if (this.editTarget.kind === "buffControlField") {
            const cfg = this.getCurrentBuffControlConfig();
            const def = this.buffControlDefs.find(d => d.key === this.editTarget.fieldKey);
            if (cfg && def) {
                if (def.valueType === "json") {
                    try {
                        const parsedJson = JSON.parse(this.inputBuffer);
                        if (parsedJson && typeof parsedJson === "object" && !Array.isArray(parsedJson)) {
                            cfg[def.key] = parsedJson;
                        }
                    } catch (err) {
                        // Ignore invalid JSON and keep old value.
                    }
                } else {
                    let num = parseFloat(this.inputBuffer);
                    if (!Number.isFinite(num)) num = Number(cfg[def.key] ?? 0);
                    if (typeof def.min === "number") num = Math.max(def.min, num);
                    if (typeof def.max === "number") num = Math.min(def.max, num);
                    cfg[def.key] = num;
                }
                this.applyLiveConfigIfActiveDay();
            }
        }

        if (this.editTarget.kind === "uiTuner") {
            let num = parseFloat(this.inputBuffer);
            if (!Number.isFinite(num)) num = 0;
            if (this.editTarget.key === "devMenuBtnW") devMenuBtnW = Math.max(40, Math.round(num));
            if (this.editTarget.key === "devMenuBtnH") devMenuBtnH = Math.max(10, Math.round(num));
            if (this.editTarget.key === "devMenuTextSize") devMenuTextSize = Math.max(8, Math.round(num));
        }

        this.cancelEditing();
    }

    applyLiveConfigIfActiveDay() {
        if (!levelController) return;
        const activeDay = Number(levelController.currentDayID || currentDayID || 0);
        if (activeDay !== Number(this.selectedDay)) return;

        if (typeof levelController.applyDifficultyParameters === "function") {
            levelController.applyDifficultyParameters(activeDay);
        }

        if (obstacleManager && levelController.proceduralLevel &&
            typeof levelController.proceduralLevel.getDifficultyConfig === "function") {
            obstacleManager.setLevelConfig(levelController.proceduralLevel.getDifficultyConfig());
        }
    }

    handleKeyPressed(k, kCode) {
        if (!this.visible) return false;

        if (kCode === ESCAPE) {
            this.commitEdit();
            this.visible = false;
            return true;
        }

        if (kCode === LEFT_ARROW) {
            this.commitEdit();
            this.selectedDay = max(this.dayOrder[0] || 1, this.selectedDay - 1);
            this.syncSelectedModeForDay();
            return true;
        }
        if (kCode === RIGHT_ARROW) {
            this.commitEdit();
            this.selectedDay = min(this.dayOrder[this.dayOrder.length - 1] || 1, this.selectedDay + 1);
            this.syncSelectedModeForDay();
            return true;
        }

        if (!this.editTarget) return true;

        if (kCode === ENTER || kCode === RETURN || kCode === TAB) {
            this.commitEdit();
            return true;
        }
        if (kCode === BACKSPACE) {
            this.inputBuffer = this.inputBuffer.slice(0, -1);
            return true;
        }

        if (this.editTarget.kind === "dayParam") {
            const def = this.dayParamDefs.find(d => d.key === this.editTarget.paramKey);
            if (def && def.valueType === "text") {
                if (k && k.length === 1) {
                    this.inputBuffer += k;
                    return true;
                }
                return true;
            }
        }

        if (this.editTarget.kind === "modeSequence") {
            if (k && k.length === 1) {
                this.inputBuffer += k;
                return true;
            }
            return true;
        }

        if (this.editTarget.kind === "modeField") {
            const def = this.modeFieldDefs.find(d => d.key === this.editTarget.fieldKey);
            if (def && (def.valueType === "json" || def.valueType === "text")) {
                if (k && k.length === 1) {
                    this.inputBuffer += k;
                    return true;
                }
                return true;
            }
        }

        if (this.editTarget.kind === "buffControlField") {
            const def = this.buffControlDefs.find(d => d.key === this.editTarget.fieldKey);
            if (def && def.valueType === "json") {
                if (k && k.length === 1) {
                    this.inputBuffer += k;
                    return true;
                }
                return true;
            }
        }

        const isDigit = /^[0-9]$/.test(k);
        if (isDigit) {
            this.inputBuffer += k;
            return true;
        }
        if (k === "." && !this.inputBuffer.includes(".")) {
            this.inputBuffer += ".";
            return true;
        }
        if (k === "-" && this.inputBuffer.length === 0) {
            this.inputBuffer = "-";
            return true;
        }

        return true;
    }

    handleMousePressed(mx, my) {
        if (!this.visible) return false;

        for (const box of this.sectionHeaderHitboxes) {
            if (mx >= box.x && mx <= box.x + box.w && my >= box.y && my <= box.y + box.h) {
                this.commitEdit();
                this.toggleSectionExpanded(box.sectionKey);
                return true;
            }
        }

        for (const btn of this.dayButtons) {
            if (mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h) {
                this.commitEdit();
                this.selectedDay = btn.day;
                this.syncSelectedModeForDay();
                return true;
            }
        }

        if (this.modeSequenceHitbox) {
            const b = this.modeSequenceHitbox;
            if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
                this.commitEdit();
                this.beginModeSequenceEdit();
                return true;
            }
        }

        for (const btn of this.modeButtons) {
            if (mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h) {
                this.commitEdit();
                this.ensureModeEntry(btn.modeId);
                this.selectedModeId = btn.modeId;
                return true;
            }
        }

        for (const box of this.modeConfigHitboxes) {
            if (mx >= box.x && mx <= box.x + box.w && my >= box.y && my <= box.y + box.h) {
                this.commitEdit();
                this.beginModeFieldEdit(this.selectedModeId, box.fieldKey);
                return true;
            }
        }

        for (const box of this.buffControlHitboxes) {
            if (mx >= box.x && mx <= box.x + box.w && my >= box.y && my <= box.y + box.h) {
                this.commitEdit();
                this.beginBuffControlFieldEdit(box.fieldKey);
                return true;
            }
        }

        for (const box of this.dayParamHitboxes) {
            if (mx >= box.x && mx <= box.x + box.w && my >= box.y && my <= box.y + box.h) {
                this.commitEdit();
                this.beginDayParamEdit(box.key);
                return true;
            }
        }

        for (const box of this.homelessParamHitboxes) {
            if (mx >= box.x && mx <= box.x + box.w && my >= box.y && my <= box.y + box.h) {
                this.commitEdit();
                this.beginHomelessParamEdit(box.key);
                return true;
            }
        }

        // Legacy UI tuner branch retired.

        for (const box of this.obstacleHeaderHitboxes) {
            if (mx >= box.x && mx <= box.x + box.w && my >= box.y && my <= box.y + box.h) {
                this.commitEdit();
                if (box.action === "all_off") {
                    this.disableAllObstaclesForSelectedDay();
                    return true;
                }
            }
        }

        for (const row of this.rowHitboxes) {
            const inWeight = mx >= row.weightX && mx <= row.weightX + row.weightW &&
                my >= row.y && my <= row.y + row.h;
            if (inWeight) {
                this.commitEdit();
                this.beginWeightEdit(row.type);
                return true;
            }

            const inToggle = mx >= row.toggleX && mx <= row.toggleX + row.toggleW &&
                my >= row.y && my <= row.y + row.h;
            if (inToggle) {
                this.commitEdit();
                this.toggleObstacle(row.type);
                return true;
            }
        }

        for (const btn of this.devButtons) {
            if (mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h) {
                this.commitEdit();
                this.executeDevAction(btn.id);
                return true;
            }
        }

        this.commitEdit();
        return true;
    }

    executeDevAction(actionId) {
        const applySingleModeLoopForDay = (day, modeId) => {
            const safeDay = Number.isFinite(Number(day)) ? Number(day) : 1;
            const safeModeId = Math.max(1, Math.min(10, Math.round(Number(modeId || 1))));
            this.ensureModeCycleConfigForDay(safeDay);
            const diffCfg = DIFFICULTY_PROGRESSION[safeDay];
            const cycle = diffCfg ? (diffCfg.difficultyModeCycleConfig || diffCfg.modeCycleConfig) : null;
            if (!cycle || typeof cycle !== "object") return;
            if (!cycle.modes || typeof cycle.modes !== "object") cycle.modes = {};
            if (!cycle.modes[safeModeId]) cycle.modes[safeModeId] = this.createDefaultModeConfigForDay(safeDay, safeModeId);
            cycle.modePattern = [safeModeId];
            if (!cycle.modeDisplayMap || typeof cycle.modeDisplayMap !== "object") cycle.modeDisplayMap = {};
            if (cycle.modeDisplayMap[safeModeId] === undefined) cycle.modeDisplayMap[safeModeId] = safeModeId;
            this.selectedModeId = safeModeId;
        };

        const runDayDirect = (day) => {
            const safeDay = Number.isFinite(Number(day)) ? Number(day) : 1;
            try {
                if (typeof setupRunDirectly === "function") {
                    setupRunDirectly(safeDay);
                    return;
                }
                if (typeof setupRunTestMode === "function") {
                    setupRunTestMode(safeDay);
                    return;
                }
            } catch (err) {
                console.error("[DEV] runDayDirect primary path failed:", err);
            }

            // Hard fallback: force-init DAY_RUN even if helper APIs fail.
            try {
                currentDayID = safeDay;
                if (player && typeof player.applyLevelStats === "function") player.applyLevelStats(safeDay);
                if (player) {
                    player.x = GLOBAL_CONFIG.lanes.lane1;
                    player.y = PLAYER_RUN_FOOT_Y;
                }
                obstacleManager = new ObstacleManager();
                if (levelController && typeof levelController.initializeLevel === "function") {
                    levelController.initializeLevel(safeDay);
                }
                if (gameState && typeof gameState.setState === "function") {
                    gameState.setState(STATE_DAY_RUN);
                } else if (gameState) {
                    gameState.setState(STATE_DAY_RUN);;
                }
            } catch (fallbackErr) {
                console.error("[DEV] runDayDirect fallback failed:", fallbackErr);
            }
        };

        if (actionId === "restart_current") {
            const day = Number((levelController && levelController.currentDayID) || currentDayID || this.selectedDay || 1);
            runDayDirect(day);
            return;
        }

        if (actionId === "run_selected_day_full") {
            runDayDirect(this.selectedDay);
            return;
        }

        if (actionId === "run_selected_day") {
            applySingleModeLoopForDay(this.selectedDay, this.selectedModeId);
            runDayDirect(this.selectedDay);
            return;
        }

        if (actionId === "goto_room") {
            if (typeof setupRoomTestMode === "function") setupRoomTestMode(this.selectedDay);
            return;
        }

        if (actionId === "refill") {
            if (typeof devRefillHealth === "function") devRefillHealth();
            return;
        }

        if (actionId === "toggle_dev") {
            if (typeof devToggle === "function") devToggle();
            return;
        }

        if (actionId === "win") {
            if (typeof devGoToWin === "function") devGoToWin();
            return;
        }

        if (actionId === "fail_hit_bus") {
            if (typeof devGoToFail === "function") devGoToFail("HIT_BUS");
            return;
        }

        if (actionId === "fail_late") {
            if (typeof devGoToFail === "function") devGoToFail("LATE");
            return;
        }

        if (actionId === "story_recap") {
            if (typeof devGoToStoryRecap === "function") devGoToStoryRecap();
            this.visible = false;
            return;
        }

        if (actionId === "credits") {
            if (typeof resetCredits === "function") resetCredits();
            if (gameState) gameState.setState(STATE_CREDITS);
            this.visible = false;
            return;
        }

        if (actionId === "unlock_all") {
            if (typeof devUnlockAllDays === "function") devUnlockAllDays();
            return;
        }

        // ── Cutscene jump buttons ──────────────────────────────────────────
        if (actionId === "cs_main_menu") {
            this.visible = false;
            if (typeof gameState !== "undefined") gameState.setState(STATE_MENU);
            if (typeof mainMenu !== "undefined" && mainMenu) mainMenu.menuState = STATE_MENU;
            return;
        }

        if (actionId === "cs_prologue") {
            this.visible = false;
            if (typeof triggerTransition === "function" && typeof startCutscene === "function") {
                triggerTransition(() => startCutscene('news', CS_PROLOGUE, () => {
                    triggerTransition(() => {
                        if (typeof gameState !== 'undefined') gameState.setState(STATE_MENU);
                    });
                }));
            }
            return;
        }

        const roomMatch = actionId.match(/^cs_room_(\d)$/);
        if (roomMatch) {
            const day = parseInt(roomMatch[1]);
            this.visible = false;
            // Force-allow the cutscene to play again, then use the full setupRun path
            // so the black-screen hold + alarm SFX play just like in real gameplay.
            if (typeof clearRoomCutsceneSeen === 'function') clearRoomCutsceneSeen(day);
            if (typeof triggerTransition === 'function' && typeof setupRun === 'function') {
                triggerTransition(() => setupRun(day));
            }
            return;
        }

        const npcMatch = actionId.match(/^cs_npc_(\d)$/);
        if (npcMatch) {
            const day = parseInt(npcMatch[1]);
            this.visible = false;
            currentDayID = day;  // required for door-SFX guard (day 5 skips door sound)
            if (typeof triggerLibraryEntryTransition === 'function') {
                // Day 5 goes to CREDITS; days 1-4 go to WIN
                const _onDone = (day === 5)
                    ? () => { triggerTransition(() => {
                        if (typeof resetCredits === 'function') resetCredits();
                        if (typeof gameState !== 'undefined') gameState.setState(STATE_CREDITS);
                    }); }
                    : () => { triggerTransition(() => {
                        if (typeof gameState !== 'undefined') gameState.setState(STATE_WIN);
                    }); };
                triggerLibraryEntryTransition(() => {
                    if (typeof DIALOGUE_DATA !== 'undefined' && DIALOGUE_DATA.day_npc_start?.[day]
                        && typeof startCutsceneFromNode === 'function') {
                        startCutsceneFromNode(DIALOGUE_DATA.day_npc_start[day], _onDone);
                    } else if (typeof CS_DAY_NPC !== 'undefined' && CS_DAY_NPC[day]
                        && typeof startCutscene === 'function') {
                        startCutscene('library', CS_DAY_NPC[day], _onDone);
                    }
                });
            }
            return;
        }

        if (actionId === "cs_good_end") {
            this.visible = false;
            if (typeof startCutsceneFromNode === "function") {
                currentDayID = 5;
                triggerTransition(() => startCutsceneFromNode('day5_no_01', null));
            }
            return;
        }

        if (actionId === "cs_bad_end") {
            this.visible = false;
            if (typeof startCutsceneFromNode === "function") {
                currentDayID = 5;
                triggerTransition(() => startCutsceneFromNode('day5_yes_01', null));
            }
            return;
        }

        if (actionId === "goto_pause") {
            if (gameState) {
                gameState.previousState = gameState.currentState;
                gameState.currentState = STATE_PAUSED;
            }
            this.visible = false;
            return;
        }
    }

    draw() {
        if (!this.visible) return;

        const panelX = 100;
        const panelY = 60;
        const panelW = width - 200;
        const panelH = height - 120;

        push();
        noStroke();
        fill(255, 170);
        rect(0, 0, width, height);

        stroke(0);
        strokeWeight(2);
        fill(255, 252);
        rect(panelX, panelY, panelW, panelH, 14);
        noStroke();

        fill(0);
        textAlign(LEFT, CENTER);
        textStyle(BOLD);
        textSize(34);
        text("DIFFICULTY MODE TUNER", panelX + 24, panelY + 34);
        textStyle(BOLD);
        textSize(20);
        text("` / F2: Close  |  Day -> Difficulty Mode -> Buff Control", panelX + 24, panelY + 62);

        const topY = panelY + 80;
        const contentW = panelW - 48;
        this.dayButtons = [];
        this.devButtons = [];
        this.modeSequenceHitbox = null;
        this.modeButtons = [];
        this.modeConfigHitboxes = [];
        this.buffControlHitboxes = [];
        this.rowHitboxes = [];
        this.sectionHeaderHitboxes = [];
        this.obstacleHeaderHitboxes = [];
        this.dayParamHitboxes = [];
        this.homelessParamHitboxes = [];

        const sectionX = panelX + 24;
        const sectionW = contentW;
        const sectionGap = 8;
        const collapsedGap = 4;
        let cursorY = topY;

        this.drawDaySelector(sectionX + 10, cursorY + 8);
        cursorY += 50;
        cursorY += sectionGap;

        cursorY = this.drawSectionHeader(sectionX, cursorY, sectionW, "Difficulty Mode Sequence", "modeSequence");
        if (this.isSectionExpanded("modeSequence")) {
            this.drawModeSequenceEditor(sectionX, cursorY + 6, sectionW, 86);
            cursorY += 92;
        } else {
            cursorY += collapsedGap;
        }
        cursorY += sectionGap;

        cursorY = this.drawSectionHeader(sectionX, cursorY, sectionW, "Mode Index (1-10)", "modeIndex");
        if (this.isSectionExpanded("modeIndex")) {
            this.drawModeIndexSelector(sectionX, cursorY + 6, sectionW, 66);
            cursorY += 72;
        } else {
            cursorY += collapsedGap;
        }
        cursorY += sectionGap;

        cursorY = this.drawSectionHeader(sectionX, cursorY, sectionW, `Mode ${this.selectedModeId} Config`, "modeConfig");
        if (this.isSectionExpanded("modeConfig")) {
            this.drawModeConfigEditor(sectionX, cursorY + 6, sectionW, 252);
            cursorY += 258;
        } else {
            cursorY += collapsedGap;
        }
        cursorY += sectionGap;

        cursorY = this.drawSectionHeader(sectionX, cursorY, sectionW, "Buff Control", "buffControl");
        if (this.isSectionExpanded("buffControl")) {
            this.drawBuffControlEditor(sectionX, cursorY + 6, sectionW, 142);
            cursorY += 148;
        } else {
            cursorY += collapsedGap;
        }
        cursorY += sectionGap;

        this.drawDevActions(sectionX, cursorY + 6, sectionW, 170);
        pop();
    }

    drawSectionHeader(x, y, w, label, sectionKey) {
        const h = 30;
        stroke(0, 150);
        strokeWeight(1);
        fill(236);
        rect(x, y, w, h, 8);
        noStroke();
        fill(0);
        textAlign(LEFT, CENTER);
        textStyle(BOLD);
        textSize(28);
        const mark = this.isSectionExpanded(sectionKey) ? "[-]" : "[+]";
        text(`${mark} ${label}`, x + 10, y + h / 2 + 1);
        this.sectionHeaderHitboxes.push({ sectionKey, x, y, w, h });
        return y + h;
    }

    drawDaySelector(x, y) {
        this.dayButtons = [];
        const buttonW = 122;
        const buttonH = 34;
        const gap = 10;

        for (let i = 0; i < this.dayOrder.length; i++) {
            const day = this.dayOrder[i];
            const bx = x + i * (buttonW + gap);
            const selected = day === this.selectedDay;

            stroke(0);
            strokeWeight(1.5);
            fill(selected ? 0 : 245);
            rect(bx, y, buttonW, buttonH, 7);
            noStroke();
            fill(selected ? 255 : 0);
            textAlign(CENTER, CENTER);
            textStyle(BOLD);
            textSize(28);
            text(`DAY ${day}`, bx + buttonW / 2, y + buttonH / 2 + 1);

            this.dayButtons.push({ day, x: bx, y, w: buttonW, h: buttonH });
        }
    }

    drawModeSequenceEditor(x, y, w, h) {
        const cycle = this.getCurrentModeCycleConfig();
        if (!cycle) return;

        stroke(0, 150);
        strokeWeight(1);
        fill(245);
        rect(x, y, w, h, 8);
        noStroke();
        fill(0);
        textStyle(BOLD);
        textSize(21);
        textAlign(LEFT, CENTER);
        text("Difficulty Mode Sequence", x + 12, y + 18);

        textSize(20);
        text("Input example: 1231010 or 1,2,3,10,1,2", x + 12, y + 40);

        const valueX = x + 12;
        const valueY = y + 50;
        const valueW = w - 24;
        const valueH = 28;
        const isEditing = this.isEditingModeSequence();
        stroke(0, 160);
        strokeWeight(1);
        fill(isEditing ? 255 : 238);
        rect(valueX, valueY, valueW, valueH, 5);
        noStroke();
        fill(0);
        textAlign(LEFT, CENTER);
        textStyle(BOLD);
        textSize(18);
        const showText = isEditing ? `${this.inputBuffer}_` : String((cycle.modePattern || []).join(","));
        text(showText, valueX + 8, valueY + valueH / 2 + 1);
        this.modeSequenceHitbox = { x: valueX, y: valueY, w: valueW, h: valueH };
    }

    drawModeIndexSelector(x, y, w, h) {
        const cycle = this.getCurrentModeCycleConfig();
        if (!cycle) return;
        this.modeButtons = [];

        stroke(0, 150);
        strokeWeight(1);
        fill(245);
        rect(x, y, w, h, 8);
        noStroke();
        fill(0);
        textStyle(BOLD);
        textSize(20);
        textAlign(LEFT, CENTER);
        text("Difficulty Mode Index (Sheet2-style)", x + 12, y + 14);

        const idsInPattern = new Set((cycle.modePattern || []).map(v => Number(v)));
        const gap = 8;
        const btnW = 74;
        const btnH = 24;
        const cols = 5;
        const startX = x + 260;
        const by = y + 8;
        for (let modeId = 1; modeId <= 10; modeId++) {
            const idx = modeId - 1;
            const row = Math.floor(idx / cols);
            const col = idx % cols;
            const bx = startX + col * (btnW + gap);
            const byRow = by + row * (btnH + 8);
            const selected = modeId === this.selectedModeId;
            const inPattern = idsInPattern.has(modeId);
            stroke(0);
            strokeWeight(1);
            fill(selected ? 0 : (inPattern ? 255 : 235));
            rect(bx, byRow, btnW, btnH, 5);
            noStroke();
            fill(selected ? 255 : (inPattern ? 0 : 110));
            textAlign(CENTER, CENTER);
            textStyle(BOLD);
            textSize(14);
            text(this.getModeDisplayLabel(modeId), bx + btnW / 2, byRow + btnH / 2 + 1);
            this.modeButtons.push({ modeId, x: bx, y: byRow, w: btnW, h: btnH });
        }
    }

    drawModeConfigEditor(x, y, w, h) {
        const modeCfg = this.getCurrentModeConfig();
        if (!modeCfg) return;
        this.modeConfigHitboxes = [];

        stroke(0, 150);
        strokeWeight(1);
        fill(245);
        rect(x, y, w, h, 8);
        noStroke();
        fill(0);
        textStyle(BOLD);
        textSize(22);
        textAlign(LEFT, CENTER);
        text(`Difficulty ${this.getModeDisplayLabel(this.selectedModeId)} Config`, x + 12, y + 18);

        const innerX = x + 12;
        const innerY = y + 34;
        const colW = w - 24;
        const rowH = 34;
        for (let i = 0; i < this.modeFieldDefs.length; i++) {
            const def = this.modeFieldDefs[i];
            const row = i;
            const cellX = innerX;
            const cellY = innerY + row * rowH;

            fill(0);
            textStyle(BOLD);
            textSize(20);
            textAlign(LEFT, CENTER);
            text(def.label, cellX, cellY + rowH / 2);

            const valueW = 420;
            const valueX = cellX + colW - valueW;
            const isEditing = this.isEditingModeField(def.key);
            stroke(0, 160);
            strokeWeight(1);
            fill(isEditing ? 255 : 238);
            rect(valueX, cellY + 4, valueW, rowH - 8, 5);
            noStroke();
            fill(0);
            textAlign(LEFT, CENTER);
            textStyle(BOLD);
                textSize(18);
            const rawVal = modeCfg[def.key];
            let valueText = isEditing ? `${this.inputBuffer}_` : this.stringifyCompactValue(rawVal);
            if (!isEditing && valueText.length > 64) valueText = `${valueText.slice(0, 64)}...`;
            text(valueText, valueX + 6, cellY + rowH / 2 + 1);

            this.modeConfigHitboxes.push({
                fieldKey: def.key,
                x: valueX,
                y: cellY + 4,
                w: valueW,
                h: rowH - 8
            });
        }

        const weightMap = modeCfg.obWeights || {};
        const keys = Object.keys(weightMap);
        if (keys.length === 0) return;

        const panelY = innerY + this.modeFieldDefs.length * rowH + 4;
        const panelH = Math.max(56, h - (panelY - y) - 8);
        stroke(0, 130);
        strokeWeight(1);
        fill(252);
        rect(innerX, panelY, colW, panelH, 6);
        noStroke();
        fill(0);
        textAlign(LEFT, CENTER);
        textStyle(BOLD);
            textSize(18);
        text("obWeights Preview", innerX + 8, panelY + 12);

        const sorted = keys.sort((a, b) => a.localeCompare(b));
        const lineH = 18;
        const maxLines = Math.max(1, Math.floor((panelH - 22) / lineH));
        for (let i = 0; i < Math.min(maxLines, sorted.length); i++) {
            const k = sorted[i];
            const v = weightMap[k];
                textSize(18);
            text(`${k}: ${v}`, innerX + 10, panelY + 26 + i * lineH);
        }
    }

    drawBuffControlEditor(x, y, w, h) {
        const cfg = this.getCurrentBuffControlConfig();
        if (!cfg) return;
        this.buffControlHitboxes = [];

        stroke(0, 150);
        strokeWeight(1);
        fill(245);
        rect(x, y, w, h, 8);
        noStroke();
        fill(0);
        textStyle(BOLD);
        textSize(22);
        textAlign(LEFT, CENTER);
        text("Buff Control (Independent)", x + 12, y + 18);

        const innerX = x + 12;
        const innerY = y + 34;
        const colW = w - 24;
        const rowH = 34;
        for (let i = 0; i < this.buffControlDefs.length; i++) {
            const def = this.buffControlDefs[i];
            const cellY = innerY + i * rowH;

            fill(0);
            textStyle(BOLD);
                textSize(18);
            textAlign(LEFT, CENTER);
            text(def.label, innerX, cellY + rowH / 2);

            const valueW = 420;
            const valueX = innerX + colW - valueW;
            const isEditing = this.isEditingBuffControl(def.key);
            stroke(0, 160);
            strokeWeight(1);
            fill(isEditing ? 255 : 238);
            rect(valueX, cellY + 4, valueW, rowH - 8, 5);
            noStroke();
            fill(0);
            textAlign(LEFT, CENTER);
            textStyle(BOLD);
                textSize(18);
            let valueText = isEditing ? `${this.inputBuffer}_` : this.stringifyCompactValue(cfg[def.key]);
            if (!isEditing && valueText.length > 64) valueText = `${valueText.slice(0, 64)}...`;
            text(valueText, valueX + 6, cellY + rowH / 2 + 1);

            this.buffControlHitboxes.push({
                fieldKey: def.key,
                x: valueX,
                y: cellY + 4,
                w: valueW,
                h: rowH - 8
            });
        }
    }

    drawDayParams(x, y, w, h) {
        const cfg = this.getCurrentDayConfig();
        if (!cfg) return;

        this.dayParamHitboxes = [];

        stroke(0, 150);
        strokeWeight(1);
        fill(245);
        rect(x, y, w, h, 8);
        noStroke();
        fill(0);
        textStyle(BOLD);
        textSize(23);
        textAlign(LEFT, CENTER);
        text("Day Config (DAYS_CONFIG)", x + 12, y + 16);

        const innerX = x + 10;
        const innerY = y + 30;
        const colGap = 12;
        const colW = floor((w - 20 - colGap) / 2);
        const rowH = 30;

        for (let i = 0; i < this.dayParamDefs.length; i++) {
            const def = this.dayParamDefs[i];
            const col = i % 2;
            const row = floor(i / 2);
            const cellX = innerX + col * (colW + colGap);
            const cellY = innerY + row * rowH;

            fill(0);
            textStyle(BOLD);
            textSize(20);
            textAlign(LEFT, CENTER);
            text(def.label, cellX, cellY + rowH / 2);

            const valueBoxW = 186;
            const valueX = cellX + colW - valueBoxW;
            const isEditing = this.isEditingDayParam(def.key);
            stroke(0, 160);
            strokeWeight(1);
            fill(isEditing ? 255 : 238);
            rect(valueX, cellY + 4, valueBoxW, rowH - 8, 5);

            noStroke();
            fill(0);
            textAlign(CENTER, CENTER);
            textStyle(BOLD);
            textSize(20);
            const rawVal = cfg[def.key];
            const valueText = isEditing ? `${this.inputBuffer}_` : String(rawVal);
            text(valueText, valueX + valueBoxW / 2, cellY + rowH / 2 + 1);

            this.dayParamHitboxes.push({ key: def.key, x: valueX, y: cellY + 4, w: valueBoxW, h: rowH - 8 });
        }
    }

    drawHomelessBubbleParams(x, y, w, h) {
        const cfg = OBSTACLE_CONFIG.HOMELESS;
        if (!cfg) return;

        this.homelessParamHitboxes = [];

        stroke(0, 150);
        strokeWeight(1);
        fill(245);
        rect(x, y, w, h, 8);
        noStroke();
        fill(0);
        textStyle(BOLD);
        textSize(21);
        textAlign(LEFT, CENTER);
        text("Homeless Bubble", x + 12, y + 16);

        const startX = x + 12;
        const startY = y + 40;
        const gap = 18;
        const cellW = floor((w - 24 - gap) / 2);
        const labelY = startY + 14;

        for (let i = 0; i < this.homelessParamDefs.length; i++) {
            const def = this.homelessParamDefs[i];
            const cellX = startX + i * (cellW + gap);

            fill(0);
            textStyle(BOLD);
            textSize(18);
            textAlign(LEFT, CENTER);
            text(def.label, cellX, labelY);

            const valueW = 180;
            const valueX = cellX + cellW - valueW;
            const isEditing = this.isEditingHomelessParam(def.key);
            stroke(0, 160);
            strokeWeight(1);
            fill(isEditing ? 255 : 238);
            rect(valueX, startY, valueW, 28, 5);

            noStroke();
            fill(0);
            textAlign(CENTER, CENTER);
            textStyle(BOLD);
            textSize(18);
            const valueText = isEditing ? `${this.inputBuffer}_` : String(cfg[def.key]);
            text(valueText, valueX + valueW / 2, startY + 14);

            this.homelessParamHitboxes.push({ key: def.key, x: valueX, y: startY, w: valueW, h: 28 });
        }
    }

    drawUITuner(x, y, w, h) {
        this.uiTunerHitboxes = [];

        stroke(0, 150);
        strokeWeight(1);
        fill(235, 245, 255);
        rect(x, y, w, h, 8);
        noStroke();
        fill(0);
        textStyle(BOLD);
        textSize(21);
        textAlign(LEFT, CENTER);
        text("Main Menu Buttons  (btnW = textWidth + PadW,  btnH = TextSize + PadH)", x + 12, y + 16);

        const startX = x + 12;
        const startY = y + 38;
        const gap = 14;
        const cellW = floor((w - 24 - gap * 2) / 3);
        const curVals = { devMenuBtnW, devMenuBtnH, devMenuTextSize };

        for (let i = 0; i < this.uiTunerDefs.length; i++) {
            const def = this.uiTunerDefs[i];
            const cellX = startX + i * (cellW + gap);

            fill(0);
            textStyle(BOLD);
            textSize(18);
            textAlign(LEFT, CENTER);
            text(def.label, cellX, startY + 14);

            const valueW = 120;
            const valueX = cellX + cellW - valueW;
            const isEditing = this.isEditingUITuner(def.key);
            stroke(0, 160);
            strokeWeight(1);
            fill(isEditing ? 255 : 238);
            rect(valueX, startY, valueW, 26, 5);

            noStroke();
            fill(0);
            textAlign(CENTER, CENTER);
            textStyle(BOLD);
            textSize(18);
            const valText = isEditing ? `${this.inputBuffer}_` : String(curVals[def.key]);
            text(valText, valueX + valueW / 2, startY + 13);

            this.uiTunerHitboxes.push({ key: def.key, x: valueX, y: startY, w: valueW, h: 26 });
        }
    }

    drawObstacleTable(x, y, w, h) {
        const cfg = this.getCurrentDifficultyConfig();
        if (!cfg) return;

        this.rowHitboxes = [];
        this.obstacleHeaderHitboxes = [];

        const rowH = 38;
        const headerH = 30;
        const colTypeX = x + 10;
        const colCatX = x + 240;
        const colDamageX = x + 382;
        const colEffectX = x + 500;
        const colDayX = x + 760;
        const colWeightX = x + w - 170;
        const weightW = 140;

        stroke(0, 150);
        strokeWeight(1);
        fill(242);
        rect(x, y, w, headerH, 8);

        const allOffW = 104;
        const allOffH = 24;
        const allOffX = x + 8;
        const allOffY = y + (headerH - allOffH) / 2;
        stroke(0, 150);
        strokeWeight(1);
        fill(205);
        rect(allOffX, allOffY, allOffW, allOffH, 6);

        noStroke();
        fill(0);
        textStyle(BOLD);
            textSize(18);
        textAlign(CENTER, CENTER);
        text("ALL OFF", allOffX + allOffW / 2, allOffY + allOffH / 2 + 1);

        noStroke();
        fill(0);
        textStyle(BOLD);
        textSize(21);
        textAlign(LEFT, CENTER);
        text("Obstacle", colTypeX + 116, y + headerH / 2 + 1);
        text("Category", colCatX, y + headerH / 2 + 1);
        text("Damage", colDamageX, y + headerH / 2 + 1);
        text("Effect", colEffectX, y + headerH / 2 + 1);
        text("Default Days", colDayX, y + headerH / 2 + 1);
        text("Weight", colWeightX + 8, y + headerH / 2 + 1);

        this.obstacleHeaderHitboxes.push({
            action: "all_off",
            x: allOffX,
            y: allOffY,
            w: allOffW,
            h: allOffH
        });

        const maxRows = floor((h - headerH) / rowH);
        const rowsToDraw = min(this.obstacleOrder.length, maxRows);

        for (let i = 0; i < rowsToDraw; i++) {
            const obstacleType = this.obstacleOrder[i];
            const obCfg = OBSTACLE_CONFIG[obstacleType] || {};
            const rowY = y + headerH + i * rowH;
            const enabled = this.isObstacleEnabled(obstacleType);
            const baseDays = (this.baseDayMap[obstacleType] || []).join(", ");

            stroke(0, enabled ? 130 : 70);
            strokeWeight(1);
            fill(enabled ? 255 : 235);
            rect(x, rowY, w, rowH - 2, 6);

            noStroke();
            fill(enabled ? 0 : 110);
            textStyle(BOLD);
            textSize(20);
            textAlign(LEFT, CENTER);
            text(obstacleType, colTypeX, rowY + rowH / 2);
            text(obCfg.type || "-", colCatX, rowY + rowH / 2);
            text(String(obCfg.damage ?? "-"), colDamageX, rowY + rowH / 2);
            text(obCfg.effect || "-", colEffectX, rowY + rowH / 2);
            text(baseDays || "-", colDayX, rowY + rowH / 2);

            stroke(0, enabled ? 160 : 80);
            strokeWeight(1);
            fill(enabled ? 255 : 240);
            rect(colWeightX, rowY + 5, weightW, rowH - 12, 5);
            noStroke();
            fill(enabled ? 0 : 120);
            textAlign(CENTER, CENTER);
            textStyle(BOLD);
            textSize(20);
            const isEditing = this.isEditingWeight(obstacleType);
            const weightText = enabled
                ? (isEditing ? `${this.inputBuffer || ""}_` : String((cfg.obstacleWeights || {})[obstacleType] ?? 1))
                : "--";
            if (enabled && isEditing) fill(0);
            text(weightText, colWeightX + weightW / 2, rowY + rowH / 2);

            this.rowHitboxes.push({
                type: obstacleType,
                y: rowY,
                h: rowH - 2,
                toggleX: x,
                toggleW: w,
                weightX: colWeightX,
                weightW: weightW
            });
        }
    }

    drawDevActions(x, y, w, h) {
        this.devButtons = [];

        stroke(0, 150);
        strokeWeight(1);
        fill(245);
        rect(x, y, w, h, 8);
        noStroke();
        fill(0);
        textAlign(LEFT, CENTER);
        textStyle(BOLD);
        textSize(22);
        text("Dev Actions", x + 12, y + 14);

        // ── Row 1: gameplay shortcuts ──────────────────────────────────────
        const row1Buttons = [
            { id: "restart_current", label: "Restart Current" },
            { id: "run_selected_day_full", label: `Run Day ${this.selectedDay} Full` },
            { id: "run_selected_day", label: `Run Day ${this.selectedDay} ${this.getModeDisplayLabel(this.selectedModeId)}` },
            { id: "goto_room", label: "Go Room" },
            { id: "goto_pause", label: "Open Pause" },
            { id: "refill", label: "Refill HP" },
            { id: "toggle_dev", label: developerMode ? "Dev ON" : "Dev OFF" },
            { id: "win", label: "Force Win" },
            { id: "fail_hit_bus", label: "Fail HIT_BUS" },
            { id: "fail_late", label: "Fail LATE" },
            { id: "story_recap", label: "Story Recap" },
            { id: "credits", label: "Credits" },
            { id: "unlock_all", label: "Unlock All Days" }
        ];

        const btnGap = 8;
        const startX = x + 8;
        const btnH = 38;
        const r1BtnW = floor((w - 16 - (row1Buttons.length - 1) * btnGap) / row1Buttons.length);
        const r1Y = y + 28;

        for (let i = 0; i < row1Buttons.length; i++) {
            const b = row1Buttons[i];
            const bx = startX + i * (r1BtnW + btnGap);
            stroke(0); strokeWeight(1.2); fill(255);
            rect(bx, r1Y, r1BtnW, btnH, 6);
            noStroke(); fill(0);
                textAlign(CENTER, CENTER); textStyle(BOLD); textSize(18);
            text(b.label, bx + r1BtnW / 2, r1Y + btnH / 2 + 1);
            this.devButtons.push({ id: b.id, x: bx, y: r1Y, w: r1BtnW, h: btnH });
        }

        // ── Row 2: cutscene jump buttons ───────────────────────────────────
        noStroke(); fill(80); textAlign(LEFT, CENTER); textStyle(BOLD); textSize(18);
        const r2LabelY = r1Y + btnH + 10;
        text("Cutscene Jump:", x + 12, r2LabelY + 8);

        const csButtons = [
            { id: "cs_main_menu", label: "Main Menu" },
            { id: "cs_prologue",  label: "Prologue" },
            { id: "cs_room_1",    label: "Room D1" },
            { id: "cs_room_2",    label: "Room D2" },
            { id: "cs_room_3",    label: "Room D3" },
            { id: "cs_room_4",    label: "Room D4" },
            { id: "cs_room_5",    label: "Room D5" },
            { id: "cs_npc_1",     label: "NPC D1" },
            { id: "cs_npc_2",     label: "NPC D2" },
            { id: "cs_npc_3",     label: "NPC D3" },
            { id: "cs_npc_4",     label: "NPC D4" },
            { id: "cs_npc_5",     label: "NPC D5" },
            { id: "cs_good_end",  label: "Good End" },
            { id: "cs_bad_end",   label: "Bad End" }
        ];

        const r2BtnW = floor((w - 16 - (csButtons.length - 1) * btnGap) / csButtons.length);
        const r2Y = r2LabelY + 20;

        for (let i = 0; i < csButtons.length; i++) {
            const b = csButtons[i];
            const bx = startX + i * (r2BtnW + btnGap);
            stroke(0, 120); strokeWeight(1); fill(230, 240, 255);
            rect(bx, r2Y, r2BtnW, btnH, 6);
            noStroke(); fill(20, 40, 120);
                textAlign(CENTER, CENTER); textStyle(BOLD); textSize(18);
            text(b.label, bx + r2BtnW / 2, r2Y + btnH / 2 + 1);
            this.devButtons.push({ id: b.id, x: bx, y: r2Y, w: r2BtnW, h: btnH });
        }

        return r2Y + btnH + 16;
    }
}
