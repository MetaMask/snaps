"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cli = void 0;
const yargs_1 = __importDefault(require("yargs"));
const builders_1 = __importDefault(require("./builders"));
const utils_1 = require("./utils");
/**
 * The main CLI entry point function. This processes the command line args, and
 * runs the appropriate function.
 *
 * @param argv - The raw command line arguments, i.e., `process.argv`.
 * @param commands - The list of commands to use.
 */
function cli(argv, commands) {
    const rawArgv = argv.slice(2);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    (0, yargs_1.default)(rawArgv)
        .scriptName('mm-snap')
        .usage('Usage: $0 <command> [options]')
        .example('$0 init', `\tInitialize a snap project in the current directory`)
        .example('$0 init --template javascript', `\tInitialize a snap JavaScript project in the current directory`)
        .example('$0 build -s src/index.js -d out', `\tBuild 'src/index.js' as './out/bundle.js'`)
        .example('$0 build -s src/index.js -d out -n snap.js', `\tBuild 'src/index.js' as './out/snap.js'`)
        .example('$0 serve -r out', `\tServe files in './out' on port 8080`)
        .example('$0 serve -r out -p 9000', `\tServe files in './out' on port 9000`)
        .example('$0 watch -s src/index.js -d out', `\tRebuild './out/bundle.js' on changes to files in 'src/index.js' parent and child directories`)
        .command(commands)
        .option('verboseErrors', builders_1.default.verboseErrors)
        .option('suppressWarnings', builders_1.default.suppressWarnings)
        .strict()
        // Typecast: The @types/yargs type for .middleware is incorrect.
        // yargs middleware functions receive the yargs instance as a second parameter.
        // ref: https://yargs.js.org/docs/#api-reference-middlewarecallbacks-applybeforevalidation
        .middleware(((yargsArgv, yargsInstance) => {
        (0, utils_1.applyConfig)((0, utils_1.loadConfig)(), rawArgv, yargsArgv, yargsInstance);
        (0, utils_1.setSnapGlobals)(yargsArgv);
        (0, utils_1.sanitizeInputs)(yargsArgv);
    }), true)
        .fail((msg, err, _yargs) => {
        (0, utils_1.logError)(msg, err);
        process.exitCode = 1;
    })
        .demandCommand(1, 'You must specify at least one command.')
        .help()
        .alias('help', 'h').argv;
}
exports.cli = cli;
//# sourceMappingURL=cli.js.map