import { NotificationType, enumValue } from '@metamask/snaps-sdk';
import { JSXElementStruct } from '@metamask/snaps-sdk/jsx';
import {
  array,
  assign,
  bigint,
  coerce,
  defaulted,
  instance,
  literal,
  number,
  object,
  optional,
  string,
  union,
  record,
  any,
  func,
  type,
} from '@metamask/superstruct';
import {
  bytesToHex,
  JsonStruct,
  StrictHexStruct,
  valueToBytes,
} from '@metamask/utils';
import { randomBytes } from 'crypto';

// TODO: Export this from `@metamask/utils` instead.
const BytesLikeStruct = union([
  bigint(),
  number(),
  string(),
  instance(Uint8Array),
]);

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
      return bytesToHex(valueToBytes(value));
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
      return bytesToHex(valueToBytes(value));
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

export const SignatureOptionsStruct = object({
  /**
   * The origin making the signature request.
   */
  origin: defaulted(string(), 'metamask.io'),

  /**
   * The address signing the signature request. Defaults to a randomly generated
   * address.
   */
  from: coerce(StrictHexStruct, optional(BytesLikeStruct), (value) => {
    if (value) {
      return bytesToHex(valueToBytes(value));
    }

    return bytesToHex(randomBytes(20));
  }),

  /**
   * The data to send with the transaction. The data may be specified as a
   * `string`, an object, or an array of objects. This covers the data types
   * for the supported signature methods. Defaults to `0x`.
   */
  data: defaulted(
    union([
      StrictHexStruct,
      literal('0x'),
      record(string(), any()),
      array(record(string(), any())),
    ]),
    '0x',
  ),

  /**
   * The signature method being used.
   */
  signatureMethod: defaulted(
    union([
      literal('eth_sign'),
      literal('personal_sign'),
      literal('eth_signTypedData'),
      literal('eth_signTypedData_v3'),
      literal('eth_signTypedData_v4'),
    ]),
    'personal_sign',
  ),
});

export const SnapOptionsStruct = object({
  /**
   * The timeout in milliseconds to use for requests to the snap. Defaults to
   * `1000`.
   */
  timeout: defaulted(optional(number()), 1000),
});

export const JsonRpcMockOptionsStruct = object({
  method: string(),
  result: JsonStruct,
});

export const InterfaceStruct = type({
  content: optional(JSXElementStruct),
});

export const SnapResponseWithoutInterfaceStruct = object({
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
      type: union([
        enumValue(NotificationType.InApp),
        enumValue(NotificationType.Native),
      ]),
    }),
  ),
});

export const SnapResponseWithInterfaceStruct = assign(
  SnapResponseWithoutInterfaceStruct,
  object({
    getInterface: func(),
  }),
);

export const SnapResponseStruct = union([
  SnapResponseWithoutInterfaceStruct,
  SnapResponseWithInterfaceStruct,
]);
