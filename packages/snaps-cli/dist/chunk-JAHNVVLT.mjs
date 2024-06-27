import {
  getServer
} from "./chunk-SYRWT2KT.mjs";
import {
  info
} from "./chunk-ZAW4ZWQX.mjs";

// src/commands/serve/serve.ts
async function serveHandler(config, options) {
  const server = getServer(config);
  const { port } = await server.listen(options.port);
  info(`The server is listening on http://localhost:${port}.`);
}

export {
  serveHandler
};
//# sourceMappingURL=chunk-JAHNVVLT.mjs.map