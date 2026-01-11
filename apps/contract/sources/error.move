/// Error codes module for Love Letter 2019 Premium Edition
/// Contains all error constants for assert! statements
module contract::error;

// ============== Room Errors ==============
/// Room is full, cannot join
const ERoomFull: u64 = 0;
public fun room_full(): u64 { ERoomFull }

/// Insufficient payment for entry fee
const EInsufficientPayment: u64 = 1;
public fun insufficient_payment(): u64 { EInsufficientPayment }

/// Room not found
const ERoomNotFound: u64 = 2;
public fun room_not_found(): u64 { ERoomNotFound }

/// Room name cannot be empty
const EEmptyRoomName: u64 = 3;
public fun empty_room_name(): u64 { EEmptyRoomName }

/// Invalid max players (must be 2-4)
const EInvalidMaxPlayers: u64 = 4;
public fun invalid_max_players(): u64 { EInvalidMaxPlayers }

/// Already in room
const EAlreadyInRoom: u64 = 5;
public fun already_in_room(): u64 { EAlreadyInRoom }

// ============== Game State Errors ==============
/// Game has not started yet
const EGameNotStarted: u64 = 10;
public fun game_not_started(): u64 { EGameNotStarted }

/// Game already started
const EGameAlreadyStarted: u64 = 11;
public fun game_already_started(): u64 { EGameAlreadyStarted }

/// Game has finished
const EGameFinished: u64 = 12;
public fun game_finished(): u64 { EGameFinished }

/// Game not finished yet
const EGameNotFinished: u64 = 13;
public fun game_not_finished(): u64 { EGameNotFinished }

/// Not enough players to start
const ENotEnoughPlayers: u64 = 14;
public fun not_enough_players(): u64 { ENotEnoughPlayers }

/// Round not finished
const ERoundNotFinished: u64 = 15;
public fun round_not_finished(): u64 { ERoundNotFinished }

/// Round already in progress
const ERoundInProgress: u64 = 16;
public fun round_in_progress(): u64 { ERoundInProgress }

// ============== Turn Errors ==============
/// Not your turn
const ENotYourTurn: u64 = 20;
public fun not_your_turn(): u64 { ENotYourTurn }

/// Card not in hand
const ECardNotInHand: u64 = 21;
public fun card_not_in_hand(): u64 { ECardNotInHand }

/// Invalid target player
const EInvalidTarget: u64 = 22;
public fun invalid_target(): u64 { EInvalidTarget }

/// Target is immune (Handmaid protection)
const ETargetImmune: u64 = 23;
public fun target_immune(): u64 { ETargetImmune }

/// Cannot target self with this card
const ECannotTargetSelf: u64 = 24;
public fun cannot_target_self(): u64 { ECannotTargetSelf }

/// Must target self with Prince when others immune
const EMustTargetSelf: u64 = 25;
public fun must_target_self(): u64 { EMustTargetSelf }

/// Target player is eliminated
const ETargetEliminated: u64 = 26;
public fun target_eliminated(): u64 { ETargetEliminated }

// ============== Card Specific Errors ==============
/// Must discard Countess when holding King or Prince
const EMustDiscardCountess: u64 = 30;
public fun must_discard_countess(): u64 { EMustDiscardCountess }

/// Invalid guess (cannot guess Guard with Guard)
const EInvalidGuess: u64 = 31;
public fun invalid_guess(): u64 { EInvalidGuess }

/// Guess is required for Guard card
const EGuessRequired: u64 = 32;
public fun guess_required(): u64 { EGuessRequired }

/// Target is required for this card
const ETargetRequired: u64 = 33;
public fun target_required(): u64 { ETargetRequired }

/// Cannot guess value 1 (Guard) with Guard
const ECannotGuessGuard: u64 = 34;
public fun cannot_guess_guard(): u64 { ECannotGuessGuard }

// ============== Chancellor Specific Errors ==============
/// Must select exactly one card to keep
const EChancellorMustKeepOne: u64 = 40;
public fun chancellor_must_keep_one(): u64 { EChancellorMustKeepOne }

/// Invalid card selection for Chancellor
const EChancellorInvalidSelection: u64 = 41;
public fun chancellor_invalid_selection(): u64 { EChancellorInvalidSelection }

/// Chancellor action not pending
const EChancellorNotPending: u64 = 42;
public fun chancellor_not_pending(): u64 { EChancellorNotPending }

/// Chancellor action already pending
const EChancellorPending: u64 = 43;
public fun chancellor_pending(): u64 { EChancellorPending }

// ============== Authorization Errors ==============
/// Not the room creator
const ENotRoomCreator: u64 = 50;
public fun not_room_creator(): u64 { ENotRoomCreator }

/// Not a player in this room
const ENotAPlayer: u64 = 51;
public fun not_a_player(): u64 { ENotAPlayer }

/// Player is eliminated
const EPlayerEliminated: u64 = 52;
public fun player_eliminated(): u64 { EPlayerEliminated }

// ============== Deck Errors ==============
/// Deck is empty
const EDeckEmpty: u64 = 60;
public fun deck_empty(): u64 { EDeckEmpty }
