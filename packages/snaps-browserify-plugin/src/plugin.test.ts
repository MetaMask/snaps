// Allow Jest snapshots because the test outputs are illegible.
/* eslint-disable jest/no-restricted-matchers */

import { Readable } from 'stream';
import pathUtils from 'path';
import os from 'os';
import browserify, { Options as BrowserifyOptions } from 'browserify';
import concat from 'concat-stream';
import {
  DEFAULT_SNAP_BUNDLE,
  getSnapManifest,
} from '@metamask/snap-utils/test-utils';
import { checkManifest, evalBundle } from '@metamask/snap-utils';
import plugin, { Options, SnapsBrowserifyTransform } from './plugin';

jest.mock('fs');

jest.mock('@metamask/snap-utils', () => ({
  ...jest.requireActual('@metamask/snap-utils'),
  evalBundle: jest.fn(),
  checkManifest: jest.fn(),
}));

/**
 * Takes a string value and pushes it to a readable stream. Used for testing
 * purposes.
 *
 * @param value - The value to push to a readable stream.
 * @returns The readable stream containing the value.
 */
const toStream = (value: string) => {
  const readable = new Readable();
  readable.push(value);
  readable.push(null);

  return readable;
};

type BundleOptions = {
  code?: string;
  options?: Options;
  browserifyOptions?: BrowserifyOptions;
};

const bundle = async ({
  code = DEFAULT_SNAP_BUNDLE,
  options = { eval: false, manifestPath: undefined },
  browserifyOptions,
}: BundleOptions = {}) => {
  const value = toStream(code);

  return await new Promise((resolve, reject) => {
    const bundler = browserify(browserifyOptions);

    bundler.plugin<Options>(plugin, options);
    bundler.add(value);

    bundler.bundle((error, src) => {
      if (error) {
        return reject(error);
      }

      return resolve(src.toString('utf-8'));
    });
  });
};

describe('SnapsBrowserifyTransform', () => {
  it('processes the data', async () => {
    const transform = new SnapsBrowserifyTransform({ eval: false });
    const stream = toStream(` const foo = 'bar'; `);

    const result = await new Promise((resolve) => {
      const concatStream = concat((value) => resolve(value.toString('utf-8')));

      stream.pipe(transform).pipe(concatStream);
    });

    expect(result).toBe(`const foo = 'bar';`);
  });

  it('works without options', async () => {
    const transform = new SnapsBrowserifyTransform();
    const stream = toStream(` const foo = 'bar'; `);

    const result = await new Promise((resolve) => {
      const concatStream = concat((value) => resolve(value.toString('utf-8')));

      stream.pipe(transform).pipe(concatStream);
    });

    expect(result).toBe(`const foo = 'bar';`);
  });
});

describe('plugin', () => {
  it('processes files using Browserify', async () => {
    const result = await bundle();

    expect(result).toMatchSnapshot();
  });

  it('applies a transform', async () => {
    const result = await bundle({
      code: `
        // foo bar
        /* baz qux */
        const foo = 'bar';
      `,
    });

    expect(result).toMatchSnapshot();
  });

  it('forwards the options', async () => {
    const result = await bundle({
      code: `
        // foo bar
        /* baz qux */
        const foo = 'bar';
      `,
      options: {
        eval: false,
        manifestPath: undefined,
        stripComments: false,
      },
    });

    expect(result).toMatchSnapshot();
  });

  it('generates a source map', async () => {
    const result = await bundle({ browserifyOptions: { debug: true } });

    expect(result).toMatchSnapshot();
  });

  it('evals the bundle if configured', async () => {
    const mock = evalBundle as jest.MockedFunction<typeof evalBundle>;
    mock.mockResolvedValue(null);

    await bundle({ options: { eval: true, manifestPath: undefined } });

    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith(
      pathUtils.join(os.tmpdir(), 'snaps-bundle.js'),
    );
  });

  it('checks the manifest if configured', async () => {
    const mock = checkManifest as jest.MockedFunction<typeof checkManifest>;
    mock.mockResolvedValue({
      manifest: getSnapManifest(),
      warnings: [],
      errors: [],
    });

    await bundle({ options: { eval: false, manifestPath: '/foo' } });

    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith('/', true, expect.any(String));
  });

  it('does not fix the manifest if configured', async () => {
    const mock = checkManifest as jest.MockedFunction<typeof checkManifest>;
    mock.mockResolvedValue({
      manifest: getSnapManifest(),
      warnings: [],
      errors: [],
    });

    await bundle({
      options: { eval: false, manifestPath: '/foo', writeManifest: false },
    });

    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith('/', false, expect.any(String));
  });

  it('logs manifest errors if writeManifest is disabled and exits with error code 1', async () => {
    const mock = checkManifest as jest.MockedFunction<typeof checkManifest>;
    mock.mockResolvedValue({
      manifest: getSnapManifest(),
      warnings: [],
      errors: ['foo', 'bar'],
    });

    await expect(
      bundle({
        options: { eval: false, manifestPath: 'foo', writeManifest: false },
      }),
    ).rejects.toThrow('Manifest Error: The manifest is invalid.\nfoo\nbar');
  });

  it('logs manifest warnings', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);

    const mock = checkManifest as jest.MockedFunction<typeof checkManifest>;
    mock.mockResolvedValue({
      manifest: getSnapManifest(),
      warnings: ['foo', 'bar'],
      errors: [],
    });

    await bundle({
      options: { eval: false, manifestPath: 'foo' },
    });

    expect(console.log).toHaveBeenCalledTimes(3);
    expect(console.log).toHaveBeenCalledWith('Manifest Warning: foo');
    expect(console.log).toHaveBeenCalledWith('Manifest Warning: bar');
  });

  it('forwards errors', async () => {
    const mock = evalBundle as jest.MockedFunction<typeof evalBundle>;
    mock.mockRejectedValue('foo');

    const value = toStream(DEFAULT_SNAP_BUNDLE);

    const error: Error = await new Promise((resolve) => {
      const bundler = browserify();

      bundler.plugin<Options>(plugin, {
        eval: true,
      });
      bundler.add(value);

      bundler.bundle((err) => {
        // To test the error, the promise is resolved with the error, rather
        // than rejecting it.
        resolve(err);
      });
    });

    expect(error.message).toBe('Snap evaluation error: foo');
  });
});
