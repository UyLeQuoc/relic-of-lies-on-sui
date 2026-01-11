/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../../../utils/index';
import { type Transaction } from '@mysten/sui/transactions';
import * as balance from '../sui/balance';
const $moduleName = '0x3::storage_fund';
export const StorageFund = new MoveStruct({ name: `${$moduleName}::StorageFund`, fields: {
        total_object_storage_rebates: balance.Balance,
        non_refundable_balance: balance.Balance
    } });
export interface TotalObjectStorageRebatesArguments {
    self: RawTransactionArgument<string>;
}
export interface TotalObjectStorageRebatesOptions {
    package: string;
    arguments: TotalObjectStorageRebatesArguments | [
        self: RawTransactionArgument<string>
    ];
}
export function totalObjectStorageRebates(options: TotalObjectStorageRebatesOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::storage_fund::StorageFund`
    ] satisfies string[];
    const parameterNames = ["self"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'storage_fund',
        function: 'total_object_storage_rebates',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface TotalBalanceArguments {
    self: RawTransactionArgument<string>;
}
export interface TotalBalanceOptions {
    package: string;
    arguments: TotalBalanceArguments | [
        self: RawTransactionArgument<string>
    ];
}
export function totalBalance(options: TotalBalanceOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::storage_fund::StorageFund`
    ] satisfies string[];
    const parameterNames = ["self"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'storage_fund',
        function: 'total_balance',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}