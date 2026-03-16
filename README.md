<div align="center">

<img src="ArtAsset/ReadMe/divider.png" width="100%" />

<br>

# Park Street Survivor

<p>
  <img src="https://img.shields.io/badge/Language-JavaScript-b8c1ec?style=for-the-badge&logo=javascript&logoColor=white" />
  <img src="https://img.shields.io/badge/Library-p5.js-eebbc3?style=for-the-badge&logo=p5.js&logoColor=ed538b" />
  <img src="https://img.shields.io/badge/Host-GitHub_Pages-b8c1ec?style=for-the-badge&logo=github&logoColor=white" />

<br>

<img src="ArtAsset/ReadMe/game_screenshot.png" width="860" style="border-radius: 16px; border: 3px solid #b8c1ec;" alt="Park Street Survivor – Game Screenshot" />

<br><br>

> *"Sprint through the fragmented memories of a Bristol CS graduate: A 5-day surrealist journey on Park Street where every gift from the past shapes your ultimate choice — to wake up or to fade away."*

<br>

<div align="center">

[![Project Site](https://img.shields.io/badge/Project%20Site-eebbc3?style=for-the-badge&logoColor=white)](https://charlotteyu-47.github.io/2026-group-7/)
[![Play Game](https://img.shields.io/badge/Play%20Game-7c3aed?style=for-the-badge&logoColor=white)](https://charlotteyu-47.github.io/2026-group-7/pss/)

</div>

<br>

<img src="ArtAsset/ReadMe/divider.png" width="100%" />

</div>

<br>

<a name="group-members"></a>
<h2 align="center">Group Members</h2>

<div align="center">

<br><br>

| Role | Name | Email |
|:---:|:---:|:---:|
| **Core Mechanism Designer， Scripts Designer** | Charlotte Yu | fe22207@bristol.ac.uk |
| **Aesthetic Designer， Scripts Designer** | Lucca Zhou | pn25381@bristol.ac.uk |
| **Level Designer， Scripts Designer** | Ray Wang | nz25771@bristol.ac.uk |
| **UI/UX & Audio Designer， Scripts Designer** | Layla Pei | jj25661@bristol.ac.uk |

</div>

<br>

<p align="center"><img src="docs/assets/team/member_pic.png" width="80%" alt="Team photo" /></p>

<img src="ArtAsset/ReadMe/divider.png" width="100%" />

<br>

<a name="table-of-contents"></a>
<h2 align="center">Table of Contents</h2>

<div align="center">

| # | Section | Description |
|:---:|:---:|:---|
| 00 | [Labs](#labs) | Weekly lab tasks & documentation |
| 01 | [Introduction](#introduction) | Game overview & what makes it novel |
| 02 | [Requirements](#requirements) | Ideation, use cases & user stories |
| 03 | [Design](#design) | System architecture & class diagrams |
| 04 | [Implementation](#implementation) | Key technical challenges |
| 05 | [Evaluation](#evaluation) | Qualitative & quantitative testing |
| 06 | [Process](#process) | Team workflow & reflection |
| 07 | [Evaluation](#conclusion) | Lessons learnt & future work |
| 08 | [Contribution](#contribution) | Individual contributions |

</div>

<br>

<img src="ArtAsset/ReadMe/divider.png" width="100%" />

<br>

<a name="labs"></a>
<h2 align="center">Labs</h2>

<div align="center">

| Week | Title | Documentation |
|:---:|:---|:---:|
| 01 | **Lab 1: List of Game Ideas** | [📂 ReadMe](./docs/Labs/Week_1_List_of_Ideas/README.md) |
| 02 | **Lab 2: Paint System & Game Brainstorming** | [📂 ReadMe](./docs/Labs/Week_2_Paint_App/README.md) |
| 07 | **Lab 7: Think Aloud Study & Heuristic Evaluation** | [📂 ReadMe](./docs/Labs/Week_7_Evaluation/README.md) |
| 08 | **Lab 8: NASA Task Load Index & SUS** | [📂 ReadMe](./docs/Labs/Week_8_Evaluation_2/NASATLX&SUS.md) |

</div>

<br>

<img src="ArtAsset/ReadMe/divider.png" width="100%" />

<br>

<a name="introduction"></a>
<h2 align="center">Introduction</h2>

Our game is a narrative-driven endless runner that combines fast-paced parkour gameplay with interactive storytelling. The core gameplay is inspired by classic mobile runners such as Temple Run and Subway Surfers, where players must continuously avoid obstacles and manage limited resources while moving forward. However, unlike traditional runner games that focus purely on reflex-based challenges, our game integrates a strong narrative layer and light puzzle elements.

The visual style takes inspiration from the warm pixel-art aesthetics of Stardew Valley and the bold UI presentation of Persona 5. On the narrative side, the story structure draws influence from the psychological tension of Shutter Island and the character-driven storytelling of Persona 5.

The key twist of our game is the integration of story progression within the runner mechanics. Each run represents a fragment of the protagonist’s daily routine, and the player gradually uncovers narrative clues while navigating obstacles. This creates a hybrid experience where movement, exploration, and story discovery are tightly connected.

The story takes place during an ordinary week in Bristol. The protagonist, Iris, begins each day just like any other student: packing her backpack, rushing through crowded streets, avoiding traffic, and trying to reach class before the bell rings. Along the way, she encounters familiar faces, unexpected events, and fragments of hidden stories.

What initially appears to be a normal routine slowly becomes something more mysterious. As the week unfolds, Iris begins to notice that each day may not be as ordinary as it seems. What stories will she uncover, and what choices will she ultimately make?

<br>

<img src="ArtAsset/ReadMe/divider.png" width="100%" />

<br>

<a name="requirements"></a>
<h2 align="center">Requirements</h2>

<p align="center"><i>15% &nbsp;·&nbsp; ~750 words</i></p>

Early stages design. Ideation process. How did you decide as a team what to develop? Use case diagrams, user stories.<br>
**2.1 Early Design and Ideation**<br>

At the beginning of the project, each team member proposed several potential game concepts, including Park Street Survivor, Pico Park, Plants vs Zombies, Tableturf Battle, and The Strongest Support. To evaluate these ideas systematically, the team developed a scoring table that assessed each proposal according to four criteria: creativity, implementation difficulty, gameplay interest, and extensibility. After several rounds of discussion and voting, Park Street Survivor (PSS) was selected as the final concept. Compared with the other proposals, PSS achieved higher scores in originality and long-term expandability, as it represented a completely original game idea rather than a direct adaptation of an existing title.

In addition to the scoring results, practical constraints such as development time, technical feasibility, and the team’s programming experience were also considered during the decision process. A runner-style game was viewed as a manageable structure that allows clear gameplay loops while still providing opportunities for creative design.

The high-level design goal of the project was to create an original game that reflects everyday experiences such as commuting to school or work. The game aims to provide short, low-pressure play sessions that can entertain players during brief breaks, while gradually introducing narrative elements that encourage reflection beyond the immediate gameplay.

After the core concept was established, the team began analysing system requirements by identifying stakeholders and refining gameplay features into epics and user stories.

todo:
- Stakeholers(onion model)
- Epics
- Functional requirements
- Non-function requirements
- User Stories
- Use case diagram


<br>

<img src="ArtAsset/ReadMe/divider.png" width="100%" />

<br>

<a name="design"></a>
<h2 align="center">Design</h2>

<p align="center"><i>15% &nbsp;·&nbsp; ~750 words</i></p>

System architecture. Class diagrams, behavioural diagrams.

### Class Diagram

The diagram is colour-coded by system layer. Each colour group is summarised below.

| Colour | Category | Classes |
|--------|----------|---------|
| ![#FFECF2](https://placehold.co/14x14/FFECF2/FFECF2.png) Pink | **Engine** | `SketchCore` |
| ![#F3E9FF](https://placehold.co/14x14/F3E9FF/F3E9FF.png) Purple | **State / Config** | `GameState`, `GlobalConfig` |
| ![#FFF9E5](https://placehold.co/14x14/FFF9E5/FFF9E5.png) Yellow | **Menu** | `MainMenu`, `TimeWheel` |
| ![#FFF0E5](https://placehold.co/14x14/FFF0E5/FFF0E5.png) Peach | **UI Components** | `UIButton`, `UISlider`, `DialogueBox` |
| ![#E0F7F1](https://placehold.co/14x14/E0F7F1/E0F7F1.png) Mint | **Scene** | `RoomScene`, `BackpackVisual` |
| ![#E1F5FE](https://placehold.co/14x14/E1F5FE/E1F5FE.png) Blue | **Gameplay** | `Player`, `Environment`, `ObstacleManager`, `LevelController`, `ProceduralLevel`, `TutorialLevel`, `FeedbackLayer` |
| ![#EDE7F6](https://placehold.co/14x14/EDE7F6/EDE7F6.png) Lavender | **Data** | `InventorySystem`, `DialogueData` |
| ![#FFF3E0](https://placehold.co/14x14/FFF3E0/FFF3E0.png) Amber | **Narrative** | `CutsceneModule` |
| ![#E8F5E9](https://placehold.co/14x14/E8F5E9/E8F5E9.png) Green | **Audio** | `BGMManager` |
| ![#FCE4EC](https://placehold.co/14x14/FCE4EC/FCE4EC.png) Rose | **Persistence** | `SaveSystem`, `LeaderboardManager` |
| ![#FFEBE9](https://placehold.co/14x14/FFEBE9/FFEBE9.png) Red | **End Screens** | `EndScreenBase`, `FailScreen`, `SuccessScreen`, `EndScreenManager` |
| ![#F5F5F5](https://placehold.co/14x14/F5F5F5/F5F5F5.png) Grey | **Dev Tools** | `TestingPanel` |

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

<br>

<img src="ArtAsset/ReadMe/divider.png" width="100%" />

<br>

<a name="implementation"></a>
<h2 align="center">Implementation</h2>

<p align="center"><i>15% &nbsp;·&nbsp; ~750 words</i></p>

### Challenge 1: Complex State Management & Non-blocking Persistence

**Problem Context:** The game engine must seamlessly transition between 19 heterogeneous scene states (e.g., menus, gameplay runs, dialogues) within a strict 60 FPS render loop. This introduced three critical engineering bottlenecks:

1. State transitions are prone to leaving cross-scene UI or audio side-effect bleeding.
2. Transient data (e.g., equipped utility items) is easily lost upon a run failure and restart.
3. Frequent synchronous calls to `localStorage` for data synchronisation block the main thread, resulting in severe frame drops (jank) during gameplay.

**Solutions & Implementation Examples:**

1. **Centralised Routing & State Caching (Centralised FSM):** We orchestrated all system side-effects (e.g., BGM toggling, UI visibility) centrally within `GameState.setState()`, replacing scattered state handling across individual Scene classes.

   - *Example:* When handling the pause functionality, the engine writes the current state to `this.previousState` *only* upon entering `STATE_PAUSED`. The render layer reads this cached state ID to determine which scene context to draw beneath the pause overlay, eliminating the corruption caused by stacked pause states.

   <div align="center"><img src="docs/assets/implementation/1.3.1.gif" width="700" alt="Pausing from the Room scene — the Room background is preserved beneath the pause overlay and restored on resume" /><br><sub>Pausing from the Room scene preserves Room context</sub></div>
   <div align="center"><img src="docs/assets/implementation/1.3.2.gif" width="700" alt="Pausing from the gameplay run — the runner background is preserved beneath the pause overlay and restored on resume" /><br><sub>Pausing from the run scene preserves run context</sub></div>

2. **Cross-scene In-memory Payload:** We designed a lightweight payload mechanism to allow transient data to bypass strict lifecycle boundaries.

   - *Example:* Transient data (e.g., the player's equipped utility item: name, charges, armed state) is snapshotted via `saveRunUtilityItemSnapshot()` on the `GameState` instance before a run begins. On restart, the system deliberately bypasses `clearRunUtilityItemSnapshot()`, allowing item state to persist across run failures without re-entering the room scene.

3. **Non-blocking Auto-save & Atomic Restore:** We embedded `SaveSystem.tick()` directly into the `draw()` loop, utilising timestamps to implement a 3000ms in-frame debounce. This guarantees zero frame drops during background data persistence.

   - *Example:* When loading a save file, `applyAndResume()` enforces a strict two-phase atomic restore: it mandates fully writing all global variables before invoking `setupRun()` to initialise the scene. Executed within the `triggerTransition()` fade-to-black callback, this perfectly circumvents any intermediate-state rendering glitches caused by incompletely loaded data.

---

### Challenge 2: Node-based Narrative Engine & Dynamic Logic Injection

**Problem Context:** Hardcoding narrative scripts, UI rendering, and state transitions tightly together inevitably leads to severe logical coupling. The narrative engine requires "state-aware" capabilities (e.g., dispensing utility items or triggering specific endings at exact dialogue nodes) and must support agile branch modifications. Furthermore, it is critical to eliminate the performance overhead caused by redundant node parsing within the high-frequency render loop.

**Solutions & Implementation Examples:**

1. **Strict MVC Decoupling:** We completely separated the presentation logic from the script content, forming the foundational architecture of the narrative system and ensuring the engine remains agnostic to the data.

   - *Example:* `dialogue_data.js` (Model) purely declares text and identifiers; `Cutscene.js` (Engine) polls node IDs frame-by-frame; and `DialogueBox` (View) strictly receives parsed parameters to execute the typewriter rendering.

2. **Two-level Stateless Logic Injection:** To prevent circular dependencies, the data layer strictly holds no references to the engine. Instead, it implements a tiered injection system based on the weight of the side-effects.

   - *Example:* For **lightweight Event injection** (e.g., `event: "showcase"`), the data layer purely declares intent; the engine internally takes over the state machine and automatically advances the node. For **heavyweight Action injection** (e.g., triggering an ending via `action: "good_ending"`), the engine constructs a string-to-closure hydration layer via `_resolveNodeAction()`. This enforces lazy binding, instantiating the callback strictly when the player actively clicks the option, keeping the data layer fully serialisable and engine-agnostic: a closure can only exist in a loaded runtime, but a string can be stored, diffed, and version-controlled.

   <div align="center"><img src="docs/assets/implementation/2.2.1.gif" width="700" alt="A dialogue node triggers the item showcase animation — the utility item fades in at centre screen, then a received toast slides in from the corner" /><br><sub>event: "showcase" fires the item showcase pipeline, followed by the item-received toast</sub></div>

3. **Graph Routing & Dirty Checking:** We utilised a directed graph structure to manage narrative nodes and implemented performance interception within the render loop.

   - *Example:* Nodes are assigned globally unique IDs. Modifying a `next_id` seamlessly reconnects narrative branches, drastically improving the efficiency of iterating the script based on HCI evaluation feedback. Additionally, the engine executes dirty checking in the main `draw()` loop using `_csLastNodeId` (`currentNodeId !== _csLastNodeId`). Content parsing and `DialogueBox` resets are triggered *only* when the node ID genuinely changes. This completely eradicates the performance penalty of redundantly triggering the typewriter animation frame-after-frame.

   <div align="center"><img src="docs/assets/implementation/2.1.1.gif" width="700" alt="Player selects Option 1 at the branch node — the dialogue follows the Option 1 path through its unique sequence of nodes" /><br><sub>Selecting Option 1 — unique branch path via next_id graph traversal</sub></div>
   <div align="center"><img src="docs/assets/implementation/2.1.2.gif" width="700" alt="Player selects Option 2 at the same branch node — the dialogue diverges into a completely different sequence of nodes" /><br><sub>Selecting Option 2 — diverges into a distinct node sequence from the same branch point</sub></div>

---

### Challenge3: Procedural Obstacle Generation and Fairness Control<br>

**Problem Context**

Obstacle generation was one of the most technically demanding systems in the game because it directly influences gameplay fairness, difficulty progression, and player experience. The game features both a finite story-driven mode and an endless mode derived from it. In the story mode, each in-game day must present a distinct difficulty profile while still respecting narrative pacing. Meanwhile, the endless mode extends the same system indefinitely.

Naïve random spawning quickly produced undesirable results: obstacles could overlap spatially, block all safe lanes, or appear in repetitive sequences that made the gameplay feel biased. Conversely, overly restrictive spawning rules reduced unpredictability and created long empty intervals with little challenge. The obstacle generator therefore needed to balance randomness, fairness, and pacing while handling multiple obstacle types with different behaviours (vehicles, NPC hazards, and buffs).

**Engineering Difficulties**

- The first technical challenge involved spatial conflicts during spawning. Pure random placement frequently produced overlapping obstacles or conflicting lane usage, which appeared visually incorrect and sometimes created unavoidable failures.

- A second issue emerged when randomness was constrained too aggressively. While safety checks reduced unfair situations, they also increased the likelihood of repetitive patterns or long empty intervals, making the gameplay feel slow and predictable.

- A further difficulty came from the heterogeneous behaviour of obstacle types. Moving vehicles, static obstacles, and collectible buffs follow different gameplay rules, and the system must ensure that their appearance rates remain balanced across different days and difficulty levels.

**Solution Architecture and Implamentation**

To resolve these issues we developed a multi-stage procedural spawning pipeline coordinated by an ObstacleManager. The system progressively applies constraints and control mechanisms to transform raw randomness into controlled gameplay events.

- The first layer enforces spatial validity. Before confirming a spawn, the system checks lane spacing and bounding box separation, ensuring that obstacles do not overlap and that specific obstacle types only appear in permitted lanes. Mutual exclusion rules further prevent logically conflicting combinations.

- The second layer introduces controlled randomness. Instead of simple random selection, obstacle types are chosen through weighted probabilities combined with diversity penalties that reduce the likelihood of recently spawned types. Certain high-impact hazards also enforce minimum appearance intervals.

- A third layer manages spawn rhythm and difficulty progression. Each level is composed of five predefined difficulty modes arranged in a sequence to form a difficulty curve. Within each mode, symbolic spawn patterns regulate when hazards may appear, preventing both excessive clustering and extended empty periods.

Finally, the system applies runtime fairness validation before committing a spawn. These checks ensure that at least one safe lane remains available and estimate whether the player retains sufficient reaction time based on obstacle speed and scrolling velocity. Buffs are handled through an independent timer-based control system that regulates spawn frequency and provides emergency recovery items when player health becomes critically low.

<div align="center"><img src="docs/assets/implementation/3.1.1.gif" width="700" alt="Parkour clips from Day 5" /><br><sub>Parkour clips from Day 5</sub></div>




<br>

<img src="ArtAsset/ReadMe/divider.png" width="100%" />

<br>

<a name="evaluation"></a>
<h2 align="center">Evaluation</h2>
<p align="center"><i>15% &nbsp;·&nbsp; ~750 words</i></p>
- One qualitative evaluation (of your choice)
- One quantitative evaluation (of your choice)
- Description of how code was tested

<h3>Qualitative Evaluation: Think Aloud & Heuristic Evaluation</h3> 

We performed a qualitative audit through two primary lenses: a **Think Aloud study** to observe real-time player mental models, and a **Heuristic Evaluation** based on Nielsen’s 10 Principles to identify expert-level UI friction.

<p align="center">
<img width="1022" height="546" alt="image" src="https://github.com/user-attachments/assets/b4db3cbf-3ebc-4c6c-ab17-4cc67bdbc2f0" />
</p>
<p align="center" style="font-size: 0.7rem; color: #777;">
  Heuristic Evaluation form
</p>

**Key Findings:**

- **Semiotic Conflict (Think Aloud):** Participants repeatedly attempted to collide with Ice Cream and Kebab trucks, vocalizing: _"I thought these were shops for health."_ This violation of the "Food = Health" mental model led to unintended penalties.
    
- **Visibility of System Status (Heuristic Evaluation):** Experts flagged the HUD with a severity rating of 3.33. During high-intensity play, users developed "peripheral blindness," missing health updates while focusing on the character.
    
- **Navigation Issues:** Observations showed a "guidance vacuum" where players were unsure of their next objective, leading to stagnation in the room and street phases.
    

**Priority Improvement:** Synthesizing these findings, our primary qualitative goal is an **Integrated Guidance and Feedback Overhaul**.

- **Action Plan:** To resolve semiotic confusion, we are redesigning "Food Truck" hazards with explicit "danger" signifiers, such as flashing lights and darker palettes. To fix the visibility of system status, we implemented a **full-screen red filter** that activates upon taking damage, ensuring feedback is visible even when the player is focused on the character. Furthermore, we have added **yellow exclamation mark (!) icons** to point toward the next goal and integrated **in-game text prompts** and side-screen guidance to ensure the player's path is always clear.

<h3>Quantitative Evaluation: NASA-TLX & SUS</h3>

We conducted a **within-subjects study** with 12 participants to measure the perceived workload between "Easy Mode" and "Hard Mode." To mitigate **learning effects**, we utilized **counterbalancing**: Group 1 played from Easy to Hard, while Group 2 played in the reverse order.

**Data Analysis & Key Findings:** The NASA-TLX results (1–10 scale) revealed a significant intensity gap. The most dramatic shift occurred in **Temporal Demand**, which surged from a mean of 3.33 in Easy Mode to 7.08 in Hard Mode. This surge in "rushed" feelings directly impacted success, as **Performance** scores dropped from 8.17 to 5.25. Furthermore, Group 2 (who faced Hard Mode first) reported a **Frustration** mean of 5.5, significantly higher than Group 1’s 4.83. This indicates that without a mechanical introduction, the Hard Mode is currently too punishing for new players.
<p align="center">
  <img width="692" height="217" alt="temporal demand - easy mode" src="https://github.com/user-attachments/assets/1b4ac6ae-4e03-4335-aff3-d0a561876585" />
</p>
<p align="center" style="font-size: 0.7rem; color: #777;">
  Temporal Demand - Easy mode
</p>

<p align="center">
  <img width="703" height="222" alt="temporal demand - hard mode" src="https://github.com/user-attachments/assets/13e71abf-c71e-4e4e-8a20-b19e1652dfbc" />
</p>
<p align="center" style="font-size: 0.7rem; color: #777;">
  Temporal Demand - Hard mode
</p>


**Priority Improvement:** Based on these results, we are prioritizing a reduction in obstacle density for Hard Mode to bring the temporal demand into a more manageable range. Additionally, to address the frustration spikes seen in Group 2, we are implementing a **detailed, mandatory tutorial** before the game starts. This will ensure all players, regardless of their starting level, are guided through core mechanics and hazard identification before facing high-intensity gameplay.

<h3>Black-Box Testing</h3>

**1. Game Scene switching Test**
| Test Case | Input                                                                                 | Expected Output                                                                               |
| --------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 1.1       | Player enters the Main Menu and clicks START                                | Game switches to the SELECT DIFFICULTY page                                               |
| 1.2       | Player selects NORMAL in the SELECT DIFFICULTY page                         | Game switches to the  MODE confirmation page                                              |
| 1.3       | Player confirms the selected mode and chooses NEW GAME in the START GAME page | Game proceeds through the opening sequence and enters the TIME WHEEL level selection page |
| 1.4       | Player selects a date in the TIME WHEEL page                                | Game switches to the corresponding ROOM scene                                             |
| 1.5       | Player finishes interaction in the ROOM scene and starts the run            | Game switches to the DAY-RUN gameplay scene                                               |
| 1.6       | Player presses the pause key during DAY-RUN                                 | Game switches to the PAUSE SCREEN                                                         |
| 1.7       | Player selects EXIT in the PAUSE SCREEN                                     | Game returns to the MAIN MENU                                                             |

<p align="center">Table 1: Game Scene switching Test</p>

**2. Player Movement and Control Interaction Test**
| Test Case | Input                                                                             | Expected Output                                            |
| --------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 2.1       | Player presses W/S/A/D or arrow keys in the ROOM scene                      | Player character moves in the corresponding direction      |
| 2.2       | Player presses A/D or left/right arrow keys in DAY-RUN                      | Player character moves left or right accordingly           |
| 2.3       | Player presses P during DAY-RUN                                             | The PAUSE SCREEN is displayed                          |
| 2.4       | Player presses ESC while in a submenu or pause-related page                   | Game returns to the previous page                          |
| 2.5       | Player presses ENTER near the desk in the ROOM scene                      | Backpack page is opened                                    |
| 2.6       | Player presses SPACE when encountering a PUDDLE obstacle in DAY-RUN   | The obstacle is cleared successfully and the run continues |
| 2.7       | Player presses SPACE when encountering a removable obstacle such as PUDDLE or PROMOTER in DAY-RUN | The obstacle is cleared successfully and the run continues |

<p align="center">Table 2: Player Movement and Control Interaction Test</p>


**3. DAY-RUN Collision Test**
| Test Case | Input                                              | Expected Output                                                                     |
| --------- | -------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 3.1       | Player collides with a large vehicle obstacle  | Game ends immediately and the fail screen is displayed                              |
| 3.2       | Player collides with a small vehicle obstacle  | Player takes damage and the run continues if HP remains                             |
| 3.3       | Player collides with a scooter rider           | Player is temporarily stunned and movement response is delayed                      |
| 3.4       | Player collides with a homeless obstacle       | Player takes minor damage and is forced to change lane                              |
| 3.5       | Player collides with a small business obstacle | Player takes minor damage and the run continues                                     |
| 3.6       | Player collides with a puddle obstacle         | Player takes damage, is slowed down, and must clear the effect to continue normally |
| 3.7       | Player approaches a fantasy coffee obstacle    | The obstacle escapes instead of behaving like a normal collectible item             |

<p align="center">Table 3: DAY-RUN Collision Test</p>

**4. Item Collection and Backpack System Test**
| Test Case | Input                                                           | Expected Output                                                               |
| --------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 4.1       | Player collects a Coffee item during DAY-RUN                | Player's HP is restored and the run continues                                 |
| 4.2       | Player collects a Scooter item during DAY-RUN               | Player gains temporary speed boost and becomes resistant to most obstacles    |
| 4.3       | Player obtains items in the Library and enters the next run | Player can choose whether to carry an item in the ROOM backpack interface |
| 4.4       | Player carries an item into DAY-RUN                             | The corresponding item icon and remaining uses are displayed on the HUD   |
| 4.5       | Player presses E to use a carried backpack item             | The item effect is triggered and the remaining usage count decreases          |
| 4.6       | Player uses the last remaining charge of a backpack item        | The HUD icon returns to the default backpack icon                         |

<p align="center">Table 4: Item Collection and Backpack System Test</p>

**5. UI, Visual Feedback and Audio Test**
| Test Case | Input                                                                   | Expected Output                                                             |
| --------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 5.1       | Player navigates menu options in the Main Menu or Pause Screen  | The selected option is visually highlighted and changes accordingly         |
| 5.2       | Player selects a menu option                                            | A menu selection sound effect is played                                     |
| 5.3       | Player enters a new scene (e.g., ROOM, DAY-RUN, Success or Fail screen) | The corresponding background music is played                                |
| 5.4       | Player takes damage or collides with an obstacle                        | Visual hit feedback (such as impact effect or screen response) is displayed |
| 5.5       | Player carries an item during DAY-RUN                                   | The HUD correctly displays the item icon and usage information              |
| 5.6       | Player has no carried item                                              | The HUD displays the default backpack icon                                  |

<p align="center">Table 5: UI, Visual Feedback and Audio Test</p>

**6. Pause and Submenu Navigation Test**
| Test Case | Input                                                                                             | Expected Output                                          |
| --------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| 6.1       | Player presses P or clicks the Pause icon in the top-right corner during DAY-RUN      | The PAUSE SCREEN is displayed and gameplay is paused |
| 6.2       | Player presses ESC or clicks the Back icon in the top-left corner of the PAUSE SCREEN | The game returns to the DAY-RUN scene                |
| 6.3       | Player selects SETTING, HELP, or STORY in the PAUSE SCREEN                        | The corresponding submenu page is opened                 |
| 6.4       | Player selects EXIT in the PAUSE SCREEN                                                   | The game returns to the MAIN MENU                    |

<p align="center">Table 6: Pause and Submenu Navigation Test</p>

<h3>Conclusion</h3>

Black box testing confirmed that the main gameplay systems of Park Street Survivor function reliably. Scene transitions, player controls, collisions, item usage, and pause navigation behaved as expected during testing. UI elements, HUD indicators, and audio feedback responded correctly to player actions. Overall, the game demonstrated stable behaviour and a consistent gameplay experience.

<br>

<img src="ArtAsset/ReadMe/divider.png" width="100%" />

<br>

<a name="process"></a>
<h2 align="center">Process</h2>

<p align="center"><i>15% &nbsp;·&nbsp; ~750 words</i></p>

<h3>Team Structure and Role Definition</h3>
<p>
At the project's inception, we recognized that a clear division of labor was essential to prevent overlapping efforts and ensure accountability. We adopted a specialized role structure, ensuring each member had "ownership" over a specific pillar of the game’s development:
</p>

<ul>
<li><strong>Charlotte Yu (Core Mechanism Design):</strong> Focused on the physics engine, character movement, and the implementation of the unique health-depletion system.</li>
<li><strong>Lucca Zhou (Aesthetic Design):</strong> Responsible for the 3D environmental assets, character models, and ensuring a cohesive visual identity across all levels.</li>
<li><strong>Ray Wang (Level Design):</strong> Tasked with the architectural flow of the five levels, balancing the difficulty of obstacle placement with the frequency of power-ups.</li>
<li><strong>Layla Pei (UI/UX & Audio):</strong> Developed the head-up display (HUD), menu navigation, and the soundscape that provides feedback for health loss and coffee collection.</li>
</ul>

<h3>Methodology: Agile and Jira Integration</h3>
<p>
To manage our workflow, we adopted an <strong>Agile methodology</strong> centered around two-week sprints. Our primary command center was <strong>Jira</strong>, where we utilized a Kanban board to visualize the lifecycle of every task.
</p>

<p>
The process began with a comprehensive <strong>Product Backlog</strong>, where we listed every requirement—ranging from "Game Bakcground Art Asset" to "Refactor Narrative System to Data-Driven Architecture." During our sprint planning sessions, we moved high-priority "User Stories" from the backlog into the active sprint. This systematic approach allowed us to:
</p>

<ul>
<li><strong>Identify Bottlenecks:</strong> We could immediately see if Aesthetic Design was lagging behind Level Design, which prevented the placement of finalized assets into the game engine.</li>
<li><strong>Maintain Transparency:</strong> Every team member had real-time visibility into their peers' progress, significantly reducing the need for redundant status-update meetings.</li>
</ul>

<p>
<strong>Our Kanban Board:</strong> 
<a href="https://charlotteyu47.atlassian.net/jira/software/projects/PSS/boards/100?sprints=71&atlOrigin=eyJpIjoiNzcxZDYxMzk4YTY2NDY2NDhmZWFhZmY3ODliNWUwM2QiLCJwIjoiaiJ9" target="_blank">View our Jira Project here</a>
</p>

<br>

<img src="ArtAsset/ReadMe/divider.png" width="100%" />

<br>

<a name="conclusion"></a>
<h2 align="center">Conclusion</h2>

<p align="center"><i>10% &nbsp;·&nbsp; ~500 words</i></p>

Reflect on the project as a whole. Lessons learnt. Reflect on challenges. Future work — describe both immediate next steps for your current game and what you would potentially do if you had the chance to develop a sequel.

<br>

<img src="ArtAsset/ReadMe/divider.png" width="100%" />

<br>

<a name="contribution"></a>
<h2 align="center">Contribution Statement</h2>

<div align="center">

| Team Member | Primary Role | Contribution |
|:---:|:---|:---:|
| Charlotte Yu | Core Mechanism Design | 25% |
| Lucca Zhou | Aesthetic Design | 25% |
| Ray Wang | Level Design | 25% |
| Layla Pei | UI/UX & Audio | 25% |


</div>

<br>

<img src="ArtAsset/ReadMe/divider.png" width="100%" />

<div align="center">

<br>

<img src="https://img.shields.io/badge/Made%20with%20%E2%99%A5%20at-University%20of%20Bristol-c4b5fd?style=flat-square&labelColor=7c3aed" alt="Made at Bristol" />
&nbsp;
<img src="https://img.shields.io/badge/SEDP%202026-Group%207-c4b5fd?style=flat-square&labelColor=7c3aed" alt="Group 7" />

</div>
