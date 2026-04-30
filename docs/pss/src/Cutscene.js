// Park Street Survivor - Cutscene & Dialogue System
// Responsibilities: VN-style dialogue overlays, story scripts, branching endings.
let _cs = {
    bg:             'library', // 'news' | 'room' | 'library'
    onComplete:     null,      // callback after last line
    currentNodeId: null,       // string ID of current DIALOGUE_DATA node
};

const SPEAKER_PORTRAIT_MAP = {
    'IRIS':       'portraitPlayerNormal',
    'WIOLA':      'portraitWiola',
    'LAYLA':      'portraitLayla',
    'RAYMOND':    'portraitRaymond',
    'LYDIA':      'portraitLydia',
    'CHARLOTTE':  'portraitCharlotte',
    'NEWSREADER': null,
    'VOICE':      null,   // anonymous doctor voice — no portrait
};

// Per-session "already seen" flags — prevents replays on retry
let _roomCutsceneSeen = {};   // { dayID: true }
let _prologueSeen     = false;

/** Allow TestingPanel to force-replay a room cutscene for a given day. */
function clearRoomCutsceneSeen(day) {
    if (day !== undefined) delete _roomCutsceneSeen[day];
    else _roomCutsceneSeen = {};
}

// Player choice log: key = "dayID_lineIndex", value = { choiceIdx, label }
let _playerChoices = {};

// Node-based branch log: key = nodeId, value = chosen next_id.
// Used by buildRecapEntries() to replay the correct story path.
let _nodeChoices = {};

// Live story journal: records only content the player has actually reached.
// Shape: { [dayId]: { entries: [...], seenSources: { [sourceKey]: true } } }
let _storyRecapLog = {};

function _resetStoryRecapLog() {
    _storyRecapLog = {};
}

function _ensureStoryRecapDay(day) {
    if (!_storyRecapLog[day]) {
        _storyRecapLog[day] = { entries: [], seenSources: {} };
    }
    return _storyRecapLog[day];
}

function _getActiveRecapDay() {
    if (_cs && typeof _cs.currentNodeId === 'string' && _cs.currentNodeId.startsWith('prologue')) {
        return 0;
    }
    return (typeof currentDayID === 'number' && currentDayID >= 1) ? currentDayID : 0;
}

function _appendStoryRecapEntry(day, sourceKey, entry) {
    const bucket = _ensureStoryRecapDay(day);
    if (sourceKey && bucket.seenSources[sourceKey]) return;
    if (sourceKey) bucket.seenSources[sourceKey] = true;
    bucket.entries.push(entry);
}

function _logDialogueBlockToRecap(day, sourceBase, speaker, contentLines) {
    if (!Array.isArray(contentLines) || contentLines.length === 0) return;

    const bucket = _ensureStoryRecapDay(day);
    const lastEntry = bucket.entries.length > 0 ? bucket.entries[bucket.entries.length - 1] : null;
    if (speaker && (!lastEntry || lastEntry.type !== 'speaker' || lastEntry.name !== speaker)) {
        _appendStoryRecapEntry(day, `${sourceBase}:speaker`, { type: 'speaker', name: speaker });
    }

    for (let i = 0; i < contentLines.length; i++) {
        const text = _stripDialogueTags(String(contentLines[i] || '')).trim();
        if (!text) continue;
        _appendStoryRecapEntry(day, `${sourceBase}:line:${i}`, { type: 'dialogue', text });
    }
}

/** Records which option the player selected at a given dialogue line. */
function _recordPlayerChoice(dayID, lineIndex, choiceIdx, label) {
    _playerChoices[dayID + '_' + lineIndex] = { choiceIdx, label };
}

// Shared DialogueBox instance used for all cutscene lines
let _csBox           = null;
let _isEndingActive = false;
let _endingLines    = [];
let _lineAlphas     = [];
let _currentLine    = 0;
let _endingTimer    = 0;
let _onEndingDone   = null;
let _csLastSyncIndex  = -1;   // tracks last index synced to _csBox to avoid re-triggering
let _csLastNodeId     = null; // tracks last node ID synced to _csBox (node mode)
let _csContentIdx     = 0;   // which item in node.content[] is currently shown
let _csLastContentIdx = -1;  // last content index synced to _csBox

// Screen-effect state (node mode)
let _screenEffect = { type: null, timer: 0 };
let _flashEffect  = { timer: 0 };  // flash overlay — can co-exist with shake/breath
const _EFFECT_DURATION = { shake: 60, flash: 45, dizzy: 120, breath: 180, eye_blink: 210 };

// Auto-advance timer (node mode): counts down each frame; when 0, advance to next node
let _csAutoAdvanceTimer = 0;

// Progressive blur effect (for inner-monologue sequences)
let _csBlurActive    = false;
let _csBlurIntensity = 0;
let _csBlurTarget    = 0;    // bidirectional lerp target for blur intensity
let _csFloatZoom            = 1.0;  // zoom scalar for bg_float_street (starts zoomed-in, lerps to 1.0)
let _csFloatCrossfadeAlpha  = 255;  // alpha of bg_float_iris during crossfade from bg_float_street (0=street, 255=iris)
let _csDay5VoiceCtx  = false; // Day 5: true = in VOICE context (operating_theatre), false = hot_air_balloon

// Item showcase state (node mode)
let _showcase = { active: false, itemName: '', timer: 0, pendingNextId: null };

// ─── ITEM RECEIVED NOTICE BOX ───────────────────────────────────────────────
// Uses assets/dialogue/notice_box.png (520×150 px, design space x:1400 y:100).
// Light-purple item frame inside the image: 104×112 px.
// Triggered by an `onShow: { type: 'item_received', name: '...' }` field.
let _itemToast = { active: false, name: '', timer: 0, alpha: 0 };
const _ITEM_TOAST_DURATION = 330; // frames (~5.5 s at 60 fps)
const _ITEM_TOAST_FADE_IN  = 20;
const _ITEM_TOAST_FADE_OUT = 40;
let _lastItemToastSfxName = '';
let _lastItemToastSfxAt   = 0;

function _showItemToast(name) {
    _itemToast.active = true;
    _itemToast.name   = name;
    _itemToast.timer  = _ITEM_TOAST_DURATION;
    _itemToast.alpha  = 0;

    const now = performance.now();
    const sameToastTriggeredTooSoon =
        _lastItemToastSfxName === name && (now - _lastItemToastSfxAt) < 500;

    if (!sameToastTriggeredTooSoon) {
        if (typeof playSFX === 'function' && typeof sfxItemNotification !== 'undefined' && sfxItemNotification) {
            playSFX(sfxItemNotification, {
                id: 'item_toast_notification',
                cooldownMs: 250,
                monophonic: true
            });
        }
        _lastItemToastSfxName = name;
        _lastItemToastSfxAt   = now;
    }
}

/** Immediately hides the item-received notice box. Call when leaving a cutscene/level. */
function clearItemToast() {
    _itemToast.active = false;
    _itemToast.timer  = 0;
}

/** Maps a display name string to the matching inventory item image. */
function _getItemImage(displayName) {
    if (!displayName || typeof assets === 'undefined') return null;
    const n = String(displayName).toUpperCase();
    if (n.includes('VITAMIN') || n.includes('GUMM'))  return assets.vitaminImg   || null;
    if (n.includes('TANGLE'))                          return assets.tangleImg    || null;
    if (n.includes('HEADPHONE'))                       return assets.headphoneImg || null;
    if (n.includes('BOOT') || n.includes('WELLI'))     return assets.rainbootImg  || null;
    return null;
}

function _drawItemToast() {
    if (!_itemToast.active) return;
    _itemToast.timer--;
    if (_itemToast.timer <= 0) { _itemToast.active = false; return; }

    // Alpha: fade in → hold → fade out
    const t = _itemToast.timer;
    if (t > _ITEM_TOAST_DURATION - _ITEM_TOAST_FADE_IN) {
        _itemToast.alpha = map(t, _ITEM_TOAST_DURATION, _ITEM_TOAST_DURATION - _ITEM_TOAST_FADE_IN, 0, 255);
    } else if (t < _ITEM_TOAST_FADE_OUT) {
        _itemToast.alpha = map(t, _ITEM_TOAST_FADE_OUT, 0, 255, 0);
    } else {
        _itemToast.alpha = 255;
    }

    const s = min(width / 1920, height / 1080);
    const a = _itemToast.alpha;

    // ── Design-space layout (spec: 520×150 px at x:1400, y:100) ──────────────
    // Item frame (light purple, 104×112) is inset on the left of the notice box.
    const BOX_X  = 1400 * s;
    const BOX_Y  = 100  * s;
    const BOX_W  = 520  * s;
    const BOX_H  = 150  * s;
    // Frame inset: 18 px left margin, vertically centred → top at (150-112)/2=19 px
    const FRM_X  = (1400 + 18) * s;
    const FRM_Y  = (100  + 19) * s;
    const FRM_W  = 104  * s;
    const FRM_H  = 112  * s;
    const FRM_CX = FRM_X + FRM_W * 0.5;
    const FRM_CY = FRM_Y + FRM_H * 0.5;
    // Text area starts right of the frame
    const TXT_X  = FRM_X + FRM_W + 16 * s;
    const TXT_CY = BOX_Y + BOX_H * 0.5;

    push();
    imageMode(CORNER);

    // Notice box background image
    if (typeof assets !== 'undefined' && assets.noticeBox) {
        tint(255, a);
        image(assets.noticeBox, BOX_X, BOX_Y, BOX_W, BOX_H);
        noTint();
    } else {
        // Fallback: plain rect
        noStroke();
        fill(15, 8, 42, a * 0.92);
        rect(BOX_X, BOX_Y, BOX_W, BOX_H, 12 * s);
        noFill();
        stroke(255, 200, 60, a * 0.85);
        strokeWeight(1.8 * s);
        rect(BOX_X, BOX_Y, BOX_W, BOX_H, 12 * s);
    }

    // Item image — centred inside the frame, scaled to fit with padding
    const itemImg = _getItemImage(_itemToast.name);
    if (itemImg) {
        const pad    = 10 * s;
        const maxW   = FRM_W - pad * 2;
        const maxH   = FRM_H - pad * 2;
        const ratio  = min(maxW / itemImg.width, maxH / itemImg.height);
        const iW     = itemImg.width  * ratio;
        const iH     = itemImg.height * ratio;
        imageMode(CENTER);
        tint(255, a);
        image(itemImg, FRM_CX, FRM_CY, iW, iH);
        noTint();
    }

    // "Received" label
    noStroke();
    imageMode(CORNER);
    let fDB = (typeof fonts !== 'undefined') ? (fonts.jersey20 || fonts.dialogueBlue || fonts.body || fonts.title) : null;
    if (fDB) textFont(fDB);
    textSize(34 * s);
    textAlign(LEFT, CENTER);
    fill(180, 165, 220, a);
    text("Received", TXT_X, TXT_CY - 26 * s);

    // Item name in gold
    if (fDB) textFont(fDB);
    textSize(36 * s);
    fill(255, 215, 0, a);
    text(_itemToast.name, TXT_X, TXT_CY + 20 * s);

    pop();
}

/**
 * Strips <h>…</h> tags from a content array, returning plain text and character
 * ranges for the DialogueBox highlight pass.
 */
function _parseContent(contentArray) {
    const ranges = [];   // [{start, end}] character ranges in the resulting plain text
    const joined = (contentArray || []).join('\n');
    const regex  = /<h>(.*?)<\/h>/g;
    let result   = '';
    let lastEnd  = 0;
    let match;
    while ((match = regex.exec(joined)) !== null) {
        result += joined.slice(lastEnd, match.index);
        const hlStart = result.length;
        result += match[1];
        ranges.push({ start: hlStart, end: result.length });
        lastEnd = match.index + match[0].length;
    }
    result += joined.slice(lastEnd);
    return { text: result, highlight: ranges.length > 0 ? ranges : null };
}

/** Resolves an action string from a node option into a callable function. */
function _resolveNodeAction(action) {
    if (action === 'go_credits') {
        return () => {
            if (typeof resetCredits === 'function') resetCredits();
            gameState.setState(STATE_CREDITS);
        };
    }
    if (action === 'good_ending') {
        return () => startCinematicEnding(TEXT_GOOD_ENDING, () => {
            startCutsceneFromNode('awakening_reality_01', () => {
                if (typeof resetCredits === 'function') resetCredits();
                gameState.setState(STATE_CREDITS);
            });
        });
    }
    if (action === 'bad_ending') {
        return () => startCinematicEnding(TEXT_BAD_ENDING, () => {
            if (typeof resetCredits === 'function') resetCredits();
            gameState.setState(STATE_CREDITS);
        });
    }
    return null;
}

/** Returns true if transitioning fromBg→toBg warrants a black-screen fade. */
function _bgNeedsFade(fromBg, toBg) {
    if (!toBg || fromBg === toBg) return false;
    // bus and phone are the same scene (phone is just an overlay on the bus bg)
    if ((fromBg === 'bus' && toBg === 'phone') || (fromBg === 'phone' && toBg === 'bus')) return false;
    // black cuts always instant — no fade needed
    if (fromBg === 'black' || toBg === 'black') return false;
    return true;
}

/** Returns true if the bg transition is the dramatic library ↔ balloon_festival scene change. */
function _isSceneTransition(fromBg, toBg) {
    return (fromBg === 'library'          && toBg === 'balloon_festival') ||
           (fromBg === 'balloon_festival' && toBg === 'library');
}

/**
 * Triggers a slow, dramatic scene-change fade (~0.85s each way).
 * After the full fade cycle completes the normal speed (0.3s) is restored.
 * Starts a breathing pulse effect on the whole container as the new scene fades in.
 */
function _triggerSceneFade(onBlackout) {
    if (typeof globalFade === 'undefined' || typeof triggerTransition !== 'function') {
        if (typeof onBlackout === 'function') onBlackout();
        return;
    }
    globalFade.speed       = 255 / (0.85 * 60);  // ~0.85s fade-out
    globalFade._resetSpeed = 255 / (0.3  * 60);  // restore to 0.3s after fade-in completes
    triggerTransition(() => {
        if (typeof onBlackout === 'function') onBlackout();
        _screenEffect.type  = 'breath';
        _screenEffect.timer = _EFFECT_DURATION.breath;
    });
}

/** Called by DialogueBox when a node-mode option is selected. */
function _onNodeOptionSelected(opt) {
    // Record which branch was chosen so the story recap can replay the correct path.
    if (opt.next_id && _cs.currentNodeId) {
        if (typeof _nodeChoices !== 'undefined') {
            _nodeChoices[_cs.currentNodeId] = opt.next_id;
        }
    }
    if (opt.next_id) {
        const nextNode    = (typeof DIALOGUE_DATA !== 'undefined') ? DIALOGUE_DATA[opt.next_id] : null;
        const nextBg      = nextNode && nextNode.bg;
        const noFade      = nextNode && nextNode.no_fade;
        const _isDay5     = (typeof currentDayID === 'number') && currentDayID === 5;
        const currNode    = (_isDay5 && _cs.currentNodeId && typeof DIALOGUE_DATA !== 'undefined')
            ? DIALOGUE_DATA[_cs.currentNodeId] : null;
        const currIsVoice = currNode && currNode.speaker === 'VOICE';
        const nextIsVoice = _isDay5 && nextNode && nextNode.speaker === 'VOICE';
        if (!noFade && !currIsVoice && !nextIsVoice && _bgNeedsFade(_cs.bg, nextBg)) {
            if (_isSceneTransition(_cs.bg, nextBg)) {
                _triggerSceneFade(() => { _cs.currentNodeId = opt.next_id; _csLastNodeId = null; });
            } else {
                triggerTransition(() => { _cs.currentNodeId = opt.next_id; _csLastNodeId = null; });
            }
        } else {
            _cs.currentNodeId = opt.next_id;
            _csLastNodeId = null;
        }
    } else if (opt.action) {
        const cb = _resolveNodeAction(opt.action);
        if (cb) cb();
    }
}

// Aliases for dialogue data loaded from assets/data/dialogue_data.js
const TEXT_BAD_ENDING      = DIALOGUE_DATA.endings.bad;
const TEXT_GOOD_ENDING     = DIALOGUE_DATA.endings.good;

/**
 * Starts a node-based cutscene using DIALOGUE_DATA node IDs.
 * Supports per-node bg changes, screen effects, item showcase, and real branching.
 */
function startCutsceneFromNode(startNodeId, onComplete) {
    const startNode = (typeof DIALOGUE_DATA !== 'undefined') ? DIALOGUE_DATA[startNodeId] : null;
    const bgType    = (startNode && startNode.bg) ? startNode.bg : 'library';
    if (typeof BGM !== 'undefined') BGM.setCutsceneScene(bgType);

    _cs.bg             = bgType;
    _cs.onComplete     = onComplete;
    _cs.currentNodeId  = startNodeId;
    _csLastSyncIndex   = -1;
    _csLastNodeId      = null;
    _csContentIdx      = 0;
    _csLastContentIdx  = -1;
    _showcase.active      = false;
    _screenEffect.type    = null;
    _flashEffect.timer    = 0;
    _csAutoAdvanceTimer   = 0;
    _csBlurActive         = false;
    _csBlurIntensity      = 0;
    _csBlurTarget         = 0;
    _csFloatZoom            = (bgType === 'bg_float_street') ? 1.3 : 1.0;
    _csFloatCrossfadeAlpha  = (bgType === 'bg_float_street') ? 0 : 255;
    _csDay5VoiceCtx         = false;
    _isEndingActive       = false;

    if (!_csBox) _csBox = new DialogueBox();
    _csBox.reset();
    _csBox.persistent     = true;
    _csBox.onOptionSelect = _onNodeOptionSelected;

    gameState.setState(STATE_CUTSCENE);
}

/**
 * Advances to the next line, or ends the cutscene.
 * First press while still typing: skips typewriter to end of current line.
 * Second press (or first when fully revealed): advances index / shows choices / calls onComplete.
 */
function csAdvance() {
    if (typeof globalFade !== 'undefined' && globalFade.isFading) return;

    if (_csBox && _csBox.options && _csBox.isFinishedTyping()) {
        return;  // waiting for player to pick an inline option
    }

    // First click while still typing — reveal full line, wait for next click
    if (_csBox && !_csBox.isFinishedTyping()) {
        _csBox.skipToEnd();
        return;
    }

    if (_showcase.active) return; // blocked while item showcase is playing
    if (_csAutoAdvanceTimer > 0) return; // locked during auto-advance (narration)
    const node = (typeof DIALOGUE_DATA !== 'undefined') ? DIALOGUE_DATA[_cs.currentNodeId] : null;
    if (!node) { if (typeof _cs.onComplete === 'function') _cs.onComplete(); return; }
    if (node.options) return; // waiting for player to pick a node option
    if (node.next_id) {
        const nextNode    = (typeof DIALOGUE_DATA !== 'undefined') ? DIALOGUE_DATA[node.next_id] : null;
        const nextBg      = nextNode && nextNode.bg;
        const noFade      = nextNode && nextNode.no_fade;
        // Day 5 VOICE transitions use flash+blur; skip black-cut fade
        const _isDay5     = (typeof currentDayID === 'number') && currentDayID === 5;
        const currIsVoice = _isDay5 && node.speaker === 'VOICE';
        const nextIsVoice = _isDay5 && nextNode && nextNode.speaker === 'VOICE';
        if (!noFade && !currIsVoice && !nextIsVoice && _bgNeedsFade(_cs.bg, nextBg)) {
            if (_isSceneTransition(_cs.bg, nextBg)) {
                _triggerSceneFade(() => { _cs.currentNodeId = node.next_id; _csLastNodeId = null; });
            } else {
                triggerTransition(() => { _cs.currentNodeId = node.next_id; _csLastNodeId = null; });
            }
        } else {
            _cs.currentNodeId = node.next_id;
            _csLastNodeId = null; // force re-sync
        }
    } else if (node.action) {
        const _fn = _resolveNodeAction(node.action);
        if (_fn) _fn();
    } else if (typeof _cs.onComplete === 'function') {
        _cs.onComplete();
    }
}

/** Handles a mouse click on the cutscene screen. */
function csClick(mx, my) {
    if (_isEndingActive) {
        if (_currentLine >= _endingLines.length) {
            _isEndingActive = false;
            if (typeof _onEndingDone === 'function') {
                _onEndingDone();
            } else {
                if (typeof resetCredits === 'function') resetCredits();
                gameState.setState(STATE_CREDITS);
            }
        }
        return;
    }

    if (typeof globalFade !== 'undefined' && globalFade.isFading) return;
    csAdvance();
}


/** Main draw function; called every frame in STATE_CUTSCENE. */
function drawCutsceneScreen() {
    if (_isEndingActive) {
        drawCinematicEnding();
        return;
    }

    let s  = min(width / 1920, height / 1080);
    let cx = width / 2;

    push();
    colorMode(RGB, 255);

    // Sync bg from current node; Day 5 speaker determines scene (VOICE → theatre, CHARLOTTE → balloon).
    if (_cs.currentNodeId && typeof DIALOGUE_DATA !== 'undefined') {
        const _pn  = DIALOGUE_DATA[_cs.currentNodeId];
        const _day = (typeof currentDayID === 'number') ? currentDayID : 1;
        if (_pn) {
            let _effectiveBg;
            if (_day === 5) {
                if (_pn.speaker === 'VOICE') {
                    _effectiveBg = 'operating_theatre';
                } else if (_pn.speaker === 'CHARLOTTE') {
                    _effectiveBg = _pn.bg || 'hot_air_balloon';
                } else {
                    _effectiveBg = _pn.bg || (_csDay5VoiceCtx ? 'operating_theatre' : 'hot_air_balloon');
                }
            } else {
                _effectiveBg = _pn.bg || null;
            }
            if (_effectiveBg && _effectiveBg !== _cs.bg) {
                _cs.bg = _effectiveBg;
                if (_effectiveBg === 'bg_float_street') { _csFloatZoom = 1.3; _csFloatCrossfadeAlpha = 0; }
                if (typeof BGM !== 'undefined') {
                    BGM.setCutsceneScene(_effectiveBg);
                    BGM.onStateChanged(STATE_CUTSCENE);
                }
            } else if (_effectiveBg) {
                _cs.bg = _effectiveBg;
            }
        }
    }

    _tickAndApplyScreenEffect();

    // Float zoom decays to 1.0, then iris crossfade blends in over ~170 frames
    if (_cs.bg === 'bg_float_street') {
        if (_csFloatZoom > 1.0) {
            _csFloatZoom = Math.max(1.0, _csFloatZoom - 0.0004);
        } else if (_csFloatCrossfadeAlpha < 255) {
            _csFloatCrossfadeAlpha = Math.min(255, _csFloatCrossfadeAlpha + 1.5);
        }
    }
    // Continue crossfade if bg switched to bg_float_iris before completing
    if (_cs.bg === 'bg_float_iris' && _csFloatCrossfadeAlpha < 255) {
        _csFloatCrossfadeAlpha = Math.min(255, _csFloatCrossfadeAlpha + 1.5);
    }

    push();
    if (_csBlurActive || _csBlurTarget > 0 || _csBlurIntensity > 0) {
        const diff = _csBlurTarget - _csBlurIntensity;
        if (Math.abs(diff) > 0.05) {
            _csBlurIntensity += diff * 0.04;
        } else {
            _csBlurIntensity = _csBlurTarget;
        }
        if (_csBlurIntensity > 0.1) {
            drawingContext.filter = `blur(${_csBlurIntensity.toFixed(1)}px)`;
        }
    }
    _drawCutsceneBg();
    if (_csBlurIntensity > 0.1) drawingContext.filter = 'none';
    pop();

    if (!_csBox) {
        _csBox = new DialogueBox();
        _csBox.persistent     = true;
        _csBox.onOptionSelect = _onNodeOptionSelected;
    }

    if (_cs.currentNodeId && _cs.currentNodeId !== _csLastNodeId) {
        const node = (typeof DIALOGUE_DATA !== 'undefined') ? DIALOGUE_DATA[_cs.currentNodeId] : null;
        if (node) {
            _logDialogueBlockToRecap(
                _getActiveRecapDay(),
                `node:${_cs.currentNodeId}`,
                node.no_speaker_box ? null : (node.speaker || null),
                Array.isArray(node.content) ? node.content : []
            );
            const { text, highlight } = _parseContent(node.content);
            const assetKey = node.speaker ? (SPEAKER_PORTRAIT_MAP[node.speaker] || null) : null;
            const portrait = (assetKey && typeof assets !== 'undefined' && assets[assetKey])
                ? assets[assetKey] : null;
            // no_speaker_box: suppress name plate and portrait for narration-style nodes
            const _spk = node.no_speaker_box ? null : (node.speaker || null);
            const _prt = node.no_speaker_box ? null : portrait;
            // Empty no_speaker_box nodes (transition frames) — hide the box entirely
            if (node.no_speaker_box && (!text || text.trim() === '')) {
                _csBox.reset();
            } else {
                _csBox.trigger(text, _prt, _spk, node.options || null, highlight);
                if (node.instant_text) _csBox.skipToEnd();
            }
            _csBox.autoPlayMode = !!(node.duration && node.duration > 0);

            if (node.sfx) {
                const _sfxObj = (typeof _resolveSFX === 'function') ? _resolveSFX(node.sfx) : null;
                if (_sfxObj && typeof playSFX === 'function') playSFX(_sfxObj);
            }
            if (node.loop_sfx && typeof _resolveAndLoopSFX === 'function') {
                _resolveAndLoopSFX(node.loop_sfx);
            }
            if (node.stop_sfx && typeof _stopSFX === 'function') {
                _stopSFX(node.stop_sfx);
            }
            if (node.stop_all_audio && typeof _stopAllDialogueAudio === 'function') {
                _stopAllDialogueAudio();
            }
            if (node.music && typeof _playDialogueMusicTrack === 'function') {
                _playDialogueMusicTrack(node.music);
            }
            if (node.duration) {
                _csAutoAdvanceTimer = node.duration;
            } else {
                _csAutoAdvanceTimer = 0;
            }
            // bg_blur: lerp to target; no_fade snaps immediately
            if (node.bg_blur !== undefined) {
                _csBlurTarget = node.bg_blur;
                _csBlurActive = node.bg_blur > 0;
                if (node.no_fade) {
                    _csBlurIntensity = node.bg_blur;
                    if (node.bg_blur === 0 && typeof drawingContext !== 'undefined') drawingContext.filter = 'none';
                }
            }
            if (node.effect) {
                if (node.effect === 'blur_on') {
                    _csBlurActive = true;
                    if (_csBlurTarget === 0) _csBlurTarget = 8;
                } else if (node.effect === 'blur_off') {
                    _csBlurActive    = false;
                    _csBlurTarget    = 0;
                    _csBlurIntensity = 0;
                    if (typeof drawingContext !== 'undefined') drawingContext.filter = 'none';
                    _flashEffect.timer = _EFFECT_DURATION.flash;
                } else if (node.effect === 'flash') {
                    _flashEffect.timer = _EFFECT_DURATION.flash;
                } else if (node.effect === 'eye_blink') {
                    _screenEffect.type  = 'eye_blink';
                    _screenEffect.timer = _EFFECT_DURATION.eye_blink;
                } else if (_EFFECT_DURATION[node.effect]) {
                    _screenEffect.type  = node.effect;
                    _screenEffect.timer = _EFFECT_DURATION[node.effect];
                }
            }
            if (node.flash) {
                _flashEffect.timer = _EFFECT_DURATION.flash;
            }
            if (node.event === 'showcase' && node.item_id) {
                _showcase.active        = true;
                _showcase.itemName      = node.item_id;
                _showcase.timer         = 120;
                _showcase.pendingNextId = node.next_id || null;
            }

            if ((typeof currentDayID === 'number') && currentDayID === 5) {
                const _prevCtx = _csDay5VoiceCtx;
                if (node.speaker === 'VOICE')      _csDay5VoiceCtx = true;
                else if (node.speaker === 'CHARLOTTE') _csDay5VoiceCtx = false;
                if (_csDay5VoiceCtx !== _prevCtx) {
                    _flashEffect.timer = _EFFECT_DURATION.flash;
                    if (!_csDay5VoiceCtx) {
                        if (typeof _stopSFX === 'function') {
                            _stopSFX('heartbeat_short');
                            _stopSFX('heartbeat_climax');
                            _stopSFX('ambulance');
                        }
                        if (typeof BGM !== 'undefined') {
                            BGM.play('FinalDay');
                        }
                    }
                }
            }

            _csLastNodeId = _cs.currentNodeId;
        }
    }
    if (_csAutoAdvanceTimer > 0 && !_showcase.active) {
        _csAutoAdvanceTimer--;
        if (_csAutoAdvanceTimer <= 0) {
            const _autoNode = DIALOGUE_DATA[_cs.currentNodeId];
            if (_autoNode && _autoNode.next_id) {
                _cs.currentNodeId = _autoNode.next_id;
                _csLastNodeId = null;
            } else if (typeof _cs.onComplete === 'function') {
                _cs.onComplete();
            }
        }
    }

    _drawItemShowcase();
    _csBox.display();
    pop();
    _drawFlashOverlay();
    _drawEyeBlinkOverlay();
    _drawItemToast();
}

function _drawCutsceneBg() {
    let img = null;

    if (_cs.bg === 'hospital') {
        img = assets.csHospitalBg;
        if (img) {
            let bgS = max(width / img.width, height / img.height);
            imageMode(CENTER);
            image(img, width / 2, height / 2, img.width * bgS, img.height * bgS);
        } else {
            background(200, 210, 220);
        }

    } else if (_cs.bg === 'black') {
        background(0);

    }else if (_cs.bg === 'room') {
        if (typeof roomScene !== 'undefined' && roomScene) roomScene.display();
        if (typeof player    !== 'undefined' && player)    player.display();
        noStroke(); fill(0, 0, 0, 80); rectMode(CORNER); rect(0, 0, width, height);

    } else if (_cs.bg === 'news' || _cs.bg === 'news_broadcast') {
        let img = (typeof assets !== 'undefined') ? (assets.csNewsBg || null) : null;
        background(0);
        if (img) {
            let bgS = max(width / img.width, height / img.height) * 1.15;
            imageMode(CENTER);
            image(img, width / 2, height / 2, img.width * bgS, img.height * bgS);
        }
        noStroke(); fill(0, 0, 0, 100); rectMode(CORNER); rect(0, 0, width, height);

    } else if (_cs.bg === 'balloon_festival' || _cs.bg === 'ashton_court') {
        let img = (typeof assets !== 'undefined') ? (assets.csBalloonFestivalBg || null) : null;
        if (img) { let bgS = max(width/img.width, height/img.height); imageMode(CENTER); image(img, width/2, height/2, img.width*bgS, img.height*bgS); }
        else { background(100, 130, 180); }
        noStroke(); fill(0, 0, 0, 60); rectMode(CORNER); rect(0, 0, width, height);

    } else if (_cs.bg === 'operating_theatre' || _cs.bg === 'hospital_limbo') {
        let img = (typeof assets !== 'undefined') ? (assets.csOperatingTheatreBg || null) : null;
        if (img) { let bgS = max(width/img.width, height/img.height); imageMode(CENTER); image(img, width/2, height/2, img.width*bgS, img.height*bgS); }
        else { background(220, 230, 240); }
        noStroke(); fill(0, 0, 0, 80); rectMode(CORNER); rect(0, 0, width, height);

    } else if (_cs.bg === 'room_morning_rainy' || _cs.bg === 'room_morning_cloudy' || _cs.bg === 'room_morning') {
        if (typeof roomScene !== 'undefined' && roomScene) roomScene.display();
        if (typeof player    !== 'undefined' && player)    player.display();
        // Weather tint overlays: rainy=blue-grey, cloudy=grey, clear=dark
        if (_cs.bg === 'room_morning_rainy') {
            noStroke(); fill(20, 30, 60, 100); rectMode(CORNER); rect(0, 0, width, height);
        } else if (_cs.bg === 'room_morning_cloudy') {
            noStroke(); fill(40, 40, 50, 80); rectMode(CORNER); rect(0, 0, width, height);
        } else {
            noStroke(); fill(0, 0, 0, 60); rectMode(CORNER); rect(0, 0, width, height);
        }

    } else if (_cs.bg === 'bus') {
        let img = (typeof assets !== 'undefined') ? (assets.csBusBg || null) : null;
        if (img) { let bgS = max(width/img.width, height/img.height); imageMode(CENTER); image(img, width/2, height/2, img.width*bgS, img.height*bgS); }
        else { background(20, 20, 30); }
        noStroke(); fill(0, 0, 0, 60); rectMode(CORNER); rect(0, 0, width, height);

    } else if (_cs.bg === 'phone') {
        let busBg = (typeof assets !== 'undefined') ? (assets.csBusBg || null) : null;
        if (busBg) { let bgS = max(width/busBg.width, height/busBg.height); imageMode(CENTER); image(busBg, width/2, height/2, busBg.width*bgS, busBg.height*bgS); }
        else { background(20, 20, 30); }
        noStroke(); fill(0, 0, 0, 70); rectMode(CORNER); rect(0, 0, width, height);
        let phoneImg = (typeof assets !== 'undefined') ? (assets.csPhoneImg || null) : null;
        if (phoneImg) {
            const maxH = height * 0.80;
            const ratio = min(maxH / phoneImg.height, (width * 0.55) / phoneImg.width);
            imageMode(CENTER);
            image(phoneImg, width/2, height/2, phoneImg.width*ratio, phoneImg.height*ratio);
        }

    } else if (_cs.bg === 'hot_air_balloon') {
        let img = (typeof assets !== 'undefined') ? (assets.csBalloonHotAirBg || null) : null;
        if (img) { let bgS = max(width/img.width, height/img.height); imageMode(CENTER); image(img, width/2, height/2, img.width*bgS, img.height*bgS); }
        else { background(80, 100, 140); }
        noStroke(); fill(0, 0, 0, 60); rectMode(CORNER); rect(0, 0, width, height);

    } else if (_cs.bg === 'news_hospital') {
        let img = (typeof assets !== 'undefined') ? (assets.csNewsHospitalBg || null) : null;
        background(0);
        if (img) { let bgS = max(width/img.width, height/img.height) * 1.15; imageMode(CENTER); image(img, width/2, height/2, img.width*bgS, img.height*bgS); }
        noStroke(); fill(0, 0, 0, 80); rectMode(CORNER); rect(0, 0, width, height);

    } else if (_cs.bg === 'bg_float_street') {
        const _floatImg = (typeof assets !== 'undefined') ? assets.csFloatStreetBg : null;
        if (_floatImg) {
            const _bgS = max(width / _floatImg.width, height / _floatImg.height) * _csFloatZoom;
            imageMode(CENTER);
            image(_floatImg, width/2, height/2, _floatImg.width * _bgS, _floatImg.height * _bgS);
        } else { background(120, 160, 200); }
        if (_csFloatCrossfadeAlpha > 0) {
            const _irisOverlayImg = (typeof assets !== 'undefined') ? assets.csFloatIrisBg : null;
            if (_irisOverlayImg) {
                tint(255, Math.floor(_csFloatCrossfadeAlpha));
                const _iS = max(width / _irisOverlayImg.width, height / _irisOverlayImg.height);
                imageMode(CENTER);
                image(_irisOverlayImg, width/2, height/2, _irisOverlayImg.width * _iS, _irisOverlayImg.height * _iS);
                noTint();
            }
        }

    } else if (_cs.bg === 'bg_float_iris') {
        if (_csFloatCrossfadeAlpha < 255) {
            const _streetImg = (typeof assets !== 'undefined') ? assets.csFloatStreetBg : null;
            if (_streetImg) {
                const _sS = max(width / _streetImg.width, height / _streetImg.height);
                imageMode(CENTER);
                image(_streetImg, width/2, height/2, _streetImg.width * _sS, _streetImg.height * _sS);
            }
        }
        const _irisImg = (typeof assets !== 'undefined') ? assets.csFloatIrisBg : null;
        if (_irisImg) {
            tint(255, Math.floor(_csFloatCrossfadeAlpha));
            const _bgS = max(width / _irisImg.width, height / _irisImg.height);
            imageMode(CENTER);
            image(_irisImg, width/2, height/2, _irisImg.width * _bgS, _irisImg.height * _bgS);
            noTint();
        } else { background(120, 160, 200); }

    } else if (_cs.bg === 'bg_happy_end') {
        let img = (typeof assets !== 'undefined') ? (assets.csHappyEndBg || null) : null;
        if (img) { let bgS = max(width/img.width, height/img.height); imageMode(CENTER); image(img, width/2, height/2, img.width*bgS, img.height*bgS); }
        else { background(200, 230, 255); }
        noStroke(); fill(255, 255, 255, 30); rectMode(CORNER); rect(0, 0, width, height);

    } else { // 'library' (default)
        let img = (typeof assets !== 'undefined')
            ? (assets.csLibraryBg || assets.libraryBg || null) : null;
        if (img) {
            let bgS = max(width / img.width, height / img.height);
            imageMode(CENTER);
            image(img, width / 2, height / 2, img.width * bgS, img.height * bgS);
        } else {
            background(14, 11, 24);
        }
        noStroke(); fill(0, 0, 0, 100); rectMode(CORNER); rect(0, 0, width, height);
    }
}

/** Applies shake/dizzy/breath transform to the current drawing context (must be inside push/pop). */
function _tickAndApplyScreenEffect() {
    if (!_screenEffect.type || _screenEffect.timer <= 0) return;
    _screenEffect.timer--;
    if (_screenEffect.timer <= 0) { _screenEffect.type = null; return; }
    const t = _screenEffect.timer;
    if (_screenEffect.type === 'shake') {
        const intensity = map(t, _EFFECT_DURATION.shake, 0, 8, 0) * min(width / 1920, height / 1080);
        translate(random(-intensity, intensity), random(-intensity, intensity));
    } else if (_screenEffect.type === 'dizzy') {
        const prog = t / _EFFECT_DURATION.dizzy;
        const ecx = width / 2, ecy = height / 2;
        translate(ecx, ecy);
        rotate(sin(frameCount * 0.08) * 0.04 * prog);
        scale(1 + sin(frameCount * 0.07) * 0.015 * prog);
        translate(-ecx, -ecy);
    } else if (_screenEffect.type === 'breath') {
        const prog = t / _EFFECT_DURATION.breath;
        const ecx = width / 2, ecy = height / 2;
        translate(ecx, ecy);
        scale(1 + sin(frameCount * 0.07) * 0.025 * prog);
        translate(-ecx, -ecy);
    }
}

/** Draws a white fading overlay for the flash effect (full-screen, outside any transform). */
function _drawFlashOverlay() {
    if (_flashEffect.timer <= 0) return;
    _flashEffect.timer--;
    if (_flashEffect.timer <= 0) return;
    const a = constrain(map(_flashEffect.timer, _EFFECT_DURATION.flash, 0, 255, 0), 0, 255);
    noStroke(); fill(255, 255, 255, a); rectMode(CORNER); rect(0, 0, width, height);
}

/**
 * Slow 3-blink overlay for eye_blink effect (hospital awakening).
 * Each blink = 70 frames: 15f close → 10f hold → 45f open.
 * Blur clears progressively: blink 1 open → target 4; blink 2 open → target 0.
 */
function _drawEyeBlinkOverlay() {
    if (_screenEffect.type !== 'eye_blink' || _screenEffect.timer <= 0) return;
    const TOTAL = _EFFECT_DURATION.eye_blink; // 210
    const elapsed    = TOTAL - _screenEffect.timer;
    const CYCLE      = 70;
    const CLOSE_DUR  = 15, OPEN_START = 25; // hold=10f, open=45f
    const cycleNum   = Math.floor(elapsed / CYCLE);   // 0, 1, 2
    const cycleFrame = elapsed % CYCLE;

    if (cycleFrame === OPEN_START) {
        const blurTargets = [4, 0, 0];
        _csBlurTarget = blurTargets[Math.min(cycleNum, 2)];
        _csBlurActive = _csBlurTarget > 0;
    }

    let blinkAlpha = 0;
    if      (cycleFrame < CLOSE_DUR)   blinkAlpha = map(cycleFrame, 0, CLOSE_DUR, 0, 255);
    else if (cycleFrame < OPEN_START)  blinkAlpha = 255;
    else                               blinkAlpha = map(cycleFrame, OPEN_START, CYCLE, 255, 0);

    if (blinkAlpha > 0) {
        push(); noStroke(); fill(0, 0, 0, blinkAlpha); rectMode(CORNER); rect(0, 0, width, height); pop();
    }
}

/** Draws the obtained item image above the dialogue box with fade in/out. */
function _drawItemShowcase() {
    if (!_showcase.active) return;
    _showcase.timer--;
    if (_showcase.timer <= 0) {
        _showcase.active = false;
        if (_showcase.itemName) _showItemToast(_showcase.itemName);
        if (_showcase.pendingNextId) {
            _cs.currentNodeId = _showcase.pendingNextId;
            _csLastNodeId = null;
        } else if (typeof _cs.onComplete === 'function') {
            _cs.onComplete();
        }
        return;
    }
    const t = _showcase.timer;
    let a;
    if (t > 105) a = map(t, 120, 105, 0, 255);
    else if (t < 30) a = map(t, 30, 0, 255, 0);
    else a = 255;

    const itemImg = _getItemImage(_showcase.itemName);
    if (!itemImg) return;

    push();
    colorMode(RGB, 255);
    const cx   = width / 2;
    const cy   = height * 0.38;
    const maxSide = min(width, height) * 0.38;
    const ratio   = min(maxSide / itemImg.width, maxSide / itemImg.height);
    imageMode(CENTER);
    tint(255, a);
    image(itemImg, cx, cy, itemImg.width * ratio, itemImg.height * ratio);
    noTint();
    pop();
}

function startCinematicEnding(lines, onDone) {
    _isEndingActive = true;
    _endingLines = lines;
    _lineAlphas = new Array(lines.length).fill(0);
    _currentLine = 0;
    _endingTimer = 0;
    _onEndingDone = (typeof onDone === 'function') ? onDone : null;
    gameState.setState(STATE_CUTSCENE);
}

function drawCinematicEnding() {
    background(0);
    let s = min(width / 1920, height / 1080);
    
    push();
    textAlign(CENTER, CENTER);
    let f = (typeof fonts !== 'undefined') ? (fonts.body || fonts.title) : null;
    if (f) textFont(f);
    textSize(28 * s);

    let lineHeight = 45 * s;
    let startY = height / 2 - (_endingLines.length * lineHeight) / 2;

    for (let i = 0; i < _endingLines.length; i++) {
        if (i === _currentLine) {
            _lineAlphas[i] = min(_lineAlphas[i] + 3, 255);
            if (_lineAlphas[i] >= 255) {
                _endingTimer++;
                if (_endingTimer > 60) { 
                    _currentLine++;
                    _endingTimer = 0;
                }
            }
        } else if (i < _currentLine) {
            _lineAlphas[i] = 255;
        }

        fill(255, _lineAlphas[i]);
        text(_endingLines[i], width / 2, startY + i * lineHeight);
    }

}
