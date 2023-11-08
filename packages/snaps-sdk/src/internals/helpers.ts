/**
 * Get the enum values as union type. This allows using both the enum string
 * values and the enum itself as values.
 *
 * Note: This only works for string enums.
 *
 * @example
 * ```typescript
 * enum Foo {
 *   Bar = 'bar',
 *   Baz = 'baz',
 * }
 *
 * type FooValue = EnumToUnion<Foo>;
 * // FooValue is 'bar' | 'baz'
 *
 * const foo: FooValue = Foo.Bar; // Works
 * const foo: FooValue = 'bar'; // Also works
 * ```
 */
export type EnumToUnion<Type extends string> = `${Type}`;
