/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/**
 * Utility functions for Love Letter with Seal Integration Contains helpers for
 * deck manipulation, commitment verification, and Seal namespace
 */

import { type Transaction } from '@mysten/sui/transactions';
import { normalizeMoveArguments, type RawTransactionArgument } from '../../../utils/index';
import { type BcsType } from '@mysten/sui/bcs';
export interface CreateDeckOptions {
    package: string;
    arguments?: [
    ];
}
/** Create a fresh deck of 21 cards for Love Letter 2019 Premium Edition */
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
export interface GenerateSecretsArguments {
    count: RawTransactionArgument<number | bigint>;
}
export interface GenerateSecretsOptions {
    package: string;
    arguments: GenerateSecretsArguments | [
        count: RawTransactionArgument<number | bigint>
    ];
}
/** Generate random bytes for secrets */
export function generateSecrets(options: GenerateSecretsOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::random::Random',
        'u64'
    ] satisfies string[];
    const parameterNames = ["count"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'utils',
        function: 'generate_secrets',
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
/** Draw a card from the top of deck (removes from end) */
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
export interface DrawCardIndexArguments {
    deckIndices: RawTransactionArgument<number | bigint[]>;
}
export interface DrawCardIndexOptions {
    package: string;
    arguments: DrawCardIndexArguments | [
        deckIndices: RawTransactionArgument<number | bigint[]>
    ];
}
/** Draw card index from deck indices */
export function drawCardIndex(options: DrawCardIndexOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        'vector<u64>'
    ] satisfies string[];
    const parameterNames = ["deckIndices"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'utils',
        function: 'draw_card_index',
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
export interface InsertIndexAtBottomArguments {
    deckIndices: RawTransactionArgument<number | bigint[]>;
    cardIdx: RawTransactionArgument<number | bigint>;
}
export interface InsertIndexAtBottomOptions {
    package: string;
    arguments: InsertIndexAtBottomArguments | [
        deckIndices: RawTransactionArgument<number | bigint[]>,
        cardIdx: RawTransactionArgument<number | bigint>
    ];
}
/** Insert card index at bottom */
export function insertIndexAtBottom(options: InsertIndexAtBottomOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        'vector<u64>',
        'u64'
    ] satisfies string[];
    const parameterNames = ["deckIndices", "cardIdx"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'utils',
        function: 'insert_index_at_bottom',
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
export interface InsertIndicesAtBottomArguments {
    deckIndices: RawTransactionArgument<number | bigint[]>;
    indices: RawTransactionArgument<number | bigint[]>;
}
export interface InsertIndicesAtBottomOptions {
    package: string;
    arguments: InsertIndicesAtBottomArguments | [
        deckIndices: RawTransactionArgument<number | bigint[]>,
        indices: RawTransactionArgument<number | bigint[]>
    ];
}
/** Insert multiple indices at bottom */
export function insertIndicesAtBottom(options: InsertIndicesAtBottomOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        'vector<u64>',
        'vector<u64>'
    ] satisfies string[];
    const parameterNames = ["deckIndices", "indices"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'utils',
        function: 'insert_indices_at_bottom',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CreateCommitmentArguments {
    cardValue: RawTransactionArgument<number>;
    secret: RawTransactionArgument<number[]>;
}
export interface CreateCommitmentOptions {
    package: string;
    arguments: CreateCommitmentArguments | [
        cardValue: RawTransactionArgument<number>,
        secret: RawTransactionArgument<number[]>
    ];
}
/** Create commitment: hash(card_value || secret) */
export function createCommitment(options: CreateCommitmentOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        'u8',
        'vector<u8>'
    ] satisfies string[];
    const parameterNames = ["cardValue", "secret"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'utils',
        function: 'create_commitment',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface VerifyCommitmentArguments {
    commitment: RawTransactionArgument<number[]>;
    revealedValue: RawTransactionArgument<number>;
    secret: RawTransactionArgument<number[]>;
}
export interface VerifyCommitmentOptions {
    package: string;
    arguments: VerifyCommitmentArguments | [
        commitment: RawTransactionArgument<number[]>,
        revealedValue: RawTransactionArgument<number>,
        secret: RawTransactionArgument<number[]>
    ];
}
/** Verify commitment matches revealed value */
export function verifyCommitment(options: VerifyCommitmentOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        'vector<u8>',
        'u8',
        'vector<u8>'
    ] satisfies string[];
    const parameterNames = ["commitment", "revealedValue", "secret"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'utils',
        function: 'verify_commitment',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CreateDeckCommitmentsArguments {
    deck: RawTransactionArgument<number[]>;
    secrets: RawTransactionArgument<number[][]>;
}
export interface CreateDeckCommitmentsOptions {
    package: string;
    arguments: CreateDeckCommitmentsArguments | [
        deck: RawTransactionArgument<number[]>,
        secrets: RawTransactionArgument<number[][]>
    ];
}
/** Create commitments for entire deck */
export function createDeckCommitments(options: CreateDeckCommitmentsOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        'vector<u8>',
        'vector<vector<u8>>'
    ] satisfies string[];
    const parameterNames = ["deck", "secrets"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'utils',
        function: 'create_deck_commitments',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface IsPrefixArguments {
    prefix: RawTransactionArgument<number[]>;
    data: RawTransactionArgument<number[]>;
}
export interface IsPrefixOptions {
    package: string;
    arguments: IsPrefixArguments | [
        prefix: RawTransactionArgument<number[]>,
        data: RawTransactionArgument<number[]>
    ];
}
/** Check if prefix matches the start of data */
export function isPrefix(options: IsPrefixOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        'vector<u8>',
        'vector<u8>'
    ] satisfies string[];
    const parameterNames = ["prefix", "data"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'utils',
        function: 'is_prefix',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ExtractCardIndexFromSealIdArguments {
    sealId: RawTransactionArgument<number[]>;
    namespaceLen: RawTransactionArgument<number | bigint>;
}
export interface ExtractCardIndexFromSealIdOptions {
    package: string;
    arguments: ExtractCardIndexFromSealIdArguments | [
        sealId: RawTransactionArgument<number[]>,
        namespaceLen: RawTransactionArgument<number | bigint>
    ];
}
/**
 * Extract card index from Seal ID Format: [namespace (32 bytes)] [card_index (8
 * bytes)] [nonce (variable)]
 */
export function extractCardIndexFromSealId(options: ExtractCardIndexFromSealIdOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        'vector<u8>',
        'u64'
    ] satisfies string[];
    const parameterNames = ["sealId", "namespaceLen"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'utils',
        function: 'extract_card_index_from_seal_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface BuildSealIdArguments {
    namespace: RawTransactionArgument<number[]>;
    cardIndex: RawTransactionArgument<number | bigint>;
    nonce: RawTransactionArgument<number[]>;
}
export interface BuildSealIdOptions {
    package: string;
    arguments: BuildSealIdArguments | [
        namespace: RawTransactionArgument<number[]>,
        cardIndex: RawTransactionArgument<number | bigint>,
        nonce: RawTransactionArgument<number[]>
    ];
}
/** Build Seal ID from namespace and card index */
export function buildSealId(options: BuildSealIdOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        'vector<u8>',
        'u64',
        'vector<u8>'
    ] satisfies string[];
    const parameterNames = ["namespace", "cardIndex", "nonce"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'utils',
        function: 'build_seal_id',
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
/** Remove first occurrence of a value from vector */
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