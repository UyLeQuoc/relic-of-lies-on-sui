/// Constants module for Love Letter 2019 Premium Edition
/// Contains all fixed values to avoid hardcoding throughout the codebase
module contract::constants;

// ============== Entry Fee ==============
/// Entry fee: Free to join (0 SUI)
const ENTRY_FEE: u64 = 0;
public fun entry_fee(): u64 { ENTRY_FEE }

// ============== Player Limits ==============
/// Maximum players per room (Premium Edition supports up to 6)
const MAX_PLAYERS: u8 = 6;
public fun max_players(): u8 { MAX_PLAYERS }

/// Minimum players to start game
const MIN_PLAYERS: u8 = 2;
public fun min_players(): u8 { MIN_PLAYERS }

// ============== Token System ==============
/// Tokens needed to win the game (best of rounds)
const TOKENS_TO_WIN: u8 = 3;
public fun tokens_to_win(): u8 { TOKENS_TO_WIN }

// ============== Game Status ==============
/// Room is waiting for players
const STATUS_WAITING: u8 = 0;
public fun status_waiting(): u8 { STATUS_WAITING }

/// Game is in progress (round active)
const STATUS_PLAYING: u8 = 1;
public fun status_playing(): u8 { STATUS_PLAYING }

/// Round finished, waiting for next round
const STATUS_ROUND_END: u8 = 2;
public fun status_round_end(): u8 { STATUS_ROUND_END }

/// Game has finished (someone won with enough tokens)
const STATUS_FINISHED: u8 = 3;
public fun status_finished(): u8 { STATUS_FINISHED }

// ============== Card Types (2019 Premium Edition - 10 types) ==============
/// Spy (0) - End game bonus if only one player played it
const CARD_SPY: u8 = 0;
public fun card_spy(): u8 { CARD_SPY }

/// Guard (1) - Guess opponent's card (except Guard)
const CARD_GUARD: u8 = 1;
public fun card_guard(): u8 { CARD_GUARD }

/// Priest (2) - Look at opponent's hand
const CARD_PRIEST: u8 = 2;
public fun card_priest(): u8 { CARD_PRIEST }

/// Baron (3) - Compare hands, lower loses
const CARD_BARON: u8 = 3;
public fun card_baron(): u8 { CARD_BARON }

/// Handmaid (4) - Immune until next turn
const CARD_HANDMAID: u8 = 4;
public fun card_handmaid(): u8 { CARD_HANDMAID }

/// Prince (5) - Force discard and draw
const CARD_PRINCE: u8 = 5;
public fun card_prince(): u8 { CARD_PRINCE }

/// Chancellor (6) - Draw 2, keep 1, return 2 to bottom of deck
const CARD_CHANCELLOR: u8 = 6;
public fun card_chancellor(): u8 { CARD_CHANCELLOR }

/// King (7) - Trade hands
const CARD_KING: u8 = 7;
public fun card_king(): u8 { CARD_KING }

/// Countess (8) - Must discard with King/Prince
const CARD_COUNTESS: u8 = 8;
public fun card_countess(): u8 { CARD_COUNTESS }

/// Princess (9) - Instant elimination if discarded
const CARD_PRINCESS: u8 = 9;
public fun card_princess(): u8 { CARD_PRINCESS }

// ============== Card Counts in Deck (21 cards total) ==============
/// Number of Spies in deck (2 cards)
const SPY_COUNT: u8 = 2;
public fun spy_count(): u8 { SPY_COUNT }

/// Number of Guards in deck (6 cards)
const GUARD_COUNT: u8 = 6;
public fun guard_count(): u8 { GUARD_COUNT }

/// Number of Priests in deck (2 cards)
const PRIEST_COUNT: u8 = 2;
public fun priest_count(): u8 { PRIEST_COUNT }

/// Number of Barons in deck (2 cards)
const BARON_COUNT: u8 = 2;
public fun baron_count(): u8 { BARON_COUNT }

/// Number of Handmaids in deck (2 cards)
const HANDMAID_COUNT: u8 = 2;
public fun handmaid_count(): u8 { HANDMAID_COUNT }

/// Number of Princes in deck (2 cards)
const PRINCE_COUNT: u8 = 2;
public fun prince_count(): u8 { PRINCE_COUNT }

/// Number of Chancellors in deck (2 cards)
const CHANCELLOR_COUNT: u8 = 2;
public fun chancellor_count(): u8 { CHANCELLOR_COUNT }

/// Number of Kings in deck (1 card)
const KING_COUNT: u8 = 1;
public fun king_count(): u8 { KING_COUNT }

/// Number of Countesses in deck (1 card)
const COUNTESS_COUNT: u8 = 1;
public fun countess_count(): u8 { COUNTESS_COUNT }

/// Number of Princesses in deck (1 card)
const PRINCESS_COUNT: u8 = 1;
public fun princess_count(): u8 { PRINCESS_COUNT }

/// Total cards in deck (21 cards for 2019 Premium Edition)
const TOTAL_CARDS: u8 = 21;
public fun total_cards(): u8 { TOTAL_CARDS }

/// Cards to burn at start (face down)
const BURN_CARD_COUNT: u8 = 1;
public fun burn_card_count(): u8 { BURN_CARD_COUNT }

/// Extra public cards for 2-player game
const TWO_PLAYER_PUBLIC_CARDS: u8 = 3;
public fun two_player_public_cards(): u8 { TWO_PLAYER_PUBLIC_CARDS }

// ============== Leaderboard ==============
/// Maximum entries in leaderboard
const MAX_LEADERBOARD_ENTRIES: u64 = 100;
public fun max_leaderboard_entries(): u64 { MAX_LEADERBOARD_ENTRIES }
