"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunk473MIETWjs = require('./chunk-473MIETW.js');

// src/base64.ts
var _utils = require('@metamask/utils');
async function encodeBase64(input) {
  const bytes = _chunk473MIETWjs.getBytes.call(void 0, input);
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
  return _utils.bytesToBase64.call(void 0, bytes);
}
async function decodeBase64(base64) {
  const response = await fetch(
    `data:application/octet-stream;base64,${base64}`
  );
  return new Uint8Array(await response.arrayBuffer());
}




exports.encodeBase64 = encodeBase64; exports.decodeBase64 = decodeBase64;
//# sourceMappingURL=chunk-IHQPAJ2B.js.map