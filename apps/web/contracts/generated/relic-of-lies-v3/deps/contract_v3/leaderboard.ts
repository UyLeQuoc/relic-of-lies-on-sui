/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/**
 * Leaderboard module for Love Letter with Seal Integration Tracks player
 * statistics and rankings
 */

import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../../../utils/index';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import * as object from '../sui/object';
const $moduleName = 'contract_v3::leaderboard';
export const PlayerStats = new MoveStruct({ name: `${$moduleName}::PlayerStats`, fields: {
        addr: bcs.Address,
        wins: bcs.u64(),
        losses: bcs.u64(),
        games_played: bcs.u64()
    } });
export const Leaderboard = new MoveStruct({ name: `${$moduleName}::Leaderboard`, fields: {
        id: object.UID,
        entries: bcs.vector(PlayerStats)
    } });
export interface UpdateWinnerArguments {
    leaderboard: RawTransactionArgument<string>;
    winner: RawTransactionArgument<string>;
}
export interface UpdateWinnerOptions {
    package: string;
    arguments: UpdateWinnerArguments | [
        leaderboard: RawTransactionArgument<string>,
        winner: RawTransactionArgument<string>
    ];
}
/** Update winner stats */
export function updateWinner(options: UpdateWinnerOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::leaderboard::Leaderboard`,
        'address'
    ] satisfies string[];
    const parameterNames = ["leaderboard", "winner"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'leaderboard',
        function: 'update_winner',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface UpdateLoserArguments {
    leaderboard: RawTransactionArgument<string>;
    loser: RawTransactionArgument<string>;
}
export interface UpdateLoserOptions {
    package: string;
    arguments: UpdateLoserArguments | [
        leaderboard: RawTransactionArgument<string>,
        loser: RawTransactionArgument<string>
    ];
}
/** Update loser stats */
export function updateLoser(options: UpdateLoserOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::leaderboard::Leaderboard`,
        'address'
    ] satisfies string[];
    const parameterNames = ["leaderboard", "loser"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'leaderboard',
        function: 'update_loser',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface GetPlayerStatsArguments {
    leaderboard: RawTransactionArgument<string>;
    player: RawTransactionArgument<string>;
}
export interface GetPlayerStatsOptions {
    package: string;
    arguments: GetPlayerStatsArguments | [
        leaderboard: RawTransactionArgument<string>,
        player: RawTransactionArgument<string>
    ];
}
export function getPlayerStats(options: GetPlayerStatsOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::leaderboard::Leaderboard`,
        'address'
    ] satisfies string[];
    const parameterNames = ["leaderboard", "player"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'leaderboard',
        function: 'get_player_stats',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface GetTopPlayersArguments {
    leaderboard: RawTransactionArgument<string>;
    count: RawTransactionArgument<number | bigint>;
}
export interface GetTopPlayersOptions {
    package: string;
    arguments: GetTopPlayersArguments | [
        leaderboard: RawTransactionArgument<string>,
        count: RawTransactionArgument<number | bigint>
    ];
}
export function getTopPlayers(options: GetTopPlayersOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::leaderboard::Leaderboard`,
        'u64'
    ] satisfies string[];
    const parameterNames = ["leaderboard", "count"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'leaderboard',
        function: 'get_top_players',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface GetPlayerRankArguments {
    leaderboard: RawTransactionArgument<string>;
    player: RawTransactionArgument<string>;
}
export interface GetPlayerRankOptions {
    package: string;
    arguments: GetPlayerRankArguments | [
        leaderboard: RawTransactionArgument<string>,
        player: RawTransactionArgument<string>
    ];
}
export function getPlayerRank(options: GetPlayerRankOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::leaderboard::Leaderboard`,
        'address'
    ] satisfies string[];
    const parameterNames = ["leaderboard", "player"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'leaderboard',
        function: 'get_player_rank',
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
export function totalPlayers(options: TotalPlayersOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::leaderboard::Leaderboard`
    ] satisfies string[];
    const parameterNames = ["leaderboard"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'leaderboard',
        function: 'total_players',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PlayerWinsArguments {
    stats: RawTransactionArgument<string>;
}
export interface PlayerWinsOptions {
    package: string;
    arguments: PlayerWinsArguments | [
        stats: RawTransactionArgument<string>
    ];
}
export function playerWins(options: PlayerWinsOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::leaderboard::PlayerStats`
    ] satisfies string[];
    const parameterNames = ["stats"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'leaderboard',
        function: 'player_wins',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PlayerLossesArguments {
    stats: RawTransactionArgument<string>;
}
export interface PlayerLossesOptions {
    package: string;
    arguments: PlayerLossesArguments | [
        stats: RawTransactionArgument<string>
    ];
}
export function playerLosses(options: PlayerLossesOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::leaderboard::PlayerStats`
    ] satisfies string[];
    const parameterNames = ["stats"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'leaderboard',
        function: 'player_losses',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PlayerGamesArguments {
    stats: RawTransactionArgument<string>;
}
export interface PlayerGamesOptions {
    package: string;
    arguments: PlayerGamesArguments | [
        stats: RawTransactionArgument<string>
    ];
}
export function playerGames(options: PlayerGamesOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::leaderboard::PlayerStats`
    ] satisfies string[];
    const parameterNames = ["stats"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'leaderboard',
        function: 'player_games',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PlayerAddressArguments {
    stats: RawTransactionArgument<string>;
}
export interface PlayerAddressOptions {
    package: string;
    arguments: PlayerAddressArguments | [
        stats: RawTransactionArgument<string>
    ];
}
export function playerAddress(options: PlayerAddressOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::leaderboard::PlayerStats`
    ] satisfies string[];
    const parameterNames = ["stats"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'leaderboard',
        function: 'player_address',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}