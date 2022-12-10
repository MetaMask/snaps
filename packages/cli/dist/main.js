#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cli_1 = require("./cli");
const cmds_1 = __importDefault(require("./cmds"));
global.snaps = {
    verboseErrors: false,
    suppressWarnings: false,
    isWatching: false,
};
(0, cli_1.cli)(process.argv, cmds_1.default);
//# sourceMappingURL=main.js.map