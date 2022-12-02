// TODO(ritave): Move into separate package @metamask/vfile / @metamask/utils + @metamask/to-vfile when passes code review
// TODO(ritave): Streaming vfile contents similar to vinyl maybe?
// TODO(ritave): Move fixing manifest in cli and bundler plugins to write messages to vfile
//               similar to unified instead of throwing "ProgrammaticallyFixableErrors".
//
// Using https://github.com/vfile/vfile would be helpful, but they only support ESM and we need to support CommonJS.
// https://github.com/gulpjs/vinyl is also good, but they normalize paths, which we can't do, because
// we're calculating checksums based on original path.
import { assert, hasProperty } from '@metamask/utils';

import { deepClone } from '../deep-clone';

/**
 * This map registers the type of the `data` key of a `VFile`.
 *
 * This type can be augmented to register custom `data` types.
 *
 * @example
 * declare module '@metamask/snaps-utils' {
 *   interface DataMap {
 *     // `file.data.name` is typed as `string`
 *     name: string
 *   }
 * }
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions, @typescript-eslint/no-empty-interface
export interface DataMap {}

export type Value = string | Uint8Array;
export type Compatible<Result = unknown> =
  | string
  | Uint8Array
  | Options<Result>;
export type Data = Record<string, unknown> & Partial<DataMap>;
export type Options<Result = unknown> = {
  value: Value;
  path?: string;
  data?: Data;
  result?: Result;
};

export class VirtualFile<Result = unknown> {
  constructor(value?: Compatible<Result>) {
    let options: Options;
    if (typeof value === 'string' || value instanceof Uint8Array) {
      options = { value };
    } else {
      options = value as Options;
    }

    for (const prop in options) {
      if (
        hasProperty(options, prop) &&
        options[prop as keyof Options] !== undefined
      ) {
        this[prop as keyof Options] = options[prop as keyof Options] as any;
      }
    }
  }

  value!: Value;

  result!: Result;

  data: Data = {};

  path = '/';

  toString(encoding?: string) {
    if (typeof this.value === 'string') {
      assert(encoding === undefined, 'Tried to encode string.');
      return this.value;
    }
    const decoder = new TextDecoder(encoding);
    return decoder.decode(this.value);
  }

  clone() {
    const vfile = new VirtualFile<Result>();
    if (typeof this.value === 'string') {
      vfile.value = this.value;
    } else {
      // deep-clone doesn't clone Buffer properly, even if it's a sub-class of Uint8Array
      vfile.value = this.value.slice(0);
    }
    vfile.result = deepClone(this.result);
    vfile.data = deepClone(this.data);
    vfile.path = this.path;
    return vfile;
  }
}
