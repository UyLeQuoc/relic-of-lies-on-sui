/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/**
 * Utility functions for Relic Of Lies  Contains helper functions
 * for deck manipulation and random operations
 */

import { type Transaction } from '@mysten/sui/transactions';
import { normalizeMoveArguments, type RawTransactionArgument } from '../../../utils/index';
import { type BcsType } from '@mysten/sui/bcs';
export interface CreateDeckOptions {
    package: string;
    arguments?: [
    ];
}
/**
 * Create a fresh deck of 21 cards for Relic Of Lies  Returns:
 * vector of card values [0-9] with correct counts
 */
export function createDeck(options: CreateDeckOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'utils',
        function: 'create_deck',
    });
}
export interface ShuffleDeckArguments {
    deck: RawTransactionArgument<number[]>;
}
export interface ShuffleDeckOptions {
    package: string;
    arguments: ShuffleDeckArguments | [
        deck: RawTransactionArgument<number[]>
    ];
}
/** Shuffle deck using Fisher-Yates algorithm with random source */
export function shuffleDeck(options: ShuffleDeckOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        'vector<u8>',
        '0x0000000000000000000000000000000000000000000000000000000000000002::random::Random'
    ] satisfies string[];
    const parameterNames = ["deck"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'utils',
        function: 'shuffle_deck',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface DrawCardArguments {
    deck: RawTransactionArgument<number[]>;
}
export interface DrawCardOptions {
    package: string;
    arguments: DrawCardArguments | [
        deck: RawTransactionArgument<number[]>
    ];
}
/**
 * Draw a card from the top of deck (removes from end) Returns: Option<u8> -
 * Some(card) if deck not empty, None otherwise
 */
export function drawCard(options: DrawCardOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        'vector<u8>'
    ] satisfies string[];
    const parameterNames = ["deck"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'utils',
        function: 'draw_card',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface DrawCardsArguments {
    deck: RawTransactionArgument<number[]>;
    count: RawTransactionArgument<number | bigint>;
}
export interface DrawCardsOptions {
    package: string;
    arguments: DrawCardsArguments | [
        deck: RawTransactionArgument<number[]>,
        count: RawTransactionArgument<number | bigint>
    ];
}
/** Draw multiple cards from deck */
export function drawCards(options: DrawCardsOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        'vector<u8>',
        'u64'
    ] satisfies string[];
    const parameterNames = ["deck", "count"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'utils',
        function: 'draw_cards',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface InsertAtBottomArguments {
    deck: RawTransactionArgument<number[]>;
    card: RawTransactionArgument<number>;
}
export interface InsertAtBottomOptions {
    package: string;
    arguments: InsertAtBottomArguments | [
        deck: RawTransactionArgument<number[]>,
        card: RawTransactionArgument<number>
    ];
}
/** Insert a card at the bottom of deck (index 0) */
export function insertAtBottom(options: InsertAtBottomOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        'vector<u8>',
        'u8'
    ] satisfies string[];
    const parameterNames = ["deck", "card"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'utils',
        function: 'insert_at_bottom',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface InsertCardsAtBottomArguments {
    deck: RawTransactionArgument<number[]>;
    cards: RawTransactionArgument<number[]>;
}
export interface InsertCardsAtBottomOptions {
    package: string;
    arguments: InsertCardsAtBottomArguments | [
        deck: RawTransactionArgument<number[]>,
        cards: RawTransactionArgument<number[]>
    ];
}
/** Insert multiple cards at the bottom of deck */
export function insertCardsAtBottom(options: InsertCardsAtBottomOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        'vector<u8>',
        'vector<u8>'
    ] satisfies string[];
    const parameterNames = ["deck", "cards"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'utils',
        function: 'insert_cards_at_bottom',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface IsValidCardArguments {
    card: RawTransactionArgument<number>;
}
export interface IsValidCardOptions {
    package: string;
    arguments: IsValidCardArguments | [
        card: RawTransactionArgument<number>
    ];
}
/** Check if a card value is valid (0-9) */
export function isValidCard(options: IsValidCardOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        'u8'
    ] satisfies string[];
    const parameterNames = ["card"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'utils',
        function: 'is_valid_card',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CardNameArguments {
    card: RawTransactionArgument<number>;
}
export interface CardNameOptions {
    package: string;
    arguments: CardNameArguments | [
        card: RawTransactionArgument<number>
    ];
}
/** Get card name for display */
export function cardName(options: CardNameOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        'u8'
    ] satisfies string[];
    const parameterNames = ["card"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'utils',
        function: 'card_name',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface FindIndexArguments<T extends BcsType<any>> {
    vec: RawTransactionArgument<T[]>;
    value: RawTransactionArgument<T>;
}
export interface FindIndexOptions<T extends BcsType<any>> {
    package: string;
    arguments: FindIndexArguments<T> | [
        vec: RawTransactionArgument<T[]>,
        value: RawTransactionArgument<T>
    ];
    typeArguments: [
        string
    ];
}
/** Find index of a value in a vector */
export function findIndex<T extends BcsType<any>>(options: FindIndexOptions<T>) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `vector<${options.typeArguments[0]}>`,
        `${options.typeArguments[0]}`
    ] satisfies string[];
    const parameterNames = ["vec", "value"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'utils',
        function: 'find_index',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface RemoveFirstArguments<T extends BcsType<any>> {
    vec: RawTransactionArgument<T[]>;
    value: RawTransactionArgument<T>;
}
export interface RemoveFirstOptions<T extends BcsType<any>> {
    package: string;
    arguments: RemoveFirstArguments<T> | [
        vec: RawTransactionArgument<T[]>,
        value: RawTransactionArgument<T>
    ];
    typeArguments: [
        string
    ];
}
/**
 * Remove first occurrence of a value from vector Returns true if removed, false if
 * not found
 */
export function removeFirst<T extends BcsType<any>>(options: RemoveFirstOptions<T>) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `vector<${options.typeArguments[0]}>`,
        `${options.typeArguments[0]}`
    ] satisfies string[];
    const parameterNames = ["vec", "value"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'utils',
        function: 'remove_first',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface ContainsArguments<T extends BcsType<any>> {
    vec: RawTransactionArgument<T[]>;
    value: RawTransactionArgument<T>;
}
export interface ContainsOptions<T extends BcsType<any>> {
    package: string;
    arguments: ContainsArguments<T> | [
        vec: RawTransactionArgument<T[]>,
        value: RawTransactionArgument<T>
    ];
    typeArguments: [
        string
    ];
}
/** Check if vector contains a value */
export function contains<T extends BcsType<any>>(options: ContainsOptions<T>) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `vector<${options.typeArguments[0]}>`,
        `${options.typeArguments[0]}`
    ] satisfies string[];
    const parameterNames = ["vec", "value"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'utils',
        function: 'contains',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface HighestCardArguments {
    hand: RawTransactionArgument<number[]>;
}
export interface HighestCardOptions {
    package: string;
    arguments: HighestCardArguments | [
        hand: RawTransactionArgument<number[]>
    ];
}
/** Get highest card value from a hand */
export function highestCard(options: HighestCardOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        'vector<u8>'
    ] satisfies string[];
    const parameterNames = ["hand"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'utils',
        function: 'highest_card',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CardsSumArguments {
    cards: RawTransactionArgument<number[]>;
}
export interface CardsSumOptions {
    package: string;
    arguments: CardsSumArguments | [
        cards: RawTransactionArgument<number[]>
    ];
}
/** Sum of all cards in a vector (for tiebreaker using discarded cards) */
export function cardsSum(options: CardsSumOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        'vector<u8>'
    ] satisfies string[];
    const parameterNames = ["cards"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'utils',
        function: 'cards_sum',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface HasPlayedSpyArguments {
    discarded: RawTransactionArgument<number[]>;
}
export interface HasPlayedSpyOptions {
    package: string;
    arguments: HasPlayedSpyArguments | [
        discarded: RawTransactionArgument<number[]>
    ];
}
/** Check if a player has played Spy (check discarded pile) */
export function hasPlayedSpy(options: HasPlayedSpyOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        'vector<u8>'
    ] satisfies string[];
    const parameterNames = ["discarded"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'utils',
        function: 'has_played_spy',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface IsHoldingSpyArguments {
    hand: RawTransactionArgument<number[]>;
}
export interface IsHoldingSpyOptions {
    package: string;
    arguments: IsHoldingSpyArguments | [
        hand: RawTransactionArgument<number[]>
    ];
}
/** Check if a player is holding Spy */
export function isHoldingSpy(options: IsHoldingSpyOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        'vector<u8>'
    ] satisfies string[];
    const parameterNames = ["hand"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'utils',
        function: 'is_holding_spy',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CountOccurrencesArguments<T extends BcsType<any>> {
    vec: RawTransactionArgument<T[]>;
    value: RawTransactionArgument<T>;
}
export interface CountOccurrencesOptions<T extends BcsType<any>> {
    package: string;
    arguments: CountOccurrencesArguments<T> | [
        vec: RawTransactionArgument<T[]>,
        value: RawTransactionArgument<T>
    ];
    typeArguments: [
        string
    ];
}
/** Count occurrences of a value in vector */
export function countOccurrences<T extends BcsType<any>>(options: CountOccurrencesOptions<T>) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `vector<${options.typeArguments[0]}>`,
        `${options.typeArguments[0]}`
    ] satisfies string[];
    const parameterNames = ["vec", "value"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'utils',
        function: 'count_occurrences',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}