"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/interface/utils.ts
var _snapssdk = require('@metamask/snaps-sdk');
var _jsx = require('@metamask/snaps-sdk/jsx');





var _snapsutils = require('@metamask/snaps-utils');
function getJsxInterface(component) {
  if (_jsx.isJSXElementUnsafe.call(void 0, component)) {
    return component;
  }
  return _snapsutils.getJsxElementFromComponent.call(void 0, component);
}
function assertNameIsUnique(state, name) {
  _snapssdk.assert.call(void 0, 
    state[name] === void 0,
    `Duplicate component names are not allowed, found multiple instances of: "${name}".`
  );
}
function constructComponentSpecificDefaultState(element) {
  switch (element.type) {
    case "Dropdown": {
      const children = _snapsutils.getJsxChildren.call(void 0, element);
      return children[0]?.props.value;
    }
    case "Checkbox":
      return false;
    default:
      return null;
  }
}
function getComponentStateValue(element) {
  switch (element.type) {
    case "Checkbox":
      return element.props.checked;
    default:
      return element.props.value;
  }
}
function constructInputState(oldState, element, form) {
  const oldStateUnwrapped = form ? oldState[form] : oldState;
  const oldInputState = oldStateUnwrapped?.[element.props.name];
  if (element.type === "FileInput") {
    return oldInputState ?? null;
  }
  return getComponentStateValue(element) ?? oldInputState ?? constructComponentSpecificDefaultState(element) ?? null;
}
function constructState(oldState, rootComponent) {
  const newState = {};
  const formStack = [];
  _snapsutils.walkJsx.call(void 0, rootComponent, (component, depth) => {
    let currentForm = formStack[formStack.length - 1];
    if (currentForm && depth <= currentForm.depth) {
      formStack.pop();
      currentForm = formStack[formStack.length - 1];
    }
    if (component.type === "Form") {
      assertNameIsUnique(newState, component.props.name);
      formStack.push({ name: component.props.name, depth });
      newState[component.props.name] = {};
      return;
    }
    if (currentForm && (component.type === "Input" || component.type === "Dropdown" || component.type === "FileInput" || component.type === "Checkbox")) {
      const formState = newState[currentForm.name];
      assertNameIsUnique(formState, component.props.name);
      formState[component.props.name] = constructInputState(
        oldState,
        component,
        currentForm.name
      );
      return;
    }
    if (component.type === "Input" || component.type === "Dropdown" || component.type === "FileInput" || component.type === "Checkbox") {
      assertNameIsUnique(newState, component.props.name);
      newState[component.props.name] = constructInputState(oldState, component);
    }
  });
  return newState;
}
var MAX_CONTEXT_SIZE = 1e6;
function validateInterfaceContext(context) {
  if (!context) {
    return;
  }
  const size = _snapsutils.getJsonSizeUnsafe.call(void 0, context);
  _snapssdk.assert.call(void 0, 
    size <= MAX_CONTEXT_SIZE,
    `A Snap interface context may not be larger than ${MAX_CONTEXT_SIZE / 1e6} MB.`
  );
}






exports.getJsxInterface = getJsxInterface; exports.assertNameIsUnique = assertNameIsUnique; exports.constructState = constructState; exports.validateInterfaceContext = validateInterfaceContext;
//# sourceMappingURL=chunk-H7TB7I6Z.js.map