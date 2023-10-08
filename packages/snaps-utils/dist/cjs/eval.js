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
    SnapEvalError: function() {
        return SnapEvalError;
    },
    evalBundle: function() {
        return evalBundle;
    }
});
const _utils = require("@metamask/utils");
const _child_process = require("child_process");
const _path = require("path");
const _fs = require("./fs");
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
class SnapEvalError extends Error {
    constructor(message, output){
        super(message);
        _define_property(this, "output", void 0);
        this.name = 'SnapEvalError';
        this.output = output;
    }
}
async function evalBundle(bundlePath) {
    await (0, _fs.validateFilePath)(bundlePath);
    return new Promise((resolve, reject)=>{
        const worker = (0, _child_process.fork)((0, _path.join)(__dirname, 'eval-worker.js'), [
            bundlePath
        ], {
            // To avoid printing the output of the worker to the console, we set
            // `stdio` to `pipe` and handle the output ourselves.
            stdio: 'pipe'
        });
        let stdout = '';
        let stderr = '';
        (0, _utils.assert)(worker.stdout, '`stdout` should be defined.');
        (0, _utils.assert)(worker.stderr, '`stderr` should be defined.');
        worker.stdout.on('data', (data)=>{
            stdout += data.toString();
        });
        worker.stderr.on('data', (data)=>{
            stderr += data.toString();
        });
        worker.on('exit', (exitCode)=>{
            const output = {
                stdout,
                stderr
            };
            if (exitCode === 0) {
                return resolve(output);
            }
            return reject(new SnapEvalError(`Process exited with non-zero exit code: ${exitCode}.`, output));
        });
    });
}

//# sourceMappingURL=eval.js.map