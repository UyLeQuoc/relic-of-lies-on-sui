/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { MoveStruct, MoveTuple, normalizeMoveArguments, type RawTransactionArgument } from '../../../utils/index';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import * as object from './object';
import * as vec_set from './vec_set';
const $moduleName = '0x2::address_alias';
export const AddressAliasState = new MoveStruct({ name: `${$moduleName}::AddressAliasState`, fields: {
        id: object.UID,
        version: bcs.u64()
    } });
export const AddressAliases = new MoveStruct({ name: `${$moduleName}::AddressAliases`, fields: {
        id: object.UID,
        aliases: vec_set.VecSet(bcs.Address)
    } });
export const AliasKey = new MoveTuple({ name: `${$moduleName}::AliasKey`, fields: [bcs.Address] });
export interface EnableArguments {
    addressAliasState: RawTransactionArgument<string>;
}
export interface EnableOptions {
    package: string;
    arguments: EnableArguments | [
        addressAliasState: RawTransactionArgument<string>
    ];
}
/**
 * Enables address alias configuration for the sender address.
 *
 * By default, an address is its own alias. The provided `AddressAliases` object
 * can be used to change the set of allowed aliases after enabling.
 */
export function enable(options: EnableOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::address_alias::AddressAliasState`
    ] satisfies string[];
    const parameterNames = ["addressAliasState"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'address_alias',
        function: 'enable',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface AddArguments {
    aliases: RawTransactionArgument<string>;
    alias: RawTransactionArgument<string>;
}
export interface AddOptions {
    package: string;
    arguments: AddArguments | [
        aliases: RawTransactionArgument<string>,
        alias: RawTransactionArgument<string>
    ];
}
/** Adds the provided address to the set of aliases for the sender. */
export function add(options: AddOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::address_alias::AddressAliases`,
        'address'
    ] satisfies string[];
    const parameterNames = ["aliases", "alias"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'address_alias',
        function: 'add',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ReplaceAllArguments {
    aliases: RawTransactionArgument<string>;
    newAliases: RawTransactionArgument<string[]>;
}
export interface ReplaceAllOptions {
    package: string;
    arguments: ReplaceAllArguments | [
        aliases: RawTransactionArgument<string>,
        newAliases: RawTransactionArgument<string[]>
    ];
}
/** Overwrites the aliases for the sender's address with the given set. */
export function replaceAll(options: ReplaceAllOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::address_alias::AddressAliases`,
        'vector<address>'
    ] satisfies string[];
    const parameterNames = ["aliases", "newAliases"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'address_alias',
        function: 'replace_all',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RemoveArguments {
    aliases: RawTransactionArgument<string>;
    alias: RawTransactionArgument<string>;
}
export interface RemoveOptions {
    package: string;
    arguments: RemoveArguments | [
        aliases: RawTransactionArgument<string>,
        alias: RawTransactionArgument<string>
    ];
}
/** Removes the given alias from the set of aliases for the sender's address. */
export function remove(options: RemoveOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::address_alias::AddressAliases`,
        'address'
    ] satisfies string[];
    const parameterNames = ["aliases", "alias"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'address_alias',
        function: 'remove',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}