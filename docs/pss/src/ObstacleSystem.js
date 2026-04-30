// Hazard & Entity Management
// Responsibilities: Management of obstacle spawning, lifecycle, and collision detection logic.

const HAZARD_PATTERNS = {
    easy: [
        "..X...X.",
        ".X...X..",
        "...X....",
        "..X..X.."
    ],
    normal: [
        ".X.X.X..",
        "X..X..X.",
        ".XX...X.",
        "X.X...X."
    ],
    hard: [
        "X.X.XX.X",
        ".XXX..X.",
        "XX..XX..",
        "X.XX.X.X"
    ]
};

class ObstacleManager {
    constructor() {
        this.obstacles = [];
        this.spawnTimer = 0;

        this.currentLevelConfig = null;

        this.lastSpawnTime = 0;

        this.spriteCache = (typeof assets !== "undefined" && assets && assets.obstacleSprites)
            ? { ...assets.obstacleSprites }
            : {};

        this.promoterInteraction = {
            active: false,
            spacePressCount: 0,
            spacePressRequired: 10,  // number of SPACE presses needed to break free from promoter interaction
            overlaySpritePath: null,
            projectile: null
        };
        this.promoterCooldownFramesRemaining = 0;
        this.modeCycleState = null;
        this.spawnSchedulerState = null;
        this.elapsedSpawnFrames = 0;
        this.typeLastSpawnFrame = {};
        this.buffSpawnState = {
            timerFrames: 0,
            avgRespawnFrames: this.secondsToFrames(6),
            respawnJitter: 0,
            buffWeights: { COFFEE: 1, EMPTY_SCOOTER: 1 }
        };
        const globalSafetyDefaults = (GLOBAL_CONFIG && GLOBAL_CONFIG.spawnTuning && GLOBAL_CONFIG.spawnTuning.safety) || {};
        const globalCenterLaneFlowDefaults = (GLOBAL_CONFIG && GLOBAL_CONFIG.spawnTuning && GLOBAL_CONFIG.spawnTuning.centerLaneFlow) || {};
        const globalEmergencyCoffeeDefaults = (GLOBAL_CONFIG && GLOBAL_CONFIG.spawnTuning && GLOBAL_CONFIG.spawnTuning.emergencyCoffee) || {};
        const globalSpawnDirectorDefaults = (GLOBAL_CONFIG && GLOBAL_CONFIG.spawnTuning && GLOBAL_CONFIG.spawnTuning.spawnDirector) || {};
        const globalRhythmDefaults = (GLOBAL_CONFIG && GLOBAL_CONFIG.spawnTuning && GLOBAL_CONFIG.spawnTuning.hazardRhythm) || {};
        this.spawnSafetyDefaults = {
            topBandY: 520,
            laneGapHazard: 220,
            laneGapBuff: 130,
            laneGapSameTypeExtra: 70,
            safeLaneLookaheadY: 760,
            movingHazardMinScrollMultiplier: 1.10,
            ...globalSafetyDefaults
        };
        this.hazardRhythmDefaults = {
            densityMultiplier: 0.88,
            intervalJitter: 0.35,
            minIntervalFrames: 10,
            maxIntervalFrames: 180,
            patternStepSec: 0.4,
            maxEmptyTimeSec: 1.2,
            minReactionTimeSec: 1.05,
            spawnRetryFramesWhenBlocked: 8,
            diversityRerollChance: 0.72,
            sameTypePenaltyImmediate: 0.22,
            sameTypePenaltyRecent1: 0.62,
            sameTypePenaltyRecent2Plus: 0.38,
            recentTypeWindowSize: 4,
            laneRepeatBlockTypes: ["FANTASY_COFFEE"],
            centerLaneCoverageLookaheadY: 760,
            centerLaneCoverageMinBlocking: 1,
            centerLaneTypeBoostWhenSparse: 1.65,
            nonCenterLaneTypePenaltyWhenSparse: 0.72,
            centerLaneSpawnBiasWhenSparse: 2.10,
            edgeLaneSpawnPenaltyWhenSparse: 0.78,
            ...globalRhythmDefaults
        };
        this.spawnSafety = { ...this.spawnSafetyDefaults };
        this.hazardRhythmConfig = { ...this.hazardRhythmDefaults };
        this.hazardWeightMultiplier = {};
        this.centerLaneFlowDefaults = {
            enabled: false,
            smallCarType: "SMALL_CAR",
            largeCarType: "LARGE_CAR",
            largeCarChance: 0.22,
            alternateLanes: [2, 3],
            requireCenterSparse: true,
            triggerChanceWhenSparse: 1.0,
            minFramesBetweenFlowSpawns: 8,
            forceEveryHazardSpawn: false,
            ...globalCenterLaneFlowDefaults
        };
        this.centerLaneFlowConfig = { ...this.centerLaneFlowDefaults };
        this.centerLaneFlowState = { nextLaneIndex: 0, cooldownFrames: 0 };
        this.emergencyCoffeeDefaults = {
            enabled: false,
            enabledDays: [1, 2, 3],
            coffeeType: "COFFEE",
            healthThresholdRatio: 0.30,
            maxSpawnsPerRun: 2,
            minFramesBetweenEmergencySpawns: 300,
            retryFramesWhenBlocked: 20,
            ...globalEmergencyCoffeeDefaults
        };
        this.emergencyCoffeeConfig = { ...this.emergencyCoffeeDefaults };
        this.emergencyCoffeeState = {
            spawnedCount: 0,
            pending: false,
            cooldownFrames: 0
        };
        this.spawnDirectorDefaults = {
            enabled: true,
            minLaneGapHazard: 130,
            minLaneGapBuff: 95,
            sameTypeExtraGap: 40,
            speedGapPerUnit: 28,
            minOpenLanesAhead: 1,
            parallelLookaheadY: 700,
            parallelBandY: 130,
            parallelPenaltyPerObstacle: 0.6,
            speedVarietyPenaltySameClass: 0.82,
            speedVarietyBoostDifferentClass: 1.08,
            ...globalSpawnDirectorDefaults
        };
        this.spawnDirectorConfig = { ...this.spawnDirectorDefaults };
        this.lastHazardType = null;
        this.lastHazardLane = null;
        this.recentHazardTypes = [];
        this.fantasyCoffeeRunFrames = null;
        this.fantasyCoffeeRunFramesKey = "";
    }


    setLevelConfig(difficultyConfig) {
        this.currentLevelConfig = difficultyConfig;
        this.elapsedSpawnFrames = 0;
        this.typeLastSpawnFrame = {};
        this.lastHazardType = null;
        this.lastHazardLane = null;
        this.recentHazardTypes = [];
        this.applyDayRuntimeTuning();
        this.initializeModeCycleState(difficultyConfig);
        this.initializeBuffControlState(difficultyConfig);
    }

    applyDayRuntimeTuning() {
        const dayID = this.getActiveDayID();
        const dayCfg = (typeof DAYS_CONFIG !== "undefined" && DAYS_CONFIG) ? DAYS_CONFIG[dayID] : null;
        const safetyOverride = (dayCfg && dayCfg.spawnSafetyConfig && typeof dayCfg.spawnSafetyConfig === "object")
            ? dayCfg.spawnSafetyConfig
            : {};
        const rhythmOverride = (dayCfg && dayCfg.hazardRhythmConfig && typeof dayCfg.hazardRhythmConfig === "object")
            ? dayCfg.hazardRhythmConfig
            : {};
        const weightMulOverride = (dayCfg && dayCfg.hazardWeightMultiplier && typeof dayCfg.hazardWeightMultiplier === "object")
            ? dayCfg.hazardWeightMultiplier
            : {};
        const centerLaneFlowOverride = (dayCfg && dayCfg.centerLaneFlowConfig && typeof dayCfg.centerLaneFlowConfig === "object")
            ? dayCfg.centerLaneFlowConfig
            : {};
        const emergencyCoffeeOverride = (dayCfg && dayCfg.emergencyCoffeeConfig && typeof dayCfg.emergencyCoffeeConfig === "object")
            ? dayCfg.emergencyCoffeeConfig
            : {};
        const spawnDirectorOverride = (dayCfg && dayCfg.spawnDirectorConfig && typeof dayCfg.spawnDirectorConfig === "object")
            ? dayCfg.spawnDirectorConfig
            : {};

        this.spawnSafety = { ...this.spawnSafetyDefaults, ...safetyOverride };
        this.hazardRhythmConfig = { ...this.hazardRhythmDefaults, ...rhythmOverride };
        this.hazardWeightMultiplier = { ...weightMulOverride };
        this.centerLaneFlowConfig = { ...this.centerLaneFlowDefaults, ...centerLaneFlowOverride };
        this.centerLaneFlowState = { nextLaneIndex: 0, cooldownFrames: 0 };
        this.emergencyCoffeeConfig = { ...this.emergencyCoffeeDefaults, ...emergencyCoffeeOverride };
        this.emergencyCoffeeState = { spawnedCount: 0, pending: false, cooldownFrames: 0 };
        this.spawnDirectorConfig = { ...this.spawnDirectorDefaults, ...spawnDirectorOverride };
        if (!Array.isArray(this.hazardRhythmConfig.laneRepeatBlockTypes)) {
            this.hazardRhythmConfig.laneRepeatBlockTypes = [...(this.hazardRhythmDefaults.laneRepeatBlockTypes || [])];
        }
    }

    isEmergencyCoffeeEnabledForCurrentDay() {
        const cfg = this.emergencyCoffeeConfig || {};
        if (!cfg.enabled) return false;
        const day = this.getActiveDayID();
        const enabledDays = Array.isArray(cfg.enabledDays) ? cfg.enabledDays.map(v => Number(v)) : [];
        if (enabledDays.length === 0) return true;
        return enabledDays.includes(day);
    }

    hasObstacleTypeOnScreen(type) {
        if (!type) return false;
        return this.obstacles.some(o => o && o.type === type);
    }

    tryEmergencyCoffeeSpawning(canSpawn, playerRef) {
        const cfg = this.emergencyCoffeeConfig || {};
        const state = this.emergencyCoffeeState || { spawnedCount: 0, pending: false, cooldownFrames: 0 };
        this.emergencyCoffeeState = state;
        if (!this.isEmergencyCoffeeEnabledForCurrentDay()) return false;
        if (!playerRef) return false;

        if (state.cooldownFrames > 0) state.cooldownFrames--;

        const maxSpawns = Math.max(0, Math.floor(Number(cfg.maxSpawnsPerRun ?? 2)));
        if (state.spawnedCount >= maxSpawns) return false;

        const maxHealth = Math.max(1, Number(playerRef.maxHealth || PLAYER_DEFAULTS.baseHealth || 100));
        const curHealth = Math.max(0, Number(playerRef.health || 0));
        const ratio = curHealth / maxHealth;
        const threshold = constrain(Number(cfg.healthThresholdRatio ?? 0.30), 0, 1);

        if (ratio < threshold && state.cooldownFrames <= 0) {
            state.pending = true;
        }
        if (!state.pending) return false;
        if (!canSpawn) return false;

        const coffeeType = String(cfg.coffeeType || "COFFEE");
        if (this.hasObstacleTypeOnScreen(coffeeType)) return false;

        const spawned = this.spawnObstacle({ obstacleType: coffeeType });
        if (spawned) {
            state.spawnedCount++;
            state.pending = false;
            state.cooldownFrames = Math.max(
                0,
                Math.floor(Number(cfg.minFramesBetweenEmergencySpawns ?? 300))
            );
            return true;
        }

        state.cooldownFrames = Math.max(
            0,
            Math.floor(Number(cfg.retryFramesWhenBlocked ?? 20))
        );
        return false;
    }

    getCenterLaneFlowSpawnRequest() {
        const cfg = this.centerLaneFlowConfig || {};
        if (!cfg.enabled) return null;

        const lanePattern = Array.isArray(cfg.alternateLanes) && cfg.alternateLanes.length > 0
            ? cfg.alternateLanes.filter(v => Number(v) >= 1 && Number(v) <= 4).map(v => Number(v))
            : [2, 3];
        if (lanePattern.length === 0) return null;

        if (this.centerLaneFlowState && Number(this.centerLaneFlowState.cooldownFrames || 0) > 0) {
            this.centerLaneFlowState.cooldownFrames--;
            return null;
        }

        const requireSparse = cfg.requireCenterSparse !== false;
        const centerState = this.getCenterLaneCoverageState();
        if (requireSparse && !centerState.sparse) return null;
        if (!cfg.forceEveryHazardSpawn) {
            const chance = constrain(Number(cfg.triggerChanceWhenSparse ?? 1.0), 0, 1);
            if (Math.random() > chance) return null;
        }

        const smallType = String(cfg.smallCarType || "SMALL_CAR");
        const largeType = String(cfg.largeCarType || "LARGE_CAR");
        const largeChance = constrain(Number(cfg.largeCarChance ?? 0.28), 0, 1);

        const available = this.getHazardObstacleTypes(this.currentLevelConfig.availableObstacles || []);
        const chooseLarge = Math.random() < largeChance;
        let obstacleType = chooseLarge ? largeType : smallType;
        if (!available.includes(obstacleType)) {
            obstacleType = available.includes(smallType) ? smallType : (available.includes(largeType) ? largeType : null);
        }
        if (!obstacleType) return null;

        const laneIdx = this.centerLaneFlowState.nextLaneIndex % lanePattern.length;
        const primaryLane = lanePattern[laneIdx];
        const fallbackLanes = lanePattern.filter(v => v !== primaryLane);
        return { obstacleType, primaryLane, fallbackLanes };
    }

    getEffectiveHazardWeights(modeWeights, dynamicMultipliers = null) {
        const effective = modeWeights ? { ...modeWeights } : {};
        this._applyMultipliers(effective, this.hazardWeightMultiplier || {});
        if (dynamicMultipliers && typeof dynamicMultipliers === "object") {
            this._applyMultipliers(effective, dynamicMultipliers);
        }
        return effective;
    }

    // Multiplies each key in `weights` by the corresponding factor in `multipliers`.
    // Skips non-finite or negative multipliers; clamps results to >= 0.
    _applyMultipliers(weights, multipliers) {
        for (const key of Object.keys(multipliers)) {
            const mul = Number(multipliers[key]);
            if (!Number.isFinite(mul) || mul < 0) continue;
            const base = Number(weights[key] ?? 1.0);
            weights[key] = (Number.isFinite(base) ? Math.max(0, base) : 0) * mul;
        }
    }

    getCenterLaneCoverageState() {
        const lookaheadY = Number(this.hazardRhythmConfig.centerLaneCoverageLookaheadY ?? 760);
        const minBlocking = Math.max(0, Math.floor(Number(this.hazardRhythmConfig.centerLaneCoverageMinBlocking ?? 1)));
        let centerBlockingCount = 0;
        for (const obs of this.obstacles) {
            if (!this.isBlockingObstacle(obs)) continue;
            if (!obs || obs.y > lookaheadY) continue;
            if (obs.lane === 2 || obs.lane === 3) centerBlockingCount++;
        }
        return {
            sparse: centerBlockingCount < minBlocking,
            centerBlockingCount
        };
    }

    getRoadCoveragePressureMultipliers(candidates) {
        const result = {};
        if (!Array.isArray(candidates) || candidates.length === 0) return result;
        const centerState = this.getCenterLaneCoverageState();
        if (!centerState.sparse) return result;

        const roadTypeBoost = Math.max(0, Number(this.hazardRhythmConfig.centerLaneTypeBoostWhenSparse ?? 1.65));
        const nonRoadPenalty = Math.max(0, Number(this.hazardRhythmConfig.nonCenterLaneTypePenaltyWhenSparse ?? 0.72));
        for (const type of candidates) {
            const cfg = OBSTACLE_CONFIG[type] || {};
            const lanes = Array.isArray(cfg.allowedLanes) ? cfg.allowedLanes : [1, 2, 3, 4];
            const canSpawnInCenter = lanes.includes(2) || lanes.includes(3);
            result[type] = canSpawnInCenter ? roadTypeBoost : nonRoadPenalty;
        }
        return result;
    }

    getObstacleSpeedClassByType(type) {
        const cfg = OBSTACLE_CONFIG[type] || {};
        const speedCfg = cfg.speed || {};
        const speedMax = Number(speedCfg.max ?? speedCfg.min ?? 0);
        if (!Number.isFinite(speedMax) || speedMax <= 0.05) return "STATIC";
        if (speedMax < 0.7) return "SLOW";
        if (speedMax < 1.4) return "MEDIUM";
        return "FAST";
    }

    getSpeedVarietyMultipliers(candidates) {
        const result = {};
        if (!Array.isArray(candidates) || candidates.length === 0) return result;
        const lastType = this.lastHazardType;
        if (!lastType) return result;
        const director = this.spawnDirectorConfig || {};
        const lastClass = this.getObstacleSpeedClassByType(lastType);
        const samePenalty = Math.max(0, Number(director.speedVarietyPenaltySameClass ?? 0.82));
        const diffBoost = Math.max(0, Number(director.speedVarietyBoostDifferentClass ?? 1.08));
        for (const type of candidates) {
            const cls = this.getObstacleSpeedClassByType(type);
            result[type] = (cls === lastClass) ? samePenalty : diffBoost;
        }
        return result;
    }

    combineTypeMultipliers(candidates, maps) {
        const result = {};
        if (!Array.isArray(candidates) || candidates.length === 0) return result;
        for (const type of candidates) {
            let mul = 1;
            for (const m of (maps || [])) {
                if (!m || typeof m !== "object") continue;
                const v = Number(m[type] ?? 1);
                if (!Number.isFinite(v) || v < 0) continue;
                mul *= v;
            }
            result[type] = mul;
        }
        return result;
    }

    initializeModeCycleState(difficultyConfig) {
        const cfg = difficultyConfig && (difficultyConfig.difficultyModeCycleConfig || difficultyConfig.modeCycleConfig);
        const pattern = cfg && Array.isArray(cfg.modePattern) ? cfg.modePattern : [];
        const modes = cfg && cfg.modes ? cfg.modes : null;
        if (!modes || pattern.length === 0) {
            this.modeCycleState = null;
            return;
        }

        const windowSec = Number(cfg.windowSec || 5);
        const modeDisplayMap = (cfg && cfg.modeDisplayMap && typeof cfg.modeDisplayMap === "object")
            ? { ...cfg.modeDisplayMap }
            : {};
        for (const modeId of pattern) {
            if (modeDisplayMap[modeId] === undefined) modeDisplayMap[modeId] = modeId;
        }
        this.modeCycleState = {
            windowFrames: Math.max(1, this.secondsToFrames(windowSec)),
            pattern: [...pattern],
            modes: { ...modes },
            modeDisplayMap,
            elapsedFrames: 0,
            windowIndex: 0,
            currentModeId: pattern[0]
        };
        this.initializeSpawnScheduler(this.getActiveModeConfig(), this.modeCycleState.currentModeId);
    }

    updateModeCycleWindowProgress() {
        if (!this.modeCycleState) return;
        const state = this.modeCycleState;
        state.elapsedFrames++;
        const nextWindowIndex = Math.floor(state.elapsedFrames / state.windowFrames);
        if (nextWindowIndex === state.windowIndex) return;

        state.windowIndex = nextWindowIndex;
        const patternIndex = state.windowIndex % state.pattern.length;
        const nextModeId = state.pattern[patternIndex];
        if (nextModeId !== state.currentModeId) {
            state.currentModeId = nextModeId;
            this.initializeSpawnScheduler(this.getActiveModeConfig(), nextModeId, true);
        }
    }

    getActiveModeConfig() {
        if (!this.modeCycleState) return null;
        const modeId = this.modeCycleState.currentModeId;
        return this.modeCycleState.modes[modeId] || null;
    }

    isModeCycleEnabled() {
        return !!(this.modeCycleState && this.getActiveModeConfig());
    }

    buildDifficultyProfile(modeConfig, modeId = null) {
        const resolvedModeId = Number(modeId || (this.modeCycleState && this.modeCycleState.currentModeId) || 1);
        let patternPool = modeConfig && typeof modeConfig.patternPool === "string"
            ? modeConfig.patternPool
            : null;
        let speedMultiplier = Number(modeConfig && modeConfig.speedMultiplier);

        if (!patternPool) {
            if (resolvedModeId <= 2) patternPool = "easy";
            else if (resolvedModeId === 3) patternPool = "normal";
            else patternPool = "hard";
        }
        if (!Number.isFinite(speedMultiplier) || speedMultiplier <= 0) {
            if (resolvedModeId <= 1) speedMultiplier = 0.9;
            else if (resolvedModeId === 2) speedMultiplier = 1.0;
            else if (resolvedModeId === 3) speedMultiplier = 1.05;
            else speedMultiplier = 1.1;
        }

        return { patternPool, speedMultiplier };
    }

    initializeSpawnScheduler(modeConfig, modeId = null, resetPattern = false) {
        const stepSec = Math.max(0.2, Number(this.hazardRhythmConfig.patternStepSec ?? 0.4));
        const maxEmptySec = Math.max(stepSec, Number(this.hazardRhythmConfig.maxEmptyTimeSec ?? 1.2));
        const profile = this.buildDifficultyProfile(modeConfig, modeId);

        this.spawnSchedulerState = {
            currentPattern: resetPattern || !this.spawnSchedulerState ? null : this.spawnSchedulerState.currentPattern,
            lastPatternKey: resetPattern || !this.spawnSchedulerState ? "" : (this.spawnSchedulerState.lastPatternKey || ""),
            stepIndex: resetPattern || !this.spawnSchedulerState ? 0 : (this.spawnSchedulerState.stepIndex || 0),
            stepFrames: Math.max(1, this.secondsToFrames(stepSec)),
            stepCountdownFrames: 0,
            maxEmptyFrames: Math.max(1, this.secondsToFrames(maxEmptySec)),
            framesSinceLastHazardSpawn: 0,
            pendingSpawnRequests: 0,
            profile
        };
    }

    selectRhythmPattern(profile) {
        const poolName = profile && profile.patternPool ? profile.patternPool : "normal";
        const pool = Array.isArray(HAZARD_PATTERNS[poolName]) && HAZARD_PATTERNS[poolName].length > 0
            ? HAZARD_PATTERNS[poolName]
            : HAZARD_PATTERNS.normal;
        if (pool.length === 1) return pool[0];

        const lastPatternKey = this.spawnSchedulerState ? this.spawnSchedulerState.lastPatternKey : "";
        const candidates = pool.filter(p => p !== lastPatternKey);
        const source = candidates.length > 0 ? candidates : pool;
        return source[Math.floor(Math.random() * source.length)];
    }

    advancePatternSchedulerStep() {
        if (!this.spawnSchedulerState) return false;
        const state = this.spawnSchedulerState;
        if (!state.currentPattern) {
            state.currentPattern = this.selectRhythmPattern(state.profile);
            state.lastPatternKey = state.currentPattern;
            state.stepIndex = 0;
        }
        if (!state.currentPattern || state.stepIndex >= state.currentPattern.length) {
            state.currentPattern = null;
            state.stepIndex = 0;
            return false;
        }

        const symbol = state.currentPattern[state.stepIndex];
        state.stepIndex++;
        if (state.stepIndex >= state.currentPattern.length) {
            state.currentPattern = null;
            state.stepIndex = 0;
        }
        return symbol === "X";
    }

    initializeBuffControlState(difficultyConfig) {
        const dayID = Number((typeof currentDayID !== "undefined" && currentDayID) ? currentDayID : 1);
        const dayCfg = (typeof DAYS_CONFIG !== "undefined" && DAYS_CONFIG) ? DAYS_CONFIG[dayID] : null;
        // Buff control is owned by per-day global config only.
        const cfg = (dayCfg && dayCfg.buffControlConfig && typeof dayCfg.buffControlConfig === "object")
            ? dayCfg.buffControlConfig
            : {};
        const avgSecRaw = Number(cfg.avgRespawnSec || 6.0);
        const jitterRaw = Number(cfg.respawnJitter || 0);
        this.buffSpawnState.avgRespawnFrames = Math.max(1, this.secondsToFrames(Number.isFinite(avgSecRaw) ? avgSecRaw : 6.0));
        this.buffSpawnState.respawnJitter = Math.max(0, Math.min(1, Number.isFinite(jitterRaw) ? jitterRaw : 0));
        this.buffSpawnState.buffWeights = (cfg.buffWeights && typeof cfg.buffWeights === "object")
            ? { ...cfg.buffWeights }
            : { COFFEE: 1, EMPTY_SCOOTER: 1 };
        this.scheduleNextBuffSpawn();
    }

    scheduleNextBuffSpawn() {
        const avg = Math.max(1, Number(this.buffSpawnState.avgRespawnFrames || 1));
        const jitter = Math.max(0, Math.min(1, Number(this.buffSpawnState.respawnJitter || 0)));
        const factor = 1 + ((Math.random() * 2 - 1) * jitter);
        this.buffSpawnState.timerFrames = Math.max(1, Math.round(avg * factor));
    }

    getOnScreenCountByCategory(category) {
        if (!category) return 0;
        if (category === "BUFF") {
            return this.obstacles.filter(o => o && o.config && o.config.type === "BUFF").length;
        }
        return this.obstacles.filter(o => o && o.config && o.config.type !== "BUFF").length;
    }

    getTypeMinGapFrames(obstacleType, gapMap) {
        if (!gapMap || !obstacleType) return 0;
        const raw = Number(gapMap[obstacleType] || 0);
        if (!Number.isFinite(raw) || raw <= 0) return 0;
        return this.secondsToFrames(raw);
    }

    passesTypeMinGap(obstacleType, gapMap) {
        const requiredGap = this.getTypeMinGapFrames(obstacleType, gapMap);
        if (requiredGap <= 0) return true;
        const lastFrame = this.typeLastSpawnFrame[obstacleType];
        if (lastFrame === undefined) return true;
        return (this.elapsedSpawnFrames - lastFrame) >= requiredGap;
    }

    getVariantForObstacle(obstacleType) {
        if (!this.currentLevelConfig || !this.currentLevelConfig.variants) {
            return null;
        }

        const variantConfig = this.currentLevelConfig.variants[obstacleType];
        if (!variantConfig || !variantConfig.variantPool) {
            return null;
        }

        const pool = variantConfig.variantPool;
        const randomIndex = Math.floor(Math.random() * pool.length);
        return pool[randomIndex];
    }

    getBuffObstacleTypes(available) {
        return (available || []).filter(type => {
            const cfg = OBSTACLE_CONFIG[type];
            return cfg && cfg.type === "BUFF";
        });
    }

    getHazardObstacleTypes(available) {
        let hazards = (available || []).filter(type => {
            const cfg = OBSTACLE_CONFIG[type];
            return cfg && cfg.type !== "BUFF";
        });
        if (this.promoterCooldownFramesRemaining > 0) {
            hazards = hazards.filter(type => type !== "LARGE_CAR");
        }
        return hazards;
    }

    applyModeTypeGapFilter(candidates, modeConfig) {
        if (!modeConfig || !candidates || candidates.length === 0) return candidates || [];
        const typeGapMap = modeConfig.obTypeMinGapSec || {};
        return candidates.filter(type => this.passesTypeMinGap(type, typeGapMap));
    }

    selectDifficultyObstacle(modeConfig) {
        if (!this.currentLevelConfig || !this.currentLevelConfig.availableObstacles) return null;
        const available = this.currentLevelConfig.availableObstacles;
        let candidates = this.getHazardObstacleTypes(available);
        candidates = this.applyModeTypeGapFilter(candidates, modeConfig);
        const dynamicMultipliers = this.combineTypeMultipliers(candidates, [
            this.getRoadCoveragePressureMultipliers(candidates),
            this.getSpeedVarietyMultipliers(candidates)
        ]);
        const modeWeights = modeConfig && modeConfig.obWeights
            ? this.getEffectiveHazardWeights(modeConfig.obWeights, dynamicMultipliers)
            : this.getEffectiveHazardWeights(null, dynamicMultipliers);
        const picked = this.pickWeightedObstacle(candidates, modeWeights, { applyRecencyPenalty: true });
        if (!picked) return null;

        // Diversity guard: when alternatives exist, avoid immediate same-type repeats most of the time.
        if (picked === this.lastHazardType) {
            const nonRepeatCandidates = candidates.filter(t => t !== this.lastHazardType);
            const rerollChance = constrain(Number(this.hazardRhythmConfig.diversityRerollChance ?? 0.72), 0, 1);
            if (nonRepeatCandidates.length > 0 && Math.random() < rerollChance) {
                return this.pickWeightedObstacle(nonRepeatCandidates, modeWeights, { applyRecencyPenalty: true }) || picked;
            }
        }
        return picked;
    }

    selectBuffByControlConfig() {
        if (!this.currentLevelConfig || !this.currentLevelConfig.availableObstacles) return null;
        const available = this.currentLevelConfig.availableObstacles;
        const hasActiveBuffOnScreen = this.obstacles.some(o => o.config && o.config.type === "BUFF");
        if (hasActiveBuffOnScreen) return null;
        const buffTypes = this.getBuffObstacleTypes(available);
        return this.pickWeightedObstacle(buffTypes, this.buffSpawnState.buffWeights || null);
    }

    pickWeightedObstacle(candidates, weightOverrides = null, options = {}) {
        if (!candidates || candidates.length === 0) return null;
        const weights = weightOverrides || (this.currentLevelConfig && this.currentLevelConfig.obstacleWeights) || {};

        const normalized = candidates.map(type => {
            const raw = Number(weights[type] ?? 1.0);
            let weight = Number.isFinite(raw) ? Math.max(0, raw) : 0;
            if (options && options.applyRecencyPenalty) {
                let penalty = 1;
                if (type === this.lastHazardType) {
                    penalty *= Number(this.hazardRhythmConfig.sameTypePenaltyImmediate ?? 0.22);
                }
                const recentCount = this.recentHazardTypes.filter(t => t === type).length;
                if (recentCount === 1) {
                    penalty *= Number(this.hazardRhythmConfig.sameTypePenaltyRecent1 ?? 0.62);
                }
                if (recentCount >= 2) {
                    penalty *= Number(this.hazardRhythmConfig.sameTypePenaltyRecent2Plus ?? 0.38);
                }
                weight *= penalty;
            }
            return { type, weight };
        });

        let totalWeight = 0;
        for (const item of normalized) totalWeight += item.weight;
        if (totalWeight <= 0) {
            return candidates[Math.floor(Math.random() * candidates.length)];
        }

        let r = Math.random() * totalWeight;
        for (const item of normalized) {
            r -= item.weight;
            if (r <= 0) return item.type;
        }
        return normalized[normalized.length - 1].type;
    }


    selectRandomLane() {
        const lanes = [1, 2, 3, 4];
        return lanes[Math.floor(Math.random() * lanes.length)];
    }

    selectRandomAllowedLane(config) {
        const allowed = (config && config.allowedLanes && config.allowedLanes.length > 0)
            ? config.allowedLanes
            : [1, 2, 3, 4];
        return allowed[Math.floor(Math.random() * allowed.length)];
    }

    shuffleArray(values) {
        const out = [...(values || [])];
        for (let i = out.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = out[i];
            out[i] = out[j];
            out[j] = tmp;
        }
        return out;
    }

    getActiveDayID() {
        return Number((typeof currentDayID !== "undefined" && currentDayID) ? currentDayID : 1);
    }

    isBlockingObstacle(obs) {
        if (!obs || !obs.config) return false;
        if (obs.config.type === "BUFF") return false;
        // Fantasy coffee is visual deception and non-collidable in current design.
        if (obs.type === "FANTASY_COFFEE") return false;
        return true;
    }

    getBlockingLanesAhead(maxY = 760) {
        const occupied = new Set();
        for (const obs of this.obstacles) {
            if (!this.isBlockingObstacle(obs)) continue;
            if (!obs.lane) continue;
            if (obs.y <= maxY) occupied.add(obs.lane);
        }
        return occupied;
    }

    passesSpawnLaneGap(lane, obstacleType, obstacleSize, config, spawnSpeed = 0) {
        const newY = -obstacleSize.height;
        const topBandY = Number(this.spawnSafety.topBandY ?? 520);
        const director = this.spawnDirectorConfig || {};
        const baseGap = (config && config.type === "BUFF")
            ? Number((director.enabled ? director.minLaneGapBuff : this.spawnSafety.laneGapBuff) ?? 130)
            : Number((director.enabled ? director.minLaneGapHazard : this.spawnSafety.laneGapHazard) ?? 220);
        const sameTypeExtra = Number((director.enabled ? director.sameTypeExtraGap : this.spawnSafety.laneGapSameTypeExtra) ?? 70);
        const speedGapPerUnit = Number((director.enabled ? director.speedGapPerUnit : 0) ?? 0);

        for (const obs of this.obstacles) {
            if (!obs || obs.lane !== lane) continue;
            if (obs.y > topBandY) continue;

            const speedSum = Math.max(0, Number(spawnSpeed || 0) + Number(obs.speed || 0));
            let requiredGap = baseGap + (obstacleSize.height + (obs.height || 0)) * 0.34 + speedSum * speedGapPerUnit;
            if (obs.type === obstacleType) requiredGap += sameTypeExtra;
            const dy = Math.abs((obs.y || 0) - newY);
            if (dy < requiredGap) return false;
        }
        return true;
    }

    passesSpawnBoundingBoxGap(lane, obstacleSize) {
        const topBandY = Number(this.spawnSafety.topBandY || 520);
        const newX = GLOBAL_CONFIG.lanes[`lane${lane}`];
        const newY = -obstacleSize.height;
        const newHalfW = obstacleSize.width * 0.5;
        const newHalfH = obstacleSize.height * 0.5;
        const padding = 16;

        for (const obs of this.obstacles) {
            if (!obs) continue;
            if (obs.y > topBandY) continue;
            const dx = Math.abs((obs.x || 0) - newX);
            const dy = Math.abs((obs.y || 0) - newY);
            const minX = ((obs.width || 0) * 0.5) + newHalfW + padding;
            const minY = ((obs.height || 0) * 0.5) + newHalfH + padding;
            if (dx < minX && dy < minY) return false;
        }
        return true;
    }

    breaksSafeLaneRule(lane, config) {
        if (config && config.type === "BUFF") return false;
        const occupied = this.getBlockingLanesAhead(Number(this.spawnSafety.safeLaneLookaheadY ?? 760));
        occupied.add(lane);
        const director = this.spawnDirectorConfig || {};
        const minOpen = Math.max(1, Math.min(4, Math.floor(Number(director.minOpenLanesAhead ?? 1))));
        return (4 - occupied.size) < minOpen;
    }

    computeParallelSpawnPenalty(lane, obstacleSize) {
        const director = this.spawnDirectorConfig || {};
        if (!director.enabled) return 1;
        const lookaheadY = Number(director.parallelLookaheadY ?? 700);
        const bandY = Math.max(1, Number(director.parallelBandY ?? 130));
        const penaltyUnit = Math.max(0.05, Math.min(1, Number(director.parallelPenaltyPerObstacle ?? 0.6)));
        const newY = -obstacleSize.height;
        let nearbyParallelCount = 0;
        for (const obs of this.obstacles) {
            if (!this.isBlockingObstacle(obs)) continue;
            if (obs.y > lookaheadY) continue;
            if (obs.lane === lane) continue;
            if (Math.abs((obs.y || 0) - newY) > bandY) continue;
            nearbyParallelCount++;
        }
        return Math.pow(penaltyUnit, nearbyParallelCount);
    }

    selectSafeSpawnLane(config, obstacleType, obstacleSize, laneOptions = {}) {
        const allowed = (config && Array.isArray(config.allowedLanes) && config.allowedLanes.length > 0)
            ? config.allowedLanes
            : [1, 2, 3, 4];
        const forceLane = Number((laneOptions && laneOptions.forceLane) ?? 0);
        const spawnSpeed = Number((laneOptions && laneOptions.spawnSpeed) ?? 0);
        let lanePool = [...allowed];
        if (forceLane > 0) {
            if (!allowed.includes(forceLane)) return null;
            lanePool = [forceLane];
        }
        const shuffled = this.shuffleArray(lanePool);
        const repeatBlockTypes = Array.isArray(this.hazardRhythmConfig.laneRepeatBlockTypes)
            ? this.hazardRhythmConfig.laneRepeatBlockTypes
            : [];
        const centerState = this.getCenterLaneCoverageState();
        const centerBias = Math.max(0, Number(this.hazardRhythmConfig.centerLaneSpawnBiasWhenSparse ?? 2.10));
        const edgePenalty = Math.max(0, Number(this.hazardRhythmConfig.edgeLaneSpawnPenaltyWhenSparse ?? 0.78));
        const validLanes = [];
        for (const lane of shuffled) {
            // Avoid same-lane back-to-back repeats for configured obstacle types.
            if (repeatBlockTypes.includes(obstacleType) &&
                this.lastHazardType === obstacleType &&
                this.lastHazardLane === lane) {
                continue;
            }
            if (!this.passesSpawnLaneGap(lane, obstacleType, obstacleSize, config, spawnSpeed)) continue;
            if (!this.passesSpawnBoundingBoxGap(lane, obstacleSize)) continue;
            if (this.breaksSafeLaneRule(lane, config)) continue;
            let score = this.computeParallelSpawnPenalty(lane, obstacleSize);
            if (centerState.sparse) {
                score *= (lane === 2 || lane === 3) ? centerBias : edgePenalty;
            }
            if (score <= 0) continue;
            validLanes.push({ lane, score });
        }
        if (validLanes.length === 0) return null;

        const weighted = validLanes.map(item => ({ lane: item.lane, weight: Math.max(0, Number(item.score || 0)) }));
        let total = 0;
        for (const item of weighted) total += item.weight;
        if (total <= 0) return weighted[Math.floor(Math.random() * weighted.length)].lane;

        let r = Math.random() * total;
        for (const item of weighted) {
            r -= item.weight;
            if (r <= 0) return item.lane;
        }
        return weighted[weighted.length - 1].lane;
    }

    resolveSpritePath(config, variant, lane) {
        if (variant && variant.spriteBySide) {
            const side = lane <= 2 ? "left" : "right";
            return variant.spriteBySide[side] || variant.sprite || config.sprite || null;
        }
        return (variant && variant.sprite) ? variant.sprite : config.sprite;
    }

    chooseLaneForSpawn(config, obstacleType, obstacleSize, spawnSpeed = 0, forceLane = 0) {
        return this.selectSafeSpawnLane(config, obstacleType, obstacleSize, {
            forceLane,
            spawnSpeed
        });
    }

    passesReactionTimeSafety(obstacleType, obstacleSize, spawnSpeed = 0) {
        const config = OBSTACLE_CONFIG[obstacleType] || {};
        if (config.type === "BUFF") return true;

        const reactionTimeSec = Math.max(0.2, Number(this.hazardRhythmConfig.minReactionTimeSec ?? 1.05));
        const baseSpeed = PLAYER_DEFAULTS.baseSpeed;
        const effectiveScrollSpeed = Math.max(1, Number(GLOBAL_CONFIG.scrollSpeed || 12));
        let obstacleMoveSpeed = Number(spawnSpeed || 0) * baseSpeed;
        if (obstacleMoveSpeed <= 0.01) obstacleMoveSpeed = effectiveScrollSpeed;
        if (config.type !== "BUFF" && Number(spawnSpeed || 0) > 0) {
            obstacleMoveSpeed = Math.max(
                obstacleMoveSpeed,
                effectiveScrollSpeed * Number(this.spawnSafety.movingHazardMinScrollMultiplier ?? 1.10)
            );
        }

        const spawnY = -Math.max(1, Number(obstacleSize && obstacleSize.height ? obstacleSize.height : 100));
        const playerY = Number((typeof PLAYER_RUN_FOOT_Y !== "undefined" && PLAYER_RUN_FOOT_Y) ? PLAYER_RUN_FOOT_Y : 940);
        const distanceToReach = Math.max(1, playerY - spawnY);
        const timeToReach = distanceToReach / Math.max(1, obstacleMoveSpeed * 60);
        return timeToReach >= reactionTimeSec;
    }

    requestHazardSpawn(options = {}) {
        const modeConfig = this.getActiveModeConfig();
        if (!modeConfig || !this.spawnSchedulerState) return false;

        const forceLane = Number(options.forceLane || 0);
        const requestedObstacleType = options.obstacleType ? String(options.obstacleType) : null;
        const profile = this.spawnSchedulerState.profile || this.buildDifficultyProfile(modeConfig);
        let obstacleType = requestedObstacleType || this.selectDifficultyObstacle(modeConfig);
        if (!obstacleType) {
            return false;
        }

        const config = OBSTACLE_CONFIG[obstacleType];
        if (!config) return false;
        const variant = config.variants && config.variants.length > 0
            ? config.variants[Math.floor(Math.random() * config.variants.length)]
            : config.variants?.[0];
        const obstacleSize = (variant && variant.size) ? variant.size : config.size;
        const baseSpawnSpeed = Number(config.speed.min) + Math.random() * (Number(config.speed.max) - Number(config.speed.min));
        const spawnSpeed = Math.max(0, baseSpawnSpeed * Number(profile.speedMultiplier || 1));
        if (!this.passesReactionTimeSafety(obstacleType, obstacleSize, spawnSpeed)) return false;

        const lane = this.chooseLaneForSpawn(config, obstacleType, obstacleSize, spawnSpeed, forceLane);
        if (!lane) return false;

        const spawned = this.spawnObstacle({
            obstacleType,
            forceLane: lane,
            speedMultiplier: Number(profile.speedMultiplier || 1),
            speed: spawnSpeed,
            variant
        });
        if (!spawned) {
            return false;
        }

        if (this.centerLaneFlowState && forceLane > 0) {
            this.centerLaneFlowState.nextLaneIndex++;
            this.centerLaneFlowState.cooldownFrames = Math.max(
                0,
                Math.floor(Number(this.centerLaneFlowConfig.minFramesBetweenFlowSpawns ?? 8))
            );
        }
        this.spawnSchedulerState.framesSinceLastHazardSpawn = 0;
        return true;
    }

    tryModeCycleSpawning(canSpawn) {
        const modeConfig = this.getActiveModeConfig();
        if (!modeConfig || !this.spawnSchedulerState) return false;
        const state = this.spawnSchedulerState;
        state.framesSinceLastHazardSpawn++;

        let shouldRequestSpawn = false;
        if (state.stepCountdownFrames <= 0) {
            shouldRequestSpawn = this.advancePatternSchedulerStep() || shouldRequestSpawn;
            state.stepCountdownFrames = state.stepFrames;
        } else {
            state.stepCountdownFrames--;
        }

        const forceSpawnDueToEmpty = state.framesSinceLastHazardSpawn >= state.maxEmptyFrames;
        if (forceSpawnDueToEmpty) {
            shouldRequestSpawn = true;
        }
        if (!shouldRequestSpawn || !canSpawn) return false;

        const centerFlowReq = this.getCenterLaneFlowSpawnRequest();
        if (centerFlowReq) {
            const spawnedByFlow = this.requestHazardSpawn({
                obstacleType: centerFlowReq.obstacleType,
                forceLane: centerFlowReq.primaryLane
            }) || this.requestHazardSpawn({
                obstacleType: centerFlowReq.obstacleType,
                forceLane: (centerFlowReq.fallbackLanes && centerFlowReq.fallbackLanes[0]) || centerFlowReq.primaryLane
            });
            if (spawnedByFlow) return true;
        }

        const spawned = this.requestHazardSpawn();
        if (spawned) return true;

        if (forceSpawnDueToEmpty) {
            state.framesSinceLastHazardSpawn = Math.max(0, state.maxEmptyFrames - Math.floor(state.stepFrames * 0.5));
        }
        return false;
    }

    tryBuffTimedSpawning(canSpawn, playerRef) {
        if (!canSpawn) return;
        const emergencySpawned = this.tryEmergencyCoffeeSpawning(canSpawn, playerRef);
        if (emergencySpawned) {
            this.scheduleNextBuffSpawn();
            return;
        }
        if (!this.buffSpawnState) return;
        if (this.buffSpawnState.timerFrames > 0) {
            this.buffSpawnState.timerFrames--;
            return;
        }
        const buffType = this.selectBuffByControlConfig();
        if (!buffType) return;
        const spawned = this.spawnObstacle({ obstacleType: buffType });
        if (spawned) this.scheduleNextBuffSpawn();
    }


    spawnObstacle(options = {}) {
        if (!this.currentLevelConfig) return false;

        const normalized = options || {};
        const obstacleType = normalized.obstacleType;
        if (!obstacleType) return false;

        const config = OBSTACLE_CONFIG[obstacleType];
        if (!config) return false;


        const variantId = this.getVariantForObstacle(obstacleType);
        const variant = normalized.variant || (config.variants && config.variants.length > 0
            ? config.variants[Math.floor(Math.random() * config.variants.length)]
            : config.variants?.[0]);
        const obstacleSize = (variant && variant.size) ? variant.size : config.size;
        const speedMultiplier = Math.max(0, Number(normalized.speedMultiplier || 1));
        const providedSpeed = Number(normalized.speed);
        const spawnSpeed = Number.isFinite(providedSpeed)
            ? Math.max(0, providedSpeed)
            : (Number(config.speed.min) + Math.random() * (Number(config.speed.max) - Number(config.speed.min))) * speedMultiplier;
        const forcedLane = Number(normalized.forceLane ?? 0);
        const lane = this.selectSafeSpawnLane(config, obstacleType, obstacleSize, {
            forceLane: forcedLane,
            spawnSpeed
        });
        if (!lane) return false;

        const obstacle = {
            type: obstacleType,
            baseType: config.baseType,
            lane: lane,
            x: GLOBAL_CONFIG.lanes[`lane${lane}`],
            y: -obstacleSize.height,
            width: obstacleSize.width,
            height: obstacleSize.height,
            speed: spawnSpeed,
            damage: config.damage,
            effect: config.effect,
            variant: variant,
            spritePath: this.resolveSpritePath(config, variant, lane),
            config: config,
            variantId: variantId
        };

        if (obstacleType === "FANTASY_COFFEE") {
            obstacle.fantasyState = "DISGUISED";
            obstacle.escapeStartupFrames = 0;
            obstacle.runFrame = 0;
            obstacle.runFrameCounter = 0;
            obstacle.escapeVx = 0;
            obstacle.escapeVy = 0;
            obstacle.spritePath = config.disguiseSprite || obstacle.spritePath;
        }

        if (obstacleType === "HOMELESS") {
            obstacle.dialogue = this.getHomelessDialogueText(config);
        }

        if (obstacleType === "SCOOTER_RIDER") {
            obstacle.targetLane = lane;
            obstacle.laneMoveFramesTotal = 0;
            obstacle.laneMoveFramesRemaining = 0;
            obstacle.laneMoveStartX = obstacle.x;
            obstacle.laneMoveTargetX = obstacle.x;
            obstacle.proximityLaneChangeConsumed = false;
        }

        this.obstacles.push(obstacle);
        this.typeLastSpawnFrame[obstacleType] = this.elapsedSpawnFrames;
        if (config.type !== "BUFF") {
            this.lastHazardType = obstacleType;
            this.lastHazardLane = lane;
            this.recentHazardTypes.push(obstacleType);
            const recentWindowSize = Math.max(1, Math.floor(Number(this.hazardRhythmConfig.recentTypeWindowSize ?? 4)));
            if (this.recentHazardTypes.length > recentWindowSize) this.recentHazardTypes.shift();
        }
        return true;
    }

    update(scrollSpeed, player, levelPhase) {
        if (levelPhase !== "RUNNING" || !this.currentLevelConfig) {
            return;
        }

        this.elapsedSpawnFrames++;
        this.updateModeCycleWindowProgress();
        if (this.promoterCooldownFramesRemaining > 0) this.promoterCooldownFramesRemaining--;

        const lastObs = this.obstacles[this.obstacles.length - 1];
        const minObstacleInterval = (this.currentLevelConfig.spawnConfig && this.currentLevelConfig.spawnConfig.minObstacleInterval) || 0;
        const canSpawn = this.obstacles.length === 0 ||
            lastObs.y > minObstacleInterval;

        const spawnedByMode = this.tryModeCycleSpawning(canSpawn);
        this.tryBuffTimedSpawning(canSpawn && !spawnedByMode, player);

        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];

            this.updateDynamicLaneBehavior(obs, player);

            const baseSpeed = PLAYER_DEFAULTS.baseSpeed;
            let obsMoveSpeed = obs.speed * baseSpeed * (scrollSpeed / max(1, GLOBAL_CONFIG.scrollSpeed));
            // Stationary entities (speed=0) still need world scrolling to enter the screen.
            if (obsMoveSpeed <= 0.01) obsMoveSpeed = scrollSpeed;
            if (obs && obs.config && obs.config.type !== "BUFF" && Number(obs.speed || 0) > 0) {
                // Keep moving hazards visibly faster than background so they do not look frozen.
                const minMul = Number(this.spawnSafety.movingHazardMinScrollMultiplier ?? 1.10);
                obsMoveSpeed = Math.max(obsMoveSpeed, scrollSpeed * minMul);
            }
            obs.y += obsMoveSpeed;
            this.updateFantasyCoffeeBehavior(obs, player);

            if (obs.y > GLOBAL_CONFIG.resolutionH + 100) {
                this.obstacles.splice(i, 1);
                continue;
            }

            if (this.checkCollision(player, obs)) {
                const hasScooterBuff = !!(
                    player &&
                    typeof player.hasEmptyScooterBuffActive === "function" &&
                    player.hasEmptyScooterBuffActive()
                );

                // Scooter buff has one exception: promoter/homeless cancel the buff
                // without triggering their normal control effects.
                if (hasScooterBuff && (obs.type === "PROMOTER" || obs.type === "HOMELESS")) {
                    this.handleCollision(player, obs);
                    this.obstacles.splice(i, 1);
                    continue;
                }

                // All other non-buff obstacles are ignored while scooter buff is active.
                if (hasScooterBuff && obs.config && obs.config.type !== "BUFF") {
                    const promoterPosterActive =
                        (obstacleManager && obstacleManager.promoterInteraction && obstacleManager.promoterInteraction.active) || false;
                    if (!promoterPosterActive && obs.type !== "LARGE_CAR") {
                        if (typeof feedbackLayer !== "undefined" && feedbackLayer &&
                            typeof feedbackLayer.onCollision === "function") {
                            feedbackLayer.onCollision(obs.type, {
                                damage: 0,
                                effect: "scooterBrake",
                                scooterBrake: true,
                                playerX: player ? player.x : width / 2,
                                playerY: player ? player.y : height * 0.66
                            });
                        } else if (typeof sfxScooterBrake !== "undefined" && sfxScooterBrake) {
                            playSFX(sfxScooterBrake, { id: "scooter_brake", cooldownMs: 120, monophonic: true });
                        }
                    }
                    this.obstacles.splice(i, 1);
                    continue;
                }

                // Coffee hpLock invincibility keeps control effects responsive;
                // only bypass pure damage-style hits.
                if (player && typeof player.isInvincibleActive === "function" &&
                    player.isInvincibleActive() &&
                    obs.config && obs.config.type !== "BUFF" &&
                    !["leaflet", "forcedLaneSwitch", "stun"].includes(obs.config.effect)) {
                    this.obstacles.splice(i, 1);
                    continue;
                }

                this.handleCollision(player, obs);
                this.obstacles.splice(i, 1);
            }
        }

        this.updatePromoterProjectile(scrollSpeed);
    }

    display() {
        for (let obs of this.obstacles) {
            push();

            if (obs.type === "FANTASY_COFFEE") {
                this.displayFantasyCoffee(obs);
            } else if (obs.spritePath) {
                const img = this.getSpriteImage(obs.spritePath);
                if (img) {
                    imageMode(CENTER);
                    image(img, obs.x, obs.y, obs.width, obs.height);
                } else {
                    this.drawMissingSpritePlaceholder(obs);
                }
            } else {
                this.drawMissingSpritePlaceholder(obs);
            }

            if (obs.type === "HOMELESS" && obs.dialogue) {
                this.displayHomelessDialogueBubble(obs);
            }

            pop();
        }

    }

    exportStateSnapshot() {
        return {
            obstacles: this.obstacles.map(obs => ({
                type: obs.type,
                baseType: obs.baseType,
                lane: obs.lane,
                x: obs.x,
                y: obs.y,
                width: obs.width,
                height: obs.height,
                speed: obs.speed,
                damage: obs.damage,
                effect: obs.effect,
                spritePath: obs.spritePath,
                variant: obs.variant || null,
                variantId: obs.variantId || null,
                fantasyState: obs.fantasyState,
                escapeStartupFrames: obs.escapeStartupFrames,
                runFrame: obs.runFrame,
                runFrameCounter: obs.runFrameCounter,
                escapeVx: obs.escapeVx,
                escapeVy: obs.escapeVy,
                dialogue: obs.dialogue,
                targetLane: obs.targetLane,
                laneMoveFramesTotal: obs.laneMoveFramesTotal,
                laneMoveFramesRemaining: obs.laneMoveFramesRemaining,
                laneMoveStartX: obs.laneMoveStartX,
                laneMoveTargetX: obs.laneMoveTargetX,
                proximityLaneChangeConsumed: obs.proximityLaneChangeConsumed
            })),
            promoterCooldownFramesRemaining: this.promoterCooldownFramesRemaining,
            elapsedSpawnFrames: this.elapsedSpawnFrames,
            typeLastSpawnFrame: { ...this.typeLastSpawnFrame },
            lastHazardType: this.lastHazardType,
            lastHazardLane: this.lastHazardLane,
            recentHazardTypes: Array.isArray(this.recentHazardTypes) ? this.recentHazardTypes.slice() : [],
            modeCycleState: this.modeCycleState ? JSON.parse(JSON.stringify(this.modeCycleState)) : null,
            spawnSchedulerState: this.spawnSchedulerState ? JSON.parse(JSON.stringify(this.spawnSchedulerState)) : null,
            buffSpawnState: this.buffSpawnState ? JSON.parse(JSON.stringify(this.buffSpawnState)) : null,
            centerLaneFlowState: this.centerLaneFlowState ? JSON.parse(JSON.stringify(this.centerLaneFlowState)) : null,
            emergencyCoffeeState: this.emergencyCoffeeState ? JSON.parse(JSON.stringify(this.emergencyCoffeeState)) : null
        };
    }

    restoreStateSnapshot(snapshot) {
        if (!snapshot) return;

        this.obstacles = Array.isArray(snapshot.obstacles) ? snapshot.obstacles.map(raw => {
            const config = OBSTACLE_CONFIG[raw.type];
            return {
                ...raw,
                config: config || null
            };
        }).filter(Boolean) : [];

        this.promoterInteraction = {
            active: false,
            spacePressCount: 0,
            spacePressRequired: 10,
            overlaySpritePath: null,
            projectile: null
        };
        this.promoterCooldownFramesRemaining = Number.isFinite(Number(snapshot.promoterCooldownFramesRemaining))
            ? Math.max(0, Number(snapshot.promoterCooldownFramesRemaining))
            : 0;
        this.elapsedSpawnFrames = Number.isFinite(Number(snapshot.elapsedSpawnFrames))
            ? Math.max(0, Number(snapshot.elapsedSpawnFrames))
            : 0;
        this.typeLastSpawnFrame = snapshot.typeLastSpawnFrame ? { ...snapshot.typeLastSpawnFrame } : {};
        this.lastHazardType = snapshot.lastHazardType || null;
        this.lastHazardLane = Number.isFinite(Number(snapshot.lastHazardLane)) ? Number(snapshot.lastHazardLane) : null;
        this.recentHazardTypes = Array.isArray(snapshot.recentHazardTypes) ? snapshot.recentHazardTypes.slice() : [];
        this.modeCycleState = snapshot.modeCycleState ? JSON.parse(JSON.stringify(snapshot.modeCycleState)) : this.modeCycleState;
        this.spawnSchedulerState = snapshot.spawnSchedulerState ? JSON.parse(JSON.stringify(snapshot.spawnSchedulerState)) : this.spawnSchedulerState;
        this.buffSpawnState = snapshot.buffSpawnState ? JSON.parse(JSON.stringify(snapshot.buffSpawnState)) : this.buffSpawnState;
        this.centerLaneFlowState = snapshot.centerLaneFlowState ? JSON.parse(JSON.stringify(snapshot.centerLaneFlowState)) : this.centerLaneFlowState;
        this.emergencyCoffeeState = snapshot.emergencyCoffeeState ? JSON.parse(JSON.stringify(snapshot.emergencyCoffeeState)) : this.emergencyCoffeeState;
    }

    getHomelessDialogueText(config) {
        const dayID = Number((typeof currentDayID !== "undefined" && currentDayID) ? currentDayID : 1);
        if (config && config.dialoguesByDay && config.dialoguesByDay[dayID]) {
            return config.dialoguesByDay[dayID];
        }
        if (config && config.defaultDialogue) return config.defaultDialogue;
        return "";
    }

    displayHomelessDialogueBubble(obs) {
        const textContent = String(obs.dialogue || "").trim();
        if (!textContent) return;

        // 510×200 source image; displayed at fixed scaled size
        const IMG_W = 300;
        const IMG_H = Math.round(IMG_W * (200 / 510)); // ≈ 118
        // Bias the bubble closer to center so it reads as attached to the character,
        // not hanging too far to one side.
        const TAIL_TIP_X = Math.round(IMG_W * 0.42);
        const BODY_FRAC = 0.78;   // main body occupies top 78 % of the image
        const PAD_X = Math.round(IMG_W * 0.07);        // ≈ 21
        const PAD_Y = Math.round(IMG_H * 0.10);        // ≈ 12

        const cfg = (obs && obs.config) || {};
        const bubbleTextSize = Math.max(12, Number(cfg.bubbleTextSize || 18));
        const headY = obs.y - obs.height / 2;
        const bubbleGap = 6;

        // Anchor: tail tip at obs.x, bottom of image at headY
        let imgX = obs.x - TAIL_TIP_X;
        let imgY = headY - IMG_H - bubbleGap;
        imgX = constrain(imgX, 8, width - IMG_W - 8);
        // Only render once there is room above the head — prevents the bubble from
        // appearing at the top of the screen before the homeless sprite enters view.
        if (imgY < 0) return;

        // Draw image (or fallback rect)
        const img = (typeof assets !== 'undefined') ? assets.dialogBox : null;
        if (img) {
            imageMode(CORNER);
            noStroke();
            image(img, imgX, imgY, IMG_W, IMG_H);
        } else {
            const bodyH = Math.round(IMG_H * BODY_FRAC);
            noStroke();
            fill(245, 245, 255, 240);
            rect(imgX, imgY, IMG_W, bodyH, 10);
            triangle(
                imgX + TAIL_TIP_X - 10, imgY + bodyH,
                imgX + TAIL_TIP_X + 10, imgY + bodyH,
                imgX + TAIL_TIP_X, imgY + IMG_H
            );
        }

        // Draw text inside the content area (body only, above the tail)
        const bodyH = Math.round(IMG_H * BODY_FRAC);
        const textMaxW = IMG_W - PAD_X * 2;
        const textMaxH = bodyH - PAD_Y * 2;
        const textLayout = this.getHomelessBubbleTextLayout(
            textContent,
            bubbleTextSize,
            textMaxW,
            textMaxH
        );
        const lines = textLayout.lines;
        const lineH = textLayout.lineHeight;
        const totalTextH = textLayout.totalHeight;
        const textCenterX = imgX + IMG_W * 0.5;
        const textStartY = imgY + PAD_Y + max(0, (textMaxH - totalTextH) * 0.5);

        textAlign(CENTER, CENTER);
        textStyle(BOLD);
        textSize(textLayout.textSize);
        fill(20, 20, 28);
        stroke(255, 245, 235, 150);
        strokeWeight(1.4);
        for (let i = 0; i < lines.length; i++) {
            const tx = textCenterX;
            const ty = textStartY + i * lineH + lineH * 0.5;
            text(lines[i], tx, ty);
        }
    }

    getHomelessBubbleMetrics(obs, textContent) {
        // Returns the rendered bounds for collision detection.
        // Matches the fixed-size image layout used in displayHomelessDialogueBubble.
        const IMG_W = 300;
        const IMG_H = Math.round(IMG_W * (200 / 510)); // ≈ 118
        const TAIL_TIP_X = Math.round(IMG_W * 0.42);
        const BODY_FRAC = 0.78;
        const PAD_X = Math.round(IMG_W * 0.07);
        const PAD_Y = Math.round(IMG_H * 0.10);

        const cfg = (obs && obs.config) || {};
        const bubbleTextSize = Math.max(12, Number(cfg.bubbleTextSize || 18));
        const headY = obs.y - obs.height / 2;
        const bubbleGap = 6;

        let imgX = obs.x - TAIL_TIP_X;
        let imgY = headY - IMG_H - bubbleGap;
        imgX = constrain(imgX, 8, width - IMG_W - 8);
        // No clamp: matches the render guard so hitbox is only active when bubble is visible.

        const bodyH = Math.round(IMG_H * BODY_FRAC);
        const textMaxW = IMG_W - PAD_X * 2;
        const textMaxH = bodyH - PAD_Y * 2;
        const textLayout = this.getHomelessBubbleTextLayout(
            textContent,
            bubbleTextSize,
            textMaxW,
            textMaxH
        );

        return {
            x: imgX,
            y: imgY,
            w: IMG_W,
            h: bodyH,          // hitbox covers the main body only (not the tail)
            lines: textLayout.lines,
            lineHeight: textLayout.lineHeight,
            textPaddingX: PAD_X,
            textPaddingY: PAD_Y,
            tailHeight: IMG_H - bodyH,
            textSize: textLayout.textSize,
            offsetX: -TAIL_TIP_X
        };
    }

    getHomelessBubbleTextLayout(content, preferredTextSize, maxWidth, maxHeight) {
        const minTextSize = 12;
        let resolvedTextSize = Math.max(minTextSize, Math.floor(Number(preferredTextSize || minTextSize)));
        let lines = [];
        let lineHeight = Math.round(resolvedTextSize * 1.32);
        let totalHeight = 0;

        push();
        textStyle(BOLD);

        while (resolvedTextSize >= minTextSize) {
            textSize(resolvedTextSize);
            lines = this.wrapTextToWidth(content, maxWidth);
            lineHeight = Math.round(resolvedTextSize * 1.32);
            totalHeight = lines.length * lineHeight;

            let widestLine = 0;
            for (const line of lines) {
                widestLine = Math.max(widestLine, textWidth(line));
            }

            if (widestLine <= maxWidth && totalHeight <= maxHeight) break;
            resolvedTextSize--;
        }

        if (resolvedTextSize < minTextSize) {
            resolvedTextSize = minTextSize;
            textSize(resolvedTextSize);
            lines = this.wrapTextToWidth(content, maxWidth);
            lineHeight = Math.round(resolvedTextSize * 1.32);
            totalHeight = lines.length * lineHeight;
        }

        pop();

        return {
            lines,
            textSize: resolvedTextSize,
            lineHeight,
            totalHeight
        };
    }

    wrapTextToWidth(content, maxWidth) {
        if (!content) return [];
        const words = content.split(/\s+/).filter(Boolean);
        if (words.length === 0) return [];

        const lines = [];
        let currentLine = words[0];
        while (textWidth(currentLine) > maxWidth && currentLine.length > 1) {
            let splitIdx = currentLine.length - 1;
            while (splitIdx > 1 && textWidth(currentLine.slice(0, splitIdx)) > maxWidth) splitIdx--;
            lines.push(currentLine.slice(0, splitIdx));
            currentLine = currentLine.slice(splitIdx);
        }
        for (let i = 1; i < words.length; i++) {
            const next = words[i];
            if (textWidth(next) > maxWidth) {
                if (currentLine) lines.push(currentLine);
                let chunk = next;
                while (textWidth(chunk) > maxWidth && chunk.length > 1) {
                    let splitIdx = chunk.length - 1;
                    while (splitIdx > 1 && textWidth(chunk.slice(0, splitIdx)) > maxWidth) splitIdx--;
                    lines.push(chunk.slice(0, splitIdx));
                    chunk = chunk.slice(splitIdx);
                }
                currentLine = chunk;
                continue;
            }
            const candidate = `${currentLine} ${next}`;
            if (textWidth(candidate) <= maxWidth) {
                currentLine = candidate;
            } else {
                lines.push(currentLine);
                currentLine = next;
            }
        }
        lines.push(currentLine);
        return lines;
    }

    checkCollision(player, obs) {
        if (obs && obs.type === "FANTASY_COFFEE") {
            return false;
        }

        const playerLeft = player.x - player.hitboxW / 2;
        const playerRight = player.x + player.hitboxW / 2;
        const playerTop = player.y - 20;
        const playerBottom = player.y + 20;

        if (this.isMovingObstacle(obs)) {
            return this.checkHexCollisionWithPlayerRect(obs, playerLeft, playerRight, playerTop, playerBottom);
        }

        const obsLeft = obs.x - obs.width / 2;
        const obsRight = obs.x + obs.width / 2;
        const obsTop = obs.y - obs.height / 2;
        const obsBottom = obs.y + obs.height / 2;

        const hitObstacleBody = !(playerRight < obsLeft ||
            playerLeft > obsRight ||
            playerBottom < obsTop ||
            playerTop > obsBottom);
        if (hitObstacleBody) return true;

        if (obs.type === "HOMELESS" && obs.dialogue) {
            const bubble = this.getHomelessBubbleMetrics(obs, obs.dialogue);
            const bubbleLeft = bubble.x;
            const bubbleRight = bubble.x + bubble.w;
            const bubbleTop = bubble.y;
            const bubbleBottom = bubble.y + bubble.h;

            const hitBubble = !(playerRight < bubbleLeft ||
                playerLeft > bubbleRight ||
                playerBottom < bubbleTop ||
                playerTop > bubbleBottom);
            if (hitBubble) return true;
        }

        return false;
    }

    isMovingObstacle(obs) {
        if (!obs || !obs.config) return false;
        if (obs.config.type === "BUFF") return false;
        return Number(obs.speed || 0) > 0;
    }

    getObstacleHexPoints(obs) {
        const halfW = (obs.width || 0) * 0.5;
        const halfH = (obs.height || 0) * 0.5;
        const insetX = halfW * 0.36;   // trim side corners
        const neckY = halfH * 0.42;    // keep center body fatter than diamond
        const cx = obs.x || 0;
        const cy = obs.y || 0;

        return [
            { x: cx, y: cy - halfH }, // top point
            { x: cx + halfW, y: cy - neckY },
            { x: cx + halfW, y: cy + neckY },
            { x: cx, y: cy + halfH }, // bottom point
            { x: cx - halfW, y: cy + neckY },
            { x: cx - halfW, y: cy - neckY }
        ].map(p => ({ x: p.x + (p.x > cx ? -insetX : (p.x < cx ? insetX : 0)), y: p.y }));
    }

    getPlayerRectPoints(left, right, top, bottom) {
        return [
            { x: left, y: top },
            { x: right, y: top },
            { x: right, y: bottom },
            { x: left, y: bottom }
        ];
    }

    projectPointsOnAxis(points, axis) {
        let min = Infinity;
        let max = -Infinity;
        for (const p of points) {
            const value = p.x * axis.x + p.y * axis.y;
            if (value < min) min = value;
            if (value > max) max = value;
        }
        return { min, max };
    }

    isAxisSeparating(polyA, polyB, axis) {
        const projA = this.projectPointsOnAxis(polyA, axis);
        const projB = this.projectPointsOnAxis(polyB, axis);
        return projA.max < projB.min || projB.max < projA.min;
    }

    getPolygonAxes(points) {
        const axes = [];
        for (let i = 0; i < points.length; i++) {
            const a = points[i];
            const b = points[(i + 1) % points.length];
            const edgeX = b.x - a.x;
            const edgeY = b.y - a.y;
            const nx = -edgeY;
            const ny = edgeX;
            const len = Math.hypot(nx, ny);
            if (len <= 1e-6) continue;
            axes.push({ x: nx / len, y: ny / len });
        }
        return axes;
    }

    checkHexCollisionWithPlayerRect(obs, playerLeft, playerRight, playerTop, playerBottom) {
        const hex = this.getObstacleHexPoints(obs);
        const rect = this.getPlayerRectPoints(playerLeft, playerRight, playerTop, playerBottom);

        const axes = [
            ...this.getPolygonAxes(hex),
            { x: 1, y: 0 },
            { x: 0, y: 1 }
        ];

        for (const axis of axes) {
            if (this.isAxisSeparating(hex, rect, axis)) return false;
        }
        return true;
    }


    handleCollision(player, obs) {
        const config = obs.config;
        const isBuff = config && config.type === "BUFF";
        const isFantasyCoffee = obs && obs.type === "FANTASY_COFFEE";
        const hasScooterBuff = !!(
            player &&
            typeof player.hasEmptyScooterBuffActive === "function" &&
            player.hasEmptyScooterBuffActive()
        );
        const useRainBoots = !!(
            config &&
            config.effect === "puddleTrap" &&
            player &&
            typeof player.shouldTriggerRainBoots === "function" &&
            typeof player.consumeArmedUtilityItem === "function" &&
            player.shouldTriggerRainBoots()
        );
        const useHeadphones = !!(
            config &&
            config.effect === "leaflet" &&
            player &&
            typeof player.shouldTriggerHeadphones === "function" &&
            typeof player.consumeArmedUtilityItem === "function" &&
            player.shouldTriggerHeadphones()
        );

        if (useRainBoots) {
            if (typeof feedbackLayer !== "undefined" && feedbackLayer &&
                typeof feedbackLayer.requestSFX === "function") {
                feedbackLayer.requestSFX("collision_generic", {
                    type: obs.type,
                    hasRainBoots: true
                });
            }
            player.consumeArmedUtilityItem("Rain Boots");
            return;
        }

        if (hasScooterBuff && (obs.type === "PROMOTER" || obs.type === "HOMELESS")) {
            if (typeof feedbackLayer !== "undefined" && feedbackLayer &&
                typeof feedbackLayer.onCollision === "function") {
                feedbackLayer.onCollision(obs.type, {
                    damage: 0,
                    effect: "cancelScooterBuff",
                    cancelledScooterBuff: true,
                    playerX: player ? player.x : width / 2,
                    playerY: player ? player.y : height * 0.66
                });
            }
            if (typeof player.cancelEmptyScooterBuff === "function") {
                player.cancelEmptyScooterBuff();
            }
            return;
        }

        if (!isFantasyCoffee && typeof feedbackLayer !== "undefined" && feedbackLayer) {
            if (isBuff && typeof feedbackLayer.onBuffPickup === "function") {
                feedbackLayer.onBuffPickup(obs.type, {
                    effect: config.effect || "",
                    playerX: player ? player.x : width / 2,
                    playerY: player ? player.y : height * 0.66
                });
            } else if (obs.type === "SMALL_BUSINESS" &&
                typeof feedbackLayer.onSmallBusinessCollision === "function") {
                feedbackLayer.onSmallBusinessCollision(obs.type, {
                    damage: config.damage || 0,
                    effect: config.effect || "",
                    playerX: player ? player.x : width / 2,
                    playerY: player ? player.y : height * 0.66
                });
            } else if (typeof feedbackLayer.onCollision === "function") {
                const hasRainBoots =
                    (typeof backpackVisual !== "undefined" && backpackVisual &&
                        Array.isArray(backpackVisual.topSlots) &&
                        backpackVisual.topSlots.includes("Rain Boots")) || false;

                const hasScooterBuff =
                    (player && typeof player.hasEmptyScooterBuffActive === "function" &&
                        player.hasEmptyScooterBuffActive()) || false;

                feedbackLayer.onCollision(obs.type, {
                    damage: config.damage || 0,
                    effect: config.effect || "",
                    hasRainBoots,
                    hasScooterBuff,
                    playerX: player ? player.x : width / 2,
                    playerY: player ? player.y : height * 0.66
                });
            }
        }

        if (config.damage > 0) {
            player.takeDamage(config.damage, obs.type);
        }

        if (config.effect === "stun" && typeof player.applyScooterRiderHit === "function") {
            player.applyScooterRiderHit(config.stunDuration || 0.5, config.laneDelayDuration || 1.0);

            if (typeof feedbackLayer !== "undefined" && feedbackLayer) {
                const playerX = player ? player.x : width / 2;
                const playerY = player ? player.y : height * 0.66;

                if (typeof feedbackLayer.onScooterStun === "function") {
                    feedbackLayer.onScooterStun({ playerX, playerY });
                }

                feedbackLayer.cameraShakeFrames = max(
                    feedbackLayer.cameraShakeFrames || 0,
                    floor(random(10, 15))
                );
                feedbackLayer.cameraShakeAmplitude = max(
                    feedbackLayer.cameraShakeAmplitude || 0,
                    14
                );
            }
            // Scooter-specific stronger camera shake
            if (typeof feedbackLayer !== "undefined" && feedbackLayer) {
                feedbackLayer.cameraShakeFrames = max(feedbackLayer.cameraShakeFrames, 20);
                feedbackLayer.cameraShakeAmplitude = max(feedbackLayer.cameraShakeAmplitude, 16);
            }
        }

        if (config.effect === "speedBoostAndInvincible" && typeof player.applyEmptyScooterBuff === "function") {
            player.applyEmptyScooterBuff(
                config.speedBoostDuration || 5.0,
                config.invincibleDuration || 7.0,
                config.speedMultiplier || 1.2
            );
        }

        if (config.effect === "heal" && typeof player.applyCoffeeBuff === "function") {
            player.applyCoffeeBuff(
                config.healAmount || 0,
                config.overflowEffect || "",
                config.hpLockDuration || 3.0
            );
        }

        if (config.effect === "forcedLaneSwitch" && typeof player.applyHomelessForcedLaneSwitch === "function") {
            player.applyHomelessForcedLaneSwitch(obs.lane);
        }

        if (config.effect === "puddleTrap" && typeof player.applyPuddleTrap === "function") {
            player.applyPuddleTrap(config.escapePressRequired ?? 3, config.slowMultiplier ?? 0.72);
        }

        if (config.effect === "leaflet") {
            if (useHeadphones) {
                player.consumeArmedUtilityItem("Headphones");
                this.firePromoterPaperBall(player);
                return;
            }

            this.startPromoterInteraction(obs);
        }
    }

    drawMissingSpritePlaceholder(obs) {
        if (!obs || !obs.width || !obs.height) return;
        noStroke();
        fill(0);
        rectMode(CENTER);
        rect(obs.x, obs.y, obs.width, obs.height);
    }

    startPromoterInteraction(obs) {
        const config = (obs && obs.config) || OBSTACLE_CONFIG.PROMOTER;
        this.promoterInteraction.active = true;
        this.promoterInteraction.spacePressCount = 0;
        this.promoterInteraction.spacePressRequired = config.spacePressRequired || 10;
        const dayID = Number((typeof currentDayID !== "undefined" && currentDayID) ? currentDayID : 1);
        let flyers = Array.isArray(config.leafletSprites) ? config.leafletSprites : [];
        if (config.leafletSpritesByDay && Array.isArray(config.leafletSpritesByDay[dayID])) {
            flyers = config.leafletSpritesByDay[dayID];
        }
        if (flyers.length > 0) {
            const randomFlyer = flyers[Math.floor(Math.random() * flyers.length)];
            this.promoterInteraction.overlaySpritePath = randomFlyer;
        } else {
            this.promoterInteraction.overlaySpritePath = null;
        }
        this.promoterInteraction.projectile = null;
        this.promoterCooldownFramesRemaining = this.secondsToFrames(config.interactionCooldown || 5.0);
    }

    handlePromoterSpacePress(player) {
        if (!this.promoterInteraction.active) return false;

        this.promoterInteraction.spacePressCount++;

        // Paper crumple SFX for each SPACE press during poster interaction
        if (typeof feedbackLayer !== "undefined" && feedbackLayer) {
            if (typeof feedbackLayer.onPromoterCrumple === "function") {
                feedbackLayer.onPromoterCrumple({});
            } else if (typeof feedbackLayer.requestSFX === "function") {
                feedbackLayer.requestSFX("promoter_crumple", {});
            }
        }

        if (this.promoterInteraction.spacePressCount >= this.promoterInteraction.spacePressRequired) {
            this.firePromoterPaperBall(player);
            this.promoterInteraction.active = false;
            this.promoterInteraction.spacePressCount = 0;
        }
        return true;
    }

    firePromoterPaperBall(player) {
        const playerLane = this.getPlayerCurrentLane(player);
        const target = this.findNearestClearableObstacleInLane(playerLane, player ? player.y : PLAYER_RUN_FOOT_Y);

        this.promoterInteraction.projectile = {
            x: player ? player.x : GLOBAL_CONFIG.lanes.lane1,
            y: player ? (player.y - 36) : (PLAYER_RUN_FOOT_Y - 36),
            lane: playerLane,
            target: target || null,
            hitRadius: 56,
            speed: 22,
            ttl: 42
        };
    }

    updatePromoterProjectile(scrollSpeed) {
        const p = this.promoterInteraction.projectile;
        if (!p) return;

        p.y -= p.speed;
        p.y += scrollSpeed * 0.35;
        p.ttl--;

        const targetHit = this.tryHitPaperBallTarget(p);
        if (targetHit) {
            this.promoterInteraction.projectile = null;
            return;
        }

        if (p.ttl <= 0 || p.y < -40) {
            this.promoterInteraction.projectile = null;
        }
    }

    displayPromoterProjectile() {
        const p = this.promoterInteraction.projectile;
        if (!p) return;
        const config = OBSTACLE_CONFIG.PROMOTER || {};
        const spritePath = config.paperBallSprite;
        const sprite = spritePath ? this.getSpriteImage(spritePath) : null;
        const ballSize = config.paperBallSize || { width: 48, height: 48 };

        push();
        imageMode(CENTER);
        if (sprite) {
            image(sprite, p.x, p.y, ballSize.width, ballSize.height);
        } else {
            fill(60, 130, 255);
            noStroke();
            circle(p.x, p.y, 24);
        }
        pop();
    }

    displayPromoterOverlay() {
        if (!this.promoterInteraction.active) return;

        push();
        const overlayPath = this.promoterInteraction.overlaySpritePath;
        const overlayImg = overlayPath ? this.getSpriteImage(overlayPath) : null;

        imageMode(CORNER);
        if (overlayImg) {
            const overlayW = 810;
            const overlayH = 970.;
            const overlayX = (width - overlayW) / 2;
            const overlayY = (height - overlayH) / 2;
            image(overlayImg, overlayX, overlayY, overlayW, overlayH);
        } else {
            noStroke();
            fill(20, 40, 80, 235);
            rect(0, 0, width, height);
        }

        const remain = max(0, this.promoterInteraction.spacePressRequired - this.promoterInteraction.spacePressCount);
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(28);
        textStyle(BOLD);
        text(`PRESS SPACE x${remain}`, width / 2, height - 110);
        pop();
    }

    getSpriteImage(spritePath) {
        const resolvedPath = (typeof resolveSpritePath === "function")
            ? resolveSpritePath(spritePath)
            : spritePath;

        let img = this.spriteCache[resolvedPath];
        if (!img && assets && assets.previews) {
            const fileNameKey = resolvedPath.split('/').pop().replace('.png', '').toLowerCase();
            img = assets.previews[fileNameKey];
        }
        if (img) {
            this.spriteCache[resolvedPath] = img;
        }
        return img || null;
    }

    getPlayerCurrentLane(player) {
        if (!player) return 1;
        const laneFromIndex = (typeof player.currentLaneIndex === "number")
            ? player.currentLaneIndex + 1
            : null;
        if (laneFromIndex && laneFromIndex >= 1 && laneFromIndex <= 4) return laneFromIndex;

        let nearestLane = 1;
        let nearestDist = Number.POSITIVE_INFINITY;
        for (let lane = 1; lane <= 4; lane++) {
            const laneX = GLOBAL_CONFIG.lanes[`lane${lane}`];
            const d = Math.abs(player.x - laneX);
            if (d < nearestDist) {
                nearestDist = d;
                nearestLane = lane;
            }
        }
        return nearestLane;
    }

    isFantasyCoffeeTriggeredByPlayer(obs, playerRef, cfg = {}) {
        if (!obs || !playerRef) return false;

        const playerLane = this.getPlayerCurrentLane(playerRef);
        const obstacleLane = Number(obs.lane || 0);
        if (!playerLane || !obstacleLane || playerLane !== obstacleLane) return false;

        const dx = playerRef.x - obs.x;
        const dy = playerRef.y - obs.y;
        const distance = Math.hypot(dx, dy);
        const triggerRadius = Math.max(1, Number(cfg.escapeTriggerRadius ?? 300));
        return distance <= triggerRadius;
    }

    isClearableByPaperBall(obs) {
        if (!obs || !obs.type || !obs.config) return false;
        if (obs.type === "PROMOTER") return false;
        if (obs.config.type === "BUFF") return false;
        return true;
    }

    findNearestClearableObstacleInLane(lane, originY) {
        if (!lane) return null;
        let target = null;
        let bestDistance = Number.POSITIVE_INFINITY;
        const fromY = Number(originY || PLAYER_RUN_FOOT_Y);

        for (let i = 0; i < this.obstacles.length; i++) {
            const obs = this.obstacles[i];
            if (!this.isClearableByPaperBall(obs)) continue;
            if (obs.lane !== lane) continue;

            const forwardDistance = fromY - Number(obs.y || 0);
            if (forwardDistance < 0) continue;
            if (forwardDistance < bestDistance) {
                bestDistance = forwardDistance;
                target = obs;
            }
        }
        return target;
    }

    removeObstacleInstance(targetObs) {
        if (!targetObs) return false;
        const idx = this.obstacles.indexOf(targetObs);
        if (idx < 0) return false;
        this.obstacles.splice(idx, 1);
        return true;
    }

    tryHitPaperBallTarget(projectile) {
        if (!projectile) return false;
        const target = projectile.target;
        const radius = Math.max(1, Number(projectile.hitRadius || 56));

        // Prefer locked target if it still exists.
        if (target && this.obstacles.includes(target)) {
            const dx = Number(target.x || 0) - Number(projectile.x || 0);
            const dy = Number(target.y || 0) - Number(projectile.y || 0);
            if (Math.hypot(dx, dy) <= radius) {
                return this.removeObstacleInstance(target);
            }
        }

        // Fallback: hit any clearable obstacle near the projectile in the same lane.
        const lane = Number(projectile.lane || 0);
        for (let i = 0; i < this.obstacles.length; i++) {
            const obs = this.obstacles[i];
            if (!this.isClearableByPaperBall(obs)) continue;
            if (lane && obs.lane !== lane) continue;
            const dx = Number(obs.x || 0) - Number(projectile.x || 0);
            const dy = Number(obs.y || 0) - Number(projectile.y || 0);
            if (Math.hypot(dx, dy) <= radius) {
                this.obstacles.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    updateDynamicLaneBehavior(obs, playerRef) {
        if (!obs || obs.type !== "SCOOTER_RIDER") return;

        const cfg = obs.config || {};
        const laneCount = 4;
        const durationCfg = cfg.laneChangeDuration || { min: 0.18, max: 0.28 };

        // Linear lane switch in progress
        if ((obs.laneMoveFramesRemaining || 0) > 0) {
            const movedFrames = obs.laneMoveFramesTotal - obs.laneMoveFramesRemaining + 1;
            const t = constrain(movedFrames / obs.laneMoveFramesTotal, 0, 1);
            obs.x = lerp(obs.laneMoveStartX, obs.laneMoveTargetX, t);
            obs.laneMoveFramesRemaining--;

            if (obs.laneMoveFramesRemaining <= 0) {
                obs.x = obs.laneMoveTargetX;
                obs.lane = obs.targetLane;
            }
            return;
        }

        // One-time proximity-triggered lane change.
        if (obs.proximityLaneChangeConsumed) return;
        if (!playerRef) return;

        const triggerRadius = Math.max(1, Number(cfg.proximityLaneChangeRadius ?? 600));
        const dx = Number(playerRef.x || 0) - Number(obs.x || 0);
        const dy = Number(playerRef.y || 0) - Number(obs.y || 0);
        const distance = Math.hypot(dx, dy);
        if (distance > triggerRadius) return;

        const currentLane = Number(obs.targetLane || obs.lane || 1);
        const candidates = [];
        if (currentLane - 1 >= 1) candidates.push(currentLane - 1);
        if (currentLane + 1 <= laneCount) candidates.push(currentLane + 1);
        if (candidates.length === 0) {
            obs.proximityLaneChangeConsumed = true;
            return;
        }

        const nextLane = candidates[Math.floor(Math.random() * candidates.length)];
        obs.targetLane = nextLane;
        obs.laneMoveStartX = obs.x;
        obs.laneMoveTargetX = GLOBAL_CONFIG.lanes[`lane${nextLane}`];
        obs.laneMoveFramesTotal = this.secondsToFrames(this.randomRange(durationCfg.min, durationCfg.max));
        obs.laneMoveFramesRemaining = obs.laneMoveFramesTotal;
        obs.proximityLaneChangeConsumed = true;
    }

    updateFantasyCoffeeBehavior(obs, playerRef) {
        if (!obs || obs.type !== "FANTASY_COFFEE") return;
        if (!playerRef) return;
        const cfg = obs.config || {};

        const useTangle =
            playerRef &&
            typeof playerRef.shouldTriggerTangle === "function" &&
            typeof playerRef.consumeArmedUtilityItem === "function" &&
            playerRef.shouldTriggerTangle();
        const playerTriggeredEscape = this.isFantasyCoffeeTriggeredByPlayer(obs, playerRef, cfg);

        if (obs.fantasyState === "DISGUISED") {
            if (useTangle && playerTriggeredEscape) {
                this.startFantasyCoffeeEscape(obs, cfg, playerRef);
                playerRef.consumeArmedUtilityItem("Tangle");
                return;
            }

            if (!playerTriggeredEscape) return;
            this.startFantasyCoffeeEscape(obs, cfg, playerRef);
            return;
        }

        if (obs.fantasyState === "STARTUP") {
            if (obs.escapeStartupFrames > 0) {
                obs.escapeStartupFrames--;
                return;
            }
            obs.fantasyState = "ESCAPING";
        }

        if (obs.fantasyState === "ESCAPING") {
            obs.x += Number(obs.escapeVx || 0);
            obs.y += Number(obs.escapeVy || 0);
            const runFps = Math.max(1, Number(cfg.runAnimFps ?? 12));
            const frameStep = Math.max(1, Math.floor(60 / runFps));
            obs.runFrameCounter = (obs.runFrameCounter || 0) + 1;
            if (obs.runFrameCounter >= frameStep) {
                obs.runFrameCounter = 0;
                const frames = Math.max(1, Math.floor(Number(cfg.runSpriteFrames ?? 6)));
                obs.runFrame = ((obs.runFrame || 0) + 1) % frames;
            }
        }
    }

    isObstacleVisibleOnScreen(obs) {
        if (!obs) return false;
        const halfW = Number(obs.width || 0) * 0.5;
        const halfH = Number(obs.height || 0) * 0.5;
        return obs.x + halfW >= 0 &&
            obs.x - halfW <= width &&
            obs.y + halfH >= 0 &&
            obs.y - halfH <= height;
    }

    startFantasyCoffeeEscape(obs, cfg) {
        if (!obs) return;
        const startup = Math.max(0, Math.floor(Number(cfg.escapeStartupFrames ?? 12)));
        obs.fantasyState = "STARTUP";
        obs.escapeStartupFrames = startup;

        const angleDeg = Number(cfg.escapeAngleDeg ?? 76);
        const angleRad = angleDeg * Math.PI / 180;
        const speed = Math.abs(Number(cfg.escapeSpeed ?? 3.4));
        obs.escapeVx = speed * Math.cos(angleRad);
        obs.escapeVy = speed * Math.sin(angleRad);
        obs.spritePath = cfg.runSpriteSheet || obs.spritePath;

        // Fantasy coffee SFX should trigger when it starts running (no collision event).
        if (typeof feedbackLayer !== "undefined" && feedbackLayer &&
            typeof feedbackLayer.requestSFX === "function") {
            feedbackLayer.requestSFX("collision_generic", { type: "FANTASY_COFFEE" });
        }
    }

    displayFantasyCoffee(obs) {
        if (!obs) return;
        const cfg = obs.config || {};
        const state = obs.fantasyState || "DISGUISED";

        if (state === "ESCAPING" || state === "STARTUP") {
            const frames = this.getFantasyCoffeeRunFrames(cfg);
            const frameCount = Array.isArray(frames) ? frames.length : 0;
            if (frameCount > 0) {
                const frame = constrain(Math.floor(obs.runFrame || 0), 0, frameCount - 1);
                const frameImg = frames[frame];
                imageMode(CENTER);
                if (state === "STARTUP") {
                    const startupTotal = Math.max(1, Math.floor(Number(cfg.escapeStartupFrames ?? 12)));
                    const t = 1 - (Number(obs.escapeStartupFrames || 0) / startupTotal);
                    const scaleMul = 1 + 0.16 * t;
                    image(frameImg, obs.x, obs.y, obs.width * scaleMul, obs.height * scaleMul);
                } else {
                    image(frameImg, obs.x, obs.y, obs.width, obs.height);
                }
                return;
            }
        }

        if (obs.spritePath) {
            const img = this.getSpriteImage(obs.spritePath);
            if (img) {
                imageMode(CENTER);
                image(img, obs.x, obs.y, obs.width, obs.height);
                return;
            }
        }
        this.drawMissingSpritePlaceholder(obs);
    }

    getFantasyCoffeeRunFrames(cfg) {
        const sheetPath = cfg && cfg.runSpriteSheet ? String(cfg.runSpriteSheet) : "";
        const totalFrames = Math.max(1, Math.floor(Number((cfg && cfg.runSpriteFrames) ?? 6)));
        const cacheKey = `${sheetPath}::${totalFrames}`;
        if (this.fantasyCoffeeRunFrames && this.fantasyCoffeeRunFramesKey === cacheKey) {
            return this.fantasyCoffeeRunFrames;
        }

        const sheet = sheetPath ? this.getSpriteImage(sheetPath) : null;
        if (!sheet || !sheet.width || !sheet.height) return null;

        const sw = Math.floor(sheet.width / totalFrames);
        const sh = sheet.height;
        if (sw <= 0 || sh <= 0) return null;

        const frames = [];
        for (let i = 0; i < totalFrames; i++) {
            const frameImg = createImage(sw, sh);
            frameImg.copy(sheet, i * sw, 0, sw, sh, 0, 0, sw, sh);
            frameImg.loadPixels();
            for (let p = 0; p < frameImg.pixels.length; p += 4) {
                const r = frameImg.pixels[p];
                const g = frameImg.pixels[p + 1];
                const b = frameImg.pixels[p + 2];
                if (r >= 245 && g >= 245 && b >= 245) {
                    frameImg.pixels[p + 3] = 0;
                }
            }
            frameImg.updatePixels();
            frames.push(frameImg);
        }

        this.fantasyCoffeeRunFrames = frames;
        this.fantasyCoffeeRunFramesKey = cacheKey;
        return frames;
    }

    secondsToFrames(seconds) {
        return Math.max(1, Math.floor(seconds * 60));
    }

    randomRange(min, max) {
        return min + Math.random() * (max - min);
    }

    stopSpawning() {
        this.obstacles = [];
    }

    renderPromoterEffects() {
        this.displayPromoterProjectile();
        this.displayPromoterOverlay();
    }
}
