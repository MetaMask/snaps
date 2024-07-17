import {
  getFileSize,
  getFileToUpload
} from "./chunk-IWJ4HKDR.mjs";
import {
  getCurrentInterface,
  resolveInterface,
  setInterface
} from "./chunk-ZJQSGRNK.mjs";

// src/internals/simulation/interface.ts
import { DIALOG_APPROVAL_TYPES } from "@metamask/snaps-rpc-methods";
import { DialogType, UserInputEventType, assert } from "@metamask/snaps-sdk";
import {
  HandlerType,
  getJsxChildren,
  unwrapError,
  walkJsx
} from "@metamask/snaps-utils";
import { assertExhaustive, hasProperty } from "@metamask/utils";
import { call, put, select, take } from "redux-saga/effects";
var MAX_FILE_SIZE = 1e7;
function getInterfaceResponse(runSaga, type, content, interfaceActions) {
  switch (type) {
    case DIALOG_APPROVAL_TYPES[DialogType.Alert]:
      return {
        ...interfaceActions,
        type: DialogType.Alert,
        content,
        ok: resolveWith(runSaga, null)
      };
    case DIALOG_APPROVAL_TYPES[DialogType.Confirmation]:
      return {
        ...interfaceActions,
        type: DialogType.Confirmation,
        content,
        ok: resolveWith(runSaga, true),
        cancel: resolveWith(runSaga, false)
      };
    case DIALOG_APPROVAL_TYPES[DialogType.Prompt]:
      return {
        ...interfaceActions,
        type: DialogType.Prompt,
        content,
        ok: resolveWithInput(runSaga),
        cancel: resolveWith(runSaga, null)
      };
    case DIALOG_APPROVAL_TYPES.default: {
      const footer = getElementByType(content, "Footer");
      if (!footer) {
        return {
          ...interfaceActions,
          content,
          ok: resolveWith(runSaga, null),
          cancel: resolveWith(runSaga, null)
        };
      }
      if (getJsxChildren(footer).length === 1) {
        return {
          ...interfaceActions,
          content,
          cancel: resolveWith(runSaga, null)
        };
      }
      return {
        ...interfaceActions,
        content
      };
    }
    default:
      throw new Error(`Unknown or unsupported dialog type: "${String(type)}".`);
  }
}
function* resolveWithSaga(value) {
  yield put(resolveInterface(value));
}
function resolveWith(runSaga, value) {
  return async () => {
    await runSaga(resolveWithSaga, value).toPromise();
  };
}
function resolveWithInput(runSaga) {
  return async (value = "") => {
    await runSaga(resolveWithSaga, value).toPromise();
  };
}
function* getStoredInterface(controllerMessenger, snapId) {
  const currentInterface = yield select(getCurrentInterface);
  if (currentInterface) {
    const { content: content2 } = controllerMessenger.call(
      "SnapInterfaceController:getInterface",
      snapId,
      currentInterface.id
    );
    return { ...currentInterface, content: content2 };
  }
  const { payload } = yield take(setInterface.type);
  const { content } = controllerMessenger.call(
    "SnapInterfaceController:getInterface",
    snapId,
    payload.id
  );
  return { ...payload, content };
}
function isJSXElementWithName(element, name) {
  return hasProperty(element.props, "name") && element.props.name === name;
}
function getFormElement(form, name) {
  const element = walkJsx(form, (childElement) => {
    if (isJSXElementWithName(childElement, name)) {
      return childElement;
    }
    return void 0;
  });
  if (element === void 0) {
    return void 0;
  }
  return { element, form: form.props.name };
}
function getElement(content, name) {
  if (isJSXElementWithName(content, name)) {
    return { element: content };
  }
  return walkJsx(content, (element) => {
    if (element.type === "Form") {
      return getFormElement(element, name);
    }
    if (isJSXElementWithName(element, name)) {
      return { element };
    }
    return void 0;
  });
}
function getElementByType(content, type) {
  return walkJsx(content, (element) => {
    if (element.type === type) {
      return element;
    }
    return void 0;
  });
}
async function handleEvent(controllerMessenger, snapId, id, event, context) {
  try {
    await controllerMessenger.call(
      "ExecutionService:handleRpcRequest",
      snapId,
      {
        origin: "",
        handler: HandlerType.OnUserInput,
        request: {
          jsonrpc: "2.0",
          method: " ",
          params: {
            event,
            id,
            context
          }
        }
      }
    );
  } catch (error) {
    const [unwrapped] = unwrapError(error);
    throw unwrapped;
  }
}
async function clickElement(controllerMessenger, id, content, snapId, name) {
  const result = getElement(content, name);
  assert(
    result !== void 0,
    `Could not find an element in the interface with the name "${name}".`
  );
  assert(
    result.element.type === "Button" || result.element.type === "Checkbox",
    `Expected an element of type "Button" or "Checkbox", but found "${result.element.type}".`
  );
  const { state, context } = controllerMessenger.call(
    "SnapInterfaceController:getInterface",
    snapId,
    id
  );
  const { type } = result.element;
  const elementName = result.element.props.name;
  const formState = result.form ? state[result.form] : state;
  const currentValue = formState[elementName];
  switch (type) {
    case "Button": {
      await handleEvent(
        controllerMessenger,
        snapId,
        id,
        {
          type: UserInputEventType.ButtonClickEvent,
          name: elementName
        },
        context
      );
      if (result.form && result.element.props.type === "submit") {
        await handleEvent(
          controllerMessenger,
          snapId,
          id,
          {
            type: UserInputEventType.FormSubmitEvent,
            name: result.form,
            value: state[result.form]
          },
          context
        );
      }
      break;
    }
    case "Checkbox": {
      const newValue = !currentValue;
      const newState = mergeValue(state, name, newValue, result.form);
      controllerMessenger.call(
        "SnapInterfaceController:updateInterfaceState",
        id,
        newState
      );
      await handleEvent(
        controllerMessenger,
        snapId,
        id,
        {
          type: UserInputEventType.InputChangeEvent,
          name: elementName,
          value: newValue
        },
        context
      );
      break;
    }
    default:
      assertExhaustive(type);
  }
}
function mergeValue(state, name, value, form) {
  if (form) {
    return {
      ...state,
      [form]: {
        ...state[form],
        [name]: value
      }
    };
  }
  return { ...state, [name]: value };
}
async function typeInField(controllerMessenger, id, content, snapId, name, value) {
  const result = getElement(content, name);
  assert(
    result !== void 0,
    `Could not find an element in the interface with the name "${name}".`
  );
  assert(
    result.element.type === "Input",
    `Expected an element of type "Input", but found "${result.element.type}".`
  );
  const { state, context } = controllerMessenger.call(
    "SnapInterfaceController:getInterface",
    snapId,
    id
  );
  const newState = mergeValue(state, name, value, result.form);
  controllerMessenger.call(
    "SnapInterfaceController:updateInterfaceState",
    id,
    newState
  );
  await controllerMessenger.call("ExecutionService:handleRpcRequest", snapId, {
    origin: "",
    handler: HandlerType.OnUserInput,
    request: {
      jsonrpc: "2.0",
      method: " ",
      params: {
        event: {
          type: UserInputEventType.InputChangeEvent,
          name: result.element.props.name,
          value
        },
        id,
        context
      }
    }
  });
}
async function selectInDropdown(controllerMessenger, id, content, snapId, name, value) {
  const result = getElement(content, name);
  assert(
    result !== void 0,
    `Could not find an element in the interface with the name "${name}".`
  );
  assert(
    result.element.type === "Dropdown",
    `Expected an element of type "Dropdown", but found "${result.element.type}".`
  );
  const options = getJsxChildren(result.element);
  const selectedOption = options.find(
    (option) => hasProperty(option.props, "value") && option.props.value === value
  );
  assert(
    selectedOption !== void 0,
    `The dropdown with the name "${name}" does not contain "${value}".`
  );
  const { state, context } = controllerMessenger.call(
    "SnapInterfaceController:getInterface",
    snapId,
    id
  );
  const newState = mergeValue(state, name, value, result.form);
  controllerMessenger.call(
    "SnapInterfaceController:updateInterfaceState",
    id,
    newState
  );
  await controllerMessenger.call("ExecutionService:handleRpcRequest", snapId, {
    origin: "",
    handler: HandlerType.OnUserInput,
    request: {
      jsonrpc: "2.0",
      method: " ",
      params: {
        event: {
          type: UserInputEventType.InputChangeEvent,
          name: result.element.props.name,
          value
        },
        id,
        context
      }
    }
  });
}
function getFormattedFileSize(size) {
  return `${(size / 1e6).toFixed(2)} MB`;
}
async function uploadFile(controllerMessenger, id, content, snapId, name, file, options) {
  const result = getElement(content, name);
  assert(
    result !== void 0,
    `Could not find an element in the interface with the name "${name}".`
  );
  assert(
    result.element.type === "FileInput",
    `Expected an element of type "FileInput", but found "${result.element.type}".`
  );
  const { state, context } = controllerMessenger.call(
    "SnapInterfaceController:getInterface",
    snapId,
    id
  );
  const fileSize = await getFileSize(file);
  if (fileSize > MAX_FILE_SIZE) {
    throw new Error(
      `The file size (${getFormattedFileSize(
        fileSize
      )}) exceeds the maximum allowed size of ${getFormattedFileSize(
        MAX_FILE_SIZE
      )}.`
    );
  }
  const fileObject = await getFileToUpload(file, options);
  const newState = mergeValue(state, name, fileObject, result.form);
  controllerMessenger.call(
    "SnapInterfaceController:updateInterfaceState",
    id,
    newState
  );
  await controllerMessenger.call("ExecutionService:handleRpcRequest", snapId, {
    origin: "",
    handler: HandlerType.OnUserInput,
    request: {
      jsonrpc: "2.0",
      method: " ",
      params: {
        event: {
          type: UserInputEventType.FileUploadEvent,
          name: result.element.props.name,
          file: fileObject
        },
        id,
        context
      }
    }
  });
}
function getInterfaceActions(snapId, controllerMessenger, { content, id }) {
  return {
    clickElement: async (name) => {
      await clickElement(controllerMessenger, id, content, snapId, name);
    },
    typeInField: async (name, value) => {
      await typeInField(controllerMessenger, id, content, snapId, name, value);
    },
    selectInDropdown: async (name, value) => {
      await selectInDropdown(
        controllerMessenger,
        id,
        content,
        snapId,
        name,
        value
      );
    },
    uploadFile: async (name, file, options) => {
      await uploadFile(
        controllerMessenger,
        id,
        content,
        snapId,
        name,
        file,
        options
      );
    }
  };
}
function* getInterface(runSaga, snapId, controllerMessenger) {
  const storedInterface = yield call(
    getStoredInterface,
    controllerMessenger,
    snapId
  );
  const interfaceActions = getInterfaceActions(
    snapId,
    controllerMessenger,
    storedInterface
  );
  return getInterfaceResponse(
    runSaga,
    storedInterface.type,
    storedInterface.content,
    interfaceActions
  );
}

export {
  getInterfaceResponse,
  resolveWithSaga,
  getElement,
  getElementByType,
  clickElement,
  mergeValue,
  typeInField,
  selectInDropdown,
  uploadFile,
  getInterfaceActions,
  getInterface
};
//# sourceMappingURL=chunk-AE7BNNEK.mjs.map