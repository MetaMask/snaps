// src/handlers.ts
import { ComponentOrElementStruct, SeverityLevel } from "@metamask/snaps-sdk";
import {
  assign,
  literal,
  nullable,
  object,
  optional,
  string,
  array,
  size,
  union
} from "@metamask/superstruct";
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
var OnTransactionSeverityResponseStruct = object({
  severity: optional(literal(SeverityLevel.Critical))
});
var OnTransactionResponseWithIdStruct = assign(
  OnTransactionSeverityResponseStruct,
  object({
    id: string()
  })
);
var OnTransactionResponseWithContentStruct = assign(
  OnTransactionSeverityResponseStruct,
  object({
    content: ComponentOrElementStruct
  })
);
var OnTransactionResponseStruct = nullable(
  union([
    OnTransactionResponseWithContentStruct,
    OnTransactionResponseWithIdStruct
  ])
);
var OnSignatureResponseStruct = OnTransactionResponseStruct;
var OnHomePageResponseWithContentStruct = object({
  content: ComponentOrElementStruct
});
var OnHomePageResponseWithIdStruct = object({
  id: string()
});
var OnHomePageResponseStruct = union([
  OnHomePageResponseWithContentStruct,
  OnHomePageResponseWithIdStruct
]);
var AddressResolutionStruct = object({
  protocol: string(),
  resolvedDomain: string()
});
var DomainResolutionStruct = object({
  protocol: string(),
  resolvedAddress: string(),
  domainName: string()
});
var AddressResolutionResponseStruct = object({
  resolvedDomains: size(array(AddressResolutionStruct), 1, Infinity)
});
var DomainResolutionResponseStruct = object({
  resolvedAddresses: size(array(DomainResolutionStruct), 1, Infinity)
});
var OnNameLookupResponseStruct = nullable(
  union([AddressResolutionResponseStruct, DomainResolutionResponseStruct])
);

export {
  SNAP_EXPORTS,
  OnTransactionSeverityResponseStruct,
  OnTransactionResponseWithIdStruct,
  OnTransactionResponseWithContentStruct,
  OnTransactionResponseStruct,
  OnSignatureResponseStruct,
  OnHomePageResponseWithContentStruct,
  OnHomePageResponseWithIdStruct,
  OnHomePageResponseStruct,
  AddressResolutionStruct,
  DomainResolutionStruct,
  AddressResolutionResponseStruct,
  DomainResolutionResponseStruct,
  OnNameLookupResponseStruct
};
//# sourceMappingURL=chunk-4AA3TKRJ.mjs.map