"use strict";

var _chunk7P62OIGXjs = require('./chunk-7P62OIGX.js');
require('./chunk-N722KRZW.js');


var _chunkLEKZPKS2js = require('./chunk-LEKZPKS2.js');
require('./chunk-PHUTP7NB.js');

// src/eval-worker.ts
require('ses/lockdown');
var _fs = require('fs');
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
  ..._chunk7P62OIGXjs.generateMockEndowments.call(void 0, ),
  module: snapModule,
  exports: snapModule.exports
});
compartment.globalThis.self = compartment.globalThis;
compartment.globalThis.global = compartment.globalThis;
compartment.globalThis.window = compartment.globalThis;
compartment.evaluate(_fs.readFileSync.call(void 0, snapFilePath, "utf8"));
var invalidExports = Object.keys(snapModule.exports).filter(
  (snapExport) => !_chunkLEKZPKS2js.SNAP_EXPORT_NAMES.includes(snapExport)
);
if (invalidExports.length > 0) {
  console.warn(`Invalid snap exports detected:
${invalidExports.join("\n")}`);
}
process.exit(0);
//# sourceMappingURL=eval-worker.js.map