import {
  indent
} from "./chunk-IV3FSWZ7.mjs";

// src/structs.ts
import { union } from "@metamask/snaps-sdk";
import { assert, isObject } from "@metamask/utils";
import { bold, green, red } from "chalk";
import {
  is,
  validate,
  type as superstructType,
  Struct,
  StructError,
  create
} from "superstruct";
function color(value, colorFunction, enabled) {
  if (enabled) {
    return colorFunction(value);
  }
  return value;
}
function named(name, struct) {
  return new Struct({
    ...struct,
    type: name
  });
}
var SnapsStructError = class extends StructError {
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
    return create(value, struct);
  } catch (error) {
    if (error instanceof StructError) {
      throw getError({ struct, prefix, suffix, error });
    }
    throw error;
  }
}
function getStructFromPath(struct, path) {
  return path.reduce((result, key) => {
    if (isObject(struct.schema) && struct.schema[key]) {
      return struct.schema[key];
    }
    return result;
  }, struct);
}
function getUnionStructNames(struct, colorize = true) {
  if (Array.isArray(struct.schema)) {
    return struct.schema.map(({ type }) => color(type, green, colorize));
  }
  return null;
}
function getStructErrorPrefix(failure, colorize = true) {
  if (failure.type === "never" || failure.path.length === 0) {
    return "";
  }
  return `At path: ${color(failure.path.join("."), bold, colorize)} \u2014 `;
}
function getStructFailureMessage(struct, failure, colorize = true) {
  const received = color(JSON.stringify(failure.value), red, colorize);
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
      `the value to be \`${color("$1", green, colorize)}\`,`
    ).replace(
      /, but received: (.+)/u,
      `, but received: ${color("$1", red, colorize)}`
    );
    return `${prefix}${message}.`;
  }
  if (failure.type === "never") {
    return `Unknown key: ${color(
      failure.path.join("."),
      bold,
      colorize
    )}, received: ${received}.`;
  }
  if (failure.refinement === "size") {
    const message = failure.message.replace(
      /length between `(\d+)` and `(\d+)`/u,
      `length between ${color("$1", green, colorize)} and ${color(
        "$2",
        green,
        colorize
      )},`
    ).replace(/length of `(\d+)`/u, `length of ${color("$1", red, colorize)}`).replace(/a array/u, "an array");
    return `${prefix}${message}.`;
  }
  return `${prefix}Expected a value of type ${color(
    failure.type,
    green,
    colorize
  )}, but received: ${received}.`;
}
function getStructErrorMessage(struct, failures, colorize = true) {
  const formattedFailures = failures.map(
    (failure) => indent(`\u2022 ${getStructFailureMessage(struct, failure, colorize)}`)
  );
  return formattedFailures.join("\n");
}
function validateUnion(value, struct, structKey, coerce = false) {
  assert(
    struct.schema,
    "Expected a struct with a schema. Make sure to use `union` from `@metamask/snaps-sdk`."
  );
  assert(struct.schema.length > 0, "Expected a non-empty array of structs.");
  const keyUnion = struct.schema.map(
    (innerStruct) => innerStruct.schema[structKey]
    // This is guaranteed to be a non-empty array by the assertion above. We
    // need to cast it since `superstruct` requires a non-empty array of structs
    // for the `union` struct.
  );
  const key = superstructType({
    [structKey]: union(keyUnion)
  });
  const [keyError] = validate(value, key, { coerce });
  if (keyError) {
    throw new Error(
      getStructFailureMessage(key, keyError.failures()[0], false)
    );
  }
  const objectValue = value;
  const objectStructs = struct.schema.filter(
    (innerStruct) => is(objectValue[structKey], innerStruct.schema[structKey])
  );
  assert(objectStructs.length > 0, "Expected a struct to match the value.");
  const validationResults = objectStructs.map(
    (objectStruct) => validate(objectValue, objectStruct, { coerce })
  );
  const validatedValue = validationResults.find(([error]) => !error);
  if (validatedValue) {
    return validatedValue[1];
  }
  assert(validationResults[0][0], "Expected at least one error.");
  const validationError = validationResults.reduce((error, [innerError]) => {
    assert(innerError, "Expected an error.");
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

export {
  named,
  SnapsStructError,
  arrayToGenerator,
  getError,
  createFromStruct,
  getStructFromPath,
  getUnionStructNames,
  getStructErrorPrefix,
  getStructFailureMessage,
  getStructErrorMessage,
  validateUnion,
  createUnion
};
//# sourceMappingURL=chunk-GTAYOKI4.mjs.map