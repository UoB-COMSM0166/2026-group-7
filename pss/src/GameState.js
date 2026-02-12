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
    }

    /**
     * STATE TRANSITION INTERFACE
     * Handles the switching of scenes and manages state history for the pause mechanism.
     */
    setState(newState) {
        // Logic: Backup current state before pausing to allow for later resumption
        if (newState === STATE_PAUSED) {
            this.previousState = this.currentState; 
        }
        
        // Debugging: Log transition for developer console tracking
        console.log(`[GameState] Switch: ${this.currentState} -> ${newState}`);
        
        // Finalize state update
        this.currentState = newState;
    }

    /**
     * SESSION RESET
     * Clears failure flags and resets logic gates to prepare for a fresh gameplay attempt.
     */
    resetFlags() {
        this.failReason = "";
    }
}