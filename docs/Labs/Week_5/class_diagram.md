```mermaid
---
config:
  theme: base
  themeVariables:
    primaryColor: '#FADADD'
    primaryTextColor: '#5a0020'
    primaryBorderColor: '#FF85A1'
    lineColor: '#A0A0A0'
    fontSize: 13px
  layout: dagre
---
classDiagram
direction LR

    %% ══════════════════════════════════════════════════════════
    %% ENGINE / CORE
    %% ══════════════════════════════════════════════════════════

    class SketchCore {
        +int currentDayID
        +int currentUnlockedDay
        +bool developerMode
        +Object assets
        +Object fonts
        +Object globalFade
        +Object tutorialHints
        +Object titleDrop
        +float masterVolumeBGM
        +float masterVolumeSFX
        +Object bgms
        +preload() void
        +setup() void
        +draw() void
        +runGameLoop() void
        +triggerTransition(callback) void
        +setupRun(dayID) void
        +setupRunDirectly(dayID) void
        +renderGlobalFade() void
        +drawLoadingScreen() void
        +drawSplashScreen() void
        +drawOtherBgWithOverlay() void
        +drawPauseButton() void
        +renderPauseOverlay() void
        +renderStoryRecap() void
        +keyPressed() void
        +mousePressed() void
        +mouseReleased() void
        +mouseDragged() void
        +mouseMoved() void
    }

    class GameState {
        +int currentState
        +int previousState
        +String failReason
        +bool isFirstTimeInRoom
        +String runUtilityItemName
        +int runUtilityItemCharges
        +bool runUtilityItemArmed
        +setState(newState) void
        +resetFlags() void
        +saveRunUtilityItemSnapshot(name, charges, armed) void
        +clearRunUtilityItemSnapshot() void
    }

    class GlobalConfig {
        <<Module>>
        +int STATE_MENU
        +int STATE_LEVEL_SELECT
        +int STATE_SETTINGS
        +int STATE_ROOM
        +int STATE_DAY_RUN
        +int STATE_PAUSED
        +int STATE_FAIL
        +int STATE_WIN
        +int STATE_CUTSCENE
        +int STATE_CREDITS
        +int STATE_INVENTORY
        +int STATE_DIFF_SELECT
        +int STATE_LOAD_GAME
        +Object GLOBAL_CONFIG
        +Object PLAYER_DEFAULTS
        +Object DAYS_CONFIG
        +Object DIFFICULTY_PRESETS
    }

    %% ══════════════════════════════════════════════════════════
    %% MENU / UI
    %% ══════════════════════════════════════════════════════════

    class MainMenu {
        +int menuState
        +int helpPage
        +int difficultyIndex
        +int diffSelectIndex
        +int selectedDifficulty
        +int diffInfoShown
        +int loadGameIndex
        +bool isBGMMuted
        +bool isSFXMuted
        +float preMuteBGMVolume
        +float preMuteSFXVolume
        +TimeWheel timeWheel
        +UIButton[] buttons
        +UIButton backButton
        +UISlider bgmSlider
        +UISlider sfxSlider
        +display() void
        +setupButtons() void
        +handleBackAction() void
        +keyPressed(key) void
        +mousePressed() void
        +toggleBGMMute() void
        +toggleSFXMute() void
    }

    class TimeWheel {
        +Object daysConfig
        +int currentDayIndex
        +float bgAlpha
        +float cloudAlpha
        +Array drops
        +Object cloudDrop
        +float cloudScale
        +display() void
        +triggerEntrance() void
        +handleInput() void
        +renderCloudPreview() void
        +drawNavNode() void
        +drawDynamicBackground() void
        +drawSelectionArrows() void
        +drawMissionTitle() void
        +_updateDropPhysics() void
    }

    class UIButton {
        +float x
        +float y
        +float w
        +float h
        +String label
        +Function onClick
        +String fontKey
        +float currentScale
        +float targetScale
        +bool isFocused
        +update() void
        +display() void
        +isMouseOver() bool
        +handleClick() void
    }

    class UISlider {
        +float x
        +float y
        +float w
        +float min
        +float max
        +float value
        +String label
        +bool isDragging
        +display() void
        +update() void
        +getValue() float
        +setValue(val) void
        +handlePress() void
        +handleRelease() void
    }

    class DialogueBox {
        +bool persistent
        +bool autoPlayMode
        +bool active
        +String fullText
        +String speakerName
        +Image portraitImg
        +Object[] options
        +String[] highlight
        +int wordIndex
        +String displayedText
        +float wordTickMs
        +SoundFile typingSfx
        +reset() void
        +trigger(text, portrait, speaker, options, highlight) void
        +display() void
        +isActive() bool
        +isFinishedTyping() bool
        +skipToEnd() void
        -drawNineSlice(img, x, y, w, h, cap) void
        -drawPortraitMasked(img, x, y, w, h, r) void
        -resolvePortraitBySpeaker(name) Image
        -hasRenderablePortrait(img) bool
    }

    %% ══════════════════════════════════════════════════════════
    %% ROOM & INVENTORY
    %% ══════════════════════════════════════════════════════════

    class RoomScene {
        +float playerSpawnX
        +float playerSpawnY
        +Object walkableArea
        +Object carpetArea
        +float deskX
        +float deskY
        +float deskThreshold
        +float deskBoxW
        +float deskBoxH
        +float doorX
        +float doorY
        +float doorThreshold
        +bool isPlayerNearDesk
        +bool isPlayerNearDoor
        +int doorBlockTimer
        +String doorBlockMessage
        +DialogueBox dialogueBox
        +UIButton backButton
        +reset() void
        +isWalkable(x, y) bool
        +getValidPosition(nx, ny, ox, oy) Object
        +checkInteraction() void
        +display() void
        +drawInteractionIndicators() void
        +drawTutorialHints() void
        +drawDoorBlockedPrompt() void
    }

    class BackpackVisual {
        +InventorySystem inventory
        +RoomScene room
        +Object[] topSlots
        +Object[] scatteredItems
        +Object draggedItem
        +String dragSource
        +int dragIndex
        +bool backpackHighlight
        +Object itemZone
        +Object deskZone
        +Object itemFixedPositions
        +bool showReplaceDialog
        +Object replaceNewItem
        +int replaceSlotIndex
        +String messageText
        +int messageTimer
        +UIButton backButton
        +display() void
        +initScatteredItems() void
        +drawTopBar() void
        +drawScatteredItems() void
        +drawTooltip() void
        +drawReplaceDialog() void
        +handleMousePressed() void
        +handleMouseDragged() void
        +handleMouseReleased() void
        +tryAddToBackpack() void
        +executeReplace() void
        +hasRequiredItems() bool
        +getMissingRequiredItems() Array
        +showMessage(text) void
    }

    class InventorySystem {
        +Object[] items
        +int maxSlots
        +bool isVisible
        +addItem(itemData) bool
        +removeItem(index) void
        +display() void
        +drawSlots() void
        +handleKeyPress() void
    }

    %% ══════════════════════════════════════════════════════════
    %% GAMEPLAY — RUN PHASE
    %% ══════════════════════════════════════════════════════════

    class Player {
        +float x
        +float y
        +float width
        +float height
        +float hitboxW
        +float minX
        +float maxX
        +int currentLaneIndex
        +int targetLaneIndex
        +float laneVelocityX
        +float laneSpringK
        +float laneSpringDamping
        +bool leftHeld
        +bool rightHeld
        +String dir
        +float animFrame
        +bool isWalking
        +float health
        +float maxHealth
        +float healthDecay
        +float baseSpeed
        +float distanceRun
        +int playTimeFrames
        +int carHitCount
        +int coffeeCupCount
        +float[] runLaneCenters
        +update(scrollSpeed) void
        +display() void
        +applyHealthDecay() void
        +handleCollision(obstacle) void
        +takeDamage(amount) void
        +triggerGameOver() void
        +drawTopBar() void
        +drawClock() void
        +drawHealthBar() void
        +drawProgressBar() void
        +drawPauseIcon() void
        +resetStatsToDefault() void
        +applyLevelStats(dayID) void
        +handleRunMovement() void
        +handleRoomMovement() void
    }

    class Environment {
        +float scrollPos
        +int bgHeight
        +int centerX
        +Image defaultBg
        +Image[] defaultBgCycle
        +int defaultBgHeadIndex
        +Image destinationBg
        +Object layout
        +Object colors
        +Object victoryColors
        +Object[] victoryFireworks
        +int victoryFireworkCooldown
        +String weatherMode
        +Object[] raindrops
        +Object[] rainSplashes
        +update(speed) void
        +display() void
        +loadBackgrounds() void
        +configureWeather(themeKey) void
        +resetWeather() void
        +createRaindrop(spawnAnywhere) Object
        +updateWeather() void
        +drawWeatherOverlay() void
        +drawCenterLine(colors) void
        +drawVictoryMadeText(progress, isMoving) void
        +spawnVictoryFireworkBurst(cx, cy) void
        +getDefaultBgByTileIndex(i) Image
    }

    class ObstacleManager {
        +Object[] obstacles
        +int spawnTimer
        +Object currentLevelConfig
        +Object spriteCache
        +Object promoterInteraction
        +int promoterCooldownFramesRemaining
        +Object modeCycleState
        +Object spawnSchedulerState
        +int elapsedSpawnFrames
        +Object buffSpawnState
        +Object modeSwitchIndicator
        +Object hazardRhythmConfig
        +Object centerLaneFlowConfig
        +Object emergencyCoffeeConfig
        +Object emergencyCoffeeState
        +Object spawnSafety
        +setLevelConfig(config) void
        +update() void
        +spawnHazard() void
        +display() void
        +checkCollision(player) void
        +stopSpawning() void
        +secondsToFrames(s) int
    }

    class LevelController {
        +ProceduralLevel proceduralLevel
        +ProceduralLevel currentLevel
        +int currentDayID
        +String levelType
        +String levelPhase
        +float victoryStartScrollPos
        +float victoryPreRollDistance
        +int victoryZoneFrames
        +float victoryZoneStartY
        +bool failSettlementPending
        +String pendingFailReason
        +initializeLevel(dayID) bool
        +loadLevelBackgrounds(dayID) void
        +initializeProceduralLevel(dayID, config) void
        +applyDifficultyParameters(dayID) void
        +triggerVictoryPhase() void
        +getLevelPhase() String
        +resetRunPhaseState() void
        +update() void
        +display() void
    }

    class ProceduralLevel {
        +int dayID
        +Object config
        +bool setupDone
        +setup() void
        +update() void
        +display() void
        +reset() void
        +cleanup() void
        +getDifficultyConfig() Object
    }

    class TutorialLevel {
        +int dayID
        +Object config
        +String levelText
        +int frameCounter
        +int displayDuration
        +setup() void
        +update() void
        +display() void
        +reset() void
        +cleanup() void
    }

    class FeedbackLayer {
        +Object theme
        +int hitFlashFrames
        +int buffFlashFrames
        +int smallBusinessFlashFrames
        +int healthBarFlashFrames
        +int hitStopFrames
        +int cameraShakeFrames
        +float cameraShakeAmplitude
        +Object[] buffRipples
        +Object[] buffSpeedLines
        +Object[] smallBusinessRipples
        +int scooterStunFrames
        +Object sfxMap
        +onCollision(payload) void
        +onPickup(payload) void
        +update() void
        +display() void
    }

    %% ══════════════════════════════════════════════════════════
    %% NARRATIVE / CUTSCENE
    %% ══════════════════════════════════════════════════════════

    class CutsceneModule {
        <<Module>>
        +Object _cs
        +bool _cs.isNodeMode
        +String _cs.currentNodeId
        +String _cs.bg
        +Function _cs.onComplete
        +bool _cs.showingChoices
        +float _csFloatZoom
        +float _csFloatCrossfadeAlpha
        +bool _csDay5VoiceCtx
        +bool _isEndingActive
        +Object _screenEffect
        +Object _flashEffect
        +Object _showcase
        +bool _csBlurActive
        +float _csBlurIntensity
        +Object SPEAKER_PORTRAIT_MAP
        +startCutscene(bg, lines, onComplete) void
        +startCutsceneFromNode(nodeId, onComplete) void
        +csAdvance() void
        +drawCutsceneScreen() void
        +drawCinematicEnding() void
        +startCinematicEnding(lines, onDone) void
        +triggerGoodEnding() void
        -_resolveNodeAction(action) Function
        -_drawCutsceneBg() void
        -_drawEyeBlinkOverlay() void
        -_tickAndApplyScreenEffect() void
        -_parseContent(contentArray) Object
        -_onNodeOptionSelected(opt) void
        -_startShowcase(itemId) void
        -_showItemToast(itemName) void
    }

    class DialogueData {
        <<DataModule>>
        +Object DIALOGUE_DATA
        +Object prologue
        +Object day_room
        +Object day_npc_start
        +Object endings
        +Object awakening_reality
        +Object day1_npc_01..09
        +Object day2_npc_01..13
        +Object day3_npc_01..10
        +Object day4_npc_01..04
        +Object day5_szpital_01..12
        +Object day5_no_01..06
        +Object day5_yes_01..blk..end
        +Object day5_good_news_01..05c
        +Object day5_bad_news_01..05
    }

    %% ══════════════════════════════════════════════════════════
    %% AUDIO
    %% ══════════════════════════════════════════════════════════

    class BGMManager {
        <<Singleton>>
        -String _currentKey
        -String _cutsceneScene
        -bool _enabled
        -bool _isLocked
        +setCutsceneScene(scene) void
        +clearCutsceneScene() void
        +routeKey(state) String
        +play(key) void
        +stop() void
        +syncVolume() void
        +onStateChanged(state) void
        +setEnabled(enabled) void
        +getCurrentKey() String
        +getCutsceneScene() String
    }

    %% ══════════════════════════════════════════════════════════
    %% PERSISTENCE
    %% ══════════════════════════════════════════════════════════

    class SaveSystem {
        <<Singleton>>
        -int _lastSaveTime
        +save() void
        +load() Object
        +clear() void
        +hasSave() bool
        +tick() void
        +applyAndResume() void
        +formatTime(ms) String
    }

    class LeaderboardManager {
        +Object topScores
        +String currentPlayerId
        +Object lastSubmittedEntry
        +loadScores() void
        +saveScores() void
        +setPlayerId(id) bool
        +ensurePlayerIdForMode(mode) bool
        +getModeKey(mode) String
        +getModeLabel(key) String
        +getCurrentModeKey() String
        +submitEntry(score, day, frames) void
    }

    %% ══════════════════════════════════════════════════════════
    %% END SCREENS
    %% ══════════════════════════════════════════════════════════

    class EndScreenBase {
        <<Abstract>>
        +int selectedIndex
        +Object[] options
        +bool isActive
        +String stateStep
        +activate() void
        +drawOverlay() void
        +drawBox(bgImage) Object
        +drawProgressBar() void
        +drawButtons() void
        +handleKeyPress() void
        +handleClick() void
        +handleMouseMove() void
        +executeSelection() void
    }

    class FailScreen {
        +String failType
        +Object[] mainOptions
        +Object[] modeOptions
        +display() void
        +_getReasonText() String
        +executeSelection() void
    }

    class SuccessScreen {
        +Object[] mainOptions
        +Object[] modeOptions
        +display() void
        +executeSelection() void
    }

    class EndScreenManager {
        +Object failScreens
        +SuccessScreen successScreen
        +activateFail(type) void
        +activateSuccess() void
        +display() void
        +handleKeyPress() void
        +handleClick() void
        +handleMouseMove() void
    }

    %% ══════════════════════════════════════════════════════════
    %% DEBUG
    %% ══════════════════════════════════════════════════════════

    class TestingPanel {
        +bool visible
        +int selectedDay
        +Object layout
        +Object storyDebugData
        +bool showStoryDebugControls
        +String storyDebugActiveLayer
        +draw() void
        +handleClick(x, y) void
        +handleAction(actionId) void
        +drawCutscenePanel() void
        +drawBuffControlPanel() void
        +drawObstacleOverlay() void
        +drawStoryDebugPanel() void
        +drawLeaderboardPanel() void
    }

    %% ══════════════════════════════════════════════════════════
    %% STEREOTYPES
    %% ══════════════════════════════════════════════════════════

    <<Engine>>       SketchCore
    <<StateMachine>> GameState
    <<Module>>       GlobalConfig
    <<MenuController>> MainMenu
    <<LevelSelector>>  TimeWheel
    <<UIComponent>>    UIButton
    <<UIComponent>>    UISlider
    <<DialogueUI>>     DialogueBox
    <<Scene>>          RoomScene
    <<InventoryUI>>    BackpackVisual
    <<DataStore>>      InventorySystem
    <<Entity>>         Player
    <<WorldRenderer>>  Environment
    <<ObstacleSystem>> ObstacleManager
    <<LevelLifecycle>> LevelController
    <<LevelConfig>>    ProceduralLevel
    <<LevelConfig>>    TutorialLevel
    <<FeedbackSystem>> FeedbackLayer
    <<Module>>         CutsceneModule
    <<DataModule>>     DialogueData
    <<Singleton>>      BGMManager
    <<Singleton>>      SaveSystem
    <<Leaderboard>>    LeaderboardManager
    <<Abstract>>       EndScreenBase
    <<EndScreen>>      FailScreen
    <<EndScreen>>      SuccessScreen
    <<Manager>>        EndScreenManager
    <<DevTool>>        TestingPanel

    %% ══════════════════════════════════════════════════════════
    %% NOTES
    %% ══════════════════════════════════════════════════════════

    note for SketchCore "p5.js global draw-loop; owns all singleton instances,<br/>asset registry (images/sounds), and routes input<br/>to the active scene via state machine"
    note for GameState "Integer FSM: drives all scene transitions.<br/>Also carries run-utility-item snapshot for<br/>cross-scene buff continuity"
    note for GlobalConfig "Pure constants module: STATE_* integers,<br/>DAYS_CONFIG per-day tuning, PLAYER_DEFAULTS,<br/>and DIFFICULTY_PRESETS"
    note for MainMenu "Multi-screen menu: home, diff-select, diff-confirm,<br/>load-game, settings (audio sliders + mute), 4-page help,<br/>and scrolling credits with poem section"
    note for TimeWheel "Persona-5-style day navigator with staggered<br/>drop-in physics, cloud floating preview, and<br/>per-card BGM preview"
    note for DialogueBox "Typewriter VN-style box with nine-slice frame,<br/>masked portrait, word-by-word typing SFX,<br/>inline branch options, and auto-play mode"
    note for RoomScene "Bedroom scene: axis-separated AABB walkable<br/>collision, desk/door proximity detection,<br/>breathing tutorial hint icons"
    note for BackpackVisual "Drag-and-drop inventory: desk scatter zone to<br/>backpack slots, swap confirmation dialog,<br/>item tooltips, required-items check for door"
    note for Player "Spring-damper lane physics (laneSpringK/Damping),<br/>health/speed/distance tracking, walk-cycle<br/>animation, full HUD rendering"
    note for Environment "2-2-2 road renderer: multi-tile BG cycling,<br/>day/rain weather overlay with splash physics,<br/>victory firework particle burst"
    note for ObstacleManager "Complex spawn director: mode-cycle hazards,<br/>promoter interaction, buff items, center-lane flow,<br/>emergency coffee, rhythm-based spawn scheduling"
    note for LevelController "Level lifecycle: day routing to difficulty params to<br/>RUNNING to VICTORY_PRE_ROLL to VICTORY_ZONE<br/>with fail-settlement pending resolution"
    note for TutorialLevel "Day-1 tutorial variant: frame-counter based<br/>overlay text display with configurable duration"
    note for FeedbackLayer "Per-frame visual feedback: hit/buff flash,<br/>camera shake, ripple + speed-line particle<br/>effects, scooter stun overlay"
    note for CutsceneModule "Dual-mode narrative engine:<br/>Legacy array mode (prologue, day-room, Day 5)<br/>Node-graph mode (Days 1-4 NPC, good/bad endings)<br/>Supports screen effects, item showcase, bg crossfade"
    note for DialogueData "DIALOGUE_DATA node graph: ~300+ nodes for<br/>Days 1-5 NPC branches, szpital sequence,<br/>good/bad endings with action callbacks"
    note for BGMManager "Singleton audio router: maps game state +<br/>cutscene scene key to BGM track; handles<br/>lock during Day 5 VOICE opening sequence"
    note for SaveSystem "localStorage persistence: snapshot of day,<br/>unlocked progress, player stats, and run-utility<br/>item state; auto-tick every N frames"
    note for LeaderboardManager "Local high-score table: per-mode (casual/hard)<br/>top entries with player ID, score, day reached,<br/>and completion time"
    note for EndScreenBase "Abstract base: semi-transparent overlay,<br/>central result box with optional bg image,<br/>progress bar and keyboard/mouse navigation"
    note for FailScreen "Shows HIT_BUS / EXHAUSTED / LATE reason text<br/>with retry, change day, and main-menu options"
    note for SuccessScreen "Day-complete: hit count, optional leaderboard<br/>score submission, continue to next day or menu"
    note for EndScreenManager "Routes all input and display calls to the<br/>active FailScreen variant or SuccessScreen"
    note for TestingPanel "Overlay dev panel: jump to any state/day,<br/>trigger cutscenes/endings, live buff tweaking,<br/>obstacle overlay, story-node debug, leaderboard wipe"

    %% ══════════════════════════════════════════════════════════
    %% INHERITANCE
    %% ══════════════════════════════════════════════════════════

    FailScreen --|> EndScreenBase
    SuccessScreen --|> EndScreenBase
    TutorialLevel --|> ProceduralLevel

    %% ══════════════════════════════════════════════════════════
    %% COMPOSITION  (whole *-- part)
    %% ══════════════════════════════════════════════════════════

    MainMenu "1" *-- "1" TimeWheel
    MainMenu "1" *-- "3..*" UIButton
    MainMenu "1" *-- "2" UISlider
    EndScreenManager "1" *-- "3" FailScreen
    EndScreenManager "1" *-- "1" SuccessScreen
    LevelController "1" *-- "1" ProceduralLevel
    RoomScene "1" *-- "1" DialogueBox
    RoomScene "1" *-- "1" UIButton
    BackpackVisual "1" *-- "1" UIButton
    BackpackVisual "1" *-- "1" InventorySystem

    %% ══════════════════════════════════════════════════════════
    %% ASSOCIATIONS  (SketchCore owns all top-level singletons)
    %% ══════════════════════════════════════════════════════════

    SketchCore "1" --> "1" GameState
    SketchCore "1" --> "1" MainMenu
    SketchCore "1" --> "1" Player
    SketchCore "1" --> "1" Environment
    SketchCore "1" --> "1" ObstacleManager
    SketchCore "1" --> "1" LevelController
    SketchCore "1" --> "1" RoomScene
    SketchCore "1" --> "1" EndScreenManager
    SketchCore "1" --> "1" BackpackVisual
    SketchCore "1" --> "1" InventorySystem
    SketchCore "1" --> "1" FeedbackLayer
    SketchCore "1" --> "1" LeaderboardManager
    SketchCore "1" --> "1" SaveSystem
    SketchCore "1" --> "1" TestingPanel
    SketchCore "1" --> "1" BGMManager

    %% ── cross-system dependencies ────────────────────────────

    BackpackVisual --> RoomScene           : references
    Player --> LevelController             : signals_victory
    LevelController --> ObstacleManager    : stopSpawning
    LevelController --> Environment        : switchBackground
    ObstacleManager --> FeedbackLayer      : onCollision / onPickup
    ObstacleManager --> Player             : checkCollision
    BGMManager --> GameState               : listens_to_state
    SaveSystem --> GameState               : snapshots_state
    SaveSystem --> LevelController         : snapshots_progress
    CutsceneModule --> DialogueBox         : drives_text
    CutsceneModule --> DialogueData        : reads_nodes
    CutsceneModule --> BGMManager          : triggers_BGM
    CutsceneModule --> GameState           : setState_CREDITS
    TestingPanel --> CutsceneModule        : startCutsceneFromNode
    TestingPanel --> GameState             : setState_debug

    %% ══════════════════════════════════════════════════════════
    %% STYLES
    %% ══════════════════════════════════════════════════════════

    class SketchCore:::engine
    class GameState:::state
    class GlobalConfig:::state
    class MainMenu:::menu
    class TimeWheel:::menu
    class UIButton:::component
    class UISlider:::component
    class DialogueBox:::component
    class RoomScene:::scene
    class BackpackVisual:::scene
    class InventorySystem:::data
    class Player:::gameplay
    class Environment:::gameplay
    class ObstacleManager:::gameplay
    class LevelController:::gameplay
    class ProceduralLevel:::gameplay
    class TutorialLevel:::gameplay
    class FeedbackLayer:::gameplay
    class CutsceneModule:::narrative
    class DialogueData:::data
    class BGMManager:::audio
    class SaveSystem:::persistence
    class LeaderboardManager:::persistence
    class EndScreenBase:::endscreen
    class FailScreen:::endscreen
    class SuccessScreen:::endscreen
    class EndScreenManager:::endscreen
    class TestingPanel:::debug

    classDef engine      fill:#FFECF2,stroke:#FFB1C1,color:#7D3C4A,stroke-width:2px
    classDef state       fill:#F3E9FF,stroke:#D1B3FF,color:#5A4A75,stroke-width:2px
    classDef menu        fill:#FFF9E5,stroke:#FFE082,color:#6D5D30,stroke-width:2px
    classDef component   fill:#FFF0E5,stroke:#FFCCBC,color:#7E4E3A,stroke-width:2px
    classDef scene       fill:#E0F7F1,stroke:#B2DFDB,color:#2E5A56,stroke-width:2px
    classDef gameplay    fill:#E1F5FE,stroke:#B3E5FC,color:#375E71,stroke-width:2px
    classDef data        fill:#EDE7F6,stroke:#C5CAE9,color:#404468,stroke-width:2px
    classDef narrative   fill:#FFF3E0,stroke:#FFCC80,color:#6D4C1C,stroke-width:2px
    classDef audio       fill:#E8F5E9,stroke:#A5D6A7,color:#2E6B35,stroke-width:2px
    classDef persistence fill:#FCE4EC,stroke:#F48FB1,color:#7B2D42,stroke-width:2px
    classDef endscreen   fill:#FFEBE9,stroke:#FFCDD2,color:#803E3E,stroke-width:2px
    classDef debug       fill:#F5F5F5,stroke:#BDBDBD,color:#424242,stroke-width:2px,stroke-dasharray:4 2
```
