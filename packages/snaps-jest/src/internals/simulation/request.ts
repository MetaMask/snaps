import type { AbstractExecutionService } from '@metamask/snaps-controllers';
import type { SnapRequestObject } from '@metamask/snaps-jest';
import type { HandlerType } from '@metamask/snaps-utils';
import { unwrapError } from '@metamask/snaps-utils';
import type { JsonRpcId, JsonRpcParams } from '@metamask/utils';

import { getInterface } from './helpers';
import type { RunSagaFunction } from './store';

// TODO: Merge with existing types in this package.
export type Request = {
  /**
   * The JSON-RPC request ID.
   */
  id?: JsonRpcId;

  /**
   * The JSON-RPC method.
   */
  method: string;

  /**
   * The JSON-RPC params.
   */
  params?: JsonRpcParams;

  /**
   * The origin to send the request from.
   */
  origin?: string;
};

export type GetRequestFunctionOptions = {
  snapId: string;
  executionService: AbstractExecutionService<unknown>;
  handler: HandlerType.OnRpcRequest | HandlerType.OnCronjob;
  runSaga: RunSagaFunction;
};

// TODO: Merge with existing types in this package.
export type PendingResponse = Promise<unknown> & SnapRequestObject;

/**
 * Send a JSON-RPC request to the Snap.
 *
 * @param options - The request options.
 * @param options.snapId - The ID of the Snap to send the request to.
 * @param options.executionService - The execution service to use to send the
 * request.
 * @param options.handler - The handler to use to send the request.
 * @param options.runSaga - A function to run a saga outside the usual Redux
 * flow.
 * @returns The request function.
 */
export function getRequestFunction({
  snapId,
  executionService,
  handler,
  runSaga,
}: GetRequestFunctionOptions) {
  return ({
    origin = 'https://metamask.io',
    ...request
  }: Request): PendingResponse => {
    const promise = executionService
      .handleRpcRequest(snapId, {
        origin,
        handler,
        request: {
          jsonrpc: '2.0',
          id: 1,
          ...request,
        },
      })
      .catch((error) => {
        const [unwrappedError] = unwrapError(error);
        throw unwrappedError;
      }) as PendingResponse;

    promise.getInterface = async () => {
      return await runSaga(getInterface, runSaga).toPromise();
    };

    return promise;
  };
}
