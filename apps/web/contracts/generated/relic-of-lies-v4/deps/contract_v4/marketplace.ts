/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/**
 * Marketplace module for Relic Of Lies NFT Cards Single global marketplace where
 * users can list and buy cards
 */

import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../../../utils/index';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import * as gacha from './gacha';
import * as object from '../sui/object';
import * as table from '../sui/table';
import * as balance from '../sui/balance';
const $moduleName = 'contract_v4::marketplace';
export const Listing = new MoveStruct({ name: `${$moduleName}::Listing`, fields: {
        /** The card being sold */
        card: gacha.Card,
        /** Price in MIST */
        price: bcs.u64(),
        /** Seller address */
        seller: bcs.Address
    } });
export const Marketplace = new MoveStruct({ name: `${$moduleName}::Marketplace`, fields: {
        id: object.UID,
        /** All active listings, keyed by listing ID */
        listings: table.Table,
        /** Total number of listings ever created */
        total_listings: bcs.u64(),
        /** Total volume traded (in MIST) */
        total_volume: bcs.u64(),
        /** Fee percentage (out of 10000, e.g., 250 = 2.5%) */
        fee_percentage: bcs.u64(),
        /** Accumulated fees */
        fees: balance.Balance
    } });
export const ListingReceipt = new MoveStruct({ name: `${$moduleName}::ListingReceipt`, fields: {
        id: object.UID,
        /** The listing ID this receipt is for */
        listing_id: bcs.Address,
        /** Original seller */
        seller: bcs.Address
    } });
export interface ListCardArguments {
    marketplace: RawTransactionArgument<string>;
    card: RawTransactionArgument<string>;
    price: RawTransactionArgument<number | bigint>;
}
export interface ListCardOptions {
    package: string;
    arguments: ListCardArguments | [
        marketplace: RawTransactionArgument<string>,
        card: RawTransactionArgument<string>,
        price: RawTransactionArgument<number | bigint>
    ];
}
/** List a card for sale Returns a receipt that can be used to delist */
export function listCard(options: ListCardOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::marketplace::Marketplace`,
        `${packageAddress}::gacha::Card`,
        'u64'
    ] satisfies string[];
    const parameterNames = ["marketplace", "card", "price"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'marketplace',
        function: 'list_card',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ListCardAndKeepReceiptArguments {
    marketplace: RawTransactionArgument<string>;
    card: RawTransactionArgument<string>;
    price: RawTransactionArgument<number | bigint>;
}
export interface ListCardAndKeepReceiptOptions {
    package: string;
    arguments: ListCardAndKeepReceiptArguments | [
        marketplace: RawTransactionArgument<string>,
        card: RawTransactionArgument<string>,
        price: RawTransactionArgument<number | bigint>
    ];
}
/** List a card and transfer receipt to sender */
export function listCardAndKeepReceipt(options: ListCardAndKeepReceiptOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::marketplace::Marketplace`,
        `${packageAddress}::gacha::Card`,
        'u64'
    ] satisfies string[];
    const parameterNames = ["marketplace", "card", "price"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'marketplace',
        function: 'list_card_and_keep_receipt',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface UpdatePriceArguments {
    marketplace: RawTransactionArgument<string>;
    receipt: RawTransactionArgument<string>;
    newPrice: RawTransactionArgument<number | bigint>;
}
export interface UpdatePriceOptions {
    package: string;
    arguments: UpdatePriceArguments | [
        marketplace: RawTransactionArgument<string>,
        receipt: RawTransactionArgument<string>,
        newPrice: RawTransactionArgument<number | bigint>
    ];
}
/** Update listing price */
export function updatePrice(options: UpdatePriceOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::marketplace::Marketplace`,
        `${packageAddress}::marketplace::ListingReceipt`,
        'u64'
    ] satisfies string[];
    const parameterNames = ["marketplace", "receipt", "newPrice"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'marketplace',
        function: 'update_price',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface DelistCardArguments {
    marketplace: RawTransactionArgument<string>;
    receipt: RawTransactionArgument<string>;
}
export interface DelistCardOptions {
    package: string;
    arguments: DelistCardArguments | [
        marketplace: RawTransactionArgument<string>,
        receipt: RawTransactionArgument<string>
    ];
}
/** Delist a card (cancel listing) */
export function delistCard(options: DelistCardOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::marketplace::Marketplace`,
        `${packageAddress}::marketplace::ListingReceipt`
    ] satisfies string[];
    const parameterNames = ["marketplace", "receipt"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'marketplace',
        function: 'delist_card',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface DelistCardAndKeepArguments {
    marketplace: RawTransactionArgument<string>;
    receipt: RawTransactionArgument<string>;
}
export interface DelistCardAndKeepOptions {
    package: string;
    arguments: DelistCardAndKeepArguments | [
        marketplace: RawTransactionArgument<string>,
        receipt: RawTransactionArgument<string>
    ];
}
/** Delist and transfer card back to seller */
export function delistCardAndKeep(options: DelistCardAndKeepOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::marketplace::Marketplace`,
        `${packageAddress}::marketplace::ListingReceipt`
    ] satisfies string[];
    const parameterNames = ["marketplace", "receipt"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'marketplace',
        function: 'delist_card_and_keep',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PurchaseCardArguments {
    marketplace: RawTransactionArgument<string>;
    listingId: RawTransactionArgument<string>;
    payment: RawTransactionArgument<string>;
}
export interface PurchaseCardOptions {
    package: string;
    arguments: PurchaseCardArguments | [
        marketplace: RawTransactionArgument<string>,
        listingId: RawTransactionArgument<string>,
        payment: RawTransactionArgument<string>
    ];
}
/** Purchase a card from the marketplace */
export function purchaseCard(options: PurchaseCardOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::marketplace::Marketplace`,
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID',
        '0x0000000000000000000000000000000000000000000000000000000000000002::coin::Coin<0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI>'
    ] satisfies string[];
    const parameterNames = ["marketplace", "listingId", "payment"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'marketplace',
        function: 'purchase_card',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PurchaseCardAndKeepArguments {
    marketplace: RawTransactionArgument<string>;
    listingId: RawTransactionArgument<string>;
    payment: RawTransactionArgument<string>;
}
export interface PurchaseCardAndKeepOptions {
    package: string;
    arguments: PurchaseCardAndKeepArguments | [
        marketplace: RawTransactionArgument<string>,
        listingId: RawTransactionArgument<string>,
        payment: RawTransactionArgument<string>
    ];
}
/** Purchase and transfer to buyer */
export function purchaseCardAndKeep(options: PurchaseCardAndKeepOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::marketplace::Marketplace`,
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID',
        '0x0000000000000000000000000000000000000000000000000000000000000002::coin::Coin<0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI>'
    ] satisfies string[];
    const parameterNames = ["marketplace", "listingId", "payment"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'marketplace',
        function: 'purchase_card_and_keep',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface WithdrawFeesArguments {
    marketplace: RawTransactionArgument<string>;
    amount: RawTransactionArgument<number | bigint>;
}
export interface WithdrawFeesOptions {
    package: string;
    arguments: WithdrawFeesArguments | [
        marketplace: RawTransactionArgument<string>,
        amount: RawTransactionArgument<number | bigint>
    ];
}
/** Withdraw accumulated fees */
export function withdrawFees(options: WithdrawFeesOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::marketplace::Marketplace`,
        'u64'
    ] satisfies string[];
    const parameterNames = ["marketplace", "amount"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'marketplace',
        function: 'withdraw_fees',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface UpdateFeePercentageArguments {
    marketplace: RawTransactionArgument<string>;
    newFee: RawTransactionArgument<number | bigint>;
}
export interface UpdateFeePercentageOptions {
    package: string;
    arguments: UpdateFeePercentageArguments | [
        marketplace: RawTransactionArgument<string>,
        newFee: RawTransactionArgument<number | bigint>
    ];
}
/** Update fee percentage (admin only - should add AdminCap) */
export function updateFeePercentage(options: UpdateFeePercentageOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::marketplace::Marketplace`,
        'u64'
    ] satisfies string[];
    const parameterNames = ["marketplace", "newFee"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'marketplace',
        function: 'update_fee_percentage',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ListingPriceArguments {
    marketplace: RawTransactionArgument<string>;
    listingId: RawTransactionArgument<string>;
}
export interface ListingPriceOptions {
    package: string;
    arguments: ListingPriceArguments | [
        marketplace: RawTransactionArgument<string>,
        listingId: RawTransactionArgument<string>
    ];
}
export function listingPrice(options: ListingPriceOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::marketplace::Marketplace`,
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID'
    ] satisfies string[];
    const parameterNames = ["marketplace", "listingId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'marketplace',
        function: 'listing_price',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ListingSellerArguments {
    marketplace: RawTransactionArgument<string>;
    listingId: RawTransactionArgument<string>;
}
export interface ListingSellerOptions {
    package: string;
    arguments: ListingSellerArguments | [
        marketplace: RawTransactionArgument<string>,
        listingId: RawTransactionArgument<string>
    ];
}
export function listingSeller(options: ListingSellerOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::marketplace::Marketplace`,
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID'
    ] satisfies string[];
    const parameterNames = ["marketplace", "listingId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'marketplace',
        function: 'listing_seller',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ListingExistsArguments {
    marketplace: RawTransactionArgument<string>;
    listingId: RawTransactionArgument<string>;
}
export interface ListingExistsOptions {
    package: string;
    arguments: ListingExistsArguments | [
        marketplace: RawTransactionArgument<string>,
        listingId: RawTransactionArgument<string>
    ];
}
export function listingExists(options: ListingExistsOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::marketplace::Marketplace`,
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID'
    ] satisfies string[];
    const parameterNames = ["marketplace", "listingId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'marketplace',
        function: 'listing_exists',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface TotalListingsArguments {
    marketplace: RawTransactionArgument<string>;
}
export interface TotalListingsOptions {
    package: string;
    arguments: TotalListingsArguments | [
        marketplace: RawTransactionArgument<string>
    ];
}
export function totalListings(options: TotalListingsOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::marketplace::Marketplace`
    ] satisfies string[];
    const parameterNames = ["marketplace"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'marketplace',
        function: 'total_listings',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface TotalVolumeArguments {
    marketplace: RawTransactionArgument<string>;
}
export interface TotalVolumeOptions {
    package: string;
    arguments: TotalVolumeArguments | [
        marketplace: RawTransactionArgument<string>
    ];
}
export function totalVolume(options: TotalVolumeOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::marketplace::Marketplace`
    ] satisfies string[];
    const parameterNames = ["marketplace"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'marketplace',
        function: 'total_volume',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface FeePercentageArguments {
    marketplace: RawTransactionArgument<string>;
}
export interface FeePercentageOptions {
    package: string;
    arguments: FeePercentageArguments | [
        marketplace: RawTransactionArgument<string>
    ];
}
export function feePercentage(options: FeePercentageOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::marketplace::Marketplace`
    ] satisfies string[];
    const parameterNames = ["marketplace"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'marketplace',
        function: 'fee_percentage',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface AccumulatedFeesArguments {
    marketplace: RawTransactionArgument<string>;
}
export interface AccumulatedFeesOptions {
    package: string;
    arguments: AccumulatedFeesArguments | [
        marketplace: RawTransactionArgument<string>
    ];
}
export function accumulatedFees(options: AccumulatedFeesOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::marketplace::Marketplace`
    ] satisfies string[];
    const parameterNames = ["marketplace"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'marketplace',
        function: 'accumulated_fees',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}