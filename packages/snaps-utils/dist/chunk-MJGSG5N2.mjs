// src/ui.tsx
import { NodeType } from "@metamask/snaps-sdk";
import {
  Italic,
  Link,
  Bold,
  Row,
  Text,
  Field,
  Image,
  Input,
  Heading,
  Form,
  Divider,
  Spinner,
  Copyable,
  Box,
  Button,
  Address
} from "@metamask/snaps-sdk/jsx";
import {
  assert,
  assertExhaustive,
  AssertionError,
  hasProperty,
  isPlainObject
} from "@metamask/utils";
import { lexer, walkTokens } from "marked";
import { jsx } from "@metamask/snaps-sdk/jsx-runtime";
var MAX_TEXT_LENGTH = 5e4;
var ALLOWED_PROTOCOLS = ["https:", "mailto:"];
function getButtonVariant(variant) {
  switch (variant) {
    case "primary":
      return "primary";
    case "secondary":
      return "destructive";
    default:
      return void 0;
  }
}
function getChildren(elements) {
  if (elements.length === 1) {
    return elements[0];
  }
  return elements;
}
function getLinkText(token) {
  if (token.tokens && token.tokens.length > 0) {
    return getChildren(token.tokens.flatMap(getTextChildFromToken));
  }
  return token.href;
}
function getTextChildFromTokens(tokens) {
  return getChildren(tokens.flatMap(getTextChildFromToken));
}
function getTextChildFromToken(token) {
  switch (token.type) {
    case "link": {
      return /* @__PURE__ */ jsx(Link, { href: token.href, children: getLinkText(token) });
    }
    case "text":
      return token.text;
    case "strong":
      return /* @__PURE__ */ jsx(Bold, { children: getTextChildFromTokens(
        // Due to the way `marked` is typed, `token.tokens` can be
        // `undefined`, but it's a required field of `Tokens.Bold`, so we
        // can safely cast it to `Token[]`.
        token.tokens
      ) });
    case "em":
      return /* @__PURE__ */ jsx(Italic, { children: getTextChildFromTokens(
        // Due to the way `marked` is typed, `token.tokens` can be
        // `undefined`, but it's a required field of `Tokens.Bold`, so we
        // can safely cast it to `Token[]`.
        token.tokens
      ) });
    default:
      return null;
  }
}
function getTextChildren(value) {
  const rootTokens = lexer(value, { gfm: false });
  const children = [];
  walkTokens(rootTokens, (token) => {
    if (token.type === "paragraph") {
      if (children.length > 0) {
        children.push("\n\n");
      }
      const { tokens } = token;
      children.push(...tokens.flatMap(getTextChildFromToken));
    }
  });
  return children.filter((child) => child !== null);
}
function validateComponentTextSize(component) {
  const textSize = getTotalTextLength(component);
  assert(
    textSize <= MAX_TEXT_LENGTH,
    `The text in a Snap UI may not be larger than ${MAX_TEXT_LENGTH / 1e3} kB.`
  );
}
function getJsxElementFromComponent(legacyComponent) {
  validateComponentTextSize(legacyComponent);
  function getElement(component) {
    switch (component.type) {
      case NodeType.Address:
        return /* @__PURE__ */ jsx(Address, { address: component.value });
      case NodeType.Button:
        return /* @__PURE__ */ jsx(
          Button,
          {
            name: component.name,
            variant: getButtonVariant(component.variant),
            type: component.buttonType,
            children: component.value
          }
        );
      case NodeType.Copyable:
        return /* @__PURE__ */ jsx(Copyable, { value: component.value, sensitive: component.sensitive });
      case NodeType.Divider:
        return /* @__PURE__ */ jsx(Divider, {});
      case NodeType.Form:
        return /* @__PURE__ */ jsx(Form, { name: component.name, children: getChildren(component.children.map(getElement)) });
      case NodeType.Heading:
        return /* @__PURE__ */ jsx(Heading, { children: component.value });
      case NodeType.Image:
        return /* @__PURE__ */ jsx(Image, { src: component.value });
      case NodeType.Input:
        return /* @__PURE__ */ jsx(Field, { label: component.label, error: component.error, children: /* @__PURE__ */ jsx(
          Input,
          {
            name: component.name,
            type: component.inputType,
            value: component.value,
            placeholder: component.placeholder
          }
        ) });
      case NodeType.Panel:
        return /* @__PURE__ */ jsx(Box, { children: getChildren(component.children.map(getElement)) });
      case NodeType.Row:
        return /* @__PURE__ */ jsx(Row, { label: component.label, children: getElement(component.value) });
      case NodeType.Spinner:
        return /* @__PURE__ */ jsx(Spinner, {});
      case NodeType.Text:
        return /* @__PURE__ */ jsx(Text, { children: getChildren(getTextChildren(component.value)) });
      default:
        return assertExhaustive(component);
    }
  }
  return getElement(legacyComponent);
}
function getMarkdownLinks(text) {
  const tokens = lexer(text, { gfm: false });
  const links = [];
  walkTokens(tokens, (token) => {
    if (token.type === "link") {
      links.push(token);
    }
  });
  return links;
}
function validateLink(link, isOnPhishingList) {
  try {
    const url = new URL(link);
    assert(
      ALLOWED_PROTOCOLS.includes(url.protocol),
      `Protocol must be one of: ${ALLOWED_PROTOCOLS.join(", ")}.`
    );
    const hostname = url.protocol === "mailto:" ? url.pathname.split("@")[1] : url.hostname;
    assert(!isOnPhishingList(hostname), "The specified URL is not allowed.");
  } catch (error) {
    throw new Error(
      `Invalid URL: ${error instanceof AssertionError ? error.message : "Unable to parse URL."}`
    );
  }
}
function validateTextLinks(text, isOnPhishingList) {
  const links = getMarkdownLinks(text);
  for (const link of links) {
    validateLink(link.href, isOnPhishingList);
  }
}
function validateJsxLinks(node, isOnPhishingList) {
  walkJsx(node, (childNode) => {
    if (childNode.type !== "Link") {
      return;
    }
    validateLink(childNode.props.href, isOnPhishingList);
  });
}
function getTotalTextLength(component) {
  const { type } = component;
  switch (type) {
    case NodeType.Panel:
      return component.children.reduce(
        // This is a bug in TypeScript: https://github.com/microsoft/TypeScript/issues/48313
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        (sum, node) => sum + getTotalTextLength(node),
        0
      );
    case NodeType.Row:
      return getTotalTextLength(component.value);
    case NodeType.Text:
      return component.value.length;
    default:
      return 0;
  }
}
function hasChildren(element) {
  return hasProperty(element.props, "children");
}
function getJsxChildren(element) {
  if (hasChildren(element)) {
    if (Array.isArray(element.props.children)) {
      return element.props.children.filter(Boolean);
    }
    if (element.props.children) {
      return [element.props.children];
    }
  }
  return [];
}
function walkJsx(node, callback) {
  if (Array.isArray(node)) {
    for (const child of node) {
      const childResult = walkJsx(child, callback);
      if (childResult !== void 0) {
        return childResult;
      }
    }
    return void 0;
  }
  const result = callback(node);
  if (result !== void 0) {
    return result;
  }
  if (hasProperty(node, "props") && isPlainObject(node.props) && hasProperty(node.props, "children")) {
    const children = getJsxChildren(node);
    for (const child of children) {
      if (isPlainObject(child)) {
        const childResult = walkJsx(child, callback);
        if (childResult !== void 0) {
          return childResult;
        }
      }
    }
  }
  return void 0;
}

export {
  getTextChildren,
  getJsxElementFromComponent,
  validateTextLinks,
  validateJsxLinks,
  getTotalTextLength,
  hasChildren,
  getJsxChildren,
  walkJsx
};
//# sourceMappingURL=chunk-MJGSG5N2.mjs.map