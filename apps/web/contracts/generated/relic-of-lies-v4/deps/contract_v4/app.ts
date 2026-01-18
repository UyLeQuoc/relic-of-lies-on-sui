/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/**
 * App module for Relic Of Lies  with Seal Encryption Main entry
 * point providing clean interface for frontend
 */

import { type Transaction } from '@mysten/sui/transactions';
import { normalizeMoveArguments, type RawTransactionArgument } from '../../../utils/index';
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
        module: 'app',
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
        module: 'app',
        function: 'join_room',
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
/** Submit encrypted deck (after local shuffle and encryption) */
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
        module: 'app',
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
/** Play a turn with card reveal */
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
        module: 'app',
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
        module: 'app',
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
        module: 'app',
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
        module: 'app',
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
        module: 'app',
        function: 'resolve_chancellor',
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
/** Start a new game (reset everything after game finished) */
export function startNewGame(options: StartNewGameOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'start_new_game',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RoomInfoArguments {
    room: RawTransactionArgument<string>;
}
export interface RoomInfoOptions {
    package: string;
    arguments: RoomInfoArguments | [
        room: RawTransactionArgument<string>
    ];
}
/** Get room basic info */
export function roomInfo(options: RoomInfoOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'room_info',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface GameStateArguments {
    room: RawTransactionArgument<string>;
}
export interface GameStateOptions {
    package: string;
    arguments: GameStateArguments | [
        room: RawTransactionArgument<string>
    ];
}
/** Get game state info */
export function gameState(options: GameStateOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'game_state',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PlayersArguments {
    room: RawTransactionArgument<string>;
}
export interface PlayersOptions {
    package: string;
    arguments: PlayersArguments | [
        room: RawTransactionArgument<string>
    ];
}
/** Get all players in room */
export function players(options: PlayersOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'players',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface MyHandIndicesArguments {
    room: RawTransactionArgument<string>;
}
export interface MyHandIndicesOptions {
    package: string;
    arguments: MyHandIndicesArguments | [
        room: RawTransactionArgument<string>
    ];
}
/** Get player's hand indices */
export function myHandIndices(options: MyHandIndicesOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'my_hand_indices',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface DiscardedArguments {
    room: RawTransactionArgument<string>;
    player: RawTransactionArgument<string>;
}
export interface DiscardedOptions {
    package: string;
    arguments: DiscardedArguments | [
        room: RawTransactionArgument<string>,
        player: RawTransactionArgument<string>
    ];
}
/** Get player's discarded cards (public info) */
export function discarded(options: DiscardedOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`,
        'address'
    ] satisfies string[];
    const parameterNames = ["room", "player"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'discarded',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PlayerTokensArguments {
    room: RawTransactionArgument<string>;
    player: RawTransactionArgument<string>;
}
export interface PlayerTokensOptions {
    package: string;
    arguments: PlayerTokensArguments | [
        room: RawTransactionArgument<string>,
        player: RawTransactionArgument<string>
    ];
}
/** Get player's token count */
export function playerTokens(options: PlayerTokensOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`,
        'address'
    ] satisfies string[];
    const parameterNames = ["room", "player"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'player_tokens',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SealNamespaceArguments {
    room: RawTransactionArgument<string>;
}
export interface SealNamespaceOptions {
    package: string;
    arguments: SealNamespaceArguments | [
        room: RawTransactionArgument<string>
    ];
}
/** Get Seal namespace for the room */
export function sealNamespace(options: SealNamespaceOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::GameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'seal_namespace',
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
/** Get all active room IDs from registry */
export function activeRooms(options: ActiveRoomsOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::RoomRegistry`
    ] satisfies string[];
    const parameterNames = ["registry"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'active_rooms',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CleanupRoomArguments {
    registry: RawTransactionArgument<string>;
    room: RawTransactionArgument<string>;
}
export interface CleanupRoomOptions {
    package: string;
    arguments: CleanupRoomArguments | [
        registry: RawTransactionArgument<string>,
        room: RawTransactionArgument<string>
    ];
}
/** Clean up a finished room from registry */
export function cleanupRoom(options: CleanupRoomOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::RoomRegistry`,
        `${packageAddress}::game::GameRoom`
    ] satisfies string[];
    const parameterNames = ["registry", "room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'cleanup_room',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface TopPlayersArguments {
    leaderboard: RawTransactionArgument<string>;
    count: RawTransactionArgument<number | bigint>;
}
export interface TopPlayersOptions {
    package: string;
    arguments: TopPlayersArguments | [
        leaderboard: RawTransactionArgument<string>,
        count: RawTransactionArgument<number | bigint>
    ];
}
/** Get top N players */
export function topPlayers(options: TopPlayersOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::leaderboard::Leaderboard`,
        'u64'
    ] satisfies string[];
    const parameterNames = ["leaderboard", "count"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'top_players',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PlayerStatsArguments {
    leaderboard: RawTransactionArgument<string>;
    player: RawTransactionArgument<string>;
}
export interface PlayerStatsOptions {
    package: string;
    arguments: PlayerStatsArguments | [
        leaderboard: RawTransactionArgument<string>,
        player: RawTransactionArgument<string>
    ];
}
/** Get a specific player's record */
export function playerStats(options: PlayerStatsOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::leaderboard::Leaderboard`,
        'address'
    ] satisfies string[];
    const parameterNames = ["leaderboard", "player"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'player_stats',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface MyStatsArguments {
    leaderboard: RawTransactionArgument<string>;
}
export interface MyStatsOptions {
    package: string;
    arguments: MyStatsArguments | [
        leaderboard: RawTransactionArgument<string>
    ];
}
/** Get my stats */
export function myStats(options: MyStatsOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::leaderboard::Leaderboard`
    ] satisfies string[];
    const parameterNames = ["leaderboard"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'my_stats',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface TotalPlayersArguments {
    leaderboard: RawTransactionArgument<string>;
}
export interface TotalPlayersOptions {
    package: string;
    arguments: TotalPlayersArguments | [
        leaderboard: RawTransactionArgument<string>
    ];
}
/** Get total players in leaderboard */
export function totalPlayers(options: TotalPlayersOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::leaderboard::Leaderboard`
    ] satisfies string[];
    const parameterNames = ["leaderboard"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'total_players',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface EntryFeeOptions {
    package: string;
    arguments?: [
    ];
}
/** Get entry fee in MIST */
export function entryFee(options: EntryFeeOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'entry_fee',
    });
}
export interface MaxPlayersOptions {
    package: string;
    arguments?: [
    ];
}
/** Get max players allowed */
export function maxPlayers(options: MaxPlayersOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'max_players',
    });
}
export interface MinPlayersOptions {
    package: string;
    arguments?: [
    ];
}
/** Get min players required */
export function minPlayers(options: MinPlayersOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'min_players',
    });
}
export interface TokensToWinOptions {
    package: string;
    arguments?: [
    ];
}
/** Get tokens needed to win */
export function tokensToWin(options: TokensToWinOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'tokens_to_win',
    });
}
export interface StatusWaitingOptions {
    package: string;
    arguments?: [
    ];
}
/** Get game status constants */
export function statusWaiting(options: StatusWaitingOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'status_waiting',
    });
}
export interface StatusPlayingOptions {
    package: string;
    arguments?: [
    ];
}
export function statusPlaying(options: StatusPlayingOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'status_playing',
    });
}
export interface StatusRoundEndOptions {
    package: string;
    arguments?: [
    ];
}
export function statusRoundEnd(options: StatusRoundEndOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'status_round_end',
    });
}
export interface StatusFinishedOptions {
    package: string;
    arguments?: [
    ];
}
export function statusFinished(options: StatusFinishedOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'status_finished',
    });
}
export interface CardSpyOptions {
    package: string;
    arguments?: [
    ];
}
export function cardSpy(options: CardSpyOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'card_spy',
    });
}
export interface CardGuardOptions {
    package: string;
    arguments?: [
    ];
}
export function cardGuard(options: CardGuardOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'card_guard',
    });
}
export interface CardPriestOptions {
    package: string;
    arguments?: [
    ];
}
export function cardPriest(options: CardPriestOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'card_priest',
    });
}
export interface CardBaronOptions {
    package: string;
    arguments?: [
    ];
}
export function cardBaron(options: CardBaronOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'card_baron',
    });
}
export interface CardHandmaidOptions {
    package: string;
    arguments?: [
    ];
}
export function cardHandmaid(options: CardHandmaidOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'card_handmaid',
    });
}
export interface CardPrinceOptions {
    package: string;
    arguments?: [
    ];
}
export function cardPrince(options: CardPrinceOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'card_prince',
    });
}
export interface CardChancellorOptions {
    package: string;
    arguments?: [
    ];
}
export function cardChancellor(options: CardChancellorOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'card_chancellor',
    });
}
export interface CardKingOptions {
    package: string;
    arguments?: [
    ];
}
export function cardKing(options: CardKingOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'card_king',
    });
}
export interface CardCountessOptions {
    package: string;
    arguments?: [
    ];
}
export function cardCountess(options: CardCountessOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'card_countess',
    });
}
export interface CardPrincessOptions {
    package: string;
    arguments?: [
    ];
}
export function cardPrincess(options: CardPrincessOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'card_princess',
    });
}