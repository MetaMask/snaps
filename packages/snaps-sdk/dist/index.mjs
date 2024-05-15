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
import { hasProperty, isObject, isValidJson } from "@metamask/utils";
var SNAP_ERROR_CODE = -31002;
var SNAP_ERROR_MESSAGE = "Snap Error";
function getErrorMessage(error) {
  if (isObject(error) && hasProperty(error, "message") && typeof error.message === "string") {
    return error.message;
  }
  return String(error);
}
function getErrorStack(error) {
  if (isObject(error) && hasProperty(error, "stack") && typeof error.stack === "string") {
    return error.stack;
  }
  return void 0;
}
function getErrorCode(error) {
  if (isObject(error) && hasProperty(error, "code") && typeof error.code === "number" && Number.isInteger(error.code)) {
    return error.code;
  }
  return -32603;
}
function getErrorData(error) {
  if (isObject(error) && hasProperty(error, "data") && typeof error.data === "object" && error.data !== null && isValidJson(error.data) && !Array.isArray(error.data)) {
    return error.data;
  }
  return {};
}

// src/internals/structs.ts
import {
  Struct,
  define,
  literal as superstructLiteral,
  union as superstructUnion
} from "superstruct";
function literal(value) {
  return define(
    JSON.stringify(value),
    superstructLiteral(value).validator
  );
}
function union([
  head,
  ...tail
]) {
  const struct = superstructUnion([head, ...tail]);
  return new Struct({
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
import { assert, hasProperty as hasProperty2, isObject as isObject2 } from "@metamask/utils";
import { XMLParser } from "fast-xml-parser";
function parseSvg(svg2) {
  try {
    const trimmed = svg2.trim();
    assert(trimmed.length > 0);
    const parser = new XMLParser({
      ignoreAttributes: false,
      parseAttributeValue: true
    });
    const parsed = parser.parse(trimmed, true);
    assert(hasProperty2(parsed, "svg"));
    if (!isObject2(parsed.svg)) {
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
import { assert as assert3 } from "@metamask/utils";

// src/error-wrappers.ts
import { providerErrors, rpcErrors } from "@metamask/rpc-errors";
var InternalError = createSnapError(rpcErrors.internal);
var InvalidInputError = createSnapError(rpcErrors.invalidInput);
var InvalidParamsError = createSnapError(rpcErrors.invalidParams);
var InvalidRequestError = createSnapError(rpcErrors.invalidRequest);
var LimitExceededError = createSnapError(rpcErrors.limitExceeded);
var MethodNotFoundError = createSnapError(rpcErrors.methodNotFound);
var MethodNotSupportedError = createSnapError(
  rpcErrors.methodNotSupported
);
var ParseError = createSnapError(rpcErrors.parse);
var ResourceNotFoundError = createSnapError(
  rpcErrors.resourceNotFound
);
var ResourceUnavailableError = createSnapError(
  rpcErrors.resourceUnavailable
);
var TransactionRejected = createSnapError(
  rpcErrors.transactionRejected
);
var ChainDisconnectedError = createSnapError(
  providerErrors.chainDisconnected
);
var DisconnectedError = createSnapError(providerErrors.disconnected);
var UnauthorizedError = createSnapError(providerErrors.unauthorized);
var UnsupportedMethodError = createSnapError(
  providerErrors.unsupportedMethod
);
var UserRejectedRequestError = createSnapError(
  providerErrors.userRejectedRequest
);

// src/images.ts
import { assert as assert2, bytesToBase64 } from "@metamask/utils";

// src/ui/components/address.ts
import { HexChecksumAddressStruct } from "@metamask/utils";
import { assign as assign2, literal as literal2, object as object2 } from "superstruct";

// src/ui/builder.ts
import { assertStruct, isPlainObject } from "@metamask/utils";
function createBuilder(type, struct, keys = []) {
  return (...args) => {
    if (args.length === 1 && isPlainObject(args[0])) {
      const node2 = { ...args[0], type };
      assertStruct(node2, struct, `Invalid ${type} component`);
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
    assertStruct(node, struct, `Invalid ${type} component`);
    return node;
  };
}

// src/ui/nodes.ts
import { assign, object, string, unknown } from "superstruct";
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
var NodeStruct = object({
  type: string()
});
var LiteralStruct = assign(
  NodeStruct,
  object({
    value: unknown()
  })
);

// src/ui/components/address.ts
var AddressStruct = assign2(
  LiteralStruct,
  object2({
    type: literal2("address" /* Address */),
    value: HexChecksumAddressStruct
  })
);
var address = createBuilder("address" /* Address */, AddressStruct, [
  "value"
]);

// src/ui/components/copyable.ts
import {
  assign as assign3,
  boolean,
  literal as literal3,
  object as object3,
  optional,
  string as string2
} from "superstruct";
var CopyableStruct = assign3(
  LiteralStruct,
  object3({
    type: literal3("copyable" /* Copyable */),
    value: string2(),
    sensitive: optional(boolean())
  })
);
var copyable = createBuilder("copyable" /* Copyable */, CopyableStruct, [
  "value",
  "sensitive"
]);

// src/ui/components/divider.ts
import { assign as assign4, literal as literal4, object as object4 } from "superstruct";
var DividerStruct = assign4(
  NodeStruct,
  object4({
    type: literal4("divider" /* Divider */)
  })
);
var divider = createBuilder("divider" /* Divider */, DividerStruct);

// src/ui/components/heading.ts
import { assign as assign5, literal as literal5, object as object5, string as string3 } from "superstruct";
var HeadingStruct = assign5(
  LiteralStruct,
  object5({
    type: literal5("heading" /* Heading */),
    value: string3()
  })
);
var heading = createBuilder("heading" /* Heading */, HeadingStruct, [
  "value"
]);

// src/ui/components/image.ts
import { assign as assign6, literal as literal6, object as object6, refine, string as string4 } from "superstruct";
function svg() {
  return refine(string4(), "SVG", (value) => {
    if (!isSvg(value)) {
      return "Value is not a valid SVG.";
    }
    return true;
  });
}
var ImageStruct = assign6(
  NodeStruct,
  object6({
    type: literal6("image" /* Image */),
    value: svg()
  })
);
var image = createBuilder("image" /* Image */, ImageStruct, ["value"]);

// src/ui/components/panel.ts
import { array as array2, assign as assign13, lazy, literal as literal13, object as object13, union as union6 } from "superstruct";

// src/ui/components/button.ts
import { assign as assign7, literal as literal7, object as object7, optional as optional2, string as string5, union as union2 } from "superstruct";
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
var ButtonStruct = assign7(
  LiteralStruct,
  object7({
    type: literal7("button" /* Button */),
    value: string5(),
    variant: optional2(
      union2([
        enumValue("primary" /* Primary */),
        enumValue("secondary" /* Secondary */)
      ])
    ),
    buttonType: optional2(
      union2([enumValue("button" /* Button */), enumValue("submit" /* Submit */)])
    ),
    name: optional2(string5())
  })
);
var button = createBuilder("button" /* Button */, ButtonStruct, [
  "value",
  "buttonType",
  "name",
  "variant"
]);

// src/ui/components/form.ts
import { array, assign as assign9, literal as literal9, object as object9, string as string7, union as union4 } from "superstruct";

// src/ui/components/input.ts
import { assign as assign8, literal as literal8, object as object8, optional as optional3, string as string6, union as union3 } from "superstruct";
var InputType = /* @__PURE__ */ ((InputType2) => {
  InputType2["Text"] = "text";
  InputType2["Number"] = "number";
  InputType2["Password"] = "password";
  return InputType2;
})(InputType || {});
var InputStruct = assign8(
  LiteralStruct,
  object8({
    type: literal8("input" /* Input */),
    value: optional3(string6()),
    name: string6(),
    inputType: optional3(
      union3([
        enumValue("text" /* Text */),
        enumValue("password" /* Password */),
        enumValue("number" /* Number */)
      ])
    ),
    placeholder: optional3(string6()),
    label: optional3(string6()),
    error: optional3(string6())
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
var FormComponentStruct = union4([InputStruct, ButtonStruct]);
var FormStruct = assign9(
  NodeStruct,
  object9({
    type: literal9("form" /* Form */),
    children: array(FormComponentStruct),
    name: string7()
  })
);
var form = createBuilder("form" /* Form */, FormStruct, [
  "name",
  "children"
]);

// src/ui/components/row.ts
import { assign as assign11, literal as literal11, object as object11, string as string9, optional as optional5, union as union5 } from "superstruct";

// src/ui/components/text.ts
import {
  assign as assign10,
  boolean as boolean2,
  literal as literal10,
  object as object10,
  optional as optional4,
  string as string8
} from "superstruct";
var TextStruct = assign10(
  LiteralStruct,
  object10({
    type: literal10("text" /* Text */),
    value: string8(),
    markdown: optional4(boolean2())
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
var RowComponentStruct = union5([ImageStruct, TextStruct, AddressStruct]);
var RowStruct = assign11(
  LiteralStruct,
  object11({
    type: literal11("row" /* Row */),
    variant: optional5(
      union5([
        enumValue("default" /* Default */),
        enumValue("critical" /* Critical */),
        enumValue("warning" /* Warning */)
      ])
    ),
    label: string9(),
    value: RowComponentStruct
  })
);
var row = createBuilder("row" /* Row */, RowStruct, [
  "label",
  "value",
  "variant"
]);

// src/ui/components/spinner.ts
import { assign as assign12, literal as literal12, object as object12 } from "superstruct";
var SpinnerStruct = assign12(
  NodeStruct,
  object12({
    type: literal12("spinner" /* Spinner */)
  })
);
var spinner = createBuilder("spinner" /* Spinner */, SpinnerStruct);

// src/ui/components/panel.ts
var ParentStruct = assign13(
  NodeStruct,
  object13({
    // This node references itself indirectly, so we need to use `lazy()`.
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    children: array2(lazy(() => ComponentStruct))
  })
);
var PanelStruct = assign13(
  ParentStruct,
  object13({
    type: literal13("panel" /* Panel */)
  })
);
var panel = createBuilder("panel" /* Panel */, PanelStruct, ["children"]);
var ComponentStruct = union6([
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
import { assertStruct as assertStruct2 } from "@metamask/utils";
import { is } from "superstruct";
function isComponent(value) {
  return is(value, ComponentStruct);
}
function assertIsComponent(value) {
  assertStruct2(value, ComponentStruct, "Invalid component");
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
    assert2(
      blob.type === "image/jpeg" || blob.type === "image/png",
      "Expected image data to be a JPEG or PNG image."
    );
    return blob;
  });
}
async function getImageData(url, options) {
  const blob = await getRawImageData(url, options);
  const bytes = new Uint8Array(await blob.arrayBuffer());
  return `data:${blob.type};base64,${bytesToBase64(bytes)}`;
}
async function getImageComponent(url, { width, height = width, request }) {
  assert2(
    typeof width === "number" && width > 0,
    "Expected width to be a number greater than 0."
  );
  assert2(
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
import {
  assign as assign14,
  literal as literal14,
  nullable,
  object as object14,
  optional as optional6,
  record,
  string as string10,
  union as union7
} from "superstruct";
var UserInputEventType = /* @__PURE__ */ ((UserInputEventType2) => {
  UserInputEventType2["ButtonClickEvent"] = "ButtonClickEvent";
  UserInputEventType2["FormSubmitEvent"] = "FormSubmitEvent";
  UserInputEventType2["InputChangeEvent"] = "InputChangeEvent";
  return UserInputEventType2;
})(UserInputEventType || {});
var GenericEventStruct = object14({
  type: string10(),
  name: optional6(string10())
});
var ButtonClickEventStruct = assign14(
  GenericEventStruct,
  object14({
    type: literal14("ButtonClickEvent" /* ButtonClickEvent */),
    name: optional6(string10())
  })
);
var FormSubmitEventStruct = assign14(
  GenericEventStruct,
  object14({
    type: literal14("FormSubmitEvent" /* FormSubmitEvent */),
    value: record(string10(), nullable(string10())),
    name: string10()
  })
);
var InputChangeEventStruct = assign14(
  GenericEventStruct,
  object14({
    type: literal14("InputChangeEvent" /* InputChangeEvent */),
    name: string10(),
    value: string10()
  })
);
var UserInputEventStruct = union7([
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
import { nullable as nullable3, record as record3, string as string12, union as union8 } from "superstruct";

// src/jsx/validation.ts
import {
  hasProperty as hasProperty3,
  HexChecksumAddressStruct as HexChecksumAddressStruct2,
  isPlainObject as isPlainObject2,
  JsonStruct
} from "@metamask/utils";
import {
  is as is2,
  boolean as boolean3,
  optional as optional7,
  array as array3,
  lazy as lazy2,
  nullable as nullable2,
  number,
  object as object15,
  record as record2,
  string as string11
} from "superstruct";
var KeyStruct = nullUnion([string11(), number()]);
var StringElementStruct = maybeArray(
  string11()
);
var ElementStruct = object15({
  type: string11(),
  props: record2(string11(), JsonStruct),
  key: nullable2(KeyStruct)
});
function maybeArray(struct) {
  return nullUnion([struct, array3(struct)]);
}
function element(name, props = {}) {
  return object15({
    type: literal(name),
    props: object15(props),
    key: nullable2(KeyStruct)
  });
}
var ButtonStruct2 = element("Button", {
  children: StringElementStruct,
  name: optional7(string11()),
  type: optional7(nullUnion([literal("button"), literal("submit")])),
  variant: optional7(nullUnion([literal("primary"), literal("destructive")])),
  disabled: optional7(boolean3())
});
var InputStruct2 = element("Input", {
  name: string11(),
  type: optional7(
    nullUnion([literal("text"), literal("password"), literal("number")])
  ),
  value: optional7(string11()),
  placeholder: optional7(string11())
});
var FieldStruct = element("Field", {
  label: optional7(string11()),
  error: optional7(string11()),
  children: InputStruct2
});
var FormStruct2 = element("Form", {
  children: maybeArray(nullUnion([FieldStruct, ButtonStruct2])),
  name: string11()
});
var BoldStruct = element("Bold", {
  children: maybeArray(
    nullable2(
      nullUnion([
        string11(),
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        lazy2(() => ItalicStruct)
      ])
    )
  )
});
var ItalicStruct = element("Italic", {
  children: maybeArray(
    nullable2(
      nullUnion([
        string11(),
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        lazy2(() => BoldStruct)
      ])
    )
  )
});
var FormattingStruct = nullUnion([
  BoldStruct,
  ItalicStruct
]);
var AddressStruct2 = element("Address", {
  address: HexChecksumAddressStruct2
});
var BoxStruct = element("Box", {
  children: maybeArray(
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    nullable2(lazy2(() => JSXElementStruct))
  )
});
var CopyableStruct2 = element("Copyable", {
  value: string11(),
  sensitive: optional7(boolean3())
});
var DividerStruct2 = element("Divider");
var HeadingStruct2 = element("Heading", {
  children: StringElementStruct
});
var ImageStruct2 = element("Image", {
  src: string11(),
  alt: optional7(string11())
});
var LinkStruct = element("Link", {
  href: string11(),
  children: maybeArray(nullable2(nullUnion([FormattingStruct, string11()])))
});
var TextStruct2 = element("Text", {
  children: maybeArray(
    nullable2(nullUnion([string11(), BoldStruct, ItalicStruct, LinkStruct]))
  )
});
var RowStruct2 = element("Row", {
  label: string11(),
  children: nullUnion([AddressStruct2, ImageStruct2, TextStruct2]),
  variant: optional7(
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
var FormStateStruct = record3(string12(), nullable3(string12()));
var InterfaceStateStruct = record3(
  string12(),
  union8([FormStateStruct, nullable3(string12())])
);
var ComponentOrElementStruct = union8([
  ComponentStruct,
  JSXElementStruct
]);
export {
  AddressStruct,
  AuxiliaryFileEncoding,
  ButtonClickEventStruct,
  ButtonStruct,
  ButtonType,
  ButtonVariant,
  ChainDisconnectedError,
  ComponentOrElementStruct,
  ComponentStruct,
  CopyableStruct,
  DialogType,
  DisconnectedError,
  DividerStruct,
  FormComponentStruct,
  FormStateStruct,
  FormStruct,
  FormSubmitEventStruct,
  GenericEventStruct,
  HeadingStruct,
  ImageStruct,
  InputChangeEventStruct,
  InputStruct,
  InputType,
  InterfaceStateStruct,
  InternalError,
  InvalidInputError,
  InvalidParamsError,
  InvalidRequestError,
  LimitExceededError,
  ManageStateOperation,
  MethodNotFoundError,
  MethodNotSupportedError,
  NodeType,
  NotificationType,
  PanelStruct,
  ParseError,
  ResourceNotFoundError,
  ResourceUnavailableError,
  RowStruct,
  RowVariant,
  SNAP_ERROR_CODE,
  SNAP_ERROR_MESSAGE,
  SeverityLevel,
  SnapError,
  SpinnerStruct,
  TextStruct,
  TransactionRejected,
  UnauthorizedError,
  UnsupportedMethodError,
  UserInputEventStruct,
  UserInputEventType,
  UserRejectedRequestError,
  address,
  assert3 as assert,
  assertIsComponent,
  button,
  copyable,
  divider,
  enumValue,
  form,
  getErrorData,
  getErrorMessage,
  getErrorStack,
  getImageComponent,
  getImageData,
  heading,
  image,
  input,
  isComponent,
  isSvg,
  literal,
  panel,
  parseSvg,
  row,
  spinner,
  text,
  union
};
//# sourceMappingURL=index.mjs.map