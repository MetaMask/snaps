import type { PostProcessOptions } from '@metamask/snaps-utils/node';
import {
  checkManifest,
  evalBundle,
  postProcessBundle,
} from '@metamask/snaps-utils/node';
import { promises as fs } from 'fs';
import pathUtils from 'path';
import type { Plugin, SourceMapInput } from 'rollup';

type PluginOptions = {
  eval?: boolean;
  manifestPath?: string;
  writeManifest?: boolean;
};

export type Options = PluginOptions &
  Omit<PostProcessOptions, 'sourceMap' | 'inputSourceMap'>;

/**
 * Creates a Snaps Rollup plugin instance.
 *
 * @param options - The plugin options.
 * @param options.stripComments - Whether to strip comments. Defaults to `true`.
 * @param options.eval - Whether to evaluate the bundle to test SES
 * compatibility. Defaults to `true`.
 * @param options.manifestPath - The path to the manifest file. If provided,
 * the manifest will be validated. Defaults to
 * `process.cwd() + '/snap.manifest.json'`.
 * @param options.writeManifest - Whether to fix the manifest. Defaults to
 * `true`.
 * @returns The Rollup plugin object.
 */
export default function snaps(options?: Partial<Options>): Plugin {
  const defaultOptions = {
    eval: true,
    manifestPath: pathUtils.join(process.cwd(), 'snap.manifest.json'),
    writeManifest: true,
    ...options,
  };

  return {
    name: '@metamask/snaps-rollup-plugin',

    renderChunk(code: string): { code: string; map?: SourceMapInput } | null {
      // Rollup internally merges the new source map with the old one, so there
      // is no need to pass the current source map to the function.
      const result = postProcessBundle(code, {
        ...defaultOptions,
        sourceMap: true,
      });

      if (result.warnings.length > 0) {
        this.warn(
          `Bundle Warning: Processing of the Snap bundle completed with warnings.\n${result.warnings.join(
            '\n',
          )}`,
        );
      }

      return { code: result.code, map: result.sourceMap };
    },

    async writeBundle(output): Promise<void> {
      if (!output.file) {
        this.warn('No output file specified, skipping bundle validation.');
        return;
      }

      if (defaultOptions.eval) {
        await evalBundle(output.file).catch((error) => {
          this.error(error);
        });
      }

      if (defaultOptions.manifestPath) {
        const { reports } = await checkManifest(
          pathUtils.dirname(defaultOptions.manifestPath),
          {
            updateAndWriteManifest: defaultOptions.writeManifest,
            sourceCode: await fs.readFile(output.file, 'utf8'),
          },
        );

        const errorsUnfixed = reports
          .filter((report) => report.severity === 'error' && !report.wasFixed)
          .map((report) => report.message);
        const warnings = reports
          .filter((report) => report.severity === 'warning' && !report.wasFixed)
          .map((report) => report.message);
        const fixed = reports
          .filter((report) => report.wasFixed)
          .map((report) => report.message);

        if (errorsUnfixed.length > 0) {
          this.error(
            `Manifest Error: The manifest is invalid.\n${errorsUnfixed.join(
              '\n',
            )}`,
          );
        }

        if (warnings.length > 0) {
          this.warn(
            `Manifest Warning: Validation of snap.manifest.json completed with warnings.\n${warnings.join(
              '\n',
            )}`,
          );
        }

        if (fixed.length > 0) {
          this.warn(
            `Manifest Warning: Validation of snap.manifest.json fixed following problems.\n${fixed.join(
              '\n',
            )}`,
          );
        }
      }
    },
  };
}
