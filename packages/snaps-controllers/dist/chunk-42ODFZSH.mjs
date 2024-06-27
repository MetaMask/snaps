import {
  LocalLocation
} from "./chunk-B3UTLNYS.mjs";
import {
  NpmLocation
} from "./chunk-WKQRCGUW.mjs";
import {
  HttpLocation
} from "./chunk-6GMWL4JR.mjs";

// src/snaps/location/location.ts
import { assert } from "@metamask/utils";
function detectSnapLocation(location, opts) {
  const allowHttp = opts?.allowHttp ?? false;
  const allowLocal = opts?.allowLocal ?? false;
  const root = new URL(location);
  switch (root.protocol) {
    case "npm:":
      return new NpmLocation(root, opts);
    case "local:":
      assert(allowLocal, new TypeError("Fetching local snaps is disabled."));
      return new LocalLocation(root, opts);
    case "http:":
    case "https:":
      assert(
        allowHttp,
        new TypeError("Fetching snaps through http/https is disabled.")
      );
      return new HttpLocation(root, opts);
    default:
      throw new TypeError(
        `Unrecognized "${root.protocol}" snap location protocol.`
      );
  }
}

export {
  detectSnapLocation
};
//# sourceMappingURL=chunk-42ODFZSH.mjs.map