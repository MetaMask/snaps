"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/ui.tsx
var _snapssdk = require('@metamask/snaps-sdk');

















var _jsx = require('@metamask/snaps-sdk/jsx');






var _utils = require('@metamask/utils');
var _marked = require('marked');
var _jsxruntime = require('@metamask/snaps-sdk/jsx-runtime');
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
      return /* @__PURE__ */ _jsxruntime.jsx.call(void 0, _jsx.Link, { href: token.href, children: getLinkText(token) });
    }
    case "text":
      return token.text;
    case "strong":
      return /* @__PURE__ */ _jsxruntime.jsx.call(void 0, _jsx.Bold, { children: getTextChildFromTokens(
        // Due to the way `marked` is typed, `token.tokens` can be
        // `undefined`, but it's a required field of `Tokens.Bold`, so we
        // can safely cast it to `Token[]`.
        token.tokens
      ) });
    case "em":
      return /* @__PURE__ */ _jsxruntime.jsx.call(void 0, _jsx.Italic, { children: getTextChildFromTokens(
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
  const rootTokens = _marked.lexer.call(void 0, value, { gfm: false });
  const children = [];
  _marked.walkTokens.call(void 0, rootTokens, (token) => {
    if (token.type === "paragraph") {
      if (children.length > 0) {
        children.push("\n\n");
      }
      const { tokens } = token;
      children.push(
        ...tokens.flatMap(getTextChildFromToken)
      );
    }
  });
  return children.filter((child) => child !== null);
}
function validateComponentTextSize(component) {
  const textSize = getTotalTextLength(component);
  _utils.assert.call(void 0, 
    textSize <= MAX_TEXT_LENGTH,
    `The text in a Snap UI may not be larger than ${MAX_TEXT_LENGTH / 1e3} kB.`
  );
}
function getJsxElementFromComponent(legacyComponent) {
  validateComponentTextSize(legacyComponent);
  function getElement(component) {
    switch (component.type) {
      case _snapssdk.NodeType.Address:
        return /* @__PURE__ */ _jsxruntime.jsx.call(void 0, _jsx.Address, { address: component.value });
      case _snapssdk.NodeType.Button:
        return /* @__PURE__ */ _jsxruntime.jsx.call(void 0, 
          _jsx.Button,
          {
            name: component.name,
            variant: getButtonVariant(component.variant),
            type: component.buttonType,
            children: component.value
          }
        );
      case _snapssdk.NodeType.Copyable:
        return /* @__PURE__ */ _jsxruntime.jsx.call(void 0, _jsx.Copyable, { value: component.value, sensitive: component.sensitive });
      case _snapssdk.NodeType.Divider:
        return /* @__PURE__ */ _jsxruntime.jsx.call(void 0, _jsx.Divider, {});
      case _snapssdk.NodeType.Form:
        return /* @__PURE__ */ _jsxruntime.jsx.call(void 0, _jsx.Form, { name: component.name, children: getChildren(component.children.map(getElement)) });
      case _snapssdk.NodeType.Heading:
        return /* @__PURE__ */ _jsxruntime.jsx.call(void 0, _jsx.Heading, { children: component.value });
      case _snapssdk.NodeType.Image:
        return /* @__PURE__ */ _jsxruntime.jsx.call(void 0, _jsx.Image, { src: component.value });
      case _snapssdk.NodeType.Input:
        return /* @__PURE__ */ _jsxruntime.jsx.call(void 0, _jsx.Field, { label: component.label, error: component.error, children: /* @__PURE__ */ _jsxruntime.jsx.call(void 0, 
          _jsx.Input,
          {
            name: component.name,
            type: component.inputType,
            value: component.value,
            placeholder: component.placeholder
          }
        ) });
      case _snapssdk.NodeType.Panel:
        return /* @__PURE__ */ _jsxruntime.jsx.call(void 0, _jsx.Box, { children: getChildren(component.children.map(getElement)) });
      case _snapssdk.NodeType.Row:
        return /* @__PURE__ */ _jsxruntime.jsx.call(void 0, _jsx.Row, { label: component.label, variant: component.variant, children: getElement(component.value) });
      case _snapssdk.NodeType.Spinner:
        return /* @__PURE__ */ _jsxruntime.jsx.call(void 0, _jsx.Spinner, {});
      case _snapssdk.NodeType.Text:
        return /* @__PURE__ */ _jsxruntime.jsx.call(void 0, _jsx.Text, { children: getChildren(getTextChildren(component.value)) });
      default:
        return _utils.assertExhaustive.call(void 0, component);
    }
  }
  return getElement(legacyComponent);
}
function getMarkdownLinks(text) {
  const tokens = _marked.lexer.call(void 0, text, { gfm: false });
  const links = [];
  _marked.walkTokens.call(void 0, tokens, (token) => {
    if (token.type === "link") {
      links.push(token);
    }
  });
  return links;
}
function validateLink(link, isOnPhishingList) {
  try {
    const url = new URL(link);
    _utils.assert.call(void 0, 
      ALLOWED_PROTOCOLS.includes(url.protocol),
      `Protocol must be one of: ${ALLOWED_PROTOCOLS.join(", ")}.`
    );
    const hostname = url.protocol === "mailto:" ? url.pathname.split("@")[1] : url.hostname;
    _utils.assert.call(void 0, !isOnPhishingList(hostname), "The specified URL is not allowed.");
  } catch (error) {
    throw new Error(
      `Invalid URL: ${error instanceof _utils.AssertionError ? error.message : "Unable to parse URL."}`
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
    case _snapssdk.NodeType.Panel:
      return component.children.reduce(
        // This is a bug in TypeScript: https://github.com/microsoft/TypeScript/issues/48313
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        (sum, node) => sum + getTotalTextLength(node),
        0
      );
    case _snapssdk.NodeType.Row:
      return getTotalTextLength(component.value);
    case _snapssdk.NodeType.Text:
      return component.value.length;
    default:
      return 0;
  }
}
function hasChildren(element) {
  return _utils.hasProperty.call(void 0, element.props, "children");
}
function filterJsxChild(child) {
  return Boolean(child) && child !== true;
}
function getJsxChildren(element) {
  if (hasChildren(element)) {
    if (Array.isArray(element.props.children)) {
      return element.props.children.filter(filterJsxChild).flat(Infinity);
    }
    if (element.props.children) {
      return [element.props.children];
    }
  }
  return [];
}
function walkJsx(node, callback, depth = 0) {
  if (Array.isArray(node)) {
    for (const child of node) {
      const childResult = walkJsx(child, callback, depth);
      if (childResult !== void 0) {
        return childResult;
      }
    }
    return void 0;
  }
  const result = callback(node, depth);
  if (result !== void 0) {
    return result;
  }
  if (_utils.hasProperty.call(void 0, node, "props") && _utils.isPlainObject.call(void 0, node.props) && _utils.hasProperty.call(void 0, node.props, "children")) {
    const children = getJsxChildren(node);
    for (const child of children) {
      if (_utils.isPlainObject.call(void 0, child)) {
        const childResult = walkJsx(child, callback, depth + 1);
        if (childResult !== void 0) {
          return childResult;
        }
      }
    }
  }
  return void 0;
}
function serialiseProp(prop) {
  if (typeof prop === "string") {
    return `"${prop}"`;
  }
  return `{${JSON.stringify(prop)}}`;
}
function serialiseProps(props) {
  return Object.entries(props).filter(([key]) => key !== "children").sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => ` ${key}=${serialiseProp(value)}`).join("");
}
function serialiseJsx(node, indentation = 0) {
  if (Array.isArray(node)) {
    return node.map((child) => serialiseJsx(child, indentation)).join("");
  }
  const indent = "  ".repeat(indentation);
  if (typeof node === "string") {
    return `${indent}${node}
`;
  }
  if (!node) {
    return "";
  }
  const { type, props } = node;
  const trailingNewline = indentation > 0 ? "\n" : "";
  if (_utils.hasProperty.call(void 0, props, "children")) {
    const children = serialiseJsx(props.children, indentation + 1);
    return `${indent}<${type}${serialiseProps(
      props
    )}>
${children}${indent}</${type}>${trailingNewline}`;
  }
  return `${indent}<${type}${serialiseProps(props)} />${trailingNewline}`;
}











exports.getTextChildren = getTextChildren; exports.getJsxElementFromComponent = getJsxElementFromComponent; exports.validateTextLinks = validateTextLinks; exports.validateJsxLinks = validateJsxLinks; exports.getTotalTextLength = getTotalTextLength; exports.hasChildren = hasChildren; exports.getJsxChildren = getJsxChildren; exports.walkJsx = walkJsx; exports.serialiseJsx = serialiseJsx;
//# sourceMappingURL=chunk-6ATNGN44.js.map