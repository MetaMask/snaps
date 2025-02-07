import type { Compiler } from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

import { getBundleAnalyzerPort } from './utils';

jest.mock('webpack-bundle-analyzer', () => ({
  BundleAnalyzerPlugin: jest.fn(),
}));

describe('getBundleAnalyzerPort', () => {
  it('returns the port of the bundle analyzer server', async () => {
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

    const port = await getBundleAnalyzerPort(compiler);
    expect(port).toBe(8888);
  });

  it('returns the port of the bundle analyzer server that returns an object', async () => {
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
        address: () => {
          return {
            port: 8888,
          };
        },
      },
    });

    const port = await getBundleAnalyzerPort(compiler);
    expect(port).toBe(8888);
  });

  it('returns undefined if the bundle analyzer server is not available', async () => {
    const compiler: Compiler = {
      // @ts-expect-error: Mock `Compiler` object.
      options: {
        plugins: [new BundleAnalyzerPlugin()],
      },
    };

    const port = await getBundleAnalyzerPort(compiler);
    expect(port).toBeUndefined();
  });
});
