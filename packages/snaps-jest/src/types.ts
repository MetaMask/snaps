import { Component } from '@metamask/snaps-ui';
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
  union,
} from 'superstruct';

/* eslint-disable @typescript-eslint/consistent-type-definitions */
declare module 'expect' {
  interface AsymmetricMatchers {
    toRespondWith(response: unknown): void;
    toRespondWithError(error: unknown): void;
    toSendNotification(message: string): void;
    toShowInterface(component: Component): void;
  }

  // Ideally we would use `Matchers<Result>` instead of `Matchers<R>`, but
  // TypeScript doesn't allow this:
  // TS2428: All declarations of 'Matchers' must have identical type parameters.
  interface Matchers<R> {
    toRespondWith(response: unknown): R;
    toRespondWithError(error: unknown): R;
    toSendNotification(message: string): R;
    toShowInterface(component: Component): R;
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

export type Mock = {
  unmock(): void;
};

export type Snap = {
  /**
   * Send a JSON-RPC request to the snap.
   *
   * @param request - The request. This is similar to a JSON-RPC request, but
   * has an extra `origin` field.
   * @returns The response.
   */
  request(request: RequestOptions): Promise<SnapResponse>;

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
};

export const SnapResponseStruct = object({
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

  ui: optional(JsonStruct),
});

export type SnapResponse = Infer<typeof SnapResponseStruct>;
