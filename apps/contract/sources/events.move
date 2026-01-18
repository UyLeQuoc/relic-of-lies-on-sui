/// Events module for Relic Of Lies 
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

/// Emitted when a round starts
public struct RoundStarted has copy, drop {
    room_id: ID,
    round_number: u8,
    players: vector<address>,
    first_player: address,
    public_cards: vector<u8>,
}

/// Emitted when a turn is played
public struct TurnPlayed has copy, drop {
    room_id: ID,
    player: address,
    card_played: u8,
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

// ============== Card-Specific Events ==============

/// Emitted when Priest is played (private view for the player)
public struct CardRevealed has copy, drop {
    room_id: ID,
    viewer: address,
    target: address,
    card_value: u8,
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
    cards_drawn: vector<u8>,
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
}

/// Emitted when Spy bonus is checked at end of round
public struct SpyBonusChecked has copy, drop {
    room_id: ID,
    players_with_spy: vector<address>,
    bonus_awarded: bool,
    bonus_recipient: std::option::Option<address>,
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

public(package) fun emit_round_started(
    room_id: ID,
    round_number: u8,
    players: vector<address>,
    first_player: address,
    public_cards: vector<u8>,
) {
    event::emit(RoundStarted {
        room_id,
        round_number,
        players,
        first_player,
        public_cards,
    });
}

public(package) fun emit_turn_played(
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

public(package) fun emit_card_revealed(
    room_id: ID,
    viewer: address,
    target: address,
    card_value: u8,
) {
    event::emit(CardRevealed {
        room_id,
        viewer,
        target,
        card_value,
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
    cards_drawn: vector<u8>,
) {
    event::emit(ChancellorDrawn {
        room_id,
        player,
        cards_drawn,
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
) {
    event::emit(HandsSwapped {
        room_id,
        player1,
        player2,
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
