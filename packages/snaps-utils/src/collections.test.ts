import { flatMap, includes, indexOf, unique } from './collections';

describe('flatMap', () => {
  it('flattens and maps', () => {
    expect(flatMap([1, 2, [3], [4, 5], 6, []], (value) => value)).toStrictEqual(
      [1, 2, 3, 4, 5, 6],
    );

    expect(
      flatMap([1, 2, [3], [4, 5], 6, []], (value) =>
        Array.isArray(value) ? value : value * 2,
      ),
    ).toStrictEqual([2, 4, 3, 4, 5, 12]);
  });
});

describe('indexOf', () => {
  it.each([42, false, true, 0, -1, '', 'foo', {}, indexOf])(
    'returns -1 if no element found (%#)',
    (value) => {
      expect(indexOf([1, 2, 3, 4, 5], value)).toBe(-1);
    },
  );

  it.each([2, 3, 4, 5, 6])(
    'returns index if the element is found (%#)',
    (value) => {
      expect(indexOf([2, 3, 4, 5, 6], value)).toBe(value - 2);
    },
  );

  it('uses equals function', () => {
    const equals = (a: { foo: number }, b: { foo: number }) => a.foo === b.foo;
    expect(
      indexOf(
        [{ foo: 1 }, { foo: 2 }, { foo: 3 }, { foo: 4 }],
        { foo: 3, bar: 'asd' },
        equals,
      ),
    ).toBe(2);

    expect(
      indexOf([{ foo: 1 }, { foo: 2 }, { foo: 3 }, { foo: 4 }], {
        foo: 5,
        bar: 'asd',
      }),
    ).toBe(-1);
  });

  it('uses strict equality by default', () => {
    expect(indexOf([{}, {}, {}], {})).toBe(-1);
    expect(indexOf(['a', 'b', 'c', 'd'], 'a')).toBe(0);
  });
});

describe('includes', () => {
  it.each([42, false, true, 0, -1, '', 'foo', {}, indexOf])(
    'returns false if no element found (%#)',
    (value) => {
      expect(includes([1, 2, 3, 4, 5], value)).toBe(false);
    },
  );

  it.each([1, 2, 3, 4, 5])('returns true if element found (%#)', (value) => {
    expect(includes([1, 2, 3, 4, 5], value)).toBe(true);
  });

  it('uses equals function', () => {
    const equals = (a: { foo: number }, b: { foo: number }) => a.foo === b.foo;
    expect(
      includes(
        [{ foo: 1 }, { foo: 2 }, { foo: 3 }, { foo: 4 }],
        { foo: 3, bar: 'asd' },
        equals,
      ),
    ).toBe(true);

    expect(
      includes([{ foo: 1 }, { foo: 2 }, { foo: 3 }, { foo: 4 }], {
        foo: 5,
        bar: 'asd',
      }),
    ).toBe(false);
  });

  it('uses strict equality by default', () => {
    expect(includes([{}, {}, {}], {})).toBe(false);
    expect(includes(['a', 'b', 'c', 'd'], 'a')).toBe(true);
  });
});

describe('unique', () => {
  it('does nothing without duplicates', () => {
    expect(unique([1, 2, 3, 4])).toStrictEqual([1, 2, 3, 4]);
  });

  it('creates a copy of an array', () => {
    const array = [1, 1, 2, 2, 3, 3];
    expect(unique(array)).toStrictEqual([1, 2, 3]);
    expect(array).toStrictEqual([1, 1, 2, 2, 3, 3]);
  });

  it('removes duplicates', () => {
    const array = [1, 'a', false, 2, 1, 'b', 'a', true, false];
    expect(unique(array)).toStrictEqual([1, 'a', false, 2, 'b', true]);
  });

  it('uses equals function', () => {
    expect(
      unique(
        [
          { foo: 1, bar: 1 },
          { foo: 1, bar: 2 },
          { foo: 2, bar: 1 },
          { foo: 3, bar: 2 },
          { foo: 2, bar: false },
        ],
        { equals: (a, b) => a.foo === b.foo },
      ),
    ).toStrictEqual([
      { foo: 1, bar: 1 },
      { foo: 2, bar: 1 },
      { foo: 3, bar: 2 },
    ]);
  });

  it('uses strict equality by default', () => {
    expect(unique([{}, {}, {}])).toStrictEqual([{}, {}, {}]);
  });

  it('works with isSorted = true', () => {
    expect(unique([1, 2, 2, 3, 3, 4, 4, 5], { isSorted: true })).toStrictEqual([
      1, 2, 3, 4, 5,
    ]);
  });

  it('works with isSorted = true and equals', () => {
    expect(
      unique([{ foo: 1 }, { foo: 1 }, { foo: 2 }, { foo: 2 }, { foo: 3 }], {
        isSorted: true,
        equals: (a, b) => a.foo === b.foo,
      }),
    ).toStrictEqual([{ foo: 1 }, { foo: 2 }, { foo: 3 }]);
  });
});
