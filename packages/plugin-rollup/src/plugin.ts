import { postProcessBundle, PostProcessOptions } from '@metamask/snap-utils';
import { Plugin } from 'rollup';

export type Options = PostProcessOptions;

/**
 * Creates a Snaps Rollup plugin instance.
 *
 * @param options - The plugin options.
 * @returns The Rollup plugin object.
 */
export default function snaps(options: Partial<Options> = {}): Plugin {
  return {
    name: '@metamask/rollup-plugin-snaps',
    renderChunk(code) {
      return postProcessBundle(code, options);
    },
  };
}
