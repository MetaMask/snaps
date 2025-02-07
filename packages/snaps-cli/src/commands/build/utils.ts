import type { Compiler } from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

/**
 * Get the port of the bundle analyzer server.
 *
 * @param compiler - The Webpack compiler.
 * @returns The port of the bundle analyzer server.
 */
export async function getBundleAnalyzerPort(compiler: Compiler) {
  const analyzerPlugin = compiler.options.plugins.find(
    (plugin): plugin is BundleAnalyzerPlugin =>
      plugin instanceof BundleAnalyzerPlugin,
  );

  if (analyzerPlugin?.server) {
    const { http } = await analyzerPlugin.server;

    const address = http.address();
    if (typeof address === 'string') {
      const { port } = new URL(address);
      return parseInt(port, 10);
    }

    return address?.port;
  }

  return undefined;
}
