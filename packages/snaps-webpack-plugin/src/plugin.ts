import pathUtils from 'path';
import { promisify } from 'util';
import {
  checkManifest,
  evalBundle,
  postProcessBundle,
  PostProcessOptions,
  SourceMap,
} from '@metamask/snap-utils';
import { assert } from '@metamask/utils';
import { Compiler, WebpackError } from 'webpack';
import { RawSource, SourceMapSource } from 'webpack-sources';

const PLUGIN_NAME = 'SnapsWebpackPlugin';

type PluginOptions = {
  eval?: boolean;
  manifestPath?: string;
  writeManifest?: boolean;
};

export type Options = PluginOptions &
  Omit<PostProcessOptions, 'sourceMap' | 'inputSourceMap'>;

export default class SnapsWebpackPlugin {
  public readonly options: Partial<Options>;

  /**
   * Construct an instance of the plugin.
   *
   * @param options - The post-process options.
   * @param options.stripComments - Whether to strip comments. Defaults to
   * `true`.
   * @param options.eval - Whether to evaluate the bundle to test SES
   * compatibility. Defaults to `true`.
   * @param options.manifestPath - The path to the manifest file. If provided,
   * the manifest will be validated. Defaults to
   * `process.cwd() + '/snap.manifest.json'`.
   * @param options.writeManifest - Whether to fix the manifest.
   * Defaults to `true`.
   */
  constructor(options?: Partial<Options>) {
    this.options = {
      eval: true,
      manifestPath: pathUtils.join(process.cwd(), 'snap.manifest.json'),
      writeManifest: true,
      ...options,
    };
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
        });
      });
    });

    compiler.hooks.afterEmit.tapPromise(PLUGIN_NAME, async (compilation) => {
      const file = compilation
        .getAssets()
        .find((asset) => asset.name.endsWith('.js'));

      assert(file);

      assert(compilation.outputOptions.path);
      const outputPath = compilation.outputOptions.path;

      const filePath = pathUtils.join(outputPath, file.name);

      if (this.options.eval) {
        await evalBundle(filePath);
      }

      if (this.options.manifestPath) {
        const content = await promisify(compiler.outputFileSystem.readFile)(
          filePath,
        );
        assert(content);
        const { errors, warnings } = await checkManifest(
          pathUtils.dirname(this.options.manifestPath),
          this.options.writeManifest,
          content.toString(),
        );

        if (!this.options.writeManifest && errors.length > 0) {
          throw new Error(
            `Manifest Error: The manifest is invalid.\n${errors.join('\n')}`,
          );
        }

        if (warnings.length > 0) {
          compilation.warnings.push(
            new WebpackError(
              `${PLUGIN_NAME}: Manifest Warning: Validation of snap.manifest.json completed with warnings.\n${warnings.join(
                '\n',
              )}`,
            ),
          );
        }
      }
    });
  }
}
