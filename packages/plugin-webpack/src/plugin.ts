import {
  postProcessBundle,
  PostProcessOptions,
  SourceMap,
} from '@metamask/snap-utils';
import { Compiler } from 'webpack';
import { RawSource, SourceMapSource } from 'webpack-sources';

const PLUGIN_NAME = 'SnapsWebpackPlugin';

export type Options = PostProcessOptions;

export default class SnapsWebpackPlugin {
  public readonly options: Partial<Options>;

  /**
   * Construct an instance of the plugin.
   *
   * @param options - The post-process options.
   * @param options.stripComments - Whether to strip comments. Defaults to `true`.
   * @param options.transformHtmlComments - Whether to transform HTML comments.
   * Defaults to `true`.
   */
  constructor(options: Partial<Options> = {}) {
    this.options = options;
  }

  /**
   * Apply the plugin to the Webpack compiler. Hooks into the `processAssets`
   * stage to process the bundle.
   *
   * @param compiler - The Webpack compiler.
   */
  apply(compiler: Compiler) {
    const { devtool } = compiler.options;

    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.processAssets.tap(PLUGIN_NAME, (assets) => {
        Object.keys(assets).forEach((assetName) => {
          const asset = assets[assetName];
          const processed = postProcessBundle(asset.source() as string, {
            ...this.options,
            sourceMap: Boolean(devtool),
            inputSourceMap: devtool ? (asset.map() as SourceMap) : undefined,
          });

          if (processed) {
            const replacement = processed.sourceMap
              ? new SourceMapSource(
                  processed.code,
                  assetName,
                  processed.sourceMap,
                )
              : new RawSource(processed.code);

            // For some reason the type of `RawSource` is not compatible with Webpack's own
            // `Source`, but works fine when casting it to `any`.
            compilation.updateAsset(assetName, replacement as any);
          }
        });
      });
    });
  }
}
