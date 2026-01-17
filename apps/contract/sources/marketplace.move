/// Marketplace module for Love Letter NFT Cards
/// Uses Sui Kiosk for trading cards with no-lock policy
#[allow(unused_const, unused_use, lint(share_owned, public_entry))]
module contract::marketplace;

use sui::kiosk::{Self, Kiosk, KioskOwnerCap};
use sui::transfer_policy::{Self, TransferPolicy, TransferPolicyCap};
use sui::package::Publisher;
use sui::coin::Coin;
use sui::sui::SUI;
use contract::gacha::Card;

// ============== Error Codes ==============

const ENotOwner: u64 = 0;
const EInvalidPrice: u64 = 1;

// ============== Structs ==============

/// Marketplace registry to track all kiosks
public struct MarketplaceRegistry has key {
    id: UID,
    /// Total number of kiosks created
    total_kiosks: u64,
    /// Total volume traded (in MIST)
    total_volume: u64,
}

// ============== Init Function ==============

fun init(ctx: &mut TxContext) {
    let registry = MarketplaceRegistry {
        id: object::new(ctx),
        total_kiosks: 0,
        total_volume: 0,
    };
    transfer::share_object(registry);
}

// ============== Kiosk Management ==============

/// Create a new kiosk for the sender
#[allow(lint(share_owned, self_transfer))]
public fun create_kiosk(
    registry: &mut MarketplaceRegistry,
    ctx: &mut TxContext,
): (Kiosk, KioskOwnerCap) {
    let (kiosk, cap) = kiosk::new(ctx);
    registry.total_kiosks = registry.total_kiosks + 1;
    (kiosk, cap)
}

/// Create kiosk and share/transfer
public entry fun create_kiosk_and_share(
    registry: &mut MarketplaceRegistry,
    ctx: &mut TxContext,
) {
    let (kiosk, cap) = create_kiosk(registry, ctx);
    transfer::public_share_object(kiosk);
    transfer::public_transfer(cap, ctx.sender());
}

// ============== Transfer Policy (No Lock) ==============

/// Create a transfer policy for Card type with no rules (instant transfer)
/// This should be called once by the package publisher
public fun create_card_policy(
    publisher: &Publisher,
    ctx: &mut TxContext,
): (TransferPolicy<Card>, TransferPolicyCap<Card>) {
    transfer_policy::new<Card>(publisher, ctx)
}

/// Create and share the transfer policy
public entry fun create_and_share_card_policy(
    publisher: &Publisher,
    ctx: &mut TxContext,
) {
    let (policy, cap) = create_card_policy(publisher, ctx);
    transfer::public_share_object(policy);
    transfer::public_transfer(cap, ctx.sender());
}

// ============== Listing Functions ==============

/// Place a card in the kiosk (not listed for sale yet)
public fun place_card(
    kiosk: &mut Kiosk,
    cap: &KioskOwnerCap,
    card: Card,
) {
    kiosk.place(cap, card);
}

/// Place and list a card for sale in one transaction
public entry fun place_and_list(
    kiosk: &mut Kiosk,
    cap: &KioskOwnerCap,
    card: Card,
    price: u64,
) {
    let card_id = object::id(&card);
    kiosk.place(cap, card);
    kiosk.list<Card>(cap, card_id, price);
}

/// List an existing card in kiosk for sale
public entry fun list_card(
    kiosk: &mut Kiosk,
    cap: &KioskOwnerCap,
    card_id: object::ID,
    price: u64,
) {
    kiosk.list<Card>(cap, card_id, price);
}

/// Delist a card (remove from sale but keep in kiosk)
public entry fun delist_card(
    kiosk: &mut Kiosk,
    cap: &KioskOwnerCap,
    card_id: object::ID,
) {
    kiosk.delist<Card>(cap, card_id);
}

/// Withdraw a card from kiosk (must not be listed)
public fun withdraw_card(
    kiosk: &mut Kiosk,
    cap: &KioskOwnerCap,
    card_id: object::ID,
): Card {
    kiosk.take(cap, card_id)
}

/// Withdraw and transfer to sender
public entry fun withdraw_card_and_keep(
    kiosk: &mut Kiosk,
    cap: &KioskOwnerCap,
    card_id: object::ID,
    ctx: &mut TxContext,
) {
    let card = withdraw_card(kiosk, cap, card_id);
    transfer::public_transfer(card, ctx.sender());
}

// ============== Purchase Functions ==============

/// Purchase a card from kiosk
/// Since we have no-lock policy, the card is transferred immediately
public fun purchase_card(
    kiosk: &mut Kiosk,
    card_id: object::ID,
    payment: Coin<SUI>,
    policy: &TransferPolicy<Card>,
    registry: &mut MarketplaceRegistry,
): Card {
    let amount = payment.value();
    
    // Purchase from kiosk - this returns the card and a TransferRequest
    let (card, request) = kiosk.purchase<Card>(card_id, payment);
    
    // Confirm the transfer with empty policy (no rules)
    transfer_policy::confirm_request(policy, request);
    
    // Update registry stats
    registry.total_volume = registry.total_volume + amount;
    
    card
}

/// Purchase and transfer to buyer
public entry fun purchase_card_and_keep(
    kiosk: &mut Kiosk,
    card_id: object::ID,
    payment: Coin<SUI>,
    policy: &TransferPolicy<Card>,
    registry: &mut MarketplaceRegistry,
    ctx: &mut TxContext,
) {
    let card = purchase_card(kiosk, card_id, payment, policy, registry);
    transfer::public_transfer(card, ctx.sender());
}

// ============== Kiosk Owner Functions ==============

/// Withdraw profits from kiosk
public entry fun withdraw_profits(
    kiosk: &mut Kiosk,
    cap: &KioskOwnerCap,
    ctx: &mut TxContext,
) {
    let amount = kiosk.profits_amount();
    if (amount > 0) {
        let profits = kiosk.withdraw(cap, std::option::some(amount), ctx);
        transfer::public_transfer(profits, ctx.sender());
    };
}

/// Withdraw specific amount of profits
public entry fun withdraw_profits_amount(
    kiosk: &mut Kiosk,
    cap: &KioskOwnerCap,
    amount: u64,
    ctx: &mut TxContext,
) {
    let profits = kiosk.withdraw(cap, std::option::some(amount), ctx);
    transfer::public_transfer(profits, ctx.sender());
}

// ============== View Functions ==============

public fun registry_total_kiosks(registry: &MarketplaceRegistry): u64 {
    registry.total_kiosks
}

public fun registry_total_volume(registry: &MarketplaceRegistry): u64 {
    registry.total_volume
}

/// Check if a card is listed in a kiosk
public fun is_card_listed(kiosk: &Kiosk, card_id: object::ID): bool {
    kiosk.is_listed(card_id)
}

/// Get kiosk profits amount
public fun kiosk_profits(kiosk: &Kiosk): u64 {
    kiosk.profits_amount()
}

// ============== Test Functions ==============

#[test_only]
public fun init_for_testing(ctx: &mut TxContext) {
    init(ctx);
}
