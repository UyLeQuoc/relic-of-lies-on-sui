/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/**
 * Marketplace module for Relic Of Lies NFT Cards Uses Sui Kiosk for trading cards
 * with no-lock policy
 */

import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../../../utils/index';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import * as object from '../sui/object';
const $moduleName = 'contract::marketplace';
export const MarketplaceRegistry = new MoveStruct({ name: `${$moduleName}::MarketplaceRegistry`, fields: {
        id: object.UID,
        /** Total number of kiosks created */
        total_kiosks: bcs.u64(),
        /** Total volume traded (in MIST) */
        total_volume: bcs.u64()
    } });
export interface CreateKioskArguments {
    registry: RawTransactionArgument<string>;
}
export interface CreateKioskOptions {
    package: string;
    arguments: CreateKioskArguments | [
        registry: RawTransactionArgument<string>
    ];
}
/** Create a new kiosk for the sender */
export function createKiosk(options: CreateKioskOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::marketplace::MarketplaceRegistry`
    ] satisfies string[];
    const parameterNames = ["registry"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'marketplace',
        function: 'create_kiosk',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CreateKioskAndShareArguments {
    registry: RawTransactionArgument<string>;
}
export interface CreateKioskAndShareOptions {
    package: string;
    arguments: CreateKioskAndShareArguments | [
        registry: RawTransactionArgument<string>
    ];
}
/** Create kiosk and share/transfer */
export function createKioskAndShare(options: CreateKioskAndShareOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::marketplace::MarketplaceRegistry`
    ] satisfies string[];
    const parameterNames = ["registry"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'marketplace',
        function: 'create_kiosk_and_share',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CreateCardPolicyArguments {
    publisher: RawTransactionArgument<string>;
}
export interface CreateCardPolicyOptions {
    package: string;
    arguments: CreateCardPolicyArguments | [
        publisher: RawTransactionArgument<string>
    ];
}
/**
 * Create a transfer policy for Card type with no rules (instant transfer) This
 * should be called once by the package publisher
 */
export function createCardPolicy(options: CreateCardPolicyOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::package::Publisher'
    ] satisfies string[];
    const parameterNames = ["publisher"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'marketplace',
        function: 'create_card_policy',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CreateAndShareCardPolicyArguments {
    publisher: RawTransactionArgument<string>;
}
export interface CreateAndShareCardPolicyOptions {
    package: string;
    arguments: CreateAndShareCardPolicyArguments | [
        publisher: RawTransactionArgument<string>
    ];
}
/** Create and share the transfer policy */
export function createAndShareCardPolicy(options: CreateAndShareCardPolicyOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::package::Publisher'
    ] satisfies string[];
    const parameterNames = ["publisher"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'marketplace',
        function: 'create_and_share_card_policy',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PlaceCardArguments {
    kiosk: RawTransactionArgument<string>;
    cap: RawTransactionArgument<string>;
    card: RawTransactionArgument<string>;
}
export interface PlaceCardOptions {
    package: string;
    arguments: PlaceCardArguments | [
        kiosk: RawTransactionArgument<string>,
        cap: RawTransactionArgument<string>,
        card: RawTransactionArgument<string>
    ];
}
/** Place a card in the kiosk (not listed for sale yet) */
export function placeCard(options: PlaceCardOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::kiosk::Kiosk',
        '0x0000000000000000000000000000000000000000000000000000000000000002::kiosk::KioskOwnerCap',
        `${packageAddress}::gacha::Card`
    ] satisfies string[];
    const parameterNames = ["kiosk", "cap", "card"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'marketplace',
        function: 'place_card',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PlaceAndListArguments {
    kiosk: RawTransactionArgument<string>;
    cap: RawTransactionArgument<string>;
    card: RawTransactionArgument<string>;
    price: RawTransactionArgument<number | bigint>;
}
export interface PlaceAndListOptions {
    package: string;
    arguments: PlaceAndListArguments | [
        kiosk: RawTransactionArgument<string>,
        cap: RawTransactionArgument<string>,
        card: RawTransactionArgument<string>,
        price: RawTransactionArgument<number | bigint>
    ];
}
/** Place and list a card for sale in one transaction */
export function placeAndList(options: PlaceAndListOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::kiosk::Kiosk',
        '0x0000000000000000000000000000000000000000000000000000000000000002::kiosk::KioskOwnerCap',
        `${packageAddress}::gacha::Card`,
        'u64'
    ] satisfies string[];
    const parameterNames = ["kiosk", "cap", "card", "price"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'marketplace',
        function: 'place_and_list',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ListCardArguments {
    kiosk: RawTransactionArgument<string>;
    cap: RawTransactionArgument<string>;
    cardId: RawTransactionArgument<string>;
    price: RawTransactionArgument<number | bigint>;
}
export interface ListCardOptions {
    package: string;
    arguments: ListCardArguments | [
        kiosk: RawTransactionArgument<string>,
        cap: RawTransactionArgument<string>,
        cardId: RawTransactionArgument<string>,
        price: RawTransactionArgument<number | bigint>
    ];
}
/** List an existing card in kiosk for sale */
export function listCard(options: ListCardOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::kiosk::Kiosk',
        '0x0000000000000000000000000000000000000000000000000000000000000002::kiosk::KioskOwnerCap',
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID',
        'u64'
    ] satisfies string[];
    const parameterNames = ["kiosk", "cap", "cardId", "price"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'marketplace',
        function: 'list_card',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface DelistCardArguments {
    kiosk: RawTransactionArgument<string>;
    cap: RawTransactionArgument<string>;
    cardId: RawTransactionArgument<string>;
}
export interface DelistCardOptions {
    package: string;
    arguments: DelistCardArguments | [
        kiosk: RawTransactionArgument<string>,
        cap: RawTransactionArgument<string>,
        cardId: RawTransactionArgument<string>
    ];
}
/** Delist a card (remove from sale but keep in kiosk) */
export function delistCard(options: DelistCardOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::kiosk::Kiosk',
        '0x0000000000000000000000000000000000000000000000000000000000000002::kiosk::KioskOwnerCap',
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID'
    ] satisfies string[];
    const parameterNames = ["kiosk", "cap", "cardId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'marketplace',
        function: 'delist_card',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface WithdrawCardArguments {
    kiosk: RawTransactionArgument<string>;
    cap: RawTransactionArgument<string>;
    cardId: RawTransactionArgument<string>;
}
export interface WithdrawCardOptions {
    package: string;
    arguments: WithdrawCardArguments | [
        kiosk: RawTransactionArgument<string>,
        cap: RawTransactionArgument<string>,
        cardId: RawTransactionArgument<string>
    ];
}
/** Withdraw a card from kiosk (must not be listed) */
export function withdrawCard(options: WithdrawCardOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::kiosk::Kiosk',
        '0x0000000000000000000000000000000000000000000000000000000000000002::kiosk::KioskOwnerCap',
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID'
    ] satisfies string[];
    const parameterNames = ["kiosk", "cap", "cardId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'marketplace',
        function: 'withdraw_card',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface WithdrawCardAndKeepArguments {
    kiosk: RawTransactionArgument<string>;
    cap: RawTransactionArgument<string>;
    cardId: RawTransactionArgument<string>;
}
export interface WithdrawCardAndKeepOptions {
    package: string;
    arguments: WithdrawCardAndKeepArguments | [
        kiosk: RawTransactionArgument<string>,
        cap: RawTransactionArgument<string>,
        cardId: RawTransactionArgument<string>
    ];
}
/** Withdraw and transfer to sender */
export function withdrawCardAndKeep(options: WithdrawCardAndKeepOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::kiosk::Kiosk',
        '0x0000000000000000000000000000000000000000000000000000000000000002::kiosk::KioskOwnerCap',
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID'
    ] satisfies string[];
    const parameterNames = ["kiosk", "cap", "cardId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'marketplace',
        function: 'withdraw_card_and_keep',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PurchaseCardArguments {
    kiosk: RawTransactionArgument<string>;
    cardId: RawTransactionArgument<string>;
    payment: RawTransactionArgument<string>;
    policy: RawTransactionArgument<string>;
    registry: RawTransactionArgument<string>;
}
export interface PurchaseCardOptions {
    package: string;
    arguments: PurchaseCardArguments | [
        kiosk: RawTransactionArgument<string>,
        cardId: RawTransactionArgument<string>,
        payment: RawTransactionArgument<string>,
        policy: RawTransactionArgument<string>,
        registry: RawTransactionArgument<string>
    ];
}
/**
 * Purchase a card from kiosk Since we have no-lock policy, the card is transferred
 * immediately
 */
export function purchaseCard(options: PurchaseCardOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::kiosk::Kiosk',
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID',
        '0x0000000000000000000000000000000000000000000000000000000000000002::coin::Coin<0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI>',
        `0x0000000000000000000000000000000000000000000000000000000000000002::transfer_policy::TransferPolicy<${packageAddress}::gacha::Card>`,
        `${packageAddress}::marketplace::MarketplaceRegistry`
    ] satisfies string[];
    const parameterNames = ["kiosk", "cardId", "payment", "policy", "registry"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'marketplace',
        function: 'purchase_card',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PurchaseCardAndKeepArguments {
    kiosk: RawTransactionArgument<string>;
    cardId: RawTransactionArgument<string>;
    payment: RawTransactionArgument<string>;
    policy: RawTransactionArgument<string>;
    registry: RawTransactionArgument<string>;
}
export interface PurchaseCardAndKeepOptions {
    package: string;
    arguments: PurchaseCardAndKeepArguments | [
        kiosk: RawTransactionArgument<string>,
        cardId: RawTransactionArgument<string>,
        payment: RawTransactionArgument<string>,
        policy: RawTransactionArgument<string>,
        registry: RawTransactionArgument<string>
    ];
}
/** Purchase and transfer to buyer */
export function purchaseCardAndKeep(options: PurchaseCardAndKeepOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::kiosk::Kiosk',
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID',
        '0x0000000000000000000000000000000000000000000000000000000000000002::coin::Coin<0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI>',
        `0x0000000000000000000000000000000000000000000000000000000000000002::transfer_policy::TransferPolicy<${packageAddress}::gacha::Card>`,
        `${packageAddress}::marketplace::MarketplaceRegistry`
    ] satisfies string[];
    const parameterNames = ["kiosk", "cardId", "payment", "policy", "registry"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'marketplace',
        function: 'purchase_card_and_keep',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface WithdrawProfitsArguments {
    kiosk: RawTransactionArgument<string>;
    cap: RawTransactionArgument<string>;
}
export interface WithdrawProfitsOptions {
    package: string;
    arguments: WithdrawProfitsArguments | [
        kiosk: RawTransactionArgument<string>,
        cap: RawTransactionArgument<string>
    ];
}
/** Withdraw profits from kiosk */
export function withdrawProfits(options: WithdrawProfitsOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::kiosk::Kiosk',
        '0x0000000000000000000000000000000000000000000000000000000000000002::kiosk::KioskOwnerCap'
    ] satisfies string[];
    const parameterNames = ["kiosk", "cap"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'marketplace',
        function: 'withdraw_profits',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface WithdrawProfitsAmountArguments {
    kiosk: RawTransactionArgument<string>;
    cap: RawTransactionArgument<string>;
    amount: RawTransactionArgument<number | bigint>;
}
export interface WithdrawProfitsAmountOptions {
    package: string;
    arguments: WithdrawProfitsAmountArguments | [
        kiosk: RawTransactionArgument<string>,
        cap: RawTransactionArgument<string>,
        amount: RawTransactionArgument<number | bigint>
    ];
}
/** Withdraw specific amount of profits */
export function withdrawProfitsAmount(options: WithdrawProfitsAmountOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::kiosk::Kiosk',
        '0x0000000000000000000000000000000000000000000000000000000000000002::kiosk::KioskOwnerCap',
        'u64'
    ] satisfies string[];
    const parameterNames = ["kiosk", "cap", "amount"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'marketplace',
        function: 'withdraw_profits_amount',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RegistryTotalKiosksArguments {
    registry: RawTransactionArgument<string>;
}
export interface RegistryTotalKiosksOptions {
    package: string;
    arguments: RegistryTotalKiosksArguments | [
        registry: RawTransactionArgument<string>
    ];
}
export function registryTotalKiosks(options: RegistryTotalKiosksOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::marketplace::MarketplaceRegistry`
    ] satisfies string[];
    const parameterNames = ["registry"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'marketplace',
        function: 'registry_total_kiosks',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RegistryTotalVolumeArguments {
    registry: RawTransactionArgument<string>;
}
export interface RegistryTotalVolumeOptions {
    package: string;
    arguments: RegistryTotalVolumeArguments | [
        registry: RawTransactionArgument<string>
    ];
}
export function registryTotalVolume(options: RegistryTotalVolumeOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::marketplace::MarketplaceRegistry`
    ] satisfies string[];
    const parameterNames = ["registry"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'marketplace',
        function: 'registry_total_volume',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface IsCardListedArguments {
    kiosk: RawTransactionArgument<string>;
    cardId: RawTransactionArgument<string>;
}
export interface IsCardListedOptions {
    package: string;
    arguments: IsCardListedArguments | [
        kiosk: RawTransactionArgument<string>,
        cardId: RawTransactionArgument<string>
    ];
}
/** Check if a card is listed in a kiosk */
export function isCardListed(options: IsCardListedOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::kiosk::Kiosk',
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID'
    ] satisfies string[];
    const parameterNames = ["kiosk", "cardId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'marketplace',
        function: 'is_card_listed',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface KioskProfitsArguments {
    kiosk: RawTransactionArgument<string>;
}
export interface KioskProfitsOptions {
    package: string;
    arguments: KioskProfitsArguments | [
        kiosk: RawTransactionArgument<string>
    ];
}
/** Get kiosk profits amount */
export function kioskProfits(options: KioskProfitsOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::kiosk::Kiosk'
    ] satisfies string[];
    const parameterNames = ["kiosk"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'marketplace',
        function: 'kiosk_profits',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}