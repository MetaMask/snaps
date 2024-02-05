import type { AbstractExecutionService } from '@metamask/snaps-controllers';
import type { SnapId, Component } from '@metamask/snaps-sdk';
import type { HandlerType } from '@metamask/snaps-utils';
import { unwrapError } from '@metamask/snaps-utils';
import { getSafeJson, hasProperty, isPlainObject } from '@metamask/utils';
import { nanoid } from '@reduxjs/toolkit';

import type { RequestOptions, SnapRequest } from '../types';
import {
  clearNotifications,
  getInterface,
  getNotifications,
} from './simulation';
import type { RunSagaFunction, Store } from './simulation';
import type { RootControllerMessenger } from './simulation/controllers';

export type HandleRequestOptions = {
  snapId: SnapId;
  store: Store;
  executionService: AbstractExecutionService<unknown>;
  handler: HandlerType;
  controllerMessenger: RootControllerMessenger;
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
  runSaga,
  request: { id = nanoid(), origin = 'https://metamask.io', ...options },
}: HandleRequestOptions): SnapRequest {
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
    .then((result) => {
      const notifications = getNotifications(store.getState());
      store.dispatch(clearNotifications());

      const content = getContentFromResult(result, snapId, controllerMessenger);

      return {
        id: String(id),
        response: {
          result: getSafeJson(result),
        },
        notifications,
        content,
      };
    })
    .catch((error) => {
      const [unwrappedError] = unwrapError(error);

      return {
        id: String(id),
        response: {
          error: unwrappedError.serialize(),
        },
        notifications: [],
      };
    }) as unknown as SnapRequest;

  promise.getInterface = async () => {
    return await runSaga(
      getInterface,
      runSaga,
      snapId,
      controllerMessenger,
    ).toPromise();
  };

  return promise;
}

/**
 * Get the response content either from the SnapInterfaceController or the response object if there is one.
 *
 * @param result - The handler result object.
 * @param snapId - The Snap ID.
 * @param controllerMessenger - The controller messenger.
 * @returns The content components if any.
 */
export function getContentFromResult(
  result: unknown,
  snapId: SnapId,
  controllerMessenger: RootControllerMessenger,
): Component | undefined {
  if (isPlainObject(result) && hasProperty(result, 'id')) {
    return controllerMessenger.call(
      'SnapInterfaceController:getInterface',
      snapId,
      result.id as string,
    ).content;
  }

  if (isPlainObject(result) && hasProperty(result, 'content')) {
    return result.content as Component;
  }

  return undefined;
}
