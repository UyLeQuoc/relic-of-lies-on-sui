/// Utility functions for Love Letter 2019 Premium Edition with Seal Encryption
/// Contains helper functions for deck manipulation and vector operations
module contract_v4::utils;

use contract_v4::constants;

/// Create a fresh deck of 21 cards for Love Letter 2019 Premium Edition
/// Returns: vector of card values [0-9] with correct counts
public fun create_deck(): vector<u8> {
    let mut deck = vector[];
    
    // Add Spies (2 cards of value 0)
    (constants::spy_count() as u64).do!(|_| deck.push_back(constants::card_spy()));
    
    // Add Guards (6 cards of value 1)
    (constants::guard_count() as u64).do!(|_| deck.push_back(constants::card_guard()));
    
    // Add Priests (2 cards of value 2)
    (constants::priest_count() as u64).do!(|_| deck.push_back(constants::card_priest()));
    
    // Add Barons (2 cards of value 3)
    (constants::baron_count() as u64).do!(|_| deck.push_back(constants::card_baron()));
    
    // Add Handmaids (2 cards of value 4)
    (constants::handmaid_count() as u64).do!(|_| deck.push_back(constants::card_handmaid()));
    
    // Add Princes (2 cards of value 5)
    (constants::prince_count() as u64).do!(|_| deck.push_back(constants::card_prince()));
    
    // Add Chancellors (2 cards of value 6)
    (constants::chancellor_count() as u64).do!(|_| deck.push_back(constants::card_chancellor()));
    
    // Add King (1 card of value 7)
    deck.push_back(constants::card_king());
    
    // Add Countess (1 card of value 8)
    deck.push_back(constants::card_countess());
    
    // Add Princess (1 card of value 9)
    deck.push_back(constants::card_princess());
    
    deck
}

/// Draw card index from deck indices
public fun draw_card_index(deck_indices: &mut vector<u64>): std::option::Option<u64> {
    if (deck_indices.is_empty()) {
        std::option::none()
    } else {
        std::option::some(deck_indices.pop_back())
    }
}

/// Insert card index at bottom of deck
public fun insert_index_at_bottom(deck_indices: &mut vector<u64>, card_idx: u64) {
    deck_indices.insert(card_idx, 0);
}

/// Insert multiple indices at bottom
public fun insert_indices_at_bottom(deck_indices: &mut vector<u64>, indices: vector<u64>) {
    let len = indices.length();
    let mut i = len;
    while (i > 0) {
        i = i - 1;
        deck_indices.insert(indices[i], 0);
    };
}

/// Check if a card value is valid (0-9)
public fun is_valid_card(card: u8): bool {
    card <= constants::card_princess()
}

/// Get card name for display
public fun card_name(card: u8): std::string::String {
    if (card == constants::card_spy()) {
        b"Spy".to_string()
    } else if (card == constants::card_guard()) {
        b"Guard".to_string()
    } else if (card == constants::card_priest()) {
        b"Priest".to_string()
    } else if (card == constants::card_baron()) {
        b"Baron".to_string()
    } else if (card == constants::card_handmaid()) {
        b"Handmaid".to_string()
    } else if (card == constants::card_prince()) {
        b"Prince".to_string()
    } else if (card == constants::card_chancellor()) {
        b"Chancellor".to_string()
    } else if (card == constants::card_king()) {
        b"King".to_string()
    } else if (card == constants::card_countess()) {
        b"Countess".to_string()
    } else if (card == constants::card_princess()) {
        b"Princess".to_string()
    } else {
        b"Unknown".to_string()
    }
}

/// Find index of a value in a vector
public fun find_index<T: copy + drop>(vec: &vector<T>, value: &T): std::option::Option<u64> {
    let len = vec.length();
    let mut result: std::option::Option<u64> = std::option::none();
    len.do!(|i| {
        if (&vec[i] == value && result.is_none()) {
            result = std::option::some(i);
        };
    });
    result
}

/// Remove first occurrence of a value from vector
/// Returns true if removed, false if not found
public fun remove_first<T: copy + drop>(vec: &mut vector<T>, value: &T): bool {
    let idx_opt = find_index(vec, value);
    if (idx_opt.is_some()) {
        vec.remove(idx_opt.destroy_some());
        true
    } else {
        false
    }
}

/// Check if vector contains a value
public fun contains<T: copy + drop>(vec: &vector<T>, value: &T): bool {
    find_index(vec, value).is_some()
}

/// Sum of all cards in a vector (for tiebreaker using discarded cards)
public fun cards_sum(cards: &vector<u8>): u64 {
    let mut sum = 0u64;
    cards.do_ref!(|card| {
        sum = sum + (*card as u64);
    });
    sum
}

/// Check if a player has played Spy (check discarded pile)
public fun has_played_spy(discarded: &vector<u8>): bool {
    contains(discarded, &constants::card_spy())
}

/// Check if a player is holding Spy
public fun is_holding_spy(hand: &vector<u8>): bool {
    contains(hand, &constants::card_spy())
}

/// Count occurrences of a value in vector
public fun count_occurrences<T: copy + drop>(vec: &vector<T>, value: &T): u64 {
    let mut count = 0u64;
    vec.do_ref!(|item| {
        if (item == value) {
            count = count + 1;
        };
    });
    count
}
