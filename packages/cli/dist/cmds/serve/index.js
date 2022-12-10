"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const builders_1 = __importDefault(require("../../builders"));
const serveHandler_1 = require("./serveHandler");
module.exports = {
    command: ['serve', 's'],
    desc: 'Locally serve Snap file(s) for testing',
    builder: (yarg) => {
        yarg.option('root', builders_1.default.root).option('port', builders_1.default.port);
    },
    handler: (argv) => (0, serveHandler_1.serve)(argv),
};
//# sourceMappingURL=index.js.map