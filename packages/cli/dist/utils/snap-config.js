"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyConfig = exports.loadConfig = exports.isSnapConfig = exports.SnapConfigStruct = void 0;
const path_1 = __importDefault(require("path"));
const utils_1 = require("@metamask/utils");
const yargs_parser_1 = __importDefault(require("yargs-parser"));
const superstruct_1 = require("superstruct");
const builders_1 = __importDefault(require("../builders"));
const misc_1 = require("./misc");
exports.SnapConfigStruct = (0, superstruct_1.object)({
    cliOptions: (0, superstruct_1.optional)((0, superstruct_1.object)()),
    bundlerCustomizer: (0, superstruct_1.optional)((0, superstruct_1.func)()),
});
/**
 * Check if the given value is a {@link SnapConfig} object. Note that this
 * function does not check the validity of the `bundleCustomizer` property, as
 * it is not possible to check the validity of a function in JavaScript.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a valid {@link SnapConfig} object, `false`
 * otherwise.
 */
function isSnapConfig(value) {
    return (0, superstruct_1.is)(value, exports.SnapConfigStruct);
}
exports.isSnapConfig = isSnapConfig;
let snapConfigCache;
/**
 * Attempt to load the snap config file (`snap.config.js`). By default will use
 * the cached config, if it was loaded before, and `cached` is `true`. If the
 * config file is not found, or the config is invalid, this function will kill
 * the process.
 *
 * @param cached - Whether to use the cached config. Defaults to `true`.
 * @returns The snap config.
 */
function loadConfig(cached = true) {
    if (snapConfigCache !== undefined && cached === true) {
        return snapConfigCache;
    }
    let config;
    try {
        // eslint-disable-next-line node/global-require, import/no-dynamic-require, @typescript-eslint/no-require-imports
        config = require(path_1.default.resolve(process.cwd(), misc_1.CONFIG_FILE));
    }
    catch (err) {
        if (err.code === 'MODULE_NOT_FOUND') {
            snapConfigCache = {};
            return snapConfigCache;
        }
        (0, misc_1.logError)(`Error during parsing of ${misc_1.CONFIG_FILE}`, err);
        return process.exit(1);
    }
    if (!isSnapConfig(config)) {
        (0, misc_1.logError)(`Can't validate ${misc_1.CONFIG_FILE}. Ensure it's a proper javascript file and abides with the structure of a snap configuration file`);
        return process.exit(1);
    }
    snapConfigCache = config;
    return config;
}
exports.loadConfig = loadConfig;
// Note that the below function is necessary because yargs' .config() function
// leaves much to be desired.
//
// In particular, it will set all properties included in the config file
// regardless of the command, which fails during validation.
/**
 * Attempts to read configuration options for package.json and the config file,
 * and apply them to argv if they weren't already set.
 *
 * Arguments are only set per the snap-cli config file if they were not specified
 * on the command line.
 *
 * @param snapConfig - The snap config.
 * @param processArgv - The command line arguments, i.e., `process.argv`.
 * @param yargsArgv - The processed `yargs` arguments.
 * @param yargsInstance - An instance of `yargs`.
 */
function applyConfig(snapConfig, processArgv, yargsArgv, yargsInstance) {
    // Instances of yargs has a number of undocumented functions, including
    // getOptions. This function returns an object with properties "key" and
    // "alias", which specify the options associated with the current command and
    // their aliases, respectively.
    //
    // We leverage this to ensure that the config is only applied to args that are
    // valid for the current command, and that weren't specified by the user on
    // the command line.
    //
    // If we set args that aren't valid for the current command, yargs will error
    // during validation.
    const { alias: aliases, key: options } = yargsInstance.getOptions();
    const parsedProcessArgv = (0, yargs_parser_1.default)(processArgv, {
        alias: aliases,
    });
    delete parsedProcessArgv._; // irrelevant yargs parser artifact
    const commandOptions = new Set(Object.keys(options));
    const shouldSetArg = (key) => {
        return commandOptions.has(key) && !(0, utils_1.hasProperty)(parsedProcessArgv, key);
    };
    const cfg = snapConfig.cliOptions || {};
    for (const key of Object.keys(cfg)) {
        if ((0, utils_1.hasProperty)(builders_1.default, key)) {
            if (shouldSetArg(key)) {
                yargsArgv[key] = cfg[key];
            }
        }
        else {
            (0, misc_1.logError)(`Error: Encountered unrecognized config property "options.${key}" in config file "${misc_1.CONFIG_FILE}". Remove the property and try again.`);
            process.exit(1);
        }
    }
}
exports.applyConfig = applyConfig;
//# sourceMappingURL=snap-config.js.map