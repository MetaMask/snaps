import { postProcessBundle, PostProcessOptions } from '@metamask/snap-utils';
import { Plugin, SourceMapInput } from 'rollup';

export type Options = Omit<PostProcessOptions, 'sourceMap' | 'inputSourceMap'>;

/**
 * Creates a Snaps Rollup plugin instance.
 *
 * @param options - The plugin options.
 * @param options.stripComments - Whether to strip comments. Defaults to `true`.
 * @returns The Rollup plugin object.
 */
export default function snaps(options: Partial<Options> = {}): Plugin {
  return {
    name: '@metamask/rollup-plugin-snaps',

    renderChunk(code: string): { code: string; map?: SourceMapInput } | null {
      // Rollup internally merges the new source map with the old one, so there
      // is no need to pass the current source map to the function.
      const result = postProcessBundle(code, { ...options, sourceMap: true });

      // `postProcessBundle` returns `null` if the input code is `null`, which
      // should never be the case.
      /* istanbul ignore next */
      if (!result) {
        return null;
      }

      return { code: result.code, map: result.sourceMap };
    },
  };
}
