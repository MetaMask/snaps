// src/internals/simulation/methods/hooks/interface.ts
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

export {
  getCreateInterfaceImplementation,
  getGetInterfaceImplementation
};
//# sourceMappingURL=chunk-FQWOVTBB.mjs.map