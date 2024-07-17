"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/handler-types.ts
var HandlerType = /* @__PURE__ */ ((HandlerType2) => {
  HandlerType2["OnRpcRequest"] = "onRpcRequest";
  HandlerType2["OnSignature"] = "onSignature";
  HandlerType2["OnTransaction"] = "onTransaction";
  HandlerType2["OnCronjob"] = "onCronjob";
  HandlerType2["OnInstall"] = "onInstall";
  HandlerType2["OnUpdate"] = "onUpdate";
  HandlerType2["OnNameLookup"] = "onNameLookup";
  HandlerType2["OnKeyringRequest"] = "onKeyringRequest";
  HandlerType2["OnHomePage"] = "onHomePage";
  HandlerType2["OnUserInput"] = "onUserInput";
  return HandlerType2;
})(HandlerType || {});
var SNAP_EXPORT_NAMES = Object.values(HandlerType);




exports.HandlerType = HandlerType; exports.SNAP_EXPORT_NAMES = SNAP_EXPORT_NAMES;
//# sourceMappingURL=chunk-LEKZPKS2.js.map