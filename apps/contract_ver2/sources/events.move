/// Events module for Love Letter 2019 Premium Edition (ZK Version)
/// Used for frontend to track match history and game state changes
module contract::events;

use sui::event;

// ============== Room Events ==============

/// Emitted when a new room is created
public struct RoomCreated has copy, drop {
    room_id: ID,
    creator: address,
    room_name: std::string::String,
    max_players: u8,
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

/// Emitted when a round starts (ZK version - no card info)
public struct RoundStarted has copy, drop {
    room_id: ID,
    round_number: u8,
    players: vector<address>,
    first_player: address,
    dealer: address,
    deck_commitment: vector<u8>,
}

/// Emitted when a turn is played
public struct TurnPlayed has copy, drop {
    room_id: ID,
    player: address,
    card_played: u8,
    target: std::option::Option<address>,
    guess: std::option::Option<u8>,
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

// ============== ZK Proof Events ==============

/// Emitted when Guard is played (waiting for proof)
public struct GuardPlayed has copy, drop {
    room_id: ID,
    player: address,
    target: address,
    guessed_card: u8,
    deadline: u64,
}

/// Emitted when Guard proof is submitted
public struct GuardProofSubmitted has copy, drop {
    room_id: ID,
    target: address,
    is_correct: bool,
}

/// Emitted when Baron is played (waiting for proof)
public struct BaronPlayed has copy, drop {
    room_id: ID,
    player: address,
    target: address,
    deadline: u64,
}

/// Emitted when Baron proof is submitted
public struct BaronProofSubmitted has copy, drop {
    room_id: ID,
    result: u8, // 0 = initiator wins, 1 = target wins, 2 = tie
    loser: std::option::Option<address>,
}

/// Emitted when Priest is played
public struct PriestPlayed has copy, drop {
    room_id: ID,
    player: address,
    target: address,
}

/// Emitted when proof timeout occurs
public struct ProofTimeout has copy, drop {
    room_id: ID,
    player: address,
    action_type: u8,
}

/// Emitted when player commits to their card
public struct CardCommitted has copy, drop {
    room_id: ID,
    player: address,
    commitment: vector<u8>,
}

/// Emitted when King swap is initiated
public struct KingSwapInitiated has copy, drop {
    room_id: ID,
    player: address,
    target: address,
    deadline: u64,
}

/// Emitted when King swap is completed
public struct KingSwapCompleted has copy, drop {
    room_id: ID,
    player: address,
    target: address,
}

/// Emitted when Prince effect is initiated
public struct PrinceEffectInitiated has copy, drop {
    room_id: ID,
    player: address,
    target: address,
    deadline: u64,
}

/// Emitted when Chancellor draws cards
public struct ChancellorDrawn has copy, drop {
    room_id: ID,
    player: address,
    cards_count: u8,
}

/// Emitted when Chancellor returns cards
public struct ChancellorReturned has copy, drop {
    room_id: ID,
    player: address,
}

// ============== Leaderboard Events ==============

/// Emitted when leaderboard is updated
public struct LeaderboardUpdated has copy, drop {
    player: address,
    total_wins: u64,
    total_games: u64,
}

// ============== Emit Functions ==============

public(package) fun emit_room_created(
    room_id: ID,
    creator: address,
    room_name: std::string::String,
    max_players: u8,
    tokens_to_win: u8,
) {
    event::emit(RoomCreated {
        room_id,
        creator,
        room_name,
        max_players,
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

public(package) fun emit_round_started(
    room_id: ID,
    round_number: u8,
    players: vector<address>,
    first_player: address,
    dealer: address,
    deck_commitment: vector<u8>,
) {
    event::emit(RoundStarted {
        room_id,
        round_number,
        players,
        first_player,
        dealer,
        deck_commitment,
    });
}

public(package) fun emit_turn_played(
    room_id: ID,
    player: address,
    card_played: u8,
    target: std::option::Option<address>,
    guess: std::option::Option<u8>,
) {
    event::emit(TurnPlayed {
        room_id,
        player,
        card_played,
        target,
        guess,
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
    spy_bonus_player: std::option::Option<address>,
) {
    event::emit(RoundEnded {
        room_id,
        round_number,
        winner,
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

public(package) fun emit_guard_played(
    room_id: ID,
    player: address,
    target: address,
    guessed_card: u8,
    deadline: u64,
) {
    event::emit(GuardPlayed {
        room_id,
        player,
        target,
        guessed_card,
        deadline,
    });
}

public(package) fun emit_guard_proof_submitted(
    room_id: ID,
    target: address,
    is_correct: bool,
) {
    event::emit(GuardProofSubmitted {
        room_id,
        target,
        is_correct,
    });
}

public(package) fun emit_baron_played(
    room_id: ID,
    player: address,
    target: address,
    deadline: u64,
) {
    event::emit(BaronPlayed {
        room_id,
        player,
        target,
        deadline,
    });
}

public(package) fun emit_baron_proof_submitted(
    room_id: ID,
    result: u8,
    loser: std::option::Option<address>,
) {
    event::emit(BaronProofSubmitted {
        room_id,
        result,
        loser,
    });
}

public(package) fun emit_priest_played(
    room_id: ID,
    player: address,
    target: address,
) {
    event::emit(PriestPlayed {
        room_id,
        player,
        target,
    });
}

public(package) fun emit_proof_timeout(
    room_id: ID,
    player: address,
    action_type: u8,
) {
    event::emit(ProofTimeout {
        room_id,
        player,
        action_type,
    });
}

public(package) fun emit_card_committed(
    room_id: ID,
    player: address,
    commitment: vector<u8>,
) {
    event::emit(CardCommitted {
        room_id,
        player,
        commitment,
    });
}

public(package) fun emit_king_swap_initiated(
    room_id: ID,
    player: address,
    target: address,
    deadline: u64,
) {
    event::emit(KingSwapInitiated {
        room_id,
        player,
        target,
        deadline,
    });
}

public(package) fun emit_king_swap_completed(
    room_id: ID,
    player: address,
    target: address,
) {
    event::emit(KingSwapCompleted {
        room_id,
        player,
        target,
    });
}

public(package) fun emit_prince_effect_initiated(
    room_id: ID,
    player: address,
    target: address,
    deadline: u64,
) {
    event::emit(PrinceEffectInitiated {
        room_id,
        player,
        target,
        deadline,
    });
}

public(package) fun emit_chancellor_drawn(
    room_id: ID,
    player: address,
    cards_count: u8,
) {
    event::emit(ChancellorDrawn {
        room_id,
        player,
        cards_count,
    });
}

public(package) fun emit_chancellor_returned(
    room_id: ID,
    player: address,
) {
    event::emit(ChancellorReturned {
        room_id,
        player,
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
