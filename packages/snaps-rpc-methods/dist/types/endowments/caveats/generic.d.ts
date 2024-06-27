import type { PermissionConstraint, PermissionValidatorConstraint } from '@metamask/permission-controller';
import type { Json } from '@metamask/utils';
export declare type CaveatMapperReturnValue = Pick<PermissionConstraint, 'caveats'>;
export declare type CaveatMapperFunction = (value: Json) => CaveatMapperReturnValue;
/**
 * Create a generic permission validator that validates the presence of certain caveats.
 *
 * This validator only validates the types of the caveats, not the values.
 *
 * @param caveatsToValidate - A list of objects that represent caveats.
 * @param caveatsToValidate.type - The string defining the caveat type.
 * @param caveatsToValidate.optional - An optional boolean flag that defines
 * whether the caveat is optional or not.
 * @returns A function that validates a permission.
 */
export declare function createGenericPermissionValidator(caveatsToValidate: {
    type: string;
    optional?: boolean;
}[]): PermissionValidatorConstraint;
