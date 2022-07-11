/* eslint-disable jest/no-restricted-matchers */

import * as path from 'path';
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

  it('generates a source map', async () => {
    const bundler = await rollup({
      // Rollup doesn't generate source maps from virtual files for some reason,
      // so we need to use a real file.
      input: path.resolve(__dirname, './__fixtures__/source-map.ts'),
      output: {
        sourcemap: true,
      },
      plugins: [snaps()],
    });

    const bundle = await bundler.generate({ sourcemap: true });
    await bundler.close();

    const { map } = bundle.output[0];
    expect(map).toMatchInlineSnapshot(`
      SourceMap {
        "file": "source-map.js",
        "mappings": "AAGA,MAAMA,GAAG,GAAG,KAAZ,CAAA;AACAC,OAAO,CAACC,GAAR,CAAYF,GAAZ,CAAA",
        "names": Array [
          "foo",
          "console",
          "log",
        ],
        "sources": Array [
          "src/__fixtures__/source-map.ts",
        ],
        "sourcesContent": Array [
          "// This file is only used for testing source map generation.

      // eslint-disable-next-line import/unambiguous
      const foo = 'bar';
      console.log(foo);
      ",
        ],
        "version": 3,
      }
    `);
  });
});
