import { HandlerType } from '@metamask/snaps-utils';
import { create } from '@metamask/superstruct';
import { createModuleLogger } from '@metamask/utils';

import { rootLogger } from './logger';
import type { SimulationOptions } from './options';
import { handleRequest } from './request';
import type { InstalledSnap } from './simulation';
import { addJsonRpcMock, removeJsonRpcMock } from './store';
import {
  assertIsResponseWithInterface,
  JsonRpcMockOptionsStruct,
  NameLookupOptionsStruct,
  SignatureOptionsStruct,
  TransactionOptionsStruct,
} from './structs';
import type {
  CronjobOptions,
  JsonRpcMockOptions,
  KeyringOptions,
  NameLookupOptions,
  RequestOptions,
  SignatureOptions,
  SnapRequest,
  SnapResponseWithInterface,
  SnapResponseWithoutInterface,
  TransactionOptions,
} from './types';

const log = createModuleLogger(rootLogger, 'helpers');

/**
 * This is the main entry point to interact with the snap. It is returned by
 * {@link installSnap}, and has methods to send requests to the snap.
 *
 * @example
 * import { installSnap } from '@metamask/snaps-jest';
 *
 * const snap = await installSnap();
 * const response = await snap.request({ method: 'hello' });
 *
 * expect(response).toRespondWith('Hello, world!');
 */
export type SnapHelpers = {
  /**
   * Send a JSON-RPC request to the snap.
   *
   * @param request - The request. This is similar to a JSON-RPC request, but
   * has an extra `origin` field.
   * @returns The response promise, with extra {@link SnapRequestObject} fields.
   */
  request(request: RequestOptions): SnapRequest;

  /**
   * Send a transaction to the snap.
   *
   * @param transaction - The transaction. This is similar to an Ethereum
   * transaction object, but has an extra `origin` field. Any missing fields
   * will be filled in with default values.
   * @returns The response.
   */
  onTransaction(
    transaction?: Partial<TransactionOptions>,
  ): Promise<SnapResponseWithInterface>;

  /**
   * Send a transaction to the snap.
   *
   * @param transaction - The transaction. This is similar to an Ethereum
   * transaction object, but has an extra `origin` field. Any missing fields
   * will be filled in with default values.
   * @returns The response.
   * @deprecated Use {@link onTransaction} instead.
   */
  sendTransaction(
    transaction?: Partial<TransactionOptions>,
  ): Promise<SnapResponseWithInterface>;

  /**
   * Send a signature request to the snap.
   *
   * @param signature - The signature request object. Contains the params from
   * the various signature methods, but has an extra `origin` and `signatureMethod` field.
   * Any missing fields will be filled in with default values.
   * @returns The response.
   */
  onSignature(
    signature?: Partial<SignatureOptions>,
  ): Promise<SnapResponseWithInterface>;

  /**
   * Run a cronjob in the snap. This is similar to {@link request}, but the
   * request will be sent to the `onCronjob` method of the snap.
   *
   * @param cronjob - The cronjob request. This is similar to a JSON-RPC
   * request, and is normally specified in the snap manifest, under the
   * `endowment:cronjob` permission.
   * @returns The response promise, with extra {@link SnapRequestObject} fields.
   */
  onCronjob(cronjob?: Partial<CronjobOptions>): SnapRequest;

  /**
   * Run a cronjob in the snap. This is similar to {@link request}, but the
   * request will be sent to the `onCronjob` method of the snap.
   *
   * @param cronjob - The cronjob request. This is similar to a JSON-RPC
   * request, and is normally specified in the snap manifest, under the
   * `endowment:cronjob` permission.
   * @returns The response promise, with extra {@link SnapRequestObject} fields.
   * @deprecated Use {@link onCronjob} instead.
   */
  runCronjob(cronjob: CronjobOptions): SnapRequest;

  /**
   * Run a background event in the snap. This is similar to {@link request}, but the
   * request will be sent to the `onCronjob` method of the snap.
   *
   * @param backgroundEvent - The background event request. This is similar to a JSON-RPC
   * request, and is normally specified in the `request` param of the `snap_scheduleBackgroundEvent` method.
   * @returns The response promise, with extra {@link SnapRequestObject} fields.
   */
  onBackgroundEvent(backgroundEvent: CronjobOptions): SnapRequest;

  /**
   * Get the response from the snap's `onHomePage` method.
   *
   * @returns The response.
   */
  onHomePage(): Promise<SnapResponseWithInterface>;

  /**
   * Get the response from the snap's `onSettingsPage` method.
   *
   * @returns The response.
   */
  onSettingsPage(): Promise<SnapResponseWithInterface>;

  /**
   * Send a keyring request to the Snap.
   *
   * @param keyringRequest - Keyring request.
   * @returns The response.
   */
  onKeyringRequest(
    keyringRequest: KeyringOptions,
  ): Promise<SnapResponseWithoutInterface>;

  /**
   * Get the response from the Snap's `onInstall` handler.
   *
   * @returns The response.
   */
  onInstall(request?: Pick<RequestOptions, 'origin'>): SnapRequest;

  /**
   * Get the response from the Snap's `onUpdate` handler.
   *
   * @returns The response.
   */
  onUpdate(request?: Pick<RequestOptions, 'origin'>): SnapRequest;

  /**
   * Get the response from the Snap's `onNameLookup` handler.
   *
   * @returns The response.
   */
  onNameLookup(
    request: NameLookupOptions,
  ): Promise<SnapResponseWithoutInterface>;

  /**
   * Mock a JSON-RPC request. This will cause the snap to respond with the
   * specified response when a request with the specified method is sent.
   *
   * @param mock - The mock options.
   * @param mock.method - The JSON-RPC request method.
   * @param mock.result - The JSON-RPC response, which will be returned when a
   * request with the specified method is sent.
   * @example
   * import { installSnap } from '@metamask/snaps-jest';
   *
   * // In the test
   * const snap = await installSnap();
   * snap.mockJsonRpc({ method: 'eth_accounts', result: ['0x1234'] });
   *
   * // In the Snap
   * const response =
   *   await ethereum.request({ method: 'eth_accounts' }); // ['0x1234']
   */
  mockJsonRpc(mock: JsonRpcMockOptions): {
    /**
     * Remove the mock.
     */
    unmock(): void;
  };

  /**
   * Close the page running the snap. This is mainly useful for cleaning up
   * the test environment, and calling it is not strictly necessary.
   *
   * @returns A promise that resolves when the page is closed.
   */
  close(): Promise<void>;
};

/**
 * Get the helper functions for the Snap.
 *
 * @param snap - The installed Snap.
 * @param snap.snapId - The ID of the Snap.
 * @param snap.store - The Redux store.
 * @param snap.executionService - The execution service.
 * @param snap.runSaga - The `runSaga` function.
 * @param snap.controllerMessenger - The controller messenger.
 * @param snap.options - The simulation options.
 * @returns The Snap helpers.
 */
export function getHelpers({
  snapId,
  store,
  executionService,
  runSaga,
  controllerMessenger,
  options,
}: InstalledSnap & { options: SimulationOptions }): SnapHelpers {
  const onTransaction = async (
    request: TransactionOptions,
  ): Promise<SnapResponseWithInterface> => {
    log('Sending transaction %o.', request);

    const {
      origin: transactionOrigin,
      chainId,
      ...transaction
    } = create(request, TransactionOptionsStruct);

    const response = await handleRequest({
      snapId,
      store,
      executionService,
      runSaga,
      controllerMessenger,
      handler: HandlerType.OnTransaction,
      request: {
        method: '',
        params: {
          chainId,
          transaction,
          transactionOrigin,
        },
      },
    });

    assertIsResponseWithInterface(response);

    return response;
  };

  // This can't be async because it returns a `SnapRequest`.
  // eslint-disable-next-line @typescript-eslint/promise-function-async
  const onCronjob = (request: CronjobOptions) => {
    log('Running cronjob %o.', options);

    return handleRequest({
      snapId,
      store,
      executionService,
      controllerMessenger,
      runSaga,
      handler: HandlerType.OnCronjob,
      request,
    });
  };

  const onKeyringRequest = async (
    request: KeyringOptions,
  ): Promise<SnapResponseWithoutInterface> => {
    log('Sending keyring request %o.', request);

    const response = await handleRequest({
      snapId,
      store,
      executionService,
      runSaga,
      controllerMessenger,
      handler: HandlerType.OnKeyringRequest,
      request,
    });

    return response;
  };

  return {
    // This can't be async because it returns a `SnapRequest`.
    // eslint-disable-next-line @typescript-eslint/promise-function-async
    request: (request) => {
      log('Sending request %o.', request);

      return handleRequest({
        snapId,
        store,
        executionService,
        controllerMessenger,
        runSaga,
        handler: HandlerType.OnRpcRequest,
        request,
      });
    },

    onTransaction,
    sendTransaction: onTransaction,

    onKeyringRequest,

    // This can't be async because it returns a `SnapRequest`.
    // eslint-disable-next-line @typescript-eslint/promise-function-async
    onInstall: (request?: Pick<RequestOptions, 'origin'>) => {
      log('Running onInstall handler.');

      return handleRequest({
        snapId,
        store,
        executionService,
        controllerMessenger,
        runSaga,
        handler: HandlerType.OnInstall,
        request: {
          method: '',
          ...request,
        },
      });
    },

    // This can't be async because it returns a `SnapRequest`.
    // eslint-disable-next-line @typescript-eslint/promise-function-async
    onUpdate: (request?: Pick<RequestOptions, 'origin'>) => {
      log('Running onUpdate handler.');

      return handleRequest({
        snapId,
        store,
        executionService,
        controllerMessenger,
        runSaga,
        handler: HandlerType.OnUpdate,
        request: {
          method: '',
          ...request,
        },
      });
    },

    onNameLookup: async (
      nameLookupOptions: NameLookupOptions,
    ): Promise<SnapResponseWithoutInterface> => {
      log('Requesting name lookup %o.', nameLookupOptions);

      const params = create(nameLookupOptions, NameLookupOptionsStruct);

      const response = await handleRequest({
        snapId,
        store,
        executionService,
        controllerMessenger,
        runSaga,
        handler: HandlerType.OnNameLookup,
        request: {
          method: '',
          params,
        },
      });

      return response;
    },

    onSignature: async (
      request: unknown,
    ): Promise<SnapResponseWithInterface> => {
      log('Requesting signature %o.', request);

      const { origin: signatureOrigin, ...signature } = create(
        request,
        SignatureOptionsStruct,
      );

      const response = await handleRequest({
        snapId,
        store,
        executionService,
        controllerMessenger,
        runSaga,
        handler: HandlerType.OnSignature,
        request: {
          method: '',
          params: {
            signature,
            signatureOrigin,
          },
        },
      });

      assertIsResponseWithInterface(response);

      return response;
    },

    onCronjob,
    runCronjob: onCronjob,
    onBackgroundEvent: onCronjob,

    onHomePage: async (): Promise<SnapResponseWithInterface> => {
      log('Rendering home page.');

      const response = await handleRequest({
        snapId,
        store,
        executionService,
        controllerMessenger,
        runSaga,
        handler: HandlerType.OnHomePage,
        request: {
          method: '',
        },
      });

      assertIsResponseWithInterface(response);

      return response;
    },

    onSettingsPage: async (): Promise<SnapResponseWithInterface> => {
      log('Rendering settings page.');

      const response = await handleRequest({
        snapId,
        store,
        executionService,
        controllerMessenger,
        runSaga,
        handler: HandlerType.OnSettingsPage,
        request: {
          method: '',
        },
      });

      assertIsResponseWithInterface(response);

      return response;
    },

    mockJsonRpc(mock: JsonRpcMockOptions) {
      log('Mocking JSON-RPC request %o.', mock);

      const { method, result } = create(mock, JsonRpcMockOptionsStruct);
      store.dispatch(addJsonRpcMock({ method, result }));

      return {
        unmock() {
          log('Unmocking JSON-RPC request %o.', mock);

          store.dispatch(removeJsonRpcMock(method));
        },
      };
    },

    close: async () => {
      log('Closing execution service.');
      await executionService.terminateAllSnaps();
    },
  };
}
