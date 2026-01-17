/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/**
 * App module for Love Letter 2019 Premium Edition (ZK Version) Main entry point
 * providing clean interface for frontend
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
        `${packageAddress}::game::ZKGameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'join_room',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface StartRoundArguments {
    room: RawTransactionArgument<string>;
    deckCommitment: RawTransactionArgument<number[]>;
    playerCommitments: RawTransactionArgument<number[][]>;
    publicCards: RawTransactionArgument<number[]>;
}
export interface StartRoundOptions {
    package: string;
    arguments: StartRoundArguments | [
        room: RawTransactionArgument<string>,
        deckCommitment: RawTransactionArgument<number[]>,
        playerCommitments: RawTransactionArgument<number[][]>,
        publicCards: RawTransactionArgument<number[]>
    ];
}
/** Start a new round with deck commitment */
export function startRound(options: StartRoundOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::ZKGameRoom`,
        'vector<u8>',
        'vector<vector<u8>>',
        'vector<u8>'
    ] satisfies string[];
    const parameterNames = ["room", "deckCommitment", "playerCommitments", "publicCards"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'start_round',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface UpdateCommitmentArguments {
    room: RawTransactionArgument<string>;
    newCommitment: RawTransactionArgument<number[]>;
}
export interface UpdateCommitmentOptions {
    package: string;
    arguments: UpdateCommitmentArguments | [
        room: RawTransactionArgument<string>,
        newCommitment: RawTransactionArgument<number[]>
    ];
}
/** Update player's card commitment */
export function updateCommitment(options: UpdateCommitmentOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::ZKGameRoom`,
        'vector<u8>'
    ] satisfies string[];
    const parameterNames = ["room", "newCommitment"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'update_commitment',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PlayTurnArguments {
    room: RawTransactionArgument<string>;
    card: RawTransactionArgument<number>;
    newCommitment: RawTransactionArgument<number[]>;
    targetIdx: RawTransactionArgument<number | bigint | null>;
    guess: RawTransactionArgument<number | null>;
}
export interface PlayTurnOptions {
    package: string;
    arguments: PlayTurnArguments | [
        room: RawTransactionArgument<string>,
        card: RawTransactionArgument<number>,
        newCommitment: RawTransactionArgument<number[]>,
        targetIdx: RawTransactionArgument<number | bigint | null>,
        guess: RawTransactionArgument<number | null>
    ];
}
/** Play a turn */
export function playTurn(options: PlayTurnOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::ZKGameRoom`,
        'u8',
        'vector<u8>',
        '0x0000000000000000000000000000000000000000000000000000000000000001::option::Option<u64>',
        '0x0000000000000000000000000000000000000000000000000000000000000001::option::Option<u8>',
        '0x0000000000000000000000000000000000000000000000000000000000000002::clock::Clock'
    ] satisfies string[];
    const parameterNames = ["room", "card", "newCommitment", "targetIdx", "guess"];
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
    vk: RawTransactionArgument<string>;
    proof: RawTransactionArgument<number[]>;
    isCorrect: RawTransactionArgument<boolean>;
}
export interface RespondGuardOptions {
    package: string;
    arguments: RespondGuardArguments | [
        room: RawTransactionArgument<string>,
        leaderboard: RawTransactionArgument<string>,
        vk: RawTransactionArgument<string>,
        proof: RawTransactionArgument<number[]>,
        isCorrect: RawTransactionArgument<boolean>
    ];
}
/** Respond to Guard with ZK proof */
export function respondGuard(options: RespondGuardOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::ZKGameRoom`,
        `${packageAddress}::leaderboard::Leaderboard`,
        `${packageAddress}::game::ZKVerificationKeys`,
        'vector<u8>',
        'bool'
    ] satisfies string[];
    const parameterNames = ["room", "leaderboard", "vk", "proof", "isCorrect"];
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
    vk: RawTransactionArgument<string>;
    proof: RawTransactionArgument<number[]>;
    result: RawTransactionArgument<number>;
}
export interface RespondBaronOptions {
    package: string;
    arguments: RespondBaronArguments | [
        room: RawTransactionArgument<string>,
        leaderboard: RawTransactionArgument<string>,
        vk: RawTransactionArgument<string>,
        proof: RawTransactionArgument<number[]>,
        result: RawTransactionArgument<number>
    ];
}
/** Respond to Baron with ZK proof */
export function respondBaron(options: RespondBaronOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::ZKGameRoom`,
        `${packageAddress}::leaderboard::Leaderboard`,
        `${packageAddress}::game::ZKVerificationKeys`,
        'vector<u8>',
        'u8'
    ] satisfies string[];
    const parameterNames = ["room", "leaderboard", "vk", "proof", "result"];
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
    discardedCard: RawTransactionArgument<number>;
    newCommitment: RawTransactionArgument<number[]>;
}
export interface RespondPrinceOptions {
    package: string;
    arguments: RespondPrinceArguments | [
        room: RawTransactionArgument<string>,
        leaderboard: RawTransactionArgument<string>,
        discardedCard: RawTransactionArgument<number>,
        newCommitment: RawTransactionArgument<number[]>
    ];
}
/** Respond to Prince effect */
export function respondPrince(options: RespondPrinceOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::ZKGameRoom`,
        `${packageAddress}::leaderboard::Leaderboard`,
        'u8',
        'vector<u8>'
    ] satisfies string[];
    const parameterNames = ["room", "leaderboard", "discardedCard", "newCommitment"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'respond_prince',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RespondKingArguments {
    room: RawTransactionArgument<string>;
    leaderboard: RawTransactionArgument<string>;
    initiatorNewCommitment: RawTransactionArgument<number[]>;
    targetNewCommitment: RawTransactionArgument<number[]>;
}
export interface RespondKingOptions {
    package: string;
    arguments: RespondKingArguments | [
        room: RawTransactionArgument<string>,
        leaderboard: RawTransactionArgument<string>,
        initiatorNewCommitment: RawTransactionArgument<number[]>,
        targetNewCommitment: RawTransactionArgument<number[]>
    ];
}
/** Respond to King swap */
export function respondKing(options: RespondKingOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::ZKGameRoom`,
        `${packageAddress}::leaderboard::Leaderboard`,
        'vector<u8>',
        'vector<u8>'
    ] satisfies string[];
    const parameterNames = ["room", "leaderboard", "initiatorNewCommitment", "targetNewCommitment"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'respond_king',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ResolveChancellorArguments {
    room: RawTransactionArgument<string>;
    leaderboard: RawTransactionArgument<string>;
    newCommitment: RawTransactionArgument<number[]>;
    cardsReturned: RawTransactionArgument<number>;
}
export interface ResolveChancellorOptions {
    package: string;
    arguments: ResolveChancellorArguments | [
        room: RawTransactionArgument<string>,
        leaderboard: RawTransactionArgument<string>,
        newCommitment: RawTransactionArgument<number[]>,
        cardsReturned: RawTransactionArgument<number>
    ];
}
/** Resolve Chancellor action */
export function resolveChancellor(options: ResolveChancellorOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::ZKGameRoom`,
        `${packageAddress}::leaderboard::Leaderboard`,
        'vector<u8>',
        'u8'
    ] satisfies string[];
    const parameterNames = ["room", "leaderboard", "newCommitment", "cardsReturned"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'resolve_chancellor',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface HandleTimeoutArguments {
    room: RawTransactionArgument<string>;
    leaderboard: RawTransactionArgument<string>;
}
export interface HandleTimeoutOptions {
    package: string;
    arguments: HandleTimeoutArguments | [
        room: RawTransactionArgument<string>,
        leaderboard: RawTransactionArgument<string>
    ];
}
/** Handle timeout for pending action */
export function handleTimeout(options: HandleTimeoutOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::ZKGameRoom`,
        `${packageAddress}::leaderboard::Leaderboard`,
        '0x0000000000000000000000000000000000000000000000000000000000000002::clock::Clock'
    ] satisfies string[];
    const parameterNames = ["room", "leaderboard"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'handle_timeout',
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
        `${packageAddress}::game::ZKGameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'room_info',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CurrentPlayerArguments {
    room: RawTransactionArgument<string>;
}
export interface CurrentPlayerOptions {
    package: string;
    arguments: CurrentPlayerArguments | [
        room: RawTransactionArgument<string>
    ];
}
/** Get current player address */
export function currentPlayer(options: CurrentPlayerOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::ZKGameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'current_player',
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
/** Get all players */
export function players(options: PlayersOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::ZKGameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'players',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PlayerCommitmentArguments {
    room: RawTransactionArgument<string>;
    idx: RawTransactionArgument<number | bigint>;
}
export interface PlayerCommitmentOptions {
    package: string;
    arguments: PlayerCommitmentArguments | [
        room: RawTransactionArgument<string>,
        idx: RawTransactionArgument<number | bigint>
    ];
}
/** Get player's commitment */
export function playerCommitment(options: PlayerCommitmentOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::ZKGameRoom`,
        'u64'
    ] satisfies string[];
    const parameterNames = ["room", "idx"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'player_commitment',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PlayerDiscardedArguments {
    room: RawTransactionArgument<string>;
    idx: RawTransactionArgument<number | bigint>;
}
export interface PlayerDiscardedOptions {
    package: string;
    arguments: PlayerDiscardedArguments | [
        room: RawTransactionArgument<string>,
        idx: RawTransactionArgument<number | bigint>
    ];
}
/** Get player's discarded cards */
export function playerDiscarded(options: PlayerDiscardedOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::ZKGameRoom`,
        'u64'
    ] satisfies string[];
    const parameterNames = ["room", "idx"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'player_discarded',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PlayerIsAliveArguments {
    room: RawTransactionArgument<string>;
    idx: RawTransactionArgument<number | bigint>;
}
export interface PlayerIsAliveOptions {
    package: string;
    arguments: PlayerIsAliveArguments | [
        room: RawTransactionArgument<string>,
        idx: RawTransactionArgument<number | bigint>
    ];
}
/** Get player's alive status */
export function playerIsAlive(options: PlayerIsAliveOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::ZKGameRoom`,
        'u64'
    ] satisfies string[];
    const parameterNames = ["room", "idx"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'player_is_alive',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PlayerTokensArguments {
    room: RawTransactionArgument<string>;
    idx: RawTransactionArgument<number | bigint>;
}
export interface PlayerTokensOptions {
    package: string;
    arguments: PlayerTokensArguments | [
        room: RawTransactionArgument<string>,
        idx: RawTransactionArgument<number | bigint>
    ];
}
/** Get player's token count */
export function playerTokens(options: PlayerTokensOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::ZKGameRoom`,
        'u64'
    ] satisfies string[];
    const parameterNames = ["room", "idx"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'player_tokens',
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
/** Get all active room IDs */
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
export interface MaxPlayersOptions {
    package: string;
    arguments?: [
    ];
}
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
export function tokensToWin(options: TokensToWinOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'tokens_to_win',
    });
}
export interface ProofTimeoutMsOptions {
    package: string;
    arguments?: [
    ];
}
export function proofTimeoutMs(options: ProofTimeoutMsOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'proof_timeout_ms',
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
export interface StatusPendingProofOptions {
    package: string;
    arguments?: [
    ];
}
export function statusPendingProof(options: StatusPendingProofOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'app',
        function: 'status_pending_proof',
    });
}
export interface CardSpyOptions {
    package: string;
    arguments?: [
    ];
}
/** Get card value constants */
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