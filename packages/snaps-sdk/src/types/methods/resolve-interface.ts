import type { Json } from '@metamask/utils';

/**
 * The request parameters for the `snap_resolveInterface` method.
 *
 * @property id - The interface id.
 * @property value - The value to resolve the interface with.
 */
export type ResolveInterfaceParams = {
  id: string;
  value: Json;
};

/**
 * The result returned by the `snap_resolveInterface` method.
 */
export type ResolveInterfaceResult = null;
