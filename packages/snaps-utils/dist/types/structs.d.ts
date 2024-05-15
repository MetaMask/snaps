import type { Failure } from 'superstruct';
import { Struct, StructError } from 'superstruct';
import type { AnyStruct } from 'superstruct/dist/utils';
/**
 * Infer a struct type, only if it matches the specified type. This is useful
 * for defining types and structs that are related to each other in separate
 * files.
 *
 * @example
 * ```typescript
 * // In file A
 * export type GetFileArgs = {
 *   path: string;
 *   encoding?: EnumToUnion<AuxiliaryFileEncoding>;
 * };
 *
 * // In file B
 * export const GetFileArgsStruct = object(...);
 *
 * // If the type and struct are in the same file, this will return the type.
 * // Otherwise, it will return `never`.
 * export type GetFileArgs =
 *   InferMatching<typeof GetFileArgsStruct, GetFileArgs>;
 * ```
 */
export declare type InferMatching<StructType extends Struct<any, any>, Type> = StructType['TYPE'] extends Type ? Type : never;
/**
 * Define a struct, and also define the name of the struct as the given name.
 *
 * This is useful for improving the error messages returned by `superstruct`.
 *
 * @param name - The name of the struct.
 * @param struct - The struct.
 * @returns The struct.
 */
export declare function named<Type, Schema>(name: string, struct: Struct<Type, Schema>): Struct<Type, Schema>;
export declare class SnapsStructError<Type, Schema> extends StructError {
    constructor(struct: Struct<Type, Schema>, prefix: string, suffix: string, failure: StructError, failures: () => Generator<Failure>, colorize?: boolean);
}
declare type GetErrorOptions<Type, Schema> = {
    struct: Struct<Type, Schema>;
    prefix: string;
    suffix?: string;
    error: StructError;
    colorize?: boolean;
};
/**
 * Converts an array to a generator function that yields the items in the
 * array.
 *
 * @param array - The array.
 * @returns A generator function.
 * @yields The items in the array.
 */
export declare function arrayToGenerator<Type>(array: Type[]): Generator<Type, void, undefined>;
/**
 * Returns a `SnapsStructError` with the given prefix and suffix.
 *
 * @param options - The options.
 * @param options.struct - The struct that caused the error.
 * @param options.prefix - The prefix to add to the error message.
 * @param options.suffix - The suffix to add to the error message. Defaults to
 * an empty string.
 * @param options.error - The `superstruct` error to wrap.
 * @param options.colorize - Whether to colorize the value. Defaults to `true`.
 * @returns The `SnapsStructError`.
 */
export declare function getError<Type, Schema>({ struct, prefix, suffix, error, colorize, }: GetErrorOptions<Type, Schema>): SnapsStructError<Type, Schema>;
/**
 * A wrapper of `superstruct`'s `create` function that throws a
 * `SnapsStructError` instead of a `StructError`. This is useful for improving
 * the error messages returned by `superstruct`.
 *
 * @param value - The value to validate.
 * @param struct - The `superstruct` struct to validate the value against.
 * @param prefix - The prefix to add to the error message.
 * @param suffix - The suffix to add to the error message. Defaults to an empty
 * string.
 * @returns The validated value.
 */
export declare function createFromStruct<Type, Schema>(value: unknown, struct: Struct<Type, Schema>, prefix: string, suffix?: string): Type;
/**
 * Get a struct from a failure path.
 *
 * @param struct - The struct.
 * @param path - The failure path.
 * @returns The struct at the failure path.
 */
export declare function getStructFromPath<Type, Schema>(struct: Struct<Type, Schema>, path: string[]): AnyStruct;
/**
 * Get the union struct names from a struct.
 *
 * @param struct - The struct.
 * @param colorize - Whether to colorize the value. Defaults to `true`.
 * @returns The union struct names, or `null` if the struct is not a union
 * struct.
 */
export declare function getUnionStructNames<Type, Schema>(struct: Struct<Type, Schema>, colorize?: boolean): string[] | null;
/**
 * Get an error prefix from a `superstruct` failure. This is useful for
 * formatting the error message returned by `superstruct`.
 *
 * @param failure - The `superstruct` failure.
 * @param colorize - Whether to colorize the value. Defaults to `true`.
 * @returns The error prefix.
 */
export declare function getStructErrorPrefix(failure: Failure, colorize?: boolean): string;
/**
 * Get a string describing the failure. This is similar to the `message`
 * property of `superstruct`'s `Failure` type, but formats the value in a more
 * readable way.
 *
 * @param struct - The struct that caused the failure.
 * @param failure - The `superstruct` failure.
 * @param colorize - Whether to colorize the value. Defaults to `true`.
 * @returns A string describing the failure.
 */
export declare function getStructFailureMessage<Type, Schema>(struct: Struct<Type, Schema>, failure: Failure, colorize?: boolean): string;
/**
 * Get a string describing the errors. This formats all the errors in a
 * human-readable way.
 *
 * @param struct - The struct that caused the failures.
 * @param failures - The `superstruct` failures.
 * @param colorize - Whether to colorize the value. Defaults to `true`.
 * @returns A string describing the errors.
 */
export declare function getStructErrorMessage<Type, Schema>(struct: Struct<Type, Schema>, failures: Failure[], colorize?: boolean): string;
/**
 * Validate a union struct, and throw readable errors if the value does not
 * satisfy the struct. This is useful for improving the error messages returned
 * by `superstruct`.
 *
 * @param value - The value to validate.
 * @param struct - The `superstruct` union struct to validate the value against.
 * This struct must be a union of object structs, and must have at least one
 * shared key to validate against.
 * @param structKey - The key to validate against. This key must be present in
 * all the object structs in the union struct, and is expected to be a literal
 * value.
 * @param coerce - Whether to coerce the value to satisfy the struct. Defaults
 * to `false`.
 * @returns The validated value.
 * @throws If the value does not satisfy the struct.
 * @example
 * const struct = union([
 *   object({ type: literal('a'), value: string() }),
 *   object({ type: literal('b'), value: number() }),
 *   object({ type: literal('c'), value: boolean() }),
 *   // ...
 * ]);
 *
 * // At path: type — Expected the value to be one of: "a", "b", "c", but received: "d".
 * validateUnion({ type: 'd', value: 'foo' }, struct, 'type');
 *
 * // At path: value — Expected a value of type string, but received: 42.
 * validateUnion({ type: 'a', value: 42 }, struct, 'value');
 */
export declare function validateUnion<Type, Schema extends readonly Struct<any, any>[]>(value: unknown, struct: Struct<Type, Schema>, structKey: keyof Type, coerce?: boolean): any;
/**
 * Create a value with the coercion logic of a union struct, and throw readable
 * errors if the value does not satisfy the struct. This is useful for improving
 * the error messages returned by `superstruct`.
 *
 * @param value - The value to validate.
 * @param struct - The `superstruct` union struct to validate the value against.
 * This struct must be a union of object structs, and must have at least one
 * shared key to validate against.
 * @param structKey - The key to validate against. This key must be present in
 * all the object structs in the union struct, and is expected to be a literal
 * value.
 * @returns The validated value.
 * @throws If the value does not satisfy the struct.
 * @see validateUnion
 */
export declare function createUnion<Type, Schema extends readonly Struct<any, any>[]>(value: unknown, struct: Struct<Type, Schema>, structKey: keyof Type): any;
export {};
