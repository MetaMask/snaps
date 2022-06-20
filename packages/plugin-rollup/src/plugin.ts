import { postProcessBundle, PostProcessOptions } from '@metamask/snap-utils';
import { Plugin } from 'rollup';

export type Options = PostProcessOptions;

/**
 * @param options
 * @param options.stripComments - Whether to strip comments. Defaults to `true`.
 * @param options.transformHtmlComments - Whether to transform HTML comments.
 * Defaults to `true`.
 */
export default function snaps(options: Partial<Options> = {}): Plugin {
  return {
    name: '@metamask/rollup-plugin-snaps',
    renderChunk(code) {
      return postProcessBundle(code, options);
    },
  };
}
