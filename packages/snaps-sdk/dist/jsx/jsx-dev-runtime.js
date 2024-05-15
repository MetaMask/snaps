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

// src/jsx/jsx-dev-runtime.ts
var jsx_dev_runtime_exports = {};
__export(jsx_dev_runtime_exports, {
  jsxDEV: () => jsxDEV
});
module.exports = __toCommonJS(jsx_dev_runtime_exports);

// src/jsx/jsx-runtime.ts
function jsx(component, props, key) {
  if (typeof component === "string") {
    throw new Error(
      `An HTML element ("${String(
        component
      )}") was used in a Snap component, which is not supported by Snaps UI. Please use one of the supported Snap components.`
    );
  }
  if (!component) {
    throw new Error(
      "A JSX fragment was used in a Snap component, which is not supported by Snaps UI. Please use one of the supported Snap components."
    );
  }
  return component({ ...props, key });
}

// src/jsx/validation.ts
var import_utils = require("@metamask/utils");
var import_superstruct2 = require("superstruct");

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

// src/internals/jsx.ts
function nullUnion(structs) {
  return union(structs);
}

// src/jsx/validation.ts
var KeyStruct = nullUnion([(0, import_superstruct2.string)(), (0, import_superstruct2.number)()]);
var StringElementStruct = maybeArray(
  (0, import_superstruct2.string)()
);
var ElementStruct = (0, import_superstruct2.object)({
  type: (0, import_superstruct2.string)(),
  props: (0, import_superstruct2.record)((0, import_superstruct2.string)(), import_utils.JsonStruct),
  key: (0, import_superstruct2.nullable)(KeyStruct)
});
function maybeArray(struct) {
  return nullUnion([struct, (0, import_superstruct2.array)(struct)]);
}
function element(name, props = {}) {
  return (0, import_superstruct2.object)({
    type: literal(name),
    props: (0, import_superstruct2.object)(props),
    key: (0, import_superstruct2.nullable)(KeyStruct)
  });
}
var ButtonStruct = element("Button", {
  children: StringElementStruct,
  name: (0, import_superstruct2.optional)((0, import_superstruct2.string)()),
  type: (0, import_superstruct2.optional)(nullUnion([literal("button"), literal("submit")])),
  variant: (0, import_superstruct2.optional)(nullUnion([literal("primary"), literal("destructive")])),
  disabled: (0, import_superstruct2.optional)((0, import_superstruct2.boolean)())
});
var InputStruct = element("Input", {
  name: (0, import_superstruct2.string)(),
  type: (0, import_superstruct2.optional)(
    nullUnion([literal("text"), literal("password"), literal("number")])
  ),
  value: (0, import_superstruct2.optional)((0, import_superstruct2.string)()),
  placeholder: (0, import_superstruct2.optional)((0, import_superstruct2.string)())
});
var FieldStruct = element("Field", {
  label: (0, import_superstruct2.optional)((0, import_superstruct2.string)()),
  error: (0, import_superstruct2.optional)((0, import_superstruct2.string)()),
  children: InputStruct
});
var FormStruct = element("Form", {
  children: maybeArray(nullUnion([FieldStruct, ButtonStruct])),
  name: (0, import_superstruct2.string)()
});
var BoldStruct = element("Bold", {
  children: maybeArray(
    (0, import_superstruct2.nullable)(
      nullUnion([
        (0, import_superstruct2.string)(),
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        (0, import_superstruct2.lazy)(() => ItalicStruct)
      ])
    )
  )
});
var ItalicStruct = element("Italic", {
  children: maybeArray(
    (0, import_superstruct2.nullable)(
      nullUnion([
        (0, import_superstruct2.string)(),
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        (0, import_superstruct2.lazy)(() => BoldStruct)
      ])
    )
  )
});
var FormattingStruct = nullUnion([
  BoldStruct,
  ItalicStruct
]);
var AddressStruct = element("Address", {
  address: import_utils.HexChecksumAddressStruct
});
var BoxStruct = element("Box", {
  children: maybeArray(
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    (0, import_superstruct2.nullable)((0, import_superstruct2.lazy)(() => JSXElementStruct))
  )
});
var CopyableStruct = element("Copyable", {
  value: (0, import_superstruct2.string)(),
  sensitive: (0, import_superstruct2.optional)((0, import_superstruct2.boolean)())
});
var DividerStruct = element("Divider");
var HeadingStruct = element("Heading", {
  children: StringElementStruct
});
var ImageStruct = element("Image", {
  src: (0, import_superstruct2.string)(),
  alt: (0, import_superstruct2.optional)((0, import_superstruct2.string)())
});
var LinkStruct = element("Link", {
  href: (0, import_superstruct2.string)(),
  children: maybeArray((0, import_superstruct2.nullable)(nullUnion([FormattingStruct, (0, import_superstruct2.string)()])))
});
var TextStruct = element("Text", {
  children: maybeArray(
    (0, import_superstruct2.nullable)(nullUnion([(0, import_superstruct2.string)(), BoldStruct, ItalicStruct, LinkStruct]))
  )
});
var RowStruct = element("Row", {
  label: (0, import_superstruct2.string)(),
  children: nullUnion([AddressStruct, ImageStruct, TextStruct]),
  variant: (0, import_superstruct2.optional)(
    nullUnion([literal("default"), literal("warning"), literal("error")])
  )
});
var SpinnerStruct = element("Spinner");
var JSXElementStruct = nullUnion([
  ButtonStruct,
  InputStruct,
  FieldStruct,
  FormStruct,
  BoldStruct,
  ItalicStruct,
  AddressStruct,
  BoxStruct,
  CopyableStruct,
  DividerStruct,
  HeadingStruct,
  ImageStruct,
  LinkStruct,
  RowStruct,
  SpinnerStruct,
  TextStruct
]);
function isJSXElement(value) {
  return (0, import_superstruct2.is)(value, JSXElementStruct);
}
function assertJSXElement(value) {
  if (!isJSXElement(value)) {
    throw new Error(
      `Expected a JSX element, but received ${JSON.stringify(
        value
      )}. Please refer to the documentation for the supported JSX elements and their props.`
    );
  }
}

// src/jsx/jsx-dev-runtime.ts
function jsxDEV(component, props, key) {
  const element2 = jsx(component, props, key);
  assertJSXElement(element2);
  return element2;
}
//# sourceMappingURL=jsx-dev-runtime.js.map