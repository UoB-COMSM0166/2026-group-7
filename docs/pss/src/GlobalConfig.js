// Park Street Survivor - Global Configuration
// Responsibilities: Centralised constants for canvas, physics, layout, and level data.

// ─── ENGINE STATE CONSTANTS ───────────────────────────────────────────────────
// Integer mapping for the Finite State Machine (FSM) transitions.
const STATE_MENU = 0;
const STATE_LEVEL_SELECT = 1;
const STATE_SETTINGS = 2;
const STATE_ROOM = 3;
const STATE_PAUSED = 4;
const STATE_DAY_RUN = 5;
const STATE_FAIL = 6;
const STATE_WIN = 7;
const STATE_LOADING = 8;
const STATE_SPLASH = 9;
const STATE_HELP = 10;
const STATE_INVENTORY = 11;
const STATE_WARNING = 12;
const STATE_CREDITS = 13;
const STATE_CUTSCENE = 14;
const STATE_SAVE_CHOICE = 15;
const STATE_DIFF_SELECT = 16;   // Difficulty selection screen
const STATE_DIFF_CONFIRM = 17;   // Difficulty confirmation screen
const STATE_LOAD_GAME = 18;   // New game / continue screen
const STATE_TUTORIAL_SLIDES = 19; // Day 1 pre-run tutorial slideshow

/**
 * Core canvas resolution, world-space boundaries, and scroll physics.
 * Implements the 2-2-2 layout: two scenery zones, two sidewalks, two road lanes each side.
 */
const GLOBAL_CONFIG = {
    resolutionW: 1920,
    resolutionH: 1080,
    scrollSpeed: 12, // Base velocity for world-space translation
    spawnTuning: {
        safety: {
            topBandY: 520,
            laneGapHazard: 220,
            laneGapBuff: 130,
            laneGapSameTypeExtra: 70,
            safeLaneLookaheadY: 760,
            movingHazardMinScrollMultiplier: 1.10
        },
        centerLaneFlow: {
            enabled: true,
            smallCarType: "SMALL_CAR",
            largeCarType: "LARGE_CAR",
            largeCarChance: 0.22,
            alternateLanes: [2, 3],
            requireCenterSparse: true,
            triggerChanceWhenSparse: 1.0,
            minFramesBetweenFlowSpawns: 8,
            forceEveryHazardSpawn: false
        },
        emergencyCoffee: {
            enabled: true,
            enabledDays: [1, 2, 3],
            coffeeType: "COFFEE",
            healthThresholdRatio: 0.30,
            maxSpawnsPerRun: 2,
            minFramesBetweenEmergencySpawns: 300,
            retryFramesWhenBlocked: 20
        },
        spawnDirector: {
            enabled: true,
            minLaneGapHazard: 130,
            minLaneGapBuff: 95,
            sameTypeExtraGap: 40,
            speedGapPerUnit: 28,
            minOpenLanesAhead: 1,
            parallelLookaheadY: 700,
            parallelBandY: 130,
            parallelPenaltyPerObstacle: 0.6,
            speedVarietyPenaltySameClass: 0.82,
            speedVarietyBoostDifferentClass: 1.08
        },
        hazardRhythm: {
            densityMultiplier: 0.88,
            intervalJitter: 0.35,
            minIntervalFrames: 10,
            maxIntervalFrames: 180,
            spawnRetryFramesWhenBlocked: 8,
            diversityRerollChance: 0.72,
            sameTypePenaltyImmediate: 0.22,
            sameTypePenaltyRecent1: 0.62,
            sameTypePenaltyRecent2Plus: 0.38,
            recentTypeWindowSize: 4,
            laneRepeatBlockTypes: ["FANTASY_COFFEE"],
            centerLaneCoverageLookaheadY: 760,
            centerLaneCoverageMinBlocking: 1,
            centerLaneTypeBoostWhenSparse: 1.65,
            nonCenterLaneTypePenaltyWhenSparse: 0.72,
            centerLaneSpawnBiasWhenSparse: 2.10,
            edgeLaneSpawnPenaltyWhenSparse: 0.78
        }
    },

    // THE 2-2-2 LAYOUT INFRASTRUCTURE
    // Strict coordinate boundaries for scenery, sidewalks, and the road network.
    layout: {
        leftSceneryEnd: 500,  // Right edge of left scenery zone
        leftSidewalkEnd: 700,  // Right edge of left sidewalk
        rightLaneEnd: 1220, // Right edge of the road (all four lanes)
        rightSidewalkEnd: 1420  // Right edge of right sidewalk
    },

    // LANE CALCULATIONS
    // Precise X-coordinates for center-point snapping and obstacle spawning.
    lanes: {
        lane1: 600,
        lane2: 830,
        lane3: 1090,
        lane4: 1320
    }
};

// Player foot anchor for DAY_RUN scene. Keep this near bottom of the screen.
const PLAYER_RUN_FOOT_Y = GLOBAL_CONFIG.resolutionH - 140;

/**
 * Default player attributes applied at the start of every session.
 */
const PLAYER_DEFAULTS = {
    baseHealth: 100,
    healthDecay: 0.05, // Stamina depletion per frame during a run
    baseSpeed: 10
};

/**
 * Per-day level configuration: distance targets, time limits, and spawn rates.
 */
const DAYS_CONFIG = {
    1: {
        totalDistance: 1000,
        // Deprecated: obstacleSpawnInterval is not consumed by current spawn logic.
        // obstacleSpawnInterval: 60,
        baseScrollSpeed: 14,
        basePlayerSpeed: 10,
        healthDecay: 0.02,
        buffControlConfig: {
            avgRespawnSec: 2.0,
            respawnJitter: 0.5,
            buffWeights: { COFFEE: 1.0, EMPTY_SCOOTER: 1.0 }
        },
        spawnSafetyConfig: {},
        hazardRhythmConfig: {
            densityMultiplier: 0.90,
            intervalJitter: 0.30
        },
        hazardWeightMultiplier: {},
        centerLaneFlowConfig: {},
        emergencyCoffeeConfig: {},
        spawnDirectorConfig: {},
        type: "NORMAL"
    },
    2: {
        totalDistance: 1500,
        // Deprecated: obstacleSpawnInterval is not consumed by current spawn logic.
        // obstacleSpawnInterval: 60,
        baseScrollSpeed: 15,
        basePlayerSpeed: 17,
        healthDecay: 0.04,
        buffControlConfig: {
            avgRespawnSec: 3.5,
            respawnJitter: 0.2,
            buffWeights: { COFFEE: 0.7, EMPTY_SCOOTER: 0.5 }
        },
        spawnSafetyConfig: {},
        hazardRhythmConfig: {
            densityMultiplier: 0.84,
            intervalJitter: 0.32
        },
        hazardWeightMultiplier: {},
        centerLaneFlowConfig: {},
        emergencyCoffeeConfig: {},
        spawnDirectorConfig: {},
        type: "NORMAL"
    },
    3: {
        totalDistance: 2500,
        // Deprecated: obstacleSpawnInterval is not consumed by current spawn logic.
        // obstacleSpawnInterval: 60,
        baseScrollSpeed: 16,
        basePlayerSpeed: 17,
        healthDecay: 0.03,
        buffControlConfig: {
            avgRespawnSec: 4.2,
            respawnJitter: 0.3,
            buffWeights: { COFFEE: 0.85, EMPTY_SCOOTER: 0.45 }
        },
        spawnSafetyConfig: {},
        hazardRhythmConfig: {
            // Day 3 focuses on variety: fewer immediate repeats and less lane spam.
            densityMultiplier: 0.6,
            intervalJitter: 0.34,
            diversityRerollChance: 0.82,
            sameTypePenaltyImmediate: 0.18,
            sameTypePenaltyRecent1: 0.52,
            sameTypePenaltyRecent2Plus: 0.30,
            recentTypeWindowSize: 5,
            laneRepeatBlockTypes: ["FANTASY_COFFEE", "SMALL_BUSINESS", "SMALL_CAR"]
        },
        hazardWeightMultiplier: {
            FANTASY_COFFEE: 0.62
        },
        centerLaneFlowConfig: {},
        emergencyCoffeeConfig: {},
        spawnDirectorConfig: {},
        type: "NORMAL"
    },
    4: {
        totalDistance: 2800,
        // Deprecated: obstacleSpawnInterval is not consumed by current spawn logic.
        // obstacleSpawnInterval: 60,
        baseScrollSpeed: 17,
        basePlayerSpeed: 19,
        healthDecay: 0.035,
        buffControlConfig: {
            avgRespawnSec: 5.0,
            respawnJitter: 0.25,
            buffWeights: { COFFEE: 1.0, EMPTY_SCOOTER: 0.45 }
        },
        spawnSafetyConfig: {},
        hazardRhythmConfig: {
            densityMultiplier: 0.78,
            intervalJitter: 0.26,
            patternStepSec: 0.38,
            maxEmptyTimeSec: 1.0,
            minReactionTimeSec: 0.98,
            diversityRerollChance: 0.58,
            sameTypePenaltyImmediate: 0.32,
            sameTypePenaltyRecent1: 0.72,
            sameTypePenaltyRecent2Plus: 0.48
        },
        hazardWeightMultiplier: {},
        centerLaneFlowConfig: {},
        emergencyCoffeeConfig: {},
        spawnDirectorConfig: {
            minLaneGapHazard: 118,
            sameTypeExtraGap: 32,
            parallelPenaltyPerObstacle: 0.7
        },
        type: "NORMAL"
    },
    5: {
        totalDistance: 3000,
        // Deprecated: obstacleSpawnInterval is not consumed by current spawn logic.
        // obstacleSpawnInterval: 60,
        baseScrollSpeed: 18,
        basePlayerSpeed: 20,
        healthDecay: 0.04,
        buffControlConfig: {
            avgRespawnSec: 5.5,
            respawnJitter: 0.35,
            buffWeights: { COFFEE: 1.0, EMPTY_SCOOTER: 0.4 }
        },
        spawnSafetyConfig: {},
        hazardRhythmConfig: {
            densityMultiplier: 0.82,
            intervalJitter: 0.22,
            patternStepSec: 0.34,
            maxEmptyTimeSec: 0.9,
            minReactionTimeSec: 0.9,
            diversityRerollChance: 0.46,
            sameTypePenaltyImmediate: 0.42,
            sameTypePenaltyRecent1: 0.78,
            sameTypePenaltyRecent2Plus: 0.56
        },
        hazardWeightMultiplier: {},
        centerLaneFlowConfig: {},
        emergencyCoffeeConfig: {},
        spawnDirectorConfig: {
            minLaneGapHazard: 108,
            sameTypeExtraGap: 26,
            parallelPenaltyPerObstacle: 0.76
        },
        type: "NORMAL"
    }
};
