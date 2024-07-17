import {
  manifestHandler
} from "./chunk-PFB25A2Q.mjs";
import {
  builders_default
} from "./chunk-MR44GPM3.mjs";

// src/commands/manifest/index.ts
var command = {
  command: ["manifest", "m"],
  desc: "Validate the snap.manifest.json file",
  builder: (yarg) => {
    yarg.option("writeManifest", builders_default.writeManifest);
    yarg.option("fix", builders_default.fix);
  },
  handler: async (argv) => manifestHandler(argv.context.config, { fix: argv.fix })
};
var manifest_default = command;

export {
  manifest_default
};
//# sourceMappingURL=chunk-G3COWLG5.mjs.map