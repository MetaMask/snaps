import type { JsonRpcParams, JsonRpcRequest } from '@metamask/utils';

/**
 * Get the enum values as union type. This allows using both the enum string
 * values and the enum itself as values.
 *
 * Note: This only works for string enums.
 *
 * @example
 * enum Foo {
 *   Bar = 'bar',
 *   Baz = 'baz',
 * }
 *
 * // FooValue is 'bar' | 'baz'
 * type FooValue = EnumToUnion<Foo>;
 *
 * const foo: FooValue = Foo.Bar; // Works
 * const foo: FooValue = 'bar'; // Also works
 * @internal
 */
export type EnumToUnion<Type extends string> = `${Type}`;

/**
 * Get a JSON-RPC method with the given name and parameters. If params extends
 * `never`, then the `params` property is omitted.
 *
 * @example
 * // MyMethod is { method: 'my_method', params: { foo: string } }
 * type MyMethod = Method<'my_method', { foo: string }>;
 * @internal
 */
export type Method<
  MethodName extends string,
  Params extends JsonRpcParams,
> = Partial<JsonRpcRequest> & Params extends never
  ? {
      method: MethodName;
    }
  : {
      method: MethodName;
      params: Params;
    };
