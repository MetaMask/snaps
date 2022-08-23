import { flatMap } from './flatMap';

describe('flatMap', () => {
  it('flattens and maps', () => {
    expect(flatMap([1, 2, [3], [4, 5], 6, []], (num) => num)).toStrictEqual([
      1, 2, 3, 4, 5, 6,
    ]);

    expect(
      flatMap([1, 2, [3], [4, 5], 6, []], (num) =>
        Array.isArray(num) ? num : num * 2,
      ),
    ).toStrictEqual([2, 4, 3, 4, 5, 12]);
  });
});
