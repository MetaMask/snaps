import {
  rootLogger
} from "./chunk-J4ZPUCLX.mjs";

// src/internals/server.ts
import {
  assertIsSnapManifest,
  isDirectory,
  isFile
} from "@metamask/snaps-utils/node";
import { createModuleLogger } from "@metamask/utils";
import express from "express";
import { promises as fs } from "fs";
import { createServer } from "http";
import { resolve as pathResolve } from "path";
async function assertRoot(root) {
  if (!root) {
    throw new Error("You must specify a root directory.");
  }
  if (!await isDirectory(root, false)) {
    throw new Error(`Root directory "${root}" is not a directory.`);
  }
  const manifestPath = pathResolve(root, "snap.manifest.json");
  const manifest = await fs.readFile(manifestPath, "utf8").then(JSON.parse);
  assertIsSnapManifest(manifest);
  const filePath = pathResolve(root, manifest.source.location.npm.filePath);
  if (!await isFile(filePath)) {
    throw new Error(
      `File "${filePath}" does not exist, or is not a file. Did you forget to build your snap?`
    );
  }
}
async function startServer(options) {
  await assertRoot(options.root);
  const log = createModuleLogger(rootLogger, "server");
  const app = express();
  app.use((_request, response, next) => {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Credentials", "true");
    response.header("Access-Control-Allow-Methods", "GET, OPTIONS");
    response.header("Access-Control-Allow-Headers", "Content-Type");
    next();
  });
  app.use(express.static(pathResolve(process.cwd(), options.root)));
  const server = createServer(app);
  return await new Promise((resolve, reject) => {
    server.listen(options.port, () => {
      resolve(server);
    });
    server.on("error", (error) => {
      log(error);
      reject(error);
    });
  });
}

export {
  startServer
};
//# sourceMappingURL=chunk-SLU4FNKX.mjs.map