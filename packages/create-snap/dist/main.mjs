#!/usr/bin/env node
import {
  cli
} from "./chunk-2WVRVETI.mjs";
import "./chunk-P6R5ROWB.mjs";
import "./chunk-ACAPHXDI.mjs";
import "./chunk-T2BEIWVD.mjs";
import "./chunk-R5S2WMQ6.mjs";
import "./chunk-QZNWE6ZB.mjs";

// src/main.ts
import { logError } from "@metamask/snaps-utils";
cli(process.argv).catch((error) => {
  logError(error);
  process.exitCode = 1;
});
//# sourceMappingURL=main.mjs.map