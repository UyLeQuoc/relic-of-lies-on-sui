/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/**
 * Gacha module for Love Letter NFT Cards Allows players to pull random NFT cards
 * with different rarities
 */

import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../../../utils/index';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import * as object from '../sui/object';
import * as balance from '../sui/balance';
const $moduleName = 'contract_v4::gacha';
export const Card = new MoveStruct({ name: `${$moduleName}::Card`, fields: {
        id: object.UID,
        /** Card value (0-9, corresponds to game cards) */
        value: bcs.u8(),
        /** Rarity type (0=Common, 1=Rare, 2=Epic, 3=Legendary, 4=Mythic) */
        rarity: bcs.u8(),
        /** Number of wins with this card */
        wins: bcs.u64(),
        /** Number of games played with this card */
        games_played: bcs.u64()
    } });
export const GACHA = new MoveStruct({ name: `${$moduleName}::GACHA`, fields: {
        dummy_field: bcs.bool()
    } });
export const GachaTreasury = new MoveStruct({ name: `${$moduleName}::GachaTreasury`, fields: {
        id: object.UID,
        balance: balance.Balance,
        total_cards_minted: bcs.u64()
    } });
export interface PullArguments {
    treasury: RawTransactionArgument<string>;
    payment: RawTransactionArgument<string>;
    amount: RawTransactionArgument<number | bigint>;
}
export interface PullOptions {
    package: string;
    arguments: PullArguments | [
        treasury: RawTransactionArgument<string>,
        payment: RawTransactionArgument<string>,
        amount: RawTransactionArgument<number | bigint>
    ];
}
/** Pull multiple random cards from gacha Cost: 0.01 SUI per card */
export function pull(options: PullOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::gacha::GachaTreasury`,
        '0x0000000000000000000000000000000000000000000000000000000000000002::coin::Coin<0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI>',
        'u64',
        '0x0000000000000000000000000000000000000000000000000000000000000002::random::Random'
    ] satisfies string[];
    const parameterNames = ["treasury", "payment", "amount"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'gacha',
        function: 'pull',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PullAndKeepArguments {
    treasury: RawTransactionArgument<string>;
    payment: RawTransactionArgument<string>;
    amount: RawTransactionArgument<number | bigint>;
}
export interface PullAndKeepOptions {
    package: string;
    arguments: PullAndKeepArguments | [
        treasury: RawTransactionArgument<string>,
        payment: RawTransactionArgument<string>,
        amount: RawTransactionArgument<number | bigint>
    ];
}
/** Pull multiple cards and transfer all to sender Cost: 0.01 SUI per card */
export function pullAndKeep(options: PullAndKeepOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::gacha::GachaTreasury`,
        '0x0000000000000000000000000000000000000000000000000000000000000002::coin::Coin<0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI>',
        'u64',
        '0x0000000000000000000000000000000000000000000000000000000000000002::random::Random'
    ] satisfies string[];
    const parameterNames = ["treasury", "payment", "amount"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'gacha',
        function: 'pull_and_keep',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface UpgradeArguments {
    card1: RawTransactionArgument<string>;
    card2: RawTransactionArgument<string>;
    card3: RawTransactionArgument<string>;
}
export interface UpgradeOptions {
    package: string;
    arguments: UpgradeArguments | [
        card1: RawTransactionArgument<string>,
        card2: RawTransactionArgument<string>,
        card3: RawTransactionArgument<string>
    ];
}
/**
 * Upgrade 3 cards of the same rarity to attempt getting 1 card of higher rarity
 * Success rate depends on rarity: Common→Rare 80%, Rare→Epic 60%, Epic→Legendary
 * 40%, Legendary→Mythic 20% On SUCCESS: Returns upgraded card with combined stats
 * On FAILURE: Returns 1 card of same rarity with combined stats (2 cards are lost)
 */
export function upgrade(options: UpgradeOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::gacha::Card`,
        `${packageAddress}::gacha::Card`,
        `${packageAddress}::gacha::Card`,
        '0x0000000000000000000000000000000000000000000000000000000000000002::random::Random'
    ] satisfies string[];
    const parameterNames = ["card1", "card2", "card3"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'gacha',
        function: 'upgrade',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface UpgradeAndKeepArguments {
    card1: RawTransactionArgument<string>;
    card2: RawTransactionArgument<string>;
    card3: RawTransactionArgument<string>;
}
export interface UpgradeAndKeepOptions {
    package: string;
    arguments: UpgradeAndKeepArguments | [
        card1: RawTransactionArgument<string>,
        card2: RawTransactionArgument<string>,
        card3: RawTransactionArgument<string>
    ];
}
/**
 * Upgrade and transfer to sender Returns true if upgrade succeeded, false if
 * failed (still get a card back)
 */
export function upgradeAndKeep(options: UpgradeAndKeepOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::gacha::Card`,
        `${packageAddress}::gacha::Card`,
        `${packageAddress}::gacha::Card`,
        '0x0000000000000000000000000000000000000000000000000000000000000002::random::Random'
    ] satisfies string[];
    const parameterNames = ["card1", "card2", "card3"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'gacha',
        function: 'upgrade_and_keep',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CardValueArguments {
    card: RawTransactionArgument<string>;
}
export interface CardValueOptions {
    package: string;
    arguments: CardValueArguments | [
        card: RawTransactionArgument<string>
    ];
}
export function cardValue(options: CardValueOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::gacha::Card`
    ] satisfies string[];
    const parameterNames = ["card"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'gacha',
        function: 'card_value',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CardRarityArguments {
    card: RawTransactionArgument<string>;
}
export interface CardRarityOptions {
    package: string;
    arguments: CardRarityArguments | [
        card: RawTransactionArgument<string>
    ];
}
export function cardRarity(options: CardRarityOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::gacha::Card`
    ] satisfies string[];
    const parameterNames = ["card"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'gacha',
        function: 'card_rarity',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CardWinsArguments {
    card: RawTransactionArgument<string>;
}
export interface CardWinsOptions {
    package: string;
    arguments: CardWinsArguments | [
        card: RawTransactionArgument<string>
    ];
}
export function cardWins(options: CardWinsOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::gacha::Card`
    ] satisfies string[];
    const parameterNames = ["card"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'gacha',
        function: 'card_wins',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CardGamesPlayedArguments {
    card: RawTransactionArgument<string>;
}
export interface CardGamesPlayedOptions {
    package: string;
    arguments: CardGamesPlayedArguments | [
        card: RawTransactionArgument<string>
    ];
}
export function cardGamesPlayed(options: CardGamesPlayedOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::gacha::Card`
    ] satisfies string[];
    const parameterNames = ["card"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'gacha',
        function: 'card_games_played',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface GachaCostOptions {
    package: string;
    arguments?: [
    ];
}
export function gachaCost(options: GachaCostOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'gacha',
        function: 'gacha_cost',
    });
}
export interface TreasuryBalanceArguments {
    treasury: RawTransactionArgument<string>;
}
export interface TreasuryBalanceOptions {
    package: string;
    arguments: TreasuryBalanceArguments | [
        treasury: RawTransactionArgument<string>
    ];
}
export function treasuryBalance(options: TreasuryBalanceOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::gacha::GachaTreasury`
    ] satisfies string[];
    const parameterNames = ["treasury"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'gacha',
        function: 'treasury_balance',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface TotalCardsMintedArguments {
    treasury: RawTransactionArgument<string>;
}
export interface TotalCardsMintedOptions {
    package: string;
    arguments: TotalCardsMintedArguments | [
        treasury: RawTransactionArgument<string>
    ];
}
export function totalCardsMinted(options: TotalCardsMintedOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::gacha::GachaTreasury`
    ] satisfies string[];
    const parameterNames = ["treasury"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'gacha',
        function: 'total_cards_minted',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RarityCommonOptions {
    package: string;
    arguments?: [
    ];
}
export function rarityCommon(options: RarityCommonOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'gacha',
        function: 'rarity_common',
    });
}
export interface RarityRareOptions {
    package: string;
    arguments?: [
    ];
}
export function rarityRare(options: RarityRareOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'gacha',
        function: 'rarity_rare',
    });
}
export interface RarityEpicOptions {
    package: string;
    arguments?: [
    ];
}
export function rarityEpic(options: RarityEpicOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'gacha',
        function: 'rarity_epic',
    });
}
export interface RarityLegendaryOptions {
    package: string;
    arguments?: [
    ];
}
export function rarityLegendary(options: RarityLegendaryOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'gacha',
        function: 'rarity_legendary',
    });
}
export interface RarityMythicOptions {
    package: string;
    arguments?: [
    ];
}
export function rarityMythic(options: RarityMythicOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'gacha',
        function: 'rarity_mythic',
    });
}
export interface UpgradeRateArguments {
    rarity: RawTransactionArgument<number>;
}
export interface UpgradeRateOptions {
    package: string;
    arguments: UpgradeRateArguments | [
        rarity: RawTransactionArgument<number>
    ];
}
/** Get upgrade success rate for a rarity (out of 100) */
export function upgradeRate(options: UpgradeRateOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        'u8'
    ] satisfies string[];
    const parameterNames = ["rarity"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'gacha',
        function: 'upgrade_rate',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface UpgradeRateCommonToRareOptions {
    package: string;
    arguments?: [
    ];
}
/** Get upgrade rates for all rarities */
export function upgradeRateCommonToRare(options: UpgradeRateCommonToRareOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'gacha',
        function: 'upgrade_rate_common_to_rare',
    });
}
export interface UpgradeRateRareToEpicOptions {
    package: string;
    arguments?: [
    ];
}
export function upgradeRateRareToEpic(options: UpgradeRateRareToEpicOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'gacha',
        function: 'upgrade_rate_rare_to_epic',
    });
}
export interface UpgradeRateEpicToLegendaryOptions {
    package: string;
    arguments?: [
    ];
}
export function upgradeRateEpicToLegendary(options: UpgradeRateEpicToLegendaryOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'gacha',
        function: 'upgrade_rate_epic_to_legendary',
    });
}
export interface UpgradeRateLegendaryToMythicOptions {
    package: string;
    arguments?: [
    ];
}
export function upgradeRateLegendaryToMythic(options: UpgradeRateLegendaryToMythicOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'gacha',
        function: 'upgrade_rate_legendary_to_mythic',
    });
}
export interface RarityNameArguments {
    rarity: RawTransactionArgument<number>;
}
export interface RarityNameOptions {
    package: string;
    arguments: RarityNameArguments | [
        rarity: RawTransactionArgument<number>
    ];
}
/** Get rarity name as string */
export function rarityName(options: RarityNameOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        'u8'
    ] satisfies string[];
    const parameterNames = ["rarity"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'gacha',
        function: 'rarity_name',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface WithdrawTreasuryArguments {
    treasury: RawTransactionArgument<string>;
    amount: RawTransactionArgument<number | bigint>;
}
export interface WithdrawTreasuryOptions {
    package: string;
    arguments: WithdrawTreasuryArguments | [
        treasury: RawTransactionArgument<string>,
        amount: RawTransactionArgument<number | bigint>
    ];
}
/** Withdraw treasury balance (admin only - requires AdminCap in future) */
export function withdrawTreasury(options: WithdrawTreasuryOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::gacha::GachaTreasury`,
        'u64'
    ] satisfies string[];
    const parameterNames = ["treasury", "amount"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'gacha',
        function: 'withdraw_treasury',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}