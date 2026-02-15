// Park Street Survivor - Global Configuration
// Responsibilities: Centralised constants for canvas, physics, layout, and level data.

// ─── ENGINE STATE CONSTANTS ───────────────────────────────────────────────────
// Integer mapping for the Finite State Machine (FSM) transitions.
const STATE_MENU         = 0;
const STATE_LEVEL_SELECT = 1;
const STATE_SETTINGS     = 2;
const STATE_ROOM         = 3;
const STATE_PAUSED       = 4;
const STATE_DAY_RUN      = 5;
const STATE_FAIL         = 6;
const STATE_WIN          = 7;
const STATE_LOADING      = 8;
const STATE_SPLASH       = 9;
const STATE_HELP         = 10;
const STATE_INVENTORY    = 11;

/**
 * Core canvas resolution, world-space boundaries, and scroll physics.
 * Implements the 2-2-2 layout: two scenery zones, two sidewalks, two road lanes each side.
 */
const GLOBAL_CONFIG = {
    resolutionW: 1920,
    resolutionH: 1080,
    scrollSpeed: 12, // Base world-space translation velocity (pixels/frame)

    // Strict X-boundaries separating the four horizontal zones.
    layout: {
        leftSceneryEnd:   500,  // Right edge of left scenery zone
        leftSidewalkEnd:  700,  // Right edge of left sidewalk
        rightLaneEnd:     1220, // Right edge of the road (all four lanes)
        rightSidewalkEnd: 1420  // Right edge of right sidewalk
    },

    // Centre-point X coordinates for each lane (used for obstacle spawning).
    lanes: {
        lane1: 765,
        lane2: 895,
        lane3: 1025,
        lane4: 1155
    }
};

/**
 * Default player attributes applied at the start of every session.
 */
const PLAYER_DEFAULTS = {
    baseHealth:  100,
    healthDecay: 0.05, // Stamina depletion per frame during a run
    baseSpeed:   10
};

/**
 * Per-day level configuration: distance targets, time limits, and spawn rates.
 */
const DAYS_CONFIG = {
    1: {
        description:           "Fresh Start",
        totalDistance:         5000,
        realTimeLimit:         120, // Seconds allocated for completion
        obstacleSpawnInterval: 60   // Frame interval between hazard spawns
    },
    2: {
        description:           "Running Late",
        totalDistance:         8000,
        realTimeLimit:         90,
        obstacleSpawnInterval: 45
    }
};
