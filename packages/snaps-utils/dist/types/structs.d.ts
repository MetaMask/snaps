import type { Failure, Infer } from 'superstruct';
import { Struct, StructError } from 'superstruct';
import type { AnyStruct, InferStructTuple } from 'superstruct/dist/utils';
/**
 * A wrapper of `superstruct`'s `literal` struct that also defines the name of
 * the struct as the literal value.
 *
 * This is useful for improving the error messages returned by `superstruct`.
 * For example, instead of returning an error like:
 *
 * ```
 * Expected the value to satisfy a union of `literal | literal`, but received: \"baz\"
 * ```
 *
 * This struct will return an error like:
 *
 * ```
 * Expected the value to satisfy a union of `"foo" | "bar"`, but received: \"baz\"
 * ```
 *
 * @param value - The literal value.
 * @returns The `superstruct` struct, which validates that the value is equal
 * to the literal value.
 */
export declare function literal<Type extends string | number | boolean>(value: Type): Struct<Type, null>;
/**
 * A wrapper of `superstruct`'s `union` struct that also defines the schema as
 * the union of the schemas of the structs.
 *
 * This is useful for improving the error messages returned by `superstruct`.
 *
 * @param structs - The structs to union.
 * @param structs."0" - The first struct.
 * @param structs."1" - The remaining structs.
 * @returns The `superstruct` struct, which validates that the value satisfies
 * one of the structs.
 */
export declare function union<Head extends AnyStruct, Tail extends AnyStruct[]>([head, ...tail]: [head: Head, ...tail: Tail]): Struct<Infer<Head> | InferStructTuple<Tail>[number], [
    head: Head,
    ...tail: Tail
]>;
/**
 * A wrapper of `superstruct`'s `string` struct that coerces a value to a string
 * and resolves it relative to the current working directory. This is useful
 * for specifying file paths in a configuration file, as it allows the user to
 * use both relative and absolute paths.
 *
 * @returns The `superstruct` struct, which validates that the value is a
 * string, and resolves it relative to the current working directory.
 * @example
 * ```ts
 * const config = struct({
 *   file: file(),
 *   // ...
 * });
 *
 * const value = create({ file: 'path/to/file' }, config);
 * console.log(value.file); // /process/cwd/path/to/file
 * ```
 */
export declare function file(): Struct<string, null>;
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
    constructor(struct: Struct<Type, Schema>, prefix: string, suffix: string, failure: StructError, failures: () => Generator<Failure>);
}
declare type GetErrorOptions<Type, Schema> = {
    struct: Struct<Type, Schema>;
    prefix: string;
    suffix?: string;
    error: StructError;
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
 * @returns The `SnapsStructError`.
 */
export declare function getError<Type, Schema>({ struct, prefix, suffix, error, }: GetErrorOptions<Type, Schema>): SnapsStructError<Type, Schema>;
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
 * @returns The union struct names, or `null` if the struct is not a union
 * struct.
 */
export declare function getUnionStructNames<Type, Schema>(struct: Struct<Type, Schema>): string[] | null;
/**
 * Get a error prefix from a `superstruct` failure. This is useful for
 * formatting the error message returned by `superstruct`.
 *
 * @param failure - The `superstruct` failure.
 * @returns The error prefix.
 */
export declare function getStructErrorPrefix(failure: Failure): string;
/**
 * Get a string describing the failure. This is similar to the `message`
 * property of `superstruct`'s `Failure` type, but formats the value in a more
 * readable way.
 *
 * @param struct - The struct that caused the failure.
 * @param failure - The `superstruct` failure.
 * @returns A string describing the failure.
 */
export declare function getStructFailureMessage<Type, Schema>(struct: Struct<Type, Schema>, failure: Failure): string;
/**
 * Get a string describing the errors. This formats all the errors in a
 * human-readable way.
 *
 * @param struct - The struct that caused the failures.
 * @param failures - The `superstruct` failures.
 * @returns A string describing the errors.
 */
export declare function getStructErrorMessage<Type, Schema>(struct: Struct<Type, Schema>, failures: Failure[]): string;
export {};
