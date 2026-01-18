/// Game module for Relic Of Lies  with Seal Encryption
/// Contains core game logic with encrypted cards and pending action pattern
#[allow(lint(self_transfer))]
module contract_v4::game;

use sui::balance::{Self, Balance};
use sui::coin::{Self};
use sui::sui::SUI;
use contract_v4::constants;
use contract_v4::error;
use contract_v4::events;
use contract_v4::utils;
use contract_v4::decryptable::{Self, Decryptable};
use contract_v4::seal_access::{Self, SealAccessState};
use contract_v4::leaderboard::{Self, Leaderboard};

// ============== Structs ==============

/// Player state in a game
public struct Player has store, copy, drop {
    addr: address,
    /// Card indices in hand (NOT card values - values are encrypted)
    hand: vector<u64>,
    /// Revealed discarded cards (values visible after discard)
    discarded: vector<u8>,
    is_alive: bool,
    is_immune: bool,
    tokens: u8,
    has_played_spy: bool,
}

/// Pending action that requires response
public struct PendingAction has store, copy, drop {
    action_type: u8,
    /// Player who initiated the action
    initiator: address,
    initiator_idx: u64,
    /// Player who needs to respond
    responder: address,
    responder_idx: u64,
    /// Additional data (e.g., guess for Guard, attacker's card value for Baron)
    data: vector<u8>,
    /// Card index involved (target's card)
    card_index: u64,
}

/// Discarded card entry for game log
public struct DiscardedCardEntry has store, copy, drop {
    /// Player who discarded the card
    player_addr: address,
    player_idx: u64,
    /// Card value
    card_value: u8,
    /// Card index in encrypted_cards
    card_index: u64,
    /// Turn number when discarded
    turn_number: u64,
    /// Reason for discard (played, prince_effect, baron_loss, etc.)
    reason: std::string::String,
}

/// Game room with Seal integration - shared object
public struct GameRoom has key {
    id: UID,
    name: std::string::String,
    creator: address,
    pot: Balance<SUI>,
    players: vector<Player>,
    
    // ============== Encrypted Deck State ==============
    /// All 21 encrypted cards
    encrypted_cards: vector<Decryptable>,
    /// Remaining card indices in deck (not dealt yet)
    deck_indices: vector<u64>,
    /// Burn card index
    burn_card_index: std::option::Option<u64>,
    /// Public card indices for 2-player game
    public_card_indices: vector<u64>,
    /// Revealed card values (after decryption)
    revealed_values: vector<std::option::Option<u8>>,
    
    // ============== Game State ==============
    status: u8,
    current_turn: u64,
    max_players: u8,
    round_number: u8,
    tokens_to_win: u8,
    
    // ============== Game Log ==============
    /// Ordered list of discarded cards for game log
    discarded_cards_log: vector<DiscardedCardEntry>,
    
    // ============== Pending Actions ==============
    pending_action: std::option::Option<PendingAction>,
    
    // ============== Chancellor State ==============
    chancellor_pending: bool,
    chancellor_player_idx: u64,
    chancellor_card_indices: vector<u64>,
    
    // ============== Seal Access Control ==============
    seal_access: SealAccessState,
}

/// Registry to track all active rooms
public struct RoomRegistry has key {
    id: UID,
    active_rooms: vector<ID>,
}

// ============== Init Function ==============

fun init(ctx: &mut TxContext) {
    let registry = RoomRegistry {
        id: object::new(ctx),
        active_rooms: vector[],
    };
    transfer::share_object(registry);
}

// ============== Entry Functions ==============

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
    
    // Create Seal namespace from room ID
    let namespace = room_id.to_bytes();
    
    let room = GameRoom {
        id: room_uid,
        name,
        creator,
        pot: balance::zero(),
        players: vector[],
        
        // Encrypted deck (initialized when deck is submitted)
        encrypted_cards: vector[],
        deck_indices: vector[],
        burn_card_index: std::option::none(),
        public_card_indices: vector[],
        revealed_values: vector[],
        
        // Game state
        status: constants::status_waiting(),
        current_turn: 0,
        max_players,
        round_number: 0,
        tokens_to_win: constants::tokens_to_win(),
        
        // Game log
        discarded_cards_log: vector[],
        
        // Pending actions
        pending_action: std::option::none(),
        
        // Chancellor state
        chancellor_pending: false,
        chancellor_player_idx: 0,
        chancellor_card_indices: vector[],
        
        // Seal access control
        seal_access: seal_access::new(namespace),
    };
    
    registry.active_rooms.push_back(room_id);
    
    events::emit_room_created(
        room_id,
        creator,
        room.name,
        max_players,
        constants::entry_fee(),
        constants::tokens_to_win(),
    );
    
    transfer::share_object(room);
    room_id
}

/// Join an existing room
public fun join_room(
    room: &mut GameRoom,
    ctx: &mut TxContext,
) {
    let sender = ctx.sender();
    
    assert!(error::can_join_room(room.status), error::game_already_started());
    assert!(error::has_room_space(room.players.length(), room.max_players), error::room_full());
    assert!(!is_player_in_room(room, sender), error::already_in_room());
    
    let player = Player {
        addr: sender,
        hand: vector[],
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

/// Start a completely new game (reset everything including tokens)
/// Can only be called when game is finished
public fun start_new_game(
    room: &mut GameRoom,
    ctx: &mut TxContext,
) {
    let sender = ctx.sender();
    let room_id = room.id.to_inner();
    
    // Only allow when game is finished
    assert!(room.status == constants::status_finished(), error::game_not_finished());
    
    // Only creator or a player can start new game
    let is_creator = sender == room.creator;
    let is_player = is_player_in_room(room, sender);
    assert!(is_creator || is_player, error::not_room_creator());
    
    // Reset all players
    let num_players = room.players.length();
    let mut i = 0u64;
    while (i < num_players) {
        room.players[i].hand = vector[];
        room.players[i].discarded = vector[];
        room.players[i].is_alive = true;
        room.players[i].is_immune = false;
        room.players[i].tokens = 0;
        room.players[i].has_played_spy = false;
        i = i + 1;
    };
    
    // Reset game state
    room.encrypted_cards = vector[];
    room.deck_indices = vector[];
    room.burn_card_index = std::option::none();
    room.public_card_indices = vector[];
    room.revealed_values = vector[];
    room.status = constants::status_waiting();
    room.current_turn = 0;
    room.round_number = 0;
    room.discarded_cards_log = vector[];
    room.pending_action = std::option::none();
    room.chancellor_pending = false;
    room.chancellor_player_idx = 0;
    room.chancellor_card_indices = vector[];
    
    // Reset Seal access with same namespace
    let namespace = room_id.to_bytes();
    room.seal_access = seal_access::new(namespace);
    
    events::emit_new_game_started(room_id, sender);
}

/// Submit encrypted deck (called by frontend after local shuffle and encryption)
public fun submit_encrypted_deck(
    room: &mut GameRoom,
    ciphertexts: vector<vector<u8>>,
    hashes: vector<vector<u8>>,
    nonces: vector<vector<u8>>,
    ctx: &mut TxContext,
) {
    let sender = ctx.sender();
    let room_id = room.id.to_inner();
    
    // Verify game state
    assert!(error::can_start_round(room.status), error::round_in_progress());
    assert!(error::has_enough_players(room.players.length()), error::not_enough_players());
    assert!(room.encrypted_cards.is_empty(), error::deck_already_submitted());
    
    // Verify sender is creator or player
    let is_creator = sender == room.creator;
    let is_player = is_player_in_room(room, sender);
    assert!(is_creator || is_player, error::not_room_creator());
    
    // Verify deck size
    let total_cards = constants::total_cards() as u64;
    assert!(ciphertexts.length() == total_cards, error::invalid_deck_size());
    assert!(hashes.length() == total_cards, error::invalid_deck_size());
    assert!(nonces.length() == total_cards, error::invalid_deck_size());
    
    // Create encrypted cards
    total_cards.do!(|i| {
        let encrypted = decryptable::new(ciphertexts[i], hashes[i], nonces[i]);
        room.encrypted_cards.push_back(encrypted);
        room.revealed_values.push_back(std::option::none());
    });
    
    // Initialize deck indices (0 to total_cards-1)
    total_cards.do!(|i| {
        room.deck_indices.push_back(i);
    });
    
    events::emit_deck_submitted(room_id, sender, total_cards);
    
    // Start the round
    start_round_internal(room, ctx);
}

/// Internal function to start round after deck submission
fun start_round_internal(room: &mut GameRoom, _ctx: &mut TxContext) {
    let room_id = room.id.to_inner();
    let num_players = room.players.length();
    
    // Reset player states
    num_players.do!(|i| {
        room.players[i].hand = vector[];
        room.players[i].discarded = vector[];
        room.players[i].is_alive = true;
        room.players[i].is_immune = false;
        room.players[i].has_played_spy = false;
    });
    
    // Reset pending actions
    room.pending_action = std::option::none();
    room.chancellor_pending = false;
    room.chancellor_player_idx = 0;
    room.chancellor_card_indices = vector[];
    
    // Reset Seal access state
    room.seal_access = seal_access::new(room_id.to_bytes());
    
    // Burn one card
    let burn_idx = utils::draw_card_index(&mut room.deck_indices);
    room.burn_card_index = burn_idx;
    
    // For 2-player games, set aside 3 public cards
    room.public_card_indices = vector[];
    if (num_players == 2) {
        (constants::two_player_public_cards() as u64).do!(|_| {
            let card_idx_opt = utils::draw_card_index(&mut room.deck_indices);
            if (card_idx_opt.is_some()) {
                room.public_card_indices.push_back(card_idx_opt.destroy_some());
            };
        });
    };
    
    // Deal cards to players
    num_players.do!(|i| {
        // Deal 1 card to each player
        let card_idx_opt = utils::draw_card_index(&mut room.deck_indices);
        if (card_idx_opt.is_some()) {
            let card_idx = card_idx_opt.destroy_some();
            room.players[i].hand.push_back(card_idx);
            
            // Register card ownership for Seal
            seal_access::register_card(&mut room.seal_access, card_idx, room.players[i].addr);
        };
    });
    
    // Draw second card for first player
    let first_card_opt = utils::draw_card_index(&mut room.deck_indices);
    if (first_card_opt.is_some()) {
        let card_idx = first_card_opt.destroy_some();
        room.players[0].hand.push_back(card_idx);
        seal_access::register_card(&mut room.seal_access, card_idx, room.players[0].addr);
    };
    
    // Set game status
    room.status = constants::status_playing();
    room.current_turn = 0;
    room.round_number = room.round_number + 1;
    
    let player_addrs = vector::tabulate!(num_players, |i| room.players[i].addr);
    
    events::emit_round_started(
        room_id,
        room.round_number,
        player_addrs,
        room.players[0].addr,
        room.public_card_indices,
    );
}

/// Play a turn - player reveals card value with proof
public fun play_turn(
    room: &mut GameRoom,
    leaderboard: &mut Leaderboard,
    card_index: u64,
    plaintext_data: vector<u8>,
    target_idx: std::option::Option<u64>,
    guess: std::option::Option<u8>,
    ctx: &mut TxContext,
) {
    let sender = ctx.sender();
    let room_id = room.id.to_inner();
    
    assert!(error::is_game_playing(room.status), error::game_not_started());
    assert!(room.pending_action.is_none(), error::pending_action());
    assert!(!room.chancellor_pending, error::chancellor_pending());
    
    let current_player_idx = room.current_turn % room.players.length();
    let current_player = &room.players[current_player_idx];
    assert!(current_player.addr == sender, error::not_your_turn());
    assert!(current_player.is_alive, error::player_eliminated());
    
    // Clear immunity at start of turn
    room.players[current_player_idx].is_immune = false;
    
    // Verify player has this card index in hand
    assert!(utils::contains(&room.players[current_player_idx].hand, &card_index), error::card_not_in_hand());
    
    // Decrypt and verify the card
    decryptable::decrypt(&mut room.encrypted_cards[card_index], plaintext_data);
    let card_value = decryptable::extract_card_value(&room.encrypted_cards[card_index]);
    
    // Store revealed value
    set_revealed_value(&mut room.revealed_values, card_index, card_value);
    
    // Check Countess rule
    let has_countess = hand_contains_value(room, current_player_idx, constants::card_countess());
    let has_king = hand_contains_value(room, current_player_idx, constants::card_king());
    let has_prince = hand_contains_value(room, current_player_idx, constants::card_prince());
    
    if (has_countess && (has_king || has_prince)) {
        assert!(card_value == constants::card_countess(), error::must_discard_countess());
    };
    
    // Remove card from hand and add revealed value to discarded
    utils::remove_first(&mut room.players[current_player_idx].hand, &card_index);
    room.players[current_player_idx].discarded.push_back(card_value);
    
    // Log the discard
    log_discard(room, sender, current_player_idx, card_value, card_index, b"played".to_string());
    
    // Remove from Seal access
    seal_access::remove_card(&mut room.seal_access, card_index);
    seal_access::reveal_card(&mut room.seal_access, card_index);
    
    // Track Spy play
    if (card_value == constants::card_spy()) {
        room.players[current_player_idx].has_played_spy = true;
    };
    
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
    
    // Execute card effect
    let result = execute_card_effect(room, current_player_idx, card_value, target_idx, guess);
    
    events::emit_turn_played(room_id, sender, card_value, card_index, target_addr, guess, result);
    
    // If pending action or chancellor, don't advance turn yet
    if (room.pending_action.is_some() || room.chancellor_pending) {
        return
    };
    
    check_round_end(room, leaderboard, ctx);
}

/// Respond to Guard guess
public fun respond_guard(
    room: &mut GameRoom,
    leaderboard: &mut Leaderboard,
    card_index: u64,
    plaintext_data: vector<u8>,
    ctx: &mut TxContext,
) {
    let sender = ctx.sender();
    let room_id = room.id.to_inner();
    
    assert!(room.pending_action.is_some(), error::no_pending_action());
    let pending = room.pending_action.borrow();
    assert!(pending.action_type == constants::pending_guard_response(), error::invalid_response());
    assert!(pending.responder == sender, error::not_pending_responder());
    
    // Decrypt and verify the card
    decryptable::decrypt(&mut room.encrypted_cards[card_index], plaintext_data);
    let revealed_value = decryptable::extract_card_value(&room.encrypted_cards[card_index]);
    
    // Store revealed value
    set_revealed_value(&mut room.revealed_values, card_index, revealed_value);
    
    // Get the guess from pending action
    let guess = pending.data[0];
    let attacker_idx = pending.initiator_idx;
    let responder_idx = pending.responder_idx;
    
    // Clear pending action
    room.pending_action = std::option::none();
    
    // Check if guess is correct
    let guess_correct = guess == revealed_value;
    
    events::emit_guard_response(room_id, sender, revealed_value, guess_correct);
    
    if (guess_correct) {
        // Eliminate responder
        eliminate_player(room, responder_idx, attacker_idx, constants::card_guard());
    };
    
    check_round_end(room, leaderboard, ctx);
}

/// Respond to Baron comparison
public fun respond_baron(
    room: &mut GameRoom,
    leaderboard: &mut Leaderboard,
    card_index: u64,
    plaintext_data: vector<u8>,
    ctx: &mut TxContext,
) {
    let sender = ctx.sender();
    let room_id = room.id.to_inner();
    
    assert!(room.pending_action.is_some(), error::no_pending_action());
    let pending = room.pending_action.borrow();
    assert!(pending.action_type == constants::pending_baron_response(), error::invalid_response());
    assert!(pending.responder == sender, error::not_pending_responder());
    
    // Decrypt and verify the card
    decryptable::decrypt(&mut room.encrypted_cards[card_index], plaintext_data);
    let revealed_value = decryptable::extract_card_value(&room.encrypted_cards[card_index]);
    
    // Store revealed value
    set_revealed_value(&mut room.revealed_values, card_index, revealed_value);
    
    // Get attacker's card value from pending action
    let attacker_card = pending.data[0];
    let attacker_idx = pending.initiator_idx;
    let responder_idx = pending.responder_idx;
    
    // Clear pending action
    room.pending_action = std::option::none();
    
    // Determine loser
    let loser = if (attacker_card > revealed_value) {
        std::option::some(room.players[responder_idx].addr)
    } else if (revealed_value > attacker_card) {
        std::option::some(room.players[attacker_idx].addr)
    } else {
        std::option::none()
    };
    
    events::emit_baron_comparison(
        room_id,
        room.players[attacker_idx].addr,
        attacker_card,
        room.players[responder_idx].addr,
        revealed_value,
        loser,
    );
    
    // Eliminate loser
    if (attacker_card > revealed_value) {
        eliminate_player(room, responder_idx, attacker_idx, constants::card_baron());
    } else if (revealed_value > attacker_card) {
        eliminate_player(room, attacker_idx, responder_idx, constants::card_baron());
    };
    
    check_round_end(room, leaderboard, ctx);
}

/// Respond to Prince discard
public fun respond_prince(
    room: &mut GameRoom,
    leaderboard: &mut Leaderboard,
    card_index: u64,
    plaintext_data: vector<u8>,
    ctx: &mut TxContext,
) {
    let sender = ctx.sender();
    let room_id = room.id.to_inner();
    
    assert!(room.pending_action.is_some(), error::no_pending_action());
    let pending = room.pending_action.borrow();
    assert!(pending.action_type == constants::pending_prince_response(), error::invalid_response());
    assert!(pending.responder == sender, error::not_pending_responder());
    
    // Decrypt and verify the card
    decryptable::decrypt(&mut room.encrypted_cards[card_index], plaintext_data);
    let revealed_value = decryptable::extract_card_value(&room.encrypted_cards[card_index]);
    
    // Store revealed value
    set_revealed_value(&mut room.revealed_values, card_index, revealed_value);
    
    let attacker_idx = pending.initiator_idx;
    let responder_idx = pending.responder_idx;
    
    // Clear pending action
    room.pending_action = std::option::none();
    
    // Remove card from hand and add to discarded
    utils::remove_first(&mut room.players[responder_idx].hand, &card_index);
    room.players[responder_idx].discarded.push_back(revealed_value);
    
    // Log the discard
    log_discard(room, sender, responder_idx, revealed_value, card_index, b"prince_effect".to_string());
    
    // Remove from Seal access
    seal_access::remove_card(&mut room.seal_access, card_index);
    
    events::emit_prince_response(room_id, sender, revealed_value);
    
    // Check if Princess was discarded
    if (revealed_value == constants::card_princess()) {
        eliminate_player(room, responder_idx, attacker_idx, constants::card_prince());
    } else {
        // Draw new card for target
        let new_card_opt = utils::draw_card_index(&mut room.deck_indices);
        if (new_card_opt.is_some()) {
            let new_card_idx = new_card_opt.destroy_some();
            room.players[responder_idx].hand.push_back(new_card_idx);
            seal_access::register_card(&mut room.seal_access, new_card_idx, room.players[responder_idx].addr);
        } else if (room.burn_card_index.is_some()) {
            let burn_idx = *room.burn_card_index.borrow();
            room.players[responder_idx].hand.push_back(burn_idx);
            seal_access::register_card(&mut room.seal_access, burn_idx, room.players[responder_idx].addr);
            room.burn_card_index = std::option::none();
        };
    };
    
    check_round_end(room, leaderboard, ctx);
}

/// Resolve Chancellor action
public fun resolve_chancellor(
    room: &mut GameRoom,
    leaderboard: &mut Leaderboard,
    keep_card_index: u64,
    return_indices: vector<u64>,
    ctx: &mut TxContext,
) {
    let sender = ctx.sender();
    let room_id = room.id.to_inner();
    
    assert!(room.chancellor_pending, error::chancellor_not_pending());
    assert!(room.players[room.chancellor_player_idx].addr == sender, error::not_your_turn());
    
    // Verify keep_card_index is in chancellor_card_indices
    assert!(utils::contains(&room.chancellor_card_indices, &keep_card_index), error::chancellor_invalid_selection());
    
    // Verify return_indices are valid
    assert!(return_indices.length() == room.chancellor_card_indices.length() - 1, error::chancellor_must_keep_one());
    
    // Check each return index is valid and not the kept card
    let mut i = 0u64;
    while (i < return_indices.length()) {
        let return_idx = return_indices[i];
        assert!(utils::contains(&room.chancellor_card_indices, &return_idx), error::chancellor_invalid_selection());
        // Cannot return the card you're keeping (compare by index, not value)
        assert!(return_idx != keep_card_index, error::chancellor_cannot_return_kept_card());
        i = i + 1;
    };
    
    // Update player's hand to only keep selected card
    room.players[room.chancellor_player_idx].hand = vector[keep_card_index];
    
    // Update Seal access - remove returned cards
    return_indices.do_ref!(|idx| {
        seal_access::remove_card(&mut room.seal_access, *idx);
    });
    
    // Return cards to bottom of deck
    utils::insert_indices_at_bottom(&mut room.deck_indices, return_indices);
    
    // Clear chancellor state
    room.chancellor_pending = false;
    room.chancellor_card_indices = vector[];
    
    events::emit_chancellor_return(room_id, sender);
    
    check_round_end(room, leaderboard, ctx);
}

// ============== Card Effect Execution ==============

fun execute_card_effect(
    room: &mut GameRoom,
    player_idx: u64,
    card: u8,
    target_idx: std::option::Option<u64>,
    guess: std::option::Option<u8>,
): std::string::String {
    if (card == constants::card_spy()) {
        execute_spy()
    } else if (card == constants::card_guard()) {
        execute_guard(room, player_idx, target_idx, guess)
    } else if (card == constants::card_priest()) {
        execute_priest(room, player_idx, target_idx)
    } else if (card == constants::card_baron()) {
        execute_baron(room, player_idx, target_idx)
    } else if (card == constants::card_handmaid()) {
        execute_handmaid(room, player_idx)
    } else if (card == constants::card_prince()) {
        execute_prince(room, player_idx, target_idx)
    } else if (card == constants::card_chancellor()) {
        execute_chancellor(room, player_idx)
    } else if (card == constants::card_king()) {
        execute_king(room, player_idx, target_idx)
    } else if (card == constants::card_countess()) {
        execute_countess()
    } else if (card == constants::card_princess()) {
        execute_princess(room, player_idx)
    } else {
        b"Invalid card".to_string()
    }
}

/// Spy (0): No immediate effect
fun execute_spy(): std::string::String {
    b"Spy played - check for bonus at round end".to_string()
}

/// Guard (1): Set pending response for target to reveal
fun execute_guard(
    room: &mut GameRoom,
    player_idx: u64,
    target_idx: std::option::Option<u64>,
    guess: std::option::Option<u8>,
): std::string::String {
    if (all_others_immune(room, player_idx)) {
        return b"All players immune, no effect".to_string()
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
    
    // Set pending action - target must respond with reveal
    let pending = PendingAction {
        action_type: constants::pending_guard_response(),
        initiator: room.players[player_idx].addr,
        initiator_idx: player_idx,
        responder: room.players[target].addr,
        responder_idx: target,
        data: vector[guessed_card],
        card_index: room.players[target].hand[0],
    };
    room.pending_action = std::option::some(pending);
    
    events::emit_pending_guard_response(
        room.id.to_inner(),
        room.players[player_idx].addr,
        room.players[target].addr,
        guessed_card,
    );
    
    b"Guard played - waiting for target response".to_string()
}

/// Priest (2): Grant temporary access to view target's card
fun execute_priest(
    room: &mut GameRoom,
    player_idx: u64,
    target_idx: std::option::Option<u64>,
): std::string::String {
    if (all_others_immune(room, player_idx)) {
        return b"All players immune, no effect".to_string()
    };
    
    assert!(target_idx.is_some(), error::target_required());
    let target = *target_idx.borrow();
    
    assert!(error::is_valid_target_index(target, room.players.length()), error::invalid_target());
    assert!(target != player_idx, error::cannot_target_self());
    assert!(room.players[target].is_alive, error::target_eliminated());
    assert!(!room.players[target].is_immune, error::target_immune());
    
    // Grant temporary access via Seal
    let target_card_index = room.players[target].hand[0];
    seal_access::grant_temporary_access(
        &mut room.seal_access,
        room.players[player_idx].addr,
        target_card_index,
        2, // Access for 2 turns
    );
    
    events::emit_temporary_access_granted(
        room.id.to_inner(),
        room.players[player_idx].addr,
        target_card_index,
        room.current_turn + 2,
    );
    
    b"Priest played - you can now view target's card via Seal".to_string()
}

/// Baron (3): Set pending response for comparison
fun execute_baron(
    room: &mut GameRoom,
    player_idx: u64,
    target_idx: std::option::Option<u64>,
): std::string::String {
    if (all_others_immune(room, player_idx)) {
        return b"All players immune, no effect".to_string()
    };
    
    assert!(target_idx.is_some(), error::target_required());
    let target = *target_idx.borrow();
    
    assert!(error::is_valid_target_index(target, room.players.length()), error::invalid_target());
    assert!(target != player_idx, error::cannot_target_self());
    assert!(room.players[target].is_alive, error::target_eliminated());
    assert!(!room.players[target].is_immune, error::target_immune());
    
    // Get attacker's remaining card value (already revealed when played)
    let attacker_card_idx = room.players[player_idx].hand[0];
    let attacker_card_value = if (room.revealed_values[attacker_card_idx].is_some()) {
        *room.revealed_values[attacker_card_idx].borrow()
    } else {
        // This shouldn't happen in normal flow, but handle it
        0
    };
    
    let pending = PendingAction {
        action_type: constants::pending_baron_response(),
        initiator: room.players[player_idx].addr,
        initiator_idx: player_idx,
        responder: room.players[target].addr,
        responder_idx: target,
        data: vector[attacker_card_value],
        card_index: room.players[target].hand[0],
    };
    room.pending_action = std::option::some(pending);
    
    events::emit_pending_baron_response(
        room.id.to_inner(),
        room.players[player_idx].addr,
        attacker_card_value,
        room.players[target].addr,
    );
    
    b"Baron played - waiting for comparison".to_string()
}

/// Handmaid (4): Become immune
fun execute_handmaid(
    room: &mut GameRoom,
    player_idx: u64,
): std::string::String {
    room.players[player_idx].is_immune = true;
    b"Protected until your next turn".to_string()
}

/// Prince (5): Set pending response for target to reveal and discard
fun execute_prince(
    room: &mut GameRoom,
    player_idx: u64,
    target_idx: std::option::Option<u64>,
): std::string::String {
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
    
    // Set pending action for target to reveal their card
    let pending = PendingAction {
        action_type: constants::pending_prince_response(),
        initiator: room.players[player_idx].addr,
        initiator_idx: player_idx,
        responder: room.players[target].addr,
        responder_idx: target,
        data: vector[],
        card_index: room.players[target].hand[0],
    };
    room.pending_action = std::option::some(pending);
    
    events::emit_pending_prince_response(
        room.id.to_inner(),
        room.players[player_idx].addr,
        room.players[target].addr,
    );
    
    b"Prince played - waiting for target to discard".to_string()
}

/// Chancellor (6): Draw 2 cards, keep 1, return 2
fun execute_chancellor(
    room: &mut GameRoom,
    player_idx: u64,
): std::string::String {
    let mut drawn_indices = vector[];
    let mut draws_left = 2u8;
    
    while (draws_left > 0 && !room.deck_indices.is_empty()) {
        let card_idx_opt = utils::draw_card_index(&mut room.deck_indices);
        if (card_idx_opt.is_some()) {
            let card_idx = card_idx_opt.destroy_some();
            drawn_indices.push_back(card_idx);
            // Register temporary ownership for viewing
            seal_access::register_card(&mut room.seal_access, card_idx, room.players[player_idx].addr);
        };
        draws_left = draws_left - 1;
    };
    
    if (drawn_indices.is_empty()) {
        return b"Deck empty, no cards to draw".to_string()
    };
    
    // Combine with hand
    let mut all_cards = room.players[player_idx].hand;
    drawn_indices.do_ref!(|idx| {
        all_cards.push_back(*idx);
    });
    
    events::emit_chancellor_draw(
        room.id.to_inner(),
        room.players[player_idx].addr,
        drawn_indices,
    );
    
    room.chancellor_pending = true;
    room.chancellor_player_idx = player_idx;
    room.chancellor_card_indices = all_cards;
    
    // Clear hand temporarily
    room.players[player_idx].hand = vector[];
    
    b"Drew cards - select one to keep".to_string()
}

/// King (7): Swap hands
fun execute_king(
    room: &mut GameRoom,
    player_idx: u64,
    target_idx: std::option::Option<u64>,
): std::string::String {
    if (all_others_immune(room, player_idx)) {
        return b"All players immune, no effect".to_string()
    };
    
    assert!(target_idx.is_some(), error::target_required());
    let target = *target_idx.borrow();
    
    assert!(error::is_valid_target_index(target, room.players.length()), error::invalid_target());
    assert!(target != player_idx, error::cannot_target_self());
    assert!(room.players[target].is_alive, error::target_eliminated());
    assert!(!room.players[target].is_immune, error::target_immune());
    
    // Get card indices before swap
    let player_card_idx = if (!room.players[player_idx].hand.is_empty()) {
        room.players[player_idx].hand[0]
    } else { 0 };
    
    let target_card_idx = if (!room.players[target].hand.is_empty()) {
        room.players[target].hand[0]
    } else { 0 };
    
    // Swap hands
    let player_hand = room.players[player_idx].hand;
    room.players[player_idx].hand = room.players[target].hand;
    room.players[target].hand = player_hand;
    
    // Update Seal access - swap ownership
    seal_access::swap_ownership(&mut room.seal_access, player_card_idx, target_card_idx);
    
    events::emit_hands_swapped(
        room.id.to_inner(),
        room.players[player_idx].addr,
        room.players[target].addr,
        target_card_idx,
        player_card_idx,
    );
    
    b"Hands swapped".to_string()
}

/// Countess (8): No effect
fun execute_countess(): std::string::String {
    b"Countess discarded, no effect".to_string()
}

/// Princess (9): Instant elimination
fun execute_princess(
    room: &mut GameRoom,
    player_idx: u64,
): std::string::String {
    eliminate_player(room, player_idx, player_idx, constants::card_princess());
    b"Princess discarded! You are eliminated".to_string()
}

// ============== Helper Functions ==============

/// Helper to set revealed value at index (Move doesn't support index assignment)
fun set_revealed_value(revealed_values: &mut vector<std::option::Option<u8>>, index: u64, value: u8) {
    let old_value = revealed_values.remove(index);
    old_value; // Consume old value
    revealed_values.insert(std::option::some(value), index);
}

/// Helper to log a discarded card
fun log_discard(
    room: &mut GameRoom,
    player_addr: address,
    player_idx: u64,
    card_value: u8,
    card_index: u64,
    reason: std::string::String,
) {
    let entry = DiscardedCardEntry {
        player_addr,
        player_idx,
        card_value,
        card_index,
        turn_number: room.current_turn,
        reason,
    };
    room.discarded_cards_log.push_back(entry);
}

fun is_player_in_room(room: &GameRoom, addr: address): bool {
    let mut found = false;
    room.players.do_ref!(|p| {
        if (p.addr == addr) {
            found = true;
        };
    });
    found
}

fun all_others_immune(room: &GameRoom, player_idx: u64): bool {
    let mut all_immune = true;
    let num_players = room.players.length();
    num_players.do!(|i| {
        if (i != player_idx && room.players[i].is_alive && !room.players[i].is_immune) {
            all_immune = false;
        };
    });
    all_immune
}

/// Check if player's hand contains a specific card value (using revealed_values)
fun hand_contains_value(room: &GameRoom, player_idx: u64, value: u8): bool {
    let mut contains = false;
    room.players[player_idx].hand.do_ref!(|card_idx| {
        if (room.revealed_values[*card_idx].is_some()) {
            if (*room.revealed_values[*card_idx].borrow() == value) {
                contains = true;
            };
        };
    });
    contains
}

fun eliminate_player(room: &mut GameRoom, player_idx: u64, eliminator_idx: u64, card_used: u8) {
    let player_addr = room.players[player_idx].addr;
    room.players[player_idx].is_alive = false;
    
    // Discard all cards in hand (values will be revealed when responded)
    while (!room.players[player_idx].hand.is_empty()) {
        let card_idx = room.players[player_idx].hand.pop_back();
        // If card is already revealed, add to discarded and log
        if (room.revealed_values[card_idx].is_some()) {
            let card_value = *room.revealed_values[card_idx].borrow();
            room.players[player_idx].discarded.push_back(card_value);
            log_discard(room, player_addr, player_idx, card_value, card_idx, b"eliminated".to_string());
        };
        seal_access::remove_card(&mut room.seal_access, card_idx);
    };
    
    events::emit_player_eliminated(
        room.id.to_inner(),
        player_addr,
        room.players[eliminator_idx].addr,
        card_used,
    );
}

fun advance_turn(room: &mut GameRoom) {
    let num_players = room.players.length();
    let mut next_turn = room.current_turn + 1;
    let mut attempts = 0u64;
    
    while (attempts < num_players) {
        let idx = next_turn % num_players;
        
        if (room.players[idx].is_alive) {
            room.current_turn = next_turn;
            seal_access::advance_turn(&mut room.seal_access);
            
            // Draw a card for next player
            if (!room.deck_indices.is_empty()) {
                let drawn_idx_opt = utils::draw_card_index(&mut room.deck_indices);
                if (drawn_idx_opt.is_some()) {
                    let drawn_idx = drawn_idx_opt.destroy_some();
                    room.players[idx].hand.push_back(drawn_idx);
                    seal_access::register_card(&mut room.seal_access, drawn_idx, room.players[idx].addr);
                };
            } else if (room.burn_card_index.is_some()) {
                let burn_idx = *room.burn_card_index.borrow();
                room.players[idx].hand.push_back(burn_idx);
                seal_access::register_card(&mut room.seal_access, burn_idx, room.players[idx].addr);
                room.burn_card_index = std::option::none();
            };
            
            return
        };
        next_turn = next_turn + 1;
        attempts = attempts + 1;
    };
}

fun check_round_end(
    room: &mut GameRoom,
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

fun check_round_winner(room: &GameRoom): std::option::Option<u64> {
    let mut alive_count = 0u64;
    let mut last_alive_idx = 0u64;
    
    let num_players = room.players.length();
    num_players.do!(|i| {
        if (room.players[i].is_alive) {
            alive_count = alive_count + 1;
            last_alive_idx = i;
        };
    });
    
    // Only one player alive
    if (alive_count == 1) {
        return std::option::some(last_alive_idx)
    };
    
    // Deck empty - compare hands
    if (room.deck_indices.is_empty() && room.burn_card_index.is_none()) {
        let mut all_have_one_card = true;
        num_players.do!(|i| {
            if (room.players[i].is_alive && room.players[i].hand.length() != 1) {
                all_have_one_card = false;
            };
        });
        
        if (all_have_one_card) {
            let mut highest_card = 0u8;
            let mut highest_sum = 0u64;
            let mut winner_idx = 0u64;
            
            num_players.do!(|i| {
                if (room.players[i].is_alive && !room.players[i].hand.is_empty()) {
                    let card_idx = room.players[i].hand[0];
                    // Use revealed value if available
                    let card_value = if (room.revealed_values[card_idx].is_some()) {
                        *room.revealed_values[card_idx].borrow()
                    } else {
                        0 // Card not revealed yet
                    };
                    let discard_sum = utils::cards_sum(&room.players[i].discarded);
                    
                    if (card_value > highest_card || (card_value == highest_card && discard_sum > highest_sum)) {
                        highest_card = card_value;
                        highest_sum = discard_sum;
                        winner_idx = i;
                    };
                };
            });
            
            return std::option::some(winner_idx)
        };
    };
    
    std::option::none()
}

fun resolve_round(
    room: &mut GameRoom,
    leaderboard: &mut Leaderboard,
    winner_idx: u64,
    ctx: &mut TxContext,
) {
    let room_id = room.id.to_inner();
    let winner_addr = room.players[winner_idx].addr;
    
    let winning_card = if (!room.players[winner_idx].hand.is_empty()) {
        let card_idx = room.players[winner_idx].hand[0];
        if (room.revealed_values[card_idx].is_some()) {
            *room.revealed_values[card_idx].borrow()
        } else {
            0
        }
    } else {
        0
    };
    
    room.players[winner_idx].tokens = room.players[winner_idx].tokens + 1;
    events::emit_token_awarded(room_id, winner_addr, room.players[winner_idx].tokens, b"round_win".to_string());
    
    // Check Spy bonus
    let spy_bonus_player = check_spy_bonus(room);
    if (spy_bonus_player.is_some()) {
        let spy_idx = spy_bonus_player.destroy_some();
        room.players[spy_idx].tokens = room.players[spy_idx].tokens + 1;
        events::emit_token_awarded(
            room_id,
            room.players[spy_idx].addr,
            room.players[spy_idx].tokens,
            b"spy_bonus".to_string()
        );
    };
    
    let spy_bonus_addr = if (spy_bonus_player.is_some()) {
        std::option::some(room.players[spy_bonus_player.destroy_some()].addr)
    } else {
        std::option::none()
    };
    
    events::emit_round_ended(room_id, room.round_number, winner_addr, winning_card, spy_bonus_addr);
    
    // Check game winner
    let game_winner_opt = check_game_winner(room);
    
    if (game_winner_opt.is_some()) {
        resolve_game(room, leaderboard, game_winner_opt.destroy_some(), ctx);
    } else {
        // Reset for next round
        room.status = constants::status_round_end();
        room.encrypted_cards = vector[];
        room.deck_indices = vector[];
        room.revealed_values = vector[];
        room.burn_card_index = std::option::none();
        room.public_card_indices = vector[];
        room.discarded_cards_log = vector[]; // Clear log for new round
    };
}

fun check_spy_bonus(room: &GameRoom): std::option::Option<u64> {
    let mut players_with_spy = vector[];
    let mut spy_player_idx = 0u64;
    
    let num_players = room.players.length();
    num_players.do!(|i| {
        // Player must be alive to get Spy bonus
        if (!room.players[i].is_alive) {
            return // continue to next iteration
        };
        
        // Check if player has Spy in their discard pile (they played it this round)
        let has_spy_in_discard = room.players[i].discarded.contains(&constants::card_spy());
        
        // Check if player is holding Spy in hand (using revealed_values)
        let mut holding_spy_in_hand = false;
        room.players[i].hand.do_ref!(|card_idx| {
            if (room.revealed_values[*card_idx].is_some()) {
                if (*room.revealed_values[*card_idx].borrow() == constants::card_spy()) {
                    holding_spy_in_hand = true;
                };
            };
        });
        
        // Spy bonus: player has Spy in discard OR holding Spy in hand
        if (has_spy_in_discard || holding_spy_in_hand) {
            players_with_spy.push_back(room.players[i].addr);
            spy_player_idx = i;
        };
    });
    
    let bonus_awarded = players_with_spy.length() == 1;
    let bonus_recipient = if (bonus_awarded) {
        std::option::some(room.players[spy_player_idx].addr)
    } else {
        std::option::none()
    };
    
    events::emit_spy_bonus_check(room.id.to_inner(), players_with_spy, bonus_awarded, bonus_recipient);
    
    if (bonus_awarded) {
        std::option::some(spy_player_idx)
    } else {
        std::option::none()
    }
}

fun check_game_winner(room: &GameRoom): std::option::Option<u64> {
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
    room: &mut GameRoom,
    leaderboard: &mut Leaderboard,
    winner_idx: u64,
    ctx: &mut TxContext,
) {
    let room_id = room.id.to_inner();
    let winner_addr = room.players[winner_idx].addr;
    let prize_pool = room.pot.value();
    let final_tokens = room.players[winner_idx].tokens;
    
    // Transfer prize
    if (prize_pool > 0) {
        let prize_balance = room.pot.withdraw_all();
        let prize_coin = coin::from_balance(prize_balance, ctx);
        transfer::public_transfer(prize_coin, winner_addr);
    };
    
    // Update leaderboard
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

// ============== Seal Approve Entry Function ==============

/// Entry function for Seal servers to verify card access
entry fun seal_approve_card(
    seal_id: vector<u8>,
    room: &GameRoom,
    ctx: &TxContext
) {
    let caller = ctx.sender();
    let namespace = room.id.to_inner().to_bytes();
    
    // Verify namespace prefix
    assert!(seal_access::is_prefix(&namespace, &seal_id), error::invalid_namespace());
    
    // Extract card index from seal_id
    let card_index = seal_access::extract_card_index_from_seal_id(&seal_id, namespace.length());
    
    // Check if caller can access this card
    assert!(
        seal_access::can_access_card(&room.seal_access, caller, card_index),
        error::no_access()
    );
}

// ============== View Functions ==============

public fun room_id(room: &GameRoom): ID {
    room.id.to_inner()
}

public fun room_name(room: &GameRoom): std::string::String {
    room.name
}

public fun room_status(room: &GameRoom): u8 {
    room.status
}

public fun room_current_turn(room: &GameRoom): u64 {
    room.current_turn
}

public fun room_round_number(room: &GameRoom): u8 {
    room.round_number
}

public fun current_player_address(room: &GameRoom): address {
    let idx = room.current_turn % room.players.length();
    room.players[idx].addr
}

public fun player_hand_indices(room: &GameRoom, player_addr: address): vector<u64> {
    let mut result = vector[];
    room.players.do_ref!(|p| {
        if (p.addr == player_addr) {
            result = p.hand;
        };
    });
    result
}

public fun player_discarded(room: &GameRoom, player_addr: address): vector<u8> {
    let mut result = vector[];
    room.players.do_ref!(|p| {
        if (p.addr == player_addr) {
            result = p.discarded;
        };
    });
    result
}

public fun player_tokens(room: &GameRoom, player_addr: address): u8 {
    let mut result = 0u8;
    room.players.do_ref!(|p| {
        if (p.addr == player_addr) {
            result = p.tokens;
        };
    });
    result
}

public fun player_is_alive(room: &GameRoom, player_addr: address): bool {
    let mut result = false;
    room.players.do_ref!(|p| {
        if (p.addr == player_addr) {
            result = p.is_alive;
        };
    });
    result
}

public fun get_seal_namespace(room: &GameRoom): vector<u8> {
    room.id.to_inner().to_bytes()
}

public fun deck_size(room: &GameRoom): u64 {
    room.deck_indices.length()
}

public fun is_pending_action(room: &GameRoom): bool {
    room.pending_action.is_some()
}

public fun is_chancellor_pending(room: &GameRoom): bool {
    room.chancellor_pending
}

public fun all_players(room: &GameRoom): vector<address> {
    vector::tabulate!(room.players.length(), |i| room.players[i].addr)
}

/// Get the game log (discarded cards in order)
public fun discarded_cards_log(room: &GameRoom): &vector<DiscardedCardEntry> {
    &room.discarded_cards_log
}

/// Get number of entries in the game log
public fun discarded_cards_log_length(room: &GameRoom): u64 {
    room.discarded_cards_log.length()
}

/// Get a specific entry from the game log
public fun discarded_card_entry(room: &GameRoom, index: u64): (address, u64, u8, u64, u64, std::string::String) {
    let entry = &room.discarded_cards_log[index];
    (entry.player_addr, entry.player_idx, entry.card_value, entry.card_index, entry.turn_number, entry.reason)
}

// ============== Registry Functions ==============

public fun active_rooms(registry: &RoomRegistry): vector<ID> {
    registry.active_rooms
}

public fun cleanup_finished_room(registry: &mut RoomRegistry, room: &GameRoom) {
    assert!(error::is_game_finished(room.status), error::game_not_finished());
    
    let room_id = room.id.to_inner();
    let len = registry.active_rooms.length();
    let mut i = 0u64;
    while (i < len) {
        if (registry.active_rooms[i] == room_id) {
            registry.active_rooms.remove(i);
            return
        };
        i = i + 1;
    };
}

// ============== Test Functions ==============

#[test_only]
public fun init_for_testing(ctx: &mut TxContext) {
    init(ctx);
}
