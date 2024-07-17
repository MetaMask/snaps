// src/interface/utils.ts
import { assert } from "@metamask/snaps-sdk";
import { isJSXElementUnsafe } from "@metamask/snaps-sdk/jsx";
import {
  getJsonSizeUnsafe,
  getJsxChildren,
  getJsxElementFromComponent,
  walkJsx
} from "@metamask/snaps-utils";
function getJsxInterface(component) {
  if (isJSXElementUnsafe(component)) {
    return component;
  }
  return getJsxElementFromComponent(component);
}
function assertNameIsUnique(state, name) {
  assert(
    state[name] === void 0,
    `Duplicate component names are not allowed, found multiple instances of: "${name}".`
  );
}
function constructComponentSpecificDefaultState(element) {
  switch (element.type) {
    case "Dropdown": {
      const children = getJsxChildren(element);
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
  walkJsx(rootComponent, (component, depth) => {
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
  const size = getJsonSizeUnsafe(context);
  assert(
    size <= MAX_CONTEXT_SIZE,
    `A Snap interface context may not be larger than ${MAX_CONTEXT_SIZE / 1e6} MB.`
  );
}

export {
  getJsxInterface,
  assertNameIsUnique,
  constructState,
  validateInterfaceContext
};
//# sourceMappingURL=chunk-3T6W5VI2.mjs.map