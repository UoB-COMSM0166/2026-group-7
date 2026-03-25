// State Machine & Session Logic
// Responsibilities: Management of global scene transitions and narrative state tracking.

class GameState {
    /**
     * CONSTRUCTOR: INITIALIZATION
     * Sets the entry point for the application and initializes narrative tracking variables.
     */
    constructor() {
        // Defines the starting point of the game application
        this.currentState = STATE_MENU;

        // Narrative & Logic tracking: Stores strings to determine specific Game Over scenarios
        this.failReason = ""; // Valid types: "HIT_BUS", "EXHAUSTED", "LATE"

        // Tracks progression to trigger specific tutorial or dialogue events in the Room
        this.isFirstTimeInRoom = true;

        // Current run utility-item snapshot (should survive restart run)
        this.runUtilityItemName = null;
        this.runUtilityItemCharges = 0;
        this.runUtilityItemArmed = false;
    }

    /**
     * STATE TRANSITION INTERFACE
     * Handles the switching of scenes and manages state history for the pause mechanism.
     */
    setState(newState) {
        if (newState === this.currentState) return;
        // Logic: Backup current state before pausing to allow for later resumption
        if (newState === STATE_PAUSED) {
            this.previousState = this.currentState;
        }

        // Reset end screen when leaving WIN/FAIL so it re-activates correctly next visit
        if ((this.currentState === STATE_WIN || this.currentState === STATE_FAIL) &&
            newState !== STATE_WIN && newState !== STATE_FAIL) {

            if (typeof stopFailEndAudio === "function") {
                stopFailEndAudio();
            }
            if (typeof stopWinEndAudio === "function") {
                stopWinEndAudio();
            }

            if (typeof endScreenManager !== "undefined" && endScreenManager) {
                endScreenManager._activeScreen = null;
            }
        }       

        // Debugging: Log transition for developer console tracking
        console.log(`[GameState] Switch: ${this.currentState} -> ${newState}`);

        // Finalize state update
        this.currentState = newState;
        if (typeof BGM !== 'undefined' && BGM && typeof BGM.onStateChanged === 'function') {
            BGM.onStateChanged(this.currentState);
        }  

        // End-screen input should not be blocked by an open debug panel.
        if ((newState === STATE_FAIL || newState === STATE_WIN) &&
            typeof testingPanel !== 'undefined' && testingPanel) {
            testingPanel.visible = false;
        }

        // Activate end screen overlays on transition
        if (typeof endScreenManager !== 'undefined' && endScreenManager) {
            if (newState === STATE_FAIL) {
                endScreenManager.activateFail(this.failReason);
            } else if (newState === STATE_WIN) {
                endScreenManager.activateSuccess();
            }
        }
        
    }

    /**
     * SESSION RESET
     * Clears failure flags and resets logic gates to prepare for a fresh gameplay attempt.
     */
    resetFlags() {
        this.failReason = "";
    }

    /**
     * Saves the current run's carried utility item so restart can restore it.
     */
    saveRunUtilityItemSnapshot(itemName, charges = 0, armed = false) {
        this.runUtilityItemName = itemName || null;
        this.runUtilityItemCharges = Number.isFinite(Number(charges)) ? Math.max(0, Number(charges)) : 0;
        this.runUtilityItemArmed = !!armed;
    }

    /**
     * Clears the current run's utility item snapshot.
     * Used when starting a fresh room-preparation flow.
     */
    clearRunUtilityItemSnapshot() {
        this.runUtilityItemName = null;
        this.runUtilityItemCharges = 0;
        this.runUtilityItemArmed = false;
    }
}
