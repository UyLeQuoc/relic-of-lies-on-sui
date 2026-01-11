/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { MoveStruct } from '../../../utils/index';
import { bcs } from '@mysten/sui/bcs';
import * as object from '../sui/object';
const $moduleName = '0x3::validator_cap';
export const UnverifiedValidatorOperationCap = new MoveStruct({ name: `${$moduleName}::UnverifiedValidatorOperationCap`, fields: {
        id: object.UID,
        authorizer_validator_address: bcs.Address
    } });
export const ValidatorOperationCap = new MoveStruct({ name: `${$moduleName}::ValidatorOperationCap`, fields: {
        authorizer_validator_address: bcs.Address
    } });