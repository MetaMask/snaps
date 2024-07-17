// src/handler-types.ts
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

export {
  HandlerType,
  SNAP_EXPORT_NAMES
};
//# sourceMappingURL=chunk-5R7UF7KM.mjs.map