/// Utility functions for Relic Of Lies 
/// Contains helper functions for deck manipulation and random operations
#[allow(lint(public_random))]
module contract::utils;

use sui::random::{Random, new_generator};
use contract::constants;

/// Create a fresh deck of 21 cards for Relic Of Lies 
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

/// Shuffle deck using Fisher-Yates algorithm with random source
public fun shuffle_deck(deck: &mut vector<u8>, random: &Random, ctx: &mut TxContext) {
    let mut generator = new_generator(random, ctx);
    let len = deck.length();
    
    if (len <= 1) return;
    
    let mut i = len - 1;
    while (i > 0) {
        let j = generator.generate_u64_in_range(0, i + 1);
        deck.swap(i, j);
        i = i - 1;
    };
}

/// Draw a card from the top of deck (removes from end)
/// Returns: Option<u8> - Some(card) if deck not empty, None otherwise
public fun draw_card(deck: &mut vector<u8>): std::option::Option<u8> {
    if (deck.is_empty()) {
        std::option::none()
    } else {
        std::option::some(deck.pop_back())
    }
}

/// Draw multiple cards from deck
public fun draw_cards(deck: &mut vector<u8>, count: u64): vector<u8> {
    let mut cards = vector[];
    count.do!(|_| {
        if (!deck.is_empty()) {
            cards.push_back(deck.pop_back());
        };
    });
    cards
}

/// Insert a card at the bottom of deck (index 0)
public fun insert_at_bottom(deck: &mut vector<u8>, card: u8) {
    deck.insert(card, 0);
}

/// Insert multiple cards at the bottom of deck
public fun insert_cards_at_bottom(deck: &mut vector<u8>, cards: vector<u8>) {
    // Insert in reverse order so first card in vector ends up at bottom
    let len = cards.length();
    let mut i = len;
    while (i > 0) {
        i = i - 1;
        deck.insert(cards[i], 0);
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

/// Get highest card value from a hand
public fun highest_card(hand: &vector<u8>): u8 {
    let mut max_card = 0u8;
    hand.do_ref!(|card| {
        if (*card > max_card) {
            max_card = *card;
        };
    });
    max_card
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
