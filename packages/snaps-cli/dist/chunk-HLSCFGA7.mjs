// src/structs.ts
import { coerce, string } from "@metamask/superstruct";
import { resolve } from "path";
function file() {
  return coerce(string(), string(), (value) => {
    return resolve(process.cwd(), value);
  });
}

export {
  file
};
//# sourceMappingURL=chunk-HLSCFGA7.mjs.map