import { postProcessBundle, PostProcessOptions } from '@metamask/snap-utils';
import { Plugin, TransformResult } from 'rollup';

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

    transform(code: string): TransformResult {
      const result = postProcessBundle(code, { ...options, sourceMap: true });
      if (!result) {
        return null;
      }

      return { code: result.code, map: result.sourceMap };
    },
  };
}
