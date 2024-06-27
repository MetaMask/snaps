"use strict";Object.defineProperty(exports, "__esModule", {value: true});


var _chunkSW65QYFVjs = require('./chunk-SW65QYFV.js');




var _chunkIUTOITRFjs = require('./chunk-IUTOITRF.js');

// src/internals/simulation/interface.ts
var _snapsrpcmethods = require('@metamask/snaps-rpc-methods');
var _snapssdk = require('@metamask/snaps-sdk');





var _snapsutils = require('@metamask/snaps-utils');
var _utils = require('@metamask/utils');
var _effects = require('redux-saga/effects');
var MAX_FILE_SIZE = 1e7;
function getInterfaceResponse(runSaga, type, content, interfaceActions) {
  switch (type) {
    case _snapsrpcmethods.DIALOG_APPROVAL_TYPES[_snapssdk.DialogType.Alert]:
      return {
        ...interfaceActions,
        type: _snapssdk.DialogType.Alert,
        content,
        ok: resolveWith(runSaga, null)
      };
    case _snapsrpcmethods.DIALOG_APPROVAL_TYPES[_snapssdk.DialogType.Confirmation]:
      return {
        ...interfaceActions,
        type: _snapssdk.DialogType.Confirmation,
        content,
        ok: resolveWith(runSaga, true),
        cancel: resolveWith(runSaga, false)
      };
    case _snapsrpcmethods.DIALOG_APPROVAL_TYPES[_snapssdk.DialogType.Prompt]:
      return {
        ...interfaceActions,
        type: _snapssdk.DialogType.Prompt,
        content,
        ok: resolveWithInput(runSaga),
        cancel: resolveWith(runSaga, null)
      };
    default:
      throw new Error(`Unknown or unsupported dialog type: "${String(type)}".`);
  }
}
function resolveWith(runSaga, value) {
  function* resolveWithSaga() {
    yield _effects.put.call(void 0, _chunkIUTOITRFjs.resolveInterface.call(void 0, value));
  }
  return async () => {
    await runSaga(resolveWithSaga).toPromise();
  };
}
function resolveWithInput(runSaga) {
  function* resolveWithSaga(value) {
    yield _effects.put.call(void 0, _chunkIUTOITRFjs.resolveInterface.call(void 0, value));
  }
  return async (value = "") => {
    await runSaga(resolveWithSaga, value).toPromise();
  };
}
function* getStoredInterface(controllerMessenger, snapId) {
  const currentInterface = yield _effects.select.call(void 0, _chunkIUTOITRFjs.getCurrentInterface);
  if (currentInterface) {
    const { content: content2 } = controllerMessenger.call(
      "SnapInterfaceController:getInterface",
      snapId,
      currentInterface.id
    );
    return { ...currentInterface, content: content2 };
  }
  const { payload } = yield _effects.take.call(void 0, _chunkIUTOITRFjs.setInterface.type);
  const { content } = controllerMessenger.call(
    "SnapInterfaceController:getInterface",
    snapId,
    payload.id
  );
  return { ...payload, content };
}
function isJSXElementWithName(element, name) {
  return _utils.hasProperty.call(void 0, element.props, "name") && element.props.name === name;
}
function getFormElement(form, name) {
  const element = _snapsutils.walkJsx.call(void 0, form, (childElement) => {
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
  return _snapsutils.walkJsx.call(void 0, content, (element) => {
    if (element.type === "Form") {
      return getFormElement(element, name);
    }
    if (isJSXElementWithName(element, name)) {
      return { element };
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
        handler: _snapsutils.HandlerType.OnUserInput,
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
    const [unwrapped] = _snapsutils.unwrapError.call(void 0, error);
    throw unwrapped;
  }
}
async function clickElement(controllerMessenger, id, content, snapId, name) {
  const result = getElement(content, name);
  _snapssdk.assert.call(void 0, 
    result !== void 0,
    `Could not find an element in the interface with the name "${name}".`
  );
  _snapssdk.assert.call(void 0, 
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
          type: _snapssdk.UserInputEventType.ButtonClickEvent,
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
            type: _snapssdk.UserInputEventType.FormSubmitEvent,
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
          type: _snapssdk.UserInputEventType.InputChangeEvent,
          name: elementName,
          value: newValue
        },
        context
      );
      break;
    }
    default:
      _utils.assertExhaustive.call(void 0, type);
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
  _snapssdk.assert.call(void 0, 
    result !== void 0,
    `Could not find an element in the interface with the name "${name}".`
  );
  _snapssdk.assert.call(void 0, 
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
    handler: _snapsutils.HandlerType.OnUserInput,
    request: {
      jsonrpc: "2.0",
      method: " ",
      params: {
        event: {
          type: _snapssdk.UserInputEventType.InputChangeEvent,
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
  _snapssdk.assert.call(void 0, 
    result !== void 0,
    `Could not find an element in the interface with the name "${name}".`
  );
  _snapssdk.assert.call(void 0, 
    result.element.type === "Dropdown",
    `Expected an element of type "Dropdown", but found "${result.element.type}".`
  );
  const options = _snapsutils.getJsxChildren.call(void 0, result.element);
  const selectedOption = options.find(
    (option) => _utils.hasProperty.call(void 0, option.props, "value") && option.props.value === value
  );
  _snapssdk.assert.call(void 0, 
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
    handler: _snapsutils.HandlerType.OnUserInput,
    request: {
      jsonrpc: "2.0",
      method: " ",
      params: {
        event: {
          type: _snapssdk.UserInputEventType.InputChangeEvent,
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
  _snapssdk.assert.call(void 0, 
    result !== void 0,
    `Could not find an element in the interface with the name "${name}".`
  );
  _snapssdk.assert.call(void 0, 
    result.element.type === "FileInput",
    `Expected an element of type "FileInput", but found "${result.element.type}".`
  );
  const { state, context } = controllerMessenger.call(
    "SnapInterfaceController:getInterface",
    snapId,
    id
  );
  const fileSize = await _chunkSW65QYFVjs.getFileSize.call(void 0, file);
  if (fileSize > MAX_FILE_SIZE) {
    throw new Error(
      `The file size (${getFormattedFileSize(
        fileSize
      )}) exceeds the maximum allowed size of ${getFormattedFileSize(
        MAX_FILE_SIZE
      )}.`
    );
  }
  const fileObject = await _chunkSW65QYFVjs.getFileToUpload.call(void 0, file, options);
  const newState = mergeValue(state, name, fileObject, result.form);
  controllerMessenger.call(
    "SnapInterfaceController:updateInterfaceState",
    id,
    newState
  );
  await controllerMessenger.call("ExecutionService:handleRpcRequest", snapId, {
    origin: "",
    handler: _snapsutils.HandlerType.OnUserInput,
    request: {
      jsonrpc: "2.0",
      method: " ",
      params: {
        event: {
          type: _snapssdk.UserInputEventType.FileUploadEvent,
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
  const storedInterface = yield _effects.call.call(void 0, 
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











exports.getInterfaceResponse = getInterfaceResponse; exports.getElement = getElement; exports.clickElement = clickElement; exports.mergeValue = mergeValue; exports.typeInField = typeInField; exports.selectInDropdown = selectInDropdown; exports.uploadFile = uploadFile; exports.getInterfaceActions = getInterfaceActions; exports.getInterface = getInterface;
//# sourceMappingURL=chunk-T67MAQQ7.js.map