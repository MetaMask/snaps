"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};

// src/index.ts
var src_exports = {};
__export(src_exports, {
  AddressStruct: () => AddressStruct,
  AuxiliaryFileEncoding: () => AuxiliaryFileEncoding,
  ButtonClickEventStruct: () => ButtonClickEventStruct,
  ButtonStruct: () => ButtonStruct,
  ButtonType: () => ButtonType,
  ButtonVariant: () => ButtonVariant,
  ChainDisconnectedError: () => ChainDisconnectedError,
  ComponentOrElementStruct: () => ComponentOrElementStruct,
  ComponentStruct: () => ComponentStruct,
  CopyableStruct: () => CopyableStruct,
  DialogType: () => DialogType,
  DisconnectedError: () => DisconnectedError,
  DividerStruct: () => DividerStruct,
  FormComponentStruct: () => FormComponentStruct,
  FormStateStruct: () => FormStateStruct,
  FormStruct: () => FormStruct,
  FormSubmitEventStruct: () => FormSubmitEventStruct,
  GenericEventStruct: () => GenericEventStruct,
  HeadingStruct: () => HeadingStruct,
  ImageStruct: () => ImageStruct,
  InputChangeEventStruct: () => InputChangeEventStruct,
  InputStruct: () => InputStruct,
  InputType: () => InputType,
  InterfaceStateStruct: () => InterfaceStateStruct,
  InternalError: () => InternalError,
  InvalidInputError: () => InvalidInputError,
  InvalidParamsError: () => InvalidParamsError,
  InvalidRequestError: () => InvalidRequestError,
  LimitExceededError: () => LimitExceededError,
  ManageStateOperation: () => ManageStateOperation,
  MethodNotFoundError: () => MethodNotFoundError,
  MethodNotSupportedError: () => MethodNotSupportedError,
  NodeType: () => NodeType,
  NotificationType: () => NotificationType,
  PanelStruct: () => PanelStruct,
  ParseError: () => ParseError,
  ResourceNotFoundError: () => ResourceNotFoundError,
  ResourceUnavailableError: () => ResourceUnavailableError,
  RowStruct: () => RowStruct,
  RowVariant: () => RowVariant,
  SNAP_ERROR_CODE: () => SNAP_ERROR_CODE,
  SNAP_ERROR_MESSAGE: () => SNAP_ERROR_MESSAGE,
  SeverityLevel: () => SeverityLevel,
  SnapError: () => SnapError,
  SpinnerStruct: () => SpinnerStruct,
  TextStruct: () => TextStruct,
  TransactionRejected: () => TransactionRejected,
  UnauthorizedError: () => UnauthorizedError,
  UnsupportedMethodError: () => UnsupportedMethodError,
  UserInputEventStruct: () => UserInputEventStruct,
  UserInputEventType: () => UserInputEventType,
  UserRejectedRequestError: () => UserRejectedRequestError,
  address: () => address,
  assert: () => import_utils8.assert,
  assertIsComponent: () => assertIsComponent,
  button: () => button,
  copyable: () => copyable,
  divider: () => divider,
  enumValue: () => enumValue,
  form: () => form,
  getErrorData: () => getErrorData,
  getErrorMessage: () => getErrorMessage,
  getErrorStack: () => getErrorStack,
  getImageComponent: () => getImageComponent,
  getImageData: () => getImageData,
  heading: () => heading,
  image: () => image,
  input: () => input,
  isComponent: () => isComponent,
  isSvg: () => isSvg,
  literal: () => literal,
  panel: () => panel,
  parseSvg: () => parseSvg,
  row: () => row,
  spinner: () => spinner,
  text: () => text,
  union: () => union
});
module.exports = __toCommonJS(src_exports);

// src/errors.ts
var _code, _message, _data, _stack;
var SnapError = class extends Error {
  /**
   * Create a new `SnapError`.
   *
   * @param error - The error to create the `SnapError` from. If this is a
   * `string`, it will be used as the error message. If this is an `Error`, its
   * `message` property will be used as the error message. If this is a
   * `JsonRpcError`, its `message` property will be used as the error message
   * and its `code` property will be used as the error code. Otherwise, the
   * error will be converted to a string and used as the error message.
   * @param data - Additional data to include in the error. This will be merged
   * with the error data, if any.
   */
  constructor(error, data = {}) {
    const message = getErrorMessage(error);
    super(message);
    __privateAdd(this, _code, void 0);
    __privateAdd(this, _message, void 0);
    __privateAdd(this, _data, void 0);
    __privateAdd(this, _stack, void 0);
    __privateSet(this, _message, message);
    __privateSet(this, _code, getErrorCode(error));
    const mergedData = { ...getErrorData(error), ...data };
    if (Object.keys(mergedData).length > 0) {
      __privateSet(this, _data, mergedData);
    }
    __privateSet(this, _stack, super.stack);
  }
  /**
   * The error name.
   *
   * @returns The error name.
   */
  get name() {
    return "SnapError";
  }
  /**
   * The error code.
   *
   * @returns The error code.
   */
  get code() {
    return __privateGet(this, _code);
  }
  /**
   * The error message.
   *
   * @returns The error message.
   */
  // This line is covered, but Jest doesn't pick it up for some reason.
  /* istanbul ignore next */
  get message() {
    return __privateGet(this, _message);
  }
  /**
   * Additional data for the error.
   *
   * @returns Additional data for the error.
   */
  get data() {
    return __privateGet(this, _data);
  }
  /**
   * The error stack.
   *
   * @returns The error stack.
   */
  // This line is covered, but Jest doesn't pick it up for some reason.
  /* istanbul ignore next */
  get stack() {
    return __privateGet(this, _stack);
  }
  /**
   * Convert the error to a JSON object.
   *
   * @returns The JSON object.
   */
  toJSON() {
    return {
      code: SNAP_ERROR_CODE,
      message: SNAP_ERROR_MESSAGE,
      data: {
        cause: {
          code: this.code,
          message: this.message,
          stack: this.stack,
          ...this.data ? { data: this.data } : {}
        }
      }
    };
  }
  /**
   * Serialize the error to a JSON object. This is called by
   * `@metamask/rpc-errors` when serializing the error.
   *
   * @returns The JSON object.
   */
  serialize() {
    return this.toJSON();
  }
};
_code = new WeakMap();
_message = new WeakMap();
_data = new WeakMap();
_stack = new WeakMap();

// src/internals/error-wrappers.ts
function createSnapError(fn) {
  return class SnapJsonRpcError extends SnapError {
    /**
     * Create a new `SnapJsonRpcError` from a message and data.
     *
     * @param message - The message to create the error from.
     * @param data - The data to create the error from.
     */
    constructor(message, data) {
      if (typeof message === "object") {
        const error2 = fn();
        super({
          code: error2.code,
          message: error2.message,
          data: message
        });
        return;
      }
      const error = fn(message);
      super({
        code: error.code,
        message: error.message,
        data
      });
    }
  };
}

// src/internals/errors.ts
var import_utils = require("@metamask/utils");
var SNAP_ERROR_CODE = -31002;
var SNAP_ERROR_MESSAGE = "Snap Error";
function getErrorMessage(error) {
  if ((0, import_utils.isObject)(error) && (0, import_utils.hasProperty)(error, "message") && typeof error.message === "string") {
    return error.message;
  }
  return String(error);
}
function getErrorStack(error) {
  if ((0, import_utils.isObject)(error) && (0, import_utils.hasProperty)(error, "stack") && typeof error.stack === "string") {
    return error.stack;
  }
  return void 0;
}
function getErrorCode(error) {
  if ((0, import_utils.isObject)(error) && (0, import_utils.hasProperty)(error, "code") && typeof error.code === "number" && Number.isInteger(error.code)) {
    return error.code;
  }
  return -32603;
}
function getErrorData(error) {
  if ((0, import_utils.isObject)(error) && (0, import_utils.hasProperty)(error, "data") && typeof error.data === "object" && error.data !== null && (0, import_utils.isValidJson)(error.data) && !Array.isArray(error.data)) {
    return error.data;
  }
  return {};
}

// src/internals/structs.ts
var import_superstruct = require("superstruct");
function literal(value) {
  return (0, import_superstruct.define)(
    JSON.stringify(value),
    (0, import_superstruct.literal)(value).validator
  );
}
function union([
  head,
  ...tail
]) {
  const struct = (0, import_superstruct.union)([head, ...tail]);
  return new import_superstruct.Struct({
    ...struct,
    schema: [head, ...tail]
  });
}
function enumValue(constant) {
  return literal(constant);
}

// src/internals/jsx.ts
function nullUnion(structs) {
  return union(structs);
}

// src/internals/svg.ts
var import_utils2 = require("@metamask/utils");
var import_fast_xml_parser = require("fast-xml-parser");
function parseSvg(svg2) {
  try {
    const trimmed = svg2.trim();
    (0, import_utils2.assert)(trimmed.length > 0);
    const parser = new import_fast_xml_parser.XMLParser({
      ignoreAttributes: false,
      parseAttributeValue: true
    });
    const parsed = parser.parse(trimmed, true);
    (0, import_utils2.assert)((0, import_utils2.hasProperty)(parsed, "svg"));
    if (!(0, import_utils2.isObject)(parsed.svg)) {
      return {};
    }
    return parsed.svg;
  } catch {
    throw new Error("Snap icon must be a valid SVG.");
  }
}
function isSvg(svg2) {
  try {
    parseSvg(svg2);
    return true;
  } catch {
    return false;
  }
}

// src/index.ts
var import_utils8 = require("@metamask/utils");

// src/error-wrappers.ts
var import_rpc_errors = require("@metamask/rpc-errors");
var InternalError = createSnapError(import_rpc_errors.rpcErrors.internal);
var InvalidInputError = createSnapError(import_rpc_errors.rpcErrors.invalidInput);
var InvalidParamsError = createSnapError(import_rpc_errors.rpcErrors.invalidParams);
var InvalidRequestError = createSnapError(import_rpc_errors.rpcErrors.invalidRequest);
var LimitExceededError = createSnapError(import_rpc_errors.rpcErrors.limitExceeded);
var MethodNotFoundError = createSnapError(import_rpc_errors.rpcErrors.methodNotFound);
var MethodNotSupportedError = createSnapError(
  import_rpc_errors.rpcErrors.methodNotSupported
);
var ParseError = createSnapError(import_rpc_errors.rpcErrors.parse);
var ResourceNotFoundError = createSnapError(
  import_rpc_errors.rpcErrors.resourceNotFound
);
var ResourceUnavailableError = createSnapError(
  import_rpc_errors.rpcErrors.resourceUnavailable
);
var TransactionRejected = createSnapError(
  import_rpc_errors.rpcErrors.transactionRejected
);
var ChainDisconnectedError = createSnapError(
  import_rpc_errors.providerErrors.chainDisconnected
);
var DisconnectedError = createSnapError(import_rpc_errors.providerErrors.disconnected);
var UnauthorizedError = createSnapError(import_rpc_errors.providerErrors.unauthorized);
var UnsupportedMethodError = createSnapError(
  import_rpc_errors.providerErrors.unsupportedMethod
);
var UserRejectedRequestError = createSnapError(
  import_rpc_errors.providerErrors.userRejectedRequest
);

// src/images.ts
var import_utils6 = require("@metamask/utils");

// src/ui/components/address.ts
var import_utils4 = require("@metamask/utils");
var import_superstruct3 = require("superstruct");

// src/ui/builder.ts
var import_utils3 = require("@metamask/utils");
function createBuilder(type, struct, keys = []) {
  return (...args) => {
    if (args.length === 1 && (0, import_utils3.isPlainObject)(args[0])) {
      const node2 = { ...args[0], type };
      (0, import_utils3.assertStruct)(node2, struct, `Invalid ${type} component`);
      return node2;
    }
    const node = keys.reduce(
      (partialNode, key, index) => {
        if (args[index] !== void 0) {
          return {
            ...partialNode,
            [key]: args[index]
          };
        }
        return partialNode;
      },
      { type }
    );
    (0, import_utils3.assertStruct)(node, struct, `Invalid ${type} component`);
    return node;
  };
}

// src/ui/nodes.ts
var import_superstruct2 = require("superstruct");
var NodeType = /* @__PURE__ */ ((NodeType2) => {
  NodeType2["Copyable"] = "copyable";
  NodeType2["Divider"] = "divider";
  NodeType2["Heading"] = "heading";
  NodeType2["Panel"] = "panel";
  NodeType2["Spinner"] = "spinner";
  NodeType2["Text"] = "text";
  NodeType2["Image"] = "image";
  NodeType2["Row"] = "row";
  NodeType2["Address"] = "address";
  NodeType2["Button"] = "button";
  NodeType2["Input"] = "input";
  NodeType2["Form"] = "form";
  return NodeType2;
})(NodeType || {});
var NodeStruct = (0, import_superstruct2.object)({
  type: (0, import_superstruct2.string)()
});
var LiteralStruct = (0, import_superstruct2.assign)(
  NodeStruct,
  (0, import_superstruct2.object)({
    value: (0, import_superstruct2.unknown)()
  })
);

// src/ui/components/address.ts
var AddressStruct = (0, import_superstruct3.assign)(
  LiteralStruct,
  (0, import_superstruct3.object)({
    type: (0, import_superstruct3.literal)("address" /* Address */),
    value: import_utils4.HexChecksumAddressStruct
  })
);
var address = createBuilder("address" /* Address */, AddressStruct, [
  "value"
]);

// src/ui/components/copyable.ts
var import_superstruct4 = require("superstruct");
var CopyableStruct = (0, import_superstruct4.assign)(
  LiteralStruct,
  (0, import_superstruct4.object)({
    type: (0, import_superstruct4.literal)("copyable" /* Copyable */),
    value: (0, import_superstruct4.string)(),
    sensitive: (0, import_superstruct4.optional)((0, import_superstruct4.boolean)())
  })
);
var copyable = createBuilder("copyable" /* Copyable */, CopyableStruct, [
  "value",
  "sensitive"
]);

// src/ui/components/divider.ts
var import_superstruct5 = require("superstruct");
var DividerStruct = (0, import_superstruct5.assign)(
  NodeStruct,
  (0, import_superstruct5.object)({
    type: (0, import_superstruct5.literal)("divider" /* Divider */)
  })
);
var divider = createBuilder("divider" /* Divider */, DividerStruct);

// src/ui/components/heading.ts
var import_superstruct6 = require("superstruct");
var HeadingStruct = (0, import_superstruct6.assign)(
  LiteralStruct,
  (0, import_superstruct6.object)({
    type: (0, import_superstruct6.literal)("heading" /* Heading */),
    value: (0, import_superstruct6.string)()
  })
);
var heading = createBuilder("heading" /* Heading */, HeadingStruct, [
  "value"
]);

// src/ui/components/image.ts
var import_superstruct7 = require("superstruct");
function svg() {
  return (0, import_superstruct7.refine)((0, import_superstruct7.string)(), "SVG", (value) => {
    if (!isSvg(value)) {
      return "Value is not a valid SVG.";
    }
    return true;
  });
}
var ImageStruct = (0, import_superstruct7.assign)(
  NodeStruct,
  (0, import_superstruct7.object)({
    type: (0, import_superstruct7.literal)("image" /* Image */),
    value: svg()
  })
);
var image = createBuilder("image" /* Image */, ImageStruct, ["value"]);

// src/ui/components/panel.ts
var import_superstruct14 = require("superstruct");

// src/ui/components/button.ts
var import_superstruct8 = require("superstruct");
var ButtonVariant = /* @__PURE__ */ ((ButtonVariant2) => {
  ButtonVariant2["Primary"] = "primary";
  ButtonVariant2["Secondary"] = "secondary";
  return ButtonVariant2;
})(ButtonVariant || {});
var ButtonType = /* @__PURE__ */ ((ButtonType2) => {
  ButtonType2["Button"] = "button";
  ButtonType2["Submit"] = "submit";
  return ButtonType2;
})(ButtonType || {});
var ButtonStruct = (0, import_superstruct8.assign)(
  LiteralStruct,
  (0, import_superstruct8.object)({
    type: (0, import_superstruct8.literal)("button" /* Button */),
    value: (0, import_superstruct8.string)(),
    variant: (0, import_superstruct8.optional)(
      (0, import_superstruct8.union)([
        enumValue("primary" /* Primary */),
        enumValue("secondary" /* Secondary */)
      ])
    ),
    buttonType: (0, import_superstruct8.optional)(
      (0, import_superstruct8.union)([enumValue("button" /* Button */), enumValue("submit" /* Submit */)])
    ),
    name: (0, import_superstruct8.optional)((0, import_superstruct8.string)())
  })
);
var button = createBuilder("button" /* Button */, ButtonStruct, [
  "value",
  "buttonType",
  "name",
  "variant"
]);

// src/ui/components/form.ts
var import_superstruct10 = require("superstruct");

// src/ui/components/input.ts
var import_superstruct9 = require("superstruct");
var InputType = /* @__PURE__ */ ((InputType2) => {
  InputType2["Text"] = "text";
  InputType2["Number"] = "number";
  InputType2["Password"] = "password";
  return InputType2;
})(InputType || {});
var InputStruct = (0, import_superstruct9.assign)(
  LiteralStruct,
  (0, import_superstruct9.object)({
    type: (0, import_superstruct9.literal)("input" /* Input */),
    value: (0, import_superstruct9.optional)((0, import_superstruct9.string)()),
    name: (0, import_superstruct9.string)(),
    inputType: (0, import_superstruct9.optional)(
      (0, import_superstruct9.union)([
        enumValue("text" /* Text */),
        enumValue("password" /* Password */),
        enumValue("number" /* Number */)
      ])
    ),
    placeholder: (0, import_superstruct9.optional)((0, import_superstruct9.string)()),
    label: (0, import_superstruct9.optional)((0, import_superstruct9.string)()),
    error: (0, import_superstruct9.optional)((0, import_superstruct9.string)())
  })
);
var input = createBuilder("input" /* Input */, InputStruct, [
  "name",
  "inputType",
  "placeholder",
  "value",
  "label"
]);

// src/ui/components/form.ts
var FormComponentStruct = (0, import_superstruct10.union)([InputStruct, ButtonStruct]);
var FormStruct = (0, import_superstruct10.assign)(
  NodeStruct,
  (0, import_superstruct10.object)({
    type: (0, import_superstruct10.literal)("form" /* Form */),
    children: (0, import_superstruct10.array)(FormComponentStruct),
    name: (0, import_superstruct10.string)()
  })
);
var form = createBuilder("form" /* Form */, FormStruct, [
  "name",
  "children"
]);

// src/ui/components/row.ts
var import_superstruct12 = require("superstruct");

// src/ui/components/text.ts
var import_superstruct11 = require("superstruct");
var TextStruct = (0, import_superstruct11.assign)(
  LiteralStruct,
  (0, import_superstruct11.object)({
    type: (0, import_superstruct11.literal)("text" /* Text */),
    value: (0, import_superstruct11.string)(),
    markdown: (0, import_superstruct11.optional)((0, import_superstruct11.boolean)())
  })
);
var text = createBuilder("text" /* Text */, TextStruct, [
  "value",
  "markdown"
]);

// src/ui/components/row.ts
var RowVariant = /* @__PURE__ */ ((RowVariant2) => {
  RowVariant2["Default"] = "default";
  RowVariant2["Critical"] = "critical";
  RowVariant2["Warning"] = "warning";
  return RowVariant2;
})(RowVariant || {});
var RowComponentStruct = (0, import_superstruct12.union)([ImageStruct, TextStruct, AddressStruct]);
var RowStruct = (0, import_superstruct12.assign)(
  LiteralStruct,
  (0, import_superstruct12.object)({
    type: (0, import_superstruct12.literal)("row" /* Row */),
    variant: (0, import_superstruct12.optional)(
      (0, import_superstruct12.union)([
        enumValue("default" /* Default */),
        enumValue("critical" /* Critical */),
        enumValue("warning" /* Warning */)
      ])
    ),
    label: (0, import_superstruct12.string)(),
    value: RowComponentStruct
  })
);
var row = createBuilder("row" /* Row */, RowStruct, [
  "label",
  "value",
  "variant"
]);

// src/ui/components/spinner.ts
var import_superstruct13 = require("superstruct");
var SpinnerStruct = (0, import_superstruct13.assign)(
  NodeStruct,
  (0, import_superstruct13.object)({
    type: (0, import_superstruct13.literal)("spinner" /* Spinner */)
  })
);
var spinner = createBuilder("spinner" /* Spinner */, SpinnerStruct);

// src/ui/components/panel.ts
var ParentStruct = (0, import_superstruct14.assign)(
  NodeStruct,
  (0, import_superstruct14.object)({
    // This node references itself indirectly, so we need to use `lazy()`.
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    children: (0, import_superstruct14.array)((0, import_superstruct14.lazy)(() => ComponentStruct))
  })
);
var PanelStruct = (0, import_superstruct14.assign)(
  ParentStruct,
  (0, import_superstruct14.object)({
    type: (0, import_superstruct14.literal)("panel" /* Panel */)
  })
);
var panel = createBuilder("panel" /* Panel */, PanelStruct, ["children"]);
var ComponentStruct = (0, import_superstruct14.union)([
  CopyableStruct,
  DividerStruct,
  HeadingStruct,
  ImageStruct,
  PanelStruct,
  SpinnerStruct,
  TextStruct,
  RowStruct,
  AddressStruct,
  InputStruct,
  FormStruct,
  ButtonStruct
]);

// src/ui/component.ts
var import_utils5 = require("@metamask/utils");
var import_superstruct15 = require("superstruct");
function isComponent(value) {
  return (0, import_superstruct15.is)(value, ComponentStruct);
}
function assertIsComponent(value) {
  (0, import_utils5.assertStruct)(value, ComponentStruct, "Invalid component");
}

// src/images.ts
async function getRawImageData(url, options) {
  if (typeof fetch !== "function") {
    throw new Error(
      `Failed to fetch image data from "${url}": Using this function requires the "endowment:network-access" permission.`
    );
  }
  return fetch(url, options).then(async (response) => {
    if (!response.ok) {
      throw new Error(
        `Failed to fetch image data from "${url}": ${response.status} ${response.statusText}`
      );
    }
    const blob = await response.blob();
    (0, import_utils6.assert)(
      blob.type === "image/jpeg" || blob.type === "image/png",
      "Expected image data to be a JPEG or PNG image."
    );
    return blob;
  });
}
async function getImageData(url, options) {
  const blob = await getRawImageData(url, options);
  const bytes = new Uint8Array(await blob.arrayBuffer());
  return `data:${blob.type};base64,${(0, import_utils6.bytesToBase64)(bytes)}`;
}
async function getImageComponent(url, { width, height = width, request }) {
  (0, import_utils6.assert)(
    typeof width === "number" && width > 0,
    "Expected width to be a number greater than 0."
  );
  (0, import_utils6.assert)(
    typeof height === "number" && height > 0,
    "Expected height to be a number greater than 0."
  );
  const imageData = await getImageData(url, request);
  const size = `width="${width}" height="${height}"`;
  return image(
    `<svg ${size.trim()} xmlns="http://www.w3.org/2000/svg"><image ${size.trim()} href="${imageData}" /></svg>`
  );
}

// src/types/handlers/transaction.ts
var SeverityLevel = /* @__PURE__ */ ((SeverityLevel2) => {
  SeverityLevel2["Critical"] = "critical";
  return SeverityLevel2;
})(SeverityLevel || {});

// src/types/handlers/user-input.ts
var import_superstruct16 = require("superstruct");
var UserInputEventType = /* @__PURE__ */ ((UserInputEventType2) => {
  UserInputEventType2["ButtonClickEvent"] = "ButtonClickEvent";
  UserInputEventType2["FormSubmitEvent"] = "FormSubmitEvent";
  UserInputEventType2["InputChangeEvent"] = "InputChangeEvent";
  return UserInputEventType2;
})(UserInputEventType || {});
var GenericEventStruct = (0, import_superstruct16.object)({
  type: (0, import_superstruct16.string)(),
  name: (0, import_superstruct16.optional)((0, import_superstruct16.string)())
});
var ButtonClickEventStruct = (0, import_superstruct16.assign)(
  GenericEventStruct,
  (0, import_superstruct16.object)({
    type: (0, import_superstruct16.literal)("ButtonClickEvent" /* ButtonClickEvent */),
    name: (0, import_superstruct16.optional)((0, import_superstruct16.string)())
  })
);
var FormSubmitEventStruct = (0, import_superstruct16.assign)(
  GenericEventStruct,
  (0, import_superstruct16.object)({
    type: (0, import_superstruct16.literal)("FormSubmitEvent" /* FormSubmitEvent */),
    value: (0, import_superstruct16.record)((0, import_superstruct16.string)(), (0, import_superstruct16.nullable)((0, import_superstruct16.string)())),
    name: (0, import_superstruct16.string)()
  })
);
var InputChangeEventStruct = (0, import_superstruct16.assign)(
  GenericEventStruct,
  (0, import_superstruct16.object)({
    type: (0, import_superstruct16.literal)("InputChangeEvent" /* InputChangeEvent */),
    name: (0, import_superstruct16.string)(),
    value: (0, import_superstruct16.string)()
  })
);
var UserInputEventStruct = (0, import_superstruct16.union)([
  ButtonClickEventStruct,
  FormSubmitEventStruct,
  InputChangeEventStruct
]);

// src/types/methods/dialog.ts
var DialogType = /* @__PURE__ */ ((DialogType2) => {
  DialogType2["Alert"] = "alert";
  DialogType2["Confirmation"] = "confirmation";
  DialogType2["Prompt"] = "prompt";
  return DialogType2;
})(DialogType || {});

// src/types/methods/get-file.ts
var AuxiliaryFileEncoding = /* @__PURE__ */ ((AuxiliaryFileEncoding2) => {
  AuxiliaryFileEncoding2["Base64"] = "base64";
  AuxiliaryFileEncoding2["Hex"] = "hex";
  AuxiliaryFileEncoding2["Utf8"] = "utf8";
  return AuxiliaryFileEncoding2;
})(AuxiliaryFileEncoding || {});

// src/types/methods/manage-state.ts
var ManageStateOperation = /* @__PURE__ */ ((ManageStateOperation2) => {
  ManageStateOperation2["ClearState"] = "clear";
  ManageStateOperation2["GetState"] = "get";
  ManageStateOperation2["UpdateState"] = "update";
  return ManageStateOperation2;
})(ManageStateOperation || {});

// src/types/methods/notify.ts
var NotificationType = /* @__PURE__ */ ((NotificationType2) => {
  NotificationType2["InApp"] = "inApp";
  NotificationType2["Native"] = "native";
  return NotificationType2;
})(NotificationType || {});

// src/types/interface.ts
var import_superstruct18 = require("superstruct");

// src/jsx/validation.ts
var import_utils7 = require("@metamask/utils");
var import_superstruct17 = require("superstruct");
var KeyStruct = nullUnion([(0, import_superstruct17.string)(), (0, import_superstruct17.number)()]);
var StringElementStruct = maybeArray(
  (0, import_superstruct17.string)()
);
var ElementStruct = (0, import_superstruct17.object)({
  type: (0, import_superstruct17.string)(),
  props: (0, import_superstruct17.record)((0, import_superstruct17.string)(), import_utils7.JsonStruct),
  key: (0, import_superstruct17.nullable)(KeyStruct)
});
function maybeArray(struct) {
  return nullUnion([struct, (0, import_superstruct17.array)(struct)]);
}
function element(name, props = {}) {
  return (0, import_superstruct17.object)({
    type: literal(name),
    props: (0, import_superstruct17.object)(props),
    key: (0, import_superstruct17.nullable)(KeyStruct)
  });
}
var ButtonStruct2 = element("Button", {
  children: StringElementStruct,
  name: (0, import_superstruct17.optional)((0, import_superstruct17.string)()),
  type: (0, import_superstruct17.optional)(nullUnion([literal("button"), literal("submit")])),
  variant: (0, import_superstruct17.optional)(nullUnion([literal("primary"), literal("destructive")])),
  disabled: (0, import_superstruct17.optional)((0, import_superstruct17.boolean)())
});
var InputStruct2 = element("Input", {
  name: (0, import_superstruct17.string)(),
  type: (0, import_superstruct17.optional)(
    nullUnion([literal("text"), literal("password"), literal("number")])
  ),
  value: (0, import_superstruct17.optional)((0, import_superstruct17.string)()),
  placeholder: (0, import_superstruct17.optional)((0, import_superstruct17.string)())
});
var FieldStruct = element("Field", {
  label: (0, import_superstruct17.optional)((0, import_superstruct17.string)()),
  error: (0, import_superstruct17.optional)((0, import_superstruct17.string)()),
  children: InputStruct2
});
var FormStruct2 = element("Form", {
  children: maybeArray(nullUnion([FieldStruct, ButtonStruct2])),
  name: (0, import_superstruct17.string)()
});
var BoldStruct = element("Bold", {
  children: maybeArray(
    (0, import_superstruct17.nullable)(
      nullUnion([
        (0, import_superstruct17.string)(),
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        (0, import_superstruct17.lazy)(() => ItalicStruct)
      ])
    )
  )
});
var ItalicStruct = element("Italic", {
  children: maybeArray(
    (0, import_superstruct17.nullable)(
      nullUnion([
        (0, import_superstruct17.string)(),
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        (0, import_superstruct17.lazy)(() => BoldStruct)
      ])
    )
  )
});
var FormattingStruct = nullUnion([
  BoldStruct,
  ItalicStruct
]);
var AddressStruct2 = element("Address", {
  address: import_utils7.HexChecksumAddressStruct
});
var BoxStruct = element("Box", {
  children: maybeArray(
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    (0, import_superstruct17.nullable)((0, import_superstruct17.lazy)(() => JSXElementStruct))
  )
});
var CopyableStruct2 = element("Copyable", {
  value: (0, import_superstruct17.string)(),
  sensitive: (0, import_superstruct17.optional)((0, import_superstruct17.boolean)())
});
var DividerStruct2 = element("Divider");
var HeadingStruct2 = element("Heading", {
  children: StringElementStruct
});
var ImageStruct2 = element("Image", {
  src: (0, import_superstruct17.string)(),
  alt: (0, import_superstruct17.optional)((0, import_superstruct17.string)())
});
var LinkStruct = element("Link", {
  href: (0, import_superstruct17.string)(),
  children: maybeArray((0, import_superstruct17.nullable)(nullUnion([FormattingStruct, (0, import_superstruct17.string)()])))
});
var TextStruct2 = element("Text", {
  children: maybeArray(
    (0, import_superstruct17.nullable)(nullUnion([(0, import_superstruct17.string)(), BoldStruct, ItalicStruct, LinkStruct]))
  )
});
var RowStruct2 = element("Row", {
  label: (0, import_superstruct17.string)(),
  children: nullUnion([AddressStruct2, ImageStruct2, TextStruct2]),
  variant: (0, import_superstruct17.optional)(
    nullUnion([literal("default"), literal("warning"), literal("error")])
  )
});
var SpinnerStruct2 = element("Spinner");
var JSXElementStruct = nullUnion([
  ButtonStruct2,
  InputStruct2,
  FieldStruct,
  FormStruct2,
  BoldStruct,
  ItalicStruct,
  AddressStruct2,
  BoxStruct,
  CopyableStruct2,
  DividerStruct2,
  HeadingStruct2,
  ImageStruct2,
  LinkStruct,
  RowStruct2,
  SpinnerStruct2,
  TextStruct2
]);

// src/types/interface.ts
var FormStateStruct = (0, import_superstruct18.record)((0, import_superstruct18.string)(), (0, import_superstruct18.nullable)((0, import_superstruct18.string)()));
var InterfaceStateStruct = (0, import_superstruct18.record)(
  (0, import_superstruct18.string)(),
  (0, import_superstruct18.union)([FormStateStruct, (0, import_superstruct18.nullable)((0, import_superstruct18.string)())])
);
var ComponentOrElementStruct = (0, import_superstruct18.union)([
  ComponentStruct,
  JSXElementStruct
]);
//# sourceMappingURL=index.js.map