/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/**
 * Error codes module for Love Letter 2019 Premium Edition Contains all error
 * constants for assert! statements Following Rule 3: Provides boolean check
 * functions for better error handling
 */

import { type Transaction } from '@mysten/sui/transactions';
import { normalizeMoveArguments, type RawTransactionArgument } from '../../../utils/index';
export interface RoomFullOptions {
    package: string;
    arguments?: [
    ];
}
export function roomFull(options: RoomFullOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'room_full',
    });
}
export interface InsufficientPaymentOptions {
    package: string;
    arguments?: [
    ];
}
export function insufficientPayment(options: InsufficientPaymentOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'insufficient_payment',
    });
}
export interface RoomNotFoundOptions {
    package: string;
    arguments?: [
    ];
}
export function roomNotFound(options: RoomNotFoundOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'room_not_found',
    });
}
export interface EmptyRoomNameOptions {
    package: string;
    arguments?: [
    ];
}
export function emptyRoomName(options: EmptyRoomNameOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'empty_room_name',
    });
}
export interface InvalidMaxPlayersOptions {
    package: string;
    arguments?: [
    ];
}
export function invalidMaxPlayers(options: InvalidMaxPlayersOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'invalid_max_players',
    });
}
export interface AlreadyInRoomOptions {
    package: string;
    arguments?: [
    ];
}
export function alreadyInRoom(options: AlreadyInRoomOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'already_in_room',
    });
}
export interface GameNotStartedOptions {
    package: string;
    arguments?: [
    ];
}
export function gameNotStarted(options: GameNotStartedOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'game_not_started',
    });
}
export interface GameAlreadyStartedOptions {
    package: string;
    arguments?: [
    ];
}
export function gameAlreadyStarted(options: GameAlreadyStartedOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'game_already_started',
    });
}
export interface GameFinishedOptions {
    package: string;
    arguments?: [
    ];
}
export function gameFinished(options: GameFinishedOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'game_finished',
    });
}
export interface GameNotFinishedOptions {
    package: string;
    arguments?: [
    ];
}
export function gameNotFinished(options: GameNotFinishedOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'game_not_finished',
    });
}
export interface NotEnoughPlayersOptions {
    package: string;
    arguments?: [
    ];
}
export function notEnoughPlayers(options: NotEnoughPlayersOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'not_enough_players',
    });
}
export interface RoundNotFinishedOptions {
    package: string;
    arguments?: [
    ];
}
export function roundNotFinished(options: RoundNotFinishedOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'round_not_finished',
    });
}
export interface RoundInProgressOptions {
    package: string;
    arguments?: [
    ];
}
export function roundInProgress(options: RoundInProgressOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'round_in_progress',
    });
}
export interface NotYourTurnOptions {
    package: string;
    arguments?: [
    ];
}
export function notYourTurn(options: NotYourTurnOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'not_your_turn',
    });
}
export interface CardNotInHandOptions {
    package: string;
    arguments?: [
    ];
}
export function cardNotInHand(options: CardNotInHandOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'card_not_in_hand',
    });
}
export interface InvalidTargetOptions {
    package: string;
    arguments?: [
    ];
}
export function invalidTarget(options: InvalidTargetOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'invalid_target',
    });
}
export interface TargetImmuneOptions {
    package: string;
    arguments?: [
    ];
}
export function targetImmune(options: TargetImmuneOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'target_immune',
    });
}
export interface CannotTargetSelfOptions {
    package: string;
    arguments?: [
    ];
}
export function cannotTargetSelf(options: CannotTargetSelfOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'cannot_target_self',
    });
}
export interface MustTargetSelfOptions {
    package: string;
    arguments?: [
    ];
}
export function mustTargetSelf(options: MustTargetSelfOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'must_target_self',
    });
}
export interface TargetEliminatedOptions {
    package: string;
    arguments?: [
    ];
}
export function targetEliminated(options: TargetEliminatedOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'target_eliminated',
    });
}
export interface MustDiscardCountessOptions {
    package: string;
    arguments?: [
    ];
}
export function mustDiscardCountess(options: MustDiscardCountessOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'must_discard_countess',
    });
}
export interface InvalidGuessOptions {
    package: string;
    arguments?: [
    ];
}
export function invalidGuess(options: InvalidGuessOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'invalid_guess',
    });
}
export interface GuessRequiredOptions {
    package: string;
    arguments?: [
    ];
}
export function guessRequired(options: GuessRequiredOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'guess_required',
    });
}
export interface TargetRequiredOptions {
    package: string;
    arguments?: [
    ];
}
export function targetRequired(options: TargetRequiredOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'target_required',
    });
}
export interface CannotGuessGuardOptions {
    package: string;
    arguments?: [
    ];
}
export function cannotGuessGuard(options: CannotGuessGuardOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'cannot_guess_guard',
    });
}
export interface ChancellorMustKeepOneOptions {
    package: string;
    arguments?: [
    ];
}
export function chancellorMustKeepOne(options: ChancellorMustKeepOneOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'chancellor_must_keep_one',
    });
}
export interface ChancellorInvalidSelectionOptions {
    package: string;
    arguments?: [
    ];
}
export function chancellorInvalidSelection(options: ChancellorInvalidSelectionOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'chancellor_invalid_selection',
    });
}
export interface ChancellorNotPendingOptions {
    package: string;
    arguments?: [
    ];
}
export function chancellorNotPending(options: ChancellorNotPendingOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'chancellor_not_pending',
    });
}
export interface ChancellorPendingOptions {
    package: string;
    arguments?: [
    ];
}
export function chancellorPending(options: ChancellorPendingOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'chancellor_pending',
    });
}
export interface NotRoomCreatorOptions {
    package: string;
    arguments?: [
    ];
}
export function notRoomCreator(options: NotRoomCreatorOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'not_room_creator',
    });
}
export interface NotAPlayerOptions {
    package: string;
    arguments?: [
    ];
}
export function notAPlayer(options: NotAPlayerOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'not_a_player',
    });
}
export interface PlayerEliminatedOptions {
    package: string;
    arguments?: [
    ];
}
export function playerEliminated(options: PlayerEliminatedOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'player_eliminated',
    });
}
export interface DeckEmptyOptions {
    package: string;
    arguments?: [
    ];
}
export function deckEmpty(options: DeckEmptyOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'deck_empty',
    });
}
export interface IsValidRoomNameArguments {
    name: RawTransactionArgument<string>;
}
export interface IsValidRoomNameOptions {
    package: string;
    arguments: IsValidRoomNameArguments | [
        name: RawTransactionArgument<string>
    ];
}
/** Check if room name is valid (not empty) */
export function isValidRoomName(options: IsValidRoomNameOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String'
    ] satisfies string[];
    const parameterNames = ["name"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'is_valid_room_name',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface IsValidMaxPlayersArguments {
    maxPlayers: RawTransactionArgument<number>;
}
export interface IsValidMaxPlayersOptions {
    package: string;
    arguments: IsValidMaxPlayersArguments | [
        maxPlayers: RawTransactionArgument<number>
    ];
}
/** Check if max_players is within valid range (2-6) */
export function isValidMaxPlayers(options: IsValidMaxPlayersOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        'u8'
    ] satisfies string[];
    const parameterNames = ["maxPlayers"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'is_valid_max_players',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface IsSufficientPaymentArguments {
    amount: RawTransactionArgument<number | bigint>;
}
export interface IsSufficientPaymentOptions {
    package: string;
    arguments: IsSufficientPaymentArguments | [
        amount: RawTransactionArgument<number | bigint>
    ];
}
/** Check if payment is sufficient for entry fee */
export function isSufficientPayment(options: IsSufficientPaymentOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        'u64'
    ] satisfies string[];
    const parameterNames = ["amount"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'is_sufficient_payment',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface HasRoomSpaceArguments {
    currentPlayers: RawTransactionArgument<number | bigint>;
    maxPlayers: RawTransactionArgument<number>;
}
export interface HasRoomSpaceOptions {
    package: string;
    arguments: HasRoomSpaceArguments | [
        currentPlayers: RawTransactionArgument<number | bigint>,
        maxPlayers: RawTransactionArgument<number>
    ];
}
/** Check if room has space for more players */
export function hasRoomSpace(options: HasRoomSpaceOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        'u64',
        'u8'
    ] satisfies string[];
    const parameterNames = ["currentPlayers", "maxPlayers"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'has_room_space',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CanJoinRoomArguments {
    status: RawTransactionArgument<number>;
}
export interface CanJoinRoomOptions {
    package: string;
    arguments: CanJoinRoomArguments | [
        status: RawTransactionArgument<number>
    ];
}
/** Check if game status allows joining (waiting) */
export function canJoinRoom(options: CanJoinRoomOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        'u8'
    ] satisfies string[];
    const parameterNames = ["status"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'can_join_room',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CanStartRoundArguments {
    status: RawTransactionArgument<number>;
}
export interface CanStartRoundOptions {
    package: string;
    arguments: CanStartRoundArguments | [
        status: RawTransactionArgument<number>
    ];
}
/** Check if game status allows starting a round */
export function canStartRound(options: CanStartRoundOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        'u8'
    ] satisfies string[];
    const parameterNames = ["status"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'can_start_round',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface IsGamePlayingArguments {
    status: RawTransactionArgument<number>;
}
export interface IsGamePlayingOptions {
    package: string;
    arguments: IsGamePlayingArguments | [
        status: RawTransactionArgument<number>
    ];
}
/** Check if game is currently playing */
export function isGamePlaying(options: IsGamePlayingOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        'u8'
    ] satisfies string[];
    const parameterNames = ["status"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'is_game_playing',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface IsGameFinishedArguments {
    status: RawTransactionArgument<number>;
}
export interface IsGameFinishedOptions {
    package: string;
    arguments: IsGameFinishedArguments | [
        status: RawTransactionArgument<number>
    ];
}
/** Check if game has finished */
export function isGameFinished(options: IsGameFinishedOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        'u8'
    ] satisfies string[];
    const parameterNames = ["status"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'is_game_finished',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface HasEnoughPlayersArguments {
    playerCount: RawTransactionArgument<number | bigint>;
}
export interface HasEnoughPlayersOptions {
    package: string;
    arguments: HasEnoughPlayersArguments | [
        playerCount: RawTransactionArgument<number | bigint>
    ];
}
/** Check if there are enough players to start */
export function hasEnoughPlayers(options: HasEnoughPlayersOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        'u64'
    ] satisfies string[];
    const parameterNames = ["playerCount"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'has_enough_players',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface IsValidGuessArguments {
    guess: RawTransactionArgument<number>;
}
export interface IsValidGuessOptions {
    package: string;
    arguments: IsValidGuessArguments | [
        guess: RawTransactionArgument<number>
    ];
}
/** Check if a card guess is valid (not Guard, within valid range) */
export function isValidGuess(options: IsValidGuessOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        'u8'
    ] satisfies string[];
    const parameterNames = ["guess"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'is_valid_guess',
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
        module: 'error',
        function: 'is_valid_card',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface IsValidTargetIndexArguments {
    targetIdx: RawTransactionArgument<number | bigint>;
    playerCount: RawTransactionArgument<number | bigint>;
}
export interface IsValidTargetIndexOptions {
    package: string;
    arguments: IsValidTargetIndexArguments | [
        targetIdx: RawTransactionArgument<number | bigint>,
        playerCount: RawTransactionArgument<number | bigint>
    ];
}
/** Check if target index is valid */
export function isValidTargetIndex(options: IsValidTargetIndexOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        'u64',
        'u64'
    ] satisfies string[];
    const parameterNames = ["targetIdx", "playerCount"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'is_valid_target_index',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}