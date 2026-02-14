// Global Configuration
// Responsibilities: Centralized constant management and departmental synchronization.

// Developer Tools
const DEBUG_UNLOCK_ALL = true;

/**
 * ENGINE CORE: SPATIAL & MOVEMENT CONFIGURATION
 * Defines the canvas resolution, world-space boundaries, and primary scroll physics.
 */
const GLOBAL_CONFIG = {
    resolutionW: 1920,
    resolutionH: 1080,
    scrollSpeed: 12, // Base velocity for world-space translation

    // THE 2-2-2 LAYOUT INFRASTRUCTURE
    // Strict coordinate boundaries for scenery, sidewalks, and the road network.
    layout: {
        leftSceneryEnd: 500,     // Scenery Zone 1 boundary
        leftSidewalkEnd: 700,    // Sidewalk Zone 1 boundary
        rightLaneEnd: 1220,      // Final road boundary (encompasses all lanes)
        rightSidewalkEnd: 1420   // Sidewalk Zone 2 boundary
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

/**
 * ENTITY DEFAULTS: PLAYER ATTRIBUTES
 * Initial health values, survival decay rates, and movement speed variables.
 */
const PLAYER_DEFAULTS = {
    baseHealth: 100,
    healthDecay: 0.05, // Rate of stamina depletion per frame
    baseSpeed: 10
};

/**
 * ENGINE STATE CONSTANTS
 * Integer-based mapping for the Finite State Machine (FSM) transitions.
 */
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

/**
 * LEVEL CONFIGURATION: SESSION DATA
 * Metadata and difficulty parameters provided by the Level Designer (Ray).
 */
const DAYS_CONFIG = {
    1: {
        description: "Tutorial - Learn the Basics",
        totalDistance: 3000,
        realTimeLimit: 180, // 3 minutes for tutorial
        obstacleSpawnInterval: 90,
        baseScrollSpeed: 8,
        basePlayerSpeed: 10,
        healthDecay: 0.03,
        type: "TUTORIAL"
    },
    2: {
        description: "Day 2 - Running Late",
        totalDistance: 200,
        realTimeLimit: 90,
        obstacleSpawnInterval: 45,
        baseScrollSpeed: 10,
        basePlayerSpeed: 10,
        healthDecay: 0.05,
        type: "NORMAL"
    },
    3: {
        description: "Day 3 - Midweek Rush",
        totalDistance: 80,
        realTimeLimit: 75,
        obstacleSpawnInterval: 35,
        baseScrollSpeed: 12,
        basePlayerSpeed: 10,
        healthDecay: 0.06,
        type: "NORMAL"
    },
    4: {
        description: "Day 4 - Deadline Pressure",
        totalDistance: 100,
        realTimeLimit: 60,
        obstacleSpawnInterval: 30,
        baseScrollSpeed: 14,
        basePlayerSpeed: 10,
        healthDecay: 0.08,
        type: "NORMAL"
    },
    5: {
        description: "Day 5 - Final Challenge",
        totalDistance: 120,
        realTimeLimit: 50,
        obstacleSpawnInterval: 25,
        baseScrollSpeed: 16,
        basePlayerSpeed: 10,
        healthDecay: 0.10,
        type: "NORMAL"
    }
};
