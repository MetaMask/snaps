import {
  generateMockEndowments
} from "./chunk-63OXILAY.mjs";
import "./chunk-BGSO2GQC.mjs";
import {
  SNAP_EXPORT_NAMES
} from "./chunk-5R7UF7KM.mjs";
import "./chunk-JMDSN227.mjs";

// src/eval-worker.ts
import "ses/lockdown";
import { readFileSync } from "fs";
lockdown({
  consoleTaming: "unsafe",
  errorTaming: "unsafe",
  mathTaming: "unsafe",
  dateTaming: "unsafe",
  overrideTaming: "severe",
  // We disable domain taming, because it does not work in certain cases when
  // running tests. This is unlikely to be a problem in production, because
  // Node.js domains are deprecated.
  domainTaming: "unsafe"
});
var snapFilePath = process.argv[2];
var snapModule = { exports: {} };
var compartment = new Compartment({
  ...generateMockEndowments(),
  module: snapModule,
  exports: snapModule.exports
});
compartment.globalThis.self = compartment.globalThis;
compartment.globalThis.global = compartment.globalThis;
compartment.globalThis.window = compartment.globalThis;
compartment.evaluate(readFileSync(snapFilePath, "utf8"));
var invalidExports = Object.keys(snapModule.exports).filter(
  (snapExport) => !SNAP_EXPORT_NAMES.includes(snapExport)
);
if (invalidExports.length > 0) {
  console.warn(`Invalid snap exports detected:
${invalidExports.join("\n")}`);
}
process.exit(0);
//# sourceMappingURL=eval-worker.mjs.map