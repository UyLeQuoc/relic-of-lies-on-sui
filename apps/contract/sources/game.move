/// Game module for Love Letter 2019 Premium Edition
/// Contains core game logic, room management, and card effects
/// Supports 10 card types, token system, and Spy bonus mechanic
#[allow(lint(public_random), lint(self_transfer))]
module contract::game;

use sui::balance::{Self, Balance};
use sui::coin::{Self};
use sui::sui::SUI;
use sui::random::Random;
use contract::constants;
use contract::error;
use contract::events;
use contract::utils;
use contract::leaderboard::{Self, Leaderboard};

// ============== Structs ==============

/// Player state in a game
public struct Player has store, copy, drop {
    addr: address,
    hand: vector<u8>,
    discarded: vector<u8>,
    is_alive: bool,
    is_immune: bool,
    tokens: u8,
    has_played_spy: bool,
}

/// Game room - shared object
public struct GameRoom has key {
    id: UID,
    name: std::string::String,
    creator: address,
    pot: Balance<SUI>,
    players: vector<Player>,
    deck: vector<u8>,
    burn_card: std::option::Option<u8>,
    public_cards: vector<u8>,
    status: u8,
    current_turn: u64,
    max_players: u8,
    round_number: u8,
    tokens_to_win: u8,
    chancellor_pending: bool,
    chancellor_player_idx: u64,
    chancellor_cards: vector<u8>,
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
    // Use boolean check functions for better error handling (Rule 3)
    assert!(error::is_valid_room_name(&name), error::empty_room_name());
    assert!(error::is_valid_max_players(max_players), error::invalid_max_players());
    
    let creator = ctx.sender();
    let room_uid = object::new(ctx);
    let room_id = room_uid.to_inner();
    
    let room = GameRoom {
        id: room_uid,
        name,
        creator,
        pot: balance::zero(),
        players: vector[],
        deck: vector[],
        burn_card: std::option::none(),
        public_cards: vector[],
        status: constants::status_waiting(),
        current_turn: 0,
        max_players,
        round_number: 0,
        tokens_to_win: constants::tokens_to_win(),
        chancellor_pending: false,
        chancellor_player_idx: 0,
        chancellor_cards: vector[],
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

/// Join an existing room (free entry - no payment required)
public fun join_room(
    room: &mut GameRoom,
    ctx: &mut TxContext,
) {
    let sender = ctx.sender();
    
    // Use boolean check functions for better error handling (Rule 3)
    assert!(error::can_join_room(room.status), error::game_already_started());
    assert!(error::has_room_space(room.players.length(), room.max_players), error::room_full());
    
    // Check not already in room
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

/// Start a new round (first round or subsequent rounds)
public fun start_round(
    room: &mut GameRoom,
    random: &Random,
    ctx: &mut TxContext,
) {
    let sender = ctx.sender();
    
    // Use boolean check functions for better error handling (Rule 3)
    assert!(error::can_start_round(room.status), error::round_in_progress());
    assert!(error::has_enough_players(room.players.length()), error::not_enough_players());
    
    let is_creator = sender == room.creator;
    let is_player = is_player_in_room(room, sender);
    assert!(is_creator || is_player, error::not_room_creator());
    
    // Reset player states for new round
    let num_players = room.players.length();
    num_players.do!(|i| {
        room.players[i].hand = vector[];
        room.players[i].discarded = vector[];
        room.players[i].is_alive = true;
        room.players[i].is_immune = false;
        room.players[i].has_played_spy = false;
    });
    
    // Reset chancellor state
    room.chancellor_pending = false;
    room.chancellor_player_idx = 0;
    room.chancellor_cards = vector[];
    
    // Create and shuffle deck
    room.deck = utils::create_deck();
    utils::shuffle_deck(&mut room.deck, random, ctx);
    
    // Burn one card (face down, not revealed)
    room.burn_card = utils::draw_card(&mut room.deck);
    
    // For 2-player games, reveal 3 public cards
    room.public_cards = vector[];
    if (num_players == 2) {
        (constants::two_player_public_cards() as u64).do!(|_| {
            utils::draw_card(&mut room.deck).do!(|card| {
                room.public_cards.push_back(card);
            });
        });
    };
    
    // Deal one card to each player
    num_players.do!(|i| {
        utils::draw_card(&mut room.deck).do!(|card| {
            room.players[i].hand.push_back(card);
        });
    });
    
    // Draw second card for first player (so they have 2 cards ready to play)
    utils::draw_card(&mut room.deck).do!(|card| {
        room.players[0].hand.push_back(card);
    });
    
    // Set game status
    room.status = constants::status_playing();
    room.current_turn = 0;
    room.round_number = room.round_number + 1;
    
    // Collect player addresses for event
    let player_addrs = vector::tabulate!(num_players, |i| room.players[i].addr);
    
    events::emit_round_started(
        room.id.to_inner(),
        room.round_number,
        player_addrs,
        room.players[0].addr,
        room.public_cards,
    );
}

/// Play a turn - main game action
public fun play_turn(
    room: &mut GameRoom,
    leaderboard: &mut Leaderboard,
    card: u8,
    target_idx: std::option::Option<u64>,
    guess: std::option::Option<u8>,
    random: &Random,
    ctx: &mut TxContext,
) {
    let sender = ctx.sender();
    let room_id = room.id.to_inner();
    
    // Use boolean check functions for better error handling (Rule 3)
    assert!(error::is_game_playing(room.status), error::game_not_started());
    assert!(!room.chancellor_pending, error::chancellor_pending());
    
    let current_player_idx = room.current_turn % room.players.length();
    let current_player = &room.players[current_player_idx];
    assert!(current_player.addr == sender, error::not_your_turn());
    assert!(current_player.is_alive, error::player_eliminated());
    
    // Clear immunity at start of turn
    room.players[current_player_idx].is_immune = false;
    
    // Player should already have 2 cards (dealt at start or drawn at end of previous turn)
    // Verify player has the card they want to play
    assert!(utils::contains(&room.players[current_player_idx].hand, &card), error::card_not_in_hand());
    
    // Check Countess rule: must discard if holding King or Prince
    let has_countess = utils::contains(&room.players[current_player_idx].hand, &constants::card_countess());
    let has_king = utils::contains(&room.players[current_player_idx].hand, &constants::card_king());
    let has_prince = utils::contains(&room.players[current_player_idx].hand, &constants::card_prince());
    
    if (has_countess && (has_king || has_prince)) {
        assert!(card == constants::card_countess(), error::must_discard_countess());
    };
    
    // Remove card from hand and add to discarded
    utils::remove_first(&mut room.players[current_player_idx].hand, &card);
    room.players[current_player_idx].discarded.push_back(card);
    
    // Track Spy plays
    if (card == constants::card_spy()) {
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
    
    // Execute card effect (Chancellor is special - sets pending state)
    let result = execute_card_effect(room, current_player_idx, card, target_idx, guess, random, ctx);
    
    events::emit_turn_played(room_id, sender, card, target_addr, guess, result);
    
    // If Chancellor was played, don't advance turn yet (wait for resolve)
    if (card == constants::card_chancellor() && room.chancellor_pending) {
        return
    };
    
    check_round_end(room, leaderboard, ctx);
}

/// Resolve Chancellor action - select card to keep and return others to deck
public fun resolve_chancellor(
    room: &mut GameRoom,
    leaderboard: &mut Leaderboard,
    keep_card: u8,
    return_order: vector<u8>,
    ctx: &mut TxContext,
) {
    let sender = ctx.sender();
    
    assert!(room.chancellor_pending, error::chancellor_not_pending());
    assert!(room.players[room.chancellor_player_idx].addr == sender, error::not_your_turn());
    
    let chancellor_cards = &room.chancellor_cards;
    assert!(utils::contains(chancellor_cards, &keep_card), error::chancellor_invalid_selection());
    assert!(return_order.length() == chancellor_cards.length() - 1, error::chancellor_must_keep_one());
    
    // Verify all return cards are valid
    return_order.do_ref!(|card| {
        assert!(utils::contains(chancellor_cards, card), error::chancellor_invalid_selection());
        assert!(*card != keep_card, error::chancellor_invalid_selection());
    });
    
    room.players[room.chancellor_player_idx].hand = vector[keep_card];
    
    // Return cards to bottom of deck (in specified order)
    utils::insert_cards_at_bottom(&mut room.deck, return_order);
    
    room.chancellor_pending = false;
    room.chancellor_cards = vector[];
    
    events::emit_chancellor_return(room.id.to_inner(), sender);
    
    check_round_end(room, leaderboard, ctx);
}

// ============== Card Effect Execution ==============

fun execute_card_effect(
    room: &mut GameRoom,
    player_idx: u64,
    card: u8,
    target_idx: std::option::Option<u64>,
    guess: std::option::Option<u8>,
    random: &Random,
    ctx: &mut TxContext,
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
        execute_prince(room, player_idx, target_idx, random, ctx)
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

/// Spy (0): No immediate effect, bonus at end of round
fun execute_spy(): std::string::String {
    b"Spy played - check for bonus at round end".to_string()
}

/// Guard (1): Guess a player's card (except Guard, value 1)
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
    
    // Use boolean check function for better error handling (Rule 3)
    assert!(error::is_valid_guess(guessed_card), error::invalid_guess());
    
    // Use boolean check function for better error handling (Rule 3)
    assert!(error::is_valid_target_index(target, room.players.length()), error::invalid_target());
    assert!(target != player_idx, error::cannot_target_self());
    assert!(room.players[target].is_alive, error::target_eliminated());
    assert!(!room.players[target].is_immune, error::target_immune());
    
    let target_hand = &room.players[target].hand;
    if (!target_hand.is_empty() && target_hand[0] == guessed_card) {
        eliminate_player(room, target);
        b"Correct guess! Target eliminated".to_string()
    } else {
        b"Wrong guess, no effect".to_string()
    }
}

/// Priest (2): Look at another player's hand
fun execute_priest(
    room: &GameRoom,
    player_idx: u64,
    target_idx: std::option::Option<u64>,
): std::string::String {
    if (all_others_immune(room, player_idx)) {
        return b"All players immune, no effect".to_string()
    };
    
    assert!(target_idx.is_some(), error::target_required());
    let target = *target_idx.borrow();
    
    // Use boolean check function for better error handling (Rule 3)
    assert!(error::is_valid_target_index(target, room.players.length()), error::invalid_target());
    assert!(target != player_idx, error::cannot_target_self());
    assert!(room.players[target].is_alive, error::target_eliminated());
    assert!(!room.players[target].is_immune, error::target_immune());
    
    let target_card = if (!room.players[target].hand.is_empty()) {
        room.players[target].hand[0]
    } else {
        0
    };
    
    events::emit_card_revealed(
        room.id.to_inner(),
        room.players[player_idx].addr,
        room.players[target].addr,
        target_card,
    );
    
    let mut result = b"Saw target's card: ".to_string();
    result.append(utils::card_name(target_card));
    result
}

/// Baron (3): Compare hands, lower value is eliminated
#[allow(unused_mut_parameter)]
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
    
    // Use boolean check function for better error handling (Rule 3)
    assert!(error::is_valid_target_index(target, room.players.length()), error::invalid_target());
    assert!(target != player_idx, error::cannot_target_self());
    assert!(room.players[target].is_alive, error::target_eliminated());
    assert!(!room.players[target].is_immune, error::target_immune());
    
    let player_card = if (!room.players[player_idx].hand.is_empty()) {
        room.players[player_idx].hand[0]
    } else {
        0
    };
    
    let target_card = if (!room.players[target].hand.is_empty()) {
        room.players[target].hand[0]
    } else {
        0
    };
    
    let loser = if (player_card > target_card) {
        std::option::some(room.players[target].addr)
    } else if (player_card < target_card) {
        std::option::some(room.players[player_idx].addr)
    } else {
        std::option::none()
    };
    
    events::emit_baron_comparison(
        room.id.to_inner(),
        room.players[player_idx].addr,
        player_card,
        room.players[target].addr,
        target_card,
        loser,
    );
    
    if (player_card > target_card) {
        eliminate_player(room, target);
        b"You win! Target eliminated".to_string()
    } else if (player_card < target_card) {
        eliminate_player(room, player_idx);
        b"You lose! You are eliminated".to_string()
    } else {
        b"Tie! No one eliminated".to_string()
    }
}

/// Handmaid (4): Become immune until next turn
fun execute_handmaid(
    room: &mut GameRoom,
    player_idx: u64,
): std::string::String {
    room.players[player_idx].is_immune = true;
    b"Protected until your next turn".to_string()
}

/// Prince (5): Choose a player to discard and draw
fun execute_prince(
    room: &mut GameRoom,
    player_idx: u64,
    target_idx: std::option::Option<u64>,
    _random: &Random,
    _ctx: &mut TxContext,
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
    
    // Use boolean check function for better error handling (Rule 3)
    assert!(error::is_valid_target_index(target, room.players.length()), error::invalid_target());
    assert!(room.players[target].is_alive, error::target_eliminated());
    
    if (target != player_idx) {
        assert!(!room.players[target].is_immune, error::target_immune());
    };
    
    let discarded_card = if (!room.players[target].hand.is_empty()) {
        let card = room.players[target].hand.pop_back();
        room.players[target].discarded.push_back(card);
        
        if (card == constants::card_spy()) {
            room.players[target].has_played_spy = true;
        };
        
        card
    } else {
        0
    };
    
    if (discarded_card == constants::card_princess()) {
        eliminate_player(room, target);
        return b"Princess discarded! Player eliminated".to_string()
    };
    
    let new_card = utils::draw_card(&mut room.deck);
    if (new_card.is_some()) {
        room.players[target].hand.push_back(new_card.destroy_some());
    } else if (room.burn_card.is_some()) {
        room.players[target].hand.push_back(*room.burn_card.borrow());
        room.burn_card = std::option::none();
    };
    
    b"Discarded and drew new card".to_string()
}

/// Chancellor (6): Draw 2 cards, keep 1, return 2 to bottom of deck
fun execute_chancellor(
    room: &mut GameRoom,
    player_idx: u64,
): std::string::String {
    let mut drawn_cards = vector[];
    let mut draws_left = 2u8;
    while (draws_left > 0 && !room.deck.is_empty()) {
        utils::draw_card(&mut room.deck).do!(|card| {
            drawn_cards.push_back(card);
        });
        draws_left = draws_left - 1;
    };
    
    if (drawn_cards.is_empty()) {
        return b"Deck empty, no cards to draw".to_string()
    };
    
    let mut all_cards = room.players[player_idx].hand;
    drawn_cards.do_ref!(|card| {
        all_cards.push_back(*card);
    });
    
    events::emit_chancellor_draw(
        room.id.to_inner(),
        room.players[player_idx].addr,
        drawn_cards,
    );
    
    room.chancellor_pending = true;
    room.chancellor_player_idx = player_idx;
    room.chancellor_cards = all_cards;
    
    room.players[player_idx].hand = vector[];
    
    b"Drew cards - select one to keep".to_string()
}

/// King (7): Trade hands with another player
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
    
    // Use boolean check function for better error handling (Rule 3)
    assert!(error::is_valid_target_index(target, room.players.length()), error::invalid_target());
    assert!(target != player_idx, error::cannot_target_self());
    assert!(room.players[target].is_alive, error::target_eliminated());
    assert!(!room.players[target].is_immune, error::target_immune());
    
    let player_hand = room.players[player_idx].hand;
    room.players[player_idx].hand = room.players[target].hand;
    room.players[target].hand = player_hand;
    
    events::emit_hands_swapped(
        room.id.to_inner(),
        room.players[player_idx].addr,
        room.players[target].addr,
    );
    
    b"Hands swapped".to_string()
}

/// Countess (8): No effect (must be discarded with King/Prince)
fun execute_countess(): std::string::String {
    b"Countess discarded, no effect".to_string()
}

/// Princess (9): If discarded, player is eliminated
fun execute_princess(
    room: &mut GameRoom,
    player_idx: u64,
): std::string::String {
    eliminate_player(room, player_idx);
    b"Princess discarded! You are eliminated".to_string()
}

// ============== Internal Helper Functions ==============

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

fun eliminate_player(room: &mut GameRoom, player_idx: u64) {
    room.players[player_idx].is_alive = false;
    
    if (utils::is_holding_spy(&room.players[player_idx].hand)) {
        room.players[player_idx].has_played_spy = true;
    };
    
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

fun advance_turn(room: &mut GameRoom) {
    let num_players = room.players.length();
    let mut next_turn = room.current_turn + 1;
    let mut attempts = 0u64;
    
    while (attempts < num_players) {
        let idx = next_turn % num_players;
        
        if (room.players[idx].is_alive) {
            room.current_turn = next_turn;
            
            // Draw a card for the next player (so they have 2 cards ready)
            // Only draw if deck is not empty
            if (!room.deck.is_empty()) {
                let drawn_card = utils::draw_card(&mut room.deck);
                if (drawn_card.is_some()) {
                    room.players[idx].hand.push_back(drawn_card.destroy_some());
                };
            } else if (room.burn_card.is_some()) {
                // If deck is empty, use burn card
                room.players[idx].hand.push_back(*room.burn_card.borrow());
                room.burn_card = std::option::none();
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
    
    // Only one player alive - they win
    if (alive_count == 1) {
        return std::option::some(last_alive_idx)
    };
    
    // Deck is empty and burn card used - check if all alive players have only 1 card
    // (meaning they've all played their final turn)
    if (room.deck.is_empty() && room.burn_card.is_none()) {
        // Check if all alive players have exactly 1 card (finished their turn)
        let mut all_have_one_card = true;
        num_players.do!(|i| {
            if (room.players[i].is_alive && room.players[i].hand.length() != 1) {
                all_have_one_card = false;
            };
        });
        
        // If all alive players have 1 card, compare hands to determine winner
        if (all_have_one_card) {
            let mut highest_card = 0u8;
            let mut highest_sum = 0u64;
            let mut winner_idx = 0u64;
            
            num_players.do!(|i| {
                if (room.players[i].is_alive && !room.players[i].hand.is_empty()) {
                    let card = room.players[i].hand[0];
                    let discard_sum = utils::cards_sum(&room.players[i].discarded);
                    
                    if (card > highest_card || (card == highest_card && discard_sum > highest_sum)) {
                        highest_card = card;
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
        room.players[winner_idx].hand[0]
    } else {
        0
    };
    
    room.players[winner_idx].tokens = room.players[winner_idx].tokens + 1;
    events::emit_token_awarded(room_id, winner_addr, room.players[winner_idx].tokens, b"round_win".to_string());
    
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
    
    let game_winner_opt = check_game_winner(room);
    
    if (game_winner_opt.is_some()) {
        resolve_game(room, leaderboard, game_winner_opt.destroy_some(), ctx);
    } else {
        room.status = constants::status_round_end();
    };
}

fun check_spy_bonus(room: &GameRoom): std::option::Option<u64> {
    let mut players_with_spy = vector[];
    let mut spy_player_idx = 0u64;
    
    let num_players = room.players.length();
    num_players.do!(|i| {
        let played_spy = room.players[i].has_played_spy;
        let holding_spy = room.players[i].is_alive && utils::is_holding_spy(&room.players[i].hand);
        
        if (played_spy || holding_spy) {
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
    
    let prize_balance = room.pot.withdraw_all();
    let prize_coin = coin::from_balance(prize_balance, ctx);
    transfer::public_transfer(prize_coin, winner_addr);
    
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

public fun room_id(room: &GameRoom): ID {
    room.id.to_inner()
}

public fun room_name(room: &GameRoom): std::string::String {
    room.name
}

public fun room_creator(room: &GameRoom): address {
    room.creator
}

public fun room_pot_value(room: &GameRoom): u64 {
    room.pot.value()
}

public fun room_status(room: &GameRoom): u8 {
    room.status
}

public fun room_max_players(room: &GameRoom): u8 {
    room.max_players
}

public fun room_current_players(room: &GameRoom): u8 {
    room.players.length() as u8
}

public fun room_current_turn(room: &GameRoom): u64 {
    room.current_turn
}

public fun room_round_number(room: &GameRoom): u8 {
    room.round_number
}

public fun room_tokens_to_win(room: &GameRoom): u8 {
    room.tokens_to_win
}

public fun room_public_cards(room: &GameRoom): vector<u8> {
    room.public_cards
}

public fun is_chancellor_pending(room: &GameRoom): bool {
    room.chancellor_pending
}

public fun chancellor_cards(room: &GameRoom, ctx: &TxContext): vector<u8> {
    if (room.chancellor_pending && 
        room.chancellor_player_idx < room.players.length() &&
        room.players[room.chancellor_player_idx].addr == ctx.sender()) {
        room.chancellor_cards
    } else {
        vector[]
    }
}

public fun current_player_address(room: &GameRoom): address {
    let idx = room.current_turn % room.players.length();
    room.players[idx].addr
}

public fun player_at(room: &GameRoom, idx: u64): (address, bool, bool, u8, u64) {
    let player = &room.players[idx];
    (player.addr, player.is_alive, player.is_immune, player.tokens, player.discarded.length())
}

public fun player_hand(room: &GameRoom, player_addr: address): vector<u8> {
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

public fun all_players(room: &GameRoom): vector<address> {
    vector::tabulate!(room.players.length(), |i| room.players[i].addr)
}

public fun deck_size(room: &GameRoom): u64 {
    room.deck.length()
}

public fun alive_players_count(room: &GameRoom): u64 {
    let mut count = 0u64;
    room.players.do_ref!(|p| {
        if (p.is_alive) {
            count = count + 1;
        };
    });
    count
}

// ============== Registry Functions ==============

public fun active_rooms(registry: &RoomRegistry): vector<ID> {
    registry.active_rooms
}

public fun cleanup_finished_room(registry: &mut RoomRegistry, room: &GameRoom) {
    // Use boolean check function for better error handling (Rule 3)
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
