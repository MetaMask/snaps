// src/internals/simulation/files.ts
import { AuxiliaryFileEncoding } from "@metamask/snaps-sdk";
import { encodeAuxiliaryFile, normalizeRelative } from "@metamask/snaps-utils";
import { bytesToBase64 } from "@metamask/utils";
import { readFile, stat } from "fs/promises";
import mime from "mime";
import { basename, extname, resolve } from "path";
async function getSnapFile(files, path, encoding = AuxiliaryFileEncoding.Base64) {
  const normalizedPath = normalizeRelative(path);
  const base64 = files.find((file) => file.path === normalizedPath)?.toString("base64");
  if (!base64) {
    return null;
  }
  return await encodeAuxiliaryFile(base64, encoding);
}
function getContentType(extension) {
  return mime.getType(extension) ?? "application/octet-stream";
}
async function getFileSize(file) {
  if (typeof file === "string") {
    const { size } = await stat(resolve(process.cwd(), file));
    return size;
  }
  return file.length;
}
async function getFileToUpload(file, { fileName, contentType } = {}) {
  if (typeof file === "string") {
    const buffer = await readFile(resolve(process.cwd(), file));
    return {
      name: fileName ?? basename(file),
      size: buffer.byteLength,
      contentType: contentType ?? getContentType(extname(file)),
      contents: bytesToBase64(buffer)
    };
  }
  return {
    name: fileName ?? "",
    size: file.length,
    contentType: contentType ?? "application/octet-stream",
    contents: bytesToBase64(file)
  };
}

export {
  getSnapFile,
  getContentType,
  getFileSize,
  getFileToUpload
};
//# sourceMappingURL=chunk-IWJ4HKDR.mjs.map