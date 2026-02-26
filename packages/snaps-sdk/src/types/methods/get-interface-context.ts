import type { InterfaceContext } from '../interface';

/**
 * An object containing the parameters for the `snap_getInterfaceContext`
 * method.
 *
 * @property id - The interface ID.
 */
export type GetInterfaceContextParams = {
  id: string;
};

/**
 * The context for the given interface. May be `null` if no context was provided
 * when the interface was created.
 */
export type GetInterfaceContextResult = InterfaceContext | null;
