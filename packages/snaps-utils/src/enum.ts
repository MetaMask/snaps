import type { EnumToUnion } from '@metamask/snaps-sdk/internals';
import type { Struct } from 'superstruct';

import { literal } from './structs';

/**
 * Superstruct struct for validating an enum value. This allows using both the
 * enum string values and the enum itself as values.
 *
 * @param constant - The enum to validate against.
 * @returns The superstruct struct.
 */
export function enumValue<Type extends string>(
  constant: Type,
): Struct<EnumToUnion<Type>, null> {
  return literal(constant as EnumToUnion<Type>);
}
