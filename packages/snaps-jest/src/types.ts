import type {
  NotificationType,
  EnumToUnion,
  Component,
} from '@metamask/snaps-sdk';
import type { Json, JsonRpcId, JsonRpcParams } from '@metamask/utils';
import type { Infer } from 'superstruct';

import type {
  SignatureOptionsStruct,
  SnapOptionsStruct,
  SnapResponseStruct,
  TransactionOptionsStruct,
} from './internals';

/* eslint-disable @typescript-eslint/consistent-type-definitions */
declare module 'expect' {
  interface AsymmetricMatchers {
    toRespondWith(response: unknown): void;
    toRespondWithError(error: unknown): void;
    toSendNotification(
      message: string,
      type?: EnumToUnion<NotificationType>,
    ): void;
    toRender(component: Component): void;
  }

  // Ideally we would use `Matchers<Result>` instead of `Matchers<R>`, but
  // TypeScript doesn't allow this:
  // TS2428: All declarations of 'Matchers' must have identical type parameters.
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Matchers<R> {
    toRespondWith(response: unknown): R;
    toRespondWithError(error: unknown): R;
    toSendNotification(
      message: string,
      type?: EnumToUnion<NotificationType>,
    ): R;
    toRender(component: Component): R;
  }
}
/* eslint-enable @typescript-eslint/consistent-type-definitions */

export type RequestOptions = {
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

/**
 * The `runCronjob` options. This is the same as {@link RequestOptions}, except
 * that it does not have an `origin` property.
 */
export type CronjobOptions = Omit<RequestOptions, 'origin'>;

/**
 * The options to use for transaction requests.
 *
 * @property chainId - The CAIP-2 chain ID to send the transaction on. Defaults
 * to `eip155:1`.
 * @property origin - The origin to send the transaction from. Defaults to
 * `metamask.io`.
 * @property from - The address to send the transaction from. Defaults to a
 * randomly generated address.
 * @property to - The address to send the transaction to. Defaults to a randomly
 * generated address.
 * @property value - The value to send with the transaction. Defaults to `0`.
 * @property data - The data to send with the transaction. Defaults to `0x`.
 * @property gasLimit - The gas limit to use for the transaction. Defaults to
 * `21_000`.
 * @property maxFeePerGas - The maximum fee per gas to use for the transaction.
 * Defaults to `1`.
 * @property maxPriorityFeePerGas - The maximum priority fee per gas to use for
 * the transaction. Defaults to `1`.
 * @property nonce - The nonce to use for the transaction. Defaults to `0`.
 */
export type TransactionOptions = Infer<typeof TransactionOptionsStruct>;

/**
 * The options to use for signature requests.
 *
 * @property origin - The origin to send the signature request from. Defaults to
 * `metamask.io`.
 * @property from - The address to send the signature from. Defaults to a
 * randomly generated address.
 * @property data - The data to sign. Defaults to `0x`.
 * @property signatureMethod - The signature method.
 */
export type SignatureOptions = Infer<typeof SignatureOptionsStruct>;

/**
 * The options to use for requests to the snap.
 *
 * @property timeout - The timeout in milliseconds to use. Defaults to `1000`.
 */
export type SnapOptions = Infer<typeof SnapOptionsStruct>;

/**
 * A `snap_dialog` alert interface.
 */
export type SnapAlertInterface = {
  /**
   * The type of the interface. This is always `alert`.
   */
  type: 'alert';

  /**
   * The content to show in the alert.
   */
  content: Component;

  /**
   * Close the alert.
   */
  ok(): Promise<void>;
};

/**
 * A `snap_dialog` confirmation interface.
 */
export type SnapConfirmationInterface = {
  /**
   * The type of the interface. This is always `confirmation`.
   */
  type: 'confirmation';

  /**
   * The content to show in the confirmation.
   */
  content: Component;

  /**
   * Close the confirmation.
   */
  ok(): Promise<void>;

  /**
   * Cancel the confirmation.
   */
  cancel(): Promise<void>;
};

/**
 * A `snap_dialog` prompt interface.
 */
export type SnapPromptInterface = {
  /**
   * The type of the interface. This is always `prompt`.
   */
  type: 'prompt';

  /**
   * The content to show in the prompt.
   */
  content: Component;

  /**
   * Close the prompt.
   *
   * @param value - The value to close the prompt with.
   */
  ok(value?: string): Promise<void>;

  /**
   * Cancel the prompt.
   */
  cancel(): Promise<void>;
};

export type SnapInterface =
  | SnapAlertInterface
  | SnapConfirmationInterface
  | SnapPromptInterface;

export type SnapRequestObject = {
  /**
   * Get a user interface object from a snap. This will throw an error if the
   * snap does not show a user interface within the timeout.
   *
   * @param options - The options to use.
   * @param options.timeout - The timeout in milliseconds to use. Defaults to
   * `1000`.
   * @returns The user interface object.
   */
  getInterface(options?: SnapOptions): Promise<SnapInterface>;
};

/**
 * A pending request object. This is a promise with extra
 * {@link SnapRequestObject} fields.
 */
export type SnapRequest = Promise<SnapResponse> & SnapRequestObject;

/**
 * The options to use for mocking a JSON-RPC request.
 */
export type JsonRpcMockOptions = {
  /**
   * The JSON-RPC request method.
   */
  method: string;

  /**
   * The JSON-RPC response, which will be returned when a request with the
   * specified method is sent.
   */
  result: Json;
};

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
export type Snap = {
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
  ): Promise<SnapResponse>;

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
  ): Promise<SnapResponse>;

  /**
   * Send a signature request to the snap.
   *
   * @param signature - The signature request object. Contains the params from
   * the various signature methods, but has an extra `origin` and `signatureMethod` field.
   * Any missing fields will be filled in with default values.
   * @returns The response.
   */
  onSignature(signature?: Partial<SignatureOptions>): Promise<SnapResponse>;

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
   * Get the response from the snap's `onHomePage` method.
   *
   * @returns The response.
   */
  onHomePage(): Promise<SnapResponse>;

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
   * @deprecated Snaps are now automatically closed when the test ends. This
   * method will be removed in a future release.
   */
  close(): Promise<void>;
};

export type SnapResponse = Infer<typeof SnapResponseStruct>;
