/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/**
 * Seal Access Control module for Relic Of Lies with Seal Integration Handles card
 * ownership verification for Seal key server access control
 */

import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../../../utils/index';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
const $moduleName = 'contract_v4::seal_access';
export const CardOwnership = new MoveStruct({ name: `${$moduleName}::CardOwnership`, fields: {
        card_index: bcs.u64(),
        owner: bcs.Address,
        is_revealed: bcs.bool()
    } });
export const TemporaryAccess = new MoveStruct({ name: `${$moduleName}::TemporaryAccess`, fields: {
        viewer: bcs.Address,
        card_index: bcs.u64(),
        expires_turn: bcs.u64()
    } });
export const SealAccessState = new MoveStruct({ name: `${$moduleName}::SealAccessState`, fields: {
        /** Room's Seal namespace (derived from room ID) */
        namespace: bcs.vector(bcs.u8()),
        /** Card ownership mapping: index in vector = card index */
        card_owners: bcs.vector(CardOwnership),
        /** Temporary access grants (Priest effect, etc.) */
        temporary_access: bcs.vector(TemporaryAccess),
        /** Current turn number for access expiration */
        current_turn: bcs.u64()
    } });
export interface NewArguments {
    namespace: RawTransactionArgument<number[]>;
}
export interface NewOptions {
    package: string;
    arguments: NewArguments | [
        namespace: RawTransactionArgument<number[]>
    ];
}
/** Create new access state for a room */
export function _new(options: NewOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        'vector<u8>'
    ] satisfies string[];
    const parameterNames = ["namespace"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access',
        function: 'new',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RegisterCardArguments {
    state: RawTransactionArgument<string>;
    cardIndex: RawTransactionArgument<number | bigint>;
    owner: RawTransactionArgument<string>;
}
export interface RegisterCardOptions {
    package: string;
    arguments: RegisterCardArguments | [
        state: RawTransactionArgument<string>,
        cardIndex: RawTransactionArgument<number | bigint>,
        owner: RawTransactionArgument<string>
    ];
}
/** Register a new card with owner */
export function registerCard(options: RegisterCardOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::seal_access::SealAccessState`,
        'u64',
        'address'
    ] satisfies string[];
    const parameterNames = ["state", "cardIndex", "owner"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access',
        function: 'register_card',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RegisterCardsForPlayerArguments {
    state: RawTransactionArgument<string>;
    cardIndices: RawTransactionArgument<number | bigint[]>;
    owner: RawTransactionArgument<string>;
}
export interface RegisterCardsForPlayerOptions {
    package: string;
    arguments: RegisterCardsForPlayerArguments | [
        state: RawTransactionArgument<string>,
        cardIndices: RawTransactionArgument<number | bigint[]>,
        owner: RawTransactionArgument<string>
    ];
}
/** Register multiple cards for a player */
export function registerCardsForPlayer(options: RegisterCardsForPlayerOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::seal_access::SealAccessState`,
        'vector<u64>',
        'address'
    ] satisfies string[];
    const parameterNames = ["state", "cardIndices", "owner"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access',
        function: 'register_cards_for_player',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface TransferOwnershipArguments {
    state: RawTransactionArgument<string>;
    cardIndex: RawTransactionArgument<number | bigint>;
    newOwner: RawTransactionArgument<string>;
}
export interface TransferOwnershipOptions {
    package: string;
    arguments: TransferOwnershipArguments | [
        state: RawTransactionArgument<string>,
        cardIndex: RawTransactionArgument<number | bigint>,
        newOwner: RawTransactionArgument<string>
    ];
}
/** Transfer card ownership (King effect) */
export function transferOwnership(options: TransferOwnershipOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::seal_access::SealAccessState`,
        'u64',
        'address'
    ] satisfies string[];
    const parameterNames = ["state", "cardIndex", "newOwner"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access',
        function: 'transfer_ownership',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SwapOwnershipArguments {
    state: RawTransactionArgument<string>;
    cardIndex_1: RawTransactionArgument<number | bigint>;
    cardIndex_2: RawTransactionArgument<number | bigint>;
}
export interface SwapOwnershipOptions {
    package: string;
    arguments: SwapOwnershipArguments | [
        state: RawTransactionArgument<string>,
        cardIndex_1: RawTransactionArgument<number | bigint>,
        cardIndex_2: RawTransactionArgument<number | bigint>
    ];
}
/** Swap card ownership between two players (King effect) */
export function swapOwnership(options: SwapOwnershipOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::seal_access::SealAccessState`,
        'u64',
        'u64'
    ] satisfies string[];
    const parameterNames = ["state", "cardIndex_1", "cardIndex_2"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access',
        function: 'swap_ownership',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RevealCardArguments {
    state: RawTransactionArgument<string>;
    cardIndex: RawTransactionArgument<number | bigint>;
}
export interface RevealCardOptions {
    package: string;
    arguments: RevealCardArguments | [
        state: RawTransactionArgument<string>,
        cardIndex: RawTransactionArgument<number | bigint>
    ];
}
/** Mark card as revealed */
export function revealCard(options: RevealCardOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::seal_access::SealAccessState`,
        'u64'
    ] satisfies string[];
    const parameterNames = ["state", "cardIndex"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access',
        function: 'reveal_card',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RemoveCardArguments {
    state: RawTransactionArgument<string>;
    cardIndex: RawTransactionArgument<number | bigint>;
}
export interface RemoveCardOptions {
    package: string;
    arguments: RemoveCardArguments | [
        state: RawTransactionArgument<string>,
        cardIndex: RawTransactionArgument<number | bigint>
    ];
}
/** Remove card from ownership (when discarded) */
export function removeCard(options: RemoveCardOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::seal_access::SealAccessState`,
        'u64'
    ] satisfies string[];
    const parameterNames = ["state", "cardIndex"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access',
        function: 'remove_card',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface GrantTemporaryAccessArguments {
    state: RawTransactionArgument<string>;
    viewer: RawTransactionArgument<string>;
    cardIndex: RawTransactionArgument<number | bigint>;
    durationTurns: RawTransactionArgument<number | bigint>;
}
export interface GrantTemporaryAccessOptions {
    package: string;
    arguments: GrantTemporaryAccessArguments | [
        state: RawTransactionArgument<string>,
        viewer: RawTransactionArgument<string>,
        cardIndex: RawTransactionArgument<number | bigint>,
        durationTurns: RawTransactionArgument<number | bigint>
    ];
}
/** Grant temporary access (Priest effect) */
export function grantTemporaryAccess(options: GrantTemporaryAccessOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::seal_access::SealAccessState`,
        'address',
        'u64',
        'u64'
    ] satisfies string[];
    const parameterNames = ["state", "viewer", "cardIndex", "durationTurns"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access',
        function: 'grant_temporary_access',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface HasTemporaryAccessArguments {
    state: RawTransactionArgument<string>;
    viewer: RawTransactionArgument<string>;
    cardIndex: RawTransactionArgument<number | bigint>;
}
export interface HasTemporaryAccessOptions {
    package: string;
    arguments: HasTemporaryAccessArguments | [
        state: RawTransactionArgument<string>,
        viewer: RawTransactionArgument<string>,
        cardIndex: RawTransactionArgument<number | bigint>
    ];
}
/** Check if viewer has temporary access to card */
export function hasTemporaryAccess(options: HasTemporaryAccessOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::seal_access::SealAccessState`,
        'address',
        'u64'
    ] satisfies string[];
    const parameterNames = ["state", "viewer", "cardIndex"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access',
        function: 'has_temporary_access',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CleanupExpiredAccessArguments {
    state: RawTransactionArgument<string>;
}
export interface CleanupExpiredAccessOptions {
    package: string;
    arguments: CleanupExpiredAccessArguments | [
        state: RawTransactionArgument<string>
    ];
}
/** Clean up expired temporary access */
export function cleanupExpiredAccess(options: CleanupExpiredAccessOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::seal_access::SealAccessState`
    ] satisfies string[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access',
        function: 'cleanup_expired_access',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface AdvanceTurnArguments {
    state: RawTransactionArgument<string>;
}
export interface AdvanceTurnOptions {
    package: string;
    arguments: AdvanceTurnArguments | [
        state: RawTransactionArgument<string>
    ];
}
/** Update current turn */
export function advanceTurn(options: AdvanceTurnOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::seal_access::SealAccessState`
    ] satisfies string[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access',
        function: 'advance_turn',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface OwnsCardArguments {
    state: RawTransactionArgument<string>;
    caller: RawTransactionArgument<string>;
    cardIndex: RawTransactionArgument<number | bigint>;
}
export interface OwnsCardOptions {
    package: string;
    arguments: OwnsCardArguments | [
        state: RawTransactionArgument<string>,
        caller: RawTransactionArgument<string>,
        cardIndex: RawTransactionArgument<number | bigint>
    ];
}
/** Check if caller owns the card */
export function ownsCard(options: OwnsCardOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::seal_access::SealAccessState`,
        'address',
        'u64'
    ] satisfies string[];
    const parameterNames = ["state", "caller", "cardIndex"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access',
        function: 'owns_card',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CanAccessCardArguments {
    state: RawTransactionArgument<string>;
    caller: RawTransactionArgument<string>;
    cardIndex: RawTransactionArgument<number | bigint>;
}
export interface CanAccessCardOptions {
    package: string;
    arguments: CanAccessCardArguments | [
        state: RawTransactionArgument<string>,
        caller: RawTransactionArgument<string>,
        cardIndex: RawTransactionArgument<number | bigint>
    ];
}
/** Check if caller can access the card (owns OR has temporary access) */
export function canAccessCard(options: CanAccessCardOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::seal_access::SealAccessState`,
        'address',
        'u64'
    ] satisfies string[];
    const parameterNames = ["state", "caller", "cardIndex"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access',
        function: 'can_access_card',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface GetCardOwnerArguments {
    state: RawTransactionArgument<string>;
    cardIndex: RawTransactionArgument<number | bigint>;
}
export interface GetCardOwnerOptions {
    package: string;
    arguments: GetCardOwnerArguments | [
        state: RawTransactionArgument<string>,
        cardIndex: RawTransactionArgument<number | bigint>
    ];
}
/** Get card owner */
export function getCardOwner(options: GetCardOwnerOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::seal_access::SealAccessState`,
        'u64'
    ] satisfies string[];
    const parameterNames = ["state", "cardIndex"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access',
        function: 'get_card_owner',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface GetPlayerCardsArguments {
    state: RawTransactionArgument<string>;
    player: RawTransactionArgument<string>;
}
export interface GetPlayerCardsOptions {
    package: string;
    arguments: GetPlayerCardsArguments | [
        state: RawTransactionArgument<string>,
        player: RawTransactionArgument<string>
    ];
}
/** Get all cards owned by a player */
export function getPlayerCards(options: GetPlayerCardsOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::seal_access::SealAccessState`,
        'address'
    ] satisfies string[];
    const parameterNames = ["state", "player"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access',
        function: 'get_player_cards',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface IsCardRevealedArguments {
    state: RawTransactionArgument<string>;
    cardIndex: RawTransactionArgument<number | bigint>;
}
export interface IsCardRevealedOptions {
    package: string;
    arguments: IsCardRevealedArguments | [
        state: RawTransactionArgument<string>,
        cardIndex: RawTransactionArgument<number | bigint>
    ];
}
/** Check if card is revealed */
export function isCardRevealed(options: IsCardRevealedOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::seal_access::SealAccessState`,
        'u64'
    ] satisfies string[];
    const parameterNames = ["state", "cardIndex"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access',
        function: 'is_card_revealed',
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
        module: 'seal_access',
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
        module: 'seal_access',
        function: 'extract_card_index_from_seal_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface NamespaceArguments {
    state: RawTransactionArgument<string>;
}
export interface NamespaceOptions {
    package: string;
    arguments: NamespaceArguments | [
        state: RawTransactionArgument<string>
    ];
}
export function namespace(options: NamespaceOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::seal_access::SealAccessState`
    ] satisfies string[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access',
        function: 'namespace',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CurrentTurnArguments {
    state: RawTransactionArgument<string>;
}
export interface CurrentTurnOptions {
    package: string;
    arguments: CurrentTurnArguments | [
        state: RawTransactionArgument<string>
    ];
}
export function currentTurn(options: CurrentTurnOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::seal_access::SealAccessState`
    ] satisfies string[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access',
        function: 'current_turn',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CardOwnersCountArguments {
    state: RawTransactionArgument<string>;
}
export interface CardOwnersCountOptions {
    package: string;
    arguments: CardOwnersCountArguments | [
        state: RawTransactionArgument<string>
    ];
}
export function cardOwnersCount(options: CardOwnersCountOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::seal_access::SealAccessState`
    ] satisfies string[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access',
        function: 'card_owners_count',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface TemporaryAccessCountArguments {
    state: RawTransactionArgument<string>;
}
export interface TemporaryAccessCountOptions {
    package: string;
    arguments: TemporaryAccessCountArguments | [
        state: RawTransactionArgument<string>
    ];
}
export function temporaryAccessCount(options: TemporaryAccessCountOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::seal_access::SealAccessState`
    ] satisfies string[];
    const parameterNames = ["state"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access',
        function: 'temporary_access_count',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}