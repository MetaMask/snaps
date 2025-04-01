import { any, is, string } from '@metamask/superstruct';

import { nonEmptyRecord } from './structs';

describe('nonEmptyRecord', () => {
  it.each([[1, 2, 3], { foo: 'bar' }])('validates "%p"', (value) => {
    const struct = nonEmptyRecord(string(), any());

    expect(is(value, struct)).toBe(true);
  });

  it.each(['foo', 42, null, undefined, [], {}])(
    'does not validate "%p"',
    (value) => {
      const struct = nonEmptyRecord(string(), any());

      expect(is(value, struct)).toBe(false);
    },
  );
});
