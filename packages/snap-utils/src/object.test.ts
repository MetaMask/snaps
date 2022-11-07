import { fromEntries } from './object';

describe('fromEntries', () => {
  it('returns an object from an entry array', () => {
    const entries = [
      ['a', 1],
      ['b', 2],
    ] as const;

    const obj = fromEntries(entries);
    expect(obj).toStrictEqual({ a: 1, b: 2 });
  });
});
