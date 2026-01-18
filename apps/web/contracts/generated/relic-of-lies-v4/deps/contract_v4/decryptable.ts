/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/**
 * Decryptable module for Seal encryption integration Provides encrypted/decrypted
 * state management with on-chain verification
 */

import { MoveEnum, MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../../../utils/index';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
const $moduleName = 'contract_v4::decryptable';
/** Decryptable enum - represents either encrypted or decrypted state */
export const Decryptable = new MoveEnum({ name: `${$moduleName}::Decryptable`, fields: {
        /** Encrypted state - contains ciphertext, hash for verification, and nonce */
        Encrypted: new MoveStruct({ name: `Decryptable.Encrypted`, fields: {
                ciphertext: bcs.vector(bcs.u8()),
                hash: bcs.vector(bcs.u8()),
                nonce: bcs.vector(bcs.u8())
            } }),
        /** Decrypted state - contains the plaintext data */
        Decrypted: new MoveStruct({ name: `Decryptable.Decrypted`, fields: {
                data: bcs.vector(bcs.u8())
            } })
    } });
export interface NewArguments {
    ciphertext: RawTransactionArgument<number[]>;
    hash: RawTransactionArgument<number[]>;
    nonce: RawTransactionArgument<number[]>;
}
export interface NewOptions {
    package: string;
    arguments: NewArguments | [
        ciphertext: RawTransactionArgument<number[]>,
        hash: RawTransactionArgument<number[]>,
        nonce: RawTransactionArgument<number[]>
    ];
}
/**
 * Create a new Decryptable in encrypted state
 *
 * - ciphertext: The encrypted data (from Seal SDK)
 * - hash: blake2b256(plaintext_data || nonce) - 32 bytes
 * - nonce: Random 32 bytes used in hash
 */
export function _new(options: NewOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        'vector<u8>',
        'vector<u8>',
        'vector<u8>'
    ] satisfies string[];
    const parameterNames = ["ciphertext", "hash", "nonce"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'decryptable',
        function: 'new',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface DecryptArguments {
    self: RawTransactionArgument<string>;
    data: RawTransactionArgument<number[]>;
}
export interface DecryptOptions {
    package: string;
    arguments: DecryptArguments | [
        self: RawTransactionArgument<string>,
        data: RawTransactionArgument<number[]>
    ];
}
/**
 * Decrypt and verify the data
 *
 * - data: The plaintext data (decrypted off-chain via Seal) Verifies:
 *   blake2b256(data || nonce) == hash Transitions from Encrypted to Decrypted
 *   state
 */
export function decrypt(options: DecryptOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::decryptable::Decryptable`,
        'vector<u8>'
    ] satisfies string[];
    const parameterNames = ["self", "data"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'decryptable',
        function: 'decrypt',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface IsEncryptedArguments {
    self: RawTransactionArgument<string>;
}
export interface IsEncryptedOptions {
    package: string;
    arguments: IsEncryptedArguments | [
        self: RawTransactionArgument<string>
    ];
}
/** Check if the Decryptable is in encrypted state */
export function isEncrypted(options: IsEncryptedOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::decryptable::Decryptable`
    ] satisfies string[];
    const parameterNames = ["self"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'decryptable',
        function: 'is_encrypted',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface IsDecryptedArguments {
    self: RawTransactionArgument<string>;
}
export interface IsDecryptedOptions {
    package: string;
    arguments: IsDecryptedArguments | [
        self: RawTransactionArgument<string>
    ];
}
/** Check if the Decryptable is in decrypted state */
export function isDecrypted(options: IsDecryptedOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::decryptable::Decryptable`
    ] satisfies string[];
    const parameterNames = ["self"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'decryptable',
        function: 'is_decrypted',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface CiphertextArguments {
    self: RawTransactionArgument<string>;
}
export interface CiphertextOptions {
    package: string;
    arguments: CiphertextArguments | [
        self: RawTransactionArgument<string>
    ];
}
/** Get the ciphertext (only valid when encrypted) */
export function ciphertext(options: CiphertextOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::decryptable::Decryptable`
    ] satisfies string[];
    const parameterNames = ["self"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'decryptable',
        function: 'ciphertext',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface DataArguments {
    self: RawTransactionArgument<string>;
}
export interface DataOptions {
    package: string;
    arguments: DataArguments | [
        self: RawTransactionArgument<string>
    ];
}
/** Get the decrypted data (only valid when decrypted) */
export function data(options: DataOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::decryptable::Decryptable`
    ] satisfies string[];
    const parameterNames = ["self"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'decryptable',
        function: 'data',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface HashArguments {
    self: RawTransactionArgument<string>;
}
export interface HashOptions {
    package: string;
    arguments: HashArguments | [
        self: RawTransactionArgument<string>
    ];
}
/** Get the hash (only valid when encrypted) */
export function hash(options: HashOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::decryptable::Decryptable`
    ] satisfies string[];
    const parameterNames = ["self"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'decryptable',
        function: 'hash',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface NonceArguments {
    self: RawTransactionArgument<string>;
}
export interface NonceOptions {
    package: string;
    arguments: NonceArguments | [
        self: RawTransactionArgument<string>
    ];
}
/** Get the nonce (only valid when encrypted) */
export function nonce(options: NonceOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::decryptable::Decryptable`
    ] satisfies string[];
    const parameterNames = ["self"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'decryptable',
        function: 'nonce',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ExtractCardValueArguments {
    self: RawTransactionArgument<string>;
}
export interface ExtractCardValueOptions {
    package: string;
    arguments: ExtractCardValueArguments | [
        self: RawTransactionArgument<string>
    ];
}
/**
 * Extract card value from decrypted data Data format: [card_value:
 * u8][padding: 31 bytes]
 */
export function extractCardValue(options: ExtractCardValueOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::decryptable::Decryptable`
    ] satisfies string[];
    const parameterNames = ["self"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'decryptable',
        function: 'extract_card_value',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}