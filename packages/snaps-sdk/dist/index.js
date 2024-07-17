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
  FileStruct: () => FileStruct,
  FileUploadEventStruct: () => FileUploadEventStruct,
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
  InterfaceContextStruct: () => InterfaceContextStruct,
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
  StateStruct: () => StateStruct,
  TextStruct: () => TextStruct,
  TransactionRejected: () => TransactionRejected,
  UnauthorizedError: () => UnauthorizedError,
  UnsupportedMethodError: () => UnsupportedMethodError,
  UserInputEventStruct: () => UserInputEventStruct,
  UserInputEventType: () => UserInputEventType,
  UserRejectedRequestError: () => UserRejectedRequestError,
  address: () => address,
  assert: () => import_utils9.assert,
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
  literal: () => literal,
  panel: () => panel,
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
var import_superstruct = require("@metamask/superstruct");
var import_utils2 = require("@metamask/utils");
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
function typedUnion(structs) {
  return new import_superstruct.Struct({
    type: "union",
    schema: null,
    *entries(value, context) {
      if (!(0, import_utils2.isPlainObject)(value) || !(0, import_utils2.hasProperty)(value, "type")) {
        return;
      }
      const { type } = value;
      const struct = structs.find(({ schema }) => (0, import_superstruct.is)(type, schema.type));
      if (!struct) {
        return;
      }
      for (const entry of struct.entries(value, context)) {
        yield entry;
      }
    },
    validator(value, context) {
      const types = structs.map(({ schema }) => schema.type.type);
      if (!(0, import_utils2.isPlainObject)(value) || !(0, import_utils2.hasProperty)(value, "type") || typeof value.type !== "string") {
        return `Expected type to be one of: ${types.join(
          ", "
        )}, but received: undefined`;
      }
      const { type } = value;
      const struct = structs.find(({ schema }) => (0, import_superstruct.is)(type, schema.type));
      if (struct) {
        return struct.validator(value, context);
      }
      return `Expected type to be one of: ${types.join(
        ", "
      )}, but received: "${type}"`;
    }
  });
}

// src/internals/jsx.ts
function nullUnion(structs) {
  return union(structs);
}

// src/internals/svg.ts
var import_superstruct2 = require("@metamask/superstruct");
function svg() {
  return (0, import_superstruct2.refine)((0, import_superstruct2.string)(), "SVG", (value) => {
    if (!value.includes("<svg")) {
      return "Value is not a valid SVG.";
    }
    return true;
  });
}

// src/index.ts
var import_utils9 = require("@metamask/utils");

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
var import_superstruct4 = require("@metamask/superstruct");
var import_utils4 = require("@metamask/utils");

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
var import_superstruct3 = require("@metamask/superstruct");
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
var NodeStruct = (0, import_superstruct3.object)({
  type: (0, import_superstruct3.string)()
});
var LiteralStruct = (0, import_superstruct3.assign)(
  NodeStruct,
  (0, import_superstruct3.object)({
    value: (0, import_superstruct3.unknown)()
  })
);

// src/ui/components/address.ts
var AddressStruct = (0, import_superstruct4.assign)(
  LiteralStruct,
  (0, import_superstruct4.object)({
    type: (0, import_superstruct4.literal)("address" /* Address */),
    value: import_utils4.HexChecksumAddressStruct
  })
);
var address = createBuilder("address" /* Address */, AddressStruct, [
  "value"
]);

// src/ui/components/copyable.ts
var import_superstruct5 = require("@metamask/superstruct");
var CopyableStruct = (0, import_superstruct5.assign)(
  LiteralStruct,
  (0, import_superstruct5.object)({
    type: (0, import_superstruct5.literal)("copyable" /* Copyable */),
    value: (0, import_superstruct5.string)(),
    sensitive: (0, import_superstruct5.optional)((0, import_superstruct5.boolean)())
  })
);
var copyable = createBuilder("copyable" /* Copyable */, CopyableStruct, [
  "value",
  "sensitive"
]);

// src/ui/components/divider.ts
var import_superstruct6 = require("@metamask/superstruct");
var DividerStruct = (0, import_superstruct6.assign)(
  NodeStruct,
  (0, import_superstruct6.object)({
    type: (0, import_superstruct6.literal)("divider" /* Divider */)
  })
);
var divider = createBuilder("divider" /* Divider */, DividerStruct);

// src/ui/components/heading.ts
var import_superstruct7 = require("@metamask/superstruct");
var HeadingStruct = (0, import_superstruct7.assign)(
  LiteralStruct,
  (0, import_superstruct7.object)({
    type: (0, import_superstruct7.literal)("heading" /* Heading */),
    value: (0, import_superstruct7.string)()
  })
);
var heading = createBuilder("heading" /* Heading */, HeadingStruct, [
  "value"
]);

// src/ui/components/image.ts
var import_superstruct8 = require("@metamask/superstruct");
var ImageStruct = (0, import_superstruct8.assign)(
  NodeStruct,
  (0, import_superstruct8.object)({
    type: (0, import_superstruct8.literal)("image" /* Image */),
    value: svg()
  })
);
var image = createBuilder("image" /* Image */, ImageStruct, ["value"]);

// src/ui/components/panel.ts
var import_superstruct15 = require("@metamask/superstruct");

// src/ui/components/button.ts
var import_superstruct9 = require("@metamask/superstruct");
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
var ButtonStruct = (0, import_superstruct9.assign)(
  LiteralStruct,
  (0, import_superstruct9.object)({
    type: (0, import_superstruct9.literal)("button" /* Button */),
    value: (0, import_superstruct9.string)(),
    variant: (0, import_superstruct9.optional)(
      (0, import_superstruct9.union)([
        enumValue("primary" /* Primary */),
        enumValue("secondary" /* Secondary */)
      ])
    ),
    buttonType: (0, import_superstruct9.optional)(
      (0, import_superstruct9.union)([enumValue("button" /* Button */), enumValue("submit" /* Submit */)])
    ),
    name: (0, import_superstruct9.optional)((0, import_superstruct9.string)())
  })
);
var button = createBuilder("button" /* Button */, ButtonStruct, [
  "value",
  "buttonType",
  "name",
  "variant"
]);

// src/ui/components/form.ts
var import_superstruct11 = require("@metamask/superstruct");

// src/ui/components/input.ts
var import_superstruct10 = require("@metamask/superstruct");
var InputType = /* @__PURE__ */ ((InputType2) => {
  InputType2["Text"] = "text";
  InputType2["Number"] = "number";
  InputType2["Password"] = "password";
  return InputType2;
})(InputType || {});
var InputStruct = (0, import_superstruct10.assign)(
  LiteralStruct,
  (0, import_superstruct10.object)({
    type: (0, import_superstruct10.literal)("input" /* Input */),
    value: (0, import_superstruct10.optional)((0, import_superstruct10.string)()),
    name: (0, import_superstruct10.string)(),
    inputType: (0, import_superstruct10.optional)(
      (0, import_superstruct10.union)([
        enumValue("text" /* Text */),
        enumValue("password" /* Password */),
        enumValue("number" /* Number */)
      ])
    ),
    placeholder: (0, import_superstruct10.optional)((0, import_superstruct10.string)()),
    label: (0, import_superstruct10.optional)((0, import_superstruct10.string)()),
    error: (0, import_superstruct10.optional)((0, import_superstruct10.string)())
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
var FormComponentStruct = (0, import_superstruct11.union)([InputStruct, ButtonStruct]);
var FormStruct = (0, import_superstruct11.assign)(
  NodeStruct,
  (0, import_superstruct11.object)({
    type: (0, import_superstruct11.literal)("form" /* Form */),
    children: (0, import_superstruct11.array)(FormComponentStruct),
    name: (0, import_superstruct11.string)()
  })
);
var form = createBuilder("form" /* Form */, FormStruct, [
  "name",
  "children"
]);

// src/ui/components/row.ts
var import_superstruct13 = require("@metamask/superstruct");

// src/ui/components/text.ts
var import_superstruct12 = require("@metamask/superstruct");
var TextStruct = (0, import_superstruct12.assign)(
  LiteralStruct,
  (0, import_superstruct12.object)({
    type: (0, import_superstruct12.literal)("text" /* Text */),
    value: (0, import_superstruct12.string)(),
    markdown: (0, import_superstruct12.optional)((0, import_superstruct12.boolean)())
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
var RowComponentStruct = (0, import_superstruct13.union)([ImageStruct, TextStruct, AddressStruct]);
var RowStruct = (0, import_superstruct13.assign)(
  LiteralStruct,
  (0, import_superstruct13.object)({
    type: (0, import_superstruct13.literal)("row" /* Row */),
    variant: (0, import_superstruct13.optional)(
      (0, import_superstruct13.union)([
        enumValue("default" /* Default */),
        enumValue("critical" /* Critical */),
        enumValue("warning" /* Warning */)
      ])
    ),
    label: (0, import_superstruct13.string)(),
    value: RowComponentStruct
  })
);
var row = createBuilder("row" /* Row */, RowStruct, [
  "label",
  "value",
  "variant"
]);

// src/ui/components/spinner.ts
var import_superstruct14 = require("@metamask/superstruct");
var SpinnerStruct = (0, import_superstruct14.assign)(
  NodeStruct,
  (0, import_superstruct14.object)({
    type: (0, import_superstruct14.literal)("spinner" /* Spinner */)
  })
);
var spinner = createBuilder("spinner" /* Spinner */, SpinnerStruct);

// src/ui/components/panel.ts
var ParentStruct = (0, import_superstruct15.assign)(
  NodeStruct,
  (0, import_superstruct15.object)({
    // This node references itself indirectly, so we need to use `lazy()`.
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    children: (0, import_superstruct15.array)((0, import_superstruct15.lazy)(() => ComponentStruct))
  })
);
var PanelStruct = (0, import_superstruct15.assign)(
  ParentStruct,
  (0, import_superstruct15.object)({
    type: (0, import_superstruct15.literal)("panel" /* Panel */)
  })
);
var panel = createBuilder("panel" /* Panel */, PanelStruct, ["children"]);
var ComponentStruct = typedUnion([
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
var import_superstruct16 = require("@metamask/superstruct");
var import_utils5 = require("@metamask/utils");
function isComponent(value) {
  return (0, import_superstruct16.is)(value, ComponentStruct);
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
var import_superstruct17 = require("@metamask/superstruct");
var UserInputEventType = /* @__PURE__ */ ((UserInputEventType2) => {
  UserInputEventType2["ButtonClickEvent"] = "ButtonClickEvent";
  UserInputEventType2["FormSubmitEvent"] = "FormSubmitEvent";
  UserInputEventType2["InputChangeEvent"] = "InputChangeEvent";
  UserInputEventType2["FileUploadEvent"] = "FileUploadEvent";
  return UserInputEventType2;
})(UserInputEventType || {});
var GenericEventStruct = (0, import_superstruct17.object)({
  type: (0, import_superstruct17.string)(),
  name: (0, import_superstruct17.optional)((0, import_superstruct17.string)())
});
var ButtonClickEventStruct = (0, import_superstruct17.assign)(
  GenericEventStruct,
  (0, import_superstruct17.object)({
    type: (0, import_superstruct17.literal)("ButtonClickEvent" /* ButtonClickEvent */),
    name: (0, import_superstruct17.optional)((0, import_superstruct17.string)())
  })
);
var FileStruct = (0, import_superstruct17.object)({
  name: (0, import_superstruct17.string)(),
  size: (0, import_superstruct17.number)(),
  contentType: (0, import_superstruct17.string)(),
  contents: (0, import_superstruct17.string)()
});
var FormSubmitEventStruct = (0, import_superstruct17.assign)(
  GenericEventStruct,
  (0, import_superstruct17.object)({
    type: (0, import_superstruct17.literal)("FormSubmitEvent" /* FormSubmitEvent */),
    value: (0, import_superstruct17.record)((0, import_superstruct17.string)(), (0, import_superstruct17.nullable)((0, import_superstruct17.union)([(0, import_superstruct17.string)(), FileStruct, (0, import_superstruct17.boolean)()]))),
    name: (0, import_superstruct17.string)()
  })
);
var InputChangeEventStruct = (0, import_superstruct17.assign)(
  GenericEventStruct,
  (0, import_superstruct17.object)({
    type: (0, import_superstruct17.literal)("InputChangeEvent" /* InputChangeEvent */),
    name: (0, import_superstruct17.string)(),
    value: (0, import_superstruct17.union)([(0, import_superstruct17.string)(), (0, import_superstruct17.boolean)()])
  })
);
var FileUploadEventStruct = (0, import_superstruct17.assign)(
  GenericEventStruct,
  (0, import_superstruct17.object)({
    type: (0, import_superstruct17.literal)("FileUploadEvent" /* FileUploadEvent */),
    name: (0, import_superstruct17.string)(),
    file: (0, import_superstruct17.nullable)(FileStruct)
  })
);
var UserInputEventStruct = (0, import_superstruct17.union)([
  ButtonClickEventStruct,
  FormSubmitEventStruct,
  InputChangeEventStruct,
  FileUploadEventStruct
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
var import_superstruct19 = require("@metamask/superstruct");
var import_utils8 = require("@metamask/utils");

// src/jsx/validation.ts
var import_superstruct18 = require("@metamask/superstruct");
var import_utils7 = require("@metamask/utils");
var KeyStruct = nullUnion([(0, import_superstruct18.string)(), (0, import_superstruct18.number)()]);
var StringElementStruct = children([
  (0, import_superstruct18.string)()
]);
var ElementStruct = (0, import_superstruct18.object)({
  type: (0, import_superstruct18.string)(),
  props: (0, import_superstruct18.record)((0, import_superstruct18.string)(), import_utils7.JsonStruct),
  key: (0, import_superstruct18.nullable)(KeyStruct)
});
function nestable(struct) {
  const nestableStruct = nullUnion([
    struct,
    (0, import_superstruct18.array)((0, import_superstruct18.lazy)(() => nestableStruct))
  ]);
  return nestableStruct;
}
function children(structs) {
  return nestable((0, import_superstruct18.nullable)(nullUnion([...structs, (0, import_superstruct18.boolean)()])));
}
function element(name, props = {}) {
  return (0, import_superstruct18.object)({
    type: literal(name),
    props: (0, import_superstruct18.object)(props),
    key: (0, import_superstruct18.nullable)(KeyStruct)
  });
}
var ButtonStruct2 = element("Button", {
  children: StringElementStruct,
  name: (0, import_superstruct18.optional)((0, import_superstruct18.string)()),
  type: (0, import_superstruct18.optional)(nullUnion([literal("button"), literal("submit")])),
  variant: (0, import_superstruct18.optional)(nullUnion([literal("primary"), literal("destructive")])),
  disabled: (0, import_superstruct18.optional)((0, import_superstruct18.boolean)())
});
var CheckboxStruct = element("Checkbox", {
  name: (0, import_superstruct18.string)(),
  checked: (0, import_superstruct18.optional)((0, import_superstruct18.boolean)()),
  label: (0, import_superstruct18.optional)((0, import_superstruct18.string)()),
  variant: (0, import_superstruct18.optional)(nullUnion([literal("default"), literal("toggle")]))
});
var InputStruct2 = element("Input", {
  name: (0, import_superstruct18.string)(),
  type: (0, import_superstruct18.optional)(
    nullUnion([literal("text"), literal("password"), literal("number")])
  ),
  value: (0, import_superstruct18.optional)((0, import_superstruct18.string)()),
  placeholder: (0, import_superstruct18.optional)((0, import_superstruct18.string)())
});
var OptionStruct = element("Option", {
  value: (0, import_superstruct18.string)(),
  children: (0, import_superstruct18.string)()
});
var DropdownStruct = element("Dropdown", {
  name: (0, import_superstruct18.string)(),
  value: (0, import_superstruct18.optional)((0, import_superstruct18.string)()),
  children: children([OptionStruct])
});
var FileInputStruct = element(
  "FileInput",
  {
    name: (0, import_superstruct18.string)(),
    accept: nullUnion([(0, import_superstruct18.optional)((0, import_superstruct18.array)((0, import_superstruct18.string)()))]),
    compact: (0, import_superstruct18.optional)((0, import_superstruct18.boolean)())
  }
);
var BUTTON_INPUT = [InputStruct2, ButtonStruct2];
var FIELD_CHILDREN_ARRAY = [
  InputStruct2,
  DropdownStruct,
  FileInputStruct,
  CheckboxStruct
];
var FieldChildUnionStruct = nullUnion([
  ...FIELD_CHILDREN_ARRAY,
  ...BUTTON_INPUT
]);
var FieldChildStruct = nullUnion([
  (0, import_superstruct18.tuple)(BUTTON_INPUT),
  ...FIELD_CHILDREN_ARRAY
]);
var FieldStruct = element("Field", {
  label: (0, import_superstruct18.optional)((0, import_superstruct18.string)()),
  error: (0, import_superstruct18.optional)((0, import_superstruct18.string)()),
  children: FieldChildStruct
});
var FormChildStruct = children(
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  [FieldStruct, (0, import_superstruct18.lazy)(() => BoxChildStruct)]
);
var FormStruct2 = element("Form", {
  children: FormChildStruct,
  name: (0, import_superstruct18.string)()
});
var BoldStruct = element("Bold", {
  children: children([
    (0, import_superstruct18.string)(),
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    (0, import_superstruct18.lazy)(() => ItalicStruct)
  ])
});
var ItalicStruct = element("Italic", {
  children: children([
    (0, import_superstruct18.string)(),
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    (0, import_superstruct18.lazy)(() => BoldStruct)
  ])
});
var FormattingStruct = nullUnion([
  BoldStruct,
  ItalicStruct
]);
var AddressStruct2 = element("Address", {
  address: import_utils7.HexChecksumAddressStruct
});
var BoxChildrenStruct = children(
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  [(0, import_superstruct18.lazy)(() => BoxChildStruct)]
);
var BoxStruct = element("Box", {
  children: BoxChildrenStruct,
  direction: (0, import_superstruct18.optional)(nullUnion([literal("horizontal"), literal("vertical")])),
  alignment: (0, import_superstruct18.optional)(
    nullUnion([
      literal("start"),
      literal("center"),
      literal("end"),
      literal("space-between"),
      literal("space-around")
    ])
  )
});
var FooterChildStruct = nullUnion([
  (0, import_superstruct18.tuple)([ButtonStruct2, ButtonStruct2]),
  ButtonStruct2
]);
var FooterStruct = element("Footer", {
  children: FooterChildStruct
});
var ContainerChildStruct = nullUnion([
  (0, import_superstruct18.tuple)([BoxStruct, FooterStruct]),
  BoxStruct
]);
var ContainerStruct = element(
  "Container",
  {
    children: ContainerChildStruct
  }
);
var CopyableStruct2 = element("Copyable", {
  value: (0, import_superstruct18.string)(),
  sensitive: (0, import_superstruct18.optional)((0, import_superstruct18.boolean)())
});
var DividerStruct2 = element("Divider");
var ValueStruct = element("Value", {
  value: (0, import_superstruct18.string)(),
  extra: (0, import_superstruct18.string)()
});
var CardStruct = element("Card", {
  image: (0, import_superstruct18.optional)((0, import_superstruct18.string)()),
  title: (0, import_superstruct18.string)(),
  description: (0, import_superstruct18.optional)((0, import_superstruct18.string)()),
  value: (0, import_superstruct18.string)(),
  extra: (0, import_superstruct18.optional)((0, import_superstruct18.string)())
});
var HeadingStruct2 = element("Heading", {
  children: StringElementStruct
});
var ImageStruct2 = element("Image", {
  src: svg(),
  alt: (0, import_superstruct18.optional)((0, import_superstruct18.string)())
});
var LinkStruct = element("Link", {
  href: (0, import_superstruct18.string)(),
  children: children([FormattingStruct, (0, import_superstruct18.string)()])
});
var TextStruct2 = element("Text", {
  children: children([(0, import_superstruct18.string)(), BoldStruct, ItalicStruct, LinkStruct]),
  alignment: (0, import_superstruct18.optional)(
    nullUnion([literal("start"), literal("center"), literal("end")])
  )
});
var TooltipChildStruct = nullUnion([
  TextStruct2,
  BoldStruct,
  ItalicStruct,
  LinkStruct,
  ImageStruct2,
  (0, import_superstruct18.boolean)()
]);
var TooltipContentStruct = nullUnion([
  TextStruct2,
  BoldStruct,
  ItalicStruct,
  LinkStruct,
  (0, import_superstruct18.string)()
]);
var TooltipStruct = element("Tooltip", {
  children: (0, import_superstruct18.nullable)(TooltipChildStruct),
  content: TooltipContentStruct
});
var RowStruct2 = element("Row", {
  label: (0, import_superstruct18.string)(),
  children: nullUnion([AddressStruct2, ImageStruct2, TextStruct2, ValueStruct]),
  variant: (0, import_superstruct18.optional)(
    nullUnion([literal("default"), literal("warning"), literal("critical")])
  ),
  tooltip: (0, import_superstruct18.optional)((0, import_superstruct18.string)())
});
var SpinnerStruct2 = element("Spinner");
var BoxChildStruct = typedUnion([
  AddressStruct2,
  BoldStruct,
  BoxStruct,
  ButtonStruct2,
  CopyableStruct2,
  DividerStruct2,
  DropdownStruct,
  FileInputStruct,
  FormStruct2,
  HeadingStruct2,
  InputStruct2,
  ImageStruct2,
  ItalicStruct,
  LinkStruct,
  RowStruct2,
  SpinnerStruct2,
  TextStruct2,
  TooltipStruct,
  CheckboxStruct,
  CardStruct
]);
var RootJSXElementStruct = nullUnion([
  BoxChildStruct,
  ContainerStruct
]);
var JSXElementStruct = typedUnion([
  ButtonStruct2,
  InputStruct2,
  FileInputStruct,
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
  TextStruct2,
  DropdownStruct,
  OptionStruct,
  ValueStruct,
  TooltipStruct,
  CheckboxStruct,
  FooterStruct,
  ContainerStruct,
  CardStruct
]);

// src/types/interface.ts
var StateStruct = (0, import_superstruct19.union)([FileStruct, (0, import_superstruct19.string)(), (0, import_superstruct19.boolean)()]);
var FormStateStruct = (0, import_superstruct19.record)((0, import_superstruct19.string)(), (0, import_superstruct19.nullable)(StateStruct));
var InterfaceStateStruct = (0, import_superstruct19.record)(
  (0, import_superstruct19.string)(),
  (0, import_superstruct19.union)([FormStateStruct, (0, import_superstruct19.nullable)(StateStruct)])
);
var ComponentOrElementStruct = (0, import_superstruct19.union)([
  ComponentStruct,
  RootJSXElementStruct
]);
var InterfaceContextStruct = (0, import_superstruct19.record)((0, import_superstruct19.string)(), import_utils8.JsonStruct);
//# sourceMappingURL=index.js.map