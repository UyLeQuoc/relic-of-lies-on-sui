/// App module for Love Letter 2019 Premium Edition (ZK Version)
/// Main entry point providing clean interface for frontend
module contract::app;

use sui::clock::Clock;
use contract::game::{Self, ZKGameRoom, RoomRegistry, ZKVerificationKeys};
use contract::leaderboard::{Self, Leaderboard, PlayerRecord};
use contract::constants;

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
    room: &mut ZKGameRoom,
    ctx: &mut TxContext,
) {
    game::join_room(room, ctx);
}

/// Start a new round with deck commitment
public fun start_round(
    room: &mut ZKGameRoom,
    deck_commitment: vector<u8>,
    player_commitments: vector<vector<u8>>,
    public_cards: vector<u8>,
    ctx: &mut TxContext,
) {
    game::start_round(room, deck_commitment, player_commitments, public_cards, ctx);
}

/// Update player's card commitment
public fun update_commitment(
    room: &mut ZKGameRoom,
    new_commitment: vector<u8>,
    ctx: &mut TxContext,
) {
    game::update_commitment(room, new_commitment, ctx);
}

/// Play a turn
public fun play_turn(
    room: &mut ZKGameRoom,
    card: u8,
    new_commitment: vector<u8>,
    target_idx: std::option::Option<u64>,
    guess: std::option::Option<u8>,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    game::play_turn(room, card, new_commitment, target_idx, guess, clock, ctx);
}

// ============== ZK Proof Responses ==============

/// Respond to Guard with ZK proof
public fun respond_guard(
    room: &mut ZKGameRoom,
    leaderboard: &mut Leaderboard,
    vk: &ZKVerificationKeys,
    proof: vector<u8>,
    is_correct: bool,
    ctx: &mut TxContext,
) {
    game::respond_guard(room, leaderboard, vk, proof, is_correct, ctx);
}

/// Respond to Baron with ZK proof
public fun respond_baron(
    room: &mut ZKGameRoom,
    leaderboard: &mut Leaderboard,
    vk: &ZKVerificationKeys,
    proof: vector<u8>,
    result: u8,
    ctx: &mut TxContext,
) {
    game::respond_baron(room, leaderboard, vk, proof, result, ctx);
}

/// Respond to Prince effect
public fun respond_prince(
    room: &mut ZKGameRoom,
    leaderboard: &mut Leaderboard,
    discarded_card: u8,
    new_commitment: vector<u8>,
    ctx: &mut TxContext,
) {
    game::respond_prince(room, leaderboard, discarded_card, new_commitment, ctx);
}

/// Respond to King swap
public fun respond_king(
    room: &mut ZKGameRoom,
    leaderboard: &mut Leaderboard,
    initiator_new_commitment: vector<u8>,
    target_new_commitment: vector<u8>,
    ctx: &mut TxContext,
) {
    game::respond_king(room, leaderboard, initiator_new_commitment, target_new_commitment, ctx);
}

/// Resolve Chancellor action
public fun resolve_chancellor(
    room: &mut ZKGameRoom,
    leaderboard: &mut Leaderboard,
    new_commitment: vector<u8>,
    cards_returned: u8,
    ctx: &mut TxContext,
) {
    game::resolve_chancellor(room, leaderboard, new_commitment, cards_returned, ctx);
}

/// Handle timeout for pending action
public fun handle_timeout(
    room: &mut ZKGameRoom,
    leaderboard: &mut Leaderboard,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    game::handle_timeout(room, leaderboard, clock, ctx);
}

// ============== Room Queries ==============

/// Get room basic info
public fun room_info(room: &ZKGameRoom): (
    ID,                      // room_id
    std::string::String,     // name
    address,                 // creator
    u8,                      // status
    u8,                      // current_players
    u8,                      // max_players
    u8,                      // round_number
    u8,                      // tokens_to_win
    u64,                     // deck_size
    bool,                    // is_pending_action
) {
    (
        game::room_id(room),
        game::room_name(room),
        game::room_creator(room),
        game::room_status(room),
        game::room_current_players(room),
        game::room_max_players(room),
        game::room_round_number(room),
        constants::tokens_to_win(),
        game::deck_size(room),
        game::is_pending_action(room),
    )
}

/// Get current player address
public fun current_player(room: &ZKGameRoom): address {
    game::current_player_address(room)
}

/// Get all players
public fun players(room: &ZKGameRoom): vector<address> {
    game::all_players(room)
}

/// Get player's commitment
public fun player_commitment(room: &ZKGameRoom, idx: u64): vector<u8> {
    game::player_commitment(room, idx)
}

/// Get player's discarded cards
public fun player_discarded(room: &ZKGameRoom, idx: u64): vector<u8> {
    game::player_discarded(room, idx)
}

/// Get player's alive status
public fun player_is_alive(room: &ZKGameRoom, idx: u64): bool {
    game::player_is_alive(room, idx)
}

/// Get player's token count
public fun player_tokens(room: &ZKGameRoom, idx: u64): u8 {
    game::player_tokens(room, idx)
}

/// Get all active room IDs
public fun active_rooms(registry: &RoomRegistry): vector<ID> {
    game::active_rooms(registry)
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
    bool,
    u64,
    u64,
    u64,
) {
    player_stats(leaderboard, ctx.sender())
}

/// Get total players in leaderboard
public fun total_players(leaderboard: &Leaderboard): u64 {
    leaderboard::total_players(leaderboard)
}

// ============== Constants Queries ==============

public fun max_players(): u8 { constants::max_players() }
public fun min_players(): u8 { constants::min_players() }
public fun tokens_to_win(): u8 { constants::tokens_to_win() }
public fun proof_timeout_ms(): u64 { constants::proof_timeout_ms() }

/// Get game status constants
public fun status_waiting(): u8 { constants::status_waiting() }
public fun status_playing(): u8 { constants::status_playing() }
public fun status_round_end(): u8 { constants::status_round_end() }
public fun status_finished(): u8 { constants::status_finished() }
public fun status_pending_proof(): u8 { constants::status_pending_proof() }

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
