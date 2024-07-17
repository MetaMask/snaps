// src/fsm.ts
import { assert } from "@metamask/utils";
import { InterpreterStatus } from "@xstate/fsm";
function validateMachine(machine) {
  assert("_options" in machine, "The machine is not an @xstate/fsm machine");
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
    assert(typeof action === "function");
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
    (action) => assert(
      typed._options.actions !== void 0 && action in typed._options.actions,
      `Action "${action}" doesn't have an implementation`
    )
  );
}
function forceStrict(interpreter) {
  let onInitialCalled = false;
  interpreter.subscribe((state) => {
    assert(!onInitialCalled || state.changed, "Invalid state transition");
    onInitialCalled = true;
  });
  const ogSend = interpreter.send.bind(interpreter);
  interpreter.send = (...args) => {
    assert(
      interpreter.status === InterpreterStatus.Running,
      "Interpreter is stopped"
    );
    return ogSend(...args);
  };
}

export {
  validateMachine,
  forceStrict
};
//# sourceMappingURL=chunk-6EZSNS4O.mjs.map