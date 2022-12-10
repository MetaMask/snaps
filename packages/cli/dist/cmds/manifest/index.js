"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const builders_1 = __importDefault(require("../../builders"));
const utils_1 = require("../../utils");
const manifestHandler_1 = require("./manifestHandler");
module.exports = {
    command: ['manifest', 'm'],
    desc: 'Validate the snap.manifest.json file',
    builder: (yarg) => {
        yarg.option('writeManifest', Object.assign(Object.assign({}, builders_1.default.writeManifest), { alias: ['fix'] }));
    },
    handler: async (argv) => {
        try {
            await (0, manifestHandler_1.manifestHandler)(argv);
        }
        catch (err) {
            (0, utils_1.logError)(err.message, err);
            throw err;
        }
    },
};
//# sourceMappingURL=index.js.map