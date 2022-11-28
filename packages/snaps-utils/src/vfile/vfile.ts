// TODO(ritave): Move into separate package @metamask/vfile / @metamask/utils + @metamask/to-vfile when passes code review
// TODO(ritave): Streaming vfile contents similar to vinyl maybe?
// TODO(ritave): Move fixing manifest to write messages to vfile similar to unified instead of throwing "ProgrammaticallyFixableErrors".
//               Better yet, move manifest fixing into eslint fixing altogether
import { assert, hasProperty } from '@metamask/utils';
import { instance, integer, is, size, type } from 'superstruct';

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
export type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array;

const TypedArrayStruct = type({
  buffer: instance(ArrayBuffer),
  BYTES_PER_ELEMENT: size(integer(), 1, Infinity),
});

/**
 * Returns whether the given parameter is one of TypedArray subtypes.
 *
 * @param obj - Object to check.
 * @returns Whether the parameter is TypeArray subtype.
 */
export function isTypedArray(obj: unknown): obj is TypedArray {
  return is(obj, TypedArrayStruct);
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
}
