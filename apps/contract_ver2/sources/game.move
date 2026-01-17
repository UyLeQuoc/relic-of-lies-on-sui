/// Game module for Love Letter 2019 Premium Edition (ZK Version)
/// Contains core game logic with Zero-Knowledge Proof support
/// Cards are hidden using commitments, verified with ZK proofs
#[allow(lint(self_transfer), unused_use)]
module contract::game;

use sui::balance::{Self, Balance};
use sui::coin::{Self};
use sui::sui::SUI;
use sui::clock::Clock;
use sui::groth16;
use contract::constants;
use contract::error;
use contract::events;
use contract::leaderboard::{Self, Leaderboard};

// ============== Structs ==============

/// Player state - NO plaintext cards stored, only commitments
public struct Player has store, copy, drop {
    addr: address,
    /// Commitment to current card(s): hash(card || salt)
    /// For single card: 32 bytes
    /// For two cards: 64 bytes (two commitments concatenated)
    card_commitment: vector<u8>,
    /// Number of cards in hand (1 or 2)
    hand_count: u8,
    /// Discarded cards (public info - revealed when played)
    discarded: vector<u8>,
    is_alive: bool,
    is_immune: bool,
    tokens: u8,
    has_played_spy: bool,
}

/// Pending action that requires ZK proof response
public struct PendingAction has store, copy, drop {
    action_type: u8,
    initiator_idx: u64,
    target_idx: u64,
    /// For Guard: the guessed card
    guess: std::option::Option<u8>,
    /// Deadline timestamp for proof submission
    deadline: u64,
    /// Additional data for complex actions
    extra_data: vector<u8>,
}

/// Game room with ZK support - shared object
public struct ZKGameRoom has key {
    id: UID,
    name: std::string::String,
    creator: address,
    pot: Balance<SUI>,
    players: vector<Player>,
    
    // Deck management (hidden)
    /// Merkle root commitment of shuffled deck
    deck_commitment: vector<u8>,
    /// Number of cards remaining in deck
    deck_size: u64,
    /// Who dealt/shuffled (for dispute resolution)
    dealer: address,
    /// Public cards for 2-player games
    public_cards: vector<u8>,
    
    // Game state
    status: u8,
    current_turn: u64,
    max_players: u8,
    round_number: u8,
    tokens_to_win: u8,
    
    // Pending action waiting for ZK proof
    pending_action: std::option::Option<PendingAction>,
    
    // Chancellor state
    chancellor_pending: bool,
    chancellor_player_idx: u64,
    /// Commitment to chancellor's card choices
    chancellor_commitment: vector<u8>,
}

/// Registry to track all active rooms
public struct RoomRegistry has key {
    id: UID,
    active_rooms: vector<ID>,
}

/// ZK Verification Keys - stored once, used for all games
public struct ZKVerificationKeys has key {
    id: UID,
    /// Verification key for Guard proofs
    guard_vk: vector<u8>,
    /// Verification key for Baron proofs
    baron_vk: vector<u8>,
    /// Verification key for card ownership proofs
    card_ownership_vk: vector<u8>,
    /// Prepared verification key for Guard (Sui format)
    guard_pvk: vector<u8>,
    /// Prepared verification key for Baron (Sui format)
    baron_pvk: vector<u8>,
}

// ============== Init Function ==============

fun init(ctx: &mut TxContext) {
    let registry = RoomRegistry {
        id: object::new(ctx),
        active_rooms: vector[],
    };
    transfer::share_object(registry);
    
    // Initialize empty verification keys (to be updated by admin)
    let vk = ZKVerificationKeys {
        id: object::new(ctx),
        guard_vk: vector[],
        baron_vk: vector[],
        card_ownership_vk: vector[],
        guard_pvk: vector[],
        baron_pvk: vector[],
    };
    transfer::share_object(vk);
}

// ============== Room Management ==============

/// Create a new game room
public fun create_room(
    registry: &mut RoomRegistry,
    name: std::string::String,
    max_players: u8,
    ctx: &mut TxContext,
): ID {
    assert!(error::is_valid_room_name(&name), error::empty_room_name());
    assert!(error::is_valid_max_players(max_players), error::invalid_max_players());
    
    let creator = ctx.sender();
    let room_uid = object::new(ctx);
    let room_id = room_uid.to_inner();
    
    let room = ZKGameRoom {
        id: room_uid,
        name,
        creator,
        pot: balance::zero(),
        players: vector[],
        deck_commitment: vector[],
        deck_size: 0,
        dealer: @0x0,
        public_cards: vector[],
        status: constants::status_waiting(),
        current_turn: 0,
        max_players,
        round_number: 0,
        tokens_to_win: constants::tokens_to_win(),
        pending_action: std::option::none(),
        chancellor_pending: false,
        chancellor_player_idx: 0,
        chancellor_commitment: vector[],
    };
    
    registry.active_rooms.push_back(room_id);
    
    events::emit_room_created(
        room_id,
        creator,
        room.name,
        max_players,
        constants::tokens_to_win(),
    );
    
    transfer::share_object(room);
    room_id
}

/// Join an existing room
public fun join_room(
    room: &mut ZKGameRoom,
    ctx: &mut TxContext,
) {
    let sender = ctx.sender();
    
    assert!(error::can_join_room(room.status), error::game_already_started());
    assert!(error::has_room_space(room.players.length(), room.max_players), error::room_full());
    assert!(!is_player_in_room(room, sender), error::already_in_room());
    
    let player = Player {
        addr: sender,
        card_commitment: vector[],
        hand_count: 0,
        discarded: vector[],
        is_alive: true,
        is_immune: false,
        tokens: 0,
        has_played_spy: false,
    };
    room.players.push_back(player);
    
    events::emit_player_joined(
        room.id.to_inner(),
        sender,
        room.players.length() as u8,
        room.max_players,
    );
}

// ============== Round Start (Dealer commits to deck) ==============

/// Start a new round - dealer commits to shuffled deck and deals cards
/// Called by the dealer (room creator or designated player)
/// 
/// Parameters:
/// - deck_commitment: Merkle root of shuffled deck
/// - player_commitments: Each player's initial card commitment
/// - public_cards: For 2-player games, 3 revealed cards
public fun start_round(
    room: &mut ZKGameRoom,
    deck_commitment: vector<u8>,
    player_commitments: vector<vector<u8>>,
    public_cards: vector<u8>,
    ctx: &mut TxContext,
) {
    let sender = ctx.sender();
    
    assert!(error::can_start_round(room.status), error::round_in_progress());
    assert!(error::has_enough_players(room.players.length()), error::not_enough_players());
    
    // Only creator or existing player can start
    let is_creator = sender == room.creator;
    let is_player = is_player_in_room(room, sender);
    assert!(is_creator || is_player, error::not_room_creator());
    
    let num_players = room.players.length();
    assert!(player_commitments.length() == num_players, error::invalid_commitments_count());
    
    // Validate commitment sizes
    assert!(deck_commitment.length() == constants::commitment_size(), error::invalid_commitment_size());
    num_players.do!(|i| {
        assert!(player_commitments[i].length() == constants::commitment_size(), error::invalid_commitment_size());
    });
    
    // Reset player states for new round
    num_players.do!(|i| {
        room.players[i].card_commitment = player_commitments[i];
        room.players[i].hand_count = 1;
        room.players[i].discarded = vector[];
        room.players[i].is_alive = true;
        room.players[i].is_immune = false;
        room.players[i].has_played_spy = false;
    });
    
    // First player gets 2 cards (commitment should be 64 bytes for 2 cards)
    // For simplicity, we'll handle this in the client by having first player
    // submit a combined commitment or two separate commitments
    
    // Store deck state
    room.deck_commitment = deck_commitment;
    room.deck_size = (constants::total_cards() as u64) - num_players - 1; // minus dealt cards and burn
    room.dealer = sender;
    room.public_cards = public_cards;
    
    // Reset pending action
    room.pending_action = std::option::none();
    room.chancellor_pending = false;
    
    // Set game status
    room.status = constants::status_playing();
    room.current_turn = 0;
    room.round_number = room.round_number + 1;
    
    let player_addrs = vector::tabulate!(num_players, |i| room.players[i].addr);
    
    events::emit_round_started(
        room.id.to_inner(),
        room.round_number,
        player_addrs,
        room.players[0].addr,
        sender,
        deck_commitment,
    );
}

/// Update player's card commitment (after drawing a card)
public fun update_commitment(
    room: &mut ZKGameRoom,
    new_commitment: vector<u8>,
    ctx: &mut TxContext,
) {
    let sender = ctx.sender();
    let player_idx = get_player_index(room, sender);
    
    assert!(error::is_valid_commitment_size(&new_commitment), error::invalid_commitment_size());
    
    room.players[player_idx].card_commitment = new_commitment;
    
    events::emit_card_committed(
        room.id.to_inner(),
        sender,
        new_commitment,
    );
}

// ============== Play Turn ==============

/// Play a card - reveals the card being played, updates commitment for remaining card
/// Some cards require target to respond with ZK proof
public fun play_turn(
    room: &mut ZKGameRoom,
    card: u8,
    new_commitment: vector<u8>,
    target_idx: std::option::Option<u64>,
    guess: std::option::Option<u8>,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let sender = ctx.sender();
    let room_id = room.id.to_inner();
    
    assert!(error::is_game_playing(room.status), error::game_not_started());
    assert!(room.pending_action.is_none(), error::action_already_pending());
    assert!(!room.chancellor_pending, error::chancellor_pending());
    
    let current_player_idx = room.current_turn % room.players.length();
    let current_player = &room.players[current_player_idx];
    assert!(current_player.addr == sender, error::not_your_turn());
    assert!(current_player.is_alive, error::player_eliminated());
    
    // Clear immunity at start of turn
    room.players[current_player_idx].is_immune = false;
    
    // Update commitment and hand count
    room.players[current_player_idx].card_commitment = new_commitment;
    room.players[current_player_idx].hand_count = room.players[current_player_idx].hand_count - 1;
    room.players[current_player_idx].discarded.push_back(card);
    
    // Get target address for event
    let target_addr = if (target_idx.is_some()) {
        let idx = *target_idx.borrow();
        if (idx < room.players.length()) {
            std::option::some(room.players[idx].addr)
        } else {
            std::option::none()
        }
    } else {
        std::option::none()
    };
    
    events::emit_turn_played(room_id, sender, card, target_addr, guess);
    
    // Execute card effect
    if (card == constants::card_spy()) {
        room.players[current_player_idx].has_played_spy = true;
        advance_turn_and_check(room);
    } else if (card == constants::card_guard()) {
        execute_guard(room, current_player_idx, target_idx, guess, clock);
    } else if (card == constants::card_priest()) {
        execute_priest(room, current_player_idx, target_idx);
        advance_turn_and_check(room);
    } else if (card == constants::card_baron()) {
        execute_baron(room, current_player_idx, target_idx, clock);
    } else if (card == constants::card_handmaid()) {
        room.players[current_player_idx].is_immune = true;
        advance_turn_and_check(room);
    } else if (card == constants::card_prince()) {
        execute_prince(room, current_player_idx, target_idx, clock);
    } else if (card == constants::card_chancellor()) {
        execute_chancellor(room, current_player_idx, clock);
    } else if (card == constants::card_king()) {
        execute_king(room, current_player_idx, target_idx, clock);
    } else if (card == constants::card_countess()) {
        // No effect
        advance_turn_and_check(room);
    } else if (card == constants::card_princess()) {
        eliminate_player(room, current_player_idx);
        advance_turn_and_check(room);
    };
}

// ============== Card Effects ==============

/// Guard - initiates pending action for target to prove
fun execute_guard(
    room: &mut ZKGameRoom,
    player_idx: u64,
    target_idx: std::option::Option<u64>,
    guess: std::option::Option<u8>,
    clock: &Clock,
) {
    if (all_others_immune(room, player_idx)) {
        advance_turn_and_check(room);
        return
    };
    
    assert!(target_idx.is_some(), error::target_required());
    assert!(guess.is_some(), error::guess_required());
    
    let target = *target_idx.borrow();
    let guessed_card = *guess.borrow();
    
    assert!(error::is_valid_guess(guessed_card), error::invalid_guess());
    assert!(error::is_valid_target_index(target, room.players.length()), error::invalid_target());
    assert!(target != player_idx, error::cannot_target_self());
    assert!(room.players[target].is_alive, error::target_eliminated());
    assert!(!room.players[target].is_immune, error::target_immune());
    
    let deadline = clock.timestamp_ms() + constants::proof_timeout_ms();
    
    room.pending_action = std::option::some(PendingAction {
        action_type: constants::action_guard_pending(),
        initiator_idx: player_idx,
        target_idx: target,
        guess: std::option::some(guessed_card),
        deadline,
        extra_data: vector[],
    });
    
    events::emit_guard_played(
        room.id.to_inner(),
        room.players[player_idx].addr,
        room.players[target].addr,
        guessed_card,
        deadline,
    );
}

/// Respond to Guard with ZK proof
public fun respond_guard(
    room: &mut ZKGameRoom,
    leaderboard: &mut Leaderboard,
    _vk: &ZKVerificationKeys,
    proof: vector<u8>,
    is_correct: bool,
    ctx: &mut TxContext,
) {
    let sender = ctx.sender();
    
    assert!(room.pending_action.is_some(), error::no_pending_action());
    let pending = room.pending_action.extract();
    assert!(pending.action_type == constants::action_guard_pending(), error::wrong_action_type());
    
    let target_idx = pending.target_idx;
    assert!(room.players[target_idx].addr == sender, error::not_pending_target());
    
    // TODO: Verify ZK proof using groth16
    // For now, we trust the client's is_correct value
    // In production, verify:
    // - proof proves hash(card || salt) == commitment
    // - proof proves (card == guessed_card) == is_correct
    let _ = proof; // Suppress unused warning
    
    events::emit_guard_proof_submitted(
        room.id.to_inner(),
        sender,
        is_correct,
    );
    
    if (is_correct) {
        eliminate_player(room, target_idx);
    };
    
    room.pending_action = std::option::none();
    check_round_end(room, leaderboard, ctx);
}

/// Priest - just emits event, target reveals privately to player
fun execute_priest(
    room: &ZKGameRoom,
    player_idx: u64,
    target_idx: std::option::Option<u64>,
) {
    if (all_others_immune(room, player_idx)) {
        return
    };
    
    assert!(target_idx.is_some(), error::target_required());
    let target = *target_idx.borrow();
    
    assert!(error::is_valid_target_index(target, room.players.length()), error::invalid_target());
    assert!(target != player_idx, error::cannot_target_self());
    assert!(room.players[target].is_alive, error::target_eliminated());
    assert!(!room.players[target].is_immune, error::target_immune());
    
    // Priest effect: target reveals card privately to player
    // This happens off-chain - target encrypts their card for the priest player
    events::emit_priest_played(
        room.id.to_inner(),
        room.players[player_idx].addr,
        room.players[target].addr,
    );
}

/// Baron - initiates comparison, requires proof from one party
fun execute_baron(
    room: &mut ZKGameRoom,
    player_idx: u64,
    target_idx: std::option::Option<u64>,
    clock: &Clock,
) {
    if (all_others_immune(room, player_idx)) {
        advance_turn_and_check(room);
        return
    };
    
    assert!(target_idx.is_some(), error::target_required());
    let target = *target_idx.borrow();
    
    assert!(error::is_valid_target_index(target, room.players.length()), error::invalid_target());
    assert!(target != player_idx, error::cannot_target_self());
    assert!(room.players[target].is_alive, error::target_eliminated());
    assert!(!room.players[target].is_immune, error::target_immune());
    
    let deadline = clock.timestamp_ms() + constants::proof_timeout_ms();
    
    room.pending_action = std::option::some(PendingAction {
        action_type: constants::action_baron_pending(),
        initiator_idx: player_idx,
        target_idx: target,
        guess: std::option::none(),
        deadline,
        extra_data: vector[],
    });
    
    events::emit_baron_played(
        room.id.to_inner(),
        room.players[player_idx].addr,
        room.players[target].addr,
        deadline,
    );
}

/// Respond to Baron with ZK proof of comparison result
public fun respond_baron(
    room: &mut ZKGameRoom,
    leaderboard: &mut Leaderboard,
    _vk: &ZKVerificationKeys,
    proof: vector<u8>,
    result: u8, // 0 = initiator wins, 1 = target wins, 2 = tie
    ctx: &mut TxContext,
) {
    assert!(room.pending_action.is_some(), error::no_pending_action());
    let pending = room.pending_action.extract();
    assert!(pending.action_type == constants::action_baron_pending(), error::wrong_action_type());
    
    let initiator_idx = pending.initiator_idx;
    let target_idx = pending.target_idx;
    
    // TODO: Verify ZK proof
    // Proof should verify:
    // - hash(card_a || salt_a) == commitment_a
    // - hash(card_b || salt_b) == commitment_b
    // - comparison result is correct
    let _ = proof;
    
    let loser = if (result == 0) {
        // Initiator wins, target loses
        eliminate_player(room, target_idx);
        std::option::some(room.players[target_idx].addr)
    } else if (result == 1) {
        // Target wins, initiator loses
        eliminate_player(room, initiator_idx);
        std::option::some(room.players[initiator_idx].addr)
    } else {
        // Tie
        std::option::none()
    };
    
    events::emit_baron_proof_submitted(room.id.to_inner(), result, loser);
    
    room.pending_action = std::option::none();
    check_round_end(room, leaderboard, ctx);
}

/// Prince - target must discard and draw
fun execute_prince(
    room: &mut ZKGameRoom,
    player_idx: u64,
    target_idx: std::option::Option<u64>,
    clock: &Clock,
) {
    let target = if (target_idx.is_some()) {
        *target_idx.borrow()
    } else {
        if (all_others_immune(room, player_idx)) {
            player_idx
        } else {
            assert!(false, error::target_required());
            0
        }
    };
    
    assert!(error::is_valid_target_index(target, room.players.length()), error::invalid_target());
    assert!(room.players[target].is_alive, error::target_eliminated());
    
    if (target != player_idx) {
        assert!(!room.players[target].is_immune, error::target_immune());
    };
    
    let deadline = clock.timestamp_ms() + constants::proof_timeout_ms();
    
    // Set pending action for target to reveal their discarded card
    room.pending_action = std::option::some(PendingAction {
        action_type: constants::action_prince_pending(),
        initiator_idx: player_idx,
        target_idx: target,
        guess: std::option::none(),
        deadline,
        extra_data: vector[],
    });
    
    events::emit_prince_effect_initiated(
        room.id.to_inner(),
        room.players[player_idx].addr,
        room.players[target].addr,
        deadline,
    );
}

/// Respond to Prince - reveal discarded card and new commitment
public fun respond_prince(
    room: &mut ZKGameRoom,
    leaderboard: &mut Leaderboard,
    discarded_card: u8,
    new_commitment: vector<u8>,
    ctx: &mut TxContext,
) {
    let sender = ctx.sender();
    
    assert!(room.pending_action.is_some(), error::no_pending_action());
    let pending = room.pending_action.extract();
    assert!(pending.action_type == constants::action_prince_pending(), error::wrong_action_type());
    
    let target_idx = pending.target_idx;
    assert!(room.players[target_idx].addr == sender, error::not_pending_target());
    
    // Add discarded card to public info
    room.players[target_idx].discarded.push_back(discarded_card);
    
    // Check if Princess was discarded
    if (discarded_card == constants::card_princess()) {
        eliminate_player(room, target_idx);
    } else {
        // Update commitment for new card
        room.players[target_idx].card_commitment = new_commitment;
        room.deck_size = room.deck_size - 1;
    };
    
    room.pending_action = std::option::none();
    check_round_end(room, leaderboard, ctx);
}

/// King - swap hands
fun execute_king(
    room: &mut ZKGameRoom,
    player_idx: u64,
    target_idx: std::option::Option<u64>,
    clock: &Clock,
) {
    if (all_others_immune(room, player_idx)) {
        advance_turn_and_check(room);
        return
    };
    
    assert!(target_idx.is_some(), error::target_required());
    let target = *target_idx.borrow();
    
    assert!(error::is_valid_target_index(target, room.players.length()), error::invalid_target());
    assert!(target != player_idx, error::cannot_target_self());
    assert!(room.players[target].is_alive, error::target_eliminated());
    assert!(!room.players[target].is_immune, error::target_immune());
    
    let deadline = clock.timestamp_ms() + constants::proof_timeout_ms();
    
    room.pending_action = std::option::some(PendingAction {
        action_type: constants::action_king_pending(),
        initiator_idx: player_idx,
        target_idx: target,
        guess: std::option::none(),
        deadline,
        extra_data: vector[],
    });
    
    events::emit_king_swap_initiated(
        room.id.to_inner(),
        room.players[player_idx].addr,
        room.players[target].addr,
        deadline,
    );
}

/// Respond to King - both players submit new commitments
public fun respond_king(
    room: &mut ZKGameRoom,
    leaderboard: &mut Leaderboard,
    initiator_new_commitment: vector<u8>,
    target_new_commitment: vector<u8>,
    ctx: &mut TxContext,
) {
    assert!(room.pending_action.is_some(), error::no_pending_action());
    let pending = room.pending_action.extract();
    assert!(pending.action_type == constants::action_king_pending(), error::wrong_action_type());
    
    let initiator_idx = pending.initiator_idx;
    let target_idx = pending.target_idx;
    
    // Swap commitments
    room.players[initiator_idx].card_commitment = initiator_new_commitment;
    room.players[target_idx].card_commitment = target_new_commitment;
    
    events::emit_king_swap_completed(
        room.id.to_inner(),
        room.players[initiator_idx].addr,
        room.players[target_idx].addr,
    );
    
    room.pending_action = std::option::none();
    check_round_end(room, leaderboard, ctx);
}

/// Chancellor - draw cards
fun execute_chancellor(
    room: &mut ZKGameRoom,
    player_idx: u64,
    clock: &Clock,
) {
    if (room.deck_size == 0) {
        advance_turn_and_check(room);
        return
    };
    
    let cards_to_draw = if (room.deck_size >= 2) { 2u8 } else { 1u8 };
    
    room.chancellor_pending = true;
    room.chancellor_player_idx = player_idx;
    
    let deadline = clock.timestamp_ms() + constants::proof_timeout_ms();
    
    room.pending_action = std::option::some(PendingAction {
        action_type: constants::action_chancellor_pending(),
        initiator_idx: player_idx,
        target_idx: player_idx,
        guess: std::option::none(),
        deadline,
        extra_data: vector[],
    });
    
    events::emit_chancellor_drawn(
        room.id.to_inner(),
        room.players[player_idx].addr,
        cards_to_draw,
    );
}

/// Resolve Chancellor - player submits new commitment after choosing card
public fun resolve_chancellor(
    room: &mut ZKGameRoom,
    leaderboard: &mut Leaderboard,
    new_commitment: vector<u8>,
    cards_returned: u8,
    ctx: &mut TxContext,
) {
    let sender = ctx.sender();
    
    assert!(room.chancellor_pending, error::chancellor_not_pending());
    assert!(room.players[room.chancellor_player_idx].addr == sender, error::not_your_turn());
    
    room.players[room.chancellor_player_idx].card_commitment = new_commitment;
    room.deck_size = room.deck_size - 2 + (cards_returned as u64);
    
    room.chancellor_pending = false;
    room.pending_action = std::option::none();
    
    events::emit_chancellor_returned(room.id.to_inner(), sender);
    
    check_round_end(room, leaderboard, ctx);
}

// ============== Timeout Handling ==============

/// Handle timeout when player doesn't respond to pending action
public fun handle_timeout(
    room: &mut ZKGameRoom,
    leaderboard: &mut Leaderboard,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    assert!(room.pending_action.is_some(), error::no_pending_action());
    let pending = room.pending_action.extract();
    
    assert!(clock.timestamp_ms() > pending.deadline, error::proof_timeout_not_reached());
    
    let target_idx = pending.target_idx;
    
    events::emit_proof_timeout(
        room.id.to_inner(),
        room.players[target_idx].addr,
        pending.action_type,
    );
    
    // Eliminate the player who didn't respond
    eliminate_player(room, target_idx);
    
    room.pending_action = std::option::none();
    room.chancellor_pending = false;
    
    check_round_end(room, leaderboard, ctx);
}

// ============== Helper Functions ==============

fun is_player_in_room(room: &ZKGameRoom, addr: address): bool {
    let mut found = false;
    room.players.do_ref!(|p| {
        if (p.addr == addr) {
            found = true;
        };
    });
    found
}

fun get_player_index(room: &ZKGameRoom, addr: address): u64 {
    let mut idx = 0u64;
    let num_players = room.players.length();
    num_players.do!(|i| {
        if (room.players[i].addr == addr) {
            idx = i;
        };
    });
    idx
}

fun all_others_immune(room: &ZKGameRoom, player_idx: u64): bool {
    let mut all_immune = true;
    let num_players = room.players.length();
    num_players.do!(|i| {
        if (i != player_idx && room.players[i].is_alive && !room.players[i].is_immune) {
            all_immune = false;
        };
    });
    all_immune
}

fun eliminate_player(room: &mut ZKGameRoom, player_idx: u64) {
    room.players[player_idx].is_alive = false;
    room.players[player_idx].hand_count = 0;
    
    let room_id = room.id.to_inner();
    let eliminated_addr = room.players[player_idx].addr;
    let current_player_idx = room.current_turn % room.players.length();
    let eliminator_addr = room.players[current_player_idx].addr;
    
    let card_used = if (!room.players[current_player_idx].discarded.is_empty()) {
        let len = room.players[current_player_idx].discarded.length();
        room.players[current_player_idx].discarded[len - 1]
    } else {
        0
    };
    
    events::emit_player_eliminated(room_id, eliminated_addr, eliminator_addr, card_used);
}

fun advance_turn(room: &mut ZKGameRoom) {
    let num_players = room.players.length();
    let mut next_turn = room.current_turn + 1;
    let mut attempts = 0u64;
    
    while (attempts < num_players) {
        let idx = next_turn % num_players;
        
        if (room.players[idx].is_alive) {
            room.current_turn = next_turn;
            room.players[idx].hand_count = room.players[idx].hand_count + 1;
            room.deck_size = if (room.deck_size > 0) { room.deck_size - 1 } else { 0 };
            return
        };
        next_turn = next_turn + 1;
        attempts = attempts + 1;
    };
}

fun advance_turn_and_check(room: &mut ZKGameRoom) {
    let winner_opt = check_round_winner(room);
    
    if (winner_opt.is_none()) {
        advance_turn(room);
    };
}

fun check_round_end(
    room: &mut ZKGameRoom,
    leaderboard: &mut Leaderboard,
    ctx: &mut TxContext,
) {
    let winner_opt = check_round_winner(room);
    
    if (winner_opt.is_some()) {
        resolve_round(room, leaderboard, winner_opt.destroy_some(), ctx);
    } else {
        advance_turn(room);
    };
}

fun check_round_winner(room: &ZKGameRoom): std::option::Option<u64> {
    let mut alive_count = 0u64;
    let mut last_alive_idx = 0u64;
    
    let num_players = room.players.length();
    num_players.do!(|i| {
        if (room.players[i].is_alive) {
            alive_count = alive_count + 1;
            last_alive_idx = i;
        };
    });
    
    if (alive_count == 1) {
        return std::option::some(last_alive_idx)
    };
    
    // Deck empty - need to compare hands (requires reveal)
    if (room.deck_size == 0) {
        // For ZK version, we need players to reveal their cards
        // This is handled separately
    };
    
    std::option::none()
}

fun resolve_round(
    room: &mut ZKGameRoom,
    leaderboard: &mut Leaderboard,
    winner_idx: u64,
    ctx: &mut TxContext,
) {
    let room_id = room.id.to_inner();
    let winner_addr = room.players[winner_idx].addr;
    
    room.players[winner_idx].tokens = room.players[winner_idx].tokens + 1;
    events::emit_token_awarded(room_id, winner_addr, room.players[winner_idx].tokens, b"round_win".to_string());
    
    // Check spy bonus
    let spy_bonus = check_spy_bonus(room);
    
    events::emit_round_ended(room_id, room.round_number, winner_addr, spy_bonus);
    
    let game_winner_opt = check_game_winner(room);
    
    if (game_winner_opt.is_some()) {
        resolve_game(room, leaderboard, game_winner_opt.destroy_some(), ctx);
    } else {
        room.status = constants::status_round_end();
    };
}

fun check_spy_bonus(room: &mut ZKGameRoom): std::option::Option<address> {
    let mut players_with_spy = 0u64;
    let mut spy_player_idx = 0u64;
    
    let num_players = room.players.length();
    num_players.do!(|i| {
        if (room.players[i].has_played_spy) {
            players_with_spy = players_with_spy + 1;
            spy_player_idx = i;
        };
    });
    
    if (players_with_spy == 1) {
        room.players[spy_player_idx].tokens = room.players[spy_player_idx].tokens + 1;
        events::emit_token_awarded(
            room.id.to_inner(),
            room.players[spy_player_idx].addr,
            room.players[spy_player_idx].tokens,
            b"spy_bonus".to_string()
        );
        std::option::some(room.players[spy_player_idx].addr)
    } else {
        std::option::none()
    }
}

fun check_game_winner(room: &ZKGameRoom): std::option::Option<u64> {
    let num_players = room.players.length();
    let mut winner_idx: std::option::Option<u64> = std::option::none();
    
    num_players.do!(|i| {
        if (room.players[i].tokens >= room.tokens_to_win) {
            winner_idx = std::option::some(i);
        };
    });
    
    winner_idx
}

fun resolve_game(
    room: &mut ZKGameRoom,
    leaderboard: &mut Leaderboard,
    winner_idx: u64,
    ctx: &mut TxContext,
) {
    let room_id = room.id.to_inner();
    let winner_addr = room.players[winner_idx].addr;
    let prize_pool = room.pot.value();
    let final_tokens = room.players[winner_idx].tokens;
    
    if (prize_pool > 0) {
        let prize_balance = room.pot.withdraw_all();
        let prize_coin = coin::from_balance(prize_balance, ctx);
        transfer::public_transfer(prize_coin, winner_addr);
    };
    
    leaderboard::update_winner(leaderboard, winner_addr);
    
    let num_players = room.players.length();
    num_players.do!(|i| {
        if (room.players[i].addr != winner_addr) {
            leaderboard::update_loser(leaderboard, room.players[i].addr);
        };
    });
    
    room.status = constants::status_finished();
    
    events::emit_game_ended(room_id, winner_addr, final_tokens, prize_pool, room.round_number);
}

// ============== View Functions ==============

public fun room_id(room: &ZKGameRoom): ID { room.id.to_inner() }
public fun room_name(room: &ZKGameRoom): std::string::String { room.name }
public fun room_creator(room: &ZKGameRoom): address { room.creator }
public fun room_status(room: &ZKGameRoom): u8 { room.status }
public fun room_max_players(room: &ZKGameRoom): u8 { room.max_players }
public fun room_current_players(room: &ZKGameRoom): u8 { room.players.length() as u8 }
public fun room_current_turn(room: &ZKGameRoom): u64 { room.current_turn }
public fun room_round_number(room: &ZKGameRoom): u8 { room.round_number }
public fun deck_size(room: &ZKGameRoom): u64 { room.deck_size }
public fun is_pending_action(room: &ZKGameRoom): bool { room.pending_action.is_some() }

public fun player_commitment(room: &ZKGameRoom, idx: u64): vector<u8> {
    room.players[idx].card_commitment
}

public fun player_discarded(room: &ZKGameRoom, idx: u64): vector<u8> {
    room.players[idx].discarded
}

public fun player_is_alive(room: &ZKGameRoom, idx: u64): bool {
    room.players[idx].is_alive
}

public fun player_tokens(room: &ZKGameRoom, idx: u64): u8 {
    room.players[idx].tokens
}

public fun current_player_address(room: &ZKGameRoom): address {
    let idx = room.current_turn % room.players.length();
    room.players[idx].addr
}

public fun all_players(room: &ZKGameRoom): vector<address> {
    vector::tabulate!(room.players.length(), |i| room.players[i].addr)
}

public fun active_rooms(registry: &RoomRegistry): vector<ID> {
    registry.active_rooms
}

// ============== Test Functions ==============

#[test_only]
public fun init_for_testing(ctx: &mut TxContext) {
    init(ctx);
}
