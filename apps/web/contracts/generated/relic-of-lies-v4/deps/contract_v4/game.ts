/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/**
 * Game module for Love Letter 2019 Premium Edition with Seal Encryption Contains
 * core game logic with encrypted cards and pending action pattern
 */

import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../../../utils/index';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import * as object from '../sui/object';
import * as balance from '../sui/balance';
import * as decryptable from './decryptable';
import * as seal_access from './seal_access';
const $moduleName = 'contract_v4::game';
export const Player = new MoveStruct({ name: `${$moduleName}::Player`, fields: {
        addr: bcs.Address,
        /** Card indices in hand (NOT card values - values are encrypted) */
        hand: bcs.vector(bcs.u64()),
        /** Revealed discarded cards (values visible after discard) */
        discarded: bcs.vector(bcs.u8()),
        is_alive: bcs.bool(),
        is_immune: bcs.bool(),
        tokens: bcs.u8(),
        has_played_spy: bcs.bool()
    } });
export const PendingAction = new MoveStruct({ name: `${$moduleName}::PendingAction`, fields: {
        action_type: bcs.u8(),
        /** Player who initiated the action */
        initiator: bcs.Address,
        initiator_idx: bcs.u64(),
        /** Player who needs to respond */
        responder: bcs.Address,
        responder_idx: bcs.u64(),
        /** Additional data (e.g., guess for Guard, attacker's card value for Baron) */
        data: bcs.vector(bcs.u8()),
        /** Card index involved (target's card) */
        card_index: bcs.u64()
    } });
export const DiscardedCardEntry = new MoveStruct({ name: `${$moduleName}::DiscardedCardEntry`, fields: {
        /** Player who discarded the card */
        player_addr: bcs.Address,
        player_idx: bcs.u64(),
        /** Card value */
        card_value: bcs.u8(),
        /** Card index in encrypted_cards */
        card_index: bcs.u64(),
        /** Turn number when discarded */
        turn_number: bcs.u64(),
        /** Reason for discard (played, prince_effect, baron_loss, etc.) */
        reason: bcs.string()
    } });
export const GameRoom = new MoveStruct({ name: `${$moduleName}::GameRoom`, fields: {
        id: object.UID,
        name: bcs.string(),
        creator: bcs.Address,
        pot: balance.Balance,
        players: bcs.vector(Player),
        /** All 21 encrypted cards */
        encrypted_cards: bcs.vector(decryptable.Decryptable),
        /** Remaining card indices in deck (not dealt yet) */
        deck_indices: bcs.vector(bcs.u64()),
        /** Burn card index */
        burn_card_index: bcs.option(bcs.u64()),
        /** Public card indices for 2-player game */
        public_card_indices: bcs.vector(bcs.u64()),
        /** Revealed card values (after decryption) */
        revealed_values: bcs.vector(bcs.option(bcs.u8())),
        status: bcs.u8(),
        current_turn: bcs.u64(),
        max_players: bcs.u8(),
        round_number: bcs.u8(),
        tokens_to_win: bcs.u8(),
        /** Ordered list of discarded cards for game log */
        discarded_cards_log: bcs.vector(DiscardedCardEntry),
        pending_action: bcs.option(PendingAction),
        chancellor_pending: bcs.bool(),
        chancellor_player_idx: bcs.u64(),
        chancellor_card_indices: bcs.vector(bcs.u64()),
        seal_access: seal_access.SealAccessState
    } });
export const RoomRegistry = new MoveStruct({ name: `${$moduleName}::RoomRegistry`, fields: {
        id: object.UID,
        active_rooms: bcs.vector(bcs.Address)
    } });
export interface CreateRoomArguments {
    registry: RawTransactionArgument<string>;
    name: RawTransactionArgument<string>;
    maxPlayers: RawTransactionArgument<number>;
}
export interface CreateRoomOptions {
    package: string;
    arguments: CreateRoomArguments | [
        registry: RawTransactionArgument<string>,
        name: RawTransactionArgument<string>,
        maxPlayers: RawTransactionArgument<number>
    ];
}
/** Create a new game room */
export function createRoom(options: CreateRoomOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::RoomRegistry`,
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
        'u8'
    ] satisfies string[];
    const parameterNames = ["registry", "name", "maxPlayers"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'create_room',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface JoinRoomArguments {
    room: RawTransactionArgument<string>;
}
export interface JoinRoomOptions {
    package: string;
    arguments: JoinRoomArguments | [
        room: RawTransactionArgument<string>
    ];
}
/** Join an existing room */
export function joinRoom(options: JoinRoomOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'join_room',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface StartNewGameArguments {
    room: RawTransactionArgument<string>;
}
export interface StartNewGameOptions {
    package: string;
    arguments: StartNewGameArguments | [
        room: RawTransactionArgument<string>
    ];
}
/**
 * Start a completely new game (reset everything including tokens) Can only be
 * called when game is finished
 */
export function startNewGame(options: StartNewGameOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'start_new_game',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SubmitEncryptedDeckArguments {
    room: RawTransactionArgument<string>;
    ciphertexts: RawTransactionArgument<number[][]>;
    hashes: RawTransactionArgument<number[][]>;
    nonces: RawTransactionArgument<number[][]>;
}
export interface SubmitEncryptedDeckOptions {
    package: string;
    arguments: SubmitEncryptedDeckArguments | [
        room: RawTransactionArgument<string>,
        ciphertexts: RawTransactionArgument<number[][]>,
        hashes: RawTransactionArgument<number[][]>,
        nonces: RawTransactionArgument<number[][]>
    ];
}
/** Submit encrypted deck (called by frontend after local shuffle and encryption) */
export function submitEncryptedDeck(options: SubmitEncryptedDeckOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`,
        'vector<vector<u8>>',
        'vector<vector<u8>>',
        'vector<vector<u8>>'
    ] satisfies string[];
    const parameterNames = ["room", "ciphertexts", "hashes", "nonces"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'submit_encrypted_deck',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PlayTurnArguments {
    room: RawTransactionArgument<string>;
    leaderboard: RawTransactionArgument<string>;
    cardIndex: RawTransactionArgument<number | bigint>;
    plaintextData: RawTransactionArgument<number[]>;
    targetIdx: RawTransactionArgument<number | bigint | null>;
    guess: RawTransactionArgument<number | null>;
}
export interface PlayTurnOptions {
    package: string;
    arguments: PlayTurnArguments | [
        room: RawTransactionArgument<string>,
        leaderboard: RawTransactionArgument<string>,
        cardIndex: RawTransactionArgument<number | bigint>,
        plaintextData: RawTransactionArgument<number[]>,
        targetIdx: RawTransactionArgument<number | bigint | null>,
        guess: RawTransactionArgument<number | null>
    ];
}
/** Play a turn - player reveals card value with proof */
export function playTurn(options: PlayTurnOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`,
        `${packageAddress}::leaderboard::Leaderboard`,
        'u64',
        'vector<u8>',
        '0x0000000000000000000000000000000000000000000000000000000000000001::option::Option<u64>',
        '0x0000000000000000000000000000000000000000000000000000000000000001::option::Option<u8>'
    ] satisfies string[];
    const parameterNames = ["room", "leaderboard", "cardIndex", "plaintextData", "targetIdx", "guess"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'play_turn',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RespondGuardArguments {
    room: RawTransactionArgument<string>;
    leaderboard: RawTransactionArgument<string>;
    cardIndex: RawTransactionArgument<number | bigint>;
    plaintextData: RawTransactionArgument<number[]>;
}
export interface RespondGuardOptions {
    package: string;
    arguments: RespondGuardArguments | [
        room: RawTransactionArgument<string>,
        leaderboard: RawTransactionArgument<string>,
        cardIndex: RawTransactionArgument<number | bigint>,
        plaintextData: RawTransactionArgument<number[]>
    ];
}
/** Respond to Guard guess */
export function respondGuard(options: RespondGuardOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`,
        `${packageAddress}::leaderboard::Leaderboard`,
        'u64',
        'vector<u8>'
    ] satisfies string[];
    const parameterNames = ["room", "leaderboard", "cardIndex", "plaintextData"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'respond_guard',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RespondBaronArguments {
    room: RawTransactionArgument<string>;
    leaderboard: RawTransactionArgument<string>;
    cardIndex: RawTransactionArgument<number | bigint>;
    plaintextData: RawTransactionArgument<number[]>;
}
export interface RespondBaronOptions {
    package: string;
    arguments: RespondBaronArguments | [
        room: RawTransactionArgument<string>,
        leaderboard: RawTransactionArgument<string>,
        cardIndex: RawTransactionArgument<number | bigint>,
        plaintextData: RawTransactionArgument<number[]>
    ];
}
/** Respond to Baron comparison */
export function respondBaron(options: RespondBaronOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`,
        `${packageAddress}::leaderboard::Leaderboard`,
        'u64',
        'vector<u8>'
    ] satisfies string[];
    const parameterNames = ["room", "leaderboard", "cardIndex", "plaintextData"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'respond_baron',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RespondPrinceArguments {
    room: RawTransactionArgument<string>;
    leaderboard: RawTransactionArgument<string>;
    cardIndex: RawTransactionArgument<number | bigint>;
    plaintextData: RawTransactionArgument<number[]>;
}
export interface RespondPrinceOptions {
    package: string;
    arguments: RespondPrinceArguments | [
        room: RawTransactionArgument<string>,
        leaderboard: RawTransactionArgument<string>,
        cardIndex: RawTransactionArgument<number | bigint>,
        plaintextData: RawTransactionArgument<number[]>
    ];
}
/** Respond to Prince discard */
export function respondPrince(options: RespondPrinceOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`,
        `${packageAddress}::leaderboard::Leaderboard`,
        'u64',
        'vector<u8>'
    ] satisfies string[];
    const parameterNames = ["room", "leaderboard", "cardIndex", "plaintextData"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'respond_prince',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ResolveChancellorArguments {
    room: RawTransactionArgument<string>;
    leaderboard: RawTransactionArgument<string>;
    keepCardIndex: RawTransactionArgument<number | bigint>;
    returnIndices: RawTransactionArgument<number | bigint[]>;
}
export interface ResolveChancellorOptions {
    package: string;
    arguments: ResolveChancellorArguments | [
        room: RawTransactionArgument<string>,
        leaderboard: RawTransactionArgument<string>,
        keepCardIndex: RawTransactionArgument<number | bigint>,
        returnIndices: RawTransactionArgument<number | bigint[]>
    ];
}
/** Resolve Chancellor action */
export function resolveChancellor(options: ResolveChancellorOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`,
        `${packageAddress}::leaderboard::Leaderboard`,
        'u64',
        'vector<u64>'
    ] satisfies string[];
    const parameterNames = ["room", "leaderboard", "keepCardIndex", "returnIndices"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'resolve_chancellor',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SealApproveCardArguments {
    sealId: RawTransactionArgument<number[]>;
    room: RawTransactionArgument<string>;
}
export interface SealApproveCardOptions {
    package: string;
    arguments: SealApproveCardArguments | [
        sealId: RawTransactionArgument<number[]>,
        room: RawTransactionArgument<string>
    ];
}
/** Entry function for Seal servers to verify card access */
export function sealApproveCard(options: SealApproveCardOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        'vector<u8>',
        `${packageAddress}::game::GameRoom`
    ] satisfies string[];
    const parameterNames = ["sealId", "room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'seal_approve_card',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RoomIdArguments {
    room: RawTransactionArgument<string>;
}
export interface RoomIdOptions {
    package: string;
    arguments: RoomIdArguments | [
        room: RawTransactionArgument<string>
    ];
}
export function roomId(options: RoomIdOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'room_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RoomNameArguments {
    room: RawTransactionArgument<string>;
}
export interface RoomNameOptions {
    package: string;
    arguments: RoomNameArguments | [
        room: RawTransactionArgument<string>
    ];
}
export function roomName(options: RoomNameOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'room_name',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RoomStatusArguments {
    room: RawTransactionArgument<string>;
}
export interface RoomStatusOptions {
    package: string;
    arguments: RoomStatusArguments | [
        room: RawTransactionArgument<string>
    ];
}
export function roomStatus(options: RoomStatusOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'room_status',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RoomCurrentTurnArguments {
    room: RawTransactionArgument<string>;
}
export interface RoomCurrentTurnOptions {
    package: string;
    arguments: RoomCurrentTurnArguments | [
        room: RawTransactionArgument<string>
    ];
}
export function roomCurrentTurn(options: RoomCurrentTurnOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'room_current_turn',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RoomRoundNumberArguments {
    room: RawTransactionArgument<string>;
}
export interface RoomRoundNumberOptions {
    package: string;
    arguments: RoomRoundNumberArguments | [
        room: RawTransactionArgument<string>
    ];
}
export function roomRoundNumber(options: RoomRoundNumberOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'room_round_number',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CurrentPlayerAddressArguments {
    room: RawTransactionArgument<string>;
}
export interface CurrentPlayerAddressOptions {
    package: string;
    arguments: CurrentPlayerAddressArguments | [
        room: RawTransactionArgument<string>
    ];
}
export function currentPlayerAddress(options: CurrentPlayerAddressOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'current_player_address',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PlayerHandIndicesArguments {
    room: RawTransactionArgument<string>;
    playerAddr: RawTransactionArgument<string>;
}
export interface PlayerHandIndicesOptions {
    package: string;
    arguments: PlayerHandIndicesArguments | [
        room: RawTransactionArgument<string>,
        playerAddr: RawTransactionArgument<string>
    ];
}
export function playerHandIndices(options: PlayerHandIndicesOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`,
        'address'
    ] satisfies string[];
    const parameterNames = ["room", "playerAddr"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'player_hand_indices',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PlayerDiscardedArguments {
    room: RawTransactionArgument<string>;
    playerAddr: RawTransactionArgument<string>;
}
export interface PlayerDiscardedOptions {
    package: string;
    arguments: PlayerDiscardedArguments | [
        room: RawTransactionArgument<string>,
        playerAddr: RawTransactionArgument<string>
    ];
}
export function playerDiscarded(options: PlayerDiscardedOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`,
        'address'
    ] satisfies string[];
    const parameterNames = ["room", "playerAddr"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'player_discarded',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PlayerTokensArguments {
    room: RawTransactionArgument<string>;
    playerAddr: RawTransactionArgument<string>;
}
export interface PlayerTokensOptions {
    package: string;
    arguments: PlayerTokensArguments | [
        room: RawTransactionArgument<string>,
        playerAddr: RawTransactionArgument<string>
    ];
}
export function playerTokens(options: PlayerTokensOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`,
        'address'
    ] satisfies string[];
    const parameterNames = ["room", "playerAddr"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'player_tokens',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PlayerIsAliveArguments {
    room: RawTransactionArgument<string>;
    playerAddr: RawTransactionArgument<string>;
}
export interface PlayerIsAliveOptions {
    package: string;
    arguments: PlayerIsAliveArguments | [
        room: RawTransactionArgument<string>,
        playerAddr: RawTransactionArgument<string>
    ];
}
export function playerIsAlive(options: PlayerIsAliveOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`,
        'address'
    ] satisfies string[];
    const parameterNames = ["room", "playerAddr"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'player_is_alive',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface GetSealNamespaceArguments {
    room: RawTransactionArgument<string>;
}
export interface GetSealNamespaceOptions {
    package: string;
    arguments: GetSealNamespaceArguments | [
        room: RawTransactionArgument<string>
    ];
}
export function getSealNamespace(options: GetSealNamespaceOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'get_seal_namespace',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface DeckSizeArguments {
    room: RawTransactionArgument<string>;
}
export interface DeckSizeOptions {
    package: string;
    arguments: DeckSizeArguments | [
        room: RawTransactionArgument<string>
    ];
}
export function deckSize(options: DeckSizeOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'deck_size',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface IsPendingActionArguments {
    room: RawTransactionArgument<string>;
}
export interface IsPendingActionOptions {
    package: string;
    arguments: IsPendingActionArguments | [
        room: RawTransactionArgument<string>
    ];
}
export function isPendingAction(options: IsPendingActionOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'is_pending_action',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface IsChancellorPendingArguments {
    room: RawTransactionArgument<string>;
}
export interface IsChancellorPendingOptions {
    package: string;
    arguments: IsChancellorPendingArguments | [
        room: RawTransactionArgument<string>
    ];
}
export function isChancellorPending(options: IsChancellorPendingOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'is_chancellor_pending',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface AllPlayersArguments {
    room: RawTransactionArgument<string>;
}
export interface AllPlayersOptions {
    package: string;
    arguments: AllPlayersArguments | [
        room: RawTransactionArgument<string>
    ];
}
export function allPlayers(options: AllPlayersOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'all_players',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface DiscardedCardsLogArguments {
    room: RawTransactionArgument<string>;
}
export interface DiscardedCardsLogOptions {
    package: string;
    arguments: DiscardedCardsLogArguments | [
        room: RawTransactionArgument<string>
    ];
}
/** Get the game log (discarded cards in order) */
export function discardedCardsLog(options: DiscardedCardsLogOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'discarded_cards_log',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface DiscardedCardsLogLengthArguments {
    room: RawTransactionArgument<string>;
}
export interface DiscardedCardsLogLengthOptions {
    package: string;
    arguments: DiscardedCardsLogLengthArguments | [
        room: RawTransactionArgument<string>
    ];
}
/** Get number of entries in the game log */
export function discardedCardsLogLength(options: DiscardedCardsLogLengthOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'discarded_cards_log_length',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface DiscardedCardEntryArguments {
    room: RawTransactionArgument<string>;
    index: RawTransactionArgument<number | bigint>;
}
export interface DiscardedCardEntryOptions {
    package: string;
    arguments: DiscardedCardEntryArguments | [
        room: RawTransactionArgument<string>,
        index: RawTransactionArgument<number | bigint>
    ];
}
/** Get a specific entry from the game log */
export function discardedCardEntry(options: DiscardedCardEntryOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`,
        'u64'
    ] satisfies string[];
    const parameterNames = ["room", "index"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'discarded_card_entry',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ActiveRoomsArguments {
    registry: RawTransactionArgument<string>;
}
export interface ActiveRoomsOptions {
    package: string;
    arguments: ActiveRoomsArguments | [
        registry: RawTransactionArgument<string>
    ];
}
export function activeRooms(options: ActiveRoomsOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::RoomRegistry`
    ] satisfies string[];
    const parameterNames = ["registry"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'active_rooms',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CleanupFinishedRoomArguments {
    registry: RawTransactionArgument<string>;
    room: RawTransactionArgument<string>;
}
export interface CleanupFinishedRoomOptions {
    package: string;
    arguments: CleanupFinishedRoomArguments | [
        registry: RawTransactionArgument<string>,
        room: RawTransactionArgument<string>
    ];
}
export function cleanupFinishedRoom(options: CleanupFinishedRoomOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::RoomRegistry`,
        `${packageAddress}::game::GameRoom`
    ] satisfies string[];
    const parameterNames = ["registry", "room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'cleanup_finished_room',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}