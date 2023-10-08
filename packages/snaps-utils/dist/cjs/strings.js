/**
 * Indent a message by adding a number of spaces to the beginning of each line.
 *
 * @param message - The message to indent.
 * @param spaces - The number of spaces to indent by. Defaults to 2.
 * @returns The indented message.
 */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "indent", {
    enumerable: true,
    get: function() {
        return indent;
    }
});
function indent(message, spaces = 2) {
    return message.replace(/^/gmu, ' '.repeat(spaces));
}

//# sourceMappingURL=strings.js.map