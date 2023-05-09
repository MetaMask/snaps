import { assertStruct, AssertionErrorConstructor } from '@metamask/utils';
import { array, string, Infer, size } from 'superstruct';

export const LookupProtocolsStruct = size(array(string()), 1, Infinity);
export type LookupProtocols = Infer<typeof LookupProtocolsStruct>;

/**
 * Assert that the given value is a {@link LookupProtocols} array.
 *
 * @param value - The value to check.
 * @param ErrorWrapper - An optional error wrapper to use. Defaults to
 * {@link AssertionError}.
 * @throws If the value is not a valid {@link LookupProtocols} array.
 */
export function assertIsLookupProtocols(
  value: unknown,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ErrorWrapper?: AssertionErrorConstructor,
): asserts value is LookupProtocols {
  assertStruct(
    value,
    LookupProtocolsStruct,
    'Invalid lookup protocols.',
    ErrorWrapper,
  );
}
