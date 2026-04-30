// State Machine & Session Logic
// Responsibilities: Global FSM transitions, pause history, and per-run utility item snapshot.

class GameState {
    constructor() {
        this.currentState = STATE_MENU;
        this.failReason = ""; // "HIT_BUS" | "EXHAUSTED" | "LATE"
        this.isFirstTimeInRoom = true;
        this.runUtilityItemName = null;
        this.runUtilityItemCharges = 0;
        this.runUtilityItemArmed = false;
    }

    setState(newState) {
        if (newState === this.currentState) return;

        if (newState === STATE_PAUSED) {
            this.previousState = this.currentState;
        }

        if ((this.currentState === STATE_WIN || this.currentState === STATE_FAIL) &&
            newState !== STATE_WIN && newState !== STATE_FAIL) {
            if (typeof stopFailEndAudio === "function") stopFailEndAudio();
            if (typeof stopWinEndAudio === "function") stopWinEndAudio();
            if (typeof endScreenManager !== "undefined" && endScreenManager) {
                endScreenManager._activeScreen = null;
            }
        }

        this.currentState = newState;
        if (typeof BGM !== 'undefined' && BGM && typeof BGM.onStateChanged === 'function') {
            BGM.onStateChanged(this.currentState);
        }

        if ((newState === STATE_FAIL || newState === STATE_WIN) &&
            typeof testingPanel !== 'undefined' && testingPanel) {
            testingPanel.visible = false;
        }

        if (typeof endScreenManager !== 'undefined' && endScreenManager) {
            if (newState === STATE_FAIL) {
                endScreenManager.activateFail(this.failReason);
            } else if (newState === STATE_WIN) {
                endScreenManager.activateSuccess();
            }
        }
    }

    resetFlags() {
        this.failReason = "";
    }

    /** Persists the active utility item so a run restart can restore it. */
    saveRunUtilityItemSnapshot(itemName, charges = 0, armed = false) {
        this.runUtilityItemName = itemName || null;
        this.runUtilityItemCharges = Number.isFinite(Number(charges)) ? Math.max(0, Number(charges)) : 0;
        this.runUtilityItemArmed = !!armed;
    }

    clearRunUtilityItemSnapshot() {
        this.runUtilityItemName = null;
        this.runUtilityItemCharges = 0;
        this.runUtilityItemArmed = false;
    }
}
