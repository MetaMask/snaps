import {
  deepClone
} from "./chunk-Z2JQNSVL.mjs";

// src/virtual-file/VirtualFile.ts
import { assert, bytesToHex } from "@metamask/utils";
import { base64 } from "@scure/base";
var VirtualFile = class _VirtualFile {
  constructor(value) {
    let options;
    if (typeof value === "string" || value instanceof Uint8Array) {
      options = { value };
    } else {
      options = value;
    }
    this.value = options?.value ?? "";
    this.result = options?.result ?? void 0;
    this.data = options?.data ?? {};
    this.path = options?.path ?? "/";
  }
  toString(encoding) {
    if (typeof this.value === "string") {
      assert(encoding === void 0, "Tried to encode string.");
      return this.value;
    } else if (this.value instanceof Uint8Array && encoding === "hex") {
      return bytesToHex(this.value);
    } else if (this.value instanceof Uint8Array && encoding === "base64") {
      return base64.encode(this.value);
    }
    const decoder = new TextDecoder(encoding);
    return decoder.decode(this.value);
  }
  clone() {
    const vfile = new _VirtualFile();
    if (typeof this.value === "string") {
      vfile.value = this.value;
    } else {
      vfile.value = this.value.slice(0);
    }
    vfile.result = deepClone(this.result);
    vfile.data = deepClone(this.data);
    vfile.path = this.path;
    return vfile;
  }
};

export {
  VirtualFile
};
//# sourceMappingURL=chunk-ZJRWU4AJ.mjs.map