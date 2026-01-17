/// Events module for Love Letter with Seal Integration
/// All game events for frontend tracking
module contract_v3::events;

use sui::event;

// ============== Room Events ==============

public struct RoomCreated has copy, drop {
    room_id: ID,
    creator: address,
    name: std::string::String,
    max_players: u8,
    entry_fee: u64,
    tokens_to_win: u8,
}

public fun emit_room_created(
    room_id: ID,
    creator: address,
    name: std::string::String,
    max_players: u8,
    entry_fee: u64,
    tokens_to_win: u8,
) {
    event::emit(RoomCreated {
        room_id,
        creator,
        name,
        max_players,
        entry_fee,
        tokens_to_win,
    });
}

public struct PlayerJoined has copy, drop {
    room_id: ID,
    player: address,
    current_players: u8,
    max_players: u8,
}

public fun emit_player_joined(
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

// ============== Round Events ==============

public struct RoundStarted has copy, drop {
    room_id: ID,
    round_number: u8,
    players: vector<address>,
    first_player: address,
    public_cards: vector<u8>,
    /// Card indices dealt to each player (encrypted values stored separately)
    dealt_card_indices: vector<vector<u64>>,
}

public fun emit_round_started(
    room_id: ID,
    round_number: u8,
    players: vector<address>,
    first_player: address,
    public_cards: vector<u8>,
    dealt_card_indices: vector<vector<u64>>,
) {
    event::emit(RoundStarted {
        room_id,
        round_number,
        players,
        first_player,
        public_cards,
        dealt_card_indices,
    });
}

public struct RoundEnded has copy, drop {
    room_id: ID,
    round_number: u8,
    winner: address,
    winning_card: u8,
    spy_bonus_player: std::option::Option<address>,
}

public fun emit_round_ended(
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

// ============== Turn Events ==============

public struct TurnPlayed has copy, drop {
    room_id: ID,
    player: address,
    card_played: u8,
    target: std::option::Option<address>,
    guess: std::option::Option<u8>,
    result: std::string::String,
}

public fun emit_turn_played(
    room_id: ID,
    player: address,
    card_played: u8,
    target: std::option::Option<address>,
    guess: std::option::Option<u8>,
    result: std::string::String,
) {
    event::emit(TurnPlayed {
        room_id,
        player,
        card_played,
        target,
        guess,
        result,
    });
}

public struct TurnAdvanced has copy, drop {
    room_id: ID,
    next_player: address,
    new_card_index: u64,
}

public fun emit_turn_advanced(
    room_id: ID,
    next_player: address,
    new_card_index: u64,
) {
    event::emit(TurnAdvanced {
        room_id,
        next_player,
        new_card_index,
    });
}

// ============== Card Effect Events ==============

public struct PlayerEliminated has copy, drop {
    room_id: ID,
    eliminated: address,
    eliminated_by: address,
    card_used: u8,
    revealed_hand: vector<u8>,
}

public fun emit_player_eliminated(
    room_id: ID,
    eliminated: address,
    eliminated_by: address,
    card_used: u8,
    revealed_hand: vector<u8>,
) {
    event::emit(PlayerEliminated {
        room_id,
        eliminated,
        eliminated_by,
        card_used,
        revealed_hand,
    });
}

/// Priest effect - card revealed to specific player only
public struct CardRevealed has copy, drop {
    room_id: ID,
    viewer: address,
    target: address,
    card_index: u64,
    /// Access granted until this turn number
    access_expires_turn: u64,
}

public fun emit_card_revealed(
    room_id: ID,
    viewer: address,
    target: address,
    card_index: u64,
    access_expires_turn: u64,
) {
    event::emit(CardRevealed {
        room_id,
        viewer,
        target,
        card_index,
        access_expires_turn,
    });
}

/// Baron comparison result
public struct BaronComparison has copy, drop {
    room_id: ID,
    attacker: address,
    attacker_card: u8,
    defender: address,
    defender_card: u8,
    loser: std::option::Option<address>,
}

public fun emit_baron_comparison(
    room_id: ID,
    attacker: address,
    attacker_card: u8,
    defender: address,
    defender_card: u8,
    loser: std::option::Option<address>,
) {
    event::emit(BaronComparison {
        room_id,
        attacker,
        attacker_card,
        defender,
        defender_card,
        loser,
    });
}

/// King swap
public struct HandsSwapped has copy, drop {
    room_id: ID,
    player1: address,
    player2: address,
    /// Card indices swapped (for Seal access update)
    player1_new_card_index: u64,
    player2_new_card_index: u64,
}

public fun emit_hands_swapped(
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

/// Chancellor draw
public struct ChancellorDraw has copy, drop {
    room_id: ID,
    player: address,
    drawn_card_indices: vector<u64>,
}

public fun emit_chancellor_draw(
    room_id: ID,
    player: address,
    drawn_card_indices: vector<u64>,
) {
    event::emit(ChancellorDraw {
        room_id,
        player,
        drawn_card_indices,
    });
}

public struct ChancellorResolved has copy, drop {
    room_id: ID,
    player: address,
    kept_card_index: u64,
    returned_count: u64,
}

public fun emit_chancellor_resolved(
    room_id: ID,
    player: address,
    kept_card_index: u64,
    returned_count: u64,
) {
    event::emit(ChancellorResolved {
        room_id,
        player,
        kept_card_index,
        returned_count,
    });
}

// ============== Pending Action Events ==============

public struct PendingGuardResponse has copy, drop {
    room_id: ID,
    attacker: address,
    target: address,
    guess: u8,
}

public fun emit_pending_guard_response(
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

public struct PendingBaronResponse has copy, drop {
    room_id: ID,
    attacker: address,
    attacker_card: u8,
    target: address,
}

public fun emit_pending_baron_response(
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

public struct GuardResponseReceived has copy, drop {
    room_id: ID,
    target: address,
    revealed_card: u8,
    guess_correct: bool,
}

public fun emit_guard_response(
    room_id: ID,
    target: address,
    revealed_card: u8,
    guess_correct: bool,
) {
    event::emit(GuardResponseReceived {
        room_id,
        target,
        revealed_card,
        guess_correct,
    });
}

// ============== Token Events ==============

public struct TokenAwarded has copy, drop {
    room_id: ID,
    player: address,
    total_tokens: u8,
    reason: std::string::String,
}

public fun emit_token_awarded(
    room_id: ID,
    player: address,
    total_tokens: u8,
    reason: std::string::String,
) {
    event::emit(TokenAwarded {
        room_id,
        player,
        total_tokens,
        reason,
    });
}

public struct SpyBonusCheck has copy, drop {
    room_id: ID,
    players_with_spy: vector<address>,
    bonus_awarded: bool,
    bonus_recipient: std::option::Option<address>,
}

public fun emit_spy_bonus_check(
    room_id: ID,
    players_with_spy: vector<address>,
    bonus_awarded: bool,
    bonus_recipient: std::option::Option<address>,
) {
    event::emit(SpyBonusCheck {
        room_id,
        players_with_spy,
        bonus_awarded,
        bonus_recipient,
    });
}

// ============== Game End Events ==============

public struct GameEnded has copy, drop {
    room_id: ID,
    winner: address,
    final_tokens: u8,
    prize_pool: u64,
    total_rounds: u8,
}

public fun emit_game_ended(
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

// ============== Seal/Commitment Events ==============

public struct CommitmentCreated has copy, drop {
    room_id: ID,
    card_index: u64,
    commitment: vector<u8>,
}

public fun emit_commitment_created(
    room_id: ID,
    card_index: u64,
    commitment: vector<u8>,
) {
    event::emit(CommitmentCreated {
        room_id,
        card_index,
        commitment,
    });
}

public struct CommitmentVerified has copy, drop {
    room_id: ID,
    card_index: u64,
    revealed_value: u8,
    verified: bool,
}

public fun emit_commitment_verified(
    room_id: ID,
    card_index: u64,
    revealed_value: u8,
    verified: bool,
) {
    event::emit(CommitmentVerified {
        room_id,
        card_index,
        revealed_value,
        verified,
    });
}

public struct TemporaryAccessGranted has copy, drop {
    room_id: ID,
    viewer: address,
    card_index: u64,
    expires_turn: u64,
}

public fun emit_temporary_access_granted(
    room_id: ID,
    viewer: address,
    card_index: u64,
    expires_turn: u64,
) {
    event::emit(TemporaryAccessGranted {
        room_id,
        viewer,
        card_index,
        expires_turn,
    });
}
