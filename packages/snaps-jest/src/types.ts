import { Component, ComponentStruct } from '@metamask/snaps-ui';
import {
  bytesToHex,
  JsonRpcId,
  JsonRpcParams,
  JsonStruct,
  StrictHexStruct,
  valueToBytes,
} from '@metamask/utils';
import { randomBytes } from 'crypto';
import {
  array,
  assign,
  bigint,
  coerce,
  defaulted,
  Infer,
  instance,
  literal,
  number,
  object,
  optional,
  string,
  type,
  union,
} from 'superstruct';

/* eslint-disable @typescript-eslint/consistent-type-definitions */
declare module 'expect' {
  interface AsymmetricMatchers {
    toRespondWith(response: unknown): void;
    toRespondWithError(error: unknown): void;
    toSendNotification(message: string): void;
    toRender(component: Component): void;
  }

  // Ideally we would use `Matchers<Result>` instead of `Matchers<R>`, but
  // TypeScript doesn't allow this:
  // TS2428: All declarations of 'Matchers' must have identical type parameters.
  interface Matchers<R> {
    toRespondWith(response: unknown): R;
    toRespondWithError(error: unknown): R;
    toSendNotification(message: string): R;
    toRender(component: Component): R;
  }
}
/* eslint-enable @typescript-eslint/consistent-type-definitions */

// TODO: Export this from `@metamask/utils` instead.
const BytesLikeStruct = union([
  bigint(),
  number(),
  string(),
  instance(Uint8Array),
]);

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

export const TransactionOptionsStruct = object({
  /**
   * The CAIP-2 chain ID to send the transaction on. Defaults to `eip155:1`.
   */
  chainId: defaulted(string(), 'eip155:1'),

  /**
   * The origin to send the transaction from. Defaults to `metamask.io`.
   */
  origin: defaulted(string(), 'metamask.io'),

  /**
   * The address to send the transaction from. Defaults to a randomly generated
   * address.
   */
  // TODO: Move this coercer to `@metamask/utils`.
  from: coerce(StrictHexStruct, optional(BytesLikeStruct), (value) => {
    if (value) {
      return valueToBytes(value);
    }

    return bytesToHex(randomBytes(20));
  }),

  /**
   * The address to send the transaction to. Defaults to a randomly generated
   * address.
   */
  // TODO: Move this coercer to `@metamask/utils`.
  to: coerce(StrictHexStruct, optional(BytesLikeStruct), (value) => {
    if (value) {
      return valueToBytes(value);
    }

    return bytesToHex(randomBytes(20));
  }),

  /**
   * The value to send with the transaction. The value may be specified as a
   * `number`, `bigint`, `string`, or `Uint8Array`. Defaults to `0`.
   */
  value: defaulted(
    coerce(StrictHexStruct, BytesLikeStruct, (value) =>
      bytesToHex(valueToBytes(value)),
    ),
    '0x0',
  ),

  /**
   * The gas limit to use for the transaction. The gas limit may be specified
   * as a `number`, `bigint`, `string`, or `Uint8Array`. Defaults to `21_000`.
   */
  gasLimit: defaulted(
    coerce(StrictHexStruct, BytesLikeStruct, (value) =>
      bytesToHex(valueToBytes(value)),
    ),
    valueToBytes(21_000),
  ),

  /**
   * The max fee per gas (in Wei) to use for the transaction. The max fee per
   * gas may be specified as a `number`, `bigint`, `string`, or `Uint8Array`.
   * Defaults to `1`.
   */
  maxFeePerGas: defaulted(
    coerce(StrictHexStruct, BytesLikeStruct, (value) =>
      bytesToHex(valueToBytes(value)),
    ),
    valueToBytes(1),
  ),

  /**
   * The max priority fee per gas (in Wei) to use for the transaction. The max
   * priority fee per gas may be specified as a `number`, `bigint`, `string`,
   * or `Uint8Array`. Defaults to `1`.
   */
  maxPriorityFeePerGas: defaulted(
    coerce(StrictHexStruct, BytesLikeStruct, (value) =>
      bytesToHex(valueToBytes(value)),
    ),
    valueToBytes(1),
  ),

  /**
   * The nonce to use for the transaction. The nonce may be specified as a
   * `number`, `bigint`, `string`, or `Uint8Array`. Defaults to `0`.
   */
  nonce: defaulted(
    coerce(StrictHexStruct, BytesLikeStruct, (value) =>
      bytesToHex(valueToBytes(value)),
    ),
    valueToBytes(0),
  ),

  /**
   * The data to send with the transaction. The data may be specified as a
   * `number`, `bigint`, `string`, or `Uint8Array`. Defaults to `0x`.
   */
  data: defaulted(
    coerce(union([StrictHexStruct, literal('0x')]), BytesLikeStruct, (value) =>
      bytesToHex(valueToBytes(value)),
    ),
    '0x',
  ),
});

export type TransactionOptions = Infer<typeof TransactionOptionsStruct>;

export const SnapOptionsStruct = object({
  /**
   * The timeout in milliseconds to use for requests to the snap. Defaults to
   * `1000`.
   */
  timeout: defaulted(optional(number()), 1000),
});

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

export type SnapRequest = Promise<SnapResponse> & SnapRequestObject;

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
   * Close the page running the snap. This is mainly useful for cleaning up
   * the test environment, and calling it is not strictly necessary.
   *
   * @returns A promise that resolves when the page is closed.
   */
  // TODO: Find a way to do this automatically.
  close(): Promise<void>;
};

export const InterfaceStruct = type({
  content: optional(ComponentStruct),
});

export const SnapResponseStruct = assign(
  InterfaceStruct,
  object({
    id: string(),

    response: union([
      object({
        result: JsonStruct,
      }),
      object({
        error: JsonStruct,
      }),
    ]),

    notifications: array(
      object({
        id: string(),
        message: string(),
      }),
    ),
  }),
);

export type SnapResponse = Infer<typeof SnapResponseStruct>;
