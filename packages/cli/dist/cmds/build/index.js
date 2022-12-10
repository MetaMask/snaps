"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const builders_1 = __importDefault(require("../../builders"));
const buildHandler_1 = require("./buildHandler");
const utils_1 = require("./utils");
module.exports = {
    command: ['build', 'b'],
    desc: 'Build Snap from source',
    builder: (yarg) => {
        yarg
            .option('dist', builders_1.default.dist)
            .option('eval', builders_1.default.eval)
            .option('manifest', builders_1.default.manifest)
            .option('outfileName', builders_1.default.outfileName)
            .option('sourceMaps', builders_1.default.sourceMaps)
            .option('src', builders_1.default.src)
            .option('stripComments', builders_1.default.stripComments)
            .option('transpilationMode', builders_1.default.transpilationMode)
            .option('depsToTranspile', builders_1.default.depsToTranspile)
            .option('writeManifest', builders_1.default.writeManifest)
            .implies('writeManifest', 'manifest')
            .implies('depsToTranspile', 'transpilationMode')
            .middleware((argv) => (0, utils_1.processInvalidTranspilation)(argv));
    },
    handler: (argv) => (0, buildHandler_1.build)(argv),
};
//# sourceMappingURL=index.js.map