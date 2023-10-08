"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    isDirectory: function() {
        return isDirectory;
    },
    isFile: function() {
        return isFile;
    },
    readJsonFile: function() {
        return readJsonFile;
    },
    getOutfilePath: function() {
        return getOutfilePath;
    },
    validateOutfileName: function() {
        return validateOutfileName;
    },
    validateFilePath: function() {
        return validateFilePath;
    },
    validateDirPath: function() {
        return validateDirPath;
    },
    useTemporaryFile: function() {
        return useTemporaryFile;
    }
});
const _fs = require("fs");
const _os = /*#__PURE__*/ _interop_require_default(require("os"));
const _path = /*#__PURE__*/ _interop_require_default(require("path"));
const _json = require("./json");
const _virtualfile = require("./virtual-file");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
async function isDirectory(pathString, createDir) {
    try {
        const stats = await _fs.promises.stat(pathString);
        return stats.isDirectory();
    } catch (error) {
        if (error.code === 'ENOENT') {
            if (!createDir) {
                return false;
            }
            await _fs.promises.mkdir(pathString, {
                recursive: true
            });
            return true;
        }
        return false;
    }
}
async function isFile(pathString) {
    try {
        const stats = await _fs.promises.stat(pathString);
        return stats.isFile();
    } catch (error) {
        return false;
    }
}
async function readJsonFile(pathString) {
    if (!pathString.endsWith('.json')) {
        throw new Error('The specified file must be a ".json" file.');
    }
    let file;
    try {
        file = await (0, _virtualfile.readVirtualFile)(pathString, 'utf8');
    } catch (error) {
        if (error.code === 'ENOENT') {
            throw new Error(`Could not find '${pathString}'. Please ensure that the file exists.`);
        }
        throw error;
    }
    file.result = (0, _json.parseJson)(file.toString());
    return file;
}
function getOutfilePath(outDir, outFileName) {
    return _path.default.join(outDir, outFileName || 'bundle.js');
}
function validateOutfileName(filename) {
    if (!filename.endsWith('.js') || filename === '.js' || _path.default.basename(filename) !== filename) {
        throw new Error(`Invalid outfile name: ${filename}. Must be a .js file`);
    }
    return true;
}
async function validateFilePath(filePath) {
    const exists = await isFile(filePath);
    if (!exists) {
        throw new Error(`Invalid params: '${filePath}' is not a file or does not exist.`);
    }
    return true;
}
async function validateDirPath(dirPath, createDir) {
    const exists = await isDirectory(dirPath, createDir);
    if (!exists) {
        throw new Error(`Invalid params: '${dirPath}' is not a directory or could not be created.`);
    }
    return true;
}
async function useTemporaryFile(fileName, fileContents, fn) {
    const filePath = _path.default.join(_os.default.tmpdir(), fileName);
    await _fs.promises.mkdir(_path.default.dirname(filePath), {
        recursive: true
    });
    await _fs.promises.writeFile(filePath, fileContents);
    try {
        await fn(filePath);
    } finally{
        if (await isFile(filePath)) {
            await _fs.promises.unlink(filePath);
        }
    }
}

//# sourceMappingURL=fs.js.map