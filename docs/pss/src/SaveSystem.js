// Park Street Survivor - Save System
// Responsibilities: localStorage-backed real-time snapshot save/load.
// Auto-saves every 3 s during active gameplay; persists across page refreshes.

const SAVE_KEY          = 'pss_autosave';
const SAVE_INTERVAL_MS  = 3000;
const BRIGHTNESS_KEY    = 'pss_brightness'; // separate key so clearing saves doesn't reset brightness

const SaveSystem = {

    _lastSaveTime: 0,

    // ─── PERSISTENCE ─────────────────────────────────────────────────────────

    /**
     * Writes a snapshot of the current session to localStorage.
     * Called automatically by tick() and also on explicit milestones (day unlock).
     */
    save() {
        const data = {
            savedAt:           Date.now(),
            currentDayID:      (typeof currentDayID      !== 'undefined') ? currentDayID      : 1,
            currentUnlockedDay:(typeof currentUnlockedDay !== 'undefined') ? currentUnlockedDay : 1,
            gameDifficulty:    (typeof gameDifficulty     !== 'undefined') ? gameDifficulty     : 1,
            prologueSeen:      (typeof _prologueSeen      !== 'undefined') ? _prologueSeen      : false,
            playerChoices:     (typeof _playerChoices     !== 'undefined') ? _playerChoices     : {},
            // Tutorial progress — restores guidance state when continuing a save
            tutorialState: (typeof tutorialHints !== 'undefined') ? {
                uiTutorialDone:   tutorialHints.uiTutorialDone,
                moveTutorialDone: tutorialHints.moveTutorialDone,
                roomPhase:        tutorialHints.roomPhase,
            } : null,
            // Which per-day room cutscenes have already been shown this run
            roomCutsceneSeen: (typeof _roomCutsceneSeen !== 'undefined') ? Object.assign({}, _roomCutsceneSeen) : {},
            // Node-based branch choices (nodeId → chosen next_id) for story recap
            nodeChoices: (typeof _nodeChoices !== 'undefined') ? Object.assign({}, _nodeChoices) : {},
        };
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('[SaveSystem] Write failed:', e);
        }
    },

    /** Returns the parsed save object, or null if none exists / parse error. */
    load() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            console.warn('[SaveSystem] Read failed:', e);
            return null;
        }
    },

    /** Deletes the save. */
    clear() {
        localStorage.removeItem(SAVE_KEY);
    },

    /** True when a valid save entry exists. */
    hasSave() {
        return !!localStorage.getItem(SAVE_KEY);
    },

    // ─── AUTO-SAVE TICKER ────────────────────────────────────────────────────

    /**
     * Call once per frame from draw().
     * Fires a save every SAVE_INTERVAL_MS ms while in an active gameplay state.
     */
    tick() {
        if (typeof gameState === 'undefined') return;
        if (typeof isStoryRunMode === 'function' && !isStoryRunMode()) return;
        const s = gameState.currentState;
        if (s !== STATE_ROOM && s !== STATE_DAY_RUN && s !== STATE_PAUSED) return;
        const now = Date.now();
        if (now - this._lastSaveTime >= SAVE_INTERVAL_MS) {
            this._lastSaveTime = now;
            this.save();
        }
    },

    // ─── RESTORE ─────────────────────────────────────────────────────────────

    /**
     * Applies saved globals and transitions to the room for the saved day.
     * Must be called inside a triggerTransition() callback.
     */
    applyAndResume() {
        const save = this.load();
        if (!save) {
            // No save exists — start fresh from Day 1
            if (typeof currentDayID !== 'undefined') currentDayID = 1;
            if (typeof setupRun === 'function') setupRun(1);
            return;
        }
        currentDayID       = save.currentDayID       || 1;
        currentUnlockedDay = save.currentUnlockedDay  || 1;
        gameDifficulty     = save.gameDifficulty      || 1;
        if (typeof _prologueSeen !== 'undefined') _prologueSeen = !!save.prologueSeen;
        if (typeof _playerChoices !== 'undefined' && save.playerChoices) {
            _playerChoices = save.playerChoices;
        }
        // Restore tutorial progress
        if (typeof tutorialHints !== 'undefined' && save.tutorialState) {
            tutorialHints.uiTutorialDone   = !!save.tutorialState.uiTutorialDone;
            tutorialHints.moveTutorialDone = !!save.tutorialState.moveTutorialDone;
            if (save.tutorialState.roomPhase) tutorialHints.roomPhase = save.tutorialState.roomPhase;
        }
        // Restore which room cutscenes have been seen (prevents replaying on continue)
        if (typeof _roomCutsceneSeen !== 'undefined' && save.roomCutsceneSeen) {
            Object.assign(_roomCutsceneSeen, save.roomCutsceneSeen);
        }
        // Restore node-based branch choices for story recap
        if (typeof _nodeChoices !== 'undefined' && save.nodeChoices) {
            Object.assign(_nodeChoices, save.nodeChoices);
        }
        setupRun(currentDayID);
    },

    // ─── DISPLAY HELPERS ─────────────────────────────────────────────────────

    /** Formats a Unix-ms timestamp into "YYYY-MM-DD HH:MM". */
    formatTime(ms) {
        const d   = new Date(ms);
        const pad = n => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}  ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    },

    // ─── BRIGHTNESS CALIBRATION ──────────────────────────────────────────────

    /** Persists the player's brightness preference (0 = darkest, 1 = brightest). */
    saveBrightness(val) {
        localStorage.setItem(BRIGHTNESS_KEY, String(constrain(val, 0, 1)));
    },

    /**
     * Returns the saved brightness value, or null if the player has never calibrated.
     * Use null to detect first-launch and show the calibration screen.
     */
    loadBrightness() {
        const raw = localStorage.getItem(BRIGHTNESS_KEY);
        if (raw === null) return null;
        const v = parseFloat(raw);
        return isNaN(v) ? null : constrain(v, 0, 1);
    },
};
