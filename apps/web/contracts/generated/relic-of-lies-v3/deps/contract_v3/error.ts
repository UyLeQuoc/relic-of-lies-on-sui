/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/** Error codes for Love Letter with Seal Integration */

import { type Transaction } from '@mysten/sui/transactions';
import { normalizeMoveArguments, type RawTransactionArgument } from '../../../utils/index';
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
export interface PendingActionOptions {
    package: string;
    arguments?: [
    ];
}
export function pendingAction(options: PendingActionOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'pending_action',
    });
}
export interface NoPendingActionOptions {
    package: string;
    arguments?: [
    ];
}
export function noPendingAction(options: NoPendingActionOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'no_pending_action',
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
export interface InvalidCommitmentOptions {
    package: string;
    arguments?: [
    ];
}
export function invalidCommitment(options: InvalidCommitmentOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'invalid_commitment',
    });
}
export interface CommitmentMismatchOptions {
    package: string;
    arguments?: [
    ];
}
export function commitmentMismatch(options: CommitmentMismatchOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'commitment_mismatch',
    });
}
export interface InvalidSecretOptions {
    package: string;
    arguments?: [
    ];
}
export function invalidSecret(options: InvalidSecretOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'invalid_secret',
    });
}
export interface NoAccessOptions {
    package: string;
    arguments?: [
    ];
}
export function noAccess(options: NoAccessOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'no_access',
    });
}
export interface InvalidNamespaceOptions {
    package: string;
    arguments?: [
    ];
}
export function invalidNamespace(options: InvalidNamespaceOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'invalid_namespace',
    });
}
export interface CardNotOwnedOptions {
    package: string;
    arguments?: [
    ];
}
export function cardNotOwned(options: CardNotOwnedOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'card_not_owned',
    });
}
export interface NoTemporaryAccessOptions {
    package: string;
    arguments?: [
    ];
}
export function noTemporaryAccess(options: NoTemporaryAccessOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'no_temporary_access',
    });
}
export interface AccessExpiredOptions {
    package: string;
    arguments?: [
    ];
}
export function accessExpired(options: AccessExpiredOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'access_expired',
    });
}
export interface NotPendingResponderOptions {
    package: string;
    arguments?: [
    ];
}
export function notPendingResponder(options: NotPendingResponderOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'not_pending_responder',
    });
}
export interface InvalidResponseOptions {
    package: string;
    arguments?: [
    ];
}
export function invalidResponse(options: InvalidResponseOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'invalid_response',
    });
}
export interface ResponseTimeoutOptions {
    package: string;
    arguments?: [
    ];
}
export function responseTimeout(options: ResponseTimeoutOptions) {
    const packageAddress = options.package;
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'response_timeout',
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
export interface CanJoinRoomArguments {
    status: RawTransactionArgument<number>;
}
export interface CanJoinRoomOptions {
    package: string;
    arguments: CanJoinRoomArguments | [
        status: RawTransactionArgument<number>
    ];
}
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
export interface CanStartRoundArguments {
    status: RawTransactionArgument<number>;
}
export interface CanStartRoundOptions {
    package: string;
    arguments: CanStartRoundArguments | [
        status: RawTransactionArgument<number>
    ];
}
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
export interface HasEnoughPlayersArguments {
    playerCount: RawTransactionArgument<number | bigint>;
}
export interface HasEnoughPlayersOptions {
    package: string;
    arguments: HasEnoughPlayersArguments | [
        playerCount: RawTransactionArgument<number | bigint>
    ];
}
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
export interface IsGamePlayingArguments {
    status: RawTransactionArgument<number>;
}
export interface IsGamePlayingOptions {
    package: string;
    arguments: IsGamePlayingArguments | [
        status: RawTransactionArgument<number>
    ];
}
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
export interface IsValidGuessArguments {
    guess: RawTransactionArgument<number>;
}
export interface IsValidGuessOptions {
    package: string;
    arguments: IsValidGuessArguments | [
        guess: RawTransactionArgument<number>
    ];
}
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
    target: RawTransactionArgument<number | bigint>;
    playerCount: RawTransactionArgument<number | bigint>;
}
export interface IsValidTargetIndexOptions {
    package: string;
    arguments: IsValidTargetIndexArguments | [
        target: RawTransactionArgument<number | bigint>,
        playerCount: RawTransactionArgument<number | bigint>
    ];
}
export function isValidTargetIndex(options: IsValidTargetIndexOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        'u64',
        'u64'
    ] satisfies string[];
    const parameterNames = ["target", "playerCount"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'is_valid_target_index',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface IsValidSecretLengthArguments {
    secret: RawTransactionArgument<number[]>;
}
export interface IsValidSecretLengthOptions {
    package: string;
    arguments: IsValidSecretLengthArguments | [
        secret: RawTransactionArgument<number[]>
    ];
}
export function isValidSecretLength(options: IsValidSecretLengthOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        'vector<u8>'
    ] satisfies string[];
    const parameterNames = ["secret"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'error',
        function: 'is_valid_secret_length',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}