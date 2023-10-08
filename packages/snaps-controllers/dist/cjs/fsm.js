"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    validateMachine: function() {
        return validateMachine;
    },
    forceStrict: function() {
        return forceStrict;
    }
});
const _utils = require("@metamask/utils");
const _fsm = require("@xstate/fsm");
function validateMachine(machine) {
    (0, _utils.assert)('_options' in machine, 'The machine is not an @xstate/fsm machine');
    const typed = machine;
    // 1.
    const toArray = (obj)=>{
        if (Array.isArray(obj)) {
            return obj;
        } else if (obj === undefined || obj === null) {
            return [];
        }
        return [
            obj
        ];
    };
    const allActions = new Set();
    const addActions = (actions)=>toArray(actions).flatMap((action)=>{
            if (typeof action === 'string') {
                return [
                    action
                ];
            }
            (0, _utils.assert)(typeof action === 'function');
            return [];
        }).forEach(allActions.add.bind(allActions));
    for (const state of Object.values(typed.config.states)){
        addActions(state.entry);
        addActions(state.exit);
        for (const transition of Object.values(state.on ?? {})){
            addActions(transition.actions);
        }
    }
    allActions.forEach((action)=>(0, _utils.assert)(typed._options.actions !== undefined && action in typed._options.actions, `Action "${action}" doesn't have an implementation`));
}
function forceStrict(interpreter) {
    // As soon as a listener subscribes, it is called. It might be called in
    // an initial state which doesn't have the .changed property
    let onInitialCalled = false;
    interpreter.subscribe((state)=>{
        (0, _utils.assert)(!onInitialCalled || state.changed, 'Invalid state transition');
        onInitialCalled = true;
    });
    const ogSend = interpreter.send.bind(interpreter);
    interpreter.send = (...args)=>{
        (0, _utils.assert)(interpreter.status === _fsm.InterpreterStatus.Running, 'Interpreter is stopped');
        return ogSend(...args);
    };
}

//# sourceMappingURL=fsm.js.map