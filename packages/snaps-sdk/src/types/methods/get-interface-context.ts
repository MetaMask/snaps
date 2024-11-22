import type { InterfaceContext } from '../interface';

/**
 * The request parameters for the `snap_getInterfaceContext` method.
 *
 * @property id - The interface id.
 */
export type GetInterfaceContextParams = {
  id: string;
};

/**
 * The result returned by the `snap_getInterfaceContext` method, which is the context for a given interface.
 */
export type GetInterfaceContextResult = InterfaceContext | null;
