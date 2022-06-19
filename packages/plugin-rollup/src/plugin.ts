import { postProcessBundle, PostProcessOptions } from '@metamask/snap-utils';
import { Plugin } from 'rollup';

export type Options = PostProcessOptions;

/**
 * @param options
 */
export default function snaps(options: Partial<Options> = {}): Plugin {
  return {
    name: '@metamask/rollup-plugin-snaps',
    renderChunk(code) {
      return postProcessBundle(code, options);
    },
  };
}
