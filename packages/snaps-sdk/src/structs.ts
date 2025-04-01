import type { Struct } from '@metamask/superstruct';
import { record, refine } from '@metamask/superstruct';

/**
 * Refine a struct to be a non-empty record.
 *
 * @param Key - The struct for the record key.
 * @param Value - The struct for the record value.
 * @returns The refined struct.
 */
export function nonEmptyRecord<Key extends string, Value>(
  Key: Struct<Key>,
  Value: Struct<Value>,
) {
  return refine(record(Key, Value), 'Non-empty record', (value) => {
    return (
      (Array.isArray(value) && value.length > 0) ||
      Object.keys(value).length > 0
    );
  });
}
