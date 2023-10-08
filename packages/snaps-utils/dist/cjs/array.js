/**
 * Checks if array `a` is equal to array `b`. Note that this does not do a deep
 * equality check. It only checks if the arrays are the same length and if each
 * element in `a` is equal to (`===`) the corresponding element in `b`.
 *
 * @param a - The first array to compare.
 * @param b - The second array to compare.
 * @returns `true` if the arrays are equal, `false` otherwise.
 */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "isEqual", {
    enumerable: true,
    get: function() {
        return isEqual;
    }
});
function isEqual(a, b) {
    return a.length === b.length && a.every((value, index)=>value === b[index]);
}

//# sourceMappingURL=array.js.map