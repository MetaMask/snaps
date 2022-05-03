import { postProcess, PostProcessOptions } from '@metamask/snap-utils';
import { Compiler, WebpackPluginInstance } from 'webpack';
import { RawSource } from 'webpack-sources';

const PLUGIN_NAME = 'SnapWebpackPlugin';

export type Options = PostProcessOptions;

export default class SnapWebpackPlugin implements WebpackPluginInstance {
  public readonly options: Partial<Options>;

  constructor(options: Partial<Options> = {}) {
    this.options = options;
  }

  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.processAssets.tap(PLUGIN_NAME, (assets) => {
        Object.keys(assets).forEach((assetName) => {
          const asset = assets[assetName];
          const processed = postProcess(asset.source() as string, this.options);

          if (processed) {
            // For some reason the type of `RawSource` is not compatible with Webpack's own
            // `Source`, but works fine when casting it to `any`.
            compilation.updateAsset(assetName, new RawSource(processed) as any);
          }
        });
      });
    });
  }
}
