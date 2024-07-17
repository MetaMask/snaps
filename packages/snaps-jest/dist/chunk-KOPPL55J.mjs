// src/options.ts
import {
  boolean,
  create,
  defaulted,
  number,
  object,
  string,
  type
} from "@metamask/superstruct";
var SnapsEnvironmentOptionsStruct = type({
  server: defaulted(
    object({
      enabled: defaulted(boolean(), true),
      port: defaulted(number(), 0),
      root: defaulted(string(), process.cwd())
    }),
    {}
  )
});
function getOptions(testEnvironmentOptions) {
  return create(testEnvironmentOptions, SnapsEnvironmentOptionsStruct);
}

export {
  getOptions
};
//# sourceMappingURL=chunk-KOPPL55J.mjs.map