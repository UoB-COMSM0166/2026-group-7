// Park Street Survivor - BGM Manager
// Responsibilities: Centralized BGM routing + safe switching (no double-loop), volume sync.
// Usage:
//   1) In preload(): fill global `bgms` registry with p5.SoundFile tracks.
//   2) In startCutscene(sceneName,...): call BGM.setCutsceneScene(sceneName)
//   3) In GameState.setState(): call BGM.onStateChanged(newState)
//   4) When masterVolumeBGM changes: call BGM.syncVolume()

/**
 * Global registry of BGM tracks.
 */
if (typeof bgms === 'undefined') {
    // eslint-disable-next-line no-var
    var bgms = {};
}

/**
 * Central manager singleton.
 */
const BGM = (() => {
    let _currentKey = null;         // currently playing track key
    let _cutsceneScene = null;      // e.g. 'library', 'news'
    let _enabled = true;            // allow global disable if needed

    // ─── helpers ──────────────────────────────────────────────────────────
    function _has(key) {
        return bgms && key && Object.prototype.hasOwnProperty.call(bgms, key) && bgms[key];
    }

    function _vol() {
        // masterVolumeBGM is defined in sketch.js; fallback to 0.25
        if (typeof masterVolumeBGM === 'number') return masterVolumeBGM;
        return 0.25;
    }

    function _safeStop(key) {
        if (!_has(key)) return;
        try {
            // stop() resets playhead; that's fine for BGM switching
            bgms[key].stop();
        } catch (e) {
            console.warn('[BGM] stop failed:', key, e);
        }
    }

    function _safeLoop(key) {
        if (!_has(key)) return;
        try {
            const t = bgms[key];
            t.setVolume(_vol());

            // If it's already playing, don't stop/loop it.
            if (typeof t.isPlaying === 'function' && t.isPlaying()) return;

            t.loop();
        } catch (e) {
        console.warn('[BGM] loop failed:', key, e);
        }
    }

    function _safeSetVolume(key) {
        if (!_has(key)) return;
        try {
            bgms[key].setVolume(_vol());
        } catch (e) {
            console.warn('[BGM] setVolume failed:', key, e);
        }
    } 

    // ─── Public API ──────────────────────────────────────────────────────────

    /**
     * Set which cutscene "sceneName" is currently active.
     * Call this at the start of startCutscene(sceneName,...).
     */
    function setCutsceneScene(sceneName) {
        _cutsceneScene = sceneName || null;
    }

    /**
     * Optional: clear cutscene scene marker.
     * You can call this when leaving cutscene, but it's also safe to leave it
     * because onStateChanged() will route by state.
     */
    function clearCutsceneScene() {
        _cutsceneScene = null;
    }

    /**
     * Decide which BGM key should play for a given state, based on:
     * - state
     * - currentDayID (for run-day splits)
     * - _day5Ending (for ending splits)
     * - current cutscene sceneName (library/news)
     *
     * Returns: string key (e.g. 'MENU') or null if no change desired.
     */
    function routeKey(state) {
        // 1) MENU / HELP / SETTINGS -> Main
        if (state === STATE_MENU || state === STATE_HELP || state === STATE_SETTINGS) {
            return 'Main';
        }

        // 2) Level select (Time) + Room + Inventory -> TimeRoom
        if (state === STATE_LEVEL_SELECT || state === STATE_ROOM || state === STATE_INVENTORY) {
            return 'TimeRoom';
        }

        // 3) Day run + tutorial slides -> by day id (1-2 / 3-4 / 5)
        if (state === STATE_DAY_RUN || state === STATE_TUTORIAL_SLIDES) {
            const day = (typeof currentDayID === 'number') ? currentDayID : 1;
            if (day <= 2) return 'Level12';
            if (day <= 4) return 'Level34';
            return _has('FinalDay') ? 'FinalDay' : 'Level5';
        }

        // 4) Cutscene routing: library vs other scenes
        if (state === STATE_CUTSCENE) {
            const day = (typeof currentDayID === 'number') ? currentDayID : 1;
            // Day 5: BGM starts explicitly when Charlotte first appears (see _csDay5VoiceCtx logic
            // in Cutscene.js). Routing returns null here so the VOICE opening plays in silence.
            if (day === 5) return null;
            // Days 1–4: route by cutscene scene
            if (_cutsceneScene === 'library') {
                return _has('Library') ? 'Library' : 'TimeRoom';
            }
            if (_cutsceneScene === 'balloon_festival') {
                return _has('BalloonFestival') ? 'BalloonFestival' : null;
            }
            // Other cutscenes (e.g. room dialogue/news) — keep current BGM
            return null;
        }

       // 5) Win / Fail / Credits:
        // no automatic BGM switch here
        // - WIN audio is handled by end-screen activation logic
        // - FAIL audio is handled separately with delayed playback
        if (state === STATE_WIN || state === STATE_FAIL || state === STATE_CREDITS) {
            return null;
        }

        return null;
    }

    /**
     * Play/switch to a target key safely.
     * Guarantees: no double-loop, never leaves two tracks playing.
     */
    let _isLocked = false; 

    function play(key) {
        if (!_enabled || !key || !_has(key)) return;
        
        // 1. Same song: Do not trigger play/loop repeatedly, only synchronize volume.
        if (_currentKey === key) {
            _safeSetVolume(_currentKey);
            return;
        }

        // 2. State lock: Prevents the logic layer from repeatedly triggering play.
        // Due to state oscillations within a short period of time.
        if (_isLocked) return;
        _isLocked = true;

        const oldKey = _currentKey;
        _currentKey = key;

        try {
            // 3. Core fix: Physically stop "all" potentially playing background music nodes.
            Object.keys(bgms).forEach(k => {
                if (bgms[k] && typeof bgms[k].isPlaying === 'function' && bgms[k].isPlaying()) {
                    bgms[k].stop(); 
                    bgms[k].setVolume(0); 
                }
            });

            // 4. Activate new BGM
            const t = bgms[_currentKey];
            t.setVolume(_vol()); 
            
            t.loop();

            console.log(`[BGM] Switched to: ${_currentKey}`);

        } catch (e) {
            console.warn('[BGM] Play fatal error:', e);
        } finally {
            // 5. Unlock after a short delay to prevent crashes caused by rapid state transitions.
            setTimeout(() => { _isLocked = false; }, 100);
        }
    }

    /**
     * Stop current track.
     */
    function stop() {
        if (_currentKey) _safeStop(_currentKey);
        _currentKey = null;
    }

    /**
     * Call when global masterVolumeBGM changes (e.g. slider).
     */
    function syncVolume() {
        if (_currentKey) _safeSetVolume(_currentKey);
    }

    /**
     * Hook to be called from GameState.setState(newState) after state update.
     */
    function onStateChanged(newState) {
        const key = routeKey(newState);
        if (key) play(key);

        // If leaving cutscene, you can clear marker (optional hygiene)
        if (newState !== STATE_CUTSCENE) {
            _cutsceneScene = null;
        }
    }

    /**
     * Optional: enable/disable all BGM (for debug/mute)
     */
    function setEnabled(enabled) {
        _enabled = !!enabled;
        if (!_enabled) stop();
    }

      function getCurrentKey() { return _currentKey; }
      function getCutsceneScene() { return _cutsceneScene; }

      return {
          setCutsceneScene,
          clearCutsceneScene,
          routeKey,
          play,
          stop,
          syncVolume,
          onStateChanged,
          setEnabled,
          getCurrentKey,
          getCutsceneScene
       };
})();