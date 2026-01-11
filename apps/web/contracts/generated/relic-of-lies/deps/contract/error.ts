/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/**
 * Error codes module for Love Letter 2019 Premium Edition Contains all error
 * constants for assert! statements
 */

import { type Transaction } from '@mysten/sui/transactions';
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