import { flatMap } from './flatMap';

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
