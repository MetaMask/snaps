"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const builders_1 = __importDefault(require("../../builders"));
const utils_1 = require("../build/utils");
const watchHandler_1 = require("./watchHandler");
module.exports = {
    command: ['watch', 'w'],
    desc: 'Build Snap on change',
    builder: (yarg) => {
        yarg
            .option('src', builders_1.default.src)
            .option('eval', builders_1.default.eval)
            .option('dist', builders_1.default.dist)
            .option('outfileName', builders_1.default.outfileName)
            .option('sourceMaps', builders_1.default.sourceMaps)
            .option('stripComments', builders_1.default.stripComments)
            .option('transpilationMode', builders_1.default.transpilationMode)
            .option('depsToTranspile', builders_1.default.depsToTranspile)
            .option('manifest', builders_1.default.manifest)
            .option('writeManifest', builders_1.default.writeManifest)
            .option('serve', builders_1.default.serve)
            .option('root', builders_1.default.root)
            .option('port', builders_1.default.port)
            .implies('writeManifest', 'manifest')
            .implies('depsToTranspile', 'transpilationMode')
            .middleware((argv) => (0, utils_1.processInvalidTranspilation)(argv));
    },
    handler: (argv) => (0, watchHandler_1.watch)(argv),
};
//# sourceMappingURL=index.js.map