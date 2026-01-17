/// Error codes module for Love Letter 2019 Premium Edition (ZK Version)
/// Contains all error constants for assert! statements
module contract::error;

use contract::constants;

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

/// Invalid max players (must be 2-6)
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

// ============== ZK Proof Errors ==============
/// Invalid ZK proof
const EInvalidProof: u64 = 70;
public fun invalid_proof(): u64 { EInvalidProof }

/// Invalid commitment
const EInvalidCommitment: u64 = 71;
public fun invalid_commitment(): u64 { EInvalidCommitment }

/// Proof timeout not reached
const EProofTimeoutNotReached: u64 = 72;
public fun proof_timeout_not_reached(): u64 { EProofTimeoutNotReached }

/// No pending action
const ENoPendingAction: u64 = 73;
public fun no_pending_action(): u64 { ENoPendingAction }

/// Action already pending
const EActionAlreadyPending: u64 = 74;
public fun action_already_pending(): u64 { EActionAlreadyPending }

/// Not the target of pending action
const ENotPendingTarget: u64 = 75;
public fun not_pending_target(): u64 { ENotPendingTarget }

/// Wrong action type for response
const EWrongActionType: u64 = 76;
public fun wrong_action_type(): u64 { EWrongActionType }

/// Invalid commitment size
const EInvalidCommitmentSize: u64 = 77;
public fun invalid_commitment_size(): u64 { EInvalidCommitmentSize }

/// Not the dealer
const ENotDealer: u64 = 78;
public fun not_dealer(): u64 { ENotDealer }

/// Invalid number of commitments
const EInvalidCommitmentsCount: u64 = 79;
public fun invalid_commitments_count(): u64 { EInvalidCommitmentsCount }

// ============== Boolean Check Functions ==============

/// Check if room name is valid (not empty)
public fun is_valid_room_name(name: &std::string::String): bool {
    !name.is_empty()
}

/// Check if max_players is within valid range (2-6)
public fun is_valid_max_players(max_players: u8): bool {
    max_players >= constants::min_players() && max_players <= constants::max_players()
}

/// Check if payment is sufficient for entry fee
public fun is_sufficient_payment(amount: u64): bool {
    amount >= constants::entry_fee()
}

/// Check if room has space for more players
public fun has_room_space(current_players: u64, max_players: u8): bool {
    (current_players as u8) < max_players
}

/// Check if game status allows joining (waiting)
public fun can_join_room(status: u8): bool {
    status == constants::status_waiting()
}

/// Check if game status allows starting a round
public fun can_start_round(status: u8): bool {
    status == constants::status_waiting() || status == constants::status_round_end()
}

/// Check if game is currently playing
public fun is_game_playing(status: u8): bool {
    status == constants::status_playing()
}

/// Check if game has finished
public fun is_game_finished(status: u8): bool {
    status == constants::status_finished()
}

/// Check if there are enough players to start
public fun has_enough_players(player_count: u64): bool {
    (player_count as u8) >= constants::min_players()
}

/// Check if a card guess is valid (not Guard, within valid range)
public fun is_valid_guess(guess: u8): bool {
    guess != constants::card_guard() && guess <= constants::card_princess()
}

/// Check if a card value is valid (0-9)
public fun is_valid_card(card: u8): bool {
    card <= constants::card_princess()
}

/// Check if target index is valid
public fun is_valid_target_index(target_idx: u64, player_count: u64): bool {
    target_idx < player_count
}

/// Check if commitment has valid size
public fun is_valid_commitment_size(commitment: &vector<u8>): bool {
    commitment.length() == constants::commitment_size()
}
