/// Leaderboard module for Relic Of Lies game
/// Manages global rankings as a shared object
module contract::leaderboard;

use contract::constants;
use contract::events;

// ============== Structs ==============

/// Record of a player's wins
public struct PlayerRecord has store, copy, drop {
    addr: address,
    wins: u64,
    games_played: u64,
}

/// Global leaderboard - shared object
public struct Leaderboard has key {
    id: UID,
    records: vector<PlayerRecord>,
}

// ============== Init Function ==============

fun init(ctx: &mut TxContext) {
    let leaderboard = Leaderboard {
        id: object::new(ctx),
        records: vector[],
    };
    transfer::share_object(leaderboard);
}

// ============== Package Functions ==============
// These functions are only callable from within the package (game.move)

/// Update winner's record in leaderboard
public(package) fun update_winner(leaderboard: &mut Leaderboard, winner_addr: address) {
    let records = &mut leaderboard.records;
    let idx_opt = find_player_index(records, winner_addr);
    
    if (idx_opt.is_some()) {
        let idx = idx_opt.destroy_some();
        records[idx].wins = records[idx].wins + 1;
        records[idx].games_played = records[idx].games_played + 1;
        
        let wins = records[idx].wins;
        let games = records[idx].games_played;
        
        sort_records(records);
        
        events::emit_leaderboard_updated(winner_addr, wins, games);
    } else {
        let new_record = PlayerRecord {
            addr: winner_addr,
            wins: 1,
            games_played: 1,
        };
        records.push_back(new_record);
        
        sort_records(records);
        trim_leaderboard(records);
        
        events::emit_leaderboard_updated(winner_addr, 1, 1);
    };
}

/// Update loser's record (increment games_played only)
public(package) fun update_loser(leaderboard: &mut Leaderboard, loser_addr: address) {
    let records = &mut leaderboard.records;
    let idx_opt = find_player_index(records, loser_addr);
    
    if (idx_opt.is_some()) {
        let idx = idx_opt.destroy_some();
        records[idx].games_played = records[idx].games_played + 1;
    } else {
        let new_record = PlayerRecord {
            addr: loser_addr,
            wins: 0,
            games_played: 1,
        };
        records.push_back(new_record);
    };
}

// ============== View Functions ==============

/// Get top N players from leaderboard
public fun get_top_players(leaderboard: &Leaderboard, count: u64): vector<PlayerRecord> {
    let records = &leaderboard.records;
    let len = records.length();
    let actual_count = if (count > len) { len } else { count };
    
    vector::tabulate!(actual_count, |i| records[i])
}

/// Get a player's record
public fun get_player_record(leaderboard: &Leaderboard, player: address): std::option::Option<PlayerRecord> {
    let idx_opt = find_player_index(&leaderboard.records, player);
    if (idx_opt.is_some()) {
        std::option::some(leaderboard.records[idx_opt.destroy_some()])
    } else {
        std::option::none()
    }
}

/// Get player's rank (1-indexed, 0 if not found)
public fun get_player_rank(leaderboard: &Leaderboard, player: address): u64 {
    let idx_opt = find_player_index(&leaderboard.records, player);
    if (idx_opt.is_some()) {
        idx_opt.destroy_some() + 1
    } else {
        0
    }
}

/// Get total number of players in leaderboard
public fun total_players(leaderboard: &Leaderboard): u64 {
    leaderboard.records.length()
}

// ============== Accessor Functions for PlayerRecord ==============

public fun record_address(record: &PlayerRecord): address {
    record.addr
}

public fun record_wins(record: &PlayerRecord): u64 {
    record.wins
}

public fun record_games_played(record: &PlayerRecord): u64 {
    record.games_played
}

// ============== Internal Functions ==============

fun find_player_index(records: &vector<PlayerRecord>, player: address): std::option::Option<u64> {
    let len = records.length();
    let mut result: std::option::Option<u64> = std::option::none();
    len.do!(|i| {
        if (records[i].addr == player && result.is_none()) {
            result = std::option::some(i);
        };
    });
    result
}

/// Sort records by wins (descending) using bubble sort
/// For small leaderboards, this is efficient enough
fun sort_records(records: &mut vector<PlayerRecord>) {
    let len = records.length();
    if (len <= 1) return;
    
    let mut i = 0u64;
    while (i < len - 1) {
        let mut j = 0u64;
        while (j < len - i - 1) {
            // Sort by wins descending, then by games_played ascending (for same wins)
            let should_swap = if (records[j].wins < records[j + 1].wins) {
                true
            } else if (records[j].wins == records[j + 1].wins) {
                records[j].games_played > records[j + 1].games_played
            } else {
                false
            };
            
            if (should_swap) {
                records.swap(j, j + 1);
            };
            j = j + 1;
        };
        i = i + 1;
    };
}

fun trim_leaderboard(records: &mut vector<PlayerRecord>) {
    let max_entries = constants::max_leaderboard_entries();
    while (records.length() > max_entries) {
        records.pop_back();
    };
}

// ============== Test Functions ==============

#[test_only]
public fun init_for_testing(ctx: &mut TxContext) {
    init(ctx);
}
