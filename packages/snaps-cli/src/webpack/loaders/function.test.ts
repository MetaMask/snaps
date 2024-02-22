import { resolve } from 'path';

import loader, { getFunctionLoader } from './function';

describe('getFunctionLoader', () => {
  it('returns a loader definition', () => {
    const fn = jest.fn();
    expect(
      getFunctionLoader(fn, {
        foo: 'bar',
      }),
    ).toStrictEqual({
      loader: resolve(__dirname, 'function.ts'),
      options: {
        fn,
        foo: 'bar',
      },
    });
  });
});

describe('loader', () => {
  it('executes the function', async () => {
    const fn = jest.fn();

    await loader.call(
      // @ts-expect-error - Partial `this` object.
      {
        getOptions: () => ({
          fn,
        }),
      },
      'test',
    );

    expect(fn).toHaveBeenCalledWith('test');
  });
});
