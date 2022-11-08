// Allow Jest snapshots because the test outputs are illegible.
/* eslint-disable jest/no-restricted-matchers */

import webpack, { Stats, Configuration } from 'webpack';
import { createFsFromVolume, IFs, Volume } from 'memfs';
import { IPromisesAPI } from 'memfs/lib/promises';
import {
  DEFAULT_SNAP_BUNDLE,
  getSnapManifest,
} from '@metamask/snap-utils/test-utils';
import { checkManifest, evalBundle } from '@metamask/snap-utils';
import SnapsWebpackPlugin, { Options } from './plugin';

jest.mock('@metamask/snap-utils', () => ({
  ...jest.requireActual('@metamask/snap-utils'),
  evalBundle: jest.fn(),
  checkManifest: jest.fn(),
}));

type BundleOptions = {
  code?: string;
  options?: Options;
  fileSystem?: IFs;
  webpackOptions?: Configuration;
};

const bundle = async ({
  code = DEFAULT_SNAP_BUNDLE,
  options = { eval: false, manifestPath: undefined },
  fileSystem = createFsFromVolume(new Volume()),
  webpackOptions,
}: BundleOptions = {}): Promise<{
  code: string;
  fs: IPromisesAPI;
  stats: Stats;
}> => {
  const { promises: fs } = fileSystem;

  const bundler = webpack({
    mode: 'none',
    entry: {
      foo: '/foo.js',
    },
    output: {
      path: '/lib',
      filename: '[name].js',
    },
    plugins: [new SnapsWebpackPlugin(options)],
    ...webpackOptions,
  });

  bundler.inputFileSystem = fileSystem;
  bundler.outputFileSystem = fileSystem;

  await fs.mkdir('/lib', { recursive: true });
  await fs.writeFile('/foo.js', code);

  const outputStats = await new Promise<Stats>((resolve, reject) =>
    bundler.run((error, stats) => {
      if (error || !stats) {
        return reject(error);
      }

      return resolve(stats);
    }),
  );

  return {
    code: (await fs.readFile('/lib/foo.js', 'utf-8')) as string,
    fs,
    stats: outputStats,
  };
};

describe('SnapsWebpackPlugin', () => {
  it('processes files using Webpack', async () => {
    const { code } = await bundle();

    expect(code).toMatchSnapshot();
  });

  it('applies a transform', async () => {
    const { code } = await bundle({
      code: `
        // foo bar
        /* baz qux */
        const foo = 'bar';
      `,
    });

    expect(code).toMatchSnapshot();
    expect(code).not.toContain(`// foo bar`);
    expect(code).not.toContain(`/* baz qux */`);
  });

  it('forwards the options', async () => {
    const { code } = await bundle({
      code: `
        // foo bar
        /* baz qux */
        const foo = 'bar';
      `,
      options: {
        stripComments: false,
        eval: false,
        manifestPath: undefined,
      },
    });

    expect(code).toMatchSnapshot();
    expect(code).toContain(`// foo bar`);
    expect(code).toContain(`/* baz qux */`);
  });

  it('runs on the entire bundle', async () => {
    const fileSystem = createFsFromVolume(new Volume());
    const { promises: fs } = fileSystem;

    await fs.writeFile(
      '/bar.js',
      `
        // Returns baz
        export const bar = 'baz';
     `,
    );

    const { code } = await bundle({
      code: `
        import { bar } from './bar';

        // Sets foo to bar
        const foo = bar;
      `,
      fileSystem,
    });

    expect(code).toMatchSnapshot();
    expect(code).not.toContain(`// Sets foo to bar`);
    expect(code).not.toContain(`// Returns baz`);
  });

  it('generates a source map', async () => {
    const { fs } = await bundle({
      webpackOptions: {
        devtool: 'source-map',
      },
    });

    const map = await fs.readFile('/lib/foo.js.map', 'utf-8');
    expect(map).toMatchSnapshot();
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
    expect(mock).toHaveBeenCalledWith('/lib/foo.js');
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
    const mock = checkManifest as jest.MockedFunction<typeof checkManifest>;
    mock.mockResolvedValue({
      manifest: getSnapManifest(),
      errors: [],
      warnings: ['foo', 'bar'],
    });

    const { stats } = await bundle({
      options: {
        eval: false,
        manifestPath: '/snap.manifest.json',
        writeManifest: false,
      },
    });

    expect(stats.toJson().warnings?.[0].message).toMatch(
      'SnapsWebpackPlugin: Manifest Warning: Validation of snap.manifest.json completed with warnings.\n' +
        'foo\n' +
        'bar',
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
});
