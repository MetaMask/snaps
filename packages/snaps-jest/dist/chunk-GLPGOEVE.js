"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/internals/structs.ts
var _snapssdk = require('@metamask/snaps-sdk');
var _jsx = require('@metamask/snaps-sdk/jsx');

















var _superstruct = require('@metamask/superstruct');





var _utils = require('@metamask/utils');
var _crypto = require('crypto');
var BytesLikeStruct = _superstruct.union.call(void 0, [
  _superstruct.bigint.call(void 0, ),
  _superstruct.number.call(void 0, ),
  _superstruct.string.call(void 0, ),
  _superstruct.instance.call(void 0, Uint8Array)
]);
var TransactionOptionsStruct = _superstruct.object.call(void 0, {
  /**
   * The CAIP-2 chain ID to send the transaction on. Defaults to `eip155:1`.
   */
  chainId: _superstruct.defaulted.call(void 0, _superstruct.string.call(void 0, ), "eip155:1"),
  /**
   * The origin to send the transaction from. Defaults to `metamask.io`.
   */
  origin: _superstruct.defaulted.call(void 0, _superstruct.string.call(void 0, ), "metamask.io"),
  /**
   * The address to send the transaction from. Defaults to a randomly generated
   * address.
   */
  // TODO: Move this coercer to `@metamask/utils`.
  from: _superstruct.coerce.call(void 0, _utils.StrictHexStruct, _superstruct.optional.call(void 0, BytesLikeStruct), (value) => {
    if (value) {
      return _utils.bytesToHex.call(void 0, _utils.valueToBytes.call(void 0, value));
    }
    return _utils.bytesToHex.call(void 0, _crypto.randomBytes.call(void 0, 20));
  }),
  /**
   * The address to send the transaction to. Defaults to a randomly generated
   * address.
   */
  // TODO: Move this coercer to `@metamask/utils`.
  to: _superstruct.coerce.call(void 0, _utils.StrictHexStruct, _superstruct.optional.call(void 0, BytesLikeStruct), (value) => {
    if (value) {
      return _utils.bytesToHex.call(void 0, _utils.valueToBytes.call(void 0, value));
    }
    return _utils.bytesToHex.call(void 0, _crypto.randomBytes.call(void 0, 20));
  }),
  /**
   * The value to send with the transaction. The value may be specified as a
   * `number`, `bigint`, `string`, or `Uint8Array`. Defaults to `0`.
   */
  value: _superstruct.defaulted.call(void 0, 
    _superstruct.coerce.call(void 0, 
      _utils.StrictHexStruct,
      BytesLikeStruct,
      (value) => _utils.bytesToHex.call(void 0, _utils.valueToBytes.call(void 0, value))
    ),
    "0x0"
  ),
  /**
   * The gas limit to use for the transaction. The gas limit may be specified
   * as a `number`, `bigint`, `string`, or `Uint8Array`. Defaults to `21_000`.
   */
  gasLimit: _superstruct.defaulted.call(void 0, 
    _superstruct.coerce.call(void 0, 
      _utils.StrictHexStruct,
      BytesLikeStruct,
      (value) => _utils.bytesToHex.call(void 0, _utils.valueToBytes.call(void 0, value))
    ),
    _utils.valueToBytes.call(void 0, 21e3)
  ),
  /**
   * The max fee per gas (in Wei) to use for the transaction. The max fee per
   * gas may be specified as a `number`, `bigint`, `string`, or `Uint8Array`.
   * Defaults to `1`.
   */
  maxFeePerGas: _superstruct.defaulted.call(void 0, 
    _superstruct.coerce.call(void 0, 
      _utils.StrictHexStruct,
      BytesLikeStruct,
      (value) => _utils.bytesToHex.call(void 0, _utils.valueToBytes.call(void 0, value))
    ),
    _utils.valueToBytes.call(void 0, 1)
  ),
  /**
   * The max priority fee per gas (in Wei) to use for the transaction. The max
   * priority fee per gas may be specified as a `number`, `bigint`, `string`,
   * or `Uint8Array`. Defaults to `1`.
   */
  maxPriorityFeePerGas: _superstruct.defaulted.call(void 0, 
    _superstruct.coerce.call(void 0, 
      _utils.StrictHexStruct,
      BytesLikeStruct,
      (value) => _utils.bytesToHex.call(void 0, _utils.valueToBytes.call(void 0, value))
    ),
    _utils.valueToBytes.call(void 0, 1)
  ),
  /**
   * The nonce to use for the transaction. The nonce may be specified as a
   * `number`, `bigint`, `string`, or `Uint8Array`. Defaults to `0`.
   */
  nonce: _superstruct.defaulted.call(void 0, 
    _superstruct.coerce.call(void 0, 
      _utils.StrictHexStruct,
      BytesLikeStruct,
      (value) => _utils.bytesToHex.call(void 0, _utils.valueToBytes.call(void 0, value))
    ),
    _utils.valueToBytes.call(void 0, 0)
  ),
  /**
   * The data to send with the transaction. The data may be specified as a
   * `number`, `bigint`, `string`, or `Uint8Array`. Defaults to `0x`.
   */
  data: _superstruct.defaulted.call(void 0, 
    _superstruct.coerce.call(void 0, 
      _superstruct.union.call(void 0, [_utils.StrictHexStruct, _superstruct.literal.call(void 0, "0x")]),
      BytesLikeStruct,
      (value) => _utils.bytesToHex.call(void 0, _utils.valueToBytes.call(void 0, value))
    ),
    "0x"
  )
});
var SignatureOptionsStruct = _superstruct.object.call(void 0, {
  /**
   * The origin making the signature request.
   */
  origin: _superstruct.defaulted.call(void 0, _superstruct.string.call(void 0, ), "metamask.io"),
  /**
   * The address signing the signature request. Defaults to a randomly generated
   * address.
   */
  from: _superstruct.coerce.call(void 0, _utils.StrictHexStruct, _superstruct.optional.call(void 0, BytesLikeStruct), (value) => {
    if (value) {
      return _utils.bytesToHex.call(void 0, _utils.valueToBytes.call(void 0, value));
    }
    return _utils.bytesToHex.call(void 0, _crypto.randomBytes.call(void 0, 20));
  }),
  /**
   * The data to send with the transaction. The data may be specified as a
   * `string`, an object, or an array of objects. This covers the data types
   * for the supported signature methods. Defaults to `0x`.
   */
  data: _superstruct.defaulted.call(void 0, 
    _superstruct.union.call(void 0, [
      _utils.StrictHexStruct,
      _superstruct.literal.call(void 0, "0x"),
      _superstruct.record.call(void 0, _superstruct.string.call(void 0, ), _superstruct.any.call(void 0, )),
      _superstruct.array.call(void 0, _superstruct.record.call(void 0, _superstruct.string.call(void 0, ), _superstruct.any.call(void 0, )))
    ]),
    "0x"
  ),
  /**
   * The signature method being used.
   */
  signatureMethod: _superstruct.defaulted.call(void 0, 
    _superstruct.union.call(void 0, [
      _superstruct.literal.call(void 0, "eth_sign"),
      _superstruct.literal.call(void 0, "personal_sign"),
      _superstruct.literal.call(void 0, "eth_signTypedData"),
      _superstruct.literal.call(void 0, "eth_signTypedData_v3"),
      _superstruct.literal.call(void 0, "eth_signTypedData_v4")
    ]),
    "personal_sign"
  )
});
var SnapOptionsStruct = _superstruct.object.call(void 0, {
  /**
   * The timeout in milliseconds to use for requests to the snap. Defaults to
   * `1000`.
   */
  timeout: _superstruct.defaulted.call(void 0, _superstruct.optional.call(void 0, _superstruct.number.call(void 0, )), 1e3)
});
var JsonRpcMockOptionsStruct = _superstruct.object.call(void 0, {
  method: _superstruct.string.call(void 0, ),
  result: _utils.JsonStruct
});
var InterfaceStruct = _superstruct.type.call(void 0, {
  content: _superstruct.optional.call(void 0, _jsx.JSXElementStruct)
});
var SnapResponseWithoutInterfaceStruct = _superstruct.object.call(void 0, {
  id: _superstruct.string.call(void 0, ),
  response: _superstruct.union.call(void 0, [
    _superstruct.object.call(void 0, {
      result: _utils.JsonStruct
    }),
    _superstruct.object.call(void 0, {
      error: _utils.JsonStruct
    })
  ]),
  notifications: _superstruct.array.call(void 0, 
    _superstruct.object.call(void 0, {
      id: _superstruct.string.call(void 0, ),
      message: _superstruct.string.call(void 0, ),
      type: _superstruct.union.call(void 0, [
        _snapssdk.enumValue.call(void 0, _snapssdk.NotificationType.InApp),
        _snapssdk.enumValue.call(void 0, _snapssdk.NotificationType.Native)
      ])
    })
  )
});
var SnapResponseWithInterfaceStruct = _superstruct.assign.call(void 0, 
  SnapResponseWithoutInterfaceStruct,
  _superstruct.object.call(void 0, {
    getInterface: _superstruct.func.call(void 0, )
  })
);
var SnapResponseStruct = _superstruct.union.call(void 0, [
  SnapResponseWithoutInterfaceStruct,
  SnapResponseWithInterfaceStruct
]);










exports.TransactionOptionsStruct = TransactionOptionsStruct; exports.SignatureOptionsStruct = SignatureOptionsStruct; exports.SnapOptionsStruct = SnapOptionsStruct; exports.JsonRpcMockOptionsStruct = JsonRpcMockOptionsStruct; exports.InterfaceStruct = InterfaceStruct; exports.SnapResponseWithoutInterfaceStruct = SnapResponseWithoutInterfaceStruct; exports.SnapResponseWithInterfaceStruct = SnapResponseWithInterfaceStruct; exports.SnapResponseStruct = SnapResponseStruct;
//# sourceMappingURL=chunk-GLPGOEVE.js.map