"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/handlers.ts
var _snapssdk = require('@metamask/snaps-sdk');










var _superstruct = require('@metamask/superstruct');
var SNAP_EXPORTS = {
  ["onRpcRequest" /* OnRpcRequest */]: {
    type: "onRpcRequest" /* OnRpcRequest */,
    required: true,
    validator: (snapExport) => {
      return typeof snapExport === "function";
    }
  },
  ["onTransaction" /* OnTransaction */]: {
    type: "onTransaction" /* OnTransaction */,
    required: true,
    validator: (snapExport) => {
      return typeof snapExport === "function";
    }
  },
  ["onCronjob" /* OnCronjob */]: {
    type: "onCronjob" /* OnCronjob */,
    required: true,
    validator: (snapExport) => {
      return typeof snapExport === "function";
    }
  },
  ["onNameLookup" /* OnNameLookup */]: {
    type: "onNameLookup" /* OnNameLookup */,
    required: true,
    validator: (snapExport) => {
      return typeof snapExport === "function";
    }
  },
  ["onInstall" /* OnInstall */]: {
    type: "onInstall" /* OnInstall */,
    required: false,
    validator: (snapExport) => {
      return typeof snapExport === "function";
    }
  },
  ["onUpdate" /* OnUpdate */]: {
    type: "onUpdate" /* OnUpdate */,
    required: false,
    validator: (snapExport) => {
      return typeof snapExport === "function";
    }
  },
  ["onKeyringRequest" /* OnKeyringRequest */]: {
    type: "onKeyringRequest" /* OnKeyringRequest */,
    required: true,
    validator: (snapExport) => {
      return typeof snapExport === "function";
    }
  },
  ["onHomePage" /* OnHomePage */]: {
    type: "onHomePage" /* OnHomePage */,
    required: true,
    validator: (snapExport) => {
      return typeof snapExport === "function";
    }
  },
  ["onSignature" /* OnSignature */]: {
    type: "onSignature" /* OnSignature */,
    required: true,
    validator: (snapExport) => {
      return typeof snapExport === "function";
    }
  },
  ["onUserInput" /* OnUserInput */]: {
    type: "onUserInput" /* OnUserInput */,
    required: false,
    validator: (snapExport) => {
      return typeof snapExport === "function";
    }
  }
};
var OnTransactionSeverityResponseStruct = _superstruct.object.call(void 0, {
  severity: _superstruct.optional.call(void 0, _superstruct.literal.call(void 0, _snapssdk.SeverityLevel.Critical))
});
var OnTransactionResponseWithIdStruct = _superstruct.assign.call(void 0, 
  OnTransactionSeverityResponseStruct,
  _superstruct.object.call(void 0, {
    id: _superstruct.string.call(void 0, )
  })
);
var OnTransactionResponseWithContentStruct = _superstruct.assign.call(void 0, 
  OnTransactionSeverityResponseStruct,
  _superstruct.object.call(void 0, {
    content: _snapssdk.ComponentOrElementStruct
  })
);
var OnTransactionResponseStruct = _superstruct.nullable.call(void 0, 
  _superstruct.union.call(void 0, [
    OnTransactionResponseWithContentStruct,
    OnTransactionResponseWithIdStruct
  ])
);
var OnSignatureResponseStruct = OnTransactionResponseStruct;
var OnHomePageResponseWithContentStruct = _superstruct.object.call(void 0, {
  content: _snapssdk.ComponentOrElementStruct
});
var OnHomePageResponseWithIdStruct = _superstruct.object.call(void 0, {
  id: _superstruct.string.call(void 0, )
});
var OnHomePageResponseStruct = _superstruct.union.call(void 0, [
  OnHomePageResponseWithContentStruct,
  OnHomePageResponseWithIdStruct
]);
var AddressResolutionStruct = _superstruct.object.call(void 0, {
  protocol: _superstruct.string.call(void 0, ),
  resolvedDomain: _superstruct.string.call(void 0, )
});
var DomainResolutionStruct = _superstruct.object.call(void 0, {
  protocol: _superstruct.string.call(void 0, ),
  resolvedAddress: _superstruct.string.call(void 0, ),
  domainName: _superstruct.string.call(void 0, )
});
var AddressResolutionResponseStruct = _superstruct.object.call(void 0, {
  resolvedDomains: _superstruct.size.call(void 0, _superstruct.array.call(void 0, AddressResolutionStruct), 1, Infinity)
});
var DomainResolutionResponseStruct = _superstruct.object.call(void 0, {
  resolvedAddresses: _superstruct.size.call(void 0, _superstruct.array.call(void 0, DomainResolutionStruct), 1, Infinity)
});
var OnNameLookupResponseStruct = _superstruct.nullable.call(void 0, 
  _superstruct.union.call(void 0, [AddressResolutionResponseStruct, DomainResolutionResponseStruct])
);
















exports.SNAP_EXPORTS = SNAP_EXPORTS; exports.OnTransactionSeverityResponseStruct = OnTransactionSeverityResponseStruct; exports.OnTransactionResponseWithIdStruct = OnTransactionResponseWithIdStruct; exports.OnTransactionResponseWithContentStruct = OnTransactionResponseWithContentStruct; exports.OnTransactionResponseStruct = OnTransactionResponseStruct; exports.OnSignatureResponseStruct = OnSignatureResponseStruct; exports.OnHomePageResponseWithContentStruct = OnHomePageResponseWithContentStruct; exports.OnHomePageResponseWithIdStruct = OnHomePageResponseWithIdStruct; exports.OnHomePageResponseStruct = OnHomePageResponseStruct; exports.AddressResolutionStruct = AddressResolutionStruct; exports.DomainResolutionStruct = DomainResolutionStruct; exports.AddressResolutionResponseStruct = AddressResolutionResponseStruct; exports.DomainResolutionResponseStruct = DomainResolutionResponseStruct; exports.OnNameLookupResponseStruct = OnNameLookupResponseStruct;
//# sourceMappingURL=chunk-X2GGUOMY.js.map