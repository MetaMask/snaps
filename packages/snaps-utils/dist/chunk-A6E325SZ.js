"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkIJX3CXOYjs = require('./chunk-IJX3CXOY.js');

// src/structs.ts
var _snapssdk = require('@metamask/snaps-sdk');
var _utils = require('@metamask/utils');
var _chalk = require('chalk');







var _superstruct = require('superstruct');
function color(value, colorFunction, enabled) {
  if (enabled) {
    return colorFunction(value);
  }
  return value;
}
function named(name, struct) {
  return new (0, _superstruct.Struct)({
    ...struct,
    type: name
  });
}
var SnapsStructError = class extends _superstruct.StructError {
  constructor(struct, prefix, suffix, failure, failures, colorize = true) {
    super(failure, failures);
    this.name = "SnapsStructError";
    this.message = `${prefix}.

${getStructErrorMessage(
      struct,
      [...failures()],
      colorize
    )}${suffix ? `

${suffix}` : ""}`;
  }
};
function* arrayToGenerator(array) {
  for (const item of array) {
    yield item;
  }
}
function getError({
  struct,
  prefix,
  suffix = "",
  error,
  colorize
}) {
  return new SnapsStructError(
    struct,
    prefix,
    suffix,
    error,
    () => arrayToGenerator(error.failures()),
    colorize
  );
}
function createFromStruct(value, struct, prefix, suffix = "") {
  try {
    return _superstruct.create.call(void 0, value, struct);
  } catch (error) {
    if (error instanceof _superstruct.StructError) {
      throw getError({ struct, prefix, suffix, error });
    }
    throw error;
  }
}
function getStructFromPath(struct, path) {
  return path.reduce((result, key) => {
    if (_utils.isObject.call(void 0, struct.schema) && struct.schema[key]) {
      return struct.schema[key];
    }
    return result;
  }, struct);
}
function getUnionStructNames(struct, colorize = true) {
  if (Array.isArray(struct.schema)) {
    return struct.schema.map(({ type }) => color(type, _chalk.green, colorize));
  }
  return null;
}
function getStructErrorPrefix(failure, colorize = true) {
  if (failure.type === "never" || failure.path.length === 0) {
    return "";
  }
  return `At path: ${color(failure.path.join("."), _chalk.bold, colorize)} \u2014 `;
}
function getStructFailureMessage(struct, failure, colorize = true) {
  const received = color(JSON.stringify(failure.value), _chalk.red, colorize);
  const prefix = getStructErrorPrefix(failure, colorize);
  if (failure.type === "union") {
    const childStruct = getStructFromPath(struct, failure.path);
    const unionNames = getUnionStructNames(childStruct, colorize);
    if (unionNames) {
      return `${prefix}Expected the value to be one of: ${unionNames.join(
        ", "
      )}, but received: ${received}.`;
    }
    return `${prefix}${failure.message}.`;
  }
  if (failure.type === "literal") {
    const message = failure.message.replace(
      /the literal `(.+)`,/u,
      `the value to be \`${color("$1", _chalk.green, colorize)}\`,`
    ).replace(
      /, but received: (.+)/u,
      `, but received: ${color("$1", _chalk.red, colorize)}`
    );
    return `${prefix}${message}.`;
  }
  if (failure.type === "never") {
    return `Unknown key: ${color(
      failure.path.join("."),
      _chalk.bold,
      colorize
    )}, received: ${received}.`;
  }
  if (failure.refinement === "size") {
    const message = failure.message.replace(
      /length between `(\d+)` and `(\d+)`/u,
      `length between ${color("$1", _chalk.green, colorize)} and ${color(
        "$2",
        _chalk.green,
        colorize
      )},`
    ).replace(/length of `(\d+)`/u, `length of ${color("$1", _chalk.red, colorize)}`).replace(/a array/u, "an array");
    return `${prefix}${message}.`;
  }
  return `${prefix}Expected a value of type ${color(
    failure.type,
    _chalk.green,
    colorize
  )}, but received: ${received}.`;
}
function getStructErrorMessage(struct, failures, colorize = true) {
  const formattedFailures = failures.map(
    (failure) => _chunkIJX3CXOYjs.indent.call(void 0, `\u2022 ${getStructFailureMessage(struct, failure, colorize)}`)
  );
  return formattedFailures.join("\n");
}
function validateUnion(value, struct, structKey, coerce = false) {
  _utils.assert.call(void 0, 
    struct.schema,
    "Expected a struct with a schema. Make sure to use `union` from `@metamask/snaps-sdk`."
  );
  _utils.assert.call(void 0, struct.schema.length > 0, "Expected a non-empty array of structs.");
  const keyUnion = struct.schema.map(
    (innerStruct) => innerStruct.schema[structKey]
    // This is guaranteed to be a non-empty array by the assertion above. We
    // need to cast it since `superstruct` requires a non-empty array of structs
    // for the `union` struct.
  );
  const key = _superstruct.type.call(void 0, {
    [structKey]: _snapssdk.union.call(void 0, keyUnion)
  });
  const [keyError] = _superstruct.validate.call(void 0, value, key, { coerce });
  if (keyError) {
    throw new Error(
      getStructFailureMessage(key, keyError.failures()[0], false)
    );
  }
  const objectValue = value;
  const objectStructs = struct.schema.filter(
    (innerStruct) => _superstruct.is.call(void 0, objectValue[structKey], innerStruct.schema[structKey])
  );
  _utils.assert.call(void 0, objectStructs.length > 0, "Expected a struct to match the value.");
  const validationResults = objectStructs.map(
    (objectStruct) => _superstruct.validate.call(void 0, objectValue, objectStruct, { coerce })
  );
  const validatedValue = validationResults.find(([error]) => !error);
  if (validatedValue) {
    return validatedValue[1];
  }
  _utils.assert.call(void 0, validationResults[0][0], "Expected at least one error.");
  const validationError = validationResults.reduce((error, [innerError]) => {
    _utils.assert.call(void 0, innerError, "Expected an error.");
    if (innerError.failures().length < error.failures().length) {
      return innerError;
    }
    return error;
  }, validationResults[0][0]);
  throw new Error(
    getStructFailureMessage(struct, validationError.failures()[0], false)
  );
}
function createUnion(value, struct, structKey) {
  return validateUnion(value, struct, structKey, true);
}














exports.named = named; exports.SnapsStructError = SnapsStructError; exports.arrayToGenerator = arrayToGenerator; exports.getError = getError; exports.createFromStruct = createFromStruct; exports.getStructFromPath = getStructFromPath; exports.getUnionStructNames = getUnionStructNames; exports.getStructErrorPrefix = getStructErrorPrefix; exports.getStructFailureMessage = getStructFailureMessage; exports.getStructErrorMessage = getStructErrorMessage; exports.validateUnion = validateUnion; exports.createUnion = createUnion;
//# sourceMappingURL=chunk-A6E325SZ.js.map