import {
  checkManifest,
  evalBundle,
  PostProcessWarning,
} from '@metamask/snaps-utils';
import {
  DEFAULT_SNAP_BUNDLE,
  getSnapManifest,
} from '@metamask/snaps-utils/test-utils';
import type { RollupVirtualOptions } from '@rollup/plugin-virtual';
import virtual from '@rollup/plugin-virtual';
import assert from 'assert';
import { promises as fs } from 'fs';
import type { OutputOptions, RollupOutput } from 'rollup';
import { rollup } from 'rollup';

import type { Options } from './plugin';
import snaps from './plugin';

jest.mock('fs');

jest.mock('@metamask/snaps-utils', () => ({
  ...jest.requireActual('@metamask/snaps-utils'),
  evalBundle: jest.fn(),
  checkManifest: jest.fn(),
}));

type BundleOptions = {
  code?: string;
  options?: Options;
  files?: RollupVirtualOptions;
  outputOptions?: OutputOptions;
  writeOptions?: OutputOptions;
  input?: string;
};

const bundle = async ({
  code = DEFAULT_SNAP_BUNDLE,
  options = { eval: false, manifestPath: undefined },
  files,
  outputOptions = {},
  writeOptions = { file: 'bundle.js' },
  input = 'foo',
}: BundleOptions = {}): Promise<RollupOutput> => {
  const bundler = await rollup({
    input,
    plugins: [
      virtual({
        foo: code,
        ...files,
      }),
      snaps(options),
    ],
    onwarn: (warning) => console.log(warning.message),
  });

  const output = await bundler.generate(outputOptions);
  await bundler.write(writeOptions);

  await bundler.close();

  return output;
};

describe('snaps', () => {
  it('processes files using Rollup', async () => {
    const { output } = await bundle();

    const { code } = output[0];
    expect(code).toMatchInlineSnapshot(`
      "module.exports.onRpcRequest = ({
        request
      }) => {
        console.log("Hello, world!");
        const {
          method,
          id
        } = request;
        return method + id;
      };
      "
    `);
  });

  it('applies a transform', async () => {
    const { output } = await bundle({
      code: `
        // foo bar
        /* baz qux */
        const foo = 'bar';
        console.log(foo);
      `,
    });

    const { code } = output[0];
    expect(code).toMatchInlineSnapshot(`
      "const foo = 'bar';
      console.log(foo);
      "
    `);
  });

  it('forwards the options', async () => {
    const { output } = await bundle({
      code: `
        // foo bar
        /* baz qux */
        const foo = 'bar';
        console.log(foo);
      `,
      options: {
        eval: false,
        manifestPath: undefined,
        stripComments: false,
      },
    });

    const { code } = output[0];
    expect(code).toMatchInlineSnapshot(`
      "// foo bar
      /* baz qux */
      const foo = 'bar';
      console.log(foo);
      "
    `);
  });

  it('runs on the entire bundle', async () => {
    const { output } = await bundle({
      code: `
        import { bar } from 'bar';

        // Sets foo to bar
        const foo = bar;
        console.log(foo);
      `,
      files: {
        bar: `
          // Returns baz
          export const bar = 'baz';
        `,
      },
    });

    const { code } = output[0];
    expect(code).toMatchInlineSnapshot(`
      "const bar = 'baz';
      const foo = bar;
      console.log(foo);
      "
    `);
  });

  it('logs post processing warnings', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);

    await bundle({
      code: 'console.log(Math.random());',
    });

    expect(console.log).toHaveBeenCalledWith(
      `Bundle Warning: Processing of the Snap bundle completed with warnings.\n${PostProcessWarning.UnsafeMathRandom}`,
    );
  });

  it('generates a source map', async () => {
    await fs.writeFile('/source-map.ts', DEFAULT_SNAP_BUNDLE);

    const { output } = await bundle({
      // Rollup doesn't generate source maps from virtual files for some reason,
      // so we need to use a real file.
      input: '/source-map.ts',
      outputOptions: {
        sourcemap: true,
      },
    });

    const { map } = output[0];
    assert(map);

    const { sources, ...partialMap } = map;

    expect(partialMap).toMatchInlineSnapshot(`
      {
        "file": "source-map.js",
        "mappings": "AACEA,MAAM,CAACC,OAAO,CAACC,YAAY,GAAG,CAAC;EAAEC;AAAO,CAAE,KAAK;EAC7CC,OAAO,CAACC,GAAG,CAAC,eAAe,CAAC;EAE5B,MAAM;IAAEC,MAAM;IAAEC;EAAI,CAAA,GAAGJ,OAAO;EAC9B,OAAOG,MAAM,GAAGC,EAAE;AACnB,CAAA",
        "names": [
          "module",
          "exports",
          "onRpcRequest",
          "request",
          "console",
          "log",
          "method",
          "id",
        ],
        "sourcesContent": [
          "
        module.exports.onRpcRequest = ({ request }) => {
          console.log("Hello, world!");

          const { method, id } = request;
          return method + id;
        };
      ",
        ],
        "version": 3,
      }
    `);
  });

  it('evals the bundle if configured', async () => {
    const mock = evalBundle as jest.MockedFunction<typeof evalBundle>;
    mock.mockResolvedValue(null);

    await bundle({
      options: {
        eval: true,
        manifestPath: undefined,
      },
    });

    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith('bundle.js');
  });

  it('checks the manifest if configured', async () => {
    const mock = checkManifest as jest.MockedFunction<typeof checkManifest>;
    mock.mockResolvedValue({
      manifest: getSnapManifest(),
      errors: [],
      warnings: [],
    });

    await bundle({
      options: {
        eval: false,
        manifestPath: '/snap.manifest.json',
      },
    });

    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith('/', true, expect.any(String));
  });

  it('does not fix the manifest if configured', async () => {
    const mock = checkManifest as jest.MockedFunction<typeof checkManifest>;
    mock.mockResolvedValue({
      manifest: getSnapManifest(),
      errors: [],
      warnings: [],
    });

    await bundle({
      options: {
        eval: false,
        manifestPath: '/snap.manifest.json',
        writeManifest: false,
      },
    });

    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith('/', false, expect.any(String));
  });

  it('logs manifest errors if writeManifest is disabled', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    const mock = checkManifest as jest.MockedFunction<typeof checkManifest>;
    mock.mockResolvedValue({
      manifest: getSnapManifest(),
      errors: ['foo', 'bar'],
      warnings: [],
    });

    await expect(
      bundle({
        options: {
          eval: false,
          manifestPath: '/snap.manifest.json',
          writeManifest: false,
        },
      }),
    ).rejects.toThrow('Manifest Error: The manifest is invalid.\nfoo\nbar');
  });

  it('logs manifest warnings', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);

    const mock = checkManifest as jest.MockedFunction<typeof checkManifest>;
    mock.mockResolvedValue({
      manifest: getSnapManifest(),
      errors: [],
      warnings: ['foo', 'bar'],
    });

    await bundle({
      options: {
        eval: false,
        manifestPath: '/snap.manifest.json',
        writeManifest: false,
      },
    });

    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      'Manifest Warning: Validation of snap.manifest.json completed with warnings.\nfoo\nbar',
    );
  });

  it('forwards errors', async () => {
    const mock = evalBundle as jest.MockedFunction<typeof evalBundle>;
    mock.mockRejectedValue(new Error('foo'));

    await expect(
      bundle({
        options: {
          eval: true,
          manifestPath: undefined,
        },
      }),
    ).rejects.toThrow('foo');
  });

  it('shows a warning if no output file is configured', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);

    await bundle({
      writeOptions: {
        dir: 'dist',
      },
    });

    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      'No output file specified, skipping bundle validation.',
    );
  });
});
