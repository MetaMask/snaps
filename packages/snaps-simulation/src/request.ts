import type { AbstractExecutionService } from '@metamask/snaps-controllers';
import {
  type ComponentOrElement,
  ComponentOrElementStruct,
  type JsonRpcError,
  type SnapId,
} from '@metamask/snaps-sdk';
import type { HandlerType } from '@metamask/snaps-utils';
import { unwrapError } from '@metamask/snaps-utils';
import { is } from '@metamask/superstruct';
import {
  assert,
  getSafeJson,
  hasProperty,
  isPlainObject,
} from '@metamask/utils';
import { nanoid } from '@reduxjs/toolkit';

import type { RootControllerMessenger } from './controllers';
import { getInterface, getInterfaceActions } from './interface';
import type { SimulationOptions } from './options';
import type { RunSagaFunction, Store } from './store';
import {
  getTraces,
  getErrors,
  clearNotifications,
  getNotifications,
  getEvents,
  clearTrackables,
} from './store';
import { SnapResponseStruct } from './structs';
import type {
  RequestOptions,
  SnapHandlerInterface,
  SnapRequest,
} from './types';

export type HandleRequestOptions = {
  snapId: SnapId;
  store: Store;
  executionService: AbstractExecutionService<unknown>;
  handler: HandlerType;
  controllerMessenger: RootControllerMessenger;
  simulationOptions: SimulationOptions;
  runSaga: RunSagaFunction;
  request: RequestOptions;
};

/**
 * Send a JSON-RPC request to the Snap, and wrap the response in a
 * {@link SnapResponse} object.
 *
 * @param options - The request options.
 * @param options.snapId - The ID of the Snap to send the request to.
 * @param options.store - The Redux store.
 * @param options.executionService - The execution service to use to send the
 * request.
 * @param options.handler - The handler to use to send the request.
 * @param options.controllerMessenger - The controller messenger used to call actions.
 * @param options.simulationOptions - The simulation options.
 * @param options.runSaga - A function to run a saga outside the usual Redux
 * flow.
 * @param options.request - The request to send.
 * @param options.request.id - The ID of the request. If not provided, a random
 * ID will be generated.
 * @param options.request.origin - The origin of the request. Defaults to
 * `https://metamask.io`.
 * @returns The response, wrapped in a {@link SnapResponse} object.
 */
export function handleRequest({
  snapId,
  store,
  executionService,
  handler,
  controllerMessenger,
  simulationOptions,
  runSaga,
  request: { id = nanoid(), origin = 'https://metamask.io', ...options },
}: HandleRequestOptions): SnapRequest {
  const getInterfaceError = () => {
    throw new Error(
      'Unable to get the interface from the Snap: The request to the Snap failed.',
    );
  };

  const promise = executionService
    .handleRpcRequest(snapId, {
      origin,
      handler,
      request: {
        jsonrpc: '2.0',
        id: 1,
        ...options,
      },
    })
    .then(async (result) => {
      const state = store.getState();
      const notifications = getNotifications(state);
      const errors = getErrors(state);
      const events = getEvents(state);
      const traces = getTraces(state);
      const interfaceId = notifications[0]?.content;

      store.dispatch(clearNotifications());
      store.dispatch(clearTrackables());

      try {
        const getInterfaceFn = await getInterfaceApi(
          result,
          snapId,
          controllerMessenger,
          simulationOptions,
          interfaceId,
        );

        return {
          id: String(id),
          response: {
            result: getSafeJson(result),
          },
          notifications,
          tracked: {
            errors,
            events,
            traces,
          },
          ...(getInterfaceFn ? { getInterface: getInterfaceFn } : {}),
        };
      } catch (error) {
        const [unwrappedError] = unwrapError(error);
        return {
          id: String(id),
          response: {
            error: unwrappedError.serialize(),
          },
          notifications: [],
          tracked: {
            errors: [],
            events: [],
            traces: [],
          },
          getInterface: getInterfaceError,
        };
      }
    })
    .catch((error) => {
      const [unwrappedError] = unwrapError(error);

      return {
        id: String(id),
        response: {
          error: unwrappedError.serialize(),
        },
        notifications: [],
        tracked: {
          errors: [],
          events: [],
          traces: [],
        },
        getInterface: getInterfaceError,
      };
    }) as unknown as SnapRequest;

  promise.getInterface = async () => {
    const sagaPromise = runSaga(
      getInterface,
      runSaga,
      snapId,
      controllerMessenger,
      simulationOptions,
    ).toPromise();
    const result = await Promise.race([promise, sagaPromise]);

    // If the request promise has resolved to an error, we should throw
    // instead of waiting for an interface that likely will never be displayed
    if (
      is(result, SnapResponseStruct) &&
      hasProperty(result.response, 'error')
    ) {
      throw new Error(
        `Unable to get the interface from the Snap: The returned interface may be invalid. The error message received was: ${
          (result.response.error as JsonRpcError).message
        }`,
      );
    }

    return await sagaPromise;
  };

  return promise;
}

/**
 * Get the interface ID from the result if it's available or create a new interface if the result contains static components.
 *
 * @param result - The handler result object.
 * @param snapId - The Snap ID.
 * @param controllerMessenger - The controller messenger.
 * @returns The interface ID or undefined if the result doesn't include content.
 */
export async function getInterfaceFromResult(
  result: unknown,
  snapId: SnapId,
  controllerMessenger: RootControllerMessenger,
) {
  if (isPlainObject(result) && hasProperty(result, 'id')) {
    return result.id as string;
  }

  if (isPlainObject(result) && hasProperty(result, 'content')) {
    assert(
      is(result.content, ComponentOrElementStruct),
      'The Snap returned an invalid interface.',
    );

    const id = controllerMessenger.call(
      'SnapInterfaceController:createInterface',
      snapId,
      result.content as ComponentOrElement,
    );

    return id;
  }

  return undefined;
}

/**
 * Get the response content from the `SnapInterfaceController` and include the
 * interaction methods.
 *
 * @param result - The handler result object.
 * @param snapId - The Snap ID.
 * @param controllerMessenger - The controller messenger.
 * @param options - The simulation options.
 * @param contentId - The id of the interface if it exists outside of the result.
 * @returns The content components if any.
 */
export async function getInterfaceApi(
  result: unknown,
  snapId: SnapId,
  controllerMessenger: RootControllerMessenger,
  options: SimulationOptions,
  contentId?: string,
): Promise<(() => SnapHandlerInterface) | undefined> {
  const interfaceId = await getInterfaceFromResult(
    result,
    snapId,
    controllerMessenger,
  );

  const id = interfaceId ?? contentId;

  if (id) {
    return () => {
      const { content } = controllerMessenger.call(
        'SnapInterfaceController:getInterface',
        snapId,
        id,
      );

      const actions = getInterfaceActions(
        snapId,
        controllerMessenger,
        options,
        {
          id,
          content,
        },
      );

      return {
        content,
        ...actions,
      };
    };
  }

  return undefined;
}
