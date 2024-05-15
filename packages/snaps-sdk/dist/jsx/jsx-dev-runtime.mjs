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
import {
  hasProperty,
  HexChecksumAddressStruct,
  isPlainObject,
  JsonStruct
} from "@metamask/utils";
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
  string
} from "superstruct";

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

// src/internals/jsx.ts
function nullUnion(structs) {
  return union(structs);
}

// src/jsx/validation.ts
var KeyStruct = nullUnion([string(), number()]);
var StringElementStruct = maybeArray(
  string()
);
var ElementStruct = object({
  type: string(),
  props: record(string(), JsonStruct),
  key: nullable(KeyStruct)
});
function maybeArray(struct) {
  return nullUnion([struct, array(struct)]);
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
  name: optional(string()),
  type: optional(nullUnion([literal("button"), literal("submit")])),
  variant: optional(nullUnion([literal("primary"), literal("destructive")])),
  disabled: optional(boolean())
});
var InputStruct = element("Input", {
  name: string(),
  type: optional(
    nullUnion([literal("text"), literal("password"), literal("number")])
  ),
  value: optional(string()),
  placeholder: optional(string())
});
var FieldStruct = element("Field", {
  label: optional(string()),
  error: optional(string()),
  children: InputStruct
});
var FormStruct = element("Form", {
  children: maybeArray(nullUnion([FieldStruct, ButtonStruct])),
  name: string()
});
var BoldStruct = element("Bold", {
  children: maybeArray(
    nullable(
      nullUnion([
        string(),
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        lazy(() => ItalicStruct)
      ])
    )
  )
});
var ItalicStruct = element("Italic", {
  children: maybeArray(
    nullable(
      nullUnion([
        string(),
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        lazy(() => BoldStruct)
      ])
    )
  )
});
var FormattingStruct = nullUnion([
  BoldStruct,
  ItalicStruct
]);
var AddressStruct = element("Address", {
  address: HexChecksumAddressStruct
});
var BoxStruct = element("Box", {
  children: maybeArray(
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    nullable(lazy(() => JSXElementStruct))
  )
});
var CopyableStruct = element("Copyable", {
  value: string(),
  sensitive: optional(boolean())
});
var DividerStruct = element("Divider");
var HeadingStruct = element("Heading", {
  children: StringElementStruct
});
var ImageStruct = element("Image", {
  src: string(),
  alt: optional(string())
});
var LinkStruct = element("Link", {
  href: string(),
  children: maybeArray(nullable(nullUnion([FormattingStruct, string()])))
});
var TextStruct = element("Text", {
  children: maybeArray(
    nullable(nullUnion([string(), BoldStruct, ItalicStruct, LinkStruct]))
  )
});
var RowStruct = element("Row", {
  label: string(),
  children: nullUnion([AddressStruct, ImageStruct, TextStruct]),
  variant: optional(
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
  return is(value, JSXElementStruct);
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
  jsxDEV
};
//# sourceMappingURL=jsx-dev-runtime.mjs.map