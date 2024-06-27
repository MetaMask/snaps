"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/internals/simulation/methods/hooks/interface.ts
function getCreateInterfaceImplementation(controllerMessenger) {
  return async (snapId, content, context) => controllerMessenger.call(
    "SnapInterfaceController:createInterface",
    snapId,
    content,
    context
  );
}
function getGetInterfaceImplementation(controllerMessenger) {
  return (snapId, id) => controllerMessenger.call(
    "SnapInterfaceController:getInterface",
    snapId,
    id
  );
}




exports.getCreateInterfaceImplementation = getCreateInterfaceImplementation; exports.getGetInterfaceImplementation = getGetInterfaceImplementation;
//# sourceMappingURL=chunk-J3I5KZIF.js.map