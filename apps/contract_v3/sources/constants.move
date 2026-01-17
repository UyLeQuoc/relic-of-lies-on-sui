/// Constants module for Love Letter with Seal Integration
/// Contains all fixed values for cards, game rules, and Seal configuration
module contract_v3::constants;

// ============== Entry Fee ==============
const ENTRY_FEE: u64 = 0;
public fun entry_fee(): u64 { ENTRY_FEE }

// ============== Player Limits ==============
const MAX_PLAYERS: u8 = 6;
public fun max_players(): u8 { MAX_PLAYERS }

const MIN_PLAYERS: u8 = 2;
public fun min_players(): u8 { MIN_PLAYERS }

// ============== Token System ==============
const TOKENS_TO_WIN: u8 = 3;
public fun tokens_to_win(): u8 { TOKENS_TO_WIN }

// ============== Game Status ==============
const STATUS_WAITING: u8 = 0;
public fun status_waiting(): u8 { STATUS_WAITING }

const STATUS_PLAYING: u8 = 1;
public fun status_playing(): u8 { STATUS_PLAYING }

const STATUS_ROUND_END: u8 = 2;
public fun status_round_end(): u8 { STATUS_ROUND_END }

const STATUS_FINISHED: u8 = 3;
public fun status_finished(): u8 { STATUS_FINISHED }

/// Waiting for player to respond (Guard guess, Baron compare, etc.)
const STATUS_PENDING_RESPONSE: u8 = 4;
public fun status_pending_response(): u8 { STATUS_PENDING_RESPONSE }

// ============== Card Types (2019 Premium Edition - 10 types) ==============
const CARD_SPY: u8 = 0;
public fun card_spy(): u8 { CARD_SPY }

const CARD_GUARD: u8 = 1;
public fun card_guard(): u8 { CARD_GUARD }

const CARD_PRIEST: u8 = 2;
public fun card_priest(): u8 { CARD_PRIEST }

const CARD_BARON: u8 = 3;
public fun card_baron(): u8 { CARD_BARON }

const CARD_HANDMAID: u8 = 4;
public fun card_handmaid(): u8 { CARD_HANDMAID }

const CARD_PRINCE: u8 = 5;
public fun card_prince(): u8 { CARD_PRINCE }

const CARD_CHANCELLOR: u8 = 6;
public fun card_chancellor(): u8 { CARD_CHANCELLOR }

const CARD_KING: u8 = 7;
public fun card_king(): u8 { CARD_KING }

const CARD_COUNTESS: u8 = 8;
public fun card_countess(): u8 { CARD_COUNTESS }

const CARD_PRINCESS: u8 = 9;
public fun card_princess(): u8 { CARD_PRINCESS }

// ============== Card Counts in Deck (21 cards total) ==============
const SPY_COUNT: u8 = 2;
public fun spy_count(): u8 { SPY_COUNT }

const GUARD_COUNT: u8 = 6;
public fun guard_count(): u8 { GUARD_COUNT }

const PRIEST_COUNT: u8 = 2;
public fun priest_count(): u8 { PRIEST_COUNT }

const BARON_COUNT: u8 = 2;
public fun baron_count(): u8 { BARON_COUNT }

const HANDMAID_COUNT: u8 = 2;
public fun handmaid_count(): u8 { HANDMAID_COUNT }

const PRINCE_COUNT: u8 = 2;
public fun prince_count(): u8 { PRINCE_COUNT }

const CHANCELLOR_COUNT: u8 = 2;
public fun chancellor_count(): u8 { CHANCELLOR_COUNT }

const KING_COUNT: u8 = 1;
public fun king_count(): u8 { KING_COUNT }

const COUNTESS_COUNT: u8 = 1;
public fun countess_count(): u8 { COUNTESS_COUNT }

const PRINCESS_COUNT: u8 = 1;
public fun princess_count(): u8 { PRINCESS_COUNT }

const TOTAL_CARDS: u8 = 21;
public fun total_cards(): u8 { TOTAL_CARDS }

const BURN_CARD_COUNT: u8 = 1;
public fun burn_card_count(): u8 { BURN_CARD_COUNT }

const TWO_PLAYER_PUBLIC_CARDS: u8 = 3;
public fun two_player_public_cards(): u8 { TWO_PLAYER_PUBLIC_CARDS }

// ============== Leaderboard ==============
const MAX_LEADERBOARD_ENTRIES: u64 = 100;
public fun max_leaderboard_entries(): u64 { MAX_LEADERBOARD_ENTRIES }

// ============== Pending Action Types ==============
const PENDING_NONE: u8 = 0;
public fun pending_none(): u8 { PENDING_NONE }

const PENDING_GUARD_RESPONSE: u8 = 1;
public fun pending_guard_response(): u8 { PENDING_GUARD_RESPONSE }

const PENDING_BARON_RESPONSE: u8 = 2;
public fun pending_baron_response(): u8 { PENDING_BARON_RESPONSE }

const PENDING_CHANCELLOR_RESOLVE: u8 = 3;
public fun pending_chancellor_resolve(): u8 { PENDING_CHANCELLOR_RESOLVE }

const PENDING_ROUND_END_REVEAL: u8 = 4;
public fun pending_round_end_reveal(): u8 { PENDING_ROUND_END_REVEAL }

// ============== Commitment/Hash Constants ==============
/// Secret length for card commitments (32 bytes)
const SECRET_LENGTH: u64 = 32;
public fun secret_length(): u64 { SECRET_LENGTH }
