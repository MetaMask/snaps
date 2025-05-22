import { DEFAULT_SNAP_BUNDLE } from '@metamask/snaps-utils/test-utils';
import fs from 'fs';
import type { Compiler } from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

import { buildHandler } from './build';
import { build } from './implementation';
import { getMockConfig } from '../../test-utils';

jest.mock('fs');
jest.mock('./implementation');

jest.mock('webpack-bundle-analyzer', () => ({
  BundleAnalyzerPlugin: jest.fn(),
}));

describe('buildHandler', () => {
  it('builds a Snap', async () => {
    await fs.promises.writeFile('/input.js', DEFAULT_SNAP_BUNDLE);

    jest.spyOn(console, 'log').mockImplementation();
    const config = getMockConfig({
      input: '/input.js',
      output: {
        path: '/foo',
        filename: 'output.js',
      },
    });

    await buildHandler(config);

    expect(process.exitCode).not.toBe(1);
    expect(build).toHaveBeenCalledWith(config, {
      analyze: false,
      evaluate: true,
      spinner: expect.any(Object),
    });
  });

  it('analyzes a Snap bundle', async () => {
    await fs.promises.writeFile('/input.js', DEFAULT_SNAP_BUNDLE);

    jest.spyOn(console, 'log').mockImplementation();
    const config = getMockConfig({
      input: '/input.js',
      output: {
        path: '/foo',
        filename: 'output.js',
      },
    });

    const compiler: Compiler = {
      // @ts-expect-error: Mock `Compiler` object.
      options: {
        plugins: [new BundleAnalyzerPlugin()],
      },
    };

    const plugin = jest.mocked(BundleAnalyzerPlugin);
    const instance = plugin.mock.instances[0];

    // @ts-expect-error: Partial `server` mock.
    instance.server = Promise.resolve({
      http: {
        address: () => 'http://localhost:8888',
      },
    });

    jest.mocked(build).mockResolvedValueOnce(compiler);

    await buildHandler(config, true);

    expect(process.exitCode).not.toBe(1);
    expect(build).toHaveBeenCalledWith(config, {
      analyze: true,
      evaluate: true,
      spinner: expect.any(Object),
    });

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining(
        'Bundle analyzer running at http://localhost:8888.',
      ),
    );
  });

  it('does not evaluate if the evaluate option is set to false', async () => {
    await fs.promises.writeFile('/input.js', DEFAULT_SNAP_BUNDLE);

    jest.spyOn(console, 'log').mockImplementation();
    const config = getMockConfig({
      input: '/input.js',
      output: {
        path: '/foo',
        filename: 'output.js',
      },
      evaluate: false,
    });

    await buildHandler(config);

    expect(process.exitCode).not.toBe(1);
    expect(build).toHaveBeenCalledWith(config, {
      analyze: false,
      evaluate: false,
      spinner: expect.any(Object),
    });
  });

  it('checks if the input file exists', async () => {
    const log = jest.spyOn(console, 'error').mockImplementation();
    const config = getMockConfig({
      input: 'fake-input-file.js',
    });

    await buildHandler(config);

    expect(process.exitCode).toBe(1);
    expect(log).toHaveBeenCalledWith(
      expect.stringMatching(
        /Input file not found: ".+"\. Make sure that the "input" field in your Snap config is correct\./u,
      ),
    );
  });
});
