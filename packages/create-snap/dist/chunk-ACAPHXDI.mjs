import {
  builders_default
} from "./chunk-T2BEIWVD.mjs";
import {
  initHandler
} from "./chunk-R5S2WMQ6.mjs";

// src/cmds/init/index.ts
import { logInfo } from "@metamask/snaps-utils";
var initCommand = {
  command: ["$0 [directory]"],
  desc: "Initialize MetaMask Snaps project",
  builder: (yarg) => {
    yarg.positional("directory", builders_default.directory);
    return yarg;
  },
  handler: init
};
async function init(argv) {
  await initHandler(argv);
  logInfo("\nSnap project successfully initiated!");
}

export {
  initCommand
};
//# sourceMappingURL=chunk-ACAPHXDI.mjs.map