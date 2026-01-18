/// App module for Relic Of Lies 
/// Main entry point providing clean interface for frontend
#[allow(lint(public_random))]
module contract::app;

use sui::random::Random;
use contract::game::{Self, GameRoom, RoomRegistry};
use contract::leaderboard::{Self, Leaderboard, PlayerRecord};
use contract::constants;

// ============== Room Management ==============

/// Create a new game room
/// - name: Room name (cannot be empty)
/// - max_players: 2-6 players allowed
/// Returns: Room ID
public fun create_room(
    registry: &mut RoomRegistry,
    name: std::string::String,
    max_players: u8,
    ctx: &mut TxContext,
): ID {
    game::create_room(registry, name, max_players, ctx)
}

/// Join an existing room (free entry - no payment required)
public fun join_room(
    room: &mut GameRoom,
    ctx: &mut TxContext,
) {
    game::join_room(room, ctx);
}

/// Start a new round (first round or subsequent rounds)
public fun start_round(
    room: &mut GameRoom,
    random: &Random,
    ctx: &mut TxContext,
) {
    game::start_round(room, random, ctx);
}

/// Play a turn
/// - card: The card to play (0-9)
/// - target_idx: Target player index (optional, depends on card)
/// - guess: Card guess for Guard (optional, 0 or 2-9, not 1)
public fun play_turn(
    room: &mut GameRoom,
    leaderboard: &mut Leaderboard,
    card: u8,
    target_idx: std::option::Option<u64>,
    guess: std::option::Option<u8>,
    random: &Random,
    ctx: &mut TxContext,
) {
    game::play_turn(room, leaderboard, card, target_idx, guess, random, ctx);
}

/// Resolve Chancellor action - select card to keep and return others to deck
/// - keep_card: The card to keep in hand
/// - return_order: Cards to return to bottom of deck (in order)
public fun resolve_chancellor(
    room: &mut GameRoom,
    leaderboard: &mut Leaderboard,
    keep_card: u8,
    return_order: vector<u8>,
    ctx: &mut TxContext,
) {
    game::resolve_chancellor(room, leaderboard, keep_card, return_order, ctx);
}

// ============== Room Queries ==============

/// Get room basic info
public fun room_info(room: &GameRoom): (
    ID,                      // room_id
    std::string::String,     // name
    address,                 // creator
    u64,                     // pot_value
    u8,                      // status
    u8,                      // current_players
    u8,                      // max_players
    u8,                      // round_number
    u8,                      // tokens_to_win
) {
    (
        game::room_id(room),
        game::room_name(room),
        game::room_creator(room),
        game::room_pot_value(room),
        game::room_status(room),
        game::room_current_players(room),
        game::room_max_players(room),
        game::room_round_number(room),
        game::room_tokens_to_win(room),
    )
}

/// Get game state info (only valid when game is playing)
public fun game_state(room: &GameRoom): (
    u64,                     // current_turn
    address,                 // current_player
    u64,                     // deck_size
    u64,                     // alive_count
    bool,                    // chancellor_pending
) {
    (
        game::room_current_turn(room),
        game::current_player_address(room),
        game::deck_size(room),
        game::alive_players_count(room),
        game::is_chancellor_pending(room),
    )
}

/// Get public cards (for 2-player games)
public fun public_cards(room: &GameRoom): vector<u8> {
    game::room_public_cards(room)
}

/// Get all players in room
public fun players(room: &GameRoom): vector<address> {
    game::all_players(room)
}

/// Get player status
public fun player_status(room: &GameRoom, idx: u64): (
    address,                 // player address
    bool,                    // is_alive
    bool,                    // is_immune
    u8,                      // tokens
    u64,                     // discarded_count
) {
    game::player_at(room, idx)
}

/// Get your hand (call from your address)
public fun my_hand(room: &GameRoom, ctx: &TxContext): vector<u8> {
    game::player_hand(room, ctx.sender())
}

/// Get player's discarded cards (public info)
public fun discarded(room: &GameRoom, player: address): vector<u8> {
    game::player_discarded(room, player)
}

/// Get player's token count
public fun player_tokens(room: &GameRoom, player: address): u8 {
    game::player_tokens(room, player)
}

/// Get Chancellor cards (only for the Chancellor player)
public fun chancellor_cards(room: &GameRoom, ctx: &TxContext): vector<u8> {
    game::chancellor_cards(room, ctx)
}

/// Get all active room IDs from registry
public fun active_rooms(registry: &RoomRegistry): vector<ID> {
    game::active_rooms(registry)
}

/// Clean up a finished room from registry
public fun cleanup_room(registry: &mut RoomRegistry, room: &GameRoom) {
    game::cleanup_finished_room(registry, room);
}

// ============== Leaderboard Queries ==============

/// Get top N players
public fun top_players(leaderboard: &Leaderboard, count: u64): vector<PlayerRecord> {
    leaderboard::get_top_players(leaderboard, count)
}

/// Get a specific player's record
/// Uses Option macros for cleaner handling
public fun player_stats(leaderboard: &Leaderboard, player: address): (
    bool,                    // found
    u64,                     // wins
    u64,                     // games_played
    u64,                     // rank
) {
    let record_opt = leaderboard::get_player_record(leaderboard, player);
    if (record_opt.is_some()) {
        let record = record_opt.destroy_some();
        let rank = leaderboard::get_player_rank(leaderboard, player);
        (true, leaderboard::record_wins(&record), leaderboard::record_games_played(&record), rank)
    } else {
        (false, 0, 0, 0)
    }
}

/// Get my stats
public fun my_stats(leaderboard: &Leaderboard, ctx: &TxContext): (
    bool,                    // found
    u64,                     // wins
    u64,                     // games_played
    u64,                     // rank
) {
    player_stats(leaderboard, ctx.sender())
}

/// Get total players in leaderboard
public fun total_players(leaderboard: &Leaderboard): u64 {
    leaderboard::total_players(leaderboard)
}

// ============== Constants Queries ==============

/// Get entry fee in MIST
public fun entry_fee(): u64 {
    constants::entry_fee()
}

/// Get max players allowed
public fun max_players(): u8 {
    constants::max_players()
}

/// Get min players required
public fun min_players(): u8 {
    constants::min_players()
}

/// Get tokens needed to win
public fun tokens_to_win(): u8 {
    constants::tokens_to_win()
}

/// Get game status constants
public fun status_waiting(): u8 { constants::status_waiting() }
public fun status_playing(): u8 { constants::status_playing() }
public fun status_round_end(): u8 { constants::status_round_end() }
public fun status_finished(): u8 { constants::status_finished() }

// ============== Card Info () ==============

/// Get card value constants
public fun card_spy(): u8 { constants::card_spy() }
public fun card_guard(): u8 { constants::card_guard() }
public fun card_priest(): u8 { constants::card_priest() }
public fun card_baron(): u8 { constants::card_baron() }
public fun card_handmaid(): u8 { constants::card_handmaid() }
public fun card_prince(): u8 { constants::card_prince() }
public fun card_chancellor(): u8 { constants::card_chancellor() }
public fun card_king(): u8 { constants::card_king() }
public fun card_countess(): u8 { constants::card_countess() }
public fun card_princess(): u8 { constants::card_princess() }
