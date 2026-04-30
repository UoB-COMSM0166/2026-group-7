// Park Street Survivor - BGM Manager
// Responsibilities: Centralized BGM routing and safe track switching (no double-loop).

if (typeof bgms === 'undefined') {
    // eslint-disable-next-line no-var
    var bgms = {};
}

const BGM = (() => {
    let _currentKey = null;
    let _cutsceneScene = null;
    let _enabled = true;

    function _has(key) {
        return bgms && key && Object.prototype.hasOwnProperty.call(bgms, key) && bgms[key];
    }

    function _vol() {
        if (typeof masterVolumeBGM === 'number') return masterVolumeBGM;
        // easily too loud
        return 0.25;
    }

    function _safeStop(key) {
        if (!_has(key)) return;
        try {
            bgms[key].stop();
        } catch (e) {
            console.warn('[BGM] stop failed:', key, e);
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

    function setCutsceneScene(sceneName) {
        _cutsceneScene = sceneName || null;
    }

    function clearCutsceneScene() {
        _cutsceneScene = null;
    }

    /** Maps a game state (and current context) to the BGM key that should play. */
    function routeKey(state) {
        if (state === STATE_MENU || state === STATE_HELP || state === STATE_SETTINGS) {
            // Settings/Help accessed from a paused gameplay session — preserve the current BGM.
            if (state !== STATE_MENU && _currentKey && _currentKey !== 'Main') return null;
            return 'Main';
        }

        if (state === STATE_LEVEL_SELECT || state === STATE_ROOM || state === STATE_INVENTORY) {
            return 'TimeRoom';
        }

        if (state === STATE_DAY_RUN || state === STATE_TUTORIAL_SLIDES) {
            const day = (typeof currentDayID === 'number') ? currentDayID : 1;
            if (day <= 2) return 'Level12';
            if (day <= 4) return 'Level34';
            return 'Level5';
        }

        if (state === STATE_CUTSCENE) {
            const day = (typeof currentDayID === 'number') ? currentDayID : 1;
            // Day 5 BGM is started explicitly when Charlotte first appears in Cutscene.js.
            if (day === 5) return null;
            if (_cutsceneScene === 'library') {
                return _has('Library') ? 'Library' : 'TimeRoom';
            }
            if (_cutsceneScene === 'balloon_festival') {
                return _has('BalloonFestival') ? 'BalloonFestival' : null;
            }
            return null;
        }

        // WIN/FAIL/CREDITS audio is handled by end-screen and cinematic logic.
        return null;
    }

    let _isLocked = false;

    /** Switches to key, stopping all other tracks; no-ops if key is already playing. */
    function play(key) {
        if (!_enabled || !key || !_has(key)) return;

        if (_currentKey === key) {
            _safeSetVolume(_currentKey);
            return;
        }

        // Brief lock prevents oscillating state changes from retriggering play.
        if (_isLocked) return;
        _isLocked = true;

        const oldKey = _currentKey;
        _currentKey = key;

        try {
            Object.keys(bgms).forEach(k => {
                if (bgms[k] && typeof bgms[k].isPlaying === 'function' && bgms[k].isPlaying()) {
                    bgms[k].stop();
                    bgms[k].setVolume(0);
                }
            });

            const t = bgms[_currentKey];

            if (typeof t.isLoaded === 'function' && !t.isLoaded()) {
                _currentKey = oldKey;
                return;
            }

            t.setVolume(_vol());
            t.loop();

        } catch (e) {
            console.warn('[BGM] Play fatal error:', e);
        } finally {
            setTimeout(() => { _isLocked = false; }, 100);
        }
    }

    function stop() {
        if (_currentKey) _safeStop(_currentKey);
        _currentKey = null;
    }

    function syncVolume() {
        if (_currentKey) _safeSetVolume(_currentKey);
    }

    function onStateChanged(newState) {
        const key = routeKey(newState);
        if (key) play(key);

        if (newState !== STATE_CUTSCENE) {
            _cutsceneScene = null;
        }
    }

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