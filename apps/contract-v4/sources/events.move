/// Events module for Relic Of Lies  with Seal Encryption
/// Used for frontend to track match history and game state changes
module contract_v4::events;

use sui::event;

// ============== Room Events ==============

/// Emitted when a new room is created
public struct RoomCreated has copy, drop {
    room_id: ID,
    creator: address,
    room_name: std::string::String,
    max_players: u8,
    bet_amount: u64,
    tokens_to_win: u8,
}

/// Emitted when a player joins a room
public struct PlayerJoined has copy, drop {
    room_id: ID,
    player: address,
    current_players: u8,
    max_players: u8,
}

/// Emitted when a player leaves a room
public struct PlayerLeft has copy, drop {
    room_id: ID,
    player: address,
    current_players: u8,
}

// ============== Round Events ==============

/// Emitted when encrypted deck is submitted
public struct DeckSubmitted has copy, drop {
    room_id: ID,
    submitter: address,
    card_count: u64,
}

/// Emitted when a round starts (after deck submission)
public struct RoundStarted has copy, drop {
    room_id: ID,
    round_number: u8,
    players: vector<address>,
    first_player: address,
    public_card_indices: vector<u64>,
}

/// Emitted when a turn is played
public struct TurnPlayed has copy, drop {
    room_id: ID,
    player: address,
    card_played: u8,
    card_index: u64,
    target: std::option::Option<address>,
    guess: std::option::Option<u8>,
    result: std::string::String,
}

/// Emitted when a player is eliminated
public struct PlayerEliminated has copy, drop {
    room_id: ID,
    player: address,
    eliminated_by: address,
    card_used: u8,
}

/// Emitted when a round ends
public struct RoundEnded has copy, drop {
    room_id: ID,
    round_number: u8,
    winner: address,
    winning_card: u8,
    spy_bonus_player: std::option::Option<address>,
}

/// Emitted when a player receives a token
public struct TokenAwarded has copy, drop {
    room_id: ID,
    player: address,
    token_count: u8,
    reason: std::string::String,
}

// ============== Game Events ==============

/// Emitted when game ends (someone collected enough tokens)
public struct GameEnded has copy, drop {
    room_id: ID,
    winner: address,
    final_tokens: u8,
    prize_pool: u64,
    total_rounds: u8,
}

/// Emitted when a new game is started (reset after finished)
public struct NewGameStarted has copy, drop {
    room_id: ID,
    initiator: address,
}

// ============== Card-Specific Events ==============

/// Emitted when Priest grants temporary Seal access
public struct TemporaryAccessGranted has copy, drop {
    room_id: ID,
    viewer: address,
    target_card_index: u64,
    expires_turn: u64,
}

/// Emitted when Baron comparison happens
public struct BaronCompared has copy, drop {
    room_id: ID,
    player1: address,
    player1_card: u8,
    player2: address,
    player2_card: u8,
    loser: std::option::Option<address>,
}

/// Emitted when Chancellor draws cards
public struct ChancellorDrawn has copy, drop {
    room_id: ID,
    player: address,
    card_indices: vector<u64>,
}

/// Emitted when Chancellor returns cards to deck
public struct ChancellorReturned has copy, drop {
    room_id: ID,
    player: address,
}

/// Emitted when King swaps hands
public struct HandsSwapped has copy, drop {
    room_id: ID,
    player1: address,
    player2: address,
    player1_new_card_index: u64,
    player2_new_card_index: u64,
}

/// Emitted when Spy bonus is checked at end of round
public struct SpyBonusChecked has copy, drop {
    room_id: ID,
    players_with_spy: vector<address>,
    bonus_awarded: bool,
    bonus_recipient: std::option::Option<address>,
}

// ============== Pending Action Events ==============

/// Emitted when Guard creates pending response
public struct PendingGuardResponse has copy, drop {
    room_id: ID,
    attacker: address,
    target: address,
    guess: u8,
}

/// Emitted when Baron creates pending response
public struct PendingBaronResponse has copy, drop {
    room_id: ID,
    attacker: address,
    attacker_card: u8,
    target: address,
}

/// Emitted when Prince creates pending response
public struct PendingPrinceResponse has copy, drop {
    room_id: ID,
    attacker: address,
    target: address,
}

/// Emitted when Guard response is received
public struct GuardResponse has copy, drop {
    room_id: ID,
    target: address,
    revealed_card: u8,
    guess_correct: bool,
}

/// Emitted when Baron response is received
public struct BaronResponse has copy, drop {
    room_id: ID,
    target: address,
    revealed_card: u8,
}

/// Emitted when Prince response is received
public struct PrinceResponse has copy, drop {
    room_id: ID,
    target: address,
    discarded_card: u8,
}

// ============== Leaderboard Events ==============

/// Emitted when leaderboard is updated
public struct LeaderboardUpdated has copy, drop {
    player: address,
    total_wins: u64,
    total_games: u64,
}

// ============== Emit Functions (package-private) ==============

public(package) fun emit_room_created(
    room_id: ID,
    creator: address,
    room_name: std::string::String,
    max_players: u8,
    bet_amount: u64,
    tokens_to_win: u8,
) {
    event::emit(RoomCreated {
        room_id,
        creator,
        room_name,
        max_players,
        bet_amount,
        tokens_to_win,
    });
}

public(package) fun emit_player_joined(
    room_id: ID,
    player: address,
    current_players: u8,
    max_players: u8,
) {
    event::emit(PlayerJoined {
        room_id,
        player,
        current_players,
        max_players,
    });
}

public(package) fun emit_player_left(
    room_id: ID,
    player: address,
    current_players: u8,
) {
    event::emit(PlayerLeft {
        room_id,
        player,
        current_players,
    });
}

public(package) fun emit_deck_submitted(
    room_id: ID,
    submitter: address,
    card_count: u64,
) {
    event::emit(DeckSubmitted {
        room_id,
        submitter,
        card_count,
    });
}

public(package) fun emit_round_started(
    room_id: ID,
    round_number: u8,
    players: vector<address>,
    first_player: address,
    public_card_indices: vector<u64>,
) {
    event::emit(RoundStarted {
        room_id,
        round_number,
        players,
        first_player,
        public_card_indices,
    });
}

public(package) fun emit_turn_played(
    room_id: ID,
    player: address,
    card_played: u8,
    card_index: u64,
    target: std::option::Option<address>,
    guess: std::option::Option<u8>,
    result: std::string::String,
) {
    event::emit(TurnPlayed {
        room_id,
        player,
        card_played,
        card_index,
        target,
        guess,
        result,
    });
}

public(package) fun emit_player_eliminated(
    room_id: ID,
    player: address,
    eliminated_by: address,
    card_used: u8,
) {
    event::emit(PlayerEliminated {
        room_id,
        player,
        eliminated_by,
        card_used,
    });
}

public(package) fun emit_round_ended(
    room_id: ID,
    round_number: u8,
    winner: address,
    winning_card: u8,
    spy_bonus_player: std::option::Option<address>,
) {
    event::emit(RoundEnded {
        room_id,
        round_number,
        winner,
        winning_card,
        spy_bonus_player,
    });
}

public(package) fun emit_token_awarded(
    room_id: ID,
    player: address,
    token_count: u8,
    reason: std::string::String,
) {
    event::emit(TokenAwarded {
        room_id,
        player,
        token_count,
        reason,
    });
}

public(package) fun emit_game_ended(
    room_id: ID,
    winner: address,
    final_tokens: u8,
    prize_pool: u64,
    total_rounds: u8,
) {
    event::emit(GameEnded {
        room_id,
        winner,
        final_tokens,
        prize_pool,
        total_rounds,
    });
}

public(package) fun emit_new_game_started(
    room_id: ID,
    initiator: address,
) {
    event::emit(NewGameStarted {
        room_id,
        initiator,
    });
}

public(package) fun emit_temporary_access_granted(
    room_id: ID,
    viewer: address,
    target_card_index: u64,
    expires_turn: u64,
) {
    event::emit(TemporaryAccessGranted {
        room_id,
        viewer,
        target_card_index,
        expires_turn,
    });
}

public(package) fun emit_baron_comparison(
    room_id: ID,
    player1: address,
    player1_card: u8,
    player2: address,
    player2_card: u8,
    loser: std::option::Option<address>,
) {
    event::emit(BaronCompared {
        room_id,
        player1,
        player1_card,
        player2,
        player2_card,
        loser,
    });
}

public(package) fun emit_chancellor_draw(
    room_id: ID,
    player: address,
    card_indices: vector<u64>,
) {
    event::emit(ChancellorDrawn {
        room_id,
        player,
        card_indices,
    });
}

public(package) fun emit_chancellor_return(
    room_id: ID,
    player: address,
) {
    event::emit(ChancellorReturned {
        room_id,
        player,
    });
}

public(package) fun emit_hands_swapped(
    room_id: ID,
    player1: address,
    player2: address,
    player1_new_card_index: u64,
    player2_new_card_index: u64,
) {
    event::emit(HandsSwapped {
        room_id,
        player1,
        player2,
        player1_new_card_index,
        player2_new_card_index,
    });
}

public(package) fun emit_spy_bonus_check(
    room_id: ID,
    players_with_spy: vector<address>,
    bonus_awarded: bool,
    bonus_recipient: std::option::Option<address>,
) {
    event::emit(SpyBonusChecked {
        room_id,
        players_with_spy,
        bonus_awarded,
        bonus_recipient,
    });
}

public(package) fun emit_pending_guard_response(
    room_id: ID,
    attacker: address,
    target: address,
    guess: u8,
) {
    event::emit(PendingGuardResponse {
        room_id,
        attacker,
        target,
        guess,
    });
}

public(package) fun emit_pending_baron_response(
    room_id: ID,
    attacker: address,
    attacker_card: u8,
    target: address,
) {
    event::emit(PendingBaronResponse {
        room_id,
        attacker,
        attacker_card,
        target,
    });
}

public(package) fun emit_pending_prince_response(
    room_id: ID,
    attacker: address,
    target: address,
) {
    event::emit(PendingPrinceResponse {
        room_id,
        attacker,
        target,
    });
}

public(package) fun emit_guard_response(
    room_id: ID,
    target: address,
    revealed_card: u8,
    guess_correct: bool,
) {
    event::emit(GuardResponse {
        room_id,
        target,
        revealed_card,
        guess_correct,
    });
}

public(package) fun emit_baron_response(
    room_id: ID,
    target: address,
    revealed_card: u8,
) {
    event::emit(BaronResponse {
        room_id,
        target,
        revealed_card,
    });
}

public(package) fun emit_prince_response(
    room_id: ID,
    target: address,
    discarded_card: u8,
) {
    event::emit(PrinceResponse {
        room_id,
        target,
        discarded_card,
    });
}

public(package) fun emit_leaderboard_updated(
    player: address,
    total_wins: u64,
    total_games: u64,
) {
    event::emit(LeaderboardUpdated {
        player,
        total_wins,
        total_games,
    });
}
