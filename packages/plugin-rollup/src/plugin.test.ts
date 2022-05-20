/* eslint-disable jest/no-restricted-matchers */

import { rollup } from 'rollup';
import virtual from '@rollup/plugin-virtual';
import snaps from './plugin';

describe('snaps', () => {
  it('processes files using Rollup', async () => {
    const bundler = await rollup({
      input: 'foo',
      plugins: [
        virtual({
          foo: `
            const foo = 'bar';
            console.log(foo);
          `,
        }),
        snaps(),
      ],
    });

    const bundle = await bundler.generate({});
    await bundler.close();

    const { code } = bundle.output[0];
    expect(code).toMatchSnapshot();
  });

  it('applies a transform', async () => {
    const bundler = await rollup({
      input: 'foo',
      plugins: [
        virtual({
          foo: `
            // foo bar
            /* baz qux */
            const foo = 'bar';
            console.log(foo);
          `,
        }),
        snaps(),
      ],
    });

    const bundle = await bundler.generate({});
    await bundler.close();

    const { code } = bundle.output[0];
    expect(code).toMatchSnapshot();
    expect(code).not.toContain(`// foo bar`);
    expect(code).not.toContain(`/* baz qux */`);
  });

  it('forwards the options', async () => {
    const bundler = await rollup({
      input: 'foo',
      plugins: [
        virtual({
          foo: `
            // foo bar
            /* baz qux */
            const foo = 'bar';
            console.log(foo);
          `,
        }),
        snaps({ stripComments: false }),
      ],
    });

    const bundle = await bundler.generate({});
    await bundler.close();

    const { code } = bundle.output[0];
    expect(code).toMatchSnapshot();
    expect(code).toContain(`// foo bar`);
    expect(code).toContain(`/* baz qux */`);
  });

  it('runs on the entire bundle', async () => {
    const bundler = await rollup({
      input: 'foo',
      plugins: [
        virtual({
          foo: `
            import { bar } from 'bar';

            // Sets foo to bar
            const foo = bar;
            console.log(foo);
          `,
          bar: `
            // Returns baz
            export const bar = 'baz';
          `,
        }),
        snaps(),
      ],
    });

    const bundle = await bundler.generate({});
    await bundler.close();

    const { code } = bundle.output[0];
    expect(code).toMatchSnapshot();
    expect(code).not.toContain(`// Sets foo to bar`);
    expect(code).not.toContain(`// Returns baz`);
  });
});
