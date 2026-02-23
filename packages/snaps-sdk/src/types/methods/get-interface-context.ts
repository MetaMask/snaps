import type { InterfaceContext } from '../interface';

/**
 * The request parameters for the `snap_getInterfaceContext` method.
 *
 * @property id - The interface ID.
 */
export type GetInterfaceContextParams = {
  id: string;
};

/**
 * The context for the given interface.
 */
export type GetInterfaceContextResult = InterfaceContext | null;
