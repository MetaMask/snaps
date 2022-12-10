"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const builders_1 = __importDefault(require("../../builders"));
const evalHandler_1 = require("./evalHandler");
module.exports = {
    command: ['eval', 'e'],
    desc: 'Attempt to evaluate Snap bundle in SES',
    builder: (yarg) => {
        yarg.option('bundle', builders_1.default.bundle);
    },
    handler: (argv) => (0, evalHandler_1.evalHandler)(argv),
};
//# sourceMappingURL=index.js.map