/// Gacha module for Relic Of Lies NFT Cards
/// Allows players to pull random NFT cards with different rarities
#[allow(lint(public_random, self_transfer, public_entry), unused_const)]
module contract_v4::gacha;

use sui::coin::{Self, Coin};
use sui::sui::SUI;
use sui::random::{Random, new_generator};
use sui::package;
use sui::display;

// ============== Constants ==============

/// Gacha cost: 0.01 SUI (10_000_000 MIST) per pull
const GACHA_COST: u64 = 10_000_000;

/// Rarity types
const RARITY_COMMON: u8 = 0;
const RARITY_RARE: u8 = 1;
const RARITY_EPIC: u8 = 2;
const RARITY_LEGENDARY: u8 = 3;
const RARITY_MYTHIC: u8 = 4;

/// Rarity drop rates (out of 10000)
/// Common: 67.5%, Rare: 20%, Epic: 10%, Legendary: 2%, Mythic: 0.5%
const RATE_COMMON: u64 = 6750;
const RATE_RARE: u64 = 2000;
const RATE_EPIC: u64 = 1000;
const RATE_LEGENDARY: u64 = 200;
const RATE_MYTHIC: u64 = 50;

/// Upgrade success rates (out of 100)
/// Common → Rare: 80%
/// Rare → Epic: 60%
/// Epic → Legendary: 40%
/// Legendary → Mythic: 20%
const UPGRADE_RATE_COMMON_TO_RARE: u64 = 80;
const UPGRADE_RATE_RARE_TO_EPIC: u64 = 60;
const UPGRADE_RATE_EPIC_TO_LEGENDARY: u64 = 40;
const UPGRADE_RATE_LEGENDARY_TO_MYTHIC: u64 = 20;

// ============== Error Codes ==============

const EInsufficientPayment: u64 = 0;
const EInvalidCardValue: u64 = 1;
const ECardsMustBeSameRarity: u64 = 2;
const ECannotUpgradeMythic: u64 = 3;
const ENeedThreeCards: u64 = 4;
const EInvalidAmount: u64 = 5;

// ============== One-Time Witness ==============

public struct GACHA has drop {}

// ============== Structs ==============

/// NFT Card - the main collectible
public struct Card has key, store {
    id: UID,
    /// Card value (0-9, corresponds to game cards)
    value: u8,
    /// Rarity type (0=Common, 1=Rare, 2=Epic, 3=Legendary, 4=Mythic)
    rarity: u8,
    /// Number of wins with this card
    wins: u64,
    /// Number of games played with this card
    games_played: u64,
}

/// Treasury to collect gacha fees
public struct GachaTreasury has key {
    id: UID,
    balance: sui::balance::Balance<SUI>,
    total_cards_minted: u64,
}

// ============== Init Function ==============

fun init(otw: GACHA, ctx: &mut TxContext) {
    // Create treasury
    let treasury = GachaTreasury {
        id: object::new(ctx),
        balance: sui::balance::zero(),
        total_cards_minted: 0,
    };
    transfer::share_object(treasury);

    // Setup Display for Card NFT
    let publisher = package::claim(otw, ctx);
    
    let mut display = display::new<Card>(&publisher, ctx);
    
    // Basic NFT metadata
    display.add(b"name".to_string(), b"Relic of Lies Card #{value}".to_string());
    display.add(b"description".to_string(), b"A collectible NFT card from Relic of Lies - Relic Of Lies on Sui. Card Value: {value}, Rarity: {rarity}".to_string());

    // Image URL - can be updated later via Display object
    display.add(b"image_url".to_string(), b"https://relic-of-lies.vercel.app/images/cards/characters/{value}.png".to_string());
    
    // Project info
    display.add(b"project_name".to_string(), b"Relic of Lies".to_string());
    display.add(b"project_url".to_string(), b"https://relic-of-lies.vercel.app".to_string());
    display.add(b"creator".to_string(), b"Relic of Lies Team".to_string());
    
    // Card attributes
    display.add(b"value".to_string(), b"{value}".to_string());
    display.add(b"rarity".to_string(), b"{rarity}".to_string());
    display.add(b"wins".to_string(), b"{wins}".to_string());
    display.add(b"games_played".to_string(), b"{games_played}".to_string());
    
    display.update_version();
    
    transfer::public_transfer(publisher, ctx.sender());
    transfer::public_transfer(display, ctx.sender());
}

// ============== Gacha Functions ==============

/// Generate a random card (internal helper)
fun generate_card(
    generator: &mut sui::random::RandomGenerator,
    ctx: &mut TxContext,
): Card {
    // Random card value (0-9)
    let value = (generator.generate_u8() % 10) as u8;
    
    // Random rarity based on drop rates
    let rarity_roll = generator.generate_u64_in_range(0, 10000);
    let rarity = if (rarity_roll < RATE_COMMON) {
        RARITY_COMMON
    } else if (rarity_roll < RATE_COMMON + RATE_RARE) {
        RARITY_RARE
    } else if (rarity_roll < RATE_COMMON + RATE_RARE + RATE_EPIC) {
        RARITY_EPIC
    } else if (rarity_roll < RATE_COMMON + RATE_RARE + RATE_EPIC + RATE_LEGENDARY) {
        RARITY_LEGENDARY
    } else {
        RARITY_MYTHIC
    };
    
    Card {
        id: object::new(ctx),
        value,
        rarity,
        wins: 0,
        games_played: 0,
    }
}

/// Pull multiple random cards from gacha
/// Cost: 0.01 SUI per card
public fun pull(
    treasury: &mut GachaTreasury,
    payment: Coin<SUI>,
    amount: u64,
    random: &Random,
    ctx: &mut TxContext,
): vector<Card> {
    assert!(amount > 0, EInvalidAmount);
    
    let total_cost = GACHA_COST * amount;
    assert!(payment.value() >= total_cost, EInsufficientPayment);
    
    // Handle payment
    let sender = ctx.sender();
    if (payment.value() > total_cost) {
        let mut payment_mut = payment;
        let gacha_balance = payment_mut.balance_mut().split(total_cost);
        treasury.balance.join(gacha_balance);
        transfer::public_transfer(payment_mut, sender);
    } else {
        treasury.balance.join(payment.into_balance());
    };
    
    // Generate random cards
    let mut generator = new_generator(random, ctx);
    let mut cards = vector[];
    
    let mut i = 0u64;
    while (i < amount) {
        let card = generate_card(&mut generator, ctx);
        cards.push_back(card);
        i = i + 1;
    };
    
    treasury.total_cards_minted = treasury.total_cards_minted + amount;
    
    cards
}

/// Pull multiple cards and transfer all to sender
/// Cost: 0.01 SUI per card
public entry fun pull_and_keep(
    treasury: &mut GachaTreasury,
    payment: Coin<SUI>,
    amount: u64,
    random: &Random,
    ctx: &mut TxContext,
) {
    let mut cards = pull(treasury, payment, amount, random, ctx);
    let sender = ctx.sender();
    
    // Transfer all cards to sender
    while (!cards.is_empty()) {
        let card = cards.pop_back();
        transfer::public_transfer(card, sender);
    };
    cards.destroy_empty();
}

// ============== Upgrade Functions ==============

/// Get upgrade success rate based on current rarity
fun get_upgrade_rate(rarity: u8): u64 {
    if (rarity == RARITY_COMMON) {
        UPGRADE_RATE_COMMON_TO_RARE
    } else if (rarity == RARITY_RARE) {
        UPGRADE_RATE_RARE_TO_EPIC
    } else if (rarity == RARITY_EPIC) {
        UPGRADE_RATE_EPIC_TO_LEGENDARY
    } else if (rarity == RARITY_LEGENDARY) {
        UPGRADE_RATE_LEGENDARY_TO_MYTHIC
    } else {
        0 // Mythic cannot be upgraded
    }
}

/// Upgrade 3 cards of the same rarity to attempt getting 1 card of higher rarity
/// Success rate depends on rarity: Common→Rare 80%, Rare→Epic 60%, Epic→Legendary 40%, Legendary→Mythic 20%
/// On SUCCESS: Returns upgraded card with combined stats
/// On FAILURE: Returns 1 card of same rarity with combined stats (2 cards are lost)
public fun upgrade(
    card1: Card,
    card2: Card,
    card3: Card,
    random: &Random,
    ctx: &mut TxContext,
): Card {
    // Verify all cards have the same rarity
    assert!(card1.rarity == card2.rarity && card2.rarity == card3.rarity, ECardsMustBeSameRarity);
    
    // Cannot upgrade Mythic cards
    assert!(card1.rarity < RARITY_MYTHIC, ECannotUpgradeMythic);
    
    let current_rarity = card1.rarity;

    // Generate random numbers
    let mut generator = new_generator(random, ctx);
    let new_value = (generator.generate_u8() % 10) as u8;
    let upgrade_roll = generator.generate_u64_in_range(0, 100);
    
    // Check if upgrade succeeds
    let success_rate = get_upgrade_rate(current_rarity);
    let new_rarity = if (upgrade_roll < success_rate) {
        current_rarity + 1 // SUCCESS: Upgrade to higher rarity
    } else {
        current_rarity // FAILURE: Stay at same rarity
    };
    
    // Burn old cards
    let Card { id: id1, .. } = card1;
    let Card { id: id2, .. } = card2;
    let Card { id: id3, .. } = card3;
    id1.delete();
    id2.delete();
    id3.delete();
    
    // Create result card
    Card {
        id: object::new(ctx),
        value: new_value,
        rarity: new_rarity,
        wins: 0u64,
        games_played: 0u64,
    }
}

/// Upgrade and transfer to sender
/// Returns true if upgrade succeeded, false if failed (still get a card back)
public entry fun upgrade_and_keep(
    card1: Card,
    card2: Card,
    card3: Card,
    random: &Random,
    ctx: &mut TxContext,
) {
    let upgraded = upgrade(card1, card2, card3, random, ctx);
    transfer::public_transfer(upgraded, ctx.sender());
}

// ============== Stats Update Functions (Package) ==============

/// Update card stats after a game (called by game module)
public(package) fun record_game(card: &mut Card, won: bool) {
    card.games_played = card.games_played + 1;
    if (won) {
        card.wins = card.wins + 1;
    };
}

// ============== View Functions ==============

public fun card_value(card: &Card): u8 { card.value }
public fun card_rarity(card: &Card): u8 { card.rarity }
public fun card_wins(card: &Card): u64 { card.wins }
public fun card_games_played(card: &Card): u64 { card.games_played }

public fun gacha_cost(): u64 { GACHA_COST }
public fun treasury_balance(treasury: &GachaTreasury): u64 { treasury.balance.value() }
public fun total_cards_minted(treasury: &GachaTreasury): u64 { treasury.total_cards_minted }

public fun rarity_common(): u8 { RARITY_COMMON }
public fun rarity_rare(): u8 { RARITY_RARE }
public fun rarity_epic(): u8 { RARITY_EPIC }
public fun rarity_legendary(): u8 { RARITY_LEGENDARY }
public fun rarity_mythic(): u8 { RARITY_MYTHIC }

/// Get upgrade success rate for a rarity (out of 100)
public fun upgrade_rate(rarity: u8): u64 { get_upgrade_rate(rarity) }

/// Get upgrade rates for all rarities
public fun upgrade_rate_common_to_rare(): u64 { UPGRADE_RATE_COMMON_TO_RARE }
public fun upgrade_rate_rare_to_epic(): u64 { UPGRADE_RATE_RARE_TO_EPIC }
public fun upgrade_rate_epic_to_legendary(): u64 { UPGRADE_RATE_EPIC_TO_LEGENDARY }
public fun upgrade_rate_legendary_to_mythic(): u64 { UPGRADE_RATE_LEGENDARY_TO_MYTHIC }

/// Get rarity name as string
public fun rarity_name(rarity: u8): std::string::String {
    if (rarity == RARITY_COMMON) {
        b"Common".to_string()
    } else if (rarity == RARITY_RARE) {
        b"Rare".to_string()
    } else if (rarity == RARITY_EPIC) {
        b"Epic".to_string()
    } else if (rarity == RARITY_LEGENDARY) {
        b"Legendary".to_string()
    } else if (rarity == RARITY_MYTHIC) {
        b"Mythic".to_string()
    } else {
        b"Unknown".to_string()
    }
}

// ============== Admin Functions ==============

/// Withdraw treasury balance (admin only - requires AdminCap in future)
public fun withdraw_treasury(
    treasury: &mut GachaTreasury,
    amount: u64,
    ctx: &mut TxContext,
): Coin<SUI> {
    let withdrawn = treasury.balance.split(amount);
    coin::from_balance(withdrawn, ctx)
}

// ============== Test Functions ==============

#[test_only]
public fun init_for_testing(ctx: &mut TxContext) {
    init(GACHA {}, ctx);
}
