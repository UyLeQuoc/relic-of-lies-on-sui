/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/**
 * Game module for Love Letter 2019 Premium Edition (ZK Version) Contains core game
 * logic with Zero-Knowledge Proof support Cards are hidden using commitments,
 * verified with ZK proofs
 */

import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../../../utils/index';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import * as object from '../sui/object';
import * as balance from '../sui/balance';
const $moduleName = 'contract::game';
export const Player = new MoveStruct({ name: `${$moduleName}::Player`, fields: {
        addr: bcs.Address,
        /**
         * Commitment to current card(s): hash(card || salt) For single card: 32 bytes For
         * two cards: 64 bytes (two commitments concatenated)
         */
        card_commitment: bcs.vector(bcs.u8()),
        /** Number of cards in hand (1 or 2) */
        hand_count: bcs.u8(),
        /** Discarded cards (public info - revealed when played) */
        discarded: bcs.vector(bcs.u8()),
        is_alive: bcs.bool(),
        is_immune: bcs.bool(),
        tokens: bcs.u8(),
        has_played_spy: bcs.bool()
    } });
export const PendingAction = new MoveStruct({ name: `${$moduleName}::PendingAction`, fields: {
        action_type: bcs.u8(),
        initiator_idx: bcs.u64(),
        target_idx: bcs.u64(),
        /** For Guard: the guessed card */
        guess: bcs.option(bcs.u8()),
        /** Deadline timestamp for proof submission */
        deadline: bcs.u64(),
        /** Additional data for complex actions */
        extra_data: bcs.vector(bcs.u8())
    } });
export const ZKGameRoom = new MoveStruct({ name: `${$moduleName}::ZKGameRoom`, fields: {
        id: object.UID,
        name: bcs.string(),
        creator: bcs.Address,
        pot: balance.Balance,
        players: bcs.vector(Player),
        /** Merkle root commitment of shuffled deck */
        deck_commitment: bcs.vector(bcs.u8()),
        /** Number of cards remaining in deck */
        deck_size: bcs.u64(),
        /** Who dealt/shuffled (for dispute resolution) */
        dealer: bcs.Address,
        /** Public cards for 2-player games */
        public_cards: bcs.vector(bcs.u8()),
        status: bcs.u8(),
        current_turn: bcs.u64(),
        max_players: bcs.u8(),
        round_number: bcs.u8(),
        tokens_to_win: bcs.u8(),
        pending_action: bcs.option(PendingAction),
        chancellor_pending: bcs.bool(),
        chancellor_player_idx: bcs.u64(),
        /** Commitment to chancellor's card choices */
        chancellor_commitment: bcs.vector(bcs.u8())
    } });
export const RoomRegistry = new MoveStruct({ name: `${$moduleName}::RoomRegistry`, fields: {
        id: object.UID,
        active_rooms: bcs.vector(bcs.Address)
    } });
export const ZKVerificationKeys = new MoveStruct({ name: `${$moduleName}::ZKVerificationKeys`, fields: {
        id: object.UID,
        /** Verification key for Guard proofs */
        guard_vk: bcs.vector(bcs.u8()),
        /** Verification key for Baron proofs */
        baron_vk: bcs.vector(bcs.u8()),
        /** Verification key for card ownership proofs */
        card_ownership_vk: bcs.vector(bcs.u8()),
        /** Prepared verification key for Guard (Sui format) */
        guard_pvk: bcs.vector(bcs.u8()),
        /** Prepared verification key for Baron (Sui format) */
        baron_pvk: bcs.vector(bcs.u8())
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
        `${packageAddress}::game::ZKGameRoom`
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
/**
 * Start a new round - dealer commits to shuffled deck and deals cards Called by
 * the dealer (room creator or designated player)
 *
 * Parameters:
 *
 * - deck_commitment: Merkle root of shuffled deck
 * - player_commitments: Each player's initial card commitment
 * - public_cards: For 2-player games, 3 revealed cards
 */
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
        module: 'game',
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
/** Update player's card commitment (after drawing a card) */
export function updateCommitment(options: UpdateCommitmentOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::ZKGameRoom`,
        'vector<u8>'
    ] satisfies string[];
    const parameterNames = ["room", "newCommitment"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
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
/**
 * Play a card - reveals the card being played, updates commitment for remaining
 * card Some cards require target to respond with ZK proof
 */
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
        module: 'game',
        function: 'play_turn',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RespondGuardArguments {
    room: RawTransactionArgument<string>;
    leaderboard: RawTransactionArgument<string>;
    Vk: RawTransactionArgument<string>;
    proof: RawTransactionArgument<number[]>;
    isCorrect: RawTransactionArgument<boolean>;
}
export interface RespondGuardOptions {
    package: string;
    arguments: RespondGuardArguments | [
        room: RawTransactionArgument<string>,
        leaderboard: RawTransactionArgument<string>,
        Vk: RawTransactionArgument<string>,
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
    const parameterNames = ["room", "leaderboard", "Vk", "proof", "isCorrect"];
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
    Vk: RawTransactionArgument<string>;
    proof: RawTransactionArgument<number[]>;
    result: RawTransactionArgument<number>;
}
export interface RespondBaronOptions {
    package: string;
    arguments: RespondBaronArguments | [
        room: RawTransactionArgument<string>,
        leaderboard: RawTransactionArgument<string>,
        Vk: RawTransactionArgument<string>,
        proof: RawTransactionArgument<number[]>,
        result: RawTransactionArgument<number>
    ];
}
/** Respond to Baron with ZK proof of comparison result */
export function respondBaron(options: RespondBaronOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::ZKGameRoom`,
        `${packageAddress}::leaderboard::Leaderboard`,
        `${packageAddress}::game::ZKVerificationKeys`,
        'vector<u8>',
        'u8'
    ] satisfies string[];
    const parameterNames = ["room", "leaderboard", "Vk", "proof", "result"];
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
/** Respond to Prince - reveal discarded card and new commitment */
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
        module: 'game',
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
/** Respond to King - both players submit new commitments */
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
        module: 'game',
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
/** Resolve Chancellor - player submits new commitment after choosing card */
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
        module: 'game',
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
/** Handle timeout when player doesn't respond to pending action */
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
        module: 'game',
        function: 'handle_timeout',
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
        `${packageAddress}::game::ZKGameRoom`
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
        `${packageAddress}::game::ZKGameRoom`
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
        `${packageAddress}::game::ZKGameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'room_creator',
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
        `${packageAddress}::game::ZKGameRoom`
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
        `${packageAddress}::game::ZKGameRoom`
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
        `${packageAddress}::game::ZKGameRoom`
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
        `${packageAddress}::game::ZKGameRoom`
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
        `${packageAddress}::game::ZKGameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'room_round_number',
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
        `${packageAddress}::game::ZKGameRoom`
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
        `${packageAddress}::game::ZKGameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'is_pending_action',
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
export function playerCommitment(options: PlayerCommitmentOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::ZKGameRoom`,
        'u64'
    ] satisfies string[];
    const parameterNames = ["room", "idx"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
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
export function playerDiscarded(options: PlayerDiscardedOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::ZKGameRoom`,
        'u64'
    ] satisfies string[];
    const parameterNames = ["room", "idx"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
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
export function playerIsAlive(options: PlayerIsAliveOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::ZKGameRoom`,
        'u64'
    ] satisfies string[];
    const parameterNames = ["room", "idx"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
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
export function playerTokens(options: PlayerTokensOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::game::ZKGameRoom`,
        'u64'
    ] satisfies string[];
    const parameterNames = ["room", "idx"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'player_tokens',
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
        `${packageAddress}::game::ZKGameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
        function: 'current_player_address',
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
        `${packageAddress}::game::ZKGameRoom`
    ] satisfies string[];
    const parameterNames = ["room"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'game',
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