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
    literal: function() {
        return literal;
    },
    union: function() {
        return union;
    },
    file: function() {
        return file;
    },
    named: function() {
        return named;
    },
    SnapsStructError: function() {
        return SnapsStructError;
    },
    arrayToGenerator: function() {
        return arrayToGenerator;
    },
    getError: function() {
        return getError;
    },
    createFromStruct: function() {
        return createFromStruct;
    },
    getStructFromPath: function() {
        return getStructFromPath;
    },
    getUnionStructNames: function() {
        return getUnionStructNames;
    },
    getStructErrorPrefix: function() {
        return getStructErrorPrefix;
    },
    getStructFailureMessage: function() {
        return getStructFailureMessage;
    },
    getStructErrorMessage: function() {
        return getStructErrorMessage;
    }
});
const _utils = require("@metamask/utils");
const _chalk = require("chalk");
const _path = require("path");
const _superstruct = require("superstruct");
const _strings = require("./strings");
function literal(value) {
    return (0, _superstruct.define)(JSON.stringify(value), (0, _superstruct.literal)(value).validator);
}
function union([head, ...tail]) {
    const struct = (0, _superstruct.union)([
        head,
        ...tail
    ]);
    return new _superstruct.Struct({
        ...struct,
        schema: [
            head,
            ...tail
        ]
    });
}
function file() {
    return (0, _superstruct.coerce)((0, _superstruct.string)(), (0, _superstruct.string)(), (value)=>{
        return (0, _path.resolve)(process.cwd(), value);
    });
}
function named(name, struct) {
    return new _superstruct.Struct({
        ...struct,
        type: name
    });
}
class SnapsStructError extends _superstruct.StructError {
    constructor(struct, prefix, suffix, failure, failures){
        super(failure, failures);
        this.name = 'SnapsStructError';
        this.message = `${prefix}.\n\n${getStructErrorMessage(struct, [
            ...failures()
        ])}${suffix ? `\n\n${suffix}` : ''}`;
    }
}
function* arrayToGenerator(array) {
    for (const item of array){
        yield item;
    }
}
function getError({ struct, prefix, suffix = '', error }) {
    return new SnapsStructError(struct, prefix, suffix, error, ()=>arrayToGenerator(error.failures()));
}
function createFromStruct(value, struct, prefix, suffix = '') {
    try {
        return (0, _superstruct.create)(value, struct);
    } catch (error) {
        if (error instanceof _superstruct.StructError) {
            throw getError({
                struct,
                prefix,
                suffix,
                error
            });
        }
        throw error;
    }
}
function getStructFromPath(struct, path) {
    return path.reduce((result, key)=>{
        if ((0, _utils.isObject)(struct.schema) && struct.schema[key]) {
            return struct.schema[key];
        }
        return result;
    }, struct);
}
function getUnionStructNames(struct) {
    if (Array.isArray(struct.schema)) {
        return struct.schema.map(({ type })=>(0, _chalk.green)(type));
    }
    return null;
}
function getStructErrorPrefix(failure) {
    if (failure.type === 'never' || failure.path.length === 0) {
        return '';
    }
    return `At path: ${(0, _chalk.bold)(failure.path.join('.'))} — `;
}
function getStructFailureMessage(struct, failure) {
    const received = (0, _chalk.red)(JSON.stringify(failure.value));
    const prefix = getStructErrorPrefix(failure);
    if (failure.type === 'union') {
        const childStruct = getStructFromPath(struct, failure.path);
        const unionNames = getUnionStructNames(childStruct);
        if (unionNames) {
            return `${prefix}Expected the value to be one of: ${unionNames.join(', ')}, but received: ${received}.`;
        }
        return `${prefix}${failure.message}.`;
    }
    if (failure.type === 'literal') {
        // Superstruct's failure does not provide information about which literal
        // value was expected, so we need to parse the message to get the literal.
        const message = failure.message.replace(/the literal `(.+)`,/u, `the value to be \`${(0, _chalk.green)('$1')}\`,`).replace(/, but received: (.+)/u, `, but received: ${(0, _chalk.red)('$1')}`);
        return `${prefix}${message}.`;
    }
    if (failure.type === 'never') {
        return `Unknown key: ${(0, _chalk.bold)(failure.path.join('.'))}, received: ${received}.`;
    }
    return `${prefix}Expected a value of type ${(0, _chalk.green)(failure.type)}, but received: ${received}.`;
}
function getStructErrorMessage(struct, failures) {
    const formattedFailures = failures.map((failure)=>(0, _strings.indent)(`• ${getStructFailureMessage(struct, failure)}`));
    return formattedFailures.join('\n');
}

//# sourceMappingURL=structs.js.map