"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const build_1 = __importDefault(require("./build"));
const eval_1 = __importDefault(require("./eval"));
const init_1 = __importDefault(require("./init"));
const manifest_1 = __importDefault(require("./manifest"));
const serve_1 = __importDefault(require("./serve"));
const watch_1 = __importDefault(require("./watch"));
const commands = [build_1.default, eval_1.default, init_1.default, manifest_1.default, serve_1.default, watch_1.default];
exports.default = commands;
//# sourceMappingURL=index.js.map