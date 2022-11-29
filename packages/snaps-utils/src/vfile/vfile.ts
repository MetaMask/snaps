// TODO(ritave): Move into separate package @metamask/vfile / @metamask/utils + @metamask/to-vfile when passes code review
// TODO(ritave): Streaming vfile contents similar to vinyl maybe?
// TODO(ritave): Move fixing manifest to write messages to vfile similar to unified instead of throwing "ProgrammaticallyFixableErrors".
//               Better yet, move manifest fixing into eslint fixing altogether
import { assert, hasProperty } from '@metamask/utils';
import { Infer, instance, is, union } from 'superstruct';

import { deepClone } from '../deep-clone';

// Using https://github.com/vfile/vfile would be helpful, but they only support ESM.
// https://github.com/gulpjs/vinyl is also good, but they normalize paths, which we can't do, because
// we're calculating checksums based on original path.

/**
 * This map registers the type of the `data` key of a `VFile`.
 *
 * This type can be augmented to register custom `data` types.
 *
 * @example
 * declare module '@metamask/vfile' {
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

const TypedArrayStruct = union([
  instance(Int8Array),
  instance(Uint8Array),
  instance(Uint8ClampedArray),
  instance(Int16Array),
  instance(Uint16Array),
  instance(Int32Array),
  instance(Uint32Array),
  instance(Float32Array),
  instance(Float64Array),
  instance(BigInt64Array),
  instance(BigUint64Array),
]);

export type TypedArray = Infer<typeof TypedArrayStruct>;

/**
 * Returns whether the given parameter is one of TypedArray subtypes.
 *
 * @param value - Object to check.
 * @returns Whether the parameter is TypeArray subtype.
 */
export function isTypedArray(value: unknown): value is TypedArray {
  return is(value, TypedArrayStruct);
}

export class VFile<Result = unknown> {
  constructor(value?: Compatible<Result>) {
    let options: Options;
    if (typeof value === 'string' || isTypedArray(value)) {
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
    const vfile = new VFile<Result>();
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
