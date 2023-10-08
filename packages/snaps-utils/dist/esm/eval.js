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
import { assert } from '@metamask/utils';
import { fork } from 'child_process';
import { join } from 'path';
import { validateFilePath } from './fs';
export class SnapEvalError extends Error {
    constructor(message, output){
        super(message);
        _define_property(this, "output", void 0);
        this.name = 'SnapEvalError';
        this.output = output;
    }
}
/**
 * Spawn a new process to run the provided bundle in.
 *
 * @param bundlePath - The path to the bundle to run.
 * @returns `null` if the worker ran successfully.
 * @throws If the worker failed to run successfully.
 */ export async function evalBundle(bundlePath) {
    await validateFilePath(bundlePath);
    return new Promise((resolve, reject)=>{
        const worker = fork(join(__dirname, 'eval-worker.js'), [
            bundlePath
        ], {
            // To avoid printing the output of the worker to the console, we set
            // `stdio` to `pipe` and handle the output ourselves.
            stdio: 'pipe'
        });
        let stdout = '';
        let stderr = '';
        assert(worker.stdout, '`stdout` should be defined.');
        assert(worker.stderr, '`stderr` should be defined.');
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