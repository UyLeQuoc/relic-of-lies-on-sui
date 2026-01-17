/// Leaderboard module for Love Letter with Seal Integration
/// Tracks player statistics and rankings
module contract_v3::leaderboard;

use contract_v3::constants;

// ============== Structs ==============

/// Player statistics
public struct PlayerStats has store, copy, drop {
    addr: address,
    wins: u64,
    losses: u64,
    games_played: u64,
}

/// Global leaderboard - shared object
public struct Leaderboard has key {
    id: UID,
    entries: vector<PlayerStats>,
}

// ============== Init Function ==============

fun init(ctx: &mut TxContext) {
    let leaderboard = Leaderboard {
        id: object::new(ctx),
        entries: vector[],
    };
    transfer::share_object(leaderboard);
}

// ============== Update Functions ==============

/// Update winner stats
public fun update_winner(leaderboard: &mut Leaderboard, winner: address) {
    let idx_opt = find_player_index(leaderboard, winner);
    
    if (idx_opt.is_some()) {
        let idx = idx_opt.destroy_some();
        leaderboard.entries[idx].wins = leaderboard.entries[idx].wins + 1;
        leaderboard.entries[idx].games_played = leaderboard.entries[idx].games_played + 1;
    } else {
        // Add new entry
        let stats = PlayerStats {
            addr: winner,
            wins: 1,
            losses: 0,
            games_played: 1,
        };
        add_entry(leaderboard, stats);
    };
    
    // Re-sort leaderboard
    sort_leaderboard(leaderboard);
}

/// Update loser stats
public fun update_loser(leaderboard: &mut Leaderboard, loser: address) {
    let idx_opt = find_player_index(leaderboard, loser);
    
    if (idx_opt.is_some()) {
        let idx = idx_opt.destroy_some();
        leaderboard.entries[idx].losses = leaderboard.entries[idx].losses + 1;
        leaderboard.entries[idx].games_played = leaderboard.entries[idx].games_played + 1;
    } else {
        // Add new entry
        let stats = PlayerStats {
            addr: loser,
            wins: 0,
            losses: 1,
            games_played: 1,
        };
        add_entry(leaderboard, stats);
    };
    
    // Re-sort leaderboard
    sort_leaderboard(leaderboard);
}

// ============== Internal Functions ==============

fun find_player_index(leaderboard: &Leaderboard, player: address): std::option::Option<u64> {
    let len = leaderboard.entries.length();
    let mut result: std::option::Option<u64> = std::option::none();
    
    len.do!(|i| {
        if (leaderboard.entries[i].addr == player && result.is_none()) {
            result = std::option::some(i);
        };
    });
    
    result
}

fun add_entry(leaderboard: &mut Leaderboard, stats: PlayerStats) {
    // If at max capacity, only add if better than last entry
    if (leaderboard.entries.length() >= constants::max_leaderboard_entries()) {
        let last_idx = leaderboard.entries.length() - 1;
        let last_entry = &leaderboard.entries[last_idx];
        
        // Only replace if new entry has more wins
        if (stats.wins > last_entry.wins) {
            leaderboard.entries.pop_back();
            leaderboard.entries.push_back(stats);
        };
    } else {
        leaderboard.entries.push_back(stats);
    };
}

fun sort_leaderboard(leaderboard: &mut Leaderboard) {
    // Simple bubble sort by wins (descending)
    let len = leaderboard.entries.length();
    if (len <= 1) return;
    
    let mut i = 0u64;
    while (i < len - 1) {
        let mut j = 0u64;
        while (j < len - 1 - i) {
            if (leaderboard.entries[j].wins < leaderboard.entries[j + 1].wins) {
                leaderboard.entries.swap(j, j + 1);
            };
            j = j + 1;
        };
        i = i + 1;
    };
}

// ============== View Functions ==============

public fun get_player_stats(leaderboard: &Leaderboard, player: address): std::option::Option<PlayerStats> {
    let idx_opt = find_player_index(leaderboard, player);
    
    if (idx_opt.is_some()) {
        std::option::some(leaderboard.entries[idx_opt.destroy_some()])
    } else {
        std::option::none()
    }
}

public fun get_top_players(leaderboard: &Leaderboard, count: u64): vector<PlayerStats> {
    let len = leaderboard.entries.length();
    let actual_count = if (count > len) { len } else { count };
    
    let mut result = vector[];
    actual_count.do!(|i| {
        result.push_back(leaderboard.entries[i]);
    });
    
    result
}

public fun get_player_rank(leaderboard: &Leaderboard, player: address): std::option::Option<u64> {
    let idx_opt = find_player_index(leaderboard, player);
    
    if (idx_opt.is_some()) {
        // Rank is 1-indexed
        std::option::some(idx_opt.destroy_some() + 1)
    } else {
        std::option::none()
    }
}

public fun total_players(leaderboard: &Leaderboard): u64 {
    leaderboard.entries.length()
}

public fun player_wins(stats: &PlayerStats): u64 {
    stats.wins
}

public fun player_losses(stats: &PlayerStats): u64 {
    stats.losses
}

public fun player_games(stats: &PlayerStats): u64 {
    stats.games_played
}

public fun player_address(stats: &PlayerStats): address {
    stats.addr
}

// ============== Test Functions ==============

#[test_only]
public fun init_for_testing(ctx: &mut TxContext) {
    init(ctx);
}
