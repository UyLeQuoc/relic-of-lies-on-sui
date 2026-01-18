/// Deck module for custom card decks
/// Allows users to create and manage their own 10-card decks for gameplay
#[allow(lint(self_transfer, public_entry), unused_const)]
module contract_v4::deck;

use contract_v4::gacha::Card;

// ============== Error Codes ==============

const EInvalidDeckSize: u64 = 0;
const ENotOwner: u64 = 1;
const ESlotOutOfBounds: u64 = 2;
const ESlotAlreadyFilled: u64 = 3;
const ESlotEmpty: u64 = 4;
const EDeckNotComplete: u64 = 5;
const EInvalidCardValue: u64 = 6;

// ============== Constants ==============

/// Standard deck size for Love Letter
const DECK_SIZE: u64 = 10;

// ============== Structs ==============

/// A custom deck owned by a player
/// Contains 10 card slots (one for each card type 0-9)
public struct CustomDeck has key, store {
    id: UID,
    /// Owner of this deck
    owner: address,
    /// Name of the deck
    name: std::string::String,
    /// Card slots (index 0-9 corresponds to card value 0-9)
    /// Each slot can hold one Card NFT
    slots: vector<std::option::Option<Card>>,
    /// Whether this deck is complete (all 10 slots filled)
    is_complete: bool,
}

// ============== Create Functions ==============

/// Create a new empty custom deck
public fun create_deck(
    name: std::string::String,
    ctx: &mut TxContext,
): CustomDeck {
    let owner = ctx.sender();
    
    // Initialize 10 empty slots
    let mut slots = vector[];
    let mut i = 0u64;
    while (i < DECK_SIZE) {
        slots.push_back(std::option::none());
        i = i + 1;
    };
    
    CustomDeck {
        id: object::new(ctx),
        owner,
        name,
        slots,
        is_complete: false,
    }
}

/// Create deck and transfer to sender
public entry fun create_deck_and_keep(
    name: std::string::String,
    ctx: &mut TxContext,
) {
    let deck = create_deck(name, ctx);
    transfer::public_transfer(deck, ctx.sender());
}

// ============== Slot Management ==============

/// Set a card in a specific slot
/// The card's value must match the slot index (slot 0 = card value 0, etc.)
public fun set_card(
    deck: &mut CustomDeck,
    slot: u64,
    card: Card,
    ctx: &TxContext,
) {
    assert!(deck.owner == ctx.sender(), ENotOwner);
    assert!(slot < DECK_SIZE, ESlotOutOfBounds);
    
    // Verify card value matches slot
    let card_value = contract_v4::gacha::card_value(&card) as u64;
    assert!(card_value == slot, EInvalidCardValue);
    
    // Check slot is empty
    assert!(deck.slots[slot].is_none(), ESlotAlreadyFilled);
    
    // Set the card using swap
    let old_opt = deck.slots.remove(slot);
    old_opt.destroy_none(); // Safe because we checked is_none above
    deck.slots.insert(std::option::some(card), slot);
    
    // Update completion status
    update_completion_status(deck);
}

/// Remove a card from a specific slot
public fun remove_card(
    deck: &mut CustomDeck,
    slot: u64,
    ctx: &TxContext,
): Card {
    assert!(deck.owner == ctx.sender(), ENotOwner);
    assert!(slot < DECK_SIZE, ESlotOutOfBounds);
    assert!(deck.slots[slot].is_some(), ESlotEmpty);
    
    let slot_ref = &mut deck.slots[slot];
    let card = slot_ref.extract();
    
    // Update completion status
    deck.is_complete = false;
    
    card
}

/// Remove card and transfer to owner
public entry fun remove_card_and_keep(
    deck: &mut CustomDeck,
    slot: u64,
    ctx: &mut TxContext,
) {
    let card = remove_card(deck, slot, ctx);
    transfer::public_transfer(card, ctx.sender());
}

/// Swap a card in a slot (remove old, add new)
public fun swap_card(
    deck: &mut CustomDeck,
    slot: u64,
    new_card: Card,
    ctx: &TxContext,
): Card {
    assert!(deck.owner == ctx.sender(), ENotOwner);
    assert!(slot < DECK_SIZE, ESlotOutOfBounds);
    
    // Verify new card value matches slot
    let card_value = contract_v4::gacha::card_value(&new_card) as u64;
    assert!(card_value == slot, EInvalidCardValue);
    
    // Remove old card
    assert!(deck.slots[slot].is_some(), ESlotEmpty);
    let old_opt = deck.slots.remove(slot);
    let old_card = old_opt.destroy_some();
    
    // Set new card
    deck.slots.insert(std::option::some(new_card), slot);
    
    old_card
}

/// Swap card and transfer old card to owner
public entry fun swap_card_and_keep(
    deck: &mut CustomDeck,
    slot: u64,
    new_card: Card,
    ctx: &mut TxContext,
) {
    let old_card = swap_card(deck, slot, new_card, ctx);
    transfer::public_transfer(old_card, ctx.sender());
}

// ============== Batch Operations ==============

/// Fill multiple slots at once
public fun fill_slots(
    deck: &mut CustomDeck,
    cards: vector<Card>,
    ctx: &TxContext,
) {
    assert!(deck.owner == ctx.sender(), ENotOwner);
    
    let mut i = 0u64;
    let len = cards.length();
    let mut cards_mut = cards;
    
    while (i < len) {
        let card = cards_mut.pop_back();
        let card_value = contract_v4::gacha::card_value(&card) as u64;
        
        assert!(card_value < DECK_SIZE, EInvalidCardValue);
        assert!(deck.slots[card_value].is_none(), ESlotAlreadyFilled);
        
        // Use remove/insert pattern
        let old_opt = deck.slots.remove(card_value);
        old_opt.destroy_none();
        deck.slots.insert(std::option::some(card), card_value);
        
        i = i + 1;
    };
    
    cards_mut.destroy_empty();
    update_completion_status(deck);
}

/// Empty all slots and return cards
public fun empty_deck(
    deck: &mut CustomDeck,
    ctx: &TxContext,
): vector<Card> {
    assert!(deck.owner == ctx.sender(), ENotOwner);
    
    let mut cards = vector[];
    let mut i = 0u64;
    
    while (i < DECK_SIZE) {
        if (deck.slots[i].is_some()) {
            let slot_ref = &mut deck.slots[i];
            let card = slot_ref.extract();
            cards.push_back(card);
        };
        i = i + 1;
    };
    
    deck.is_complete = false;
    cards
}

/// Empty deck and transfer all cards to owner
public entry fun empty_deck_and_keep(
    deck: &mut CustomDeck,
    ctx: &mut TxContext,
) {
    let mut cards = empty_deck(deck, ctx);
    let sender = ctx.sender();
    
    while (!cards.is_empty()) {
        let card = cards.pop_back();
        transfer::public_transfer(card, sender);
    };
    cards.destroy_empty();
}

// ============== Helper Functions ==============

fun update_completion_status(deck: &mut CustomDeck) {
    let mut complete = true;
    let mut i = 0u64;
    
    while (i < DECK_SIZE) {
        if (deck.slots[i].is_none()) {
            complete = false;
        };
        i = i + 1;
    };
    
    deck.is_complete = complete;
}

// ============== View Functions ==============

public fun deck_owner(deck: &CustomDeck): address {
    deck.owner
}

public fun deck_name(deck: &CustomDeck): std::string::String {
    deck.name
}

public fun is_complete(deck: &CustomDeck): bool {
    deck.is_complete
}

public fun slot_filled(deck: &CustomDeck, slot: u64): bool {
    assert!(slot < DECK_SIZE, ESlotOutOfBounds);
    deck.slots[slot].is_some()
}

public fun filled_slots_count(deck: &CustomDeck): u64 {
    let mut count = 0u64;
    let mut i = 0u64;
    
    while (i < DECK_SIZE) {
        if (deck.slots[i].is_some()) {
            count = count + 1;
        };
        i = i + 1;
    };
    
    count
}

/// Get card info for a slot (value, rarity) without moving the card
public fun slot_card_info(deck: &CustomDeck, slot: u64): (u8, u8) {
    assert!(slot < DECK_SIZE, ESlotOutOfBounds);
    assert!(deck.slots[slot].is_some(), ESlotEmpty);
    
    let card = deck.slots[slot].borrow();
    (contract_v4::gacha::card_value(card), contract_v4::gacha::card_rarity(card))
}

/// Get all filled slot indices
public fun filled_slot_indices(deck: &CustomDeck): vector<u64> {
    let mut indices = vector[];
    let mut i = 0u64;
    
    while (i < DECK_SIZE) {
        if (deck.slots[i].is_some()) {
            indices.push_back(i);
        };
        i = i + 1;
    };
    
    indices
}

/// Get deck size constant
public fun deck_size(): u64 {
    DECK_SIZE
}

// ============== Deck Destruction ==============

/// Destroy an empty deck
public fun destroy_empty_deck(deck: CustomDeck) {
    let CustomDeck { id, owner: _, name: _, mut slots, is_complete: _ } = deck;
    
    // Verify all slots are empty
    let mut i = 0u64;
    while (i < DECK_SIZE) {
        let slot = slots.pop_back();
        assert!(slot.is_none(), EDeckNotComplete);
        slot.destroy_none();
        i = i + 1;
    };
    slots.destroy_empty();
    
    id.delete();
}

// ============== Test Functions ==============

#[test_only]
public fun create_deck_for_testing(
    name: std::string::String,
    ctx: &mut TxContext,
): CustomDeck {
    create_deck(name, ctx)
}
