/// App module for Love Letter 2019 Premium Edition with Seal Encryption
/// Main entry point providing clean interface for frontend
module contract_v4::app;

use contract_v4::game::{Self, GameRoom, RoomRegistry};
use contract_v4::leaderboard::{Self, Leaderboard, PlayerRecord};
use contract_v4::constants;

// ============== Room Management ==============

/// Create a new game room
public fun create_room(
    registry: &mut RoomRegistry,
    name: std::string::String,
    max_players: u8,
    ctx: &mut TxContext,
): ID {
    game::create_room(registry, name, max_players, ctx)
}

/// Join an existing room
public fun join_room(
    room: &mut GameRoom,
    ctx: &mut TxContext,
) {
    game::join_room(room, ctx);
}

/// Submit encrypted deck (after local shuffle and encryption)
public fun submit_encrypted_deck(
    room: &mut GameRoom,
    ciphertexts: vector<vector<u8>>,
    hashes: vector<vector<u8>>,
    nonces: vector<vector<u8>>,
    ctx: &mut TxContext,
) {
    game::submit_encrypted_deck(room, ciphertexts, hashes, nonces, ctx);
}

/// Play a turn with card reveal
public fun play_turn(
    room: &mut GameRoom,
    leaderboard: &mut Leaderboard,
    card_index: u64,
    plaintext_data: vector<u8>,
    target_idx: std::option::Option<u64>,
    guess: std::option::Option<u8>,
    ctx: &mut TxContext,
) {
    game::play_turn(room, leaderboard, card_index, plaintext_data, target_idx, guess, ctx);
}

/// Respond to Guard guess
public fun respond_guard(
    room: &mut GameRoom,
    leaderboard: &mut Leaderboard,
    card_index: u64,
    plaintext_data: vector<u8>,
    ctx: &mut TxContext,
) {
    game::respond_guard(room, leaderboard, card_index, plaintext_data, ctx);
}

/// Respond to Baron comparison
public fun respond_baron(
    room: &mut GameRoom,
    leaderboard: &mut Leaderboard,
    card_index: u64,
    plaintext_data: vector<u8>,
    ctx: &mut TxContext,
) {
    game::respond_baron(room, leaderboard, card_index, plaintext_data, ctx);
}

/// Respond to Prince discard
public fun respond_prince(
    room: &mut GameRoom,
    leaderboard: &mut Leaderboard,
    card_index: u64,
    plaintext_data: vector<u8>,
    ctx: &mut TxContext,
) {
    game::respond_prince(room, leaderboard, card_index, plaintext_data, ctx);
}

/// Resolve Chancellor action
public fun resolve_chancellor(
    room: &mut GameRoom,
    leaderboard: &mut Leaderboard,
    keep_card_index: u64,
    return_indices: vector<u64>,
    ctx: &mut TxContext,
) {
    game::resolve_chancellor(room, leaderboard, keep_card_index, return_indices, ctx);
}

// ============== Room Queries ==============

/// Get room basic info
public fun room_info(room: &GameRoom): (
    ID,                      // room_id
    std::string::String,     // name
    u8,                      // status
    u8,                      // round_number
) {
    (
        game::room_id(room),
        game::room_name(room),
        game::room_status(room),
        game::room_round_number(room),
    )
}

/// Get game state info
public fun game_state(room: &GameRoom): (
    u64,                     // current_turn
    address,                 // current_player
    u64,                     // deck_size
    bool,                    // pending_action
    bool,                    // chancellor_pending
) {
    (
        game::room_current_turn(room),
        game::current_player_address(room),
        game::deck_size(room),
        game::is_pending_action(room),
        game::is_chancellor_pending(room),
    )
}

/// Get all players in room
public fun players(room: &GameRoom): vector<address> {
    game::all_players(room)
}

/// Get player's hand indices
public fun my_hand_indices(room: &GameRoom, ctx: &TxContext): vector<u64> {
    game::player_hand_indices(room, ctx.sender())
}

/// Get player's discarded cards (public info)
public fun discarded(room: &GameRoom, player: address): vector<u8> {
    game::player_discarded(room, player)
}

/// Get player's token count
public fun player_tokens(room: &GameRoom, player: address): u8 {
    game::player_tokens(room, player)
}

/// Get Seal namespace for the room
public fun seal_namespace(room: &GameRoom): vector<u8> {
    game::get_seal_namespace(room)
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

// ============== Card Info ==============

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
