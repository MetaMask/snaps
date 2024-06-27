import type { AbstractExecutionService } from '@metamask/snaps-controllers';
import { type SnapId } from '@metamask/snaps-sdk';
import type { HandlerType } from '@metamask/snaps-utils';
import type { RequestOptions, SnapHandlerInterface, SnapRequest } from '../types';
import type { RunSagaFunction, Store } from './simulation';
import type { RootControllerMessenger } from './simulation/controllers';
export declare type HandleRequestOptions = {
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
export declare function handleRequest({ snapId, store, executionService, handler, controllerMessenger, runSaga, request: { id, origin, ...options }, }: HandleRequestOptions): SnapRequest;
/**
 * Get the interface ID from the result if it's available or create a new interface if the result contains static components.
 *
 * @param result - The handler result object.
 * @param snapId - The Snap ID.
 * @param controllerMessenger - The controller messenger.
 * @returns The interface ID or undefined if the result doesn't include content.
 */
export declare function getInterfaceFromResult(result: unknown, snapId: SnapId, controllerMessenger: RootControllerMessenger): Promise<string | undefined>;
/**
 * Get the response content from the `SnapInterfaceController` and include the
 * interaction methods.
 *
 * @param result - The handler result object.
 * @param snapId - The Snap ID.
 * @param controllerMessenger - The controller messenger.
 * @returns The content components if any.
 */
export declare function getInterfaceApi(result: unknown, snapId: SnapId, controllerMessenger: RootControllerMessenger): Promise<(() => SnapHandlerInterface) | undefined>;
