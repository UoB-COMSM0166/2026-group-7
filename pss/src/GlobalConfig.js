// Global Configuration
// Responsibilities: Centralized constant management and departmental synchronization.

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
        lane1: 765,
        lane2: 895,
        lane3: 1025,
        lane4: 1155
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
        description: "Fresh Start",
        totalDistance: 5000,
        realTimeLimit: 120, // Total seconds allocated for completion
        obstacleSpawnInterval: 60 // Frame-based frequency for hazard spawning
    },
    2: {
        description: "Running Late",
        totalDistance: 8000,
        realTimeLimit: 90,
        obstacleSpawnInterval: 45
    }
};