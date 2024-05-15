import {
  getBytes
} from "./chunk-6YRUDGNL.mjs";

// src/base64.ts
import { bytesToBase64 } from "@metamask/utils";
async function encodeBase64(input) {
  const bytes = getBytes(input);
  if ("FileReader" in globalThis) {
    return await new Promise((resolve, reject) => {
      const reader = Object.assign(new FileReader(), {
        onload: () => resolve(
          reader.result.replace(
            "data:application/octet-stream;base64,",
            ""
          )
        ),
        onerror: () => reject(reader.error)
      });
      reader.readAsDataURL(
        new File([bytes], "", { type: "application/octet-stream" })
      );
    });
  }
  return bytesToBase64(bytes);
}
async function decodeBase64(base64) {
  const response = await fetch(
    `data:application/octet-stream;base64,${base64}`
  );
  return new Uint8Array(await response.arrayBuffer());
}

export {
  encodeBase64,
  decodeBase64
};
//# sourceMappingURL=chunk-FOWIC2SO.mjs.map