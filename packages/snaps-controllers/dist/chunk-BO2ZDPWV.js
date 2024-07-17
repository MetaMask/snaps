"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/fsm.ts
var _utils = require('@metamask/utils');
var _fsm = require('@xstate/fsm');
function validateMachine(machine) {
  _utils.assert.call(void 0, "_options" in machine, "The machine is not an @xstate/fsm machine");
  const typed = machine;
  const toArray = (obj) => {
    if (Array.isArray(obj)) {
      return obj;
    } else if (obj === void 0 || obj === null) {
      return [];
    }
    return [obj];
  };
  const allActions = /* @__PURE__ */ new Set();
  const addActions = (actions) => toArray(actions).flatMap((action) => {
    if (typeof action === "string") {
      return [action];
    }
    _utils.assert.call(void 0, typeof action === "function");
    return [];
  }).forEach(allActions.add.bind(allActions));
  for (const state of Object.values(
    typed.config.states
  )) {
    addActions(state.entry);
    addActions(state.exit);
    for (const transition of Object.values(state.on ?? {})) {
      addActions(transition.actions);
    }
  }
  allActions.forEach(
    (action) => _utils.assert.call(void 0, 
      typed._options.actions !== void 0 && action in typed._options.actions,
      `Action "${action}" doesn't have an implementation`
    )
  );
}
function forceStrict(interpreter) {
  let onInitialCalled = false;
  interpreter.subscribe((state) => {
    _utils.assert.call(void 0, !onInitialCalled || state.changed, "Invalid state transition");
    onInitialCalled = true;
  });
  const ogSend = interpreter.send.bind(interpreter);
  interpreter.send = (...args) => {
    _utils.assert.call(void 0, 
      interpreter.status === _fsm.InterpreterStatus.Running,
      "Interpreter is stopped"
    );
    return ogSend(...args);
  };
}




exports.validateMachine = validateMachine; exports.forceStrict = forceStrict;
//# sourceMappingURL=chunk-BO2ZDPWV.js.map