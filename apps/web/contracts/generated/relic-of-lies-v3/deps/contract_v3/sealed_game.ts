/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/**
 * Sealed Game module for Love Letter with Seal Integration Main game logic with
 * encrypted cards and commitment verification
 */

import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../../../utils/index';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import * as object from '../sui/object';
import * as balance from '../sui/balance';
import * as seal_access from './seal_access';
const $moduleName = 'contract_v3::sealed_game';
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
        /** Additional data (e.g., guess for Guard, attacker's card for Baron) */
        data: bcs.vector(bcs.u8()),
        /** Card index involved */
        card_index: bcs.u64()
    } });
export const SealedGameRoom = new MoveStruct({ name: `${$moduleName}::SealedGameRoom`, fields: {
        id: object.UID,
        name: bcs.string(),
        creator: bcs.Address,
        pot: balance.Balance,
        players: bcs.vector(Player),
        /** Original deck values (set at round start, used for commitment) */
        deck_values: bcs.vector(bcs.u8()),
        /** Secrets for each card (for commitment verification) */
        deck_secrets: bcs.vector(bcs.vector(bcs.u8())),
        /** Commitments for each card: hash(value || secret) */
        commitments: bcs.vector(bcs.vector(bcs.u8())),
        /** Remaining card indices in deck (not dealt yet) */
        deck_indices: bcs.vector(bcs.u64()),
        /** Burn card index */
        burn_card_index: bcs.option(bcs.u64()),
        /** Public cards for 2-player game */
        public_cards: bcs.vector(bcs.u8()),
        status: bcs.u8(),
        current_turn: bcs.u64(),
        max_players: bcs.u8(),
        round_number: bcs.u8(),
        tokens_to_win: bcs.u8(),
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
        `${packageAddress}::sealed_game::RoomRegistry`,
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
        'u8'
    ] satisfies string[];
    const parameterNames = ["registry", "name", "maxPlayers"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sealed_game',
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
        `${packageAddress}::sealed_game::SealedGameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sealed_game',
        function: 'join_room',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface StartRoundArguments {
    room: RawTransactionArgument<string>;
}
export interface StartRoundOptions {
    package: string;
    arguments: StartRoundArguments | [
        room: RawTransactionArgument<string>
    ];
}
/** Start a new round */
export function startRound(options: StartRoundOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::sealed_game::SealedGameRoom`,
        '0x0000000000000000000000000000000000000000000000000000000000000002::random::Random'
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sealed_game',
        function: 'start_round',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PlayTurnArguments {
    room: RawTransactionArgument<string>;
    leaderboard: RawTransactionArgument<string>;
    cardIndex: RawTransactionArgument<number | bigint>;
    revealedValue: RawTransactionArgument<number>;
    secret: RawTransactionArgument<number[]>;
    targetIdx: RawTransactionArgument<number | bigint | null>;
    guess: RawTransactionArgument<number | null>;
}
export interface PlayTurnOptions {
    package: string;
    arguments: PlayTurnArguments | [
        room: RawTransactionArgument<string>,
        leaderboard: RawTransactionArgument<string>,
        cardIndex: RawTransactionArgument<number | bigint>,
        revealedValue: RawTransactionArgument<number>,
        secret: RawTransactionArgument<number[]>,
        targetIdx: RawTransactionArgument<number | bigint | null>,
        guess: RawTransactionArgument<number | null>
    ];
}
/** Play a turn - player reveals card value with proof */
export function playTurn(options: PlayTurnOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::sealed_game::SealedGameRoom`,
        `${packageAddress}::leaderboard::Leaderboard`,
        'u64',
        'u8',
        'vector<u8>',
        '0x0000000000000000000000000000000000000000000000000000000000000001::option::Option<u64>',
        '0x0000000000000000000000000000000000000000000000000000000000000001::option::Option<u8>',
        '0x0000000000000000000000000000000000000000000000000000000000000002::random::Random'
    ] satisfies string[];
    const parameterNames = ["room", "leaderboard", "cardIndex", "revealedValue", "secret", "targetIdx", "guess"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sealed_game',
        function: 'play_turn',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RespondGuardArguments {
    room: RawTransactionArgument<string>;
    leaderboard: RawTransactionArgument<string>;
    cardIndex: RawTransactionArgument<number | bigint>;
    revealedValue: RawTransactionArgument<number>;
    secret: RawTransactionArgument<number[]>;
}
export interface RespondGuardOptions {
    package: string;
    arguments: RespondGuardArguments | [
        room: RawTransactionArgument<string>,
        leaderboard: RawTransactionArgument<string>,
        cardIndex: RawTransactionArgument<number | bigint>,
        revealedValue: RawTransactionArgument<number>,
        secret: RawTransactionArgument<number[]>
    ];
}
/** Respond to Guard guess */
export function respondGuard(options: RespondGuardOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::sealed_game::SealedGameRoom`,
        `${packageAddress}::leaderboard::Leaderboard`,
        'u64',
        'u8',
        'vector<u8>'
    ] satisfies string[];
    const parameterNames = ["room", "leaderboard", "cardIndex", "revealedValue", "secret"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sealed_game',
        function: 'respond_guard',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RespondBaronArguments {
    room: RawTransactionArgument<string>;
    leaderboard: RawTransactionArgument<string>;
    cardIndex: RawTransactionArgument<number | bigint>;
    revealedValue: RawTransactionArgument<number>;
    secret: RawTransactionArgument<number[]>;
}
export interface RespondBaronOptions {
    package: string;
    arguments: RespondBaronArguments | [
        room: RawTransactionArgument<string>,
        leaderboard: RawTransactionArgument<string>,
        cardIndex: RawTransactionArgument<number | bigint>,
        revealedValue: RawTransactionArgument<number>,
        secret: RawTransactionArgument<number[]>
    ];
}
/** Respond to Baron comparison */
export function respondBaron(options: RespondBaronOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::sealed_game::SealedGameRoom`,
        `${packageAddress}::leaderboard::Leaderboard`,
        'u64',
        'u8',
        'vector<u8>'
    ] satisfies string[];
    const parameterNames = ["room", "leaderboard", "cardIndex", "revealedValue", "secret"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sealed_game',
        function: 'respond_baron',
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
        `${packageAddress}::sealed_game::SealedGameRoom`,
        `${packageAddress}::leaderboard::Leaderboard`,
        'u64',
        'vector<u64>'
    ] satisfies string[];
    const parameterNames = ["room", "leaderboard", "keepCardIndex", "returnIndices"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sealed_game',
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
        `${packageAddress}::sealed_game::SealedGameRoom`
    ] satisfies string[];
    const parameterNames = ["sealId", "room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sealed_game',
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
        `${packageAddress}::sealed_game::SealedGameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sealed_game',
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
        `${packageAddress}::sealed_game::SealedGameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sealed_game',
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
        `${packageAddress}::sealed_game::SealedGameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sealed_game',
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
        `${packageAddress}::sealed_game::SealedGameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sealed_game',
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
        `${packageAddress}::sealed_game::SealedGameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sealed_game',
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
        `${packageAddress}::sealed_game::SealedGameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sealed_game',
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
        `${packageAddress}::sealed_game::SealedGameRoom`,
        'address'
    ] satisfies string[];
    const parameterNames = ["room", "playerAddr"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sealed_game',
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
        `${packageAddress}::sealed_game::SealedGameRoom`,
        'address'
    ] satisfies string[];
    const parameterNames = ["room", "playerAddr"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sealed_game',
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
        `${packageAddress}::sealed_game::SealedGameRoom`,
        'address'
    ] satisfies string[];
    const parameterNames = ["room", "playerAddr"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sealed_game',
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
        `${packageAddress}::sealed_game::SealedGameRoom`,
        'address'
    ] satisfies string[];
    const parameterNames = ["room", "playerAddr"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sealed_game',
        function: 'player_is_alive',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface GetCommitmentArguments {
    room: RawTransactionArgument<string>;
    cardIndex: RawTransactionArgument<number | bigint>;
}
export interface GetCommitmentOptions {
    package: string;
    arguments: GetCommitmentArguments | [
        room: RawTransactionArgument<string>,
        cardIndex: RawTransactionArgument<number | bigint>
    ];
}
export function getCommitment(options: GetCommitmentOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::sealed_game::SealedGameRoom`,
        'u64'
    ] satisfies string[];
    const parameterNames = ["room", "cardIndex"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sealed_game',
        function: 'get_commitment',
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
        `${packageAddress}::sealed_game::SealedGameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sealed_game',
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
        `${packageAddress}::sealed_game::SealedGameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sealed_game',
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
        `${packageAddress}::sealed_game::SealedGameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sealed_game',
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
        `${packageAddress}::sealed_game::SealedGameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sealed_game',
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
        `${packageAddress}::sealed_game::SealedGameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sealed_game',
        function: 'all_players',
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
        `${packageAddress}::sealed_game::RoomRegistry`
    ] satisfies string[];
    const parameterNames = ["registry"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sealed_game',
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
        `${packageAddress}::sealed_game::RoomRegistry`,
        `${packageAddress}::sealed_game::SealedGameRoom`
    ] satisfies string[];
    const parameterNames = ["registry", "room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'sealed_game',
        function: 'cleanup_finished_room',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}