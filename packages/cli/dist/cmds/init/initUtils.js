"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.yarnInstall = exports.gitInit = exports.isInGitRepository = exports.isGitInstalled = exports.cloneTemplate = exports.prepareWorkingDirectory = exports.SNAP_LOCATION = exports.TEMPLATE_GIT_URL = void 0;
const fs_1 = require("fs");
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const utils_1 = require("../../utils");
exports.TEMPLATE_GIT_URL = 'https://github.com/MetaMask/template-snap-monorepo.git';
exports.SNAP_LOCATION = 'packages/snap/';
/**
 * Checks if the destination folder exists and if it's empty. Otherwise create it.
 *
 * @param directory - The desination folder.
 */
async function prepareWorkingDirectory(directory) {
    try {
        const isCurrentDirectory = directory === process.cwd();
        if (!isCurrentDirectory) {
            try {
                await fs_1.promises.mkdir(directory, { recursive: true });
            }
            catch (err) {
                (0, utils_1.logError)('Init Error: Failed to create new directory.', err);
                throw err;
            }
        }
        const existingFiles = await fs_1.promises.readdir(directory);
        if (existingFiles.length > 0) {
            throw new Error(`Directory not empty: ${directory}.`);
        }
    }
    catch (err) {
        (0, utils_1.logError)('Init Error: Failed to prepare working directory.', err);
        throw err;
    }
}
exports.prepareWorkingDirectory = prepareWorkingDirectory;
/**
 * Clones the template in a directory.
 *
 * @param directory - The directory to clone the template in.
 */
async function cloneTemplate(directory) {
    try {
        (0, child_process_1.execSync)(`git clone --depth=1 ${exports.TEMPLATE_GIT_URL} ${directory}`, {
            stdio: [2],
        });
    }
    catch (err) {
        (0, utils_1.logError)('Init Error: Failed to clone the template.', err);
        throw err;
    }
}
exports.cloneTemplate = cloneTemplate;
/**
 * Check if git is installed.
 *
 * @returns True if git is installed, or false otherwise.
 */
function isGitInstalled() {
    try {
        (0, child_process_1.execSync)('git --version', { stdio: 'ignore' });
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.isGitInstalled = isGitInstalled;
/**
 * Check if the actual working dir is a git repository.
 *
 * @param directory - The directory to check.
 * @returns True if it's a git repository otherwise false.
 */
function isInGitRepository(directory) {
    try {
        (0, child_process_1.execSync)('git rev-parse --is-inside-work-tree', {
            stdio: 'ignore',
            cwd: path_1.default.resolve(__dirname, directory),
        });
        return true;
    }
    catch (err) {
        return false;
    }
}
exports.isInGitRepository = isInGitRepository;
/**
 * Init a git repository.
 *
 * @param directory - The directory to init.
 */
async function gitInit(directory) {
    try {
        (0, child_process_1.execSync)('git init', {
            stdio: 'ignore',
            cwd: path_1.default.resolve(__dirname, directory),
        });
    }
    catch (err) {
        (0, utils_1.logError)('Init Error: Failed to init a new git repository.', err);
        throw err;
    }
}
exports.gitInit = gitInit;
/**
 * Install dependencies in a yarn project.
 *
 * @param directory - The directory containing the project.
 */
async function yarnInstall(directory) {
    try {
        (0, child_process_1.execSync)('yarn install', {
            stdio: [0, 1, 2],
            cwd: path_1.default.resolve(__dirname, directory),
        });
    }
    catch (err) {
        (0, utils_1.logError)('Init Error: Failed to install dependencies.', err);
        throw err;
    }
}
exports.yarnInstall = yarnInstall;
//# sourceMappingURL=initUtils.js.map