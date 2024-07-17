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
  is,
  literal as superstructLiteral,
  union as superstructUnion
} from "@metamask/superstruct";
import { hasProperty as hasProperty2, isPlainObject } from "@metamask/utils";
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
function typedUnion(structs) {
  return new Struct({
    type: "union",
    schema: null,
    *entries(value, context) {
      if (!isPlainObject(value) || !hasProperty2(value, "type")) {
        return;
      }
      const { type } = value;
      const struct = structs.find(({ schema }) => is(type, schema.type));
      if (!struct) {
        return;
      }
      for (const entry of struct.entries(value, context)) {
        yield entry;
      }
    },
    validator(value, context) {
      const types = structs.map(({ schema }) => schema.type.type);
      if (!isPlainObject(value) || !hasProperty2(value, "type") || typeof value.type !== "string") {
        return `Expected type to be one of: ${types.join(
          ", "
        )}, but received: undefined`;
      }
      const { type } = value;
      const struct = structs.find(({ schema }) => is(type, schema.type));
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
import { refine, string } from "@metamask/superstruct";
function svg() {
  return refine(string(), "SVG", (value) => {
    if (!value.includes("<svg")) {
      return "Value is not a valid SVG.";
    }
    return true;
  });
}

// src/index.ts
import { assert as assert2 } from "@metamask/utils";

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
import { assert, bytesToBase64 } from "@metamask/utils";

// src/ui/components/address.ts
import { assign as assign2, literal as literal2, object as object2 } from "@metamask/superstruct";
import { HexChecksumAddressStruct } from "@metamask/utils";

// src/ui/builder.ts
import { assertStruct, isPlainObject as isPlainObject2 } from "@metamask/utils";
function createBuilder(type, struct, keys = []) {
  return (...args) => {
    if (args.length === 1 && isPlainObject2(args[0])) {
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
import { assign, object, string as string2, unknown } from "@metamask/superstruct";
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
  type: string2()
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
  string as string3
} from "@metamask/superstruct";
var CopyableStruct = assign3(
  LiteralStruct,
  object3({
    type: literal3("copyable" /* Copyable */),
    value: string3(),
    sensitive: optional(boolean())
  })
);
var copyable = createBuilder("copyable" /* Copyable */, CopyableStruct, [
  "value",
  "sensitive"
]);

// src/ui/components/divider.ts
import { assign as assign4, literal as literal4, object as object4 } from "@metamask/superstruct";
var DividerStruct = assign4(
  NodeStruct,
  object4({
    type: literal4("divider" /* Divider */)
  })
);
var divider = createBuilder("divider" /* Divider */, DividerStruct);

// src/ui/components/heading.ts
import { assign as assign5, literal as literal5, object as object5, string as string4 } from "@metamask/superstruct";
var HeadingStruct = assign5(
  LiteralStruct,
  object5({
    type: literal5("heading" /* Heading */),
    value: string4()
  })
);
var heading = createBuilder("heading" /* Heading */, HeadingStruct, [
  "value"
]);

// src/ui/components/image.ts
import { assign as assign6, literal as literal6, object as object6 } from "@metamask/superstruct";
var ImageStruct = assign6(
  NodeStruct,
  object6({
    type: literal6("image" /* Image */),
    value: svg()
  })
);
var image = createBuilder("image" /* Image */, ImageStruct, ["value"]);

// src/ui/components/panel.ts
import { array as array2, assign as assign13, lazy, literal as literal13, object as object13 } from "@metamask/superstruct";

// src/ui/components/button.ts
import {
  assign as assign7,
  literal as literal7,
  object as object7,
  optional as optional2,
  string as string5,
  union as union2
} from "@metamask/superstruct";
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
import {
  array,
  assign as assign9,
  literal as literal9,
  object as object9,
  string as string7,
  union as union4
} from "@metamask/superstruct";

// src/ui/components/input.ts
import {
  assign as assign8,
  literal as literal8,
  object as object8,
  optional as optional3,
  string as string6,
  union as union3
} from "@metamask/superstruct";
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
import {
  assign as assign11,
  literal as literal11,
  object as object11,
  string as string9,
  optional as optional5,
  union as union5
} from "@metamask/superstruct";

// src/ui/components/text.ts
import {
  assign as assign10,
  boolean as boolean2,
  literal as literal10,
  object as object10,
  optional as optional4,
  string as string8
} from "@metamask/superstruct";
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
import { assign as assign12, literal as literal12, object as object12 } from "@metamask/superstruct";
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
import { is as is2 } from "@metamask/superstruct";
import { assertStruct as assertStruct2 } from "@metamask/utils";
function isComponent(value) {
  return is2(value, ComponentStruct);
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
    assert(
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
  assert(
    typeof width === "number" && width > 0,
    "Expected width to be a number greater than 0."
  );
  assert(
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
  number,
  assign as assign14,
  literal as literal14,
  nullable,
  object as object14,
  optional as optional6,
  record,
  string as string10,
  union as union6,
  boolean as boolean3
} from "@metamask/superstruct";
var UserInputEventType = /* @__PURE__ */ ((UserInputEventType2) => {
  UserInputEventType2["ButtonClickEvent"] = "ButtonClickEvent";
  UserInputEventType2["FormSubmitEvent"] = "FormSubmitEvent";
  UserInputEventType2["InputChangeEvent"] = "InputChangeEvent";
  UserInputEventType2["FileUploadEvent"] = "FileUploadEvent";
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
var FileStruct = object14({
  name: string10(),
  size: number(),
  contentType: string10(),
  contents: string10()
});
var FormSubmitEventStruct = assign14(
  GenericEventStruct,
  object14({
    type: literal14("FormSubmitEvent" /* FormSubmitEvent */),
    value: record(string10(), nullable(union6([string10(), FileStruct, boolean3()]))),
    name: string10()
  })
);
var InputChangeEventStruct = assign14(
  GenericEventStruct,
  object14({
    type: literal14("InputChangeEvent" /* InputChangeEvent */),
    name: string10(),
    value: union6([string10(), boolean3()])
  })
);
var FileUploadEventStruct = assign14(
  GenericEventStruct,
  object14({
    type: literal14("FileUploadEvent" /* FileUploadEvent */),
    name: string10(),
    file: nullable(FileStruct)
  })
);
var UserInputEventStruct = union6([
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
import {
  boolean as boolean5,
  nullable as nullable3,
  record as record3,
  string as string12,
  union as union7
} from "@metamask/superstruct";
import { JsonStruct as JsonStruct2 } from "@metamask/utils";

// src/jsx/validation.ts
import {
  is as is3,
  boolean as boolean4,
  optional as optional7,
  array as array3,
  lazy as lazy2,
  nullable as nullable2,
  number as number2,
  object as object15,
  record as record2,
  string as string11,
  tuple
} from "@metamask/superstruct";
import {
  hasProperty as hasProperty3,
  HexChecksumAddressStruct as HexChecksumAddressStruct2,
  isPlainObject as isPlainObject3,
  JsonStruct
} from "@metamask/utils";
var KeyStruct = nullUnion([string11(), number2()]);
var StringElementStruct = children([
  string11()
]);
var ElementStruct = object15({
  type: string11(),
  props: record2(string11(), JsonStruct),
  key: nullable2(KeyStruct)
});
function nestable(struct) {
  const nestableStruct = nullUnion([
    struct,
    array3(lazy2(() => nestableStruct))
  ]);
  return nestableStruct;
}
function children(structs) {
  return nestable(nullable2(nullUnion([...structs, boolean4()])));
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
  disabled: optional7(boolean4())
});
var CheckboxStruct = element("Checkbox", {
  name: string11(),
  checked: optional7(boolean4()),
  label: optional7(string11()),
  variant: optional7(nullUnion([literal("default"), literal("toggle")]))
});
var InputStruct2 = element("Input", {
  name: string11(),
  type: optional7(
    nullUnion([literal("text"), literal("password"), literal("number")])
  ),
  value: optional7(string11()),
  placeholder: optional7(string11())
});
var OptionStruct = element("Option", {
  value: string11(),
  children: string11()
});
var DropdownStruct = element("Dropdown", {
  name: string11(),
  value: optional7(string11()),
  children: children([OptionStruct])
});
var FileInputStruct = element(
  "FileInput",
  {
    name: string11(),
    accept: nullUnion([optional7(array3(string11()))]),
    compact: optional7(boolean4())
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
  tuple(BUTTON_INPUT),
  ...FIELD_CHILDREN_ARRAY
]);
var FieldStruct = element("Field", {
  label: optional7(string11()),
  error: optional7(string11()),
  children: FieldChildStruct
});
var FormChildStruct = children(
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  [FieldStruct, lazy2(() => BoxChildStruct)]
);
var FormStruct2 = element("Form", {
  children: FormChildStruct,
  name: string11()
});
var BoldStruct = element("Bold", {
  children: children([
    string11(),
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    lazy2(() => ItalicStruct)
  ])
});
var ItalicStruct = element("Italic", {
  children: children([
    string11(),
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    lazy2(() => BoldStruct)
  ])
});
var FormattingStruct = nullUnion([
  BoldStruct,
  ItalicStruct
]);
var AddressStruct2 = element("Address", {
  address: HexChecksumAddressStruct2
});
var BoxChildrenStruct = children(
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  [lazy2(() => BoxChildStruct)]
);
var BoxStruct = element("Box", {
  children: BoxChildrenStruct,
  direction: optional7(nullUnion([literal("horizontal"), literal("vertical")])),
  alignment: optional7(
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
  tuple([ButtonStruct2, ButtonStruct2]),
  ButtonStruct2
]);
var FooterStruct = element("Footer", {
  children: FooterChildStruct
});
var ContainerChildStruct = nullUnion([
  tuple([BoxStruct, FooterStruct]),
  BoxStruct
]);
var ContainerStruct = element(
  "Container",
  {
    children: ContainerChildStruct
  }
);
var CopyableStruct2 = element("Copyable", {
  value: string11(),
  sensitive: optional7(boolean4())
});
var DividerStruct2 = element("Divider");
var ValueStruct = element("Value", {
  value: string11(),
  extra: string11()
});
var CardStruct = element("Card", {
  image: optional7(string11()),
  title: string11(),
  description: optional7(string11()),
  value: string11(),
  extra: optional7(string11())
});
var HeadingStruct2 = element("Heading", {
  children: StringElementStruct
});
var ImageStruct2 = element("Image", {
  src: svg(),
  alt: optional7(string11())
});
var LinkStruct = element("Link", {
  href: string11(),
  children: children([FormattingStruct, string11()])
});
var TextStruct2 = element("Text", {
  children: children([string11(), BoldStruct, ItalicStruct, LinkStruct]),
  alignment: optional7(
    nullUnion([literal("start"), literal("center"), literal("end")])
  )
});
var TooltipChildStruct = nullUnion([
  TextStruct2,
  BoldStruct,
  ItalicStruct,
  LinkStruct,
  ImageStruct2,
  boolean4()
]);
var TooltipContentStruct = nullUnion([
  TextStruct2,
  BoldStruct,
  ItalicStruct,
  LinkStruct,
  string11()
]);
var TooltipStruct = element("Tooltip", {
  children: nullable2(TooltipChildStruct),
  content: TooltipContentStruct
});
var RowStruct2 = element("Row", {
  label: string11(),
  children: nullUnion([AddressStruct2, ImageStruct2, TextStruct2, ValueStruct]),
  variant: optional7(
    nullUnion([literal("default"), literal("warning"), literal("critical")])
  ),
  tooltip: optional7(string11())
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
var StateStruct = union7([FileStruct, string12(), boolean5()]);
var FormStateStruct = record3(string12(), nullable3(StateStruct));
var InterfaceStateStruct = record3(
  string12(),
  union7([FormStateStruct, nullable3(StateStruct)])
);
var ComponentOrElementStruct = union7([
  ComponentStruct,
  RootJSXElementStruct
]);
var InterfaceContextStruct = record3(string12(), JsonStruct2);
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
  FileStruct,
  FileUploadEventStruct,
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
  InterfaceContextStruct,
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
  StateStruct,
  TextStruct,
  TransactionRejected,
  UnauthorizedError,
  UnsupportedMethodError,
  UserInputEventStruct,
  UserInputEventType,
  UserRejectedRequestError,
  address,
  assert2 as assert,
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
  literal,
  panel,
  row,
  spinner,
  text,
  union
};
//# sourceMappingURL=index.mjs.map