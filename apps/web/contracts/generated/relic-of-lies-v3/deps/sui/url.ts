/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/** URL: standard Uniform Resource Locator string */

import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../../../utils/index';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
const $moduleName = '0x2::url';
export const Url = new MoveStruct({ name: `${$moduleName}::Url`, fields: {
        url: bcs.string()
    } });
export interface NewUnsafeArguments {
    url: RawTransactionArgument<string>;
}
export interface NewUnsafeOptions {
    package: string;
    arguments: NewUnsafeArguments | [
        url: RawTransactionArgument<string>
    ];
}
/** Create a `Url`, with no validation */
export function newUnsafe(options: NewUnsafeOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000001::ascii::String'
    ] satisfies string[];
    const parameterNames = ["url"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'url',
        function: 'new_unsafe',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface NewUnsafeFromBytesArguments {
    bytes: RawTransactionArgument<number[]>;
}
export interface NewUnsafeFromBytesOptions {
    package: string;
    arguments: NewUnsafeFromBytesArguments | [
        bytes: RawTransactionArgument<number[]>
    ];
}
/**
 * Create a `Url` with no validation from bytes Note: this will abort if `bytes` is
 * not valid ASCII
 */
export function newUnsafeFromBytes(options: NewUnsafeFromBytesOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        'vector<u8>'
    ] satisfies string[];
    const parameterNames = ["bytes"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'url',
        function: 'new_unsafe_from_bytes',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface InnerUrlArguments {
    self: RawTransactionArgument<string>;
}
export interface InnerUrlOptions {
    package: string;
    arguments: InnerUrlArguments | [
        self: RawTransactionArgument<string>
    ];
}
/** Get inner URL */
export function innerUrl(options: InnerUrlOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::url::Url`
    ] satisfies string[];
    const parameterNames = ["self"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'url',
        function: 'inner_url',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface UpdateArguments {
    self: RawTransactionArgument<string>;
    url: RawTransactionArgument<string>;
}
export interface UpdateOptions {
    package: string;
    arguments: UpdateArguments | [
        self: RawTransactionArgument<string>,
        url: RawTransactionArgument<string>
    ];
}
/** Update the inner URL */
export function update(options: UpdateOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::url::Url`,
        '0x0000000000000000000000000000000000000000000000000000000000000001::ascii::String'
    ] satisfies string[];
    const parameterNames = ["self", "url"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'url',
        function: 'update',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}