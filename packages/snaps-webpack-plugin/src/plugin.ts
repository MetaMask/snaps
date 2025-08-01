import { handlerEndowments } from '@metamask/snaps-rpc-methods';
import { getErrorMessage } from '@metamask/snaps-sdk';
import {
  checkManifest,
  evalBundle,
  logInfo,
  postProcessBundle,
  SnapEvalError,
  useTemporaryFile,
} from '@metamask/snaps-utils/node';
import type { PostProcessOptions, SourceMap } from '@metamask/snaps-utils/node';
import { assert } from '@metamask/utils';
import { blue, dim } from 'chalk';
import pathUtils from 'path';
import { promisify } from 'util';
import type { Compiler } from 'webpack';
import { Compilation, WebpackError } from 'webpack';
import { RawSource, SourceMapSource } from 'webpack-sources';

import { writeManifest } from './manifest';

const PLUGIN_NAME = 'SnapsWebpackPlugin';

type PluginOptions = {
  eval?: boolean;
  manifestPath?: string;
  writeManifest?: boolean;
};

export type Options = PluginOptions &
  Omit<PostProcessOptions, 'sourceMap' | 'inputSourceMap'>;

// Partial copy of `ora` types to avoid a dependency on `ora` in the plugin.
type Spinner = {
  clear(): void;
  frame(): void;
};

export default class SnapsWebpackPlugin {
  public readonly options: Partial<Options>;

  readonly #spinner: Spinner | undefined;

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
   * @param spinner - The spinner to use for logging. For internal use only.
   */
  constructor(options?: Partial<Options>, spinner?: Spinner) {
    this.options = {
      eval: true,
      manifestPath: pathUtils.join(process.cwd(), 'snap.manifest.json'),
      writeManifest: true,
      ...options,
    };

    this.#spinner = spinner;
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
      compilation.hooks.processAssets.tap(
        {
          name: PLUGIN_NAME,
          stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_COMPATIBILITY,
          additionalAssets: true,
        },
        (assets) => {
          Object.keys(assets)
            .filter((assetName) => assetName.endsWith('.js'))
            .forEach((assetName) => {
              const asset = assets[assetName];
              const source = asset.source() as string;
              const sourceMap = asset.map();

              try {
                const processed = postProcessBundle(source, {
                  ...this.options,
                  sourceMap: Boolean(devtool),
                  inputSourceMap: devtool
                    ? (sourceMap as SourceMap)
                    : undefined,
                });

                if (processed.warnings.length > 0) {
                  const webpackErrors = processed.warnings.map(
                    (warning) => new WebpackError(warning),
                  );

                  compilation.warnings.push(...webpackErrors);
                }

                const replacement = processed.sourceMap
                  ? new SourceMapSource(
                      processed.code,
                      assetName,
                      processed.sourceMap,
                      source,
                      sourceMap as SourceMap,
                    )
                  : new RawSource(processed.code);

                // For some reason the type of `RawSource` is not compatible with
                // Webpack's own `Source`, but works fine when casting it to `any`.
                compilation.updateAsset(assetName, replacement as any);
              } catch (error) {
                compilation.errors.push(
                  new WebpackError(getErrorMessage(error)),
                );
              }
            });
        },
      );
    });

    compiler.hooks.afterEmit.tapPromise(PLUGIN_NAME, async (compilation) => {
      const file = compilation
        .getAssets()
        .find((asset) => asset.name.endsWith('.js'));

      assert(file);

      assert(compilation.outputOptions.path);
      const outputPath = compilation.outputOptions.path;

      const filePath = pathUtils.join(outputPath, file.name);

      assert(
        compiler.outputFileSystem,
        'Expected compiler to have an output file system.',
      );
      const bundleFile = await promisify(
        compiler.outputFileSystem.readFile.bind(compiler.outputFileSystem),
      )(filePath);
      assert(bundleFile);

      const bundleContent = bundleFile.toString();
      let exports: string[] | undefined;

      if (this.options.eval) {
        try {
          const output = await useTemporaryFile(
            'snaps-bundle.js',
            bundleContent,
            async (path) => evalBundle(path),
          );

          this.#spinner?.clear();
          this.#spinner?.frame();

          logInfo(
            `${blue('ℹ')} ${dim('Snap bundle evaluated successfully.')}`,
          );

          exports = output.exports;
        } catch (error) {
          const webpackError = new WebpackError(
            `Failed to evaluate Snap bundle in SES. This is likely due to an incompatibility with the SES environment in your Snap: ${getErrorMessage(error)}`,
          );

          if (error instanceof SnapEvalError) {
            // The constructor for `WebpackError` doesn't accept the details
            // property, so we need to set it manually.
            webpackError.details = error.output.stderr;
          }

          compilation.errors.push(webpackError);
        }
      }

      if (this.options.manifestPath) {
        const { reports } = await checkManifest(
          pathUtils.dirname(this.options.manifestPath),
          {
            updateAndWriteManifest: this.options.writeManifest,
            sourceCode: bundleContent,
            exports,
            handlerEndowments,
            watchMode: compiler.watchMode,
            writeFileFn: async (path, data) => {
              assert(
                compiler.outputFileSystem,
                'Expected compiler to have an output file system.',
              );
              return writeManifest(
                path,
                data,
                promisify(compiler.outputFileSystem.writeFile),
              );
            },
          },
        );

        const errors = reports
          .filter((report) => report.severity === 'error' && !report.wasFixed)
          .map((report) => report.message);
        const warnings = reports
          .filter((report) => report.severity === 'warning' && !report.wasFixed)
          .map((report) => report.message);
        const fixed = reports
          .filter((report) => report.wasFixed)
          .map((report) => report.message);

        if (errors.length > 0) {
          compilation.errors.push(
            ...errors.map((error) => new WebpackError(error)),
          );
        }

        if (warnings.length > 0) {
          compilation.warnings.push(
            ...warnings.map((warning) => new WebpackError(warning)),
          );
        }

        if (fixed.length > 0) {
          compilation.warnings.push(
            ...fixed.map((problem) => new WebpackError(`${problem} (fixed)`)),
          );
        }
      }
    });
  }
}
