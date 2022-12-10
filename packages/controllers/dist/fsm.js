"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forceStrict = exports.validateMachine = void 0;
const utils_1 = require("@metamask/utils");
const snap_utils_1 = require("@metamask/snap-utils");
const fsm_1 = require("@xstate/fsm");
/**
 * Validates the set-up of a @xstate/fsm machine.
 *
 * 1. Ensures that all named actions in the config have a provided implementation.
 *
 * @param machine - The machine to validate.
 * @throws {@link AssertionError}. If the validation fails.
 */
function validateMachine(machine) {
    var _a;
    (0, utils_1.assert)('_options' in machine, 'The machine is not an @xstate/fsm machine');
    const typed = machine;
    // 1.
    const toArray = (obj) => {
        if (Array.isArray(obj)) {
            return obj;
        }
        else if (obj === undefined || obj === null) {
            return [];
        }
        return [obj];
    };
    const allActions = new Set();
    const addActions = (actions) => (0, snap_utils_1.flatMap)(toArray(actions), (action) => {
        if (typeof action === 'string') {
            return [action];
        }
        (0, utils_1.assert)(typeof action === 'function');
        return [];
    }).forEach(allActions.add.bind(allActions));
    for (const state of Object.values(typed.config.states)) {
        addActions(state.entry);
        addActions(state.exit);
        for (const transition of Object.values((_a = state.on) !== null && _a !== void 0 ? _a : {})) {
            addActions(transition.actions);
        }
    }
    allActions.forEach((action) => (0, utils_1.assert)(typed._options.actions !== undefined && action in typed._options.actions, `Action "${action}" doesn't have an implementation`));
}
exports.validateMachine = validateMachine;
/**
 * Ensure that the interpreter is strict.
 * Strict means that the transition must occur.
 * The event must exist in .on {} state config and it's guard must succeed.
 *
 * The error will be thrown when an invalid `interpreter.send()` is called
 * and will be bubbled there.
 *
 * TODO(ritave): Doesn't support self transitions.
 *
 * @param interpreter - The interpreter that will be force into strict mode.
 * @throws {@link Error} Thrown when the transition is invalid.
 */
function forceStrict(interpreter) {
    // As soon as a listener subscribes, it is called. It might be called in
    // an initial state which doesn't have the .changed property
    let onInitialCalled = false;
    interpreter.subscribe((state) => {
        (0, utils_1.assert)(!onInitialCalled || state.changed, 'Invalid state transition');
        onInitialCalled = true;
    });
    const ogSend = interpreter.send.bind(interpreter);
    interpreter.send = (...args) => {
        (0, utils_1.assert)(interpreter.status === fsm_1.InterpreterStatus.Running, 'Interpreter is stopped');
        return ogSend(...args);
    };
}
exports.forceStrict = forceStrict;
//# sourceMappingURL=fsm.js.map