// Park Street Survivor - Endless Leaderboard
// Responsibilities: localStorage persistence, optional Supabase sync, and endless-mode ranking queries.

const LEADERBOARD_STORAGE_KEY = "pss_endless_leaderboard_v1";
const LEADERBOARD_MAX_ENTRIES = 50;
const LEADERBOARD_DEFAULT_NAME = "ANON";

class LeaderboardManager {
    constructor() {
        this.topScores = {
            casual: [],
            hard: []
        };
        this.currentPlayerId = "";
        this.lastSubmittedEntry = null;
        this.loadScores();
        this.refreshFromSupabase();
    }

    loadScores() {
        try {
            const raw = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            this.topScores.casual = this._sortEntries(Array.isArray(parsed.casual) ? parsed.casual : []);
            this.topScores.hard = this._sortEntries(Array.isArray(parsed.hard) ? parsed.hard : []);
        } catch (err) {
            console.warn("[LeaderboardManager] Failed to load scores:", err);
        }
    }

    saveScores() {
        try {
            localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(this.topScores));
        } catch (err) {
            console.warn("[LeaderboardManager] Failed to save scores:", err);
        }
    }

    setPlayerId(playerId) {
        const clean = this.sanitizePlayerId(playerId);
        if (!clean) return false;
        this.currentPlayerId = clean;
        return true;
    }

    ensurePlayerIdForMode(runMode) {
        const modeKey = this.getModeKey(runMode);
        if (!modeKey) return true;

        const modeLabel = this.getModeLabel(modeKey);
        const input = window.prompt(
            `Enter a player ID for the ${modeLabel} leaderboard (1-16 letters or numbers).`,
            this.currentPlayerId || ""
        );

        if (input === null) return false;

        const saved = this.setPlayerId(input);
        if (!saved) {
            window.alert("Please enter 1-16 letters or numbers for your player ID.");
            return this.ensurePlayerIdForMode(runMode);
        }
        return true;
    }

    getModeKey(runMode) {
        if (runMode === RUN_MODE_ENDLESS_EASY) return "casual";
        if (runMode === RUN_MODE_ENDLESS_HARD) return "hard";
        return null;
    }

    getModeLabel(modeKey) {
        return modeKey === "hard" ? "HARD" : "CASUAL";
    }

    getCurrentModeKey() {
        return this.getModeKey(typeof currentRunMode !== "undefined" ? currentRunMode : null);
    }

    getTopScoresForMode(modeKey, limit = 5) {
        const list = this.topScores[modeKey] || [];
        return list.slice(0, Math.max(0, limit));
    }

    getLastSubmittedEntryForMode(modeKey) {
        if (!this.lastSubmittedEntry || this.lastSubmittedEntry.mode !== modeKey) return null;
        return this.lastSubmittedEntry;
    }

    getEntryRank(entry) {
        if (!entry || !entry.mode || !this.topScores[entry.mode]) return null;
        const list = this.topScores[entry.mode];
        const idx = list.findIndex(item => item.id === entry.id);
        return idx >= 0 ? idx + 1 : null;
    }

    submitCurrentRun(reason) {
        const modeKey = this.getCurrentModeKey();
        if (!modeKey || typeof player === "undefined" || !player) return null;

        const entry = this._buildCurrentEntry(modeKey, reason);
        this.lastSubmittedEntry = entry;
        this._insertLocalEntry(entry);
        this.pushToSupabase(entry);
        return entry;
    }

    async refreshFromSupabase() {
        if (!this._isSupabaseEnabled()) return;
        await Promise.all([
            this.fetchModeFromSupabase("casual"),
            this.fetchModeFromSupabase("hard")
        ]);
    }

    async fetchModeFromSupabase(modeKey) {
        if (!this._isSupabaseEnabled()) return;
        const cfg = LEADERBOARD_SUPABASE_CONFIG;
        const url = `${cfg.url}/rest/v1/${cfg.table}?mode=eq.${encodeURIComponent(modeKey)}&select=*&limit=${LEADERBOARD_MAX_ENTRIES}`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    apikey: cfg.anonKey,
                    Authorization: `Bearer ${cfg.anonKey}`
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const rows = await response.json();
            this.topScores[modeKey] = this._sortEntries(Array.isArray(rows) ? rows.map(row => this._normalizeRemoteEntry(row, modeKey)) : []);
            this.saveScores();
        } catch (err) {
            console.warn(`[LeaderboardManager] Failed to fetch ${modeKey} scores:`, err);
        }
    }

    async pushToSupabase(entry) {
        if (!this._isSupabaseEnabled() || !entry) return;
        const cfg = LEADERBOARD_SUPABASE_CONFIG;
        const payload = {
            id: entry.id,
            player_id: entry.playerId,
            survival_seconds: entry.survivalSeconds,
            distance_run: entry.distanceRun,
            coffee_count: entry.coffeeCount,
            car_hits: entry.carHits,
            fail_reason: entry.failReason,
            mode: entry.mode,
            difficulty_label: entry.difficultyLabel,
            day_id: entry.dayID,
            created_at: entry.createdAt
        };

        try {
            const response = await fetch(`${cfg.url}/rest/v1/${cfg.table}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Prefer: "return=minimal",
                    apikey: cfg.anonKey,
                    Authorization: `Bearer ${cfg.anonKey}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (err) {
            console.warn("[LeaderboardManager] Failed to upload score:", err);
        }
    }

    _insertLocalEntry(entry) {
        if (!entry || !entry.mode) return;
        const next = [...(this.topScores[entry.mode] || []), entry];
        this.topScores[entry.mode] = this._sortEntries(next);
        this.saveScores();
    }

    _sortEntries(entries) {
        return entries
            .map(entry => this._normalizeLocalEntry(entry))
            .filter(Boolean)
            .sort((a, b) => {
                if (b.survivalSeconds !== a.survivalSeconds) return b.survivalSeconds - a.survivalSeconds;
                if (b.distanceRun !== a.distanceRun) return b.distanceRun - a.distanceRun;
                if (a.carHits !== b.carHits) return a.carHits - b.carHits;
                return String(a.createdAt || "").localeCompare(String(b.createdAt || ""));
            })
            .slice(0, LEADERBOARD_MAX_ENTRIES);
    }

    _buildCurrentEntry(modeKey, reason) {
        const survivalSeconds = Math.max(0, Math.floor((player.playTimeFrames || 0) / 60));
        const createdAt = new Date().toISOString();
        return {
            id: `${modeKey}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            playerId: this.currentPlayerId || LEADERBOARD_DEFAULT_NAME,
            survivalSeconds,
            distanceRun: Math.round(Number(player.distanceRun || 0)),
            coffeeCount: Math.max(0, Math.floor(Number(player.coffeeCupCount || 0))),
            carHits: Math.max(0, Math.floor(Number(player.carHitCount || 0))),
            failReason: reason || "",
            mode: modeKey,
            difficultyLabel: this.getModeLabel(modeKey),
            dayID: Number(typeof currentDayID !== "undefined" ? currentDayID : 0) || 0,
            createdAt
        };
    }

    _normalizeRemoteEntry(row, fallbackMode) {
        if (!row) return null;
        return {
            id: row.id || `${fallbackMode}-${row.created_at || Date.now()}`,
            playerId: this.sanitizePlayerId(row.player_id || row.playerId || LEADERBOARD_DEFAULT_NAME) || LEADERBOARD_DEFAULT_NAME,
            survivalSeconds: Math.max(0, Math.floor(Number(row.survival_seconds ?? row.survivalSeconds ?? 0))),
            distanceRun: Math.max(0, Math.round(Number(row.distance_run ?? row.distanceRun ?? 0))),
            coffeeCount: Math.max(0, Math.floor(Number(row.coffee_count ?? row.coffeeCount ?? 0))),
            carHits: Math.max(0, Math.floor(Number(row.car_hits ?? row.carHits ?? 0))),
            failReason: String(row.fail_reason ?? row.failReason ?? ""),
            mode: row.mode || fallbackMode || "casual",
            difficultyLabel: String(row.difficulty_label ?? row.difficultyLabel ?? this.getModeLabel(row.mode || fallbackMode || "casual")),
            dayID: Number(row.day_id ?? row.dayID ?? 0) || 0,
            createdAt: String(row.created_at ?? row.createdAt ?? new Date().toISOString())
        };
    }

    _normalizeLocalEntry(row) {
        if (!row) return null;
        const mode = row.mode === "hard" ? "hard" : "casual";
        return {
            id: String(row.id || `${mode}-${row.createdAt || Date.now()}`),
            playerId: this.sanitizePlayerId(row.playerId || row.player_id || LEADERBOARD_DEFAULT_NAME) || LEADERBOARD_DEFAULT_NAME,
            survivalSeconds: Math.max(0, Math.floor(Number(row.survivalSeconds ?? row.survival_seconds ?? 0))),
            distanceRun: Math.max(0, Math.round(Number(row.distanceRun ?? row.distance_run ?? 0))),
            coffeeCount: Math.max(0, Math.floor(Number(row.coffeeCount ?? row.coffee_count ?? 0))),
            carHits: Math.max(0, Math.floor(Number(row.carHits ?? row.car_hits ?? 0))),
            failReason: String(row.failReason ?? row.fail_reason ?? ""),
            mode,
            difficultyLabel: String(row.difficultyLabel ?? row.difficulty_label ?? this.getModeLabel(mode)),
            dayID: Number(row.dayID ?? row.day_id ?? 0) || 0,
            createdAt: String(row.createdAt ?? row.created_at ?? new Date().toISOString())
        };
    }

    sanitizePlayerId(value) {
        return String(value || "")
            .toUpperCase()
            .replace(/[^A-Z0-9_-]/g, "")
            .slice(0, 16)
            .trim();
    }

    _isSupabaseEnabled() {
        return typeof fetch === "function" &&
            typeof LEADERBOARD_SUPABASE_CONFIG !== "undefined" &&
            LEADERBOARD_SUPABASE_CONFIG &&
            typeof LEADERBOARD_SUPABASE_CONFIG.isEnabled === "function" &&
            LEADERBOARD_SUPABASE_CONFIG.isEnabled();
    }
}
