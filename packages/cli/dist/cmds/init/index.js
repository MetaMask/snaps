"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const builders_1 = __importDefault(require("../../builders"));
const buildHandler_1 = require("../build/buildHandler");
const initHandler_1 = require("./initHandler");
/**
 * The main entrypoint for the init command. This calls the init handler to
 * initialize the snap package, builds the snap, and then updates the manifest
 * with the shasum of the built snap.
 *
 * @param argv - The Yargs arguments object.
 */
async function init(argv) {
    console.log();
    const newArgs = await (0, initHandler_1.initHandler)(argv);
    process.chdir(newArgs.snapLocation);
    await (0, buildHandler_1.build)(Object.assign(Object.assign({}, newArgs), { manifest: false, eval: true }));
    console.log('\nSnap project successfully initiated!');
}
module.exports = {
    command: ['init [directory]', 'i [directory]'],
    desc: 'Initialize Snap package',
    builder: (yarg) => {
        yarg.positional('directory', builders_1.default.directory);
    },
    handler: (argv) => init(argv),
};
//# sourceMappingURL=index.js.map