import type { NotificationType } from '@metamask/rpc-methods';
import type { Component } from '@metamask/snaps-ui';
import type { EnumToUnion } from '@metamask/snaps-utils';
import type { JsonRpcId, JsonRpcParams } from '@metamask/utils';
import type { Infer } from 'superstruct';

import type {
  Mock,
  MockJsonRpcOptions,
  MockOptions,
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

/**
 * Deeply partialize a type.
 *
 * @template Type - The type to partialize.
 * @returns The deeply partialized type.
 * @example
 * ```ts
 * type Foo = {
 *   bar: {
 *     baz: string;
 *   };
 *   qux: number;
 * };
 *
 * type PartialFoo = DeepPartial<Foo>;
 * // { bar?: { baz?: string; }; qux?: number; }
 * ```
 */
export type DeepPartial<Type> = {
  [Key in keyof Type]?: Type[Key] extends Record<string, unknown>
    ? DeepPartial<Type[Key]>
    : Type[Key];
};

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
 * This is the main entry point to interact with the snap. It is returned by
 * {@link installSnap}, and has methods to send requests to the snap.
 *
 * @example
 * ```ts
 * import { installSnap } from '@metamask/snaps-jest';
 *
 * const snap = await installSnap();
 * const response = await snap.request({ method: 'hello' });
 *
 * expect(response).toRespondWith('Hello, world!');
 * ```
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
  sendTransaction(
    transaction?: Partial<TransactionOptions>,
  ): Promise<SnapResponse>;

  /**
   * Run a cronjob in the snap. This is similar to {@link request}, but the
   * request will be sent to the `onCronjob` method of the snap.
   *
   * @param cronjob - The cronjob request. This is similar to a JSON-RPC
   * request, and is normally specified in the snap manifest, under the
   * `endowment:cronjob` permission.
   * @returns The response promise, with extra {@link SnapRequestObject} fields.
   */
  runCronjob(cronjob: CronjobOptions): SnapRequest;

  /**
   * Close the page running the snap. This is mainly useful for cleaning up
   * the test environment, and calling it is not strictly necessary.
   *
   * @returns A promise that resolves when the page is closed.
   */
  // TODO: Find a way to do this automatically.
  close(): Promise<void>;

  /**
   * Enable network mocking for the snap.
   *
   * @param options - The options for the network mocking.
   * @returns A {@link Mock} object, with an `unmock` function.
   */
  mock(options: DeepPartial<MockOptions>): Promise<Mock>;

  /**
   * Enable JSON-RPC provider mocking for the snap. This will mock any requests
   * sent through the `ethereum` global, with the specified `method`.
   *
   * @param options - The options for the JSON-RPC mocking.
   * @param options.method - The JSON-RPC method to mock, e.g.,
   * `eth_blockNumber`.
   * @param options.result - The JSON value to return.
   * @returns A {@link Mock} object, with an `unmock` function.
   */
  mockJsonRpc(options: MockJsonRpcOptions): Promise<Mock>;
};

export type SnapResponse = Infer<typeof SnapResponseStruct>;

export { NotificationType } from '@metamask/rpc-methods';
