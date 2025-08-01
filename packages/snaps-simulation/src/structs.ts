import { NotificationType, enumValue } from '@metamask/snaps-sdk';
import { JSXElementStruct } from '@metamask/snaps-sdk/jsx';
import { TrackableErrorStruct } from '@metamask/snaps-utils';
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
  boolean,
} from '@metamask/superstruct';
import {
  assertStruct,
  bytesToHex,
  JsonStruct,
  StrictHexStruct,
  valueToBytes,
} from '@metamask/utils';
import { randomBytes } from 'crypto';

import type { SnapResponse, SnapResponseWithInterface } from './types';

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
      literal('personal_sign'),
      literal('eth_signTypedData'),
      literal('eth_signTypedData_v3'),
      literal('eth_signTypedData_v4'),
    ]),
    'personal_sign',
  ),
});

export const BaseNameLookupOptionsStruct = object({
  /**
   * The CAIP-2 chain ID. Defaults to `eip155:1`.
   */
  chainId: defaulted(string(), 'eip155:1'),
});

export const NameLookupOptionsStruct = union([
  assign(
    BaseNameLookupOptionsStruct,
    object({
      /**
       * Address to lookup.
       */
      address: string(),
    }),
  ),
  assign(
    BaseNameLookupOptionsStruct,
    object({
      /**
       * Domain name to lookup.
       */
      domain: string(),
    }),
  ),
]);

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
      title: optional(string()),
      content: optional(string()),
      footerLink: optional(
        object({
          href: string(),
          text: string(),
        }),
      ),
    }),
  ),

  tracked: object({
    errors: array(TrackableErrorStruct),

    events: array(
      object({
        event: string(),
        properties: optional(record(string(), JsonStruct)),
        sensitiveProperties: optional(record(string(), JsonStruct)),
      }),
    ),

    traces: array(
      object({
        id: optional(string()),
        name: string(),
        parentContext: optional(JsonStruct),
        startTime: optional(number()),
        data: optional(
          record(string(), union([string(), number(), boolean()])),
        ),
        tags: optional(
          record(string(), union([string(), number(), boolean()])),
        ),
      }),
    ),
  }),
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

/**
 * Ensure that the actual response contains `getInterface`.
 *
 * @param response - The response of the handler.
 */
export function assertIsResponseWithInterface(
  response: SnapResponse,
): asserts response is SnapResponseWithInterface {
  assertStruct(response, SnapResponseWithInterfaceStruct);
}
