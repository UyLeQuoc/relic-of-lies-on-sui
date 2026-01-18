/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/**
 * Deck module for custom card decks Allows users to create and manage their own
 * 10-card decks for gameplay
 */

import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../../../utils/index';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import * as object from '../sui/object';
import * as gacha from './gacha';
const $moduleName = 'contract_v4::deck';
export const CustomDeck = new MoveStruct({ name: `${$moduleName}::CustomDeck`, fields: {
        id: object.UID,
        /** Owner of this deck */
        owner: bcs.Address,
        /** Name of the deck */
        name: bcs.string(),
        /**
         * Card slots (index 0-9 corresponds to card value 0-9) Each slot can hold one Card
         * NFT
         */
        slots: bcs.vector(bcs.option(gacha.Card)),
        /** Whether this deck is complete (all 10 slots filled) */
        is_complete: bcs.bool()
    } });
export interface CreateDeckArguments {
    name: RawTransactionArgument<string>;
}
export interface CreateDeckOptions {
    package: string;
    arguments: CreateDeckArguments | [
        name: RawTransactionArgument<string>
    ];
}
/** Create a new empty custom deck */
export function createDeck(options: CreateDeckOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String'
    ] satisfies string[];
    const parameterNames = ["name"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'deck',
        function: 'create_deck',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CreateDeckAndKeepArguments {
    name: RawTransactionArgument<string>;
}
export interface CreateDeckAndKeepOptions {
    package: string;
    arguments: CreateDeckAndKeepArguments | [
        name: RawTransactionArgument<string>
    ];
}
/** Create deck and transfer to sender */
export function createDeckAndKeep(options: CreateDeckAndKeepOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String'
    ] satisfies string[];
    const parameterNames = ["name"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'deck',
        function: 'create_deck_and_keep',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SetCardArguments {
    deck: RawTransactionArgument<string>;
    slot: RawTransactionArgument<number | bigint>;
    card: RawTransactionArgument<string>;
}
export interface SetCardOptions {
    package: string;
    arguments: SetCardArguments | [
        deck: RawTransactionArgument<string>,
        slot: RawTransactionArgument<number | bigint>,
        card: RawTransactionArgument<string>
    ];
}
/**
 * Set a card in a specific slot The card's value must match the slot index (slot 0
 * = card value 0, etc.)
 */
export function setCard(options: SetCardOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::deck::CustomDeck`,
        'u64',
        `${packageAddress}::gacha::Card`
    ] satisfies string[];
    const parameterNames = ["deck", "slot", "card"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'deck',
        function: 'set_card',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RemoveCardArguments {
    deck: RawTransactionArgument<string>;
    slot: RawTransactionArgument<number | bigint>;
}
export interface RemoveCardOptions {
    package: string;
    arguments: RemoveCardArguments | [
        deck: RawTransactionArgument<string>,
        slot: RawTransactionArgument<number | bigint>
    ];
}
/** Remove a card from a specific slot */
export function removeCard(options: RemoveCardOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::deck::CustomDeck`,
        'u64'
    ] satisfies string[];
    const parameterNames = ["deck", "slot"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'deck',
        function: 'remove_card',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RemoveCardAndKeepArguments {
    deck: RawTransactionArgument<string>;
    slot: RawTransactionArgument<number | bigint>;
}
export interface RemoveCardAndKeepOptions {
    package: string;
    arguments: RemoveCardAndKeepArguments | [
        deck: RawTransactionArgument<string>,
        slot: RawTransactionArgument<number | bigint>
    ];
}
/** Remove card and transfer to owner */
export function removeCardAndKeep(options: RemoveCardAndKeepOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::deck::CustomDeck`,
        'u64'
    ] satisfies string[];
    const parameterNames = ["deck", "slot"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'deck',
        function: 'remove_card_and_keep',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SwapCardArguments {
    deck: RawTransactionArgument<string>;
    slot: RawTransactionArgument<number | bigint>;
    newCard: RawTransactionArgument<string>;
}
export interface SwapCardOptions {
    package: string;
    arguments: SwapCardArguments | [
        deck: RawTransactionArgument<string>,
        slot: RawTransactionArgument<number | bigint>,
        newCard: RawTransactionArgument<string>
    ];
}
/** Swap a card in a slot (remove old, add new) */
export function swapCard(options: SwapCardOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::deck::CustomDeck`,
        'u64',
        `${packageAddress}::gacha::Card`
    ] satisfies string[];
    const parameterNames = ["deck", "slot", "newCard"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'deck',
        function: 'swap_card',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SwapCardAndKeepArguments {
    deck: RawTransactionArgument<string>;
    slot: RawTransactionArgument<number | bigint>;
    newCard: RawTransactionArgument<string>;
}
export interface SwapCardAndKeepOptions {
    package: string;
    arguments: SwapCardAndKeepArguments | [
        deck: RawTransactionArgument<string>,
        slot: RawTransactionArgument<number | bigint>,
        newCard: RawTransactionArgument<string>
    ];
}
/** Swap card and transfer old card to owner */
export function swapCardAndKeep(options: SwapCardAndKeepOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::deck::CustomDeck`,
        'u64',
        `${packageAddress}::gacha::Card`
    ] satisfies string[];
    const parameterNames = ["deck", "slot", "newCard"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'deck',
        function: 'swap_card_and_keep',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface FillSlotsArguments {
    deck: RawTransactionArgument<string>;
    cards: RawTransactionArgument<string[]>;
}
export interface FillSlotsOptions {
    package: string;
    arguments: FillSlotsArguments | [
        deck: RawTransactionArgument<string>,
        cards: RawTransactionArgument<string[]>
    ];
}
/** Fill multiple slots at once */
export function fillSlots(options: FillSlotsOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::deck::CustomDeck`,
        `vector<${packageAddress}::gacha::Card>`
    ] satisfies string[];
    const parameterNames = ["deck", "cards"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'deck',
        function: 'fill_slots',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface EmptyDeckArguments {
    deck: RawTransactionArgument<string>;
}
export interface EmptyDeckOptions {
    package: string;
    arguments: EmptyDeckArguments | [
        deck: RawTransactionArgument<string>
    ];
}
/** Empty all slots and return cards */
export function emptyDeck(options: EmptyDeckOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::deck::CustomDeck`
    ] satisfies string[];
    const parameterNames = ["deck"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'deck',
        function: 'empty_deck',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface EmptyDeckAndKeepArguments {
    deck: RawTransactionArgument<string>;
}
export interface EmptyDeckAndKeepOptions {
    package: string;
    arguments: EmptyDeckAndKeepArguments | [
        deck: RawTransactionArgument<string>
    ];
}
/** Empty deck and transfer all cards to owner */
export function emptyDeckAndKeep(options: EmptyDeckAndKeepOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::deck::CustomDeck`
    ] satisfies string[];
    const parameterNames = ["deck"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'deck',
        function: 'empty_deck_and_keep',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface DeckOwnerArguments {
    deck: RawTransactionArgument<string>;
}
export interface DeckOwnerOptions {
    package: string;
    arguments: DeckOwnerArguments | [
        deck: RawTransactionArgument<string>
    ];
}
export function deckOwner(options: DeckOwnerOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::deck::CustomDeck`
    ] satisfies string[];
    const parameterNames = ["deck"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'deck',
        function: 'deck_owner',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface DeckNameArguments {
    deck: RawTransactionArgument<string>;
}
export interface DeckNameOptions {
    package: string;
    arguments: DeckNameArguments | [
        deck: RawTransactionArgument<string>
    ];
}
export function deckName(options: DeckNameOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::deck::CustomDeck`
    ] satisfies string[];
    const parameterNames = ["deck"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'deck',
        function: 'deck_name',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface IsCompleteArguments {
    deck: RawTransactionArgument<string>;
}
export interface IsCompleteOptions {
    package: string;
    arguments: IsCompleteArguments | [
        deck: RawTransactionArgument<string>
    ];
}
export function isComplete(options: IsCompleteOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::deck::CustomDeck`
    ] satisfies string[];
    const parameterNames = ["deck"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'deck',
        function: 'is_complete',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SlotFilledArguments {
    deck: RawTransactionArgument<string>;
    slot: RawTransactionArgument<number | bigint>;
}
export interface SlotFilledOptions {
    package: string;
    arguments: SlotFilledArguments | [
        deck: RawTransactionArgument<string>,
        slot: RawTransactionArgument<number | bigint>
    ];
}
export function slotFilled(options: SlotFilledOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::deck::CustomDeck`,
        'u64'
    ] satisfies string[];
    const parameterNames = ["deck", "slot"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'deck',
        function: 'slot_filled',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface FilledSlotsCountArguments {
    deck: RawTransactionArgument<string>;
}
export interface FilledSlotsCountOptions {
    package: string;
    arguments: FilledSlotsCountArguments | [
        deck: RawTransactionArgument<string>
    ];
}
export function filledSlotsCount(options: FilledSlotsCountOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::deck::CustomDeck`
    ] satisfies string[];
    const parameterNames = ["deck"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'deck',
        function: 'filled_slots_count',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SlotCardInfoArguments {
    deck: RawTransactionArgument<string>;
    slot: RawTransactionArgument<number | bigint>;
}
export interface SlotCardInfoOptions {
    package: string;
    arguments: SlotCardInfoArguments | [
        deck: RawTransactionArgument<string>,
        slot: RawTransactionArgument<number | bigint>
    ];
}
/** Get card info for a slot (value, rarity) without moving the card */
export function slotCardInfo(options: SlotCardInfoOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::deck::CustomDeck`,
        'u64'
    ] satisfies string[];
    const parameterNames = ["deck", "slot"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'deck',
        function: 'slot_card_info',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface FilledSlotIndicesArguments {
    deck: RawTransactionArgument<string>;
}
export interface FilledSlotIndicesOptions {
    package: string;
    arguments: FilledSlotIndicesArguments | [
        deck: RawTransactionArgument<string>
    ];
}
/** Get all filled slot indices */
export function filledSlotIndices(options: FilledSlotIndicesOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::deck::CustomDeck`
    ] satisfies string[];
    const parameterNames = ["deck"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'deck',
        function: 'filled_slot_indices',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface DeckSizeOptions {
    package: string;
    arguments?: [
    ];
}
/** Get deck size constant */
export function deckSize(options: DeckSizeOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'deck',
        function: 'deck_size',
    });
}
export interface DestroyEmptyDeckArguments {
    deck: RawTransactionArgument<string>;
}
export interface DestroyEmptyDeckOptions {
    package: string;
    arguments: DestroyEmptyDeckArguments | [
        deck: RawTransactionArgument<string>
    ];
}
/** Destroy an empty deck */
export function destroyEmptyDeck(options: DestroyEmptyDeckOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::deck::CustomDeck`
    ] satisfies string[];
    const parameterNames = ["deck"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'deck',
        function: 'destroy_empty_deck',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}