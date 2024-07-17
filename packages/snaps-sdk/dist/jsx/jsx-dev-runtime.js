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
var import_superstruct3 = require("@metamask/superstruct");
var import_utils2 = require("@metamask/utils");

// src/internals/structs.ts
var import_superstruct = require("@metamask/superstruct");
var import_utils = require("@metamask/utils");
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
function typedUnion(structs) {
  return new import_superstruct.Struct({
    type: "union",
    schema: null,
    *entries(value, context) {
      if (!(0, import_utils.isPlainObject)(value) || !(0, import_utils.hasProperty)(value, "type")) {
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
      if (!(0, import_utils.isPlainObject)(value) || !(0, import_utils.hasProperty)(value, "type") || typeof value.type !== "string") {
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

// src/jsx/validation.ts
var KeyStruct = nullUnion([(0, import_superstruct3.string)(), (0, import_superstruct3.number)()]);
var StringElementStruct = children([
  (0, import_superstruct3.string)()
]);
var ElementStruct = (0, import_superstruct3.object)({
  type: (0, import_superstruct3.string)(),
  props: (0, import_superstruct3.record)((0, import_superstruct3.string)(), import_utils2.JsonStruct),
  key: (0, import_superstruct3.nullable)(KeyStruct)
});
function nestable(struct) {
  const nestableStruct = nullUnion([
    struct,
    (0, import_superstruct3.array)((0, import_superstruct3.lazy)(() => nestableStruct))
  ]);
  return nestableStruct;
}
function children(structs) {
  return nestable((0, import_superstruct3.nullable)(nullUnion([...structs, (0, import_superstruct3.boolean)()])));
}
function element(name, props = {}) {
  return (0, import_superstruct3.object)({
    type: literal(name),
    props: (0, import_superstruct3.object)(props),
    key: (0, import_superstruct3.nullable)(KeyStruct)
  });
}
var ButtonStruct = element("Button", {
  children: StringElementStruct,
  name: (0, import_superstruct3.optional)((0, import_superstruct3.string)()),
  type: (0, import_superstruct3.optional)(nullUnion([literal("button"), literal("submit")])),
  variant: (0, import_superstruct3.optional)(nullUnion([literal("primary"), literal("destructive")])),
  disabled: (0, import_superstruct3.optional)((0, import_superstruct3.boolean)())
});
var CheckboxStruct = element("Checkbox", {
  name: (0, import_superstruct3.string)(),
  checked: (0, import_superstruct3.optional)((0, import_superstruct3.boolean)()),
  label: (0, import_superstruct3.optional)((0, import_superstruct3.string)()),
  variant: (0, import_superstruct3.optional)(nullUnion([literal("default"), literal("toggle")]))
});
var InputStruct = element("Input", {
  name: (0, import_superstruct3.string)(),
  type: (0, import_superstruct3.optional)(
    nullUnion([literal("text"), literal("password"), literal("number")])
  ),
  value: (0, import_superstruct3.optional)((0, import_superstruct3.string)()),
  placeholder: (0, import_superstruct3.optional)((0, import_superstruct3.string)())
});
var OptionStruct = element("Option", {
  value: (0, import_superstruct3.string)(),
  children: (0, import_superstruct3.string)()
});
var DropdownStruct = element("Dropdown", {
  name: (0, import_superstruct3.string)(),
  value: (0, import_superstruct3.optional)((0, import_superstruct3.string)()),
  children: children([OptionStruct])
});
var FileInputStruct = element(
  "FileInput",
  {
    name: (0, import_superstruct3.string)(),
    accept: nullUnion([(0, import_superstruct3.optional)((0, import_superstruct3.array)((0, import_superstruct3.string)()))]),
    compact: (0, import_superstruct3.optional)((0, import_superstruct3.boolean)())
  }
);
var BUTTON_INPUT = [InputStruct, ButtonStruct];
var FIELD_CHILDREN_ARRAY = [
  InputStruct,
  DropdownStruct,
  FileInputStruct,
  CheckboxStruct
];
var FieldChildUnionStruct = nullUnion([
  ...FIELD_CHILDREN_ARRAY,
  ...BUTTON_INPUT
]);
var FieldChildStruct = nullUnion([
  (0, import_superstruct3.tuple)(BUTTON_INPUT),
  ...FIELD_CHILDREN_ARRAY
]);
var FieldStruct = element("Field", {
  label: (0, import_superstruct3.optional)((0, import_superstruct3.string)()),
  error: (0, import_superstruct3.optional)((0, import_superstruct3.string)()),
  children: FieldChildStruct
});
var FormChildStruct = children(
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  [FieldStruct, (0, import_superstruct3.lazy)(() => BoxChildStruct)]
);
var FormStruct = element("Form", {
  children: FormChildStruct,
  name: (0, import_superstruct3.string)()
});
var BoldStruct = element("Bold", {
  children: children([
    (0, import_superstruct3.string)(),
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    (0, import_superstruct3.lazy)(() => ItalicStruct)
  ])
});
var ItalicStruct = element("Italic", {
  children: children([
    (0, import_superstruct3.string)(),
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    (0, import_superstruct3.lazy)(() => BoldStruct)
  ])
});
var FormattingStruct = nullUnion([
  BoldStruct,
  ItalicStruct
]);
var AddressStruct = element("Address", {
  address: import_utils2.HexChecksumAddressStruct
});
var BoxChildrenStruct = children(
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  [(0, import_superstruct3.lazy)(() => BoxChildStruct)]
);
var BoxStruct = element("Box", {
  children: BoxChildrenStruct,
  direction: (0, import_superstruct3.optional)(nullUnion([literal("horizontal"), literal("vertical")])),
  alignment: (0, import_superstruct3.optional)(
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
  (0, import_superstruct3.tuple)([ButtonStruct, ButtonStruct]),
  ButtonStruct
]);
var FooterStruct = element("Footer", {
  children: FooterChildStruct
});
var ContainerChildStruct = nullUnion([
  (0, import_superstruct3.tuple)([BoxStruct, FooterStruct]),
  BoxStruct
]);
var ContainerStruct = element(
  "Container",
  {
    children: ContainerChildStruct
  }
);
var CopyableStruct = element("Copyable", {
  value: (0, import_superstruct3.string)(),
  sensitive: (0, import_superstruct3.optional)((0, import_superstruct3.boolean)())
});
var DividerStruct = element("Divider");
var ValueStruct = element("Value", {
  value: (0, import_superstruct3.string)(),
  extra: (0, import_superstruct3.string)()
});
var CardStruct = element("Card", {
  image: (0, import_superstruct3.optional)((0, import_superstruct3.string)()),
  title: (0, import_superstruct3.string)(),
  description: (0, import_superstruct3.optional)((0, import_superstruct3.string)()),
  value: (0, import_superstruct3.string)(),
  extra: (0, import_superstruct3.optional)((0, import_superstruct3.string)())
});
var HeadingStruct = element("Heading", {
  children: StringElementStruct
});
var ImageStruct = element("Image", {
  src: svg(),
  alt: (0, import_superstruct3.optional)((0, import_superstruct3.string)())
});
var LinkStruct = element("Link", {
  href: (0, import_superstruct3.string)(),
  children: children([FormattingStruct, (0, import_superstruct3.string)()])
});
var TextStruct = element("Text", {
  children: children([(0, import_superstruct3.string)(), BoldStruct, ItalicStruct, LinkStruct]),
  alignment: (0, import_superstruct3.optional)(
    nullUnion([literal("start"), literal("center"), literal("end")])
  )
});
var TooltipChildStruct = nullUnion([
  TextStruct,
  BoldStruct,
  ItalicStruct,
  LinkStruct,
  ImageStruct,
  (0, import_superstruct3.boolean)()
]);
var TooltipContentStruct = nullUnion([
  TextStruct,
  BoldStruct,
  ItalicStruct,
  LinkStruct,
  (0, import_superstruct3.string)()
]);
var TooltipStruct = element("Tooltip", {
  children: (0, import_superstruct3.nullable)(TooltipChildStruct),
  content: TooltipContentStruct
});
var RowStruct = element("Row", {
  label: (0, import_superstruct3.string)(),
  children: nullUnion([AddressStruct, ImageStruct, TextStruct, ValueStruct]),
  variant: (0, import_superstruct3.optional)(
    nullUnion([literal("default"), literal("warning"), literal("critical")])
  ),
  tooltip: (0, import_superstruct3.optional)((0, import_superstruct3.string)())
});
var SpinnerStruct = element("Spinner");
var BoxChildStruct = typedUnion([
  AddressStruct,
  BoldStruct,
  BoxStruct,
  ButtonStruct,
  CopyableStruct,
  DividerStruct,
  DropdownStruct,
  FileInputStruct,
  FormStruct,
  HeadingStruct,
  InputStruct,
  ImageStruct,
  ItalicStruct,
  LinkStruct,
  RowStruct,
  SpinnerStruct,
  TextStruct,
  TooltipStruct,
  CheckboxStruct,
  CardStruct
]);
var RootJSXElementStruct = nullUnion([
  BoxChildStruct,
  ContainerStruct
]);
var JSXElementStruct = typedUnion([
  ButtonStruct,
  InputStruct,
  FileInputStruct,
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
  TextStruct,
  DropdownStruct,
  OptionStruct,
  ValueStruct,
  TooltipStruct,
  CheckboxStruct,
  FooterStruct,
  ContainerStruct,
  CardStruct
]);
function isJSXElement(value) {
  return (0, import_superstruct3.is)(value, JSXElementStruct);
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