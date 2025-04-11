import type { ProcessedConfig } from '../config';
import { getConfig } from '../config';

const DEFAULT_OPTIONS = {
  input: 'src/index.ts',
};

/**
 * Recursively make all properties of a type optional.
 *
 * @example
 * type Foo = {
 *   bar: {
 *     baz: string;
 *   }
 * };
 *
 * type PartialFoo = DeepPartial<Foo>;
 * // {
 * //   bar?: {
 * //     baz?: string;
 * //   }
 * // }
 */
type DeepPartial<Type> = {
  [Property in keyof Type]?: DeepPartial<Type[Property]>;
};

/**
 * Get a mock config object.
 *
 * @param options - The options to use for the mock config.
 * @returns The mock config object.
 */
export function getMockConfig(
  options?: DeepPartial<ProcessedConfig>,
): ProcessedConfig {
  return getConfig(options ?? (DEFAULT_OPTIONS as Partial<ProcessedConfig>));
}
