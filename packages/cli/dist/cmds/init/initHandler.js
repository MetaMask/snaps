"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initHandler = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const snap_utils_1 = require("@metamask/snap-utils");
const utils_1 = require("../../utils");
const initUtils_1 = require("./initUtils");
const SATISFIED_VERSION = '>=16';
/**
 * Creates a new snap package, based on one of the provided templates. This
 * creates all the necessary files, like `package.json`, `snap.config.js`, etc.
 * to start developing a snap.
 *
 * @param argv - The Yargs arguments object.
 * @returns The Yargs arguments augmented with the new `dist`, `outfileName` and
 * `src` properties.
 * @throws If initialization of the snap package failed.
 */
async function initHandler(argv) {
    const { directory } = argv;
    const isVersionSupported = (0, snap_utils_1.satisfiesVersionRange)(process.version, SATISFIED_VERSION);
    if (!isVersionSupported) {
        (0, utils_1.logError)(`Init Error: You are using an outdated version of Node (${process.version}). Please update to Node ${SATISFIED_VERSION}.`);
        throw new Error('Outdated node version.');
    }
    const gitExists = (0, initUtils_1.isGitInstalled)();
    if (!gitExists) {
        (0, utils_1.logError)(`Init Error: git is not installed. Please install git to continue.`);
        throw new Error('Git is not installed.');
    }
    const directoryToUse = directory
        ? path_1.default.join(process.cwd(), directory)
        : process.cwd();
    console.log(`Preparing ${directoryToUse}...`);
    await (0, initUtils_1.prepareWorkingDirectory)(directoryToUse);
    try {
        console.log(`Cloning template...`);
        await (0, initUtils_1.cloneTemplate)(directoryToUse);
        fs_1.promises.rm(path_1.default.join(directoryToUse, '.git'), {
            force: true,
            recursive: true,
        });
    }
    catch (err) {
        (0, utils_1.logError)('Init Error: Failed to create template, cleaning...');
        throw err;
    }
    console.log('Installing dependencies...');
    await (0, initUtils_1.yarnInstall)(directoryToUse);
    if (!(0, initUtils_1.isInGitRepository)(directoryToUse)) {
        console.log('Initializing git repository...');
        await (0, initUtils_1.gitInit)(directoryToUse);
    }
    const snapLocation = path_1.default.join(directoryToUse, initUtils_1.SNAP_LOCATION);
    const manifest = await (0, snap_utils_1.readJsonFile)(path_1.default.join(snapLocation, snap_utils_1.NpmSnapFileNames.Manifest));
    const packageJson = await (0, snap_utils_1.readJsonFile)(path_1.default.join(snapLocation, snap_utils_1.NpmSnapFileNames.PackageJson));
    const distPath = manifest.source.location.npm.filePath.split('/');
    return Object.assign(Object.assign({}, argv), { dist: distPath[0], outfileName: distPath[1], src: packageJson.main || 'src/index.js', snapLocation });
}
exports.initHandler = initHandler;
//# sourceMappingURL=initHandler.js.map