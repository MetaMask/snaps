import type { State } from '../interface';

/**
 * The request parameters for the `snap_getInterfaceState` method.
 *
 * @property id - The interface id.
 */
export type GetInterfaceStateParams = {
  id: string;
};

/**
 * The legacy interface state object. This does not include additional metadata
 * about the state, such as the type of the state.
 */
export type LegacyState = Record<
  string,
  State['value'] | Record<string, State['value']>
>;

/**
 * The result returned by the `snap_getInterfaceState` method, which is the
 * state of the interface.
 */
export type GetInterfaceStateResult = LegacyState;
