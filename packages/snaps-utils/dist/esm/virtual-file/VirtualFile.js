// TODO(ritave): Move into separate package @metamask/vfile / @metamask/utils + @metamask/to-vfile when passes code review
// TODO(ritave): Streaming vfile contents similar to vinyl maybe?
// TODO(ritave): Move fixing manifest in cli and bundler plugins to write messages to vfile
//               similar to unified instead of throwing "ProgrammaticallyFixableErrors".
//
// Using https://github.com/vfile/vfile would be helpful, but they only support ESM and we need to support CommonJS.
// https://github.com/gulpjs/vinyl is also good, but they normalize paths, which we can't do, because
// we're calculating checksums based on original path.
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
import { deepClone } from '../deep-clone';
export class VirtualFile {
    toString(encoding) {
        if (typeof this.value === 'string') {
            assert(encoding === undefined, 'Tried to encode string.');
            return this.value;
        }
        const decoder = new TextDecoder(encoding);
        return decoder.decode(this.value);
    }
    clone() {
        const vfile = new VirtualFile();
        if (typeof this.value === 'string') {
            vfile.value = this.value;
        } else {
            // deep-clone doesn't clone Buffer properly, even if it's a sub-class of Uint8Array
            vfile.value = this.value.slice(0);
        }
        vfile.result = deepClone(this.result);
        vfile.data = deepClone(this.data);
        vfile.path = this.path;
        return vfile;
    }
    constructor(value){
        _define_property(this, "value", void 0);
        _define_property(this, "result", void 0);
        _define_property(this, "data", void 0);
        _define_property(this, "path", void 0);
        let options;
        if (typeof value === 'string' || value instanceof Uint8Array) {
            options = {
                value
            };
        } else {
            options = value;
        }
        this.value = options?.value ?? '';
        // This situations happens when there's no .result used,
        // we expect the file to have default generic in that situation:
        // VirtualFile<unknown> which will handle undefined properly
        //
        // While not 100% type safe, it'll be way less frustrating to work with.
        // The alternative would be to have VirtualFile.result be Result | undefined
        // and that would result in needing to branch out and check in all situations.
        //
        // In short, optimizing for most common use case.
        this.result = options?.result ?? undefined;
        this.data = options?.data ?? {};
        this.path = options?.path ?? '/';
    }
}

//# sourceMappingURL=VirtualFile.js.map