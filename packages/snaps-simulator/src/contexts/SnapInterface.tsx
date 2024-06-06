import { UserInputEventType } from '@metamask/snaps-sdk';
import type { FormState, InterfaceState } from '@metamask/snaps-sdk';
import { HandlerType } from '@metamask/snaps-utils';
import debounce from 'lodash.debounce';
import throttle from 'lodash.throttle';
import type { FunctionComponent, ReactNode } from 'react';
import { createContext, useContext } from 'react';

import {
  getSnapInterfaceController,
  getSnapInterface,
  sendRequest,
  setSnapInterfaceState,
} from '../features';
import { useDispatch, useSelector } from '../hooks';
import { mergeValue } from './utils';

export type GetValue = (name: string, form?: string) => string | undefined;

export type HandleInputChange = (
  name: string,
  value: string | null,
  form?: string,
) => void;

export type HandleEvent = (args: {
  event: UserInputEventType;
  name?: string;
  value?: string;
}) => void;

export type SnapInterfaceContextType = {
  getValue: GetValue;
  handleInputChange: HandleInputChange;
  handleEvent: HandleEvent;
};

export const SnapInterfaceContext =
  createContext<SnapInterfaceContextType | null>(null);

export type SnapInterfaceContextProviderProps = {
  children: ReactNode;
};

// We want button clicks to be instant and therefore use throttling
// to protect the Snap
// Any event not in this array will be debounced instead of throttled
const THROTTLED_EVENTS = [
  UserInputEventType.ButtonClickEvent,
  UserInputEventType.FormSubmitEvent,
];

export const SnapInterfaceContextProvider: FunctionComponent<
  SnapInterfaceContextProviderProps
> = ({ children }) => {
  const dispatch = useDispatch();
  const snapInterface = useSelector(getSnapInterface);
  const snapInterfaceController = useSelector(getSnapInterfaceController);

  const noOp = () => {
    /* No Op */
  };

  if (!snapInterface) {
    return (
      <SnapInterfaceContext.Provider
        value={{
          getValue: noOp as GetValue,
          handleInputChange: noOp as HandleInputChange,
          handleEvent: noOp as HandleEvent,
        }}
      >
        {children}
      </SnapInterfaceContext.Provider>
    );
  }

  const { id, state } = snapInterface;

  const rawSnapRequestFunction = (
    event: UserInputEventType,
    name?: string,
    value?: string | InterfaceState,
  ) =>
    dispatch(
      sendRequest({
        origin: '',
        handler: HandlerType.OnUserInput,
        request: {
          jsonrpc: '2.0',
          method: ' ',
          params: {
            event: {
              type: event,
              // TODO: Allow null in the types and simplify this
              ...(name !== undefined && name !== null ? { name } : {}),
              ...(value !== undefined && value !== null ? { value } : {}),
            },
            id,
          },
        },
      }),
    );

  const snapRequestDebounced = debounce(rawSnapRequestFunction, 200);
  const snapRequestThrottled = throttle(rawSnapRequestFunction, 200);

  /**
   * Handle the submission of an user input event to the Snap.
   *
   * @param options - An options bag.
   * @param options.event - The event type.
   * @param options.name - The name of the component emitting the event.
   * @param options.value - The value of the component emitting the event.
   */
  const handleEvent: HandleEvent = ({
    event,
    name,
    value = name ? state[name] ?? undefined : undefined,
  }) => {
    const fn = THROTTLED_EVENTS.includes(event)
      ? snapRequestThrottled
      : snapRequestDebounced;
    fn(event, name, value);
  };

  const getValue: GetValue = (name, form) => {
    const value = form
      ? (state[form] as FormState)?.[name]
      : (state as FormState)?.[name];

    if (value) {
      return value;
    }

    return undefined;
  };

  const handleInputChange: HandleInputChange = (name, value, form) => {
    const newState = mergeValue(state, name, value, form);

    snapInterfaceController?.updateInterfaceState(id, newState);
    dispatch(setSnapInterfaceState(newState));

    handleEvent({
      event: UserInputEventType.InputChangeEvent,
      name,
      value: value ?? '',
    });
  };

  return (
    <SnapInterfaceContext.Provider
      value={{ getValue, handleInputChange, handleEvent }}
    >
      {children}
    </SnapInterfaceContext.Provider>
  );
};

/**
 * Get the Snap Interface context.
 *
 * @returns The Snap Interface context.
 */
export function useSnapInterfaceContext() {
  return useContext(SnapInterfaceContext) as SnapInterfaceContextType;
}
