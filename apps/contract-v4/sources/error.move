/// Error codes module for Love Letter 2019 Premium Edition with Seal Encryption
/// Contains all error constants for assert! statements
module contract_v4::error;

use contract_v4::constants;

// ============== Room Errors (0-9) ==============
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

// ============== Game State Errors (10-19) ==============
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

/// Deck not submitted yet
const EDeckNotSubmitted: u64 = 17;
public fun deck_not_submitted(): u64 { EDeckNotSubmitted }

/// Deck already submitted
const EDeckAlreadySubmitted: u64 = 18;
public fun deck_already_submitted(): u64 { EDeckAlreadySubmitted }

// ============== Turn Errors (20-29) ==============
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

// ============== Card Specific Errors (30-39) ==============
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

// ============== Chancellor Specific Errors (40-49) ==============
/// Must select exactly one card to keep
const EChancellorMustKeepOne: u64 = 40;
public fun chancellor_must_keep_one(): u64 { EChancellorMustKeepOne }

/// Invalid card selection for Chancellor
const EChancellorInvalidSelection: u64 = 41;
public fun chancellor_invalid_selection(): u64 { EChancellorInvalidSelection }

/// Cannot return the card you are keeping
const EChancellorCannotReturnKeptCard: u64 = 44;
public fun chancellor_cannot_return_kept_card(): u64 { EChancellorCannotReturnKeptCard }

/// Chancellor action not pending
const EChancellorNotPending: u64 = 42;
public fun chancellor_not_pending(): u64 { EChancellorNotPending }

/// Chancellor action already pending
const EChancellorPending: u64 = 43;
public fun chancellor_pending(): u64 { EChancellorPending }

// ============== Authorization Errors (50-59) ==============
/// Not the room creator
const ENotRoomCreator: u64 = 50;
public fun not_room_creator(): u64 { ENotRoomCreator }

/// Not a player in this room
const ENotAPlayer: u64 = 51;
public fun not_a_player(): u64 { ENotAPlayer }

/// Player is eliminated
const EPlayerEliminated: u64 = 52;
public fun player_eliminated(): u64 { EPlayerEliminated }

// ============== Deck Errors (60-69) ==============
/// Deck is empty
const EDeckEmpty: u64 = 60;
public fun deck_empty(): u64 { EDeckEmpty }

/// Invalid deck size
const EInvalidDeckSize: u64 = 61;
public fun invalid_deck_size(): u64 { EInvalidDeckSize }

// ============== Pending Action Errors (70-79) ==============
/// Pending action exists - must respond first
const EPendingAction: u64 = 70;
public fun pending_action(): u64 { EPendingAction }

/// No pending action
const ENoPendingAction: u64 = 71;
public fun no_pending_action(): u64 { ENoPendingAction }

/// Not the pending responder
const ENotPendingResponder: u64 = 72;
public fun not_pending_responder(): u64 { ENotPendingResponder }

/// Invalid response type
const EInvalidResponse: u64 = 73;
public fun invalid_response(): u64 { EInvalidResponse }

// ============== Seal/Decryptable Errors (80-89) ==============
/// Invalid namespace for Seal
const EInvalidNamespace: u64 = 80;
public fun invalid_namespace(): u64 { EInvalidNamespace }

/// No access to decrypt this card
const ENoAccess: u64 = 81;
public fun no_access(): u64 { ENoAccess }

/// Card not owned
const ECardNotOwned: u64 = 82;
public fun card_not_owned(): u64 { ECardNotOwned }

/// Hash mismatch - decryption verification failed
const EHashMismatch: u64 = 83;
public fun hash_mismatch(): u64 { EHashMismatch }

/// Invalid hash length
const EInvalidHashLength: u64 = 84;
public fun invalid_hash_length(): u64 { EInvalidHashLength }

/// Invalid nonce length
const EInvalidNonceLength: u64 = 85;
public fun invalid_nonce_length(): u64 { EInvalidNonceLength }

/// Card already decrypted
const EAlreadyDecrypted: u64 = 86;
public fun already_decrypted(): u64 { EAlreadyDecrypted }

/// Card not decrypted yet
const ENotDecrypted: u64 = 87;
public fun not_decrypted(): u64 { ENotDecrypted }

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
