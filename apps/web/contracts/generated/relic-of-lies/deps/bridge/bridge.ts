/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../../../utils/index';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import * as object from '../sui/object';
import * as versioned from '../sui/versioned';
import * as vec_map from '../sui/vec_map';
import * as committee from './committee';
import * as treasury from './treasury';
import * as linked_table from '../sui/linked_table';
import * as message from './message';
import * as limiter from './limiter';
const $moduleName = 'bridge::bridge';
export const Bridge = new MoveStruct({ name: `${$moduleName}::Bridge`, fields: {
        id: object.UID,
        inner: versioned.Versioned
    } });
export const BridgeInner = new MoveStruct({ name: `${$moduleName}::BridgeInner`, fields: {
        bridge_version: bcs.u64(),
        message_version: bcs.u8(),
        chain_id: bcs.u8(),
        sequence_nums: vec_map.VecMap(bcs.u8(), bcs.u64()),
        committee: committee.BridgeCommittee,
        treasury: treasury.BridgeTreasury,
        token_transfer_records: linked_table.LinkedTable(message.BridgeMessageKey),
        limiter: limiter.TransferLimiter,
        paused: bcs.bool()
    } });
export const TokenDepositedEvent = new MoveStruct({ name: `${$moduleName}::TokenDepositedEvent`, fields: {
        seq_num: bcs.u64(),
        source_chain: bcs.u8(),
        sender_address: bcs.vector(bcs.u8()),
        target_chain: bcs.u8(),
        target_address: bcs.vector(bcs.u8()),
        token_type: bcs.u8(),
        amount: bcs.u64()
    } });
export const EmergencyOpEvent = new MoveStruct({ name: `${$moduleName}::EmergencyOpEvent`, fields: {
        frozen: bcs.bool()
    } });
export const BridgeRecord = new MoveStruct({ name: `${$moduleName}::BridgeRecord`, fields: {
        message: message.BridgeMessage,
        verified_signatures: bcs.option(bcs.vector(bcs.vector(bcs.u8()))),
        claimed: bcs.bool()
    } });
export const TokenTransferApproved = new MoveStruct({ name: `${$moduleName}::TokenTransferApproved`, fields: {
        message_key: message.BridgeMessageKey
    } });
export const TokenTransferClaimed = new MoveStruct({ name: `${$moduleName}::TokenTransferClaimed`, fields: {
        message_key: message.BridgeMessageKey
    } });
export const TokenTransferAlreadyApproved = new MoveStruct({ name: `${$moduleName}::TokenTransferAlreadyApproved`, fields: {
        message_key: message.BridgeMessageKey
    } });
export const TokenTransferAlreadyClaimed = new MoveStruct({ name: `${$moduleName}::TokenTransferAlreadyClaimed`, fields: {
        message_key: message.BridgeMessageKey
    } });
export const TokenTransferLimitExceed = new MoveStruct({ name: `${$moduleName}::TokenTransferLimitExceed`, fields: {
        message_key: message.BridgeMessageKey
    } });
export interface CommitteeRegistrationArguments {
    bridge: RawTransactionArgument<string>;
    bridgePubkeyBytes: RawTransactionArgument<number[]>;
    httpRestUrl: RawTransactionArgument<number[]>;
}
export interface CommitteeRegistrationOptions {
    package: string;
    arguments: CommitteeRegistrationArguments | [
        bridge: RawTransactionArgument<string>,
        bridgePubkeyBytes: RawTransactionArgument<number[]>,
        httpRestUrl: RawTransactionArgument<number[]>
    ];
}
export function committeeRegistration(options: CommitteeRegistrationOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::bridge::Bridge`,
        '0x0000000000000000000000000000000000000000000000000000000000000003::sui_system::SuiSystemState',
        'vector<u8>',
        'vector<u8>'
    ] satisfies string[];
    const parameterNames = ["bridge", "bridgePubkeyBytes", "httpRestUrl"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'bridge',
        function: 'committee_registration',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface UpdateNodeUrlArguments {
    bridge: RawTransactionArgument<string>;
    newUrl: RawTransactionArgument<number[]>;
}
export interface UpdateNodeUrlOptions {
    package: string;
    arguments: UpdateNodeUrlArguments | [
        bridge: RawTransactionArgument<string>,
        newUrl: RawTransactionArgument<number[]>
    ];
}
export function updateNodeUrl(options: UpdateNodeUrlOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::bridge::Bridge`,
        'vector<u8>'
    ] satisfies string[];
    const parameterNames = ["bridge", "newUrl"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'bridge',
        function: 'update_node_url',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface RegisterForeignTokenArguments {
    bridge: RawTransactionArgument<string>;
    tc: RawTransactionArgument<string>;
    uc: RawTransactionArgument<string>;
    metadata: RawTransactionArgument<string>;
}
export interface RegisterForeignTokenOptions {
    package: string;
    arguments: RegisterForeignTokenArguments | [
        bridge: RawTransactionArgument<string>,
        tc: RawTransactionArgument<string>,
        uc: RawTransactionArgument<string>,
        metadata: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function registerForeignToken(options: RegisterForeignTokenOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::bridge::Bridge`,
        `0x0000000000000000000000000000000000000000000000000000000000000002::coin::TreasuryCap<${options.typeArguments[0]}>`,
        '0x0000000000000000000000000000000000000000000000000000000000000002::package::UpgradeCap',
        `0x0000000000000000000000000000000000000000000000000000000000000002::coin::CoinMetadata<${options.typeArguments[0]}>`
    ] satisfies string[];
    const parameterNames = ["bridge", "tc", "uc", "metadata"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'bridge',
        function: 'register_foreign_token',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface SendTokenArguments {
    bridge: RawTransactionArgument<string>;
    targetChain: RawTransactionArgument<number>;
    targetAddress: RawTransactionArgument<number[]>;
    token: RawTransactionArgument<string>;
}
export interface SendTokenOptions {
    package: string;
    arguments: SendTokenArguments | [
        bridge: RawTransactionArgument<string>,
        targetChain: RawTransactionArgument<number>,
        targetAddress: RawTransactionArgument<number[]>,
        token: RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function sendToken(options: SendTokenOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::bridge::Bridge`,
        'u8',
        'vector<u8>',
        `0x0000000000000000000000000000000000000000000000000000000000000002::coin::Coin<${options.typeArguments[0]}>`
    ] satisfies string[];
    const parameterNames = ["bridge", "targetChain", "targetAddress", "token"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'bridge',
        function: 'send_token',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface ApproveTokenTransferArguments {
    bridge: RawTransactionArgument<string>;
    message: RawTransactionArgument<string>;
    signatures: RawTransactionArgument<number[][]>;
}
export interface ApproveTokenTransferOptions {
    package: string;
    arguments: ApproveTokenTransferArguments | [
        bridge: RawTransactionArgument<string>,
        message: RawTransactionArgument<string>,
        signatures: RawTransactionArgument<number[][]>
    ];
}
export function approveTokenTransfer(options: ApproveTokenTransferOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::bridge::Bridge`,
        `${packageAddress}::message::BridgeMessage`,
        'vector<vector<u8>>'
    ] satisfies string[];
    const parameterNames = ["bridge", "message", "signatures"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'bridge',
        function: 'approve_token_transfer',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ClaimTokenArguments {
    bridge: RawTransactionArgument<string>;
    sourceChain: RawTransactionArgument<number>;
    bridgeSeqNum: RawTransactionArgument<number | bigint>;
}
export interface ClaimTokenOptions {
    package: string;
    arguments: ClaimTokenArguments | [
        bridge: RawTransactionArgument<string>,
        sourceChain: RawTransactionArgument<number>,
        bridgeSeqNum: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string
    ];
}
export function claimToken(options: ClaimTokenOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::bridge::Bridge`,
        '0x0000000000000000000000000000000000000000000000000000000000000002::clock::Clock',
        'u8',
        'u64'
    ] satisfies string[];
    const parameterNames = ["bridge", "sourceChain", "bridgeSeqNum"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'bridge',
        function: 'claim_token',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface ClaimAndTransferTokenArguments {
    bridge: RawTransactionArgument<string>;
    sourceChain: RawTransactionArgument<number>;
    bridgeSeqNum: RawTransactionArgument<number | bigint>;
}
export interface ClaimAndTransferTokenOptions {
    package: string;
    arguments: ClaimAndTransferTokenArguments | [
        bridge: RawTransactionArgument<string>,
        sourceChain: RawTransactionArgument<number>,
        bridgeSeqNum: RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string
    ];
}
export function claimAndTransferToken(options: ClaimAndTransferTokenOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::bridge::Bridge`,
        '0x0000000000000000000000000000000000000000000000000000000000000002::clock::Clock',
        'u8',
        'u64'
    ] satisfies string[];
    const parameterNames = ["bridge", "sourceChain", "bridgeSeqNum"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'bridge',
        function: 'claim_and_transfer_token',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
        typeArguments: options.typeArguments
    });
}
export interface ExecuteSystemMessageArguments {
    bridge: RawTransactionArgument<string>;
    message: RawTransactionArgument<string>;
    signatures: RawTransactionArgument<number[][]>;
}
export interface ExecuteSystemMessageOptions {
    package: string;
    arguments: ExecuteSystemMessageArguments | [
        bridge: RawTransactionArgument<string>,
        message: RawTransactionArgument<string>,
        signatures: RawTransactionArgument<number[][]>
    ];
}
export function executeSystemMessage(options: ExecuteSystemMessageOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::bridge::Bridge`,
        `${packageAddress}::message::BridgeMessage`,
        'vector<vector<u8>>'
    ] satisfies string[];
    const parameterNames = ["bridge", "message", "signatures"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'bridge',
        function: 'execute_system_message',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}