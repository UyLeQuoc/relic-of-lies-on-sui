/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/**
 * Leaderboard module for Relic Of Lies game with Seal Encryption Manages global
 * rankings as a shared object
 */

import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../../../utils/index';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import * as object from '../sui/object';
const $moduleName = 'contract_v4::leaderboard';
export const PlayerRecord = new MoveStruct({ name: `${$moduleName}::PlayerRecord`, fields: {
        addr: bcs.Address,
        wins: bcs.u64(),
        games_played: bcs.u64()
    } });
export const Leaderboard = new MoveStruct({ name: `${$moduleName}::Leaderboard`, fields: {
        id: object.UID,
        records: bcs.vector(PlayerRecord)
    } });
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
/** Get top N players from leaderboard */
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
export interface GetPlayerRecordArguments {
    leaderboard: RawTransactionArgument<string>;
    player: RawTransactionArgument<string>;
}
export interface GetPlayerRecordOptions {
    package: string;
    arguments: GetPlayerRecordArguments | [
        leaderboard: RawTransactionArgument<string>,
        player: RawTransactionArgument<string>
    ];
}
/** Get a player's record */
export function getPlayerRecord(options: GetPlayerRecordOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::leaderboard::Leaderboard`,
        'address'
    ] satisfies string[];
    const parameterNames = ["leaderboard", "player"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'leaderboard',
        function: 'get_player_record',
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
/** Get player's rank (1-indexed, 0 if not found) */
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
/** Get total number of players in leaderboard */
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
export interface RecordAddressArguments {
    record: RawTransactionArgument<string>;
}
export interface RecordAddressOptions {
    package: string;
    arguments: RecordAddressArguments | [
        record: RawTransactionArgument<string>
    ];
}
export function recordAddress(options: RecordAddressOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::leaderboard::PlayerRecord`
    ] satisfies string[];
    const parameterNames = ["record"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'leaderboard',
        function: 'record_address',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RecordWinsArguments {
    record: RawTransactionArgument<string>;
}
export interface RecordWinsOptions {
    package: string;
    arguments: RecordWinsArguments | [
        record: RawTransactionArgument<string>
    ];
}
export function recordWins(options: RecordWinsOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::leaderboard::PlayerRecord`
    ] satisfies string[];
    const parameterNames = ["record"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'leaderboard',
        function: 'record_wins',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RecordGamesPlayedArguments {
    record: RawTransactionArgument<string>;
}
export interface RecordGamesPlayedOptions {
    package: string;
    arguments: RecordGamesPlayedArguments | [
        record: RawTransactionArgument<string>
    ];
}
export function recordGamesPlayed(options: RecordGamesPlayedOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::leaderboard::PlayerRecord`
    ] satisfies string[];
    const parameterNames = ["record"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'leaderboard',
        function: 'record_games_played',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}