// Park Street Survivor - Leaderboard Configuration
// Fill these values to enable Supabase sync for the endless-mode leaderboard.

const LEADERBOARD_SUPABASE_CONFIG = {
    url: "https://ybcwqolljsuslgxvduqo.supabase.co",
    anonKey: "sb_publishable_xdbqvx8QDKbmS6kHxY9XMQ_m7RT4Qvb",
    table: "leaderboard_scores",

    isEnabled() {
        return !!(this.url && this.anonKey && this.table);
    }
};

