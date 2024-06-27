import {
  DEFAULT_LOCALE,
  DEFAULT_SRP
} from "./chunk-6KXCBUNZ.mjs";

// src/internals/simulation/options.ts
import {
  create,
  defaulted,
  nullable,
  object,
  optional,
  record,
  string
} from "@metamask/superstruct";
import { JsonStruct } from "@metamask/utils";
var SimulationOptionsStruct = object({
  secretRecoveryPhrase: defaulted(optional(string()), DEFAULT_SRP),
  locale: defaulted(optional(string()), DEFAULT_LOCALE),
  state: defaulted(optional(nullable(record(string(), JsonStruct))), null),
  unencryptedState: defaulted(
    optional(nullable(record(string(), JsonStruct))),
    null
  )
});
function getOptions(options) {
  return create(
    options,
    SimulationOptionsStruct
  );
}

export {
  getOptions
};
//# sourceMappingURL=chunk-SHABXXTB.mjs.map