/// Marketplace module for Love Letter NFT Cards
/// Single global marketplace where users can list and buy cards
#[allow(unused_const, lint(share_owned, public_entry, self_transfer))]
module contract_v4::marketplace;

use sui::coin::{Self, Coin};
use sui::sui::SUI;
use sui::table::{Self, Table};
use contract_v4::gacha::Card;

// ============== Error Codes ==============

const ENotOwner: u64 = 0;
const EInvalidPrice: u64 = 1;
const EListingNotFound: u64 = 2;
const EInsufficientPayment: u64 = 3;
const ECannotBuyOwnListing: u64 = 4;
const EListingAlreadyExists: u64 = 5;

// ============== Structs ==============

/// A listing in the marketplace
public struct Listing has store {
    /// The card being sold
    card: Card,
    /// Price in MIST
    price: u64,
    /// Seller address
    seller: address,
}

/// Global marketplace - shared object
public struct Marketplace has key {
    id: UID,
    /// All active listings, keyed by listing ID
    listings: Table<ID, Listing>,
    /// Total number of listings ever created
    total_listings: u64,
    /// Total volume traded (in MIST)
    total_volume: u64,
    /// Fee percentage (out of 10000, e.g., 250 = 2.5%)
    fee_percentage: u64,
    /// Accumulated fees
    fees: sui::balance::Balance<SUI>,
}

/// Receipt for a listing - proves ownership
public struct ListingReceipt has key, store {
    id: UID,
    /// The listing ID this receipt is for
    listing_id: ID,
    /// Original seller
    seller: address,
}

// ============== Init Function ==============

fun init(ctx: &mut TxContext) {
    let marketplace = Marketplace {
        id: object::new(ctx),
        listings: table::new(ctx),
        total_listings: 0,
        total_volume: 0,
        fee_percentage: 250, // 2.5% fee
        fees: sui::balance::zero(),
    };
    transfer::share_object(marketplace);
}

// ============== Listing Functions ==============

/// List a card for sale
/// Returns a receipt that can be used to delist
public fun list_card(
    marketplace: &mut Marketplace,
    card: Card,
    price: u64,
    ctx: &mut TxContext,
): ListingReceipt {
    assert!(price > 0, EInvalidPrice);
    
    let seller = ctx.sender();
    let listing_uid = object::new(ctx);
    let listing_id = listing_uid.to_inner();
    
    let listing = Listing {
        card,
        price,
        seller,
    };
    
    marketplace.listings.add(listing_id, listing);
    marketplace.total_listings = marketplace.total_listings + 1;
    
    // Create and return receipt
    ListingReceipt {
        id: listing_uid,
        listing_id,
        seller,
    }
}

/// List a card and transfer receipt to sender
public entry fun list_card_and_keep_receipt(
    marketplace: &mut Marketplace,
    card: Card,
    price: u64,
    ctx: &mut TxContext,
) {
    let receipt = list_card(marketplace, card, price, ctx);
    transfer::public_transfer(receipt, ctx.sender());
}

/// Update listing price
public fun update_price(
    marketplace: &mut Marketplace,
    receipt: &ListingReceipt,
    new_price: u64,
    ctx: &TxContext,
) {
    assert!(new_price > 0, EInvalidPrice);
    assert!(receipt.seller == ctx.sender(), ENotOwner);
    assert!(marketplace.listings.contains(receipt.listing_id), EListingNotFound);
    
    let listing = marketplace.listings.borrow_mut(receipt.listing_id);
    listing.price = new_price;
}

/// Delist a card (cancel listing)
public fun delist_card(
    marketplace: &mut Marketplace,
    receipt: ListingReceipt,
    ctx: &TxContext,
): Card {
    assert!(receipt.seller == ctx.sender(), ENotOwner);
    assert!(marketplace.listings.contains(receipt.listing_id), EListingNotFound);
    
    let Listing { card, price: _, seller: _ } = marketplace.listings.remove(receipt.listing_id);
    
    // Burn receipt
    let ListingReceipt { id, listing_id: _, seller: _ } = receipt;
    id.delete();
    
    card
}

/// Delist and transfer card back to seller
public entry fun delist_card_and_keep(
    marketplace: &mut Marketplace,
    receipt: ListingReceipt,
    ctx: &mut TxContext,
) {
    let card = delist_card(marketplace, receipt, ctx);
    transfer::public_transfer(card, ctx.sender());
}

// ============== Purchase Functions ==============

/// Purchase a card from the marketplace
public fun purchase_card(
    marketplace: &mut Marketplace,
    listing_id: ID,
    mut payment: Coin<SUI>,
    ctx: &mut TxContext,
): Card {
    assert!(marketplace.listings.contains(listing_id), EListingNotFound);
    
    let listing = marketplace.listings.borrow(listing_id);
    let price = listing.price;
    let seller = listing.seller;
    
    assert!(ctx.sender() != seller, ECannotBuyOwnListing);
    assert!(payment.value() >= price, EInsufficientPayment);
    
    // Calculate fee
    let fee_amount = (price * marketplace.fee_percentage) / 10000;
    let seller_amount = price - fee_amount;
    
    // Split payment
    let fee_balance = payment.balance_mut().split(fee_amount);
    marketplace.fees.join(fee_balance);
    
    let seller_coin = coin::split(&mut payment, seller_amount, ctx);
    transfer::public_transfer(seller_coin, seller);
    
    // Return change if any
    if (payment.value() > 0) {
        transfer::public_transfer(payment, ctx.sender());
    } else {
        payment.destroy_zero();
    };
    
    // Remove listing and return card
    let Listing { card, price: _, seller: _ } = marketplace.listings.remove(listing_id);
    
    marketplace.total_volume = marketplace.total_volume + price;
    
    card
}

/// Purchase and transfer to buyer
public entry fun purchase_card_and_keep(
    marketplace: &mut Marketplace,
    listing_id: ID,
    payment: Coin<SUI>,
    ctx: &mut TxContext,
) {
    let card = purchase_card(marketplace, listing_id, payment, ctx);
    transfer::public_transfer(card, ctx.sender());
}

// ============== Admin Functions ==============

/// Withdraw accumulated fees
public fun withdraw_fees(
    marketplace: &mut Marketplace,
    amount: u64,
    ctx: &mut TxContext,
): Coin<SUI> {
    let withdrawn = marketplace.fees.split(amount);
    coin::from_balance(withdrawn, ctx)
}

/// Update fee percentage (admin only - should add AdminCap)
public fun update_fee_percentage(
    marketplace: &mut Marketplace,
    new_fee: u64,
) {
    // Max 10% fee
    assert!(new_fee <= 1000, EInvalidPrice);
    marketplace.fee_percentage = new_fee;
}

// ============== View Functions ==============

public fun listing_price(marketplace: &Marketplace, listing_id: ID): u64 {
    assert!(marketplace.listings.contains(listing_id), EListingNotFound);
    marketplace.listings.borrow(listing_id).price
}

public fun listing_seller(marketplace: &Marketplace, listing_id: ID): address {
    assert!(marketplace.listings.contains(listing_id), EListingNotFound);
    marketplace.listings.borrow(listing_id).seller
}

public fun listing_exists(marketplace: &Marketplace, listing_id: ID): bool {
    marketplace.listings.contains(listing_id)
}

public fun total_listings(marketplace: &Marketplace): u64 {
    marketplace.total_listings
}

public fun total_volume(marketplace: &Marketplace): u64 {
    marketplace.total_volume
}

public fun fee_percentage(marketplace: &Marketplace): u64 {
    marketplace.fee_percentage
}

public fun accumulated_fees(marketplace: &Marketplace): u64 {
    marketplace.fees.value()
}

// ============== Test Functions ==============

#[test_only]
public fun init_for_testing(ctx: &mut TxContext) {
    init(ctx);
}
