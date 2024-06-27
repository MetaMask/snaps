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

// src/jsx/index.ts
var jsx_exports = {};
__export(jsx_exports, {
  Address: () => Address,
  Bold: () => Bold,
  Box: () => Box,
  BoxChildStruct: () => BoxChildStruct,
  Button: () => Button,
  Checkbox: () => Checkbox,
  Container: () => Container,
  Copyable: () => Copyable,
  Divider: () => Divider,
  Dropdown: () => Dropdown,
  Field: () => Field,
  FieldChildUnionStruct: () => FieldChildUnionStruct,
  FileInput: () => FileInput,
  Footer: () => Footer,
  Form: () => Form,
  FormChildStruct: () => FormChildStruct,
  Heading: () => Heading,
  Image: () => Image,
  Input: () => Input,
  Italic: () => Italic,
  JSXElementStruct: () => JSXElementStruct,
  Link: () => Link,
  Option: () => Option,
  RootJSXElementStruct: () => RootJSXElementStruct,
  Row: () => Row,
  Spinner: () => Spinner,
  Text: () => Text,
  Tooltip: () => Tooltip,
  Value: () => Value,
  assertJSXElement: () => assertJSXElement,
  createSnapComponent: () => createSnapComponent,
  isJSXElement: () => isJSXElement,
  isJSXElementUnsafe: () => isJSXElementUnsafe,
  jsx: () => jsx,
  jsxDEV: () => jsxDEV,
  jsxs: () => jsxs
});
module.exports = __toCommonJS(jsx_exports);

// src/jsx/component.ts
function removeUndefinedProps(props) {
  return Object.fromEntries(
    Object.entries(props).filter(([, value]) => value !== void 0)
  );
}
function createSnapComponent(type) {
  return (props) => {
    const { key = null, ...rest } = props;
    return {
      type,
      props: removeUndefinedProps(rest),
      key
    };
  };
}

// src/jsx/components/form/Button.ts
var TYPE = "Button";
var Button = createSnapComponent(TYPE);

// src/jsx/components/form/Checkbox.ts
var TYPE2 = "Checkbox";
var Checkbox = createSnapComponent(TYPE2);

// src/jsx/components/form/Dropdown.ts
var TYPE3 = "Dropdown";
var Dropdown = createSnapComponent(TYPE3);

// src/jsx/components/form/Option.ts
var TYPE4 = "Option";
var Option = createSnapComponent(TYPE4);

// src/jsx/components/form/Field.ts
var TYPE5 = "Field";
var Field = createSnapComponent(TYPE5);

// src/jsx/components/form/FileInput.ts
var TYPE6 = "FileInput";
var FileInput = createSnapComponent(TYPE6);

// src/jsx/components/form/Form.ts
var TYPE7 = "Form";
var Form = createSnapComponent(TYPE7);

// src/jsx/components/form/Input.ts
var TYPE8 = "Input";
var Input = createSnapComponent(TYPE8);

// src/jsx/components/formatting/Bold.ts
var TYPE9 = "Bold";
var Bold = createSnapComponent(TYPE9);

// src/jsx/components/formatting/Italic.ts
var TYPE10 = "Italic";
var Italic = createSnapComponent(TYPE10);

// src/jsx/components/Address.ts
var TYPE11 = "Address";
var Address = createSnapComponent(TYPE11);

// src/jsx/components/Box.ts
var TYPE12 = "Box";
var Box = createSnapComponent(TYPE12);

// src/jsx/components/Copyable.ts
var TYPE13 = "Copyable";
var Copyable = createSnapComponent(TYPE13);

// src/jsx/components/Divider.ts
var TYPE14 = "Divider";
var Divider = createSnapComponent(TYPE14);

// src/jsx/components/Value.ts
var TYPE15 = "Value";
var Value = createSnapComponent(TYPE15);

// src/jsx/components/Heading.ts
var TYPE16 = "Heading";
var Heading = createSnapComponent(TYPE16);

// src/jsx/components/Image.ts
var TYPE17 = "Image";
var Image = createSnapComponent(TYPE17);

// src/jsx/components/Link.ts
var TYPE18 = "Link";
var Link = createSnapComponent(TYPE18);

// src/jsx/components/Row.ts
var TYPE19 = "Row";
var Row = createSnapComponent(TYPE19);

// src/jsx/components/Spinner.ts
var TYPE20 = "Spinner";
var Spinner = createSnapComponent(TYPE20);

// src/jsx/components/Text.ts
var TYPE21 = "Text";
var Text = createSnapComponent(TYPE21);

// src/jsx/components/Tooltip.ts
var TYPE22 = "Tooltip";
var Tooltip = createSnapComponent(TYPE22);

// src/jsx/components/Footer.ts
var TYPE23 = "Footer";
var Footer = createSnapComponent(TYPE23);

// src/jsx/components/Container.ts
var TYPE24 = "Container";
var Container = createSnapComponent(TYPE24);

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
function jsxs(component, props, key) {
  return jsx(component, props, key);
}

// src/jsx/validation.ts
var import_superstruct3 = require("@metamask/superstruct");
var import_utils = require("@metamask/utils");

// src/internals/structs.ts
var import_superstruct = require("@metamask/superstruct");
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
  props: (0, import_superstruct3.record)((0, import_superstruct3.string)(), import_utils.JsonStruct),
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
  address: import_utils.HexChecksumAddressStruct
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
var BoxChildStruct = nullUnion([
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
  CheckboxStruct
]);
var RootJSXElementStruct = BoxChildStruct;
var JSXElementStruct = nullUnion([
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
  ContainerStruct
]);
function isJSXElement(value) {
  return (0, import_superstruct3.is)(value, JSXElementStruct);
}
function isJSXElementUnsafe(value) {
  return (0, import_utils.isPlainObject)(value) && (0, import_utils.hasProperty)(value, "type") && (0, import_utils.hasProperty)(value, "props") && (0, import_utils.hasProperty)(value, "key");
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
//# sourceMappingURL=index.js.map