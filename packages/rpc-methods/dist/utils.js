"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEqual = exports.selectHooks = void 0;
/**
 * Returns the subset of the specified `hooks` that are included in the
 * `hookNames` object. This is a Principle of Least Authority (POLA) measure
 * to ensure that each RPC method implementation only has access to the
 * API "hooks" it needs to do its job.
 *
 * @param hooks - The hooks to select from.
 * @param hookNames - The names of the hooks to select.
 * @returns The selected hooks.
 * @template Hooks - The hooks to select from.
 * @template HookName - The names of the hooks to select.
 */
function selectHooks(hooks, hookNames) {
    if (hookNames) {
        return Object.keys(hookNames).reduce((hookSubset, _hookName) => {
            const hookName = _hookName;
            hookSubset[hookName] = hooks[hookName];
            return hookSubset;
        }, {});
    }
    return undefined;
}
exports.selectHooks = selectHooks;
/**
 * Checks if array `a` is equal to array `b`. Note that this does not do a deep
 * equality check. It only checks if the arrays are the same length and if each
 * element in `a` is equal to (`===`) the corresponding element in `b`.
 *
 * @param a - The first array to compare.
 * @param b - The second array to compare.
 * @returns `true` if the arrays are equal, `false` otherwise.
 */
function isEqual(a, b) {
    return a.length === b.length && a.every((value, index) => value === b[index]);
}
exports.isEqual = isEqual;
//# sourceMappingURL=utils.js.map