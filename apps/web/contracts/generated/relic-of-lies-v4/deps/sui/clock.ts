/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/**
 * APIs for accessing time from move calls, via the `Clock`: a unique shared object
 * that is created at 0x6 during genesis.
 */

import { MoveStruct, normalizeMoveArguments } from '../../../utils/index';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import * as object from './object';
const $moduleName = '0x2::clock';
export const Clock = new MoveStruct({ name: `${$moduleName}::Clock`, fields: {
        id: object.UID,
        /**
         * The clock's timestamp, which is set automatically by a system transaction every
         * time consensus commits a schedule, or by `sui::clock::increment_for_testing`
         * during testing.
         */
        timestamp_ms: bcs.u64()
    } });
export interface TimestampMsArguments {
}
export interface TimestampMsOptions {
    package: string;
    arguments?: TimestampMsArguments | [
    ];
}
/**
 * The `clock`'s current timestamp as a running total of milliseconds since an
 * arbitrary point in the past.
 */
export function timestampMs(options: TimestampMsOptions) {
    const packageAddress = options.package;
    const argumentsTypes = [
        `${packageAddress}::clock::Clock`
    ] satisfies string[];
    const parameterNames: string[] = [];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'clock',
        function: 'timestamp_ms',
        arguments: normalizeMoveArguments(options.arguments ?? [], argumentsTypes, parameterNames),
    });
}