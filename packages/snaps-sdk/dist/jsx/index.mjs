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
import {
  is,
  boolean,
  optional,
  array,
  lazy,
  nullable,
  number,
  object,
  record,
  string as string2,
  tuple
} from "@metamask/superstruct";
import {
  hasProperty,
  HexChecksumAddressStruct,
  isPlainObject,
  JsonStruct
} from "@metamask/utils";

// src/internals/structs.ts
import {
  Struct,
  define,
  literal as superstructLiteral,
  union as superstructUnion
} from "@metamask/superstruct";
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

// src/jsx/validation.ts
var KeyStruct = nullUnion([string2(), number()]);
var StringElementStruct = children([
  string2()
]);
var ElementStruct = object({
  type: string2(),
  props: record(string2(), JsonStruct),
  key: nullable(KeyStruct)
});
function nestable(struct) {
  const nestableStruct = nullUnion([
    struct,
    array(lazy(() => nestableStruct))
  ]);
  return nestableStruct;
}
function children(structs) {
  return nestable(nullable(nullUnion([...structs, boolean()])));
}
function element(name, props = {}) {
  return object({
    type: literal(name),
    props: object(props),
    key: nullable(KeyStruct)
  });
}
var ButtonStruct = element("Button", {
  children: StringElementStruct,
  name: optional(string2()),
  type: optional(nullUnion([literal("button"), literal("submit")])),
  variant: optional(nullUnion([literal("primary"), literal("destructive")])),
  disabled: optional(boolean())
});
var CheckboxStruct = element("Checkbox", {
  name: string2(),
  checked: optional(boolean()),
  label: optional(string2()),
  variant: optional(nullUnion([literal("default"), literal("toggle")]))
});
var InputStruct = element("Input", {
  name: string2(),
  type: optional(
    nullUnion([literal("text"), literal("password"), literal("number")])
  ),
  value: optional(string2()),
  placeholder: optional(string2())
});
var OptionStruct = element("Option", {
  value: string2(),
  children: string2()
});
var DropdownStruct = element("Dropdown", {
  name: string2(),
  value: optional(string2()),
  children: children([OptionStruct])
});
var FileInputStruct = element(
  "FileInput",
  {
    name: string2(),
    accept: nullUnion([optional(array(string2()))]),
    compact: optional(boolean())
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
  tuple(BUTTON_INPUT),
  ...FIELD_CHILDREN_ARRAY
]);
var FieldStruct = element("Field", {
  label: optional(string2()),
  error: optional(string2()),
  children: FieldChildStruct
});
var FormChildStruct = children(
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  [FieldStruct, lazy(() => BoxChildStruct)]
);
var FormStruct = element("Form", {
  children: FormChildStruct,
  name: string2()
});
var BoldStruct = element("Bold", {
  children: children([
    string2(),
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    lazy(() => ItalicStruct)
  ])
});
var ItalicStruct = element("Italic", {
  children: children([
    string2(),
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    lazy(() => BoldStruct)
  ])
});
var FormattingStruct = nullUnion([
  BoldStruct,
  ItalicStruct
]);
var AddressStruct = element("Address", {
  address: HexChecksumAddressStruct
});
var BoxChildrenStruct = children(
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  [lazy(() => BoxChildStruct)]
);
var BoxStruct = element("Box", {
  children: BoxChildrenStruct,
  direction: optional(nullUnion([literal("horizontal"), literal("vertical")])),
  alignment: optional(
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
  tuple([ButtonStruct, ButtonStruct]),
  ButtonStruct
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
var CopyableStruct = element("Copyable", {
  value: string2(),
  sensitive: optional(boolean())
});
var DividerStruct = element("Divider");
var ValueStruct = element("Value", {
  value: string2(),
  extra: string2()
});
var HeadingStruct = element("Heading", {
  children: StringElementStruct
});
var ImageStruct = element("Image", {
  src: svg(),
  alt: optional(string2())
});
var LinkStruct = element("Link", {
  href: string2(),
  children: children([FormattingStruct, string2()])
});
var TextStruct = element("Text", {
  children: children([string2(), BoldStruct, ItalicStruct, LinkStruct]),
  alignment: optional(
    nullUnion([literal("start"), literal("center"), literal("end")])
  )
});
var TooltipChildStruct = nullUnion([
  TextStruct,
  BoldStruct,
  ItalicStruct,
  LinkStruct,
  ImageStruct,
  boolean()
]);
var TooltipContentStruct = nullUnion([
  TextStruct,
  BoldStruct,
  ItalicStruct,
  LinkStruct,
  string2()
]);
var TooltipStruct = element("Tooltip", {
  children: nullable(TooltipChildStruct),
  content: TooltipContentStruct
});
var RowStruct = element("Row", {
  label: string2(),
  children: nullUnion([AddressStruct, ImageStruct, TextStruct, ValueStruct]),
  variant: optional(
    nullUnion([literal("default"), literal("warning"), literal("critical")])
  ),
  tooltip: optional(string2())
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
  return is(value, JSXElementStruct);
}
function isJSXElementUnsafe(value) {
  return isPlainObject(value) && hasProperty(value, "type") && hasProperty(value, "props") && hasProperty(value, "key");
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
export {
  Address,
  Bold,
  Box,
  BoxChildStruct,
  Button,
  Checkbox,
  Container,
  Copyable,
  Divider,
  Dropdown,
  Field,
  FieldChildUnionStruct,
  FileInput,
  Footer,
  Form,
  FormChildStruct,
  Heading,
  Image,
  Input,
  Italic,
  JSXElementStruct,
  Link,
  Option,
  RootJSXElementStruct,
  Row,
  Spinner,
  Text,
  Tooltip,
  Value,
  assertJSXElement,
  createSnapComponent,
  isJSXElement,
  isJSXElementUnsafe,
  jsx,
  jsxDEV,
  jsxs
};
//# sourceMappingURL=index.mjs.map