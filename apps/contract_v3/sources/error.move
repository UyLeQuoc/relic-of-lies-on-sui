/// Error codes for Love Letter with Seal Integration
module contract_v3::error;

use contract_v3::constants;

// ============== Room Errors (1xx) ==============
const EEmptyRoomName: u64 = 100;
public fun empty_room_name(): u64 { EEmptyRoomName }

const EInvalidMaxPlayers: u64 = 101;
public fun invalid_max_players(): u64 { EInvalidMaxPlayers }

const ERoomFull: u64 = 102;
public fun room_full(): u64 { ERoomFull }

const EAlreadyInRoom: u64 = 103;
public fun already_in_room(): u64 { EAlreadyInRoom }

const ENotRoomCreator: u64 = 104;
public fun not_room_creator(): u64 { ENotRoomCreator }

const ENotEnoughPlayers: u64 = 105;
public fun not_enough_players(): u64 { ENotEnoughPlayers }

const EGameNotFinished: u64 = 106;
public fun game_not_finished(): u64 { EGameNotFinished }

// ============== Game State Errors (2xx) ==============
const EGameAlreadyStarted: u64 = 200;
public fun game_already_started(): u64 { EGameAlreadyStarted }

const EGameNotStarted: u64 = 201;
public fun game_not_started(): u64 { EGameNotStarted }

const ERoundInProgress: u64 = 202;
public fun round_in_progress(): u64 { ERoundInProgress }

const EPendingAction: u64 = 203;
public fun pending_action(): u64 { EPendingAction }

const ENoPendingAction: u64 = 204;
public fun no_pending_action(): u64 { ENoPendingAction }

// ============== Turn Errors (3xx) ==============
const ENotYourTurn: u64 = 300;
public fun not_your_turn(): u64 { ENotYourTurn }

const EPlayerEliminated: u64 = 301;
public fun player_eliminated(): u64 { EPlayerEliminated }

const ECardNotInHand: u64 = 302;
public fun card_not_in_hand(): u64 { ECardNotInHand }

const EMustDiscardCountess: u64 = 303;
public fun must_discard_countess(): u64 { EMustDiscardCountess }

// ============== Target Errors (4xx) ==============
const ETargetRequired: u64 = 400;
public fun target_required(): u64 { ETargetRequired }

const EInvalidTarget: u64 = 401;
public fun invalid_target(): u64 { EInvalidTarget }

const ECannotTargetSelf: u64 = 402;
public fun cannot_target_self(): u64 { ECannotTargetSelf }

const ETargetEliminated: u64 = 403;
public fun target_eliminated(): u64 { ETargetEliminated }

const ETargetImmune: u64 = 404;
public fun target_immune(): u64 { ETargetImmune }

// ============== Guard Specific Errors (5xx) ==============
const EGuessRequired: u64 = 500;
public fun guess_required(): u64 { EGuessRequired }

const EInvalidGuess: u64 = 501;
public fun invalid_guess(): u64 { EInvalidGuess }

// ============== Chancellor Errors (6xx) ==============
const EChancellorPending: u64 = 600;
public fun chancellor_pending(): u64 { EChancellorPending }

const EChancellorNotPending: u64 = 601;
public fun chancellor_not_pending(): u64 { EChancellorNotPending }

const EChancellorInvalidSelection: u64 = 602;
public fun chancellor_invalid_selection(): u64 { EChancellorInvalidSelection }

const EChancellorMustKeepOne: u64 = 603;
public fun chancellor_must_keep_one(): u64 { EChancellorMustKeepOne }

// ============== Commitment/Seal Errors (7xx) ==============
const EInvalidCommitment: u64 = 700;
public fun invalid_commitment(): u64 { EInvalidCommitment }

const ECommitmentMismatch: u64 = 701;
public fun commitment_mismatch(): u64 { ECommitmentMismatch }

const EInvalidSecret: u64 = 702;
public fun invalid_secret(): u64 { EInvalidSecret }

const ENoAccess: u64 = 703;
public fun no_access(): u64 { ENoAccess }

const EInvalidNamespace: u64 = 704;
public fun invalid_namespace(): u64 { EInvalidNamespace }

const ECardNotOwned: u64 = 705;
public fun card_not_owned(): u64 { ECardNotOwned }

const ENoTemporaryAccess: u64 = 706;
public fun no_temporary_access(): u64 { ENoTemporaryAccess }

const EAccessExpired: u64 = 707;
public fun access_expired(): u64 { EAccessExpired }

// ============== Response Errors (8xx) ==============
const ENotPendingResponder: u64 = 800;
public fun not_pending_responder(): u64 { ENotPendingResponder }

const EInvalidResponse: u64 = 801;
public fun invalid_response(): u64 { EInvalidResponse }

const EResponseTimeout: u64 = 802;
public fun response_timeout(): u64 { EResponseTimeout }

// ============== Boolean Check Functions ==============

public fun is_valid_room_name(name: &std::string::String): bool {
    name.length() > 0
}

public fun is_valid_max_players(max_players: u8): bool {
    max_players >= constants::min_players() && max_players <= constants::max_players()
}

public fun can_join_room(status: u8): bool {
    status == constants::status_waiting()
}

public fun has_room_space(current_players: u64, max_players: u8): bool {
    current_players < (max_players as u64)
}

public fun can_start_round(status: u8): bool {
    status == constants::status_waiting() || status == constants::status_round_end()
}

public fun has_enough_players(player_count: u64): bool {
    player_count >= (constants::min_players() as u64)
}

public fun is_game_playing(status: u8): bool {
    status == constants::status_playing()
}

public fun is_game_finished(status: u8): bool {
    status == constants::status_finished()
}

public fun is_valid_guess(guess: u8): bool {
    // Cannot guess Guard (1), and must be valid card (0-9 except 1)
    guess != constants::card_guard() && guess <= constants::card_princess()
}

public fun is_valid_card(card: u8): bool {
    card <= constants::card_princess()
}

public fun is_valid_target_index(target: u64, player_count: u64): bool {
    target < player_count
}

public fun is_valid_secret_length(secret: &vector<u8>): bool {
    secret.length() == constants::secret_length()
}
