/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/**
 * Events module for Love Letter with Seal Integration All game events for frontend
 * tracking
 */

import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../../../utils/index';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
const $moduleName = 'contract_v3::events';
export const RoomCreated = new MoveStruct({ name: `${$moduleName}::RoomCreated`, fields: {
        room_id: bcs.Address,
        creator: bcs.Address,
        name: bcs.string(),
        max_players: bcs.u8(),
        entry_fee: bcs.u64(),
        tokens_to_win: bcs.u8()
    } });
export const PlayerJoined = new MoveStruct({ name: `${$moduleName}::PlayerJoined`, fields: {
        room_id: bcs.Address,
        player: bcs.Address,
        current_players: bcs.u8(),
        max_players: bcs.u8()
    } });
export const RoundStarted = new MoveStruct({ name: `${$moduleName}::RoundStarted`, fields: {
        room_id: bcs.Address,
        round_number: bcs.u8(),
        players: bcs.vector(bcs.Address),
        first_player: bcs.Address,
        public_cards: bcs.vector(bcs.u8()),
        /** Card indices dealt to each player (encrypted values stored separately) */
        dealt_card_indices: bcs.vector(bcs.vector(bcs.u64()))
    } });
export const RoundEnded = new MoveStruct({ name: `${$moduleName}::RoundEnded`, fields: {
        room_id: bcs.Address,
        round_number: bcs.u8(),
        winner: bcs.Address,
        winning_card: bcs.u8(),
        spy_bonus_player: bcs.option(bcs.Address)
    } });
export const TurnPlayed = new MoveStruct({ name: `${$moduleName}::TurnPlayed`, fields: {
        room_id: bcs.Address,
        player: bcs.Address,
        card_played: bcs.u8(),
        target: bcs.option(bcs.Address),
        guess: bcs.option(bcs.u8()),
        result: bcs.string()
    } });
export const TurnAdvanced = new MoveStruct({ name: `${$moduleName}::TurnAdvanced`, fields: {
        room_id: bcs.Address,
        next_player: bcs.Address,
        new_card_index: bcs.u64()
    } });
export const PlayerEliminated = new MoveStruct({ name: `${$moduleName}::PlayerEliminated`, fields: {
        room_id: bcs.Address,
        eliminated: bcs.Address,
        eliminated_by: bcs.Address,
        card_used: bcs.u8(),
        revealed_hand: bcs.vector(bcs.u8())
    } });
export const CardRevealed = new MoveStruct({ name: `${$moduleName}::CardRevealed`, fields: {
        room_id: bcs.Address,
        viewer: bcs.Address,
        target: bcs.Address,
        card_index: bcs.u64(),
        /** Access granted until this turn number */
        access_expires_turn: bcs.u64()
    } });
export const BaronComparison = new MoveStruct({ name: `${$moduleName}::BaronComparison`, fields: {
        room_id: bcs.Address,
        attacker: bcs.Address,
        attacker_card: bcs.u8(),
        defender: bcs.Address,
        defender_card: bcs.u8(),
        loser: bcs.option(bcs.Address)
    } });
export const HandsSwapped = new MoveStruct({ name: `${$moduleName}::HandsSwapped`, fields: {
        room_id: bcs.Address,
        player1: bcs.Address,
        player2: bcs.Address,
        /** Card indices swapped (for Seal access update) */
        player1_new_card_index: bcs.u64(),
        player2_new_card_index: bcs.u64()
    } });
export const ChancellorDraw = new MoveStruct({ name: `${$moduleName}::ChancellorDraw`, fields: {
        room_id: bcs.Address,
        player: bcs.Address,
        drawn_card_indices: bcs.vector(bcs.u64())
    } });
export const ChancellorResolved = new MoveStruct({ name: `${$moduleName}::ChancellorResolved`, fields: {
        room_id: bcs.Address,
        player: bcs.Address,
        kept_card_index: bcs.u64(),
        returned_count: bcs.u64()
    } });
export const PendingGuardResponse = new MoveStruct({ name: `${$moduleName}::PendingGuardResponse`, fields: {
        room_id: bcs.Address,
        attacker: bcs.Address,
        target: bcs.Address,
        guess: bcs.u8()
    } });
export const PendingBaronResponse = new MoveStruct({ name: `${$moduleName}::PendingBaronResponse`, fields: {
        room_id: bcs.Address,
        attacker: bcs.Address,
        attacker_card: bcs.u8(),
        target: bcs.Address
    } });
export const GuardResponseReceived = new MoveStruct({ name: `${$moduleName}::GuardResponseReceived`, fields: {
        room_id: bcs.Address,
        target: bcs.Address,
        revealed_card: bcs.u8(),
        guess_correct: bcs.bool()
    } });
export const TokenAwarded = new MoveStruct({ name: `${$moduleName}::TokenAwarded`, fields: {
        room_id: bcs.Address,
        player: bcs.Address,
        total_tokens: bcs.u8(),
        reason: bcs.string()
    } });
export const SpyBonusCheck = new MoveStruct({ name: `${$moduleName}::SpyBonusCheck`, fields: {
        room_id: bcs.Address,
        players_with_spy: bcs.vector(bcs.Address),
        bonus_awarded: bcs.bool(),
        bonus_recipient: bcs.option(bcs.Address)
    } });
export const GameEnded = new MoveStruct({ name: `${$moduleName}::GameEnded`, fields: {
        room_id: bcs.Address,
        winner: bcs.Address,
        final_tokens: bcs.u8(),
        prize_pool: bcs.u64(),
        total_rounds: bcs.u8()
    } });
export const CommitmentCreated = new MoveStruct({ name: `${$moduleName}::CommitmentCreated`, fields: {
        room_id: bcs.Address,
        card_index: bcs.u64(),
        commitment: bcs.vector(bcs.u8())
    } });
export const CommitmentVerified = new MoveStruct({ name: `${$moduleName}::CommitmentVerified`, fields: {
        room_id: bcs.Address,
        card_index: bcs.u64(),
        revealed_value: bcs.u8(),
        verified: bcs.bool()
    } });
export const TemporaryAccessGranted = new MoveStruct({ name: `${$moduleName}::TemporaryAccessGranted`, fields: {
        room_id: bcs.Address,
        viewer: bcs.Address,
        card_index: bcs.u64(),
        expires_turn: bcs.u64()
    } });
export interface EmitRoomCreatedArguments {
    roomId: RawTransactionArgument<string>;
    creator: RawTransactionArgument<string>;
    name: RawTransactionArgument<string>;
    maxPlayers: RawTransactionArgument<number>;
    entryFee: RawTransactionArgument<number | bigint>;
    tokensToWin: RawTransactionArgument<number>;
}
export interface EmitRoomCreatedOptions {
    package: string;
    arguments: EmitRoomCreatedArguments | [
        roomId: RawTransactionArgument<string>,
        creator: RawTransactionArgument<string>,
        name: RawTransactionArgument<string>,
        maxPlayers: RawTransactionArgument<number>,
        entryFee: RawTransactionArgument<number | bigint>,
        tokensToWin: RawTransactionArgument<number>
    ];
}
export function emitRoomCreated(options: EmitRoomCreatedOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID',
        'address',
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
        'u8',
        'u64',
        'u8'
    ] satisfies string[];
    const parameterNames = ["roomId", "creator", "name", "maxPlayers", "entryFee", "tokensToWin"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'events',
        function: 'emit_room_created',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface EmitPlayerJoinedArguments {
    roomId: RawTransactionArgument<string>;
    player: RawTransactionArgument<string>;
    currentPlayers: RawTransactionArgument<number>;
    maxPlayers: RawTransactionArgument<number>;
}
export interface EmitPlayerJoinedOptions {
    package: string;
    arguments: EmitPlayerJoinedArguments | [
        roomId: RawTransactionArgument<string>,
        player: RawTransactionArgument<string>,
        currentPlayers: RawTransactionArgument<number>,
        maxPlayers: RawTransactionArgument<number>
    ];
}
export function emitPlayerJoined(options: EmitPlayerJoinedOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID',
        'address',
        'u8',
        'u8'
    ] satisfies string[];
    const parameterNames = ["roomId", "player", "currentPlayers", "maxPlayers"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'events',
        function: 'emit_player_joined',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface EmitRoundStartedArguments {
    roomId: RawTransactionArgument<string>;
    roundNumber: RawTransactionArgument<number>;
    players: RawTransactionArgument<string[]>;
    firstPlayer: RawTransactionArgument<string>;
    publicCards: RawTransactionArgument<number[]>;
    dealtCardIndices: RawTransactionArgument<number | bigint[][]>;
}
export interface EmitRoundStartedOptions {
    package: string;
    arguments: EmitRoundStartedArguments | [
        roomId: RawTransactionArgument<string>,
        roundNumber: RawTransactionArgument<number>,
        players: RawTransactionArgument<string[]>,
        firstPlayer: RawTransactionArgument<string>,
        publicCards: RawTransactionArgument<number[]>,
        dealtCardIndices: RawTransactionArgument<number | bigint[][]>
    ];
}
export function emitRoundStarted(options: EmitRoundStartedOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID',
        'u8',
        'vector<address>',
        'address',
        'vector<u8>',
        'vector<vector<u64>>'
    ] satisfies string[];
    const parameterNames = ["roomId", "roundNumber", "players", "firstPlayer", "publicCards", "dealtCardIndices"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'events',
        function: 'emit_round_started',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface EmitRoundEndedArguments {
    roomId: RawTransactionArgument<string>;
    roundNumber: RawTransactionArgument<number>;
    winner: RawTransactionArgument<string>;
    winningCard: RawTransactionArgument<number>;
    spyBonusPlayer: RawTransactionArgument<string | null>;
}
export interface EmitRoundEndedOptions {
    package: string;
    arguments: EmitRoundEndedArguments | [
        roomId: RawTransactionArgument<string>,
        roundNumber: RawTransactionArgument<number>,
        winner: RawTransactionArgument<string>,
        winningCard: RawTransactionArgument<number>,
        spyBonusPlayer: RawTransactionArgument<string | null>
    ];
}
export function emitRoundEnded(options: EmitRoundEndedOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID',
        'u8',
        'address',
        'u8',
        '0x0000000000000000000000000000000000000000000000000000000000000001::option::Option<address>'
    ] satisfies string[];
    const parameterNames = ["roomId", "roundNumber", "winner", "winningCard", "spyBonusPlayer"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'events',
        function: 'emit_round_ended',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface EmitTurnPlayedArguments {
    roomId: RawTransactionArgument<string>;
    player: RawTransactionArgument<string>;
    cardPlayed: RawTransactionArgument<number>;
    target: RawTransactionArgument<string | null>;
    guess: RawTransactionArgument<number | null>;
    result: RawTransactionArgument<string>;
}
export interface EmitTurnPlayedOptions {
    package: string;
    arguments: EmitTurnPlayedArguments | [
        roomId: RawTransactionArgument<string>,
        player: RawTransactionArgument<string>,
        cardPlayed: RawTransactionArgument<number>,
        target: RawTransactionArgument<string | null>,
        guess: RawTransactionArgument<number | null>,
        result: RawTransactionArgument<string>
    ];
}
export function emitTurnPlayed(options: EmitTurnPlayedOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID',
        'address',
        'u8',
        '0x0000000000000000000000000000000000000000000000000000000000000001::option::Option<address>',
        '0x0000000000000000000000000000000000000000000000000000000000000001::option::Option<u8>',
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String'
    ] satisfies string[];
    const parameterNames = ["roomId", "player", "cardPlayed", "target", "guess", "result"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'events',
        function: 'emit_turn_played',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface EmitTurnAdvancedArguments {
    roomId: RawTransactionArgument<string>;
    nextPlayer: RawTransactionArgument<string>;
    newCardIndex: RawTransactionArgument<number | bigint>;
}
export interface EmitTurnAdvancedOptions {
    package: string;
    arguments: EmitTurnAdvancedArguments | [
        roomId: RawTransactionArgument<string>,
        nextPlayer: RawTransactionArgument<string>,
        newCardIndex: RawTransactionArgument<number | bigint>
    ];
}
export function emitTurnAdvanced(options: EmitTurnAdvancedOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID',
        'address',
        'u64'
    ] satisfies string[];
    const parameterNames = ["roomId", "nextPlayer", "newCardIndex"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'events',
        function: 'emit_turn_advanced',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface EmitPlayerEliminatedArguments {
    roomId: RawTransactionArgument<string>;
    eliminated: RawTransactionArgument<string>;
    eliminatedBy: RawTransactionArgument<string>;
    cardUsed: RawTransactionArgument<number>;
    revealedHand: RawTransactionArgument<number[]>;
}
export interface EmitPlayerEliminatedOptions {
    package: string;
    arguments: EmitPlayerEliminatedArguments | [
        roomId: RawTransactionArgument<string>,
        eliminated: RawTransactionArgument<string>,
        eliminatedBy: RawTransactionArgument<string>,
        cardUsed: RawTransactionArgument<number>,
        revealedHand: RawTransactionArgument<number[]>
    ];
}
export function emitPlayerEliminated(options: EmitPlayerEliminatedOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID',
        'address',
        'address',
        'u8',
        'vector<u8>'
    ] satisfies string[];
    const parameterNames = ["roomId", "eliminated", "eliminatedBy", "cardUsed", "revealedHand"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'events',
        function: 'emit_player_eliminated',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface EmitCardRevealedArguments {
    roomId: RawTransactionArgument<string>;
    viewer: RawTransactionArgument<string>;
    target: RawTransactionArgument<string>;
    cardIndex: RawTransactionArgument<number | bigint>;
    accessExpiresTurn: RawTransactionArgument<number | bigint>;
}
export interface EmitCardRevealedOptions {
    package: string;
    arguments: EmitCardRevealedArguments | [
        roomId: RawTransactionArgument<string>,
        viewer: RawTransactionArgument<string>,
        target: RawTransactionArgument<string>,
        cardIndex: RawTransactionArgument<number | bigint>,
        accessExpiresTurn: RawTransactionArgument<number | bigint>
    ];
}
export function emitCardRevealed(options: EmitCardRevealedOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID',
        'address',
        'address',
        'u64',
        'u64'
    ] satisfies string[];
    const parameterNames = ["roomId", "viewer", "target", "cardIndex", "accessExpiresTurn"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'events',
        function: 'emit_card_revealed',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface EmitBaronComparisonArguments {
    roomId: RawTransactionArgument<string>;
    attacker: RawTransactionArgument<string>;
    attackerCard: RawTransactionArgument<number>;
    defender: RawTransactionArgument<string>;
    defenderCard: RawTransactionArgument<number>;
    loser: RawTransactionArgument<string | null>;
}
export interface EmitBaronComparisonOptions {
    package: string;
    arguments: EmitBaronComparisonArguments | [
        roomId: RawTransactionArgument<string>,
        attacker: RawTransactionArgument<string>,
        attackerCard: RawTransactionArgument<number>,
        defender: RawTransactionArgument<string>,
        defenderCard: RawTransactionArgument<number>,
        loser: RawTransactionArgument<string | null>
    ];
}
export function emitBaronComparison(options: EmitBaronComparisonOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID',
        'address',
        'u8',
        'address',
        'u8',
        '0x0000000000000000000000000000000000000000000000000000000000000001::option::Option<address>'
    ] satisfies string[];
    const parameterNames = ["roomId", "attacker", "attackerCard", "defender", "defenderCard", "loser"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'events',
        function: 'emit_baron_comparison',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface EmitHandsSwappedArguments {
    roomId: RawTransactionArgument<string>;
    player1: RawTransactionArgument<string>;
    player2: RawTransactionArgument<string>;
    player1NewCardIndex: RawTransactionArgument<number | bigint>;
    player2NewCardIndex: RawTransactionArgument<number | bigint>;
}
export interface EmitHandsSwappedOptions {
    package: string;
    arguments: EmitHandsSwappedArguments | [
        roomId: RawTransactionArgument<string>,
        player1: RawTransactionArgument<string>,
        player2: RawTransactionArgument<string>,
        player1NewCardIndex: RawTransactionArgument<number | bigint>,
        player2NewCardIndex: RawTransactionArgument<number | bigint>
    ];
}
export function emitHandsSwapped(options: EmitHandsSwappedOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID',
        'address',
        'address',
        'u64',
        'u64'
    ] satisfies string[];
    const parameterNames = ["roomId", "player1", "player2", "player1NewCardIndex", "player2NewCardIndex"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'events',
        function: 'emit_hands_swapped',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface EmitChancellorDrawArguments {
    roomId: RawTransactionArgument<string>;
    player: RawTransactionArgument<string>;
    drawnCardIndices: RawTransactionArgument<number | bigint[]>;
}
export interface EmitChancellorDrawOptions {
    package: string;
    arguments: EmitChancellorDrawArguments | [
        roomId: RawTransactionArgument<string>,
        player: RawTransactionArgument<string>,
        drawnCardIndices: RawTransactionArgument<number | bigint[]>
    ];
}
export function emitChancellorDraw(options: EmitChancellorDrawOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID',
        'address',
        'vector<u64>'
    ] satisfies string[];
    const parameterNames = ["roomId", "player", "drawnCardIndices"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'events',
        function: 'emit_chancellor_draw',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface EmitChancellorResolvedArguments {
    roomId: RawTransactionArgument<string>;
    player: RawTransactionArgument<string>;
    keptCardIndex: RawTransactionArgument<number | bigint>;
    returnedCount: RawTransactionArgument<number | bigint>;
}
export interface EmitChancellorResolvedOptions {
    package: string;
    arguments: EmitChancellorResolvedArguments | [
        roomId: RawTransactionArgument<string>,
        player: RawTransactionArgument<string>,
        keptCardIndex: RawTransactionArgument<number | bigint>,
        returnedCount: RawTransactionArgument<number | bigint>
    ];
}
export function emitChancellorResolved(options: EmitChancellorResolvedOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID',
        'address',
        'u64',
        'u64'
    ] satisfies string[];
    const parameterNames = ["roomId", "player", "keptCardIndex", "returnedCount"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'events',
        function: 'emit_chancellor_resolved',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface EmitPendingGuardResponseArguments {
    roomId: RawTransactionArgument<string>;
    attacker: RawTransactionArgument<string>;
    target: RawTransactionArgument<string>;
    guess: RawTransactionArgument<number>;
}
export interface EmitPendingGuardResponseOptions {
    package: string;
    arguments: EmitPendingGuardResponseArguments | [
        roomId: RawTransactionArgument<string>,
        attacker: RawTransactionArgument<string>,
        target: RawTransactionArgument<string>,
        guess: RawTransactionArgument<number>
    ];
}
export function emitPendingGuardResponse(options: EmitPendingGuardResponseOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID',
        'address',
        'address',
        'u8'
    ] satisfies string[];
    const parameterNames = ["roomId", "attacker", "target", "guess"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'events',
        function: 'emit_pending_guard_response',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface EmitPendingBaronResponseArguments {
    roomId: RawTransactionArgument<string>;
    attacker: RawTransactionArgument<string>;
    attackerCard: RawTransactionArgument<number>;
    target: RawTransactionArgument<string>;
}
export interface EmitPendingBaronResponseOptions {
    package: string;
    arguments: EmitPendingBaronResponseArguments | [
        roomId: RawTransactionArgument<string>,
        attacker: RawTransactionArgument<string>,
        attackerCard: RawTransactionArgument<number>,
        target: RawTransactionArgument<string>
    ];
}
export function emitPendingBaronResponse(options: EmitPendingBaronResponseOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID',
        'address',
        'u8',
        'address'
    ] satisfies string[];
    const parameterNames = ["roomId", "attacker", "attackerCard", "target"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'events',
        function: 'emit_pending_baron_response',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface EmitGuardResponseArguments {
    roomId: RawTransactionArgument<string>;
    target: RawTransactionArgument<string>;
    revealedCard: RawTransactionArgument<number>;
    guessCorrect: RawTransactionArgument<boolean>;
}
export interface EmitGuardResponseOptions {
    package: string;
    arguments: EmitGuardResponseArguments | [
        roomId: RawTransactionArgument<string>,
        target: RawTransactionArgument<string>,
        revealedCard: RawTransactionArgument<number>,
        guessCorrect: RawTransactionArgument<boolean>
    ];
}
export function emitGuardResponse(options: EmitGuardResponseOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID',
        'address',
        'u8',
        'bool'
    ] satisfies string[];
    const parameterNames = ["roomId", "target", "revealedCard", "guessCorrect"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'events',
        function: 'emit_guard_response',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface EmitTokenAwardedArguments {
    roomId: RawTransactionArgument<string>;
    player: RawTransactionArgument<string>;
    totalTokens: RawTransactionArgument<number>;
    reason: RawTransactionArgument<string>;
}
export interface EmitTokenAwardedOptions {
    package: string;
    arguments: EmitTokenAwardedArguments | [
        roomId: RawTransactionArgument<string>,
        player: RawTransactionArgument<string>,
        totalTokens: RawTransactionArgument<number>,
        reason: RawTransactionArgument<string>
    ];
}
export function emitTokenAwarded(options: EmitTokenAwardedOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID',
        'address',
        'u8',
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String'
    ] satisfies string[];
    const parameterNames = ["roomId", "player", "totalTokens", "reason"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'events',
        function: 'emit_token_awarded',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface EmitSpyBonusCheckArguments {
    roomId: RawTransactionArgument<string>;
    playersWithSpy: RawTransactionArgument<string[]>;
    bonusAwarded: RawTransactionArgument<boolean>;
    bonusRecipient: RawTransactionArgument<string | null>;
}
export interface EmitSpyBonusCheckOptions {
    package: string;
    arguments: EmitSpyBonusCheckArguments | [
        roomId: RawTransactionArgument<string>,
        playersWithSpy: RawTransactionArgument<string[]>,
        bonusAwarded: RawTransactionArgument<boolean>,
        bonusRecipient: RawTransactionArgument<string | null>
    ];
}
export function emitSpyBonusCheck(options: EmitSpyBonusCheckOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID',
        'vector<address>',
        'bool',
        '0x0000000000000000000000000000000000000000000000000000000000000001::option::Option<address>'
    ] satisfies string[];
    const parameterNames = ["roomId", "playersWithSpy", "bonusAwarded", "bonusRecipient"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'events',
        function: 'emit_spy_bonus_check',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface EmitGameEndedArguments {
    roomId: RawTransactionArgument<string>;
    winner: RawTransactionArgument<string>;
    finalTokens: RawTransactionArgument<number>;
    prizePool: RawTransactionArgument<number | bigint>;
    totalRounds: RawTransactionArgument<number>;
}
export interface EmitGameEndedOptions {
    package: string;
    arguments: EmitGameEndedArguments | [
        roomId: RawTransactionArgument<string>,
        winner: RawTransactionArgument<string>,
        finalTokens: RawTransactionArgument<number>,
        prizePool: RawTransactionArgument<number | bigint>,
        totalRounds: RawTransactionArgument<number>
    ];
}
export function emitGameEnded(options: EmitGameEndedOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID',
        'address',
        'u8',
        'u64',
        'u8'
    ] satisfies string[];
    const parameterNames = ["roomId", "winner", "finalTokens", "prizePool", "totalRounds"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'events',
        function: 'emit_game_ended',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface EmitCommitmentCreatedArguments {
    roomId: RawTransactionArgument<string>;
    cardIndex: RawTransactionArgument<number | bigint>;
    commitment: RawTransactionArgument<number[]>;
}
export interface EmitCommitmentCreatedOptions {
    package: string;
    arguments: EmitCommitmentCreatedArguments | [
        roomId: RawTransactionArgument<string>,
        cardIndex: RawTransactionArgument<number | bigint>,
        commitment: RawTransactionArgument<number[]>
    ];
}
export function emitCommitmentCreated(options: EmitCommitmentCreatedOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID',
        'u64',
        'vector<u8>'
    ] satisfies string[];
    const parameterNames = ["roomId", "cardIndex", "commitment"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'events',
        function: 'emit_commitment_created',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface EmitCommitmentVerifiedArguments {
    roomId: RawTransactionArgument<string>;
    cardIndex: RawTransactionArgument<number | bigint>;
    revealedValue: RawTransactionArgument<number>;
    verified: RawTransactionArgument<boolean>;
}
export interface EmitCommitmentVerifiedOptions {
    package: string;
    arguments: EmitCommitmentVerifiedArguments | [
        roomId: RawTransactionArgument<string>,
        cardIndex: RawTransactionArgument<number | bigint>,
        revealedValue: RawTransactionArgument<number>,
        verified: RawTransactionArgument<boolean>
    ];
}
export function emitCommitmentVerified(options: EmitCommitmentVerifiedOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID',
        'u64',
        'u8',
        'bool'
    ] satisfies string[];
    const parameterNames = ["roomId", "cardIndex", "revealedValue", "verified"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'events',
        function: 'emit_commitment_verified',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface EmitTemporaryAccessGrantedArguments {
    roomId: RawTransactionArgument<string>;
    viewer: RawTransactionArgument<string>;
    cardIndex: RawTransactionArgument<number | bigint>;
    expiresTurn: RawTransactionArgument<number | bigint>;
}
export interface EmitTemporaryAccessGrantedOptions {
    package: string;
    arguments: EmitTemporaryAccessGrantedArguments | [
        roomId: RawTransactionArgument<string>,
        viewer: RawTransactionArgument<string>,
        cardIndex: RawTransactionArgument<number | bigint>,
        expiresTurn: RawTransactionArgument<number | bigint>
    ];
}
export function emitTemporaryAccessGranted(options: EmitTemporaryAccessGrantedOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID',
        'address',
        'u64',
        'u64'
    ] satisfies string[];
    const parameterNames = ["roomId", "viewer", "cardIndex", "expiresTurn"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'events',
        function: 'emit_temporary_access_granted',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}