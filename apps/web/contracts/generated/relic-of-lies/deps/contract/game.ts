/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/**
 * Game module for Relic Of Lies  Contains core game logic, room
 * management, and card effects Supports 10 card types, token system, and Spy bonus
 * mechanic
 */

import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../../../utils/index';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import * as object from '../sui/object';
import * as balance from '../sui/balance';
const $moduleName = 'contract::game';
export const Player = new MoveStruct({ name: `${$moduleName}::Player`, fields: {
        addr: bcs.Address,
        hand: bcs.vector(bcs.u8()),
        discarded: bcs.vector(bcs.u8()),
        is_alive: bcs.bool(),
        is_immune: bcs.bool(),
        tokens: bcs.u8(),
        has_played_spy: bcs.bool()
    } });
export const GameRoom = new MoveStruct({ name: `${$moduleName}::GameRoom`, fields: {
        id: object.UID,
        name: bcs.string(),
        creator: bcs.Address,
        pot: balance.Balance,
        players: bcs.vector(Player),
        deck: bcs.vector(bcs.u8()),
        burn_card: bcs.option(bcs.u8()),
        public_cards: bcs.vector(bcs.u8()),
        status: bcs.u8(),
        current_turn: bcs.u64(),
        max_players: bcs.u8(),
        round_number: bcs.u8(),
        tokens_to_win: bcs.u8(),
        chancellor_pending: bcs.bool(),
        chancellor_player_idx: bcs.u64(),
        chancellor_cards: bcs.vector(bcs.u8())
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
/** Join an existing room (free entry - no payment required) */
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
export interface StartRoundArguments {
    room: RawTransactionArgument<string>;
}
export interface StartRoundOptions {
    package: string;
    arguments: StartRoundArguments | [
        room: RawTransactionArgument<string>
    ];
}
/** Start a new round (first round or subsequent rounds) */
export function startRound(options: StartRoundOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`,
        '0x0000000000000000000000000000000000000000000000000000000000000002::random::Random'
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'start_round',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PlayTurnArguments {
    room: RawTransactionArgument<string>;
    leaderboard: RawTransactionArgument<string>;
    card: RawTransactionArgument<number>;
    targetIdx: RawTransactionArgument<number | bigint | null>;
    guess: RawTransactionArgument<number | null>;
}
export interface PlayTurnOptions {
    package: string;
    arguments: PlayTurnArguments | [
        room: RawTransactionArgument<string>,
        leaderboard: RawTransactionArgument<string>,
        card: RawTransactionArgument<number>,
        targetIdx: RawTransactionArgument<number | bigint | null>,
        guess: RawTransactionArgument<number | null>
    ];
}
/** Play a turn - main game action */
export function playTurn(options: PlayTurnOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`,
        `${packageAddress}::leaderboard::Leaderboard`,
        'u8',
        '0x0000000000000000000000000000000000000000000000000000000000000001::option::Option<u64>',
        '0x0000000000000000000000000000000000000000000000000000000000000001::option::Option<u8>',
        '0x0000000000000000000000000000000000000000000000000000000000000002::random::Random'
    ] satisfies string[];
    const parameterNames = ["room", "leaderboard", "card", "targetIdx", "guess"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'play_turn',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ResolveChancellorArguments {
    room: RawTransactionArgument<string>;
    leaderboard: RawTransactionArgument<string>;
    keepCard: RawTransactionArgument<number>;
    returnOrder: RawTransactionArgument<number[]>;
}
export interface ResolveChancellorOptions {
    package: string;
    arguments: ResolveChancellorArguments | [
        room: RawTransactionArgument<string>,
        leaderboard: RawTransactionArgument<string>,
        keepCard: RawTransactionArgument<number>,
        returnOrder: RawTransactionArgument<number[]>
    ];
}
/** Resolve Chancellor action - select card to keep and return others to deck */
export function resolveChancellor(options: ResolveChancellorOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`,
        `${packageAddress}::leaderboard::Leaderboard`,
        'u8',
        'vector<u8>'
    ] satisfies string[];
    const parameterNames = ["room", "leaderboard", "keepCard", "returnOrder"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'resolve_chancellor',
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
export interface RoomCreatorArguments {
    room: RawTransactionArgument<string>;
}
export interface RoomCreatorOptions {
    package: string;
    arguments: RoomCreatorArguments | [
        room: RawTransactionArgument<string>
    ];
}
export function roomCreator(options: RoomCreatorOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'room_creator',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RoomPotValueArguments {
    room: RawTransactionArgument<string>;
}
export interface RoomPotValueOptions {
    package: string;
    arguments: RoomPotValueArguments | [
        room: RawTransactionArgument<string>
    ];
}
export function roomPotValue(options: RoomPotValueOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'room_pot_value',
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
export interface RoomMaxPlayersArguments {
    room: RawTransactionArgument<string>;
}
export interface RoomMaxPlayersOptions {
    package: string;
    arguments: RoomMaxPlayersArguments | [
        room: RawTransactionArgument<string>
    ];
}
export function roomMaxPlayers(options: RoomMaxPlayersOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'room_max_players',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RoomCurrentPlayersArguments {
    room: RawTransactionArgument<string>;
}
export interface RoomCurrentPlayersOptions {
    package: string;
    arguments: RoomCurrentPlayersArguments | [
        room: RawTransactionArgument<string>
    ];
}
export function roomCurrentPlayers(options: RoomCurrentPlayersOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'room_current_players',
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
export interface RoomTokensToWinArguments {
    room: RawTransactionArgument<string>;
}
export interface RoomTokensToWinOptions {
    package: string;
    arguments: RoomTokensToWinArguments | [
        room: RawTransactionArgument<string>
    ];
}
export function roomTokensToWin(options: RoomTokensToWinOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'room_tokens_to_win',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RoomPublicCardsArguments {
    room: RawTransactionArgument<string>;
}
export interface RoomPublicCardsOptions {
    package: string;
    arguments: RoomPublicCardsArguments | [
        room: RawTransactionArgument<string>
    ];
}
export function roomPublicCards(options: RoomPublicCardsOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'room_public_cards',
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
export interface ChancellorCardsArguments {
    room: RawTransactionArgument<string>;
}
export interface ChancellorCardsOptions {
    package: string;
    arguments: ChancellorCardsArguments | [
        room: RawTransactionArgument<string>
    ];
}
export function chancellorCards(options: ChancellorCardsOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'chancellor_cards',
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
export interface PlayerAtArguments {
    room: RawTransactionArgument<string>;
    idx: RawTransactionArgument<number | bigint>;
}
export interface PlayerAtOptions {
    package: string;
    arguments: PlayerAtArguments | [
        room: RawTransactionArgument<string>,
        idx: RawTransactionArgument<number | bigint>
    ];
}
export function playerAt(options: PlayerAtOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`,
        'u64'
    ] satisfies string[];
    const parameterNames = ["room", "idx"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'player_at',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PlayerHandArguments {
    room: RawTransactionArgument<string>;
    playerAddr: RawTransactionArgument<string>;
}
export interface PlayerHandOptions {
    package: string;
    arguments: PlayerHandArguments | [
        room: RawTransactionArgument<string>,
        playerAddr: RawTransactionArgument<string>
    ];
}
export function playerHand(options: PlayerHandOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`,
        'address'
    ] satisfies string[];
    const parameterNames = ["room", "playerAddr"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'player_hand',
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
export interface AlivePlayersCountArguments {
    room: RawTransactionArgument<string>;
}
export interface AlivePlayersCountOptions {
    package: string;
    arguments: AlivePlayersCountArguments | [
        room: RawTransactionArgument<string>
    ];
}
export function alivePlayersCount(options: AlivePlayersCountOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'alive_players_count',
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